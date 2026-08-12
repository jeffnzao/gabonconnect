"use server";

// Server Action pour /join/account.
//
// Ne crée AUCUNE session "à la main" : on délègue entièrement la création
// du compte à Supabase Auth (`signUp`). Deux issues possibles ensuite :
// - Confirmation email activée sur le projet Supabase (cas attendu en
//   production) : `signUp` ne renvoie pas de session tant que le lien de
//   `/auth/confirm` n'a pas été cliqué → écran "Check your email".
// - Confirmation email désactivée (cas courant en local/dev) : Supabase
//   renvoie une session immédiatement → on synchronise `public.users` via
//   `ensureUser()` et on passe directement à /join/profile.
//
// Ce fichier ne stocke ni ne voit jamais le mot de passe en clair au-delà
// de l'appel à Supabase Auth : rien n'est écrit dans Prisma ici.

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";
import { ensureUser } from "@/lib/auth";

function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be defined in the environment.");
  }
  return value;
}

function getSupabaseAnonKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined in the environment.",
    );
  }
  return value;
}

/**
 * Client Supabase pour cette Server Action : lecture ET écriture des
 * cookies (nécessaire si Supabase crée une session immédiatement — cas
 * "confirmation email désactivée").
 */
async function createSupabaseActionClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

/**
 * Reconstruit l'origine (protocole + host) de la requête courante à partir
 * des headers, pour construire une `emailRedirectTo` absolue — pas de
 * `NextRequest` disponible dans une Server Action. Fonctionne en local
 * (http://localhost:3000) et sur Vercel (https://...).
 */
async function getBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host");

  if (!host) {
    throw new Error("Unable to determine request host for the email redirect URL.");
  }

  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  return `${isLocal ? "http" : "https"}://${host}`;
}

const accountSchema = z
  .object({
    email: z.email({ message: "Enter a valid email address." }),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

/** Traduit la première erreur Zod en code court, affiché par la page. */
function mapZodErrorToCode(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "validation";

  switch (issue.path[0]) {
    case "email":
      return "invalid_email";
    case "password":
      return "weak_password";
    case "confirmPassword":
      return "password_mismatch";
    default:
      return "validation";
  }
}

export async function signUpAction(formData: FormData) {
  const raw = {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = accountSchema.safeParse(raw);

  if (!parsed.success) {
    const code = mapZodErrorToCode(parsed.error);
    redirect(`/join/account?error=${code}&email=${encodeURIComponent(raw.email)}`);
  }

  const { email, password } = parsed.data;

  const supabase = await createSupabaseActionClient();
  const baseUrl = await getBaseUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/confirm?next=/join/profile`,
    },
  });

  if (error) {
    console.error("[join/account] Supabase signUp failed:", error.message);
    // "User already registered" atterrit ici aussi : même code générique
    // pour ne pas révéler si un email existe déjà (énumération de comptes).
    redirect(`/join/account?error=signup_failed&email=${encodeURIComponent(email)}`);
  }

  if (data.session) {
    // Confirmation email désactivée sur ce projet Supabase : session
    // immédiate, on peut synchroniser public.users tout de suite.
    await ensureUser({ supabaseClient: supabase });
    redirect("/join/profile");
  }

  // Piège Supabase Auth bien connu : pour un email déjà enregistré ET déjà
  // confirmé, `signUp()` ne renvoie PAS d'erreur (pour ne pas permettre
  // l'énumération de comptes) — il renvoie un utilisateur "fantôme" avec
  // `identities: []` et aucune session, aucun email envoyé. Sans ce test,
  // on afficherait "Check your email" à quelqu'un qui a déjà un compte,
  // qui ne recevra jamais rien. On le redirige plutôt vers la connexion.
  if (data.user && data.user.identities?.length === 0) {
    redirect(`/login?notice=account_exists&email=${encodeURIComponent(email)}`);
  }

  // Cas attendu : confirmation email requise, pas de session pour l'instant.
  redirect(`/join/account?sent=1&email=${encodeURIComponent(email)}`);
}
