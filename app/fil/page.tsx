import Link from "next/link";
import { redirect } from "next/navigation";
import { getPersonalizedFeed, type FeedItem } from "@/lib/personalized-feed";

export const dynamic = "force-dynamic";

export default async function PersonalizedFeedPage() {
  let feed;
  try { feed = await getPersonalizedFeed(); } catch (error) { if (error instanceof Error && error.message === "Authentication required.") redirect("/login?redirectTo=/fil"); throw error; }
  const groups: Array<[string, FeedItem[]]> = [["Opportunites", feed.sections.opportunities], ["Evenements", feed.sections.events], ["Demarches", feed.sections.procedures], ["Actualites", feed.sections.news], ["Bourses", feed.sections.scholarships]];
  return <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12"><header className="border-b border-slate-200 pb-7"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Personnalise pour vous</p><h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Mon Fil</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Selection selon votre statut, votre localisation et vos centres d'interet.</p><Link href="/profile" className="mt-4 inline-block text-sm font-semibold text-emerald-700 underline underline-offset-4">Modifier mes preferences</Link></header><div className="mt-8 grid gap-8">{groups.map(([title, items]) => <section key={title}><h2 className="text-xl font-semibold text-slate-900">{title}</h2>{items.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{items.map((item) => <Link key={item.id} href={item.href} className="border border-slate-200 bg-white p-4 hover:border-emerald-300"><p className="text-xs font-semibold text-emerald-700">{item.reason}</p><h3 className="mt-2 font-semibold text-slate-900">{item.title}</h3><p className="mt-1 text-sm text-slate-600">{item.detail}</p></Link>)}</div> : <p className="mt-3 text-sm text-slate-500">Aucun contenu correspondant pour le moment.</p>}</section>)}</div></main>;
}