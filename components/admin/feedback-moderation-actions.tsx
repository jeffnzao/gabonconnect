"use client";

import { Check, Trash2 } from "lucide-react";
import { deleteFeedback, moderateFeedback } from "@/lib/feedback-admin-actions";

export default function FeedbackModerationActions({
  id,
  published,
  processed,
  labels,
}: {
  id: string;
  published: boolean;
  processed: boolean;
  labels: { publish: string; hide: string; markProcessed: string; delete: string; deleteConfirm: string };
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={moderateFeedback}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value={published ? "hidden" : "published"} />
        <button type="submit" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          {published ? labels.hide : labels.publish}
        </button>
      </form>
      {!processed && (
        <form action={moderateFeedback}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="processed" />
          <button type="submit" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Check className="h-3.5 w-3.5" aria-hidden />
            {labels.markProcessed}
          </button>
        </form>
      )}
      <form action={deleteFeedback} onSubmit={(event) => { if (!window.confirm(labels.deleteConfirm)) event.preventDefault(); }}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50">
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          {labels.delete}
        </button>
      </form>
    </div>
  );
}
