import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, getMessages } from "@/lib/i18n";
import { isAdminRole } from "@/lib/imports";
import { manageMemberStatus } from "@/lib/actions/associations";
import { prisma } from "@/lib/prisma";
import { AssociationMemberStatus } from "@/app/generated/prisma";

export const dynamic = "force-dynamic";

export default async function AssociationDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard/associations");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, role: true } });
  if (!dbUser) redirect("/join/profile");
  const locale = await getLocale();
  const messages = getMessages(locale);
  const requests = await prisma.associationMember.findMany({ where: { status: AssociationMemberStatus.PENDING, ...(isAdminRole(dbUser.role) ? {} : { association: { members: { some: { userId: user.id, status: AssociationMemberStatus.APPROVED, role: "ADMIN" } } } }) }, orderBy: { createdAt: "asc" }, select: { id: true, associationId: true, association: { select: { name: true } }, user: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } } } });
  return <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6"><h1 className="text-3xl font-semibold tracking-tight text-slate-900">{messages.navigation.dashboard}</h1><h2 className="mt-8 text-xl font-semibold text-slate-900">{messages.directory2.members}</h2>{requests.length === 0 ? <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">{messages.directory2.noAssociations}</p> : <div className="mt-4 space-y-3">{requests.map((request) => <div key={request.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"><div><p className="font-semibold text-slate-900">{request.user.profile ? `${request.user.profile.firstName} ${request.user.profile.lastName}` : request.user.email}</p><p className="text-sm text-slate-500">{request.association.name}</p></div><div className="flex gap-2"><form action={manageMemberStatus.bind(null, request.associationId, request.id, AssociationMemberStatus.APPROVED)}><button type="submit" className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">{messages.actions.save}</button></form><form action={manageMemberStatus.bind(null, request.associationId, request.id, AssociationMemberStatus.REJECTED)}><button type="submit" className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700">{messages.actions.cancel}</button></form></div></div>)}</div>}</main>;
}
