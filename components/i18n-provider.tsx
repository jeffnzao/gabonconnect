"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale, Messages } from "@/lib/i18n-config";

const I18nContext = createContext<Messages | null>(null);

export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: ReactNode }) {
  void locale;
  return <I18nContext.Provider value={messages}>{children}</I18nContext.Provider>;
}

export function useMessages(): Messages {
  const messages = useContext(I18nContext);
  if (!messages) throw new Error("useMessages must be used within I18nProvider");
  return messages;
}
