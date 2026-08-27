import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getMessages } from "@/lib/i18n";
import { getConsulates } from "@/lib/actions/consulates";
import { ConsulateType } from "@/app/generated/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Consular directory | GabonConnect" };

type Props = { searchParams: Promise<{ country?: string; type?: string }> };

export default async function ConsulatesPage({ searchParams }: Props) {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const params = await searchParams;
  const type = Object.values(ConsulateType).includes(params.type as ConsulateType) ? params.type as ConsulateType : undefined;
  const consulates = await getConsulates({ country: params.country, type });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <header><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">{messages.directory2.emergency}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{messages.directory2.consulates}</h1></header>
      <form method="get" className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto]">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">{messages.directory2.country}<input name="country" defaultValue={params.country} className="rounded-lg border border-slate-200 px-3 py-2 font-normal" /></label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">{messages.directory2.representationType}<select name="type" defaultValue={type ?? ""} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal"><option value="">{messages.directory2.allTypes}</option>{Object.values(ConsulateType).map((item) => <option key={item} value={item}>{messages.directory2[item.toLowerCase() as keyof typeof messages.directory2]}</option>)}</select></label>
        <button type="submit" className="self-end rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">{messages.common.search}</button>
      </form>
      {consulates.length === 0 ? <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">{messages.directory2.noConsulates}</p> : <div className="mt-8 grid gap-5 md:grid-cols-2">{consulates.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{messages.directory2[item.type.toLowerCase() as keyof typeof messages.directory2]}</span><span className="text-sm font-semibold text-slate-700">{item.country}</span></div><h2 className="mt-4 text-xl font-semibold text-slate-900">{item.name}</h2><p className="mt-1 text-sm text-slate-500">{item.city}</p><dl className="mt-4 space-y-2 text-sm text-slate-600"><div><dt className="font-semibold text-slate-800">{messages.directory2.address}</dt><dd>{item.address}</dd></div><div><dt className="font-semibold text-slate-800">{messages.directory2.openingHours}</dt><dd>{item.openingHours}</dd></div><div><dt className="font-semibold text-slate-800">{messages.directory2.jurisdiction}</dt><dd>{item.jurisdiction}</dd></div><div><dt className="font-semibold text-slate-800">{messages.directory2.emergency}</dt><dd><a href={`tel:${item.phone}`} className="text-emerald-700">{item.phone}</a></dd></div></dl><div className="mt-5 flex flex-wrap gap-3"><a href={`mailto:${item.email}`} className="text-sm font-semibold text-emerald-700">{item.email}</a><a href={item.website} target="_blank" rel="noreferrer" className="text-sm font-semibold text-emerald-700">{messages.directory2.officialWebsite}</a></div><p className="mt-4 text-sm text-slate-500">{messages.directory2.procedures}: <Link href="/procedures/passeport-renouvellement" className="text-emerald-700">{messages.directory2.passport}</Link> · <Link href="/procedures/immatriculation-consulaire" className="text-emerald-700">{messages.directory2.consularCard}</Link></p></article>)}</div>}
    </main>
  );
}
