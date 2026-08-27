"use client";

import dynamic from "next/dynamic";
import type { DiasporaMapMarker } from "@/lib/diaspora-map";

// Leaflet accède à `window` au chargement du module : le composant doit donc
// être chargé uniquement côté client. Next.js 16 interdit `ssr: false` dans
// un Server Component, ce fichier ("use client") est le bon endroit pour cet
// import dynamique.
const WorldMapInner = dynamic(() => import("./world-map-inner"), {
  ssr: false,
  loading: () => (
      <div aria-busy="true" className="h-105 w-full animate-pulse rounded-2xl border border-slate-200 bg-slate-100 md:h-130" />
  ),
});

export default function WorldMap({ markers, detailsLabel, emptyLabel }: { markers: DiasporaMapMarker[]; detailsLabel: string; emptyLabel: string }) {
  if (markers.length === 0) return <div className="flex h-105 w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center text-sm text-slate-500 md:h-130">{emptyLabel}</div>;
  return <WorldMapInner markers={markers} detailsLabel={detailsLabel} />;
}