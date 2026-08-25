import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n-config";
export { DEFAULT_LOCALE, getMessages, isLocale, LOCALES, LOCALE_COOKIE } from "@/lib/i18n-config";
export type { Locale, Messages } from "@/lib/i18n-config";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  const configuredDefault = process.env.I18N_DEFAULT_LOCALE;
  const fallback = isLocale(configuredDefault) ? configuredDefault : DEFAULT_LOCALE;
  return isLocale(value) ? value : fallback;
}
