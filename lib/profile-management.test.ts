// Tests "My Profile & Profile Management" §11.
//
// Même approche que les suites précédentes : pas de framework, pas
// d'accès réseau/DB. On vérifie sur le code source réel les invariants
// de sécurité demandés — plusieurs recoupent volontairement
// `lib/security-guards.test.ts` (déjà vert), mais sont réaffirmés ici
// avec l'intitulé exact de cette tâche pour une traçabilité claire.

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
  console.log("Running profile management tests...");

  const actionsSource = read("app/profile/actions.ts");
  const pageSource = read("app/profile/page.tsx");
  const membersLib = read("lib/members.ts");

  // /profile redirige si non authentifié.
  check(
    "/profile redirects to /login when there is no session",
    /if \(!user\) \{\s*redirect\("\/login"\);/.test(pageSource),
  );

  // updateProfileAction refuse une session absente.
  check(
    "updateProfileAction redirects to /login when ensureUser() returns null",
    /if \(!ensuredUser\) \{\s*redirect\("\/login"\);/.test(actionsSource),
  );

  // updateProfileAction utilise uniquement l'utilisateur issu de la session.
  check(
    "updateProfileAction derives the target user exclusively from ensureUser()",
    /const ensuredUser = await ensureUser\(\);/.test(actionsSource),
  );

  // Aucun userId / profileId lu depuis le formulaire.
  check(
    "updateProfileAction never reads userId or profileId from the form",
    !/formData\.get\(\s*["'](userId|profileId)["']\s*\)/.test(actionsSource),
  );

  // Email non modifiable : jamais lu depuis formData, jamais dans le schema Zod.
  check(
    "email is never read from the form or written by updateProfileAction",
    !/formData\.get\(\s*["']email["']\s*\)/.test(actionsSource) &&
      !/email:\s*z\./.test(actionsSource),
  );

  // countryId / cityId non modifiables depuis /profile.
  check(
    "countryId and cityId are never read from the form or written by updateProfileAction",
    !/formData\.get\(\s*["'](countryId|cityId)["']\s*\)/.test(actionsSource) &&
      !/(countryId|cityId):\s*z\./.test(actionsSource),
  );

  // visibility strictement limitée à PUBLIC/PRIVATE.
  check(
    "visibility is validated as a strict PUBLIC/PRIVATE enum",
    /visibility: z\.enum\(\["PUBLIC", "PRIVATE"\]/.test(actionsSource),
  );

  // Un utilisateur ne peut modifier que son propre profil : la requête
  // Prisma est scopée where: { userId: ensuredUser.id }, jamais un id
  // arbitraire (profil, ou userId envoyé par le client).
  check(
    "Prisma update is scoped to where: { userId: ensuredUser.id } — never an arbitrary id",
    /where: \{ userId: ensuredUser\.id \}/.test(actionsSource),
  );

  // PRIVATE reste invisible dans /members ; PUBLIC reste visible —
  // réaffirmé ici sur la même source que lib/members.test.ts.
  check(
    "The public member list query always filters visibility: PUBLIC",
    /const where: Prisma\.ProfileWhereInput = \{ visibility: ProfileVisibility\.PUBLIC \};/.test(
      membersLib,
    ),
  );

  if (failures > 0) {
    console.error(`\n${failures} profile management test(s) failed.`);
    process.exit(1);
  }

  console.log(`\nAll profile management tests passed.`);
}

runTests();
