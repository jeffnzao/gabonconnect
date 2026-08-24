import { cache } from "react";
import { isMissingTableError, prisma } from "@/lib/prisma";
import { ProductStatus, ShopStatus } from "@/app/generated/prisma";

const PUBLIC_SHOP = { status: ShopStatus.PUBLISHED } as const;

export const getPublishedShops = cache(async () => {
  try {
    return await prisma.shop.findMany({
      where: PUBLIC_SHOP,
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true, description: true, association: { select: { name: true } } },
    });
  } catch (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
});

export const getPublishedShopBySlug = cache(async (slug: string) => {
  try {
    return await prisma.shop.findFirst({
      where: { ...PUBLIC_SHOP, slug },
      select: { id: true, slug: true, name: true, description: true, association: { select: { name: true } }, products: { where: { status: ProductStatus.PUBLISHED }, orderBy: { name: "asc" }, select: { id: true, name: true, description: true, imageUrl: true, price: true } } },
    });
  } catch (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }
});