import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getMessages } from "@/lib/i18n";
import { getAssociations } from "@/lib/actions/associations";
import { AssociationCategory } from "@/app/generated/prisma";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const messages = getMessages(await getLocale());
  return { title: messages.directories.associations, description: messages.directories.associationsIntro };
}

type Props = { searchParams: Promise<{ country?: string; city?: string; category?: string }> };

export default async function AssociationsPage({ searchParams }: Props) {
  const messages = getMessages(await getLocale());
  const params = await searchParams;
  const category = Object.values(AssociationCategory).includes(params.category as AssociationCategory) ? params.category : undefined;
  const associations = await getAssociations({ country: params.country, city: params.city, category });
  return <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12"><header><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">{messages.navigation.members}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{messages.directories.associations}</h1><p className="mt-3 max-w-2xl text-sm text-slate-600">{messages.directories.associationsIntro}</p></header><form method="get" className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-4"><label className="flex flex-col gap-1 text-sm font-medium text-slate-700">{messages.directory2.country}<input name="country" defaultValue={params.country} className="rounded-lg border border-slate-200 px-3 py-2 font-normal" /></label><label className="flex flex-col gap-1 text-sm font-medium text-slate-700">{messages.directory2.city}<input name="city" defaultValue={params.city} className="rounded-lg border border-slate-200 px-3 py-2 font-normal" /></label><label className="flex flex-col gap-1 text-sm font-medium text-slate-700">{messages.directory2.associationCategory}<select name="category" defaultValue={category ?? ""} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal"><option value="">{messages.directory2.allCategories}</option>{Object.values(AssociationCategory).map((item) => <option key={item} value={item}>{messages.directory2[item.toLowerCase() as keyof typeof messages.directory2]}</option>)}</select></label><button type="submit" className="self-end rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">{messages.common.search}</button></form>{associations.length === 0 ? <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">{messages.directory2.noAssociations}</p> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{associations.map((association) => <article key={association.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{messages.directory2[association.category.toLowerCase() as keyof typeof messages.directory2]}</span>{association.isVerified && <span className="text-xs font-semibold text-emerald-700">{messages.directories.verified}</span>}</div><h2 className="mt-4 text-xl font-semibold text-slate-900">{association.name}</h2><p className="mt-2 text-sm text-slate-500">{association.city ? `${association.city.name}, ${association.city.country.name}` : ""}</p>{association.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{association.description}</p>}<p className="mt-4 text-xs text-slate-500">{association._count.members} {messages.directory2.members}</p><Link href={`/associations/${association.slug}`} className="mt-5 inline-flex rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">{messages.directories.view}</Link></article>)}</div>}</main>;
}
