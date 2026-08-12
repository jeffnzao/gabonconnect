// Route Handler — point de retour du flux Supabase Auth (PKCE / OTP par
// email : signup, magic link, invite...). Supabase redirige vers cette URL
// avec un `code` dans la query string ; ce handler l'échange contre une
// session, synchronise `public.users` via `ensureUser()`, puis redirige.
//
// Ce fichier ne crée PAS de compte ni de profil lui-même : il ne fait que
// terminer l'échange de session commencé par Supabase Auth et déclencher la
// synchronisation `auth.users` → `public.users` (mécanisme validé :
// `ensureUser()`, pas de trigger PostgreSQL pour le MVP).

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
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

const DEFAULT_SUCCESS_PATH = "/join/profile";
const ERROR_PATH = "/join/account?error=auth";

/**
 * `next` vient de la query string (donc non fiable) : on ne l'accepte que
 * s'il s'agit d'un chemin relatif interne (protection open-redirect). Toute
 * autre valeur retombe sur `/join/profile`.
 */
function resolveSuccessPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return DEFAULT_SUCCESS_PATH;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(new URL(ERROR_PATH, origin));
  }

  const cookieStore = await cookies();

  // Client Supabase dédié à cette requête, avec lecture ET écriture des
  // cookies : nécessaire ici car `exchangeCodeForSession` doit pouvoir
  // poser les cookies de session (access + refresh token) sur la réponse.
  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options as CookieOptions);
        });
      },
    },
  });

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(new URL(ERROR_PATH, origin));
  }

  try {
    // Synchronise auth.users → public.users (upsert User Prisma). Le profil
    // (Profile) n'est PAS créé ici — ce sera le rôle de /join/profile.
    await ensureUser({ supabaseClient: supabase });
  } catch (error) {
    console.error("[auth/confirm] ensureUser() failed after session exchange:", error);
    return NextResponse.redirect(new URL(ERROR_PATH, origin));
  }

  return NextResponse.redirect(new URL(resolveSuccessPath(next), origin));
}