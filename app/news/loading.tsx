import { getLocale, getMessages } from "@/lib/i18n";

export default async function NewsLoading() {
  const messages = getMessages(await getLocale());
  return (
    <main aria-busy="true" aria-label={messages.status.loading} className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      <div className="mt-8 h-10 w-64 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded bg-slate-200" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="h-40 animate-pulse bg-slate-100" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-6 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
