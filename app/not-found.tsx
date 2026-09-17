import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Compass, Home, Landmark, Radio, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Page introuvable",
  description:
    "La page que vous cherchez n'existe pas ou a été déplacée. Retrouvez le chemin de la communauté GabonConnect360.",
  robots: { index: false, follow: true },
};

const shortcuts = [
  {
    href: "/radio",
    label: "GabonConnect Radio",
    description: "Écoutez la bande-son du Gabon et de sa diaspora, en direct.",
    Icon: Radio,
  },
  {
    href: "/histoire",
    label: "Mémoire & Histoire",
    description: "Explorez la frise chronologique et les figures emblématiques du Gabon.",
    Icon: Landmark,
  },
  {
    href: "/opportunities",
    label: "Opportunités",
    description: "Emplois, stages, projets et entraide au sein de la communauté.",
    Icon: Sparkles,
  },
];

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col bg-slate-950">
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(5,150,105,0.25),_transparent_55%)]"
        />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-20 text-center sm:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            <Compass className="h-3.5 w-3.5" aria-hidden />
            Erreur 404
          </div>

          <p className="mt-8 bg-gradient-to-b from-emerald-300 to-emerald-600 bg-clip-text text-7xl font-bold tracking-tight text-transparent sm:text-8xl">
            404
          </p>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Page introuvable
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            Cette page a peut-être changé d&apos;adresse ou n&apos;existe plus. Pas d&apos;inquiétude,
            la communauté GabonConnect360 reste à portée de clic.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              <Home className="h-4 w-4" aria-hidden />
              Retourner à l&apos;accueil
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-emerald-400/50 hover:text-emerald-200"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Explorer la plateforme
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-slate-900">
        <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-emerald-400">
            Raccourcis vers les modules clés
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {shortcuts.map(({ href, label, description, Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-emerald-400/50 hover:bg-white/[0.06]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 transition group-hover:bg-emerald-500/25">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="mt-4 text-base font-semibold text-white">{label}</span>
                <span className="mt-2 text-sm leading-6 text-slate-400">{description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
