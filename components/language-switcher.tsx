"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n-config";

interface LanguageSwitcherProps {
  locale: Locale;
  labels: {
    language: string;
    french: string;
    english: string;
  };
}

export default function LanguageSwitcher({ locale, labels }: LanguageSwitcherProps) {
  const router = useRouter();

  function changeLocale(nextLocale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-600" title={labels.language}>
      <Languages className="h-4 w-4 text-emerald-600" aria-hidden />
      <span className="sr-only">{labels.language}</span>
      <select
        value={locale}
        onChange={(event) => changeLocale(event.target.value as Locale)}
        aria-label={labels.language}
        className="cursor-pointer bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
      >
        <option value="fr">FR 🇫🇷 - {labels.french}</option>
        <option value="en">EN 🇬🇧 - {labels.english}</option>
      </select>
    </label>
  );
}
