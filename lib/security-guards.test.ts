// Tests de garde-fous — Task 004D, section 9.
//
// Volontairement sans framework de test (pas de Jest/Vitest à installer) :
// même esprit que `lib/auth.test.ts`, exécuté via `tsx`. Ces tests
// n'ouvrent AUCUNE connexion réseau/DB — ils vérifient soit un
// comportement en mémoire (mock Supabase), soit, pour tout ce qui touche
// à la base réelle (RLS, propriétaire vs non-propriétaire), que le CODE
// SOURCE respecte bien l'invariant attendu (le formulaire ne peut pas
// fournir un userId, la mise à jour cible toujours `userId` de la
// session...). Ce sont des tests de régression : ils échouent si
// quelqu'un réintroduit un jour un `formData.get("userId")` ou équivalent.
//
// Les scénarios qui nécessitent réellement une base Postgres (propriétaire
// vs non-propriétaire au niveau RLS, profil public visible dans /members,
// profil privé absent) restent dans la checklist de test manuel — voir le
// rapport de la Task 004D.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getCurrentUser } from "./auth";

const root = join(__dirname, "..");
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

let failures = 0;

function check(label: string, condition: boolean) {
  if (condition) {
    console.log(`PASS: ${label}`);
  } else {
    console.error(`FAILED: ${label}`);
    failures += 1;
  }
}

async function runTests() {
  console.log("Running security guard tests...");

  // ── getCurrentUser() : utilisateur non authentifié ──────────────────
  const noSessionClient = {
    auth: { getUser: async () => ({ data: { user: null }, error: null }) },
  } as unknown as SupabaseClient;

  check(
    "getCurrentUser() returns null when there is no session",
    (await getCurrentUser({ supabaseClient: noSessionClient })) === null,
  );

  // ── getCurrentUser() : utilisateur authentifié ──────────────────────
  const mockUser = { id: "user-a", email: "a@example.com" } as unknown as User;
  const signedInClient = {
    auth: { getUser: async () => ({ data: { user: mockUser }, error: null }) },
  } as unknown as SupabaseClient;

  const currentUser = await getCurrentUser({ supabaseClient: signedInClient });
  check(
    "getCurrentUser() returns the authenticated user's id",
    currentUser?.id === "user-a",
  );

  // ── /join/profile : jamais de userId client, jamais accessible sans session ──
  const createProfileSource = read("app/join/profile/actions.ts");
  check(
    "createProfileAction never reads a userId from the submitted form",
    !/formData\.get\(\s*["']userId["']\s*\)/.test(createProfileSource),
  );
  check(
    "createProfileAction derives userId from ensureUser(), not from the form",
    /userId:\s*ensuredUser\.id/.test(createProfileSource),
  );

  const joinProfilePageSource = read("app/join/profile/page.tsx");
  check(
    "/join/profile redirects unauthenticated visitors instead of rendering the form",
    /if \(!user\)/.test(joinProfilePageSource) &&
      /redirect\(["']\/join\/account["']\)/.test(joinProfilePageSource),
  );

  // ── /profile : mise à jour toujours scopée au propriétaire ──────────
  const updateProfileSource = read("app/profile/actions.ts");
  check(
    "updateProfileAction targets Prisma with where: { userId: ensuredUser.id }",
    /where:\s*\{\s*userId:\s*ensuredUser\.id\s*\}/.test(updateProfileSource),
  );
  check(
    "updateProfileAction never accepts a profile/user id from the submitted form",
    !/formData\.get\(\s*["'](userId|profileId|id)["']\s*\)/.test(updateProfileSource),
  );

  const profilePageSource = read("app/profile/page.tsx");
  check(
    "/profile redirects unauthenticated visitors to /login (owner-only access)",
    /if \(!user\)/.test(profilePageSource) &&
      /redirect\(["']\/login["']\)/.test(profilePageSource),
  );

  // ── /members : visibilité PUBLIC appliquée à la source des données ──
  const membersLibSource = read("lib/members.ts");
  check(
    "getMembers()'s query always filters visibility: PUBLIC",
    /visibility:\s*ProfileVisibility\.PUBLIC/.test(membersLibSource),
  );
  check(
    "getMemberById() rejects non-PUBLIC profiles before returning data",
    /profile\.visibility !== ProfileVisibility\.PUBLIC/.test(membersLibSource),
  );

  const memberDetailPageSource = read("app/members/[id]/page.tsx");
  check(
    "/members/[id] calls notFound() for missing/private profiles",
    /notFound\(\)/.test(memberDetailPageSource),
  );

  // ── /login : jamais de userId de formulaire, redirection basée sur le profil ──
  const loginActionSource = read("app/login/actions.ts");
  check(
    "signInAction routes based on the server-derived profile, not a client value",
    /redirect\(profile \? ["']\/profile["'] : ["']\/join\/profile["']\)/.test(
      loginActionSource,
    ),
  );

  if (failures > 0) {
    console.error(`\n${failures} security guard test(s) failed.`);
    process.exit(1);
  }

  console.log(`\nAll security guard tests passed.`);
}

runTests().catch((error) => {
  console.error("Test execution failed:", error);
  process.exit(1);
});
