"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const CONSENT_KEY = "gabonconnect-cookie-consent";

type Consent = "accepted" | "declined";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(CONSENT_KEY) === null);
  }, []);

  const choose = (consent: Consent) => {
    window.localStorage.setItem(CONSENT_KEY, consent);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/10" aria-label="Préférences de cookies">
      <div className="flex gap-4"><div className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 sm:flex"><Cookie aria-hidden className="size-5" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-4"><h2 className="font-semibold text-slate-950">Votre confidentialité compte</h2><button type="button" onClick={() => choose("declined")} className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Fermer"><X aria-hidden className="size-4" /></button></div><p className="mt-2 text-sm leading-6 text-slate-600">Nous utilisons uniquement le stockage nécessaire à vos préférences. Consultez notre <Link href="/rgpd" className="font-medium text-emerald-700 underline underline-offset-4">politique de confidentialité</Link>.</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => choose("accepted")} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">Accepter</button><button type="button" onClick={() => choose("declined")} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">Refuser</button></div></div></div>
    </aside>
  );
}
