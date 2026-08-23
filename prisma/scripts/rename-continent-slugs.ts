// Migration de données (PAS une migration de schéma) : renomme les slugs
// des continents déjà en base, du français vers l'anglais, sans jamais
// supprimer ni recréer de lignes.
//
// Pourquoi un script séparé plutôt que `prisma migrate` :
// - `Continent.slug` n'est pas une colonne ajoutée/supprimée, seule la
//   valeur change → c'est une migration de données, pas de schéma.
// - On veut explicitement ÉVITER `prisma migrate reset` /
//   `db push --force-reset`, qui effaceraient les données existantes
//   (utilisateurs, profils, associations liés par clé étrangère).
//
// Idempotent : si un slug a déjà été renommé (ou n'existe pas encore),
// `updateMany` ne touche simplement aucune ligne.
//
// Usage :
//   npx tsx prisma/scripts/rename-continent-slugs.ts

import "dotenv/config";
import { PrismaClient } from "../../app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL must be defined in the environment.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Ancien slug (FR, historique) -> nouveau slug (EN, celui utilisé par les
// routes /explore/[continentSlug] et par le seed depuis ce ticket).
const SLUG_RENAMES: Array<{ from: string; to: string }> = [
  { from: "afrique", to: "africa" },
  { from: "europe", to: "europe" }, // inchangé, listé pour la traçabilité
  { from: "amerique-du-nord", to: "north-america" },
  { from: "amerique-du-sud", to: "south-america" },
  { from: "asie", to: "asia" },
  { from: "oceanie", to: "oceania" },
];

async function main() {
  for (const { from, to } of SLUG_RENAMES) {
    if (from === to) continue;

    const result = await prisma.continent.updateMany({
      where: { slug: from },
      data: { slug: to },
    });

    if (result.count > 0) {
      console.log(`✓ Continent "${from}" → "${to}" (${result.count} ligne mise à jour)`);
    } else {
      console.log(`— Rien à faire pour "${from}" → "${to}" (déjà migré ou introuvable)`);
    }
  }

  console.log("Migration des slugs de continents terminée. Aucune donnée supprimée.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
