"use client";

import { useActionState } from "react";
import { createPost } from "@/lib/feed-actions";
import { useMessages } from "@/components/i18n-provider";

interface CreatePostFormProps {
  associations: Array<{ id: string; name: string }>;
}

export default function CreatePostForm({ associations }: CreatePostFormProps) {
  const messages = useMessages();
  const [message, formAction, isPending] = useActionState(async (_previous: string | null, formData: FormData) => {
    try {
      await createPost({
        content: formData.get("content"),
        type: formData.get("type"),
        visibility: formData.get("visibility"),
        associationId: formData.get("associationId") || undefined,
      });
      return messages.status.success;
    } catch (error) {
      return error instanceof Error ? error.message : messages.status.error;
    }
  }, null);

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200 bg-white p-5">
      <label htmlFor="content" className="text-sm font-semibold text-slate-900">{messages.feed.share}</label>
      <textarea id="content" name="content" required rows={4} maxLength={5000} placeholder={messages.feed.sharePlaceholder} className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-400" />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <select name="type" defaultValue="GENERAL" className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="GENERAL">{messages.feed.general}</option><option value="ANNOUNCEMENT">{messages.feed.announcement}</option><option value="EVENT_SHARE">{messages.feed.event}</option><option value="OPPORTUNITY_SHARE">{messages.feed.opportunity}</option></select>
        <select name="visibility" defaultValue="PUBLIC" className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="PUBLIC">{messages.profile.public}</option><option value="MEMBERS_ONLY">Members only</option></select>
        {associations.length > 0 && <select name="associationId" defaultValue="" className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="">{messages.dashboard.association}</option>{associations.map((association) => <option key={association.id} value={association.id}>{association.name}</option>)}</select>}
        <button type="submit" disabled={isPending} className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60">{isPending ? messages.feed.publishing : messages.feed.publish}</button>
      </div>
      {message && <p className="mt-3 text-sm text-slate-600" role="status">{message}</p>}
    </form>
  );
}