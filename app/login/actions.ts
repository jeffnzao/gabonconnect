"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
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

const loginSchema = z.object({
  email: z.email({ message: "Enter a valid email address." }),
  password: z.string().min(1, "Password is required."),
});

function mapZodErrorToCode(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "validation";

  switch (issue.path[0]) {
    case "email":
      return "invalid_email";
    case "password":
      return "missing_password";
    default:
      return "validation";
  }
}

/** Traduit le message d'erreur Supabase en code affichable, sans le répéter tel quel. */
function mapSignInErrorToCode(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("not confirmed")) return "not_confirmed";
  if (lower.includes("invalid")) return "invalid_credentials";
  return "temporary_error";
}

export async function signInAction(formData: FormData) {
  const raw = {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    redirect(
      `/login?error=${mapZodErrorToCode(parsed.error)}&email=${encodeURIComponent(raw.email)}`,
    );
  }

  const { email, password } = parsed.data;
  const supabase = await createSupabaseActionClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[login] Supabase signInWithPassword failed:", error.message);
    redirect(
      `/login?error=${mapSignInErrorToCode(error.message)}&email=${encodeURIComponent(email)}`,
    );
  }

  // Synchronise public.users au cas où (ex: compte confirmé mais jamais
  // encore passé par /auth/confirm dans cette session).
  const ensuredUser = await ensureUser({ supabaseClient: supabase });

  if (!ensuredUser) {
    redirect(`/login?error=temporary_error&email=${encodeURIComponent(email)}`);
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: ensuredUser.id },
    select: { id: true },
  });

  redirect(profile ? "/profile" : "/join/profile");
}
