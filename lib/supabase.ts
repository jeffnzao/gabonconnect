import { cookies } from "next/headers";
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import type { CookieMethodsServer } from "@supabase/ssr";

function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must be defined in the environment."
    );
  }
  return value;
}

function getSupabaseAnonKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined in the environment."
    );
  }
  return value;
}

export function createBrowserSupabaseClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    isSingleton: true,
  });
}

function createServerCookieMethods(): CookieMethodsServer {
  return {
    getAll: async () => {
      const requestCookies = await cookies();
      return requestCookies.getAll().map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
      }));
    },
  };
}

export function createServerSupabaseClient(
  cookieMethods?: CookieMethodsServer
) {
  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: cookieMethods ?? createServerCookieMethods(),
  });
}
