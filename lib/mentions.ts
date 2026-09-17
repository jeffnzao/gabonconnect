import { prisma } from "@/lib/prisma";

// Un pseudo mentionne correspond au nom public d'un profil, normalise en slug (@jean-dupont).
const MENTION_PATTERN = /@([a-z0-9][a-z0-9-]{1,60})/gi;

/** Normalise un nom (accents, casse, espaces) vers un slug comparable aux mentions. */
export function slugifyName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractMentionSlugs(content: string): string[] {
  const slugs = new Set<string>();
  for (const match of content.matchAll(MENTION_PATTERN)) {
    slugs.add(match[1].toLowerCase());
  }
  return [...slugs];
}

/** Resout les @pseudo d'un texte vers les identifiants d'utilisateurs, en excluant l'auteur. */
export async function resolveMentionedUserIds(content: string, excludeUserId?: string): Promise<string[]> {
  const slugs = new Set(extractMentionSlugs(content));
  if (slugs.size === 0) return [];
  const profiles = await prisma.profile.findMany({
    select: { userId: true, firstName: true, lastName: true },
  });
  const matched = profiles
    .filter((profile) => slugs.has(slugifyName(`${profile.firstName} ${profile.lastName}`)))
    .map((profile) => profile.userId)
    .filter((userId) => userId !== excludeUserId);
  return [...new Set(matched)];
}
