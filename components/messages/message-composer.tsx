"use client";

import { useActionState } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { sendMessageFromForm } from "@/lib/messaging-actions";
import { useMessages } from "@/components/i18n-provider";

export default function MessageComposer({ conversationId }: { conversationId: string }) {
  const messages = useMessages();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, formAction, isPending] = useActionState(async (_previous: string | null, formData: FormData) => {
    const result = await sendMessageFromForm(conversationId, formData);
    if (result.success) {
      formRef.current?.reset();
      router.refresh();
      return null;
    }
    return messages.messaging.sendError;
  }, null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap gap-2 border-t border-slate-200 bg-white p-4">
      <input name="content" required maxLength={5000} placeholder={messages.messaging.writeMessage} className="min-w-0 flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400" />
      <button type="submit" disabled={isPending} className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60">{isPending ? messages.messaging.sending : messages.messaging.send}</button>
      {error && <p role="alert" className="basis-full text-sm text-red-700">{error}</p>}
    </form>
  );
}