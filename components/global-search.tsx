"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { globalSearch } from "@/lib/actions/search";
import { useMessages } from "@/components/i18n-provider";
import type { SearchResults, SearchCategory } from "@/lib/search";

export default function GlobalSearch() {
  const messages = useMessages();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen(true); }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function search(value: string) {
    setQuery(value);
    if (!value.trim()) { setResults(null); return; }
    setLoading(true);
    try { setResults(await globalSearch(value)); } finally { setLoading(false); }
  }

  const groups: { key: Exclude<SearchCategory, "all">; label: string }[] = [
    { key: "members", label: messages.search.members }, { key: "associations", label: messages.search.associations }, { key: "events", label: messages.search.events }, { key: "opportunities", label: messages.search.opportunities }, { key: "procedures", label: messages.search.procedures }, { key: "consulates", label: messages.search.consulates },
  ];

  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label={messages.common.searchAll} className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex"><Search className="h-4 w-4" aria-hidden /><span>{messages.common.searchAll}</span><kbd className="rounded border border-slate-200 bg-white px-1.5 text-[10px]">Ctrl K</kbd></button>
    {open && <div className="fixed inset-0 z-60 bg-slate-950/40 p-4 sm:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section role="dialog" aria-modal="true" aria-label={messages.common.searchAll} className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex items-center gap-3 border-b border-slate-100 px-4"><Search className="h-5 w-5 text-slate-400" aria-hidden /><input autoFocus value={query} onChange={(event) => void search(event.target.value)} placeholder={messages.common.searchPlaceholder} className="min-w-0 flex-1 py-4 text-sm outline-none" /><button type="button" onClick={() => setOpen(false)} aria-label={messages.actions.close} className="rounded p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" aria-hidden /></button></div><div className="max-h-[70vh] overflow-y-auto p-4">{loading ? <p className="py-8 text-center text-sm text-slate-500">{messages.status.loading}</p> : !results ? <p className="py-8 text-center text-sm text-slate-500">{messages.search.intro}</p> : groups.map((group) => results[group.key].length > 0 && <div key={group.key} className="mb-5"><h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{group.label}</h2><ul className="space-y-1">{results[group.key].map((result) => <li key={`${result.kind}-${result.id}`}><Link href={result.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-slate-50"><span className="block text-sm font-semibold text-slate-900">{result.title}</span><span className="block text-xs text-slate-500">{result.subtitle}</span></Link></li>)}</ul></div>)}</div></section></div>}
  </>;
}
