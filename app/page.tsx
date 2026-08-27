import Hero from "@/components/hero";
import WorldMap from "@/components/world-map";
import { getLocale, getMessages } from "@/lib/i18n";
import { PublicFeedbacks } from "@/components/public-feedbacks";
import NewsHub from "@/components/news/news-hub";
import { getDiasporaMapMarkers } from "@/lib/diaspora-map";
import { getOpportunities } from "@/lib/opportunities";
import { getEvents } from "@/lib/events";

export const dynamic = "force-dynamic";



export default async function HomePage() {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const [articles, markers, opportunities, events] = await Promise.all([
    import("@/lib/news").then(({ getPublishedArticles }) => getPublishedArticles({ pageSize: 6 })),
    getDiasporaMapMarkers(),
    getOpportunities(),
    getEvents({ upcomingOnly: true }),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-white">
      <Hero />
      <NewsHub articles={articles} messages={messages} locale={locale} limit={6} />

      <HomeSection title={messages.home.campusTitle} intro={messages.home.campusIntro} href="/explore" linkLabel={messages.home.viewAll} />
      <HomeSection title={messages.home.practicalTitle} intro={messages.home.practicalIntro} href="/explore" linkLabel={messages.home.viewAll} />

      <HomeListSection title={messages.home.opportunitiesTitle} href="/opportunities" linkLabel={messages.home.viewAll} items={opportunities.slice(0, 3).map((item) => ({ title: item.title, href: `/opportunities/${item.slug}`, detail: item.location }))} />
      <HomeListSection title={messages.home.eventsTitle} href="/events" linkLabel={messages.home.viewAll} items={events.slice(0, 3).map((item) => ({ title: item.title, href: `/events/${item.slug}`, detail: item.location }))} />

      <section id="world-map" className="bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{messages.home.worldCommunity}</h2>
            <p className="mt-4 text-lg text-slate-500">
              {messages.home.worldCommunityIntro}
            </p>
          </div>

          <div className="mt-12">
            <WorldMap markers={markers} detailsLabel={messages.home.mapMarkerDetails} emptyLabel={messages.home.mapEmpty} />
          </div>
        </div>
      </section>

      <section className="container mx-auto py-12">
        <h2 className="text-2xl font-bold mb-4">{messages.feedback.publicTitle}</h2>
        <PublicFeedbacks locale={locale} />
      </section>
    </div>
  );
}

function HomeSection({ title, intro, href, linkLabel }: { title: string; intro: string; href: string; linkLabel: string }) {
  return <section className="border-b border-slate-100 bg-white py-10"><div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{intro}</p></div><a href={href} className="shrink-0 text-sm font-semibold text-emerald-700 hover:text-emerald-800">{linkLabel}</a></div></section>;
}

function HomeListSection({ title, href, linkLabel, items }: { title: string; href: string; linkLabel: string; items: { title: string; href: string; detail: string }[] }) {
  return <section className="bg-white py-10"><div className="mx-auto max-w-6xl px-4 sm:px-6"><div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2><a href={href} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">{linkLabel}</a></div>{items.length > 0 && <div className="mt-5 grid gap-3 sm:grid-cols-3">{items.map((item) => <a key={item.href} href={item.href} className="rounded-xl border border-slate-200 p-4 hover:border-emerald-300"><h3 className="font-semibold text-slate-900">{item.title}</h3><p className="mt-2 text-sm text-slate-500">{item.detail}</p></a>)}</div>}</div></section>;
}



