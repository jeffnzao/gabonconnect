import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/explore/breadcrumb";
import ParticipationButton from "@/components/events/participation-button";
import { getCurrentUser } from "@/lib/auth";
import { getEventBySlug } from "@/lib/events";
import { getLocale, getMessages } from "@/lib/i18n";

interface EventDetailProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: EventDetailProps): Promise<Metadata> {
  const event = await getEventBySlug((await params).slug);
  return { title: event ? `${event.title} | GabonConnect` : "Event | GabonConnect" };
}

export default async function EventDetailPage({ params }: EventDetailProps) {
  const messages = getMessages(await getLocale());
  const event = await getEventBySlug((await params).slug);
  if (!event) notFound();
  const user = await getCurrentUser();
  const participant = user ? event.participants.find((entry) => entry.userId === user.id) : null;
  const participantCount = event.participants.length;
  const maxParticipantsText = event.maxParticipants ? `${participantCount}/${event.maxParticipants} ${messages.events.going}` : `${participantCount} ${messages.common.participants}`;

  return (
    <article className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <Breadcrumb items={[{ label: messages.common.home, href: "/" }, { label: messages.navigation.events, href: "/events" }, { label: event.title }]} />

      <p className="mt-10 text-sm font-semibold uppercase tracking-wide text-emerald-600">
        {event.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">{event.title}</h1>

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="rounded-full bg-slate-100 px-3 py-1.5">{event.location}</span>
        {event.isVirtual && event.virtualUrl && (
          <a href={event.virtualUrl} target="_blank" rel="noreferrer" className="rounded-full bg-emerald-100 px-3 py-1.5 font-medium text-emerald-700 hover:text-emerald-800">
            {messages.events.joinOnline}
          </a>
        )}
        {event.maxParticipants && <span className="rounded-full bg-slate-100 px-3 py-1.5">{event.maxParticipants}</span>}
      </div>

      <p className="mt-6 whitespace-pre-wrap text-base leading-8 text-slate-700">{event.description}</p>
      {event.sourceName && <p className="mt-4 text-sm font-semibold text-sky-700">{messages.events.externalSource}: {event.sourceName}</p>}
      {event.canonicalUrl && <a href={event.canonicalUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">{messages.events.officialRegistration}</a>}

      <dl className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">{messages.directories.location}</dt>
          <dd className="mt-1 text-sm text-slate-900">{event.location}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">{messages.common.participants}</dt>
          <dd className="mt-1 text-sm text-slate-900">{maxParticipantsText}</dd>
        </div>
        {event.isVirtual && event.virtualUrl && (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-slate-500">{messages.forms.virtualUrl}</dt>
            <dd className="mt-1 text-sm text-slate-900">
              <a href={event.virtualUrl} target="_blank" rel="noreferrer" className="text-emerald-700 hover:text-emerald-800">
                {event.virtualUrl}
              </a>
            </dd>
          </div>
        )}
      </dl>

      {user ? (
        <div className="mt-8">
          <ParticipationButton eventId={event.id} initialStatus={participant?.status ?? null} />
        </div>
      ) : (
        <p className="mt-8 text-sm text-slate-500">{messages.events.loginToJoin}</p>
      )}
    </article>
  );
}