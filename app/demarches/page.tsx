import Link from "next/link";
import { getLocale, getMessages } from "@/lib/i18n";
import { getProcedures } from "@/lib/procedures";

export const dynamic = "force-dynamic";

export default async function DemarchesPage() {
  const messages = getMessages(await getLocale());
  const procedures = await getProcedures();
  return <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12"><header className="border-b border-slate-200 pb-7"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Services pratiques</p><h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Demarches administratives</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Consultez les guides, les etapes et les liens officiels avant de commencer votre demarche.</p></header><section className="mt-7 grid gap-4 md:grid-cols-2">{procedures.map((procedure) => <article key={procedure.id} className="border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{messages.procedures[procedure.category.toLowerCase() as keyof typeof messages.procedures]}</p><h2 className="mt-2 text-lg font-semibold text-slate-900">{procedure.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{procedure.description}</p><p className="mt-4 text-xs text-slate-500">{procedure._count.steps} etape(s) · Pieces et liens detailles dans le guide</p><Link href={`/procedures/${procedure.slug}`} className="mt-4 inline-flex rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">Voir le guide</Link></article>)}</section></main>;
}