import Hero from "@/components/hero";
import Stats from "@/components/stats";
import WorldMap from "@/components/world-map";
import ContinentGrid from "@/components/continent-grid";
import Features from "@/components/features";
import { getGlobalStats, getContinentsOverview } from "@/lib/dashboard";
import { getLocale, getMessages } from "@/lib/i18n";
import { PublicFeedbacks } from "@/components/public-feedbacks";

export const dynamic = "force-dynamic";



export default async function HomePage() {
  const messages = getMessages(await getLocale());
  const [stats, continents] = await Promise.all([
    getGlobalStats(),
    getContinentsOverview(),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-white">
      <Hero />
      <Stats stats={stats} />

      <section id="world-map" className="bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{messages.home.worldCommunity}</h2>
            <p className="mt-4 text-lg text-slate-500">
              {messages.home.worldCommunityIntro}
            </p>
          </div>

          <div className="mt-12">
            <WorldMap />
          </div>
        </div>
      </section>

      <ContinentGrid continents={continents} />
      <Features />
      <section className="container mx-auto py-12">
        <h2 className="text-2xl font-bold mb-4">Avis des visiteurs</h2>
        <PublicFeedbacks />
      </section>
    </div>
  );
}



