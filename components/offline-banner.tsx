"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import type { Messages } from "@/lib/i18n";

export default function OfflineBanner({ labels }: { labels: Messages["offline"] }) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js");
  }, []);

  if (!offline) return null;
  return <aside role="status" className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-lg"><WifiOff className="h-4 w-4 shrink-0" aria-hidden /><span className="flex-1">{labels.banner}</span><button type="button" onClick={() => window.location.reload()} className="shrink-0 font-semibold underline">{labels.retry}</button></aside>;
}