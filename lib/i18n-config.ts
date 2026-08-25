import fr from "@/messages/fr.json";
import en from "@/messages/en.json";

export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export type Messages = typeof fr;

export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_COOKIE = "gabonconnect-locale";

const dictionaries: Record<Locale, Messages> = { fr, en };

export function isLocale(value: string | undefined): value is Locale {
  return value === "fr" || value === "en";
}

export function getMessages(locale: Locale = DEFAULT_LOCALE): Messages {
  return dictionaries[locale];
}
