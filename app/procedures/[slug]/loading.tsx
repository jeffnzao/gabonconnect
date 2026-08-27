import { getLocale, getMessages } from "@/lib/i18n";

export default async function ProcedureLoading() {
  const messages = getMessages(await getLocale());
  return <main aria-busy="true" aria-label={messages.status.loading} className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6"><div className="h-4 w-48 animate-pulse rounded bg-slate-200" /><div className="mt-8 h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" /><div className="mt-8 h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" /></main>;
}
