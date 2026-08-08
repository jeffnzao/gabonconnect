"use client";

import dynamic from "next/dynamic";

// Leaflet accède à `window` au chargement du module : le composant doit donc
// être chargé uniquement côté client. Next.js 16 interdit `ssr: false` dans
// un Server Component, ce fichier ("use client") est le bon endroit pour cet
// import dynamique.
const WorldMapInner = dynamic(() => import("./world-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 md:h-[520px]">
      <p className="text-sm text-slate-400">Loading map…</p>
    </div>
  ),
});

export default function WorldMap() {
  return <WorldMapInner />;
}