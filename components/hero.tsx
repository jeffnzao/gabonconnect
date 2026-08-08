import { ArrowRight, Globe2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      {/* Halo décoratif façon Stripe/Notion */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-0 flex justify-center blur-3xl"
      >
        <div className="h-[520px] w-[820px] rounded-full bg-gradient-to-tr from-emerald-500/30 via-sky-500/20 to-yellow-400/20" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pb-24 pt-28 text-center sm:pb-32 sm:pt-36">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-slate-200 backdrop-blur">
          <Globe2 className="h-4 w-4 text-emerald-400" aria-hidden />
          GabonConnect · MVP 0.1
        </span>

        <h1 className="mt-8 text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          The 10th Province of Gabon
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-400 sm:text-xl">
          Des dizaines de milliers de Gabonais vivent hors du pays — en
          Afrique, en Europe, en Amérique et au-delà. GabonConnect rassemble
          cette diaspora mondiale sur une seule plateforme : trouvez-vous,
          organisez-vous, avancez ensemble.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#world-map"
            className="group inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            Explore the diaspora
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </a>
          <a
            href="#join"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Join GabonConnect
          </a>
        </div>
      </div>
    </section>
  );
}