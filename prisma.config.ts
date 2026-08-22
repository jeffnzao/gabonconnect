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
    //url: env("DIRECT_URL"),
    url: env("DATABASE_URL"),
  // @ts-expect-error directUrl est valide au runtime CLI mais absent du type TS
    directUrl: env("DIRECT_URL"),
},
});