"use client";

import { Play, RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";
import { triggerNewsIngestion } from "@/lib/actions/admin-moderation";

export function IngestionTrigger() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  function trigger() { startTransition(async () => { try { const result = await triggerNewsIngestion(); setMessage(`${result.created} article(s) cree(s), ${result.autoPublished} publie(s) automatiquement.`); } catch { setMessage("L'ingestion n'a pas pu etre lancee."); } }); }
  return <div className="flex flex-wrap items-center gap-3"><button type="button" onClick={trigger} disabled={isPending} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{isPending ? <RefreshCw className="size-4 animate-spin" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}{isPending ? "Ingestion en cours" : "Declencher l'ingestion maintenant"}</button>{message ? <p role="status" className="text-sm text-slate-600">{message}</p> : null}</div>;
}