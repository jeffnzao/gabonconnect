// Fichier de configuration central du Prisma CLI (Prisma 7).
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
     // Utilisée par l'application au runtime : doit pointer vers le
    // connection pooler Supabase (port 6543, ?pgbouncer=true).
    url: env("DATABASE_URL"),
    // Utilisée uniquement par le CLI Prisma pour les migrations : doit
    // pointer vers la connexion directe Postgres (port 5432), qui
    // supporte les transactions DDL nécessaires aux migrations.
    directUrl: env("DIRECT_URL"),
  },
  
});