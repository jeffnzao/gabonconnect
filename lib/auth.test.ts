import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getCurrentUser } from "./auth";

async function runTests() {
  console.log("Running Supabase auth foundation tests...");

  const noUserClient = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  } as unknown as SupabaseClient;

  const noUser = await getCurrentUser({ supabaseClient: noUserClient });

  if (noUser !== null) {
    console.error("FAILED: getCurrentUser() should return null when there is no authenticated user.");
    process.exit(1);
  }

  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
  } as unknown as User;

  const signedInClient = {
    auth: {
      getUser: async () => ({ data: { user: mockUser }, error: null }),
    },
  } as unknown as SupabaseClient;

  const currentUser = await getCurrentUser({ supabaseClient: signedInClient });

  if (!currentUser || currentUser.id !== "test-user-id" || currentUser.email !== "test@example.com") {
    console.error("FAILED: getCurrentUser() should return a Supabase user when authenticated.");
    process.exit(1);
  }

  // Task 004D — comportement "non authentifié" : une erreur Supabase sans
  // utilisateur (session expirée, cookie absent...) doit rester un simple
  // `null`, jamais une exception qui casserait le rendu de la page.
  const expiredSessionClient = {
    auth: {
      getUser: async () => ({
        data: { user: null },
        error: { message: "Auth session missing", status: 401 },
      }),
    },
  } as unknown as SupabaseClient;

  const expiredSessionUser = await getCurrentUser({ supabaseClient: expiredSessionClient });

  if (expiredSessionUser !== null) {
    console.error(
      "FAILED: getCurrentUser() should return null (not throw) when the session is expired/missing.",
    );
    process.exit(1);
  }

  console.log("PASS: getCurrentUser() returns null without cookies and returns a Supabase user when authenticated.");
}

runTests().catch((error) => {
  console.error("Test execution failed:", error);
  process.exit(1);
});
