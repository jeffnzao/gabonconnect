// Fonctions d'accès aux données pour l'espace personnel (/dashboard).
//
// Contrat de sécurité : la seule entrée de ce module est un `userId` déjà
// vérifié côté serveur (Supabase session → Profile.userId). Aucune requête
// ici n'accepte de profileId venant d'ailleurs — les associations affichées
// sont toujours celles de la relation Profile.associations du profil déjà
// scopé par userId, jamais une requête associationMember indépendante qui
// pourrait accidentellement porter sur un autre profil.

import { prisma } from "@/lib/prisma";
import { LOCATION_SELECT, type MemberLocation } from "@/lib/members";
import type { AssociationListItem } from "@/lib/associations";
import { AssociationStatus, ProfileVisibility } from "@/app/generated/prisma";

export interface DashboardProfile {
  id: string;
  firstName: string;
  lastName: string;
  profession: string | null;
  bio: string | null;
  photo: string | null;
  visibility: ProfileVisibility;
  city: MemberLocation | null;
  createdAt: Date;
}

export interface DashboardData {
  profile: DashboardProfile;
  associations: AssociationListItem[];
}

/**
 * Toutes les données du dashboard en une seule requête Prisma : le profil
 * et ses adhésions (via la relation Profile.associations → AssociationMember
 * → Association) sont récupérés ensemble grâce à un `select` imbriqué,
 * plutôt que deux requêtes séparées — un seul aller-retour DB, et la
 * relation garantit structurellement qu'on ne lit que les adhésions de CE
 * profil.
 *
 * Seules les adhésions à des associations encore APPROVED sont retournées :
 * si une association repasse PENDING/REJECTED après qu'un membre l'ait
 * rejointe, elle ne doit pas réapparaître comme "active" dans le dashboard
 * (le membre reste inscrit en base — @@unique + Leave restent inchangés —
 * mais on ne l'affiche plus ici, cohérent avec la règle déjà appliquée dans
 * lib/associations.ts pour l'annuaire public).
 */
export async function getDashboardData(userId: string): Promise<DashboardData | null> {
  // Récupère d'abord le profil sans les adhésions pour éviter qu'une
  // erreur P2021 (table manquante) ne fasse chuter toute la page.
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profession: true,
      bio: true,
      photo: true,
      visibility: true,
      createdAt: true,
      city: { select: LOCATION_SELECT },
    },
  });

  if (!profile) return null;

  // Chargement séparé des adhésions : si la table `association_members`
  // n'existe pas encore (migration manquante), on capture l'erreur et
  // on renvoie une liste vide au lieu de casser la page.
  let associations: AssociationListItem[] = [];

  try {
    const memberships = await prisma.associationMember.findMany({
      where: { profileId: profile.id, association: { status: AssociationStatus.APPROVED } },
      orderBy: { createdAt: "desc" },
      select: {
        association: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            logo: true,
            city: { select: LOCATION_SELECT },
          },
        },
      },
    });

    associations = memberships.map((m) => m.association);
  } catch (err) {
    // Défensive : loggue et continue avec une liste vide. Retirer après
    // avoir appliqué la migration qui crée `association_members`.
    console.warn("Could not load association memberships:", err);
    associations = [];
  }

  return {
    profile: {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      profession: profile.profession,
      bio: profile.bio,
      photo: profile.photo,
      visibility: profile.visibility,
      city: profile.city,
      createdAt: profile.createdAt,
    },
    associations,
  };
}
