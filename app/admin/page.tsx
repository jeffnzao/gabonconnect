import { redirect } from "next/navigation";
import { ensureUser } from "@/lib/auth";
import { isSuperAdminRole } from "@/lib/imports";
import { getPlatformMetrics, listManageableUsers } from "@/lib/actions/admin-users";
import { UserRoleManager } from "@/components/admin/user-role-manager";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string }> };

const METRIC_LABELS: Record<string, string> = {
  users: "Membres",
  admins: "Administrateurs",
  superAdmins: "Super admins",
  articles: "Articles",
  events: "Évènements",
  opportunities: "Opportunités",
  associations: "Associations",
};

export default async function AdminDashboardPage({ searchParams }: Props) {
  const user = await ensureUser();
  if (!user) redirect("/login?redirectTo=/admin");
  if (!isSuperAdminRole(user.role)) redirect("/");

  const params = await searchParams;
  const [metrics, users] = await Promise.all([getPlatformMetrics(), listManageableUsers(params.q)]);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Espace super administrateur</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Tableau de bord</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Suivez l&apos;activité de la plateforme et gérez les rôles administrateurs des membres.
        </p>
      </header>

      <section aria-label="Indicateurs de la plateforme" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5">
            <dt className="text-sm text-slate-500">{METRIC_LABELS[key] ?? key}</dt>
            <dd className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value.toLocaleString("fr-FR")}</dd>
          </div>
        ))}
      </section>

      <section aria-label="Gestion des membres" className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Gestion des rôles</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Promouvez un membre au rang d&apos;administrateur ou retirez-lui ce rôle. Les super administrateurs ne sont pas modifiables ici.
        </p>
        <UserRoleManager initialUsers={users} initialQuery={params.q ?? ""} currentUserId={user.id} />
      </section>
    </main>
  );
}
