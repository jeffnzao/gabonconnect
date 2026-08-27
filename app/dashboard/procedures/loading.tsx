import { getLocale, getMessages } from "@/lib/i18n";

export default async function ProceduresLoading() {
  const messages = getMessages(await getLocale());
  return <main aria-busy="true" aria-label={messages.status.loading} className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6"><h1 className="sr-only">{messages.procedures.title}</h1><div className="h-10 w-72 animate-pulse rounded bg-slate-200" /><div className="mt-8 h-14 animate-pulse rounded-2xl bg-slate-100" /><div className="mt-8 grid gap-5 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div></main>;
}
