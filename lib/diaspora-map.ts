import { cache } from "react";
import { AssociationStatus, EventStatus, ProfileVisibility } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";

export interface DiasporaMapMarker {
  id: string;
  kind: "member" | "association" | "event";
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  href: string;
}

export const getDiasporaMapMarkers = cache(async (): Promise<DiasporaMapMarker[]> => {
  const [profiles, associations, events] = await Promise.all([
    prisma.profile.findMany({
      where: { visibility: ProfileVisibility.PUBLIC, city: { isNot: null } },
      select: { id: true, firstName: true, lastName: true, city: { select: { name: true, latitude: true, longitude: true, country: { select: { name: true } } } } },
      take: 200,
    }),
    prisma.association.findMany({
      where: { status: AssociationStatus.APPROVED, city: { isNot: null } },
      select: { id: true, name: true, slug: true, city: { select: { name: true, latitude: true, longitude: true, country: { select: { name: true } } } } },
      take: 200,
    }),
    prisma.event.findMany({
      where: { status: EventStatus.PUBLISHED, associationId: { not: null } },
      select: { id: true, title: true, slug: true, association: { select: { city: { select: { name: true, latitude: true, longitude: true, country: { select: { name: true } } } } } } },
      take: 200,
    }),
  ]);

  return [
    ...profiles.filter((item) => item.city).map((item) => ({ id: item.id, kind: "member" as const, name: `${item.firstName} ${item.lastName}`, city: item.city!.name, country: item.city!.country.name, latitude: item.city!.latitude, longitude: item.city!.longitude, href: `/members/${item.id}` })),
    ...associations.filter((item) => item.city).map((item) => ({ id: item.id, kind: "association" as const, name: item.name, city: item.city!.name, country: item.city!.country.name, latitude: item.city!.latitude, longitude: item.city!.longitude, href: `/associations/${item.slug}` })),
    ...events.filter((item) => item.association?.city).map((item) => ({ id: item.id, kind: "event" as const, name: item.title, city: item.association!.city!.name, country: item.association!.city!.country.name, latitude: item.association!.city!.latitude, longitude: item.association!.city!.longitude, href: `/events/${item.slug}` })),
  ];
});
