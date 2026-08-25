import type { Metadata } from "next";
import { redirect } from "next/navigation";

import EventCreateForm from "@/components/forms/event-create-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create event | GabonConnect",
};

export default async function EventsCreatePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/events/create");
  }

  return <EventCreateForm />;
}
