import { notFound, redirect } from "next/navigation";
import ContentEditForm from "@/components/forms/content-edit-form";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditNewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const article = await prisma.article.findFirst({ where: { slug: (await params).slug, authorId: user.id }, select: { id: true, title: true, slug: true, summary: true, content: true } });
  if (!article) notFound();
  return <ContentEditForm data={{ kind: "article", id: article.id, title: article.title, slug: article.slug, summary: article.summary ?? "", description: article.content }} />;
}
