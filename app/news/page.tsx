import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/explore/breadcrumb";
import NewsHub, { type NewsHubArticle } from "@/components/news/news-hub";
import { ArticleCategory } from "@/app/generated/prisma";
import { getPublishedArticles } from "@/lib/news";
import { getLocale, getMessages } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const messages = getMessages(await getLocale());
  return { title: messages.directories.news, description: messages.directories.newsIntro };
}

type NewsPageProps = { searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }> };
const categories = Object.values(ArticleCategory);

type NewsParams = { q?: string; category?: string; sort?: string };

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const params = await searchParams;
  const category = categories.includes(params.category as ArticleCategory) ? params.category as ArticleCategory : undefined;
  const sort = params.sort === "popular" ? "popular" : "recent";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const pageSize = 9;
  const allArticles = await getPublishedArticles({ query: params.q, category, sort, pageSize: 500 });
  const articles = allArticles.slice((page - 1) * pageSize, page * pageSize) as NewsHubArticle[];
  const totalPages = Math.max(1, Math.ceil(allArticles.length / pageSize));

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <Breadcrumb items={[{ label: messages.common.home, href: "/" }, { label: messages.navigation.news }]} />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{messages.directories.news}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">{messages.directories.newsIntro}</p>
          <form method="get" className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
            <label className="sr-only" htmlFor="news-query">{messages.newsHub.search}</label>
            <input id="news-query" name="q" defaultValue={params.q} placeholder={messages.newsHub.searchPlaceholder} className="min-w-0 rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500" />
            <select name="category" defaultValue={category ?? ""} aria-label={messages.newsHub.categories} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">
              <option value="">{messages.newsHub.allCategories}</option>
              {categories.map((item) => <option key={item} value={item}>{messages.newsHub[item.toLowerCase() as keyof typeof messages.newsHub]}</option>)}
            </select>
            <select name="sort" defaultValue={sort} aria-label={messages.newsHub.sort} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">
              <option value="recent">{messages.newsHub.recent}</option>
              <option value="popular">{messages.newsHub.popular}</option>
            </select>
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">{messages.newsHub.search}</button>
          </form>
        </div>
      </section>
      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {articles.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">{messages.newsHub.noResults}</p> : <NewsHub articles={articles} messages={messages} locale={locale} />}
        <nav aria-label={messages.newsHub.featured} className="mt-8 flex items-center justify-between gap-4 text-sm">
          <PageLink disabled={page <= 1} href={pageHref(page - 1, params)} label={messages.newsHub.previous} />
          <span className="text-slate-500">{page} / {totalPages}</span>
          <PageLink disabled={page >= totalPages} href={pageHref(page + 1, params)} label={messages.newsHub.next} />
        </nav>
      </section>
    </div>
  );
}

function pageHref(page: number, params: NewsParams) {
  const values = new URLSearchParams();
  if (params.q) values.set("q", params.q);
  if (params.category) values.set("category", params.category);
  if (params.sort) values.set("sort", params.sort);
  values.set("page", String(page));
  return `?${values}`;
}

function PageLink({ disabled, href, label }: { disabled: boolean; href: string; label: string }) {
  return <Link aria-disabled={disabled} href={href} className={`rounded-lg border px-3 py-2 font-semibold ${disabled ? "pointer-events-none border-slate-100 text-slate-300" : "border-slate-200 text-slate-700 hover:bg-white"}`}>{label}</Link>;
}
