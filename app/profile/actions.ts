"use server";

// Server Action pour /profile (Task 005 — My Profile & Profile Management).
//
// SÉCURITÉ : la cible de la mise à jour est `where: { userId: ensuredUser.id }`,
// dérivé uniquement de la session serveur. Aucun id de profil n'est jamais
// lu depuis le formulaire ou l'URL : il n'existe donc aucun moyen pour un
// utilisateur connecté de modifier le profil d'un autre.

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/auth";
import { ProfileVisibility } from "@/app/generated/prisma/client";

function emptyToUndefined(value: FormDataEntryValue | null): string | undefined {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : undefined;
}

const updateSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  profession: z.string().trim().max(160).optional(),
  bio: z.string().trim().max(1000).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"], {
    message: "Please choose a visibility.",
  }),
});

export async function updateProfileAction(formData: FormData) {
  // Utilisateur exclusivement dérivé de la session serveur — jamais d'un
  // champ du formulaire. Aucune session → refus explicite (redirect login).
  const ensuredUser = await ensureUser();

  if (!ensuredUser) {
    redirect("/login");
  }

  const raw = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    profession: emptyToUndefined(formData.get("profession")),
    bio: emptyToUndefined(formData.get("bio")),
    visibility: String(formData.get("visibility") ?? ""),
  };

  const parsed = updateSchema.safeParse(raw);

  if (!parsed.success) {
    redirect("/profile?error=validation");
  }

  // email, countryId, cityId, userId, profileId : jamais lus depuis
  // `formData` ci-dessus, et donc jamais transmis à Prisma — ils ne font
  // simplement pas partie de `updateSchema` ni de `data` plus bas.
  try {
    await prisma.profile.update({
      where: { userId: ensuredUser.id },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        profession: parsed.data.profession ?? null,
        bio: parsed.data.bio ?? null,
        visibility: parsed.data.visibility as ProfileVisibility,
      },
    });
  } catch (error) {
    console.error("[profile] failed to update profile:", error);
    redirect("/profile?error=save_failed");
  }

  redirect("/profile?saved=1");
}
