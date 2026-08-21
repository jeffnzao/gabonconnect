// Tests "User Dashboard & My Profile" (Task 009 §15).
//
// Même approche que les suites précédentes : pas de framework, pas
// d'accès réseau/DB. On vérifie sur le code source réel les invariants
// de sécurité et de scoping demandés.

import { readFileSync } from "node:fs";
import { join } from "node:path";

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

function runTests() {
  console.log("Running dashboard tests...");

  const pageSource = read("app/dashboard/page.tsx");
  const dashboardLib = read("lib/user-dashboard.ts");

  // 1. /dashboard redirige un utilisateur non authentifié vers /login.
  check(
    "/dashboard redirects to /login when there is no session",
    /if \(!user\) \{\s*redirect\("\/login"\);/.test(pageSource),
  );

  // 2. Un utilisateur authentifié sans Profile est redirigé vers /join/profile.
  check(
    "/dashboard redirects to /join/profile when getDashboardData() returns null",
    /if \(!data\) \{\s*redirect\("\/join\/profile"\);/.test(pageSource),
  );

  // 3. Le dashboard dérive l'identité depuis la session serveur (getCurrentUser()),
  //    jamais d'un paramètre client.
  check(
    "the page derives identity exclusively from getCurrentUser()",
    /const user = await getCurrentUser\(\);/.test(pageSource),
  );

  // 4. Aucun profileId n'est lu depuis FormData sur cette page (page en
  //    lecture seule, pas de Server Action de mutation dans cette task).
  check(
    "the dashboard page never reads a profileId/userId from FormData",
    !/formData\.get\(\s*["'](profileId|userId)["']\s*\)/.test(pageSource),
  );

  // 5. Aucun userId/profileId n'est accepté depuis params/searchParams —
  //    getDashboardData() ne prend qu'un seul argument, dérivé de user.id.
  check(
    "getDashboardData() is called with user.id only, never a param/searchParam",
    /getDashboardData\(user\.id\)/.test(pageSource) &&
      !/searchParams\.\w*[Ii]d/.test(pageSource) &&
      !/params\.\w*[Ii]d/.test(pageSource),
  );

  // 6. Le dashboard ne peut récupérer que le Profile du user courant :
  //    la requête est scopée where: { userId } sur l'argument reçu.
  check(
    "getDashboardData() scopes the Prisma query to where: { userId }",
    /where: \{ userId \}/.test(dashboardLib),
  );

  // 7. Les associations affichées viennent de la relation Profile.associations
  //    (donc structurellement liées au profil déjà scopé), pas d'une requête
  //    associationMember indépendante avec un id arbitraire.
  check(
    "associations are read via the Profile.associations relation, not a separate associationMember query",
    /associations: \{/.test(dashboardLib) &&
      !/prisma\.associationMember\.find/.test(dashboardLib),
  );

  // 8. Seules les associations APPROVED sont retournées.
  check(
    "getDashboardData() only returns memberships to APPROVED associations",
    /status: AssociationStatus\.APPROVED/.test(dashboardLib),
  );

  // 9. Les statistiques ("Associations joined") viennent des données réelles
  //    déjà chargées (associations.length), pas d'une valeur inventée.
  check(
    "the joined-associations count is derived from the real associations array",
    /\{associations\.length\}/.test(pageSource),
  );

  // 10. Le profil PRIVATE ne doit jamais afficher "View my public profile".
  check(
    "the public-profile link is gated behind isPublic",
    /isPublic &&\s*\(\s*<Link\s*\n\s*href=\{`\/members\/\$\{profile\.id\}`\}/.test(pageSource),
  );

  if (failures > 0) {
    console.error(`\n${failures} dashboard test(s) failed.`);
    process.exit(1);
  }

  console.log(`\nAll dashboard tests passed.`);
}

runTests();
