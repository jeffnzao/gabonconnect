"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { useMessages } from "@/components/i18n-provider";
import { updateUserArticle, updateUserShop, updateUserEvent, updateUserOpportunity } from "@/lib/dashboard-actions";

type EditData =
  | { kind: "article"; id: string; title: string; slug: string; description: string; summary: string }
  | { kind: "shop"; id: string; title: string; slug: string; description: string }
  | { kind: "event"; id: string; title: string; slug: string; description: string; location: string; startDate: string; endDate: string }
  | { kind: "opportunity"; id: string; title: string; slug: string; description: string; location: string };

export default function ContentEditForm({ data }: { data: EditData }) {
  const messages = useMessages();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "");
    const slug = String(form.get("slug") ?? "");
    const description = String(form.get("description") ?? "");
    try {
      let result: { slug: string };
      if (data.kind === "article") result = await updateUserArticle(data.id, { title, slug, summary: String(form.get("summary") ?? ""), content: description });
      else if (data.kind === "shop") result = await updateUserShop(data.id, { name: title, slug, description });
      else if (data.kind === "event") result = await updateUserEvent(data.id, { title, slug, description, location: String(form.get("location") ?? ""), startDate: String(form.get("startDate") ?? ""), endDate: String(form.get("endDate") ?? "") || undefined });
      else result = await updateUserOpportunity(data.id, { title, slug, description, location: String(form.get("location") ?? "") });
      router.push(data.kind === "article" ? `/news/${result.slug}` : data.kind === "shop" ? `/shops/${result.slug}` : data.kind === "event" ? `/events/${result.slug}` : `/opportunities/${result.slug}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : messages.status.error);
      setPending(false);
    }
  }

  return <form onSubmit={submit} className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-6 py-10"><h1 className="text-3xl font-semibold text-slate-900">{messages.profile.edit}</h1>{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">{messages.forms.title}<input name="title" defaultValue={data.title} required className="rounded-lg border border-slate-200 px-4 py-2.5" /></label><label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">{messages.forms.slug}<input name="slug" defaultValue={data.slug} required className="rounded-lg border border-slate-200 px-4 py-2.5" /></label>{data.kind === "article" && <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">{messages.forms.summary}<textarea name="summary" defaultValue={data.summary} rows={3} className="rounded-lg border border-slate-200 px-4 py-2.5" /></label>}{(data.kind === "event" || data.kind === "opportunity") && <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">{messages.forms.location}<input name="location" defaultValue={data.location} required className="rounded-lg border border-slate-200 px-4 py-2.5" /></label>}{data.kind === "event" && <div className="grid gap-4 sm:grid-cols-2"><label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">{messages.forms.startDate}<input name="startDate" type="datetime-local" defaultValue={data.startDate} required className="rounded-lg border border-slate-200 px-4 py-2.5" /></label><label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">{messages.forms.endDate}<input name="endDate" type="datetime-local" defaultValue={data.endDate} className="rounded-lg border border-slate-200 px-4 py-2.5" /></label></div>}<label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">{messages.forms.description}<textarea name="description" defaultValue={data.description} required rows={8} className="rounded-lg border border-slate-200 px-4 py-2.5" /></label><div className="flex justify-between"><button type="button" onClick={() => router.back()} className="rounded-full border border-slate-200 px-5 py-2.5">{messages.actions.cancel}</button><button type="submit" disabled={pending} aria-busy={pending} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 font-semibold disabled:opacity-60">{pending && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}{pending ? messages.status.loading : messages.actions.save}</button></div></form>;
}
