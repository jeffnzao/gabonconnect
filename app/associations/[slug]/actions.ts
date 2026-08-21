"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/auth";
import { AssociationStatus } from "@/app/generated/prisma/client";

export interface MembershipState {
  joined: boolean;
  memberCount: number;
  error: string | null;
}

/**
 * Dérive TOUJOURS le profileId de la session serveur — jamais du formulaire
 * ni d'un argument client. C'est le même contrat que updateProfileAction()
 * dans app/profile/actions.ts (ensureUser() → userId vérifié → profile).
 */
async function requireOwnProfileId(): Promise<string> {
  const ensuredUser = await ensureUser();
  if (!ensuredUser) {
    throw new Error("Please log in to join an association.");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: ensuredUser.id },
    select: { id: true },
  });

  if (!profile) {
    throw new Error("Complete your profile before joining an association.");
  }

  return profile.id;
}

/**
 * Action unique pour join/leave, pilotée par useActionState côté client
 * (voir components/associations/join-button.tsx). `associationId` est lié
 * via .bind() — c'est un identifiant public de page, pas une donnée
 * d'autorisation ; l'autorisation réelle (propriétaire, statut APPROVED)
 * est entièrement revérifiée ici, côté serveur, à chaque appel.
 */
export async function toggleMembershipAction(
  associationId: string,
  prevState: MembershipState,
  formData: FormData,
): Promise<MembershipState> {
  const intent = formData.get("intent") === "leave" ? "leave" : "join";

  try {
    const profileId = await requireOwnProfileId();

    if (intent === "join") {
      const association = await prisma.association.findUnique({
        where: { id: associationId },
        select: { status: true, slug: true },
      });

      if (!association || association.status !== AssociationStatus.APPROVED) {
        throw new Error("This association isn't open to new members right now.");
      }

      // upsert sur la contrainte @@unique([associationId, profileId]) :
      // anti-doublon garanti par la base, pas par un "check puis insert"
      // applicatif qui serait sujet à une race condition.
      await prisma.associationMember.upsert({
        where: { associationId_profileId: { associationId, profileId } },
        create: { associationId, profileId },
        update: {},
      });

      revalidatePath(`/associations/${association.slug}`);
    } else {
      const association = await prisma.association.findUnique({
        where: { id: associationId },
        select: { slug: true },
      });

      // Quitter n'est PAS conditionné à APPROVED : un membre doit pouvoir
      // se retirer même si l'association a été repassée PENDING/REJECTED
      // entre-temps. Dis-moi si tu veux au contraire bloquer ce cas.
      await prisma.associationMember.deleteMany({
        where: { associationId, profileId },
      });

      if (association) {
        revalidatePath(`/associations/${association.slug}`);
      }
    }

    const [memberCount, membership] = await Promise.all([
      prisma.associationMember.count({ where: { associationId } }),
      prisma.associationMember.findUnique({
        where: { associationId_profileId: { associationId, profileId } },
        select: { id: true },
      }),
    ]);

    return { joined: Boolean(membership), memberCount, error: null };
  } catch (err) {
    const memberCount = await prisma.associationMember.count({
      where: { associationId },
    });

    return {
      joined: prevState.joined,
      memberCount,
      error: err instanceof Error ? err.message : "Something went wrong.",
    };
  }
}