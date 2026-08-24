import type { Metadata } from "next";
import Breadcrumb from "@/components/explore/breadcrumb";
import { getActiveAnnouncements } from "@/lib/announcements";

export const metadata: Metadata = { title: "Announcements | GabonConnect" };

export default async function AnnouncementsPage() {
  const announcements = await getActiveAnnouncements();
  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Announcements" }]} />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">Announcements</h1>
          <p className="mt-2 text-sm text-slate-500">Community opportunities and updates.</p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {announcements.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">No active announcements yet.</p> : (
          <div className="grid gap-5 md:grid-cols-2">
            {announcements.map((announcement) => (
              <article key={announcement.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">Announcement</p>
                <h2 className="mt-3 text-xl font-semibold text-slate-900">{announcement.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{announcement.description}</p>
                {announcement.destination && <a href={announcement.destination} className="mt-5 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">Learn more</a>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}