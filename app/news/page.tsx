import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/explore/breadcrumb";
import { getPublishedArticles } from "@/lib/news";

export const metadata: Metadata = { title: "News | GabonConnect" };

export default async function NewsPage() {
  const articles = await getPublishedArticles();

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "News" }]} />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">News</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Stories, updates, and useful information from the GabonConnect community.</p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {articles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">No published stories yet.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article key={article.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">News</p>
                <h2 className="mt-3 text-xl font-semibold text-slate-900">{article.title}</h2>
                {article.summary && <p className="mt-3 text-sm leading-6 text-slate-600">{article.summary}</p>}
                <p className="mt-5 text-xs text-slate-400">{article.publishedAt?.toLocaleDateString("en-US")}</p>
                <Link href={`/news/${article.slug}`} className="mt-5 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">Read story</Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}