// app/dashboard/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { ensureUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getIncomingConnectionRequests,
  getAcceptedConnections,
} from "@/lib/connections";
import {
  acceptConnection,
  rejectConnection,
  removeConnection,
} from "@/lib/connections-actions";

export default async function DashboardPage() {
  const user = await ensureUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, firstName: true, lastName: true },
  });

  if (!profile) redirect("/onboarding");

  const [incomingRequests, connections] = await Promise.all([
    getIncomingConnectionRequests(profile.id),
    getAcceptedConnections(profile.id),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold">
        Bonjour, {profile.firstName} {profile.lastName}
      </h1>

      {/* SECTION 1: DEMANDES DE CONNEXION EN ENTRANTE */}
      <section className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-4">
          Demandes de connexion ({incomingRequests.length})
        </h2>
        {incomingRequests.length === 0 ? (
          <p className="text-muted-foreground">Aucune demande en attente.</p>
        ) : (
          <div className="divide-y">
            {incomingRequests.map((req) => (
              <div
                key={req.connectionId}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <Link
                    href={`/members/${req.requester.id}`}
                    className="font-medium hover:underline"
                  >
                    {req.requester.firstName} {req.requester.lastName}
                  </Link>
                  {req.requester.profession && (
                    <p className="text-sm text-muted-foreground">
                      {req.requester.profession}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <form action={acceptConnection}>
                    <input
                      type="hidden"
                      name="connectionId"
                      value={req.connectionId}
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90"
                    >
                      Accepter
                    </button>
                  </form>
                  <form action={rejectConnection}>
                    <input
                      type="hidden"
                      name="connectionId"
                      value={req.connectionId}
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 text-sm border rounded-md hover:bg-muted"
                    >
                      Refuser
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: RÉSEAU DE CONNEXIONS ACCEPTÉES */}
      <section className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-4">
          Mes connexions ({connections.length})
        </h2>
        {connections.length === 0 ? (
          <p className="text-muted-foreground">
            Vous n'avez pas encore de connexion active.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {connections.map((conn) => (
              <div
                key={conn.connectionId}
                className="border p-4 rounded-md flex items-center justify-between"
              >
                <div>
                  <Link
                    href={`/members/${conn.profile.id}`}
                    className="font-medium hover:underline block"
                  >
                    {conn.profile.firstName} {conn.profile.lastName}
                  </Link>
                  {conn.profile.profession && (
                    <p className="text-sm text-muted-foreground">
                      {conn.profile.profession}
                    </p>
                  )}
                </div>
                <form action={removeConnection}>
                  <input
                    type="hidden"
                    name="connectionId"
                    value={conn.connectionId}
                  />
                  <button
                    type="submit"
                    className="text-xs text-destructive hover:underline"
                  >
                    Retirer
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}