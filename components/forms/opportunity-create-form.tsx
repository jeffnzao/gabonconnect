"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { createOpportunity } from "@/lib/task021";

export default function OpportunityCreateForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await createOpportunity({
        title: String(formData.get("title") ?? ""),
        slug: String(formData.get("slug") ?? "") || undefined,
        description: String(formData.get("description") ?? ""),
        type: String(formData.get("type") ?? "JOB") as "JOB" | "INTERNSHIP" | "VOLUNTEERING" | "PROJECT_CALL" | "MUTUAL_AID",
        location: String(formData.get("location") ?? "") || "Remote",
        applicationUrl: String(formData.get("applicationUrl") ?? "") || undefined,
        companyName: String(formData.get("organizationName") ?? "") || undefined,
        associationId: String(formData.get("associationId") ?? "") || undefined,
        isRemote: String(formData.get("isRemote") ?? "false") === "true",
      });

      router.push(`/opportunities/${result.slug}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create the opportunity.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto w-full max-w-3xl px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Create</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Create an opportunity</h1>
          <p className="mt-2 text-sm text-slate-500">Share a job, volunteering opening, partnership, or funding call.</p>
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
              Opportunity title
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
                placeholder="community-analyst"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Type
              <select
                name="type"
                defaultValue="JOB"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="JOB">Job</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="VOLUNTEERING">Volunteering</option>
                <option value="PROJECT_CALL">Project call</option>
                <option value="MUTUAL_AID">Mutual aid</option>
              </select>
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Location
              <input
                name="location"
                type="text"
                placeholder="Libreville, remote"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Organization name
              <input
                name="organizationName"
                type="text"
                placeholder="GabonConnect"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="isRemote" value="true" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
            Remote role / remote opportunity
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Application URL (optional)
            <input
              name="applicationUrl"
              type="url"
              placeholder="https://..."
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Association ID (optional)
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
              onClick={() => router.push("/opportunities")}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Create opportunity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
