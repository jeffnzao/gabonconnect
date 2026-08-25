import { redirect } from "next/navigation";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { ensureUser, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/imports";
import { reviewVerification } from "@/lib/verification-actions";

export const dynamic = "force-dynamic";

export default async function VerificationAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const ensuredUser = await ensureUser();
  if (!ensuredUser || !isAdminRole(ensuredUser.role)) redirect("/");

  const profileRequests = await prisma.profile.findMany({
    where: { verificationStatus: "PENDING" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profession: true,
      verificationNotes: true,
      verificationStatus: true,
      isVerified: true,
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  const associationRequests = await prisma.association.findMany({
    where: { verificationStatus: "PENDING" },
    select: {
      id: true,
      name: true,
      slug: true,
      verificationNotes: true,
      verificationStatus: true,
      isVerified: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Verification moderation</h1>
      </header>

      <div className="space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Profiles pending verification</h2>
          <div className="mt-4 space-y-4">
            {profileRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No pending profile verification requests.</p>
            ) : (
              profileRequests.map((profile) => (
                <div key={profile.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{profile.firstName} {profile.lastName}</p>
                      {profile.profession && <p className="text-sm text-slate-500">{profile.profession}</p>}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden />
                      Pending
                    </span>
                  </div>
                  {profile.verificationNotes && <p className="mt-3 text-sm text-slate-600">{profile.verificationNotes}</p>}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <form action={reviewVerification}>
                      <input type="hidden" name="targetType" value="profile" />
                      <input type="hidden" name="targetId" value={profile.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
                        <CheckCircle2 className="h-4 w-4" aria-hidden />
                        Approve
                      </button>
                    </form>
                    <form action={reviewVerification}>
                      <input type="hidden" name="targetType" value="profile" />
                      <input type="hidden" name="targetId" value={profile.id} />
                      <input type="hidden" name="action" value="reject" />
                      <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500">
                        <XCircle className="h-4 w-4" aria-hidden />
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900">Associations pending verification</h2>
          <div className="mt-4 space-y-4">
            {associationRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No pending association verification requests.</p>
            ) : (
              associationRequests.map((association) => (
                <div key={association.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{association.name}</p>
                      <p className="text-sm text-slate-500">{association.slug}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden />
                      Pending
                    </span>
                  </div>
                  {association.verificationNotes && <p className="mt-3 text-sm text-slate-600">{association.verificationNotes}</p>}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <form action={reviewVerification}>
                      <input type="hidden" name="targetType" value="association" />
                      <input type="hidden" name="targetId" value={association.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
                        <CheckCircle2 className="h-4 w-4" aria-hidden />
                        Approve
                      </button>
                    </form>
                    <form action={reviewVerification}>
                      <input type="hidden" name="targetType" value="association" />
                      <input type="hidden" name="targetId" value={association.id} />
                      <input type="hidden" name="action" value="reject" />
                      <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500">
                        <XCircle className="h-4 w-4" aria-hidden />
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
