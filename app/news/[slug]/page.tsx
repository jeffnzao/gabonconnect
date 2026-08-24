import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/explore/breadcrumb";
import { getPublishedArticleBySlug } from "@/lib/news";

interface NewsDetailProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: NewsDetailProps): Promise<Metadata> {
  const article = await getPublishedArticleBySlug((await params).slug);
  return { title: article ? `${article.title} | GabonConnect` : "News | GabonConnect" };
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const article = await getPublishedArticleBySlug((await params).slug);
  if (!article) notFound();

  return (
    <article className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "News", href: "/news" }, { label: article.title }]} />
      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">News</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">{article.title}</h1>
      {article.publishedAt && <p className="mt-3 text-sm text-slate-500">{article.publishedAt.toLocaleDateString("en-US")}</p>}
      {article.summary && <p className="mt-8 text-lg leading-8 text-slate-600">{article.summary}</p>}
      <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-700">{article.content}</div>
    </article>
  );
}