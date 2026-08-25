import { getCurrentUser } from "@/lib/auth";
import { getMessages, type Locale } from "@/lib/i18n";
import HeaderNav from "@/components/header-nav";

interface HeaderProps {
  locale: Locale;
}

// Server Component : seule cette partie a besoin de connaître l'état de
// connexion (lecture de session via cookies, cf. `lib/auth.ts`). Le rendu
// interactif (menu mobile, bouton logout) reste dans `HeaderNav`, un Client
// Component, pour ne pas transformer tout le Header en Client Component.
export default async function Header({ locale }: HeaderProps) {
  const user = await getCurrentUser();
  const messages = getMessages(locale);
  const BASE_LINKS = [
    { label: messages.navigation.explore, href: "/explore" },
    { label: messages.navigation.members, href: "/members" },
    { label: messages.navigation.news, href: "/news" },
    { label: messages.navigation.shops, href: "/shops" },
    { label: messages.navigation.events, href: "/events" },
    { label: messages.navigation.opportunities, href: "/opportunities" },
    { label: messages.navigation.feed, href: "/feed" },
  ];
  const isAuthenticated = Boolean(user);
  const navLinks = isAuthenticated
    ? [...BASE_LINKS, { label: messages.navigation.dashboard, href: "/dashboard" }, { label: messages.navigation.profile, href: "/profile" }]
    : [...BASE_LINKS, { label: messages.navigation.join, href: "/join" }, { label: messages.navigation.login, href: "/login" }];

  return <HeaderNav isAuthenticated={isAuthenticated} navLinks={navLinks} locale={locale} labels={messages} />;
}
