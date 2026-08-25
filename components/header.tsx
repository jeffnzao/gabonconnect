import { getCurrentUser } from "@/lib/auth";
import HeaderNav from "@/components/header-nav";

const BASE_LINKS = [
  { label: "Explore", href: "/explore" },
  { label: "Members", href: "/members" },
  { label: "News", href: "/news" },
  { label: "Shops", href: "/shops" },
  { label: "Events", href: "/events" },
];

// Server Component : seule cette partie a besoin de connaître l'état de
// connexion (lecture de session via cookies, cf. `lib/auth.ts`). Le rendu
// interactif (menu mobile, bouton logout) reste dans `HeaderNav`, un Client
// Component, pour ne pas transformer tout le Header en Client Component.
export default async function Header() {
  const user = await getCurrentUser();
  const isAuthenticated = Boolean(user);
  const navLinks = isAuthenticated
    ? [...BASE_LINKS, { label: "Dashboard", href: "/dashboard" }, { label: "My profile", href: "/profile" }]
    : [...BASE_LINKS, { label: "Join", href: "/join" }, { label: "Login", href: "/login" }];

  return <HeaderNav isAuthenticated={isAuthenticated} navLinks={navLinks} />;
}
