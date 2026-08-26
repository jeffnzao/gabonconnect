import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/explore/breadcrumb";
import { getPublishedShopBySlug } from "@/lib/shops";
import { getLocale, getMessages } from "@/lib/i18n";

interface ShopDetailProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: ShopDetailProps): Promise<Metadata> {
  const shop = await getPublishedShopBySlug((await params).slug);
  return { title: shop ? `${shop.name} | GabonConnect` : "Shops | GabonConnect" };
}

export default async function ShopDetailPage({ params }: ShopDetailProps) {
  const messages = getMessages(await getLocale());
  const shop = await getPublishedShopBySlug((await params).slug);
  if (!shop) notFound();
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <Breadcrumb items={[{ label: messages.common.home, href: "/" }, { label: messages.navigation.shops, href: "/shops" }, { label: shop.name }]} />
      <h1 className="mt-10 text-4xl font-semibold tracking-tight text-slate-900">{shop.name}</h1>
      {shop.association && <p className="mt-2 text-sm text-slate-500">{shop.association.name}</p>}
      {shop.description && <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{shop.description}</p>}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">{messages.directories.catalog}</h2>
        {shop.products.length === 0 ? <p className="mt-4 text-sm text-slate-500">{messages.directories.noProducts}</p> : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shop.products.map((product) => <article key={product.id} className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-semibold text-slate-900">{product.name}</h3>{product.description && <p className="mt-2 text-sm text-slate-600">{product.description}</p>}{product.price !== null && <p className="mt-4 text-sm font-semibold text-emerald-700">{product.price.toString()}</p>}</article>)}
          </div>
        )}
      </section>
    </div>
  );
}