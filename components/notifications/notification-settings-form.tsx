"use client";

import { useState } from "react";
import { updateUserNotificationPreferences } from "@/lib/actions/notifications";
import type { Messages } from "@/lib/i18n";

export default function NotificationSettingsForm({ initial, labels, statusLabels }: { initial: { inApp: boolean; email: boolean; push: boolean }; labels: Messages["notifications"]; statusLabels: { save: string; saved: string; error: string; loading: string } }) {
  const [preferences, setPreferences] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setState("saving");
    try {
      const saved = await updateUserNotificationPreferences(preferences);
      setPreferences(saved);
      setState("saved");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <fieldset className="space-y-5">
        <legend className="sr-only">{labels.preferences}</legend>
        {(["inApp", "email", "push"] as const).map((key) => (
          <label key={key} className="flex items-center justify-between gap-4 text-sm font-medium text-slate-800">
            <span>{labels[key]}</span>
            <input type="checkbox" checked={preferences[key]} onChange={(event) => { setPreferences((current) => ({ ...current, [key]: event.target.checked })); setState("idle"); }} className="h-5 w-5 accent-emerald-600" />
          </label>
        ))}
      </fieldset>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => void save()} disabled={state === "saving"} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60">{state === "saving" ? statusLabels.loading : statusLabels.save}</button>
        {state === "saved" && <p role="status" className="text-sm text-emerald-700">{statusLabels.saved}</p>}
        {state === "error" && <p role="alert" className="text-sm text-red-700">{statusLabels.error}</p>}
      </div>
    </div>
  );
}
