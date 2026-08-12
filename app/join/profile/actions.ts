"use server";

// Server Action pour /join/profile.
//
// SÉCURITÉ (critique) : l'utilisateur cible n'est JAMAIS déterminé à partir
// d'un champ du formulaire. On appelle `getCurrentUser()` / `ensureUser()`
// côté serveur pour obtenir l'id Supabase Auth de la requête en cours, et
// c'est cet id — jamais une valeur envoyée par le navigateur — qui sert de
// `userId` pour le `Profile` créé.

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/auth";
import { Prisma, ProfileVisibility } from "@/app/generated/prisma/client";

/** "" → undefined, pour que les champs texte optionnels passent `.optional()`. */
function emptyToUndefined(value: FormDataEntryValue | null): string | undefined {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : undefined;
}

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  countryId: z.string().min(1, "Please select your country."),
  cityId: z.string().min(1, "Please select your city."),
  profession: z.string().trim().max(160).optional(),
  bio: z.string().trim().max(1000).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"], {
    message: "Please choose a visibility.",
  }),
});

function mapZodErrorToCode(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "validation";

  switch (issue.path[0]) {
    case "firstName":
    case "lastName":
      return "missing_name";
    case "countryId":
    case "cityId":
      return "missing_location";
    case "visibility":
      return "missing_visibility";
    default:
      return "validation";
  }
}

export async function createProfileAction(formData: FormData) {
  // 1. Qui est réellement connecté·e ? Jamais déduit du formulaire.
  const ensuredUser = await ensureUser();

  if (!ensuredUser) {
    redirect("/join/account");
  }

  // 2. Validation Zod des champs du formulaire.
  const raw = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    countryId: String(formData.get("countryId") ?? ""),
    cityId: String(formData.get("cityId") ?? ""),
    profession: emptyToUndefined(formData.get("profession")),
    bio: emptyToUndefined(formData.get("bio")),
    visibility: String(formData.get("visibility") ?? ""),
  };

  const parsed = profileSchema.safeParse(raw);

  if (!parsed.success) {
    redirect(`/join/profile?error=${mapZodErrorToCode(parsed.error)}`);
  }

  const { firstName, lastName, countryId, cityId, profession, bio, visibility } =
    parsed.data;

  // 3. La combinaison pays/ville doit exister réellement en base — on ne
  // fait confiance à aucune paire envoyée par le client.
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    select: { id: true, countryId: true },
  });

  if (!city || city.countryId !== countryId) {
    redirect("/join/profile?error=invalid_location");
  }

  // 4. Création du profil, lié au SEUL userId dérivé de la session serveur.
  try {
    await prisma.profile.create({
      data: {
        userId: ensuredUser.id,
        firstName,
        lastName,
        profession: profession ?? null,
        bio: bio ?? null,
        visibility: visibility as ProfileVisibility,
        cityId,
      },
    });
  } catch (error) {
    const isDuplicateProfile =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

    if (isDuplicateProfile) {
      // Profil déjà existant (double soumission, retour en arrière...) :
      // pas une erreur du point de vue utilisateur, on continue vers /success.
      redirect("/join/success");
    }

    // Diagnostic temporaire (Task 004D) : on loggue le détail complet
    // côté serveur — jamais dans l'URL ni dans une page visible par
    // l'utilisateur — pour identifier la vraie cause (contrainte FK,
    // colonne NOT NULL, refus RLS/permission Postgres 42501...) au lieu
    // de la laisser avalée par une redirection générique silencieuse.
    const prismaCode =
      error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
    // Le driver pg expose le SQLSTATE Postgres brut (ex: 42501 = permission
    // denied, généralement un refus RLS) sur `.meta` ou l'erreur enveloppée.
    const pgCode =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? (error.meta as { code?: string } | undefined)?.code
        : undefined;

    console.error("[join/profile] failed to create profile:", {
      prismaCode,
      pgCode,
      message: error instanceof Error ? error.message : String(error),
      userId: ensuredUser.id,
      cityId,
    });

    // On ne renvoie jamais un message brut de la base à l'utilisateur (pas
    // de fuite de détails internes), mais on distingue au moins les causes
    // connues pour que le message affiché reste honnête.
    if (prismaCode === "P2003") {
      // Violation de clé étrangère — la ville n'existe (plus) réellement.
      redirect("/join/profile?error=invalid_location");
    }

    redirect("/join/profile?error=save_failed");
  }

  redirect("/join/success");
}
