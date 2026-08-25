// Fonctions d'accès aux données pour la fiche publique d'une association
// (/associations/[slug]).

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { AssociationStatus, ProfileVisibility } from "@/app/generated/prisma";
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
  isVerified?: boolean;
  createdAt: Date;
  city: MemberLocation | null;
  memberPreview: MemberListItem[];
  memberCount: number;
  isJoined: boolean;
}

export const getAssociationBySlug = cache(
  async (
    slug: string, 
    viewerProfileId?: string | null // On accepte le viewerProfileId optionnel
  ): Promise<AssociationProfileDetail | null> => {
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
        isVerified: true,
        createdAt: true,
        status: true,
        city: { select: { id: true, ...LOCATION_SELECT } },
      },
    });

    // Slug inexistant OU association pas encore approuvée
    if (!association || association.status !== AssociationStatus.APPROVED) {
      return null;
    }

    // 1. Aperçu des membres de la ville
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

    // 2. Nombre réel de membres dans la table de jointure
    let memberCount = 0;
    try {
      if (prisma.associationMember && typeof prisma.associationMember.count === "function") {
        memberCount = await prisma.associationMember.count({
          where: { associationId: association.id },
        });
      } else {
        // Defensive fallback when the generated client accessor is missing.
        console.warn("[lib/association-profile] prisma.associationMember.count unavailable, returning 0");
      }
    } catch (err) {
      // Catch Prisma runtime errors (e.g. P2021 TableDoesNotExist) and avoid
      // crashing the server in development. Log for diagnosis and continue.
      console.warn("[lib/association-profile] failed to count association members:", err);
      memberCount = 0;
    }

    // 3. Est-ce que le viewer connecté est membre ?
    let isJoined = false;
    if (viewerProfileId) {
      const membership = await prisma.associationMember.findUnique({
        where: {
          associationId_profileId: {
            associationId: association.id,
            profileId: viewerProfileId,
          },
        },
        select: { id: true },
      });
      isJoined = !!membership;
    }

    return {
      id: association.id,
      slug: association.slug,
      name: association.name,
      description: association.description,
      logo: association.logo,
      website: association.website,
      email: association.email,
      phone: association.phone,
      isVerified: association.isVerified,
      createdAt: association.createdAt,
      city: association.city
        ? {
            name: association.city.name,
            slug: association.city.slug,
            country: association.city.country,
          }
        : null,
      memberPreview,
      memberCount,
      isJoined,
    };
  }
);