import type { Metadata } from "next";
import { redirect } from "next/navigation";

import ShopCreateForm from "@/components/forms/shop-create-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create shop | GabonConnect",
};

export default async function ShopsCreatePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/shops/create");
  }

  return <ShopCreateForm />;
}
