CREATE TYPE "ScholarshipLevel" AS ENUM ('LICENCE', 'MASTER', 'DOCTORAT');
CREATE TYPE "HousingType" AS ENUM ('COLOCATION', 'STUDIO', 'CHAMBRE', 'SOUS_LOCATION');

CREATE TABLE "scholarships" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "level" "ScholarshipLevel" NOT NULL,
    "description" TEXT NOT NULL,
    "eligibilityCriteria" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "applicationUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "housing_offers" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "type" "HousingType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "housing_offers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "scholarships_country_level_deadline_idx" ON "scholarships"("country", "level", "deadline");
CREATE INDEX "scholarships_provider_deadline_idx" ON "scholarships"("provider", "deadline");
CREATE INDEX "housing_offers_country_city_type_isAvailable_idx" ON "housing_offers"("country", "city", "type", "isAvailable");
CREATE INDEX "housing_offers_authorId_createdAt_idx" ON "housing_offers"("authorId", "createdAt");
ALTER TABLE "housing_offers" ADD CONSTRAINT "housing_offers_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;