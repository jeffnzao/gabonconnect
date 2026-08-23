// lib/connections.ts
//
// Accès données + logique métier PURE pour le networking (Task 011).
//
// Pas de "use server" ici : ce module n'exporte que des lectures et des
// fonctions pures, appelées depuis des Server Components (member profile,
// dashboard) ET depuis lib/connections-actions.ts (Server Actions,
// fichier séparé). Un module "use server" ne peut exporter QUE des
// fonctions async invocables comme Server Action — mélanger ça avec des
// exports sync (computeCooldownEndsAt, isCooldownActive) ou des types
// casse le build. Voir lib/connections-actions.ts pour les mutations.

import { prisma } from "@/lib/prisma";
import { ConnectionStatus } from "@/app/generated/prisma";
import { LOCATION_SELECT, type MemberLocation } from "@/lib/members";

export const COOLDOWN_DAYS = 7;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

/** Pure, sans DB. */
export function computeCooldownEndsAt(rejectedAt: Date): Date {
  return new Date(rejectedAt.getTime() + COOLDOWN_MS);
}

/** Pure, sans DB. Synchrone — ne JAMAIS la rendre async (voir bug historique
 * où `if (isCooldownActive(x))` était toujours truthy car x est un Promise). */
export function isCooldownActive(rejectedAt: Date, now: Date = new Date()): boolean {
  return computeCooldownEndsAt(rejectedAt) > now;
}

// ────────────────────────────────────────────────────────────────
// État d'une relation entre le viewer courant et un profil cible
// (shape canonique — consommée telle quelle par ConnectButton)
// ────────────────────────────────────────────────────────────────

export type ConnectionState =
  | { status: "NOT_CONNECTED" }
  | { status: "PENDING_OUTGOING"; connectionId: string }
  | { status: "PENDING_INCOMING"; connectionId: string }
  | { status: "ACCEPTED"; connectionId: string }
  | { status: "REJECTED_COOLDOWN"; connectionId: string; cooldownEndsAt: Date }
  | { status: "REJECTED_AVAILABLE"; connectionId: string };

export async function getConnectionState(
  viewerProfileId: string | null,
  targetProfileId: string,
): Promise<ConnectionState> {
  if (!viewerProfileId || viewerProfileId === targetProfileId) {
    return { status: "NOT_CONNECTED" };
  }

  const connection = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId: viewerProfileId, receiverId: targetProfileId },
        { requesterId: targetProfileId, receiverId: viewerProfileId },
      ],
    },
  });

  if (!connection) return { status: "NOT_CONNECTED" };

  if (connection.status === ConnectionStatus.ACCEPTED) {
    return { status: "ACCEPTED", connectionId: connection.id };
  }

  if (connection.status === ConnectionStatus.PENDING) {
    return connection.requesterId === viewerProfileId
      ? { status: "PENDING_OUTGOING", connectionId: connection.id }
      : { status: "PENDING_INCOMING", connectionId: connection.id };
  }

  // REJECTED
  return isCooldownActive(connection.updatedAt)
    ? {
        status: "REJECTED_COOLDOWN",
        connectionId: connection.id,
        cooldownEndsAt: computeCooldownEndsAt(connection.updatedAt),
      }
    : { status: "REJECTED_AVAILABLE", connectionId: connection.id };
}

// ────────────────────────────────────────────────────────────────
// Décision pure pour sendConnectionRequest — testable sans DB.
// lib/connections-actions.ts traduit ces outcomes en opérations Prisma.
// ────────────────────────────────────────────────────────────────

export type SendRequestOutcome =
  | { type: "CREATE" }
  | { type: "ALREADY_PENDING_FROM_SELF" }
  | { type: "AUTO_ACCEPT" }
  | { type: "ALREADY_ACCEPTED" }
  | { type: "COOLDOWN_BLOCKED"; cooldownEndsAt: Date }
  | { type: "REOPEN_PENDING" };

export function resolveSendRequestOutcome(
  existing: { requesterId: string; status: ConnectionStatus; updatedAt: Date } | null,
  requesterProfileId: string,
  now: Date = new Date(),
): SendRequestOutcome {
  if (!existing) return { type: "CREATE" };

  if (existing.status === ConnectionStatus.ACCEPTED) {
    return { type: "ALREADY_ACCEPTED" };
  }

  if (existing.status === ConnectionStatus.PENDING) {
    return existing.requesterId === requesterProfileId
      ? { type: "ALREADY_PENDING_FROM_SELF" }
      : { type: "AUTO_ACCEPT" };
  }

  // REJECTED
  return isCooldownActive(existing.updatedAt, now)
    ? { type: "COOLDOWN_BLOCKED", cooldownEndsAt: computeCooldownEndsAt(existing.updatedAt) }
    : { type: "REOPEN_PENDING" };
}

// ────────────────────────────────────────────────────────────────
// Dashboard : demandes entrantes + connexions acceptées
// ────────────────────────────────────────────────────────────────

const CONNECTION_PROFILE_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  profession: true,
  photo: true,
  city: { select: LOCATION_SELECT },
} as const;

export interface IncomingConnectionRequest {
  connectionId: string;
  createdAt: Date;
  requester: {
    id: string;
    firstName: string;
    lastName: string;
    profession: string | null;
    photo: string | null;
    city: MemberLocation | null;
  };
}

export async function getIncomingConnectionRequests(
  profileId: string,
): Promise<IncomingConnectionRequest[]> {
  const rows = await prisma.connection.findMany({
    where: { receiverId: profileId, status: ConnectionStatus.PENDING },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      requester: { select: CONNECTION_PROFILE_SELECT },
    },
  });

  return rows.map((row) => ({
    connectionId: row.id,
    createdAt: row.createdAt,
    requester: row.requester,
  }));
}

export interface AcceptedConnection {
  connectionId: string;
  connectedAt: Date;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    profession: string | null;
    photo: string | null;
    city: MemberLocation | null;
  };
}

export async function getAcceptedConnections(profileId: string): Promise<AcceptedConnection[]> {
  const rows = await prisma.connection.findMany({
    where: {
      status: ConnectionStatus.ACCEPTED,
      OR: [{ requesterId: profileId }, { receiverId: profileId }],
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      updatedAt: true,
      requesterId: true,
      requester: { select: CONNECTION_PROFILE_SELECT },
      receiver: { select: CONNECTION_PROFILE_SELECT },
    },
  });

  return rows.map((row) => ({
    connectionId: row.id,
    connectedAt: row.updatedAt,
    // Toujours l'AUTRE participant, jamais soi-même.
    profile: row.requesterId === profileId ? row.receiver : row.requester,
  }));
}