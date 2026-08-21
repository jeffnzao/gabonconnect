"use client";

import { useActionState } from "react";
import {
  toggleMembershipAction,
  type MembershipState,
} from "@/app/associations/[slug]/actions";

interface JoinButtonProps {
  associationId: string;
  initialJoined: boolean;
  initialMemberCount: number;
}

export default function JoinButton({
  associationId,
  initialJoined,
  initialMemberCount,
}: JoinButtonProps) {
  const boundAction = toggleMembershipAction.bind(null, associationId);
  const [state, formAction, isPending] = useActionState<MembershipState, FormData>(
    boundAction,
    { joined: initialJoined, memberCount: initialMemberCount, error: null },
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <form action={formAction}>
        <input type="hidden" name="intent" value={state.joined ? "leave" : "join"} />
        <button
          type="submit"
          disabled={isPending}
          className={
            state.joined
              ? "inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 disabled:opacity-60"
              : "inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-60"
          }
        >
          {isPending ? "…" : state.joined ? "Leave association" : "Join association"}
        </button>
      </form>

      {state.error && (
        <p role="alert" className="text-xs text-red-600">
          {state.error}
        </p>
      )}
    </div>
  );
}