// Fonctions d'accès aux données pour la fiche publique d'une association
// (/associations/[slug]).
//
// Règle de sécurité : une association dont status !== APPROVED n'est
// jamais retournée par getAssociationBySlug(), quel que soit le slug
// fourni — même comportement que getMemberById() pour les profils PRIVATE
// (lib/members.ts) : la vérification est faite ici, côté serveur, avant
// tout rendu.

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { AssociationStatus, ProfileVisibility } from "@/app/generated/prisma/client";
import { LOCATION_SELECT, type MemberLocation, type MemberListItem } from "@/lib/members";

const MEMBER_PREVIEW_LIMIT = 6;

export interface AssociationProfileDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  city: MemberLocation | null;
  /** Jusqu'à 6 membres PUBLIC de la même ville que l'association — voir
   * la note ci-dessous sur l'absence de relation Association ↔ Profile. */
  memberPreview: MemberListItem[];
}

export const getAssociationBySlug = cache(
  async (slug: string): Promise<AssociationProfileDetail | null> => {
    const association = await prisma.association.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        logo: true,
        website: true,
        email: true,
        phone: true,
        createdAt: true,
        status: true,
        city: { select: { id: true, ...LOCATION_SELECT } },
      },
    });

    // Slug inexistant OU association pas encore approuvée : même résultat
    // (`null`) dans les deux cas, pour ne jamais laisser transparaître
    // qu'une association PENDING/REJECTED existe à ce slug.
    if (!association || association.status !== AssociationStatus.APPROVED) {
      return null;
    }

    // Le schéma actuel n'a AUCUNE relation Association ↔ Profile (pas de
    // table d'adhésion — cohérent avec "Aucune logique d'adhésion réelle").
    // Le seul lien exploitable est géographique : Association → City ←
    // Profile. L'aperçu "membres" est donc les membres PUBLIC de la même
    // ville que l'association, pas des "membres de l'association" au sens
    // strict. C'est un choix de mapping documenté ici, pas une donnée
    // inventée : on ne montre que des profils réels de cette ville.
    const memberPreview = association.city
      ? await prisma.profile.findMany({
          where: { visibility: ProfileVisibility.PUBLIC, cityId: association.city.id },
          orderBy: { firstName: "asc" },
          take: MEMBER_PREVIEW_LIMIT,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profession: true,
            photo: true,
            city: { select: LOCATION_SELECT },
          },
        })
      : [];

    return {
      id: association.id,
      slug: association.slug,
      name: association.name,
      description: association.description,
      logo: association.logo,
      website: association.website,
      email: association.email,
      phone: association.phone,
      createdAt: association.createdAt,
      city: association.city
        ? {
            name: association.city.name,
            slug: association.city.slug,
            country: association.city.country,
          }
        : null,
      memberPreview,
    };
  },
);
