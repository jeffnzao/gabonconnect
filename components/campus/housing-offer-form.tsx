"use client";

import { useState } from "react";
import { HousingType } from "@/app/generated/prisma";
import { createHousingOffer } from "@/lib/actions/campus";
import type { Messages } from "@/lib/i18n";

export default function HousingOfferForm({ labels }: { labels: Messages["campus"] }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      await createHousingOffer({ city: String(data.get("city") ?? ""), country: String(data.get("country") ?? ""), type: String(data.get("type") ?? "") as HousingType, price: Number(data.get("price")), description: String(data.get("description") ?? ""), contactEmail: String(data.get("contactEmail") ?? "") });
      event.currentTarget.reset();
      setState("saved");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : labels.error);
      setState("error");
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 sm:p-6">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">{labels.city}<input name="city" required className="rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-emerald-500" /></label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">{labels.country}<input name="country" required className="rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-emerald-500" /></label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">{labels.housingType}<select name="type" defaultValue={HousingType.COLOCATION} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal"><option value="COLOCATION">{labels.colocation}</option><option value="STUDIO">{labels.studio}</option><option value="CHAMBRE">{labels.chambre}</option><option value="SOUS_LOCATION">{labels.sous_location}</option></select></label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">{labels.price}<input name="price" type="number" min="0" step="0.01" required className="rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-emerald-500" /></label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">{labels.description}<textarea name="description" required rows={4} className="rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-emerald-500" /></label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">{labels.email}<input name="contactEmail" type="email" required className="rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-emerald-500" /></label>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2"><button type="submit" disabled={state === "saving"} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60">{state === "saving" ? labels.loading : labels.publish}</button>{state === "saved" && <p role="status" className="text-sm text-emerald-700">{labels.available}</p>}{state === "error" && <p role="alert" className="text-sm text-red-700">{error}</p>}</div>
    </form>
  );
}
