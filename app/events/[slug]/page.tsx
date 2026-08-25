import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/explore/breadcrumb";
import ParticipationButton from "@/components/events/participation-button";
import { getCurrentUser } from "@/lib/auth";
import { getEventBySlug } from "@/lib/events";

interface EventDetailProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: EventDetailProps): Promise<Metadata> {
  const event = await getEventBySlug((await params).slug);
  return { title: event ? `${event.title} | GabonConnect` : "Event | GabonConnect" };
}

export default async function EventDetailPage({ params }: EventDetailProps) {
  const event = await getEventBySlug((await params).slug);
  if (!event) notFound();
  const user = await getCurrentUser();
  const participant = user ? event.participants.find((entry) => entry.userId === user.id) : null;
  return <article className="mx-auto w-full max-w-3xl flex-1 px-6 py-10"><Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Events", href: "/events" }, { label: event.title }]} /><p className="mt-10 text-sm font-semibold uppercase tracking-wide text-emerald-600">{event.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">{event.title}</h1><p className="mt-6 whitespace-pre-wrap text-base leading-8 text-slate-700">{event.description}</p><dl className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2"><div><dt className="text-xs uppercase tracking-wide text-slate-500">Location</dt><dd className="mt-1 text-sm text-slate-900">{event.location}</dd></div><div><dt className="text-xs uppercase tracking-wide text-slate-500">Participants</dt><dd className="mt-1 text-sm text-slate-900">{event.participants.length}</dd></div></dl>{user ? <div className="mt-8"><ParticipationButton eventId={event.id} initialStatus={participant?.status ?? null} /></div> : <p className="mt-8 text-sm text-slate-500">Log in to join this event.</p>}</article>;
}