"use client";

import type { Messages } from "@/lib/i18n";

export default function OfflinePageContent({ labels }: { labels: Messages["offline"] }) {
  return <section className="max-w-md text-center"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">GabonConnect</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{labels.title}</h1><p className="mt-4 text-sm leading-6 text-slate-600">{labels.message}</p><button type="button" onClick={() => window.location.reload()} className="mt-8 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">{labels.retry}</button></section>;
}
