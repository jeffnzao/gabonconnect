import { ArrowRight, Globe2 } from "lucide-react";
import { SITE_NAME, SITE_VERSION } from "@/config/site";
import { getLocale, getMessages } from "@/lib/i18n";

export default async function Hero() {
  const messages = getMessages(await getLocale());
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
          {SITE_NAME} · MVP {SITE_VERSION}
        </span>

        <h1 className="mt-8 text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          {messages.home.heroTitle}
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-400 sm:text-xl">
          {messages.home.heroIntro}
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#world-map"
            className="group inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            {messages.home.exploreDiaspora}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </a>
          <a
            href="/join"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {messages.home.joinCta}
          </a>
        </div>
      </div>
    </section>
  );
}