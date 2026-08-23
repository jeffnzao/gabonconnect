// lib/connections-actions.ts
"use server";

// Server Actions pour le networking (Task 011).
//
// SÉCURITÉ — invariant central : requesterId n'est JAMAIS lu depuis un
// champ de formulaire. Chaque action dérive l'utilisateur courant via
// ensureUser() indépendamment de la page appelante.
//
// ATOMICITÉ — les mutations sur une ligne existante (accept/reject/
// withdraw/remove, et la partie "update" de sendConnectionRequest) sont
// toutes des updateMany/deleteMany dont le `where` encode À LA FOIS
// l'identité de la ligne ET la condition d'autorisation/état. C'est du
// UPDATE...WHERE / DELETE...WHERE Postgres — atomique par construction,
// sans avoir besoin d'un $transaction ni d'un verrou explicite. Un
// findUnique() séparé suivi d'un update() aveugle est une fenêtre de
// course (deux clics rapides, ou receiver qui accepte pendant que
// requester retire) : on ne le fait plus.

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/auth";
import {
  ConnectionStatus,
  ProfileVisibility,
  Prisma,
} from "@/app/generated/prisma";
import { resolveSendRequestOutcome } from "@/lib/connections";

async function getCurrentProfileId(): Promise<string | null> {
  const ensuredUser = await ensureUser();
  if (!ensuredUser) return null;

  const profile = await prisma.profile.findUnique({
    where: { userId: ensuredUser.id },
    select: { id: true },
  });

  return profile?.id ?? null;
}

function isUniqueConstraintViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

class ConnectionCooldownError extends Error {}

/**
 * Résout l'état réel d'une paire (requester, receiver) et applique la
 * mutation Prisma correspondante. Peut se rappeler elle-même (borné) si
 * l'état a changé entre la lecture et l'écriture — c'est le mécanisme qui
 * remplace le catch générique silencieux d'avant : une violation de
 * contrainte unique (P2002, course concurrente A↔B) est traitée
 * explicitement en relisant l'état réel, pas ignorée.
 */
async function resolveConnectionRequest(
  requesterProfileId: string,
  receiverProfileId: string,
  attempt = 0,
): Promise<void> {
  if (attempt > 3) {
    throw new Error("connections: too many concurrent retries resolving request");
  }

  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId: requesterProfileId, receiverId: receiverProfileId },
        { requesterId: receiverProfileId, receiverId: requesterProfileId },
      ],
    },
  });

  const outcome = resolveSendRequestOutcome(existing, requesterProfileId);

  switch (outcome.type) {
    case "CREATE": {
      try {
        await prisma.connection.create({
          data: {
            requesterId: requesterProfileId,
            receiverId: receiverProfileId,
            status: ConnectionStatus.PENDING,
          },
        });
      } catch (error) {
        if (isUniqueConstraintViolation(error)) {
          // Une ligne a été créée entre notre lecture et notre écriture
          // (l'autre personne a envoyé au même instant) : on relit l'état
          // réel et on le résout, plutôt que d'avaler l'erreur.
          return resolveConnectionRequest(requesterProfileId, receiverProfileId, attempt + 1);
        }
        throw error; // toute autre erreur DB remonte, jamais silencieuse
      }
      return;
    }

    case "ALREADY_ACCEPTED":
    case "ALREADY_PENDING_FROM_SELF":
      return; // idempotent, no-op

    case "AUTO_ACCEPT": {
      const updated = await prisma.connection.updateMany({
        where: { id: existing!.id, status: ConnectionStatus.PENDING },
        data: { status: ConnectionStatus.ACCEPTED },
      });
      if (updated.count === 0) {
        return resolveConnectionRequest(requesterProfileId, receiverProfileId, attempt + 1);
      }
      return;
    }

    case "COOLDOWN_BLOCKED":
      throw new ConnectionCooldownError();

    case "REOPEN_PENDING": {
      const updated = await prisma.connection.updateMany({
        where: { id: existing!.id, status: ConnectionStatus.REJECTED },
        data: {
          status: ConnectionStatus.PENDING,
          requesterId: requesterProfileId,
          receiverId: receiverProfileId,
        },
      });
      if (updated.count === 0) {
        return resolveConnectionRequest(requesterProfileId, receiverProfileId, attempt + 1);
      }
      return;
    }
  }
}

export async function sendConnectionRequest(formData: FormData) {
  const receiverProfileId = String(formData.get("receiverProfileId") ?? "").trim();
  if (!receiverProfileId) {
    redirect("/members?error=invalid_target");
  }

  const requesterProfileId = await getCurrentProfileId();
  if (!requesterProfileId) {
    redirect(`/login?next=/members/${receiverProfileId}`);
  }

  if (requesterProfileId === receiverProfileId) {
    redirect(`/members/${receiverProfileId}?error=self_connect`);
  }

  const target = await prisma.profile.findUnique({
    where: { id: receiverProfileId },
    select: { id: true, visibility: true },
  });

  if (!target || target.visibility !== ProfileVisibility.PUBLIC) {
    redirect(`/members/${receiverProfileId}?error=target_unavailable`);
  }

  try {
    await resolveConnectionRequest(requesterProfileId, receiverProfileId);
  } catch (error) {
    if (error instanceof ConnectionCooldownError) {
      redirect(`/members/${receiverProfileId}?error=cooldown`);
    }
    console.error("[connections] sendConnectionRequest failed:", error);
    redirect(`/members/${receiverProfileId}?error=send_failed`);
  }

  revalidatePath(`/members/${receiverProfileId}`);
  revalidatePath("/dashboard");
  redirect(`/members/${receiverProfileId}`);
}

export async function acceptConnection(formData: FormData) {
  const connectionId = String(formData.get("connectionId") ?? "").trim();
  const currentProfileId = await getCurrentProfileId();
  if (!currentProfileId) redirect("/login");

  const updated = await prisma.connection.updateMany({
    where: {
      id: connectionId,
      receiverId: currentProfileId,
      status: ConnectionStatus.PENDING,
    },
    data: { status: ConnectionStatus.ACCEPTED },
  });

  if (updated.count === 0) {
    redirect("/dashboard?error=invalid_request");
  }

  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
    select: { requesterId: true },
  });

  revalidatePath("/dashboard");
  if (connection) revalidatePath(`/members/${connection.requesterId}`);
  redirect("/dashboard?accepted=1");
}

export async function rejectConnection(formData: FormData) {
  const connectionId = String(formData.get("connectionId") ?? "").trim();
  const currentProfileId = await getCurrentProfileId();
  if (!currentProfileId) redirect("/login");

  // Ligne CONSERVÉE (jamais supprimée) : c'est elle qui porte updatedAt,
  // utilisé pour calculer le cooldown de 7 jours.
  const updated = await prisma.connection.updateMany({
    where: {
      id: connectionId,
      receiverId: currentProfileId,
      status: ConnectionStatus.PENDING,
    },
    data: { status: ConnectionStatus.REJECTED },
  });

  if (updated.count === 0) {
    redirect("/dashboard?error=invalid_request");
  }

  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
    select: { requesterId: true },
  });

  revalidatePath("/dashboard");
  if (connection) revalidatePath(`/members/${connection.requesterId}`);
  redirect("/dashboard?rejected=1");
}

export async function withdrawConnection(formData: FormData) {
  const connectionId = String(formData.get("connectionId") ?? "").trim();
  const currentProfileId = await getCurrentProfileId();
  if (!currentProfileId) redirect("/login");

  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
    select: { receiverId: true },
  });

  const deleted = await prisma.connection.deleteMany({
    where: {
      id: connectionId,
      requesterId: currentProfileId,
      status: ConnectionStatus.PENDING,
    },
  });

  if (deleted.count === 0) {
    redirect("/dashboard?error=invalid_request");
  }

  revalidatePath("/dashboard");
  if (connection) revalidatePath(`/members/${connection.receiverId}`);
  redirect("/dashboard?withdrawn=1");
}

export async function removeConnection(formData: FormData) {
  const connectionId = String(formData.get("connectionId") ?? "").trim();
  const currentProfileId = await getCurrentProfileId();
  if (!currentProfileId) redirect("/login");

  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
    select: { requesterId: true, receiverId: true },
  });

  const deleted = await prisma.connection.deleteMany({
    where: {
      id: connectionId,
      status: ConnectionStatus.ACCEPTED,
      OR: [{ requesterId: currentProfileId }, { receiverId: currentProfileId }],
    },
  });

  if (deleted.count === 0) {
    redirect("/dashboard?error=invalid_request");
  }

  const otherProfileId =
    connection && connection.requesterId === currentProfileId
      ? connection.receiverId
      : connection?.requesterId;

  revalidatePath("/dashboard");
  if (otherProfileId) revalidatePath(`/members/${otherProfileId}`);
  redirect("/dashboard?removed=1");
}