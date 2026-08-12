"use server";

// Action de déconnexion, utilisée par le Header (bouton "Logout").
//
// Séparé de `lib/auth.ts` volontairement : `lib/auth.ts` expose des
// fonctions de lecture pures (`getCurrentUser`, `ensureUser`) utilisables
// depuis des Server Components ; ce fichier est marqué `"use server"` dans
// son ensemble et ne doit contenir que des Server Actions.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

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

export async function signOutAction() {
  const cookieStore = await cookies();

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
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

  await supabase.auth.signOut();
  redirect("/");
}
