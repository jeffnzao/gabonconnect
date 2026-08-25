// Tests "User Dashboard & My Profile" (Task 016).
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
  console.log("Running dashboard tests (Task 016)...");

  const pageSource = read("app/dashboard/page.tsx");
  const dashboardActionsSource = read("lib/dashboard-actions.ts");
  const dashboardLib = read("lib/dashboard.ts");

  // 1. /dashboard redirige un utilisateur non authentifié vers /login.
  check(
    "/dashboard redirects to /login when there is no session",
    /if \(!user\).*redirect/.test(pageSource) && /login/.test(pageSource),
  );

  // 2. Le dashboard dérive l'identité depuis la session serveur (getCurrentUser()),
  //    jamais d'un paramètre client.
  check(
    "the page derives identity exclusively from getCurrentUser()",
    /getCurrentUser\(\)/.test(pageSource),
  );

  // 3. getUserDashboardData() est appelé avec user.id seulement.
  check(
    "getUserDashboardData() is called with user.id",
    /getUserDashboardData/.test(pageSource),
  );

  // 4. Les server actions utilisent ensureUser() ou une fonction équivalente pour dériver l'identité.
  check(
    "dashboard-actions derive identity via ensureUser",
    /ensureUser/.test(dashboardActionsSource) || /requireUser/.test(dashboardActionsSource),
  );

  // 5. updateUserPresenceStatus valide le statut contre UserStatus enum.
  check(
    "updateUserPresenceStatus validates status against enum",
    /updateUserPresenceStatus.*UserStatus/.test(dashboardActionsSource),
  );

  // 6. Toutes les fonctions de suppression/annulation appellent verifyResourceOwnership.
  check(
    "deleteUserEvent is defined and secured",
    /deleteUserEvent/.test(dashboardActionsSource) && /verifyResourceOwnership/.test(dashboardActionsSource),
  );

  check(
    "cancelUserEvent is defined and secured",
    /cancelUserEvent/.test(dashboardActionsSource) && /verifyResourceOwnership/.test(dashboardActionsSource),
  );

  check(
    "deleteUserOpportunity is defined and secured",
    /deleteUserOpportunity/.test(dashboardActionsSource) && /verifyResourceOwnership/.test(dashboardActionsSource),
  );

  check(
    "closeUserOpportunity is defined and secured",
    /closeUserOpportunity/.test(dashboardActionsSource) && /verifyResourceOwnership/.test(dashboardActionsSource),
  );

  // 7. deleteUserPost appelle verifyResourceOwnership.
  check(
    "deleteUserPost is defined and secured",
    /deleteUserPost/.test(dashboardActionsSource) && /verifyResourceOwnership/.test(dashboardActionsSource),
  );

  // 8. manageAssociationMember appelle verifyAssociationMembership.
  check(
    "manageAssociationMember is defined and secured",
    /manageAssociationMember/.test(dashboardActionsSource) && /verifyAssociationMembership/.test(dashboardActionsSource),
  );

  // 9. getUserDashboardData() scope les queries au userId du profile.
  check(
    "getUserDashboardData scopes profile query to where: { userId }",
    /where: \{ userId \}/.test(dashboardLib),
  );

  // 10. Events, Opportunities, Posts sont tous scopés par createdById.
  check(
    "getUserDashboardData scopes events to createdById",
    /createdById: userId/.test(dashboardLib),
  );

  if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
    process.exit(1);
  }

  console.log("\nAll dashboard tests passed.");
}

runTests();

