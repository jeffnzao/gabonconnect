"use server";

import { revalidatePath } from "next/cache";
import { ensureUser } from "@/lib/auth";
import { isSuperAdminRole } from "@/lib/imports";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma";

async function requireSuperAdmin() {
  const user = await ensureUser();
  if (!user || !isSuperAdminRole(user.role)) throw new Error("Super admin access required.");
  return user;
}

export type ManageableUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
};

export async function listManageableUsers(query?: string): Promise<ManageableUser[]> {
  await requireSuperAdmin();
  const search = query?.trim();
  const contains = search ? { contains: search, mode: "insensitive" as const } : undefined;
  return prisma.user.findMany({
    where: search ? { OR: [{ email: contains }, { name: contains }] } : undefined,
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    take: 100,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
}

export async function getPlatformMetrics() {
  await requireSuperAdmin();
  const [users, admins, superAdmins, articles, events, opportunities, associations] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.user.count({ where: { role: Role.SUPERADMIN } }),
    prisma.article.count(),
    prisma.event.count(),
    prisma.opportunity.count(),
    prisma.association.count(),
  ]);
  return { users, admins, superAdmins, articles, events, opportunities, associations };
}

// Un SUPERADMIN peut promouvoir un MEMBER en ADMIN ou retrograder un ADMIN en MEMBER.
// Les autres SUPERADMIN ne sont pas modifiables via cette action.
export async function setUserAdminRole(userId: string, makeAdmin: boolean): Promise<void> {
  const actor = await requireSuperAdmin();
  if (userId === actor.id) throw new Error("You cannot change your own role.");
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target) throw new Error("User not found.");
  if (target.role === Role.SUPERADMIN) throw new Error("Super admins cannot be modified here.");
  await prisma.user.update({ where: { id: userId }, data: { role: makeAdmin ? Role.ADMIN : Role.MEMBER } });
  revalidatePath("/admin");
}

export async function setUserAdminRoleFromForm(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "");
  const makeAdmin = String(formData.get("makeAdmin") ?? "") === "true";
  if (!userId) throw new Error("Missing user id.");
  await setUserAdminRole(userId, makeAdmin);
}
