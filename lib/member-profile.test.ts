// Tests Task 006 §17 — profil membre public (/members/[id]).
//
// Même approche que les suites précédentes (`lib/security-guards.test.ts`,
// `lib/members.test.ts`) : pas de framework, pas d'accès réseau/DB depuis
// ce script. On vérifie sur le code source réel les invariants demandés :
// getMemberById() reste la seule porte d'entrée, la page appelle
// notFound() pour tout profil absent/PRIVATE, aucune donnée interne n'est
// sélectionnée, et les metadata ne sont générées qu'à partir de données
// réellement présentes (jamais inventées).

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
  console.log("Running member profile tests (Task 006 §17)...");

  const membersLib = read("lib/members.ts");
  const profilePage = read("app/members/[id]/page.tsx");

  // Test 1 — un profil PUBLIC est retourné par getMemberById().
  check(
    "Test 1 — getMemberById() returns a value for PUBLIC profiles",
    /return \{\s*id: profile\.id,/.test(membersLib),
  );

  // Test 2 — un profil PRIVATE n'est jamais retourné.
  check(
    "Test 2 — getMemberById() rejects any non-PUBLIC profile before returning data",
    /if \(!profile \|\| profile\.visibility !== ProfileVisibility\.PUBLIC\) {\s*return null;/.test(
      membersLib,
    ),
  );

  // Test 3 — un ID inexistant : Prisma findUnique() renvoie déjà `null`
  // nativement pour un id absent ; combiné au test 2, `!profile` couvre ce cas.
  check(
    "Test 3 — an unknown id falls through the same `!profile` branch (null, not thrown)",
    /const profile = await prisma\.profile\.findUnique\(\{\s*where: \{ id \},/.test(membersLib),
  );

  // Test 4 — la page appelle notFound() quand le profil est absent/PRIVATE,
  // AVANT tout rendu de contenu.
  const notFoundIndex = profilePage.indexOf("notFound();");
  const heroRenderIndex = profilePage.indexOf("fullName}\n              </h1>");
  check(
    "Test 4 — /members/[id] calls notFound() before rendering any profile content",
    notFoundIndex > -1 && (heroRenderIndex === -1 || notFoundIndex < heroRenderIndex),
  );

  // Test 5 — le profil retourné ne contient que les champs nécessaires à
  // l'affichage public : jamais `email`, jamais `userId`, jamais `visibility`
  // exposé au-delà de la vérification serveur elle-même.
  const memberDetailInterfaceMatch = membersLib.match(
    /export interface MemberDetail \{([\s\S]*?)\}/,
  );
  const memberDetailFields = memberDetailInterfaceMatch?.[1] ?? "";
  check(
    "Test 5 — MemberDetail never exposes email, userId or visibility to callers",
    !/email/.test(memberDetailFields) &&
      !/userId/.test(memberDetailFields) &&
      !/visibility/.test(memberDetailFields),
  );

  // Test 6 — un profil PUBLIC obtient un titre dynamique (nom + marque).
  check(
    "Test 6 — generateMetadata() builds a dynamic title from the member's name",
    /title: `\$\{member\.firstName\} \$\{member\.lastName\} · GabonConnect`/.test(profilePage),
  );

  // Metadata : pas de description fabriquée quand aucune donnée réelle
  // n'est disponible (pas de profession, pas de ville, pas de bio).
  check(
    "Metadata — no description is invented when profession/city/bio are all absent",
    /return undefined;/.test(profilePage) && /\.\.\.\(description \? \{ description \} : \{\}\)/.test(profilePage),
  );

  // Metadata : profil introuvable/PRIVATE renvoie le même message générique
  // dans les deux cas (ne révèle jamais qu'un profil PRIVATE existe à cet id).
  check(
    "Metadata — missing/private profile returns the same generic title in both cases",
    /if \(!member\) \{\s*return \{ title: "Member not found \| GabonConnect" \};/.test(
      profilePage,
    ),
  );

  // Test 7 — sécurité : aucun userId de formulaire/URL n'intervient dans
  // la sélection du profil ; seul le `id` de la route (déjà géré par
  // getMemberById + visibility PUBLIC) est utilisé.
  check(
    "Test 7 — the profile page never reads a userId from params/searchParams to select the profile",
    !/formData\.get\(\s*["']userId["']\s*\)/.test(profilePage) &&
      !/searchParams[.[]userId/.test(profilePage),
  );

  // Pas de section Association inventée : aucune relation Profile→Association
  // n'existe dans le schéma actuel — vérifié en s'assurant qu'aucun champ
  // "association" n'est lu sur `member`.
  check(
    "No fabricated Association section (Profile has no Association relation in the schema)",
    !/member\.association/i.test(profilePage),
  );

  if (failures > 0) {
    console.error(`\n${failures} member profile test(s) failed.`);
    process.exit(1);
  }

  console.log(`\nAll member profile tests passed.`);
}

runTests();
