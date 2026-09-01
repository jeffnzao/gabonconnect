import type { Metadata } from "next";
import Breadcrumb from "@/components/explore/breadcrumb";
import EventCard from "@/components/events/event-card";
import { getEvents } from "@/lib/events";
import { getLocale, getMessages } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const messages = getMessages(await getLocale());
  return { title: messages.directories.events, description: messages.directories.eventsIntro };
}

type Props = { searchParams: Promise<{ country?: string; city?: string }> };

export default async function EventsPage({ searchParams }: Props) {
  const messages = getMessages(await getLocale());
  const params = await searchParams;
  const events = await getEvents({ upcomingOnly: true, country: params.country, city: params.city });
  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white"><div className="mx-auto w-full max-w-6xl px-6 py-10"><Breadcrumb items={[{ label: messages.common.home, href: "/" }, { label: messages.navigation.events }]} /><h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">{messages.directories.events}</h1><p className="mt-2 text-sm text-slate-500">{messages.directories.eventsIntro}</p></div></section>
      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10"><form method="get" className="mb-8 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-3"><input name="country" defaultValue={params.country} placeholder="Pays (ex. France)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><input name="city" defaultValue={params.city} placeholder="Ville (ex. Paris)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Filtrer</button></form>{events.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">{messages.directories.noEvents}</p> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>}</section>
    </div>
  );
}