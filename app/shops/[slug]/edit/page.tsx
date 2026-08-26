import { notFound, redirect } from "next/navigation";
import ContentEditForm from "@/components/forms/content-edit-form";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const shop = await prisma.shop.findFirst({ where: { slug: (await params).slug, ownerId: user.id }, select: { id: true, name: true, slug: true, description: true } });
  if (!shop) notFound();
  return <ContentEditForm data={{ kind: "shop", id: shop.id, title: shop.name, slug: shop.slug, description: shop.description ?? "" }} />;
}
