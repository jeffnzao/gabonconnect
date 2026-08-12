// Middleware Next.js — infrastructure SSR Supabase.
//
// NOTE (Task 004D) : ce fichier était absent de l'état du dépôt fourni pour
// ce ticket, alors qu'il avait été validé et livré en Task 004B. Il est
// requis par l'architecture SSR Supabase (rafraîchissement de session sur
// chaque requête) — je le restaure ici à l'identique, sans le modifier
// autrement. Voir le diagnostic pour plus de détails.
//
// Rôle unique de ce fichier : rafraîchir la session Supabase (access token
// expiré → refresh token) sur chaque requête, et réécrire les cookies mis à
// jour sur la réponse. Sans lui, un token expiré n'est jamais rafraîchi et
// l'utilisateur peut être déconnecté de façon aléatoire côté Server
// Components (`getCurrentUser()` y est en lecture seule, cf. `lib/supabase.ts`).
//
// Ce middleware ne fait AUCUNE redirection applicative (pas de garde
// d'authentification sur /join, /profile, etc.) — cette responsabilité
// reste dans chaque page (cf. `app/join/profile/page.tsx`, `app/profile/page.tsx`).

import { NextResponse, type NextRequest } from "next/server";
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

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  // Déclenche le rafraîchissement du token si nécessaire ; les cookies
  // rafraîchis passent par `setAll` ci-dessus. Ne pas supprimer même si la
  // valeur de retour n'est pas utilisée ici.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
