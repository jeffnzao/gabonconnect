import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, getMessages } from "@/lib/i18n";
import { getProcedures, procedureCategories } from "@/lib/procedures";
import { getProcedureDescription, getProcedureTitle } from "@/components/procedures/procedure-copy";
import type { AdministrativeProcedureCategory } from "@/app/generated/prisma";

type ProceduresPageProps = { searchParams: Promise<{ q?: string; category?: string }> };

export const dynamic = "force-dynamic";

export default async function ProceduresPage({ searchParams }: ProceduresPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard/procedures");

  const locale = await getLocale();
  const messages = getMessages(locale);
  const params = await searchParams;
  const category = procedureCategories.includes(params.category as AdministrativeProcedureCategory) ? params.category as AdministrativeProcedureCategory : undefined;
  const procedures = await getProcedures({ query: params.q, category });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">{messages.procedures.checklist}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{messages.procedures.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{messages.procedures.intro}</p>
      </header>

      <form method="get" className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto_auto]">
        <label htmlFor="procedure-query" className="sr-only">{messages.procedures.search}</label>
        <input id="procedure-query" name="q" defaultValue={params.q} placeholder={messages.procedures.searchPlaceholder} className="min-w-0 rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500" />
        <label className="sr-only" htmlFor="procedure-category">{messages.procedures.category}</label>
        <select id="procedure-category" name="category" defaultValue={category ?? ""} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">
          <option value="">{messages.procedures.allCategories}</option>
          {procedureCategories.map((item) => <option key={item} value={item}>{messages.procedures[item.toLowerCase() as keyof typeof messages.procedures]}</option>)}
        </select>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">{messages.procedures.search}</button>
      </form>

      {procedures.length === 0 ? <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">{messages.procedures.noResults}</p> : <div className="mt-8 grid gap-5 md:grid-cols-2">{procedures.map((procedure) => <article key={procedure.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{messages.procedures[procedure.category.toLowerCase() as keyof typeof messages.procedures]}</span><span className="text-xs text-slate-500">{procedure._count.steps} {messages.procedures.steps.toLowerCase()}</span></div><h2 className="mt-4 text-xl font-semibold text-slate-900">{getProcedureTitle(messages, procedure.slug, procedure.title)}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{getProcedureDescription(messages, procedure.slug, procedure.description)}</p><div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500"><span>{messages.procedures.estimatedDays}: {procedure.estimatedDays} {messages.procedures.days}</span><span>{messages.procedures.cost}: {procedure.cost}</span></div><Link href={`/procedures/${procedure.slug}`} className="mt-5 inline-flex rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500">{messages.procedures.checklist}</Link></article>)}</div>}
    </main>
  );
}
