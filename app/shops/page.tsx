import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/explore/breadcrumb";
import { getPublishedShops } from "@/lib/shops";
import { getLocale, getMessages } from "@/lib/i18n";

export const metadata: Metadata = { title: "Shops | GabonConnect" };

export default async function ShopsPage() {
  const messages = getMessages(await getLocale());
  const shops = await getPublishedShops();
  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <Breadcrumb items={[{ label: messages.common.home, href: "/" }, { label: messages.navigation.shops }]} />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">{messages.directories.shops}</h1>
          <p className="mt-2 text-sm text-slate-500">{messages.directories.shopsIntro}</p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {shops.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">{messages.directories.noShops}</p> : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => (
              <article key={shop.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">Shop</p>
                <h2 className="mt-3 text-xl font-semibold text-slate-900">{shop.name}</h2>
                {shop.association && <p className="mt-2 text-xs text-slate-400">{shop.association.name}</p>}
                {shop.description && <p className="mt-3 text-sm leading-6 text-slate-600">{shop.description}</p>}
                <Link href={`/shops/${shop.slug}`} className="mt-5 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">View shop</Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}