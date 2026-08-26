import { notFound, redirect } from "next/navigation";
import ContentEditForm from "@/components/forms/content-edit-form";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditOpportunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const opportunity = await prisma.opportunity.findFirst({ where: { slug: (await params).slug, createdById: user.id }, select: { id: true, title: true, slug: true, description: true, location: true } });
  if (!opportunity) notFound();
  return <ContentEditForm data={{ kind: "opportunity", id: opportunity.id, title: opportunity.title, slug: opportunity.slug, description: opportunity.description, location: opportunity.location }} />;
}
