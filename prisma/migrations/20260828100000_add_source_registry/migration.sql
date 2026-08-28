CREATE TYPE "SourceRegistryType" AS ENUM ('GOVERNMENT', 'DIPLOMATIC', 'MEDIA', 'UNIVERSITY', 'DIASPORA', 'OTHER');

CREATE TABLE "source_registry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "SourceRegistryType" NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'GA',
    "language" TEXT NOT NULL DEFAULT 'fr',
    "rssUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "reliability" DOUBLE PRECISION NOT NULL DEFAULT 3,
    "lastFetchedAt" TIMESTAMP(3),
    "termsUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "source_registry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "source_registry_url_key" ON "source_registry"("url");
CREATE INDEX "source_registry_active_type_idx" ON "source_registry"("active", "type");
CREATE INDEX "source_registry_country_language_idx" ON "source_registry"("country", "language");
CREATE INDEX "source_registry_lastFetchedAt_idx" ON "source_registry"("lastFetchedAt");
ALTER TABLE "source_registry" ADD CONSTRAINT "source_registry_reliability_check" CHECK ("reliability" >= 1 AND "reliability" <= 5);