import { getEventBySlug } from "@/lib/events";

function escapeIcs(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const event = await getEventBySlug((await params).slug);
  if (!event) return new Response("Not found", { status: 404 });
  const end = event.endDate ?? new Date(event.startDate.getTime() + 60 * 60 * 1000);
  const calendar = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//GabonConnect//Events//FR", "BEGIN:VEVENT", `UID:${event.id}@gabonconnect`, `DTSTAMP:${formatIcsDate(new Date())}`, `DTSTART:${formatIcsDate(event.startDate)}`, `DTEND:${formatIcsDate(end)}`, `SUMMARY:${escapeIcs(event.title)}`, `DESCRIPTION:${escapeIcs(event.description)}`, `LOCATION:${escapeIcs(event.location)}`, "END:VEVENT", "END:VCALENDAR", ""].join("\r\n");
  return new Response(calendar, { headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": `attachment; filename="${event.slug}.ics"` } });
}