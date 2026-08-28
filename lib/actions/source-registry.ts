"use server";

import { SourceRegistryType } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/imports";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const sourceSchema = z.object({
  name: z.string().trim().min(1).max(160),
  url: z.string().trim().url().refine((value) => value.startsWith("https://"), "Source URL must use HTTPS."),
  type: z.nativeEnum(SourceRegistryType),
  country: z.string().trim().length(2).default("GA"),
  language: z.string().trim().min(2).max(12).default("fr"),
  rssUrl: z.string().trim().url().optional().or(z.literal("")),
  reliability: z.coerce.number().min(1).max(5),
  termsUrl: z.string().trim().url().optional().or(z.literal("")),
});

async function requireAdmin() {
  const user = await ensureUser();
  if (!user || !isAdminRole(user.role)) throw new Error("Admin access required.");
  return user;
}

function normalize(data: z.infer<typeof sourceSchema>) {
  return {
    ...data,
    country: data.country.toUpperCase(),
    language: data.language.toLowerCase(),
    rssUrl: data.rssUrl || null,
    termsUrl: data.termsUrl || null,
  };
}

export async function listSourceRegistry(options: { page?: number; pageSize?: number; query?: string; type?: SourceRegistryType; active?: boolean } = {}) {
  await requireAdmin();
  const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 20));
  const page = Math.max(1, Math.floor(options.page ?? 1));
  const query = options.query?.trim();
  const where = {
    ...(options.type ? { type: options.type } : {}),
    ...(typeof options.active === "boolean" ? { active: options.active } : {}),
    ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" as const } }, { url: { contains: query, mode: "insensitive" as const } }, { country: { contains: query, mode: "insensitive" as const } }] } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.sourceRegistry.findMany({ where, orderBy: { name: "asc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.sourceRegistry.count({ where }),
  ]);
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getSourceRegistry(id: string) {
  await requireAdmin();
  return prisma.sourceRegistry.findUnique({ where: { id: z.string().cuid().parse(id) } });
}

export async function createSourceRegistry(input: unknown) {
  await requireAdmin();
  const data = normalize(sourceSchema.parse(input));
  const source = await prisma.sourceRegistry.create({ data });
  revalidatePath("/admin/sources");
  return source;
}

export async function updateSourceRegistry(id: string, input: unknown) {
  await requireAdmin();
  const sourceId = z.string().cuid().parse(id);
  const data = normalize(sourceSchema.parse(input));
  const source = await prisma.sourceRegistry.update({ where: { id: sourceId }, data });
  revalidatePath("/admin/sources");
  return source;
}

export async function setSourceRegistryActive(id: string, active: boolean): Promise<void> {
  await requireAdmin();
  const sourceId = z.string().cuid().parse(id);
  await prisma.sourceRegistry.update({ where: { id: sourceId }, data: { active } });
  revalidatePath("/admin/sources");
}

export async function deleteSourceRegistry(id: string): Promise<void> {
  await requireAdmin();
  const sourceId = z.string().cuid().parse(id);
  await prisma.sourceRegistry.delete({ where: { id: sourceId } });
  revalidatePath("/admin/sources");
}

export async function createSourceRegistryFromForm(formData: FormData): Promise<void> {
  await createSourceRegistry({
    name: formData.get("name"), url: formData.get("url"), type: formData.get("type"), country: formData.get("country"), language: formData.get("language"), rssUrl: formData.get("rssUrl"), reliability: formData.get("reliability"), termsUrl: formData.get("termsUrl"),
  });
}

export async function updateSourceRegistryFromForm(id: string, formData: FormData): Promise<void> {
  await updateSourceRegistry(id, {
    name: formData.get("name"), url: formData.get("url"), type: formData.get("type"), country: formData.get("country"), language: formData.get("language"), rssUrl: formData.get("rssUrl"), reliability: formData.get("reliability"), termsUrl: formData.get("termsUrl"),
  });
}
