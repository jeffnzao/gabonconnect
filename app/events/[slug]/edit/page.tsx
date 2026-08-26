import { notFound, redirect } from "next/navigation";
import ContentEditForm from "@/components/forms/content-edit-form";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function localDate(value: Date | null) { return value ? value.toISOString().slice(0, 16) : ""; }

export default async function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const event = await prisma.event.findFirst({ where: { slug: (await params).slug, createdById: user.id }, select: { id: true, title: true, slug: true, description: true, location: true, startDate: true, endDate: true } });
  if (!event) notFound();
  return <ContentEditForm data={{ kind: "event", id: event.id, title: event.title, slug: event.slug, description: event.description, location: event.location, startDate: localDate(event.startDate), endDate: localDate(event.endDate) }} />;
}
