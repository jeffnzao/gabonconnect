"use client";

import { useActionState } from "react";
import { toggleEventParticipation } from "@/lib/event-actions";
import { useMessages } from "@/components/i18n-provider";

interface ParticipationButtonProps {
  eventId: string;
  initialStatus: "GOING" | "MAYBE" | "DECLINED" | null;
}

export default function ParticipationButton({ eventId, initialStatus }: ParticipationButtonProps) {
  const messages = useMessages();
  const action = toggleEventParticipation.bind(null, eventId);
  const [status, formAction, isPending] = useActionState(action, initialStatus);

  return (
    <form action={formAction} className="flex flex-wrap gap-2">
      {(["GOING", "MAYBE", "DECLINED"] as const).map((option) => (
        <button key={option} type="submit" name="status" value={option} disabled={isPending} className={status === option ? "rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950" : "rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-400"}>
          {option === "GOING" ? messages.events.going : option === "MAYBE" ? messages.events.maybe : messages.events.decline}
        </button>
      ))}
    </form>
  );
}