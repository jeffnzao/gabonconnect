"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { ArticleCategory } from "@/app/generated/prisma";
import type { Messages } from "@/lib/i18n";

export interface NewsHubArticle {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content?: string;
  imageUrl: string | null;
  category: ArticleCategory;
  publishedAt: Date | null;
  sourceName: string | null;
  canonicalUrl: string | null;
}

const categories: ArticleCategory[] = ["GABON", "INTERNATIONAL", "DIASPORA", "STUDENTS", "CAMPUS", "OPPORTUNITIES", "POLITICS", "ECONOMY", "CULTURE", "SPORTS"];

function categoryLabel(messages: Messages, category: ArticleCategory) {
  return messages.newsHub[category.toLowerCase() as keyof Messages["newsHub"]];
}

function readTime(article: NewsHubArticle) {
  return Math.max(1, Math.ceil((article.content ?? article.summary ?? "").split(/\s+/).length / 200));
}

export default function NewsHub({ articles, messages, limit, locale = "fr" }: { articles: NewsHubArticle[]; messages: Messages; limit?: number; locale?: "fr" | "en" }) {
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | "ALL">("ALL");
  const visibleArticles = articles.filter((article) => selectedCategory === "ALL" || article.category === selectedCategory).slice(0, limit);
  const featured = visibleArticles[0];
  const rest = visibleArticles.slice(1);

  return (
    <section aria-labelledby="news-hub-title" className="border-y border-slate-100 bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">{messages.newsHub.featured}</p>
            <h2 id="news-hub-title" className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{messages.navigation.news}</h2>
          </div>
          <Link href="/news" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">{messages.newsHub.readArticle}</Link>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2" aria-label={messages.newsHub.categories}>
          <button type="button" onClick={() => setSelectedCategory("ALL")} aria-pressed={selectedCategory === "ALL"} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${selectedCategory === "ALL" ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"}`}>{messages.newsHub.allCategories}</button>
          {categories.map((category) => (
            <button key={category} type="button" onClick={() => setSelectedCategory(category)} aria-pressed={selectedCategory === category} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${selectedCategory === category ? "bg-emerald-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"}`}>{categoryLabel(messages, category)}</button>
          ))}
        </div>

        {!featured ? <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">{messages.newsHub.noResults}</p> : (
          <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <NewsCard article={featured} messages={messages} locale={locale} featured />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {rest.slice(0, 2).map((article) => <NewsCard key={article.id} article={article} messages={messages} locale={locale} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function NewsCard({ article, messages, locale, featured = false }: { article: NewsHubArticle; messages: Messages; locale: "fr" | "en"; featured?: boolean }) {
  return (
    <article className={`overflow-hidden rounded-2xl border border-slate-200 bg-white ${featured ? "lg:row-span-2" : ""}`}>
      {article.imageUrl ? <div className={`${featured ? "h-56 sm:h-72" : "h-40"} relative overflow-hidden bg-slate-100`}><Image src={article.imageUrl} alt="" fill sizes={featured ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 640px) 50vw, 100vw"} className="object-cover" unoptimized /></div> : <div className={`${featured ? "h-56 sm:h-72" : "h-40"} bg-linear-to-br from-emerald-100 via-sky-50 to-yellow-50`} aria-hidden />}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">{categoryLabel(messages, article.category)}</span>
          <time dateTime={article.publishedAt?.toISOString()} className="font-normal tracking-normal text-slate-400">{article.publishedAt?.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")}</time>
        </div>
        <h3 className={`${featured ? "text-2xl sm:text-3xl" : "text-xl"} mt-3 font-semibold tracking-tight text-slate-900`}><Link href={`/news/${article.slug}`} className="hover:text-emerald-700">{article.title}</Link></h3>
        {article.summary && <p className="mt-3 text-sm leading-6 text-slate-600">{article.summary}</p>}
        {article.sourceName && <p className="mt-4 text-xs font-semibold text-sky-700">Source : {article.sourceName}</p>}
        <p className="mt-5 text-xs text-slate-500">{readTime(article)} {messages.newsHub.readTime}</p>
      </div>
    </article>
  );
}
