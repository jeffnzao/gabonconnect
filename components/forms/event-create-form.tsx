"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { createEvent } from "@/lib/task021";

export default function EventCreateForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await createEvent({
        title: String(formData.get("title") ?? ""),
        slug: String(formData.get("slug") ?? "") || undefined,
        description: String(formData.get("description") ?? ""),
        startDate: String(formData.get("startDate") ?? ""),
        endDate: String(formData.get("endDate") ?? "") || undefined,
        location: String(formData.get("location") ?? ""),
        isVirtual: String(formData.get("isVirtual") ?? "false") === "true",
        virtualUrl: String(formData.get("virtualUrl") ?? "") || undefined,
        organizerType: String(formData.get("organizerType") ?? "USER") as "ASSOCIATION" | "USER",
        associationId: String(formData.get("associationId") ?? "") || undefined,
        maxParticipants: Number(formData.get("maxParticipants") || 0) || undefined,
      });

      router.push(`/events/${result.slug}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create the event.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto w-full max-w-3xl px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Create</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Create an event</h1>
          <p className="mt-2 text-sm text-slate-500">Organize a gathering, webinar, or community moment.</p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 md:col-span-2">
              Event title
              <input
                name="title"
                type="text"
                required
                maxLength={180}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Slug (optional)
              <input
                name="slug"
                type="text"
                maxLength={180}
                placeholder="community-meetup"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Organizer type
              <select
                name="organizerType"
                defaultValue="USER"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="USER">User</option>
                <option value="ASSOCIATION">Association</option>
              </select>
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Start date & time
              <input
                name="startDate"
                type="datetime-local"
                required
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              End date & time (optional)
              <input
                name="endDate"
                type="datetime-local"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Location
              <input
                name="location"
                type="text"
                required
                placeholder="Libreville"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Max participants (optional)
              <input
                name="maxParticipants"
                type="number"
                min="1"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="isVirtual" value="true" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
            This is a virtual event
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Virtual URL (if applicable)
            <input
              name="virtualUrl"
              type="url"
              placeholder="https://zoom.us/..."
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Association ID (for association events)
            <input
              name="associationId"
              type="text"
              placeholder="Approved association ID"
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Description
            <textarea
              name="description"
              rows={8}
              required
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/events")}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Create event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
