import Link from "next/link";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { getLocale, getMessages } from "@/lib/i18n";

interface EventCardProps {
  event: {
    slug: string;
    title: string;
    startDate: Date;
    location: string;
    association: { name: string } | null;
    createdBy: { profile: { firstName: string; lastName: string } | null };
    _count: { participants: number };
    registrationUrl: string | null;
    canonicalUrl: string | null;
    sourceName: string | null;
  };
}

export default async function EventCard({ event }: EventCardProps) {
  const messages = getMessages(await getLocale());
  const locale = (await getLocale()) === "fr" ? "fr-FR" : "en-US";
  const day = event.startDate.toLocaleDateString(locale, { day: "2-digit" });
  const month = event.startDate.toLocaleDateString(locale, { month: "short" }).toUpperCase();
  const time = event.startDate.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const organizer = event.association?.name ?? (
    event.createdBy.profile
      ? `${event.createdBy.profile.firstName} ${event.createdBy.profile.lastName}`.trim()
      : "GabonConnect member"
  );

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">
          <CalendarDays className="h-4 w-4" aria-hidden />
          <span className="mt-1 text-2xl font-semibold leading-none">{day}</span>
          <span className="mt-1 text-[11px] font-semibold tracking-wide">{month}</span>
        </div>
        <h2 className="pt-1 text-xl font-semibold leading-tight text-slate-900">{event.title}</h2>
      </div>
      <div className="mt-5 space-y-2 text-sm text-slate-600">
        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-600" aria-hidden />{event.location}</p>
        <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-emerald-600" aria-hidden />{time}</p>
      </div>
      <p className="mt-5 text-sm text-slate-500">{messages.directories.postedBy} {organizer}</p>
      {event.sourceName && <p className="mt-2 text-xs font-semibold text-sky-700">{messages.events.externalSource}: {event.sourceName}</p>}
      <p className="mt-2 text-sm text-slate-500">{event._count.participants} {messages.common.participants}</p>
      <Link href={`/events/${event.slug}`} className="mt-5 inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800">{messages.events.details} <span className="ml-1" aria-hidden>→</span></Link>
      {event.registrationUrl && <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm font-semibold text-emerald-700">{messages.events.officialRegistration}</a>}
    </article>
  );
}