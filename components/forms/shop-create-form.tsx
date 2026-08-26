"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";

import { createShop } from "@/lib/task021";
import { useMessages } from "@/components/i18n-provider";

export default function ShopCreateForm() {
  const router = useRouter();
  const messages = useMessages();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await createShop({
        name: String(formData.get("name") ?? ""),
        slug: String(formData.get("slug") ?? "") || undefined,
        description: String(formData.get("description") ?? "") || undefined,
        associationId: String(formData.get("associationId") ?? "") || undefined,
      });

      router.push(`/shops/${result.slug}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : messages.status.error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto w-full max-w-3xl px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">{messages.forms.create}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{messages.forms.shopTitle}</h1>
          <p className="mt-2 text-sm text-slate-500">{messages.forms.shopIntro}</p>
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
              {messages.forms.shopName}
              <input
                name="name"
                type="text"
                required
                maxLength={180}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {messages.forms.slug}
              <input
                name="slug"
                type="text"
                maxLength={180}
                placeholder="my-shop"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {messages.forms.associationId}
              <input
                name="associationId"
                type="text"
                placeholder="Approved association ID"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {messages.forms.description}
            <textarea
              name="description"
              rows={6}
              maxLength={2000}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/shops")}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300"
            >
              {messages.actions.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
              {isSubmitting ? messages.status.loading : messages.forms.submitShop}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
