import type { Metadata } from "next";
import { Radio } from "lucide-react";
import RadioChannel from "@/components/audio/radio-channel";
import { getRadioStations } from "@/lib/audio/radio-stations";

export const metadata: Metadata = {
  title: "GabonConnect Radio",
  description:
    "Écoutez GabonConnect Radio : musique gabonaise, sons de la diaspora, podcasts et actualités de la communauté, en direct.",
  alternates: { canonical: "/radio" },
};

export const dynamic = "force-static";

export default function RadioPage() {
  const stations = getRadioStations();

  return (
    <div className="flex flex-1 flex-col bg-white pb-28">
      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            <Radio className="h-3.5 w-3.5" aria-hidden />
            En direct
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            GabonConnect Radio
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            La bande-son de la communauté gabonaise et de sa diaspora. Choisissez une chaîne et
            laissez-vous porter : la lecture continue pendant que vous naviguez sur la plateforme.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Nos chaînes</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Quatre univers sonores pour rester connecté au Gabon, où que vous soyez.
        </p>
        <div className="mt-8">
          <RadioChannel stations={stations} />
        </div>
      </section>
    </div>
  );
}
