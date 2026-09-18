"use client";

import { useState, useTransition } from "react";
import { setUserAdminRole, type ManageableUser } from "@/lib/actions/admin-users";

const ROLE_BADGE: Record<string, string> = {
  SUPERADMIN: "bg-purple-100 text-purple-700",
  ADMIN: "bg-emerald-100 text-emerald-700",
  MEMBER: "bg-slate-100 text-slate-600",
  GUEST: "bg-amber-100 text-amber-700",
};

const ROLE_LABEL: Record<string, string> = {
  SUPERADMIN: "Super admin",
  ADMIN: "Administrateur",
  MEMBER: "Membre",
  GUEST: "Invité",
};

export function UserRoleManager({ initialUsers, initialQuery, currentUserId }: { initialUsers: ManageableUser[]; initialQuery: string; currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState(initialQuery);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleRole(target: ManageableUser) {
    const makeAdmin = target.role !== "ADMIN";
    setError(null);
    setPendingId(target.id);
    startTransition(async () => {
      try {
        await setUserAdminRole(target.id, makeAdmin);
        setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, role: makeAdmin ? "ADMIN" : "MEMBER" } : u)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <div className="mt-6">
      <form method="get" className="flex gap-2">
        <input
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher par nom ou e-mail"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
          aria-label="Rechercher un membre"
        />
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
          Rechercher
        </button>
      </form>

      {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {users.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">Aucun membre trouvé.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-150 text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Membre</th>
                <th className="px-4 py-3 font-semibold">Rôle</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isSelf = u.id === currentUserId;
                const isSuper = u.role === "SUPERADMIN";
                const busy = isPending && pendingId === u.id;
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{u.name ?? "—"}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_BADGE[u.role] ?? "bg-slate-100 text-slate-600"}`}>
                        {ROLE_LABEL[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isSelf || isSuper ? (
                        <span className="text-xs text-slate-400">{isSelf ? "Vous" : "Protégé"}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleRole(u)}
                          disabled={busy}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          {busy ? "..." : u.role === "ADMIN" ? "Retirer admin" : "Promouvoir admin"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
