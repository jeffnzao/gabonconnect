import type { Metadata } from "next";
import { redirect } from "next/navigation";

import NewsCreateForm from "@/components/forms/news-create-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create news | GabonConnect",
};

export default async function NewsCreatePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/news/create");
  }

  return <NewsCreateForm />;
}
