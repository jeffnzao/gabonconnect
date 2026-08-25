import type { Metadata } from "next";
import { redirect } from "next/navigation";

import OpportunityCreateForm from "@/components/forms/opportunity-create-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create opportunity | GabonConnect",
};

export default async function OpportunitiesCreatePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/opportunities/create");
  }

  return <OpportunityCreateForm />;
}
