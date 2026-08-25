"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { createNews } from "@/lib/task021";

export default function NewsCreateForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await createNews({
        title: String(formData.get("title") ?? ""),
        slug: String(formData.get("slug") ?? "") || undefined,
        summary: String(formData.get("summary") ?? "") || undefined,
        content: String(formData.get("content") ?? ""),
        imageUrl: String(formData.get("imageUrl") ?? "") || undefined,
      });

      router.push(`/news/${result.slug}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create the story.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto w-full max-w-3xl px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Create</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Publish a news story</h1>
          <p className="mt-2 text-sm text-slate-500">Share a story, announcement, or update with the GabonConnect community.</p>
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
              Title
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
                placeholder="example-story"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Image URL (optional)
              <input
                name="imageUrl"
                type="url"
                placeholder="https://..."
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Summary (optional)
            <textarea
              name="summary"
              rows={3}
              maxLength={500}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Content
            <textarea
              name="content"
              rows={10}
              required
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/news")}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Publishing..." : "Publish story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
