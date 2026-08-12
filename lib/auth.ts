import type { CookieMethodsServer } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { prisma } from "./prisma";
import { createServerSupabaseClient } from "./supabase";

export type SupabaseUser = User;

export async function getCurrentUser(
  options?: {
    cookieMethods?: CookieMethodsServer;
    supabaseClient?: SupabaseClient;
  }
): Promise<SupabaseUser | null> {
  const client =
    options?.supabaseClient ??
    createServerSupabaseClient(options?.cookieMethods);

  const { data, error } = await client.auth.getUser();

  if (error) {
    if (!data?.user) {
      return null;
    }
    throw error;
  }

  return data?.user ?? null;
}

export async function ensureUser(
  options?: {
    cookieMethods?: CookieMethodsServer;
    supabaseClient?: SupabaseClient;
  }
) {
  const user = await getCurrentUser(options);

  if (!user) {
    return null;
  }

  if (!user.email) {
    throw new Error("Authenticated Supabase user is missing an email address.");
  }

  return prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email,
    },
    update: {
      email: user.email,
    },
  });
}
