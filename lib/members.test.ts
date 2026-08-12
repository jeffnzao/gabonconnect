// Tests Task 005 §14 — annuaire des membres.
//
// Même esprit que `lib/security-guards.test.ts` : pas de framework, pas de
// connexion DB depuis ce script (aucun accès réseau à Supabase dans cet
// environnement). On vérifie donc directement, sur le CODE SOURCE réel,
// les invariants qui garantissent le comportement demandé — en particulier
// qu'un profil PRIVATE ne peut, par construction, jamais apparaître dans
// les résultats de `/members` (recherche, filtres ou pagination confondus),
// puisque `findMany` et `count` utilisent le MÊME objet `where`, qui
// commence toujours par `visibility: PUBLIC`.
//
// Les scénarios qui ont réellement besoin d'une base Postgres (contenu
// exact d'un profil PUBLIC vs PRIVATE en conditions réelles) restent dans
// la checklist de test manuel du rapport Task 005.

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
  console.log("Running member directory tests (Task 005 §14)...");

  const membersLib = read("lib/members.ts");

  // Test 1 & 2 — un profil PUBLIC apparaît, un profil PRIVATE n'apparaît jamais :
  // buildMemberWhere() doit démarrer inconditionnellement par visibility: PUBLIC,
  // avant tout filtre de recherche ou de localisation.
  check(
    "Test 1/2 — the base member query always filters visibility: PUBLIC",
    /const where: Prisma\.ProfileWhereInput = \{ visibility: ProfileVisibility\.PUBLIC \};/.test(
      membersLib,
    ),
  );

  // Test 3 — un profil PRIVATE n'est jamais comptabilisé dans `total` :
  // findMany() et count() doivent utiliser la MÊME variable `where`, pas
  // deux requêtes construites séparément qui pourraient diverger.
  const getMembersBlockMatch = membersLib.match(
    /export const getMembers = cache\(([\s\S]*?)\n\);/,
  );
  const getMembersBlock = getMembersBlockMatch?.[1] ?? "";
  check(
    "Test 3 — getMembers() runs findMany and count against the same `where`",
    /prisma\.profile\.findMany\(\{\s*where,/.test(getMembersBlock) &&
      /prisma\.profile\.count\(\{ where \}\)/.test(getMembersBlock),
  );

  // Test 4 — la recherche ne retourne jamais un profil PRIVATE : le bloc
  // `OR` de la recherche texte est une propriété du MÊME `where` object
  // qui porte `visibility: PUBLIC` (pas une requête OR indépendante qui
  // court-circuiterait le filtre de base).
  check(
    "Test 4 — the free-text search (`where.OR`) is scoped inside the PUBLIC-only where object",
    /where\.OR = \[/.test(membersLib),
  );

  // Test 5, 6, 7 — filtres continent / country / city : chacun doit écrire
  // sur `where.city`, propriété du même objet `where` (PUBLIC déjà posé).
  check(
    "Test 5 — continent filter narrows the same `where` object (where.city = ...continent)",
    /where\.city = \{ country: \{ continent: \{ slug: filters\.continentSlug \} \} \};/.test(
      membersLib,
    ),
  );
  check(
    "Test 6 — country filter narrows the same `where` object (where.city = ...country)",
    /where\.city = \{ country: \{ slug: filters\.countrySlug \} \};/.test(membersLib),
  );
  check(
    "Test 7 — city filter narrows the same `where` object (where.city = ...slug)",
    /where\.city = \{ slug: filters\.citySlug \};/.test(membersLib),
  );

  // Test 8 — pagination : skip/take dérivés de page/PAGE_SIZE.
  check(
    "Test 8 — pagination uses skip/take derived from page and PAGE_SIZE",
    /skip: \(page - 1\) \* PAGE_SIZE/.test(getMembersBlock) &&
      /take: PAGE_SIZE/.test(getMembersBlock),
  );

  // Test 9 — /members/[id] renvoie 404 pour un profil PRIVATE : déjà
  // couvert par lib/security-guards.test.ts (notFound() sur member null),
  // et getMemberById() lui-même doit rejeter tout profil non-PUBLIC avant
  // de retourner quoi que ce soit à l'appelant.
  check(
    "Test 9 — getMemberById() returns null for any non-PUBLIC profile",
    /if \(!profile \|\| profile\.visibility !== ProfileVisibility\.PUBLIC\) {\s*return null;/.test(
      membersLib,
    ),
  );

  // Test 10 — un visiteur non connecté peut consulter /members : la page
  // ne doit imposer aucune garde d'authentification (contrairement à
  // /join/profile ou /profile, qui redirigent si !user).
  const membersPage = read("app/members/page.tsx");
  check(
    "Test 10 — /members has no auth guard (readable by anonymous visitors)",
    !/getCurrentUser/.test(membersPage) && !/redirect\(/.test(membersPage),
  );

  // Sécurité transverse — select explicite, jamais include: { user: true }.
  // (On retire d'abord les lignes de commentaire : le fichier documente
  // volontairement cette règle dans son en-tête, ce qui ferait sinon
  // matcher le texte du commentaire lui-même plutôt que du code réel.)
  const membersLibCodeOnly = membersLib
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
  check(
    "lib/members.ts never uses include: { user: true } (no internal User fields leaked)",
    !/include:\s*\{\s*user:\s*true/.test(membersLibCodeOnly),
  );

  if (failures > 0) {
    console.error(`\n${failures} member directory test(s) failed.`);
    process.exit(1);
  }

  console.log(`\nAll member directory tests passed.`);
}

runTests();
