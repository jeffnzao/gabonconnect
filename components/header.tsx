import { getCurrentUser } from "@/lib/auth";
import HeaderNav from "@/components/header-nav";

// Server Component : seule cette partie a besoin de connaître l'état de
// connexion (lecture de session via cookies, cf. `lib/auth.ts`). Le rendu
// interactif (menu mobile, bouton logout) reste dans `HeaderNav`, un Client
// Component, pour ne pas transformer tout le Header en Client Component.
export default async function Header() {
  const user = await getCurrentUser();

  return <HeaderNav isAuthenticated={Boolean(user)} />;
}
