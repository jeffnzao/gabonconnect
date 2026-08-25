"use client";

import { useActionState } from "react";
import { sendMessageFromForm } from "@/lib/messaging-actions";
import { useMessages } from "@/components/i18n-provider";

export default function MessageComposer({ conversationId }: { conversationId: string }) {
  const messages = useMessages();
  const [error, formAction, isPending] = useActionState(async (_previous: string | null, formData: FormData) => {
    try {
      await sendMessageFromForm(conversationId, formData);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : messages.status.error;
    }
  }, null);

  return (
    <form action={formAction} className="flex gap-2 border-t border-slate-200 bg-white p-4">
      <input name="content" required maxLength={5000} placeholder={messages.messaging.writeMessage} className="min-w-0 flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
      <button type="submit" disabled={isPending} className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60">{isPending ? messages.messaging.sending : messages.messaging.send}</button>
      {error && <p role="alert" className="sr-only">{error}</p>}
    </form>
  );
}