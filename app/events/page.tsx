import type { Metadata } from "next";
import Breadcrumb from "@/components/explore/breadcrumb";
import EventCard from "@/components/events/event-card";
import { getEvents } from "@/lib/events";

export const metadata: Metadata = { title: "Events | GabonConnect" };

export default async function EventsPage() {
  const events = await getEvents({ upcomingOnly: true });
  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white"><div className="mx-auto w-full max-w-6xl px-6 py-10"><Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Events" }]} /><h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">Community events</h1><p className="mt-2 text-sm text-slate-500">Discover gatherings and activities across the Gabonese diaspora.</p></div></section>
      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{events.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">No upcoming events yet.</p> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>}</section>
    </div>
  );
}