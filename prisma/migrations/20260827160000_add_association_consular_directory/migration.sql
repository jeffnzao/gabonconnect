CREATE TYPE "AssociationCategory" AS ENUM ('CULTURE', 'EDUCATION', 'BUSINESS', 'SOLIDARITY', 'SPORT');
CREATE TYPE "AssociationMemberRole" AS ENUM ('MEMBER', 'ADMIN', 'TREASURER', 'SECRETARY');
CREATE TYPE "AssociationMemberStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "ConsulateType" AS ENUM ('EMBASSY', 'CONSULATE_GENERAL', 'HONORARY_CONSULATE');

ALTER TABLE "associations"
  ADD COLUMN "logoUrl" TEXT,
  ADD COLUMN "category" "AssociationCategory" NOT NULL DEFAULT 'SOLIDARITY',
  ADD COLUMN "address" TEXT,
  ADD COLUMN "presidentId" TEXT;
ALTER TABLE "associations" ADD CONSTRAINT "associations_presidentId_fkey" FOREIGN KEY ("presidentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "associations_category_idx" ON "associations"("category");

ALTER TABLE "association_members"
  ADD COLUMN "userId" TEXT;
UPDATE "association_members" m SET "userId" = p."userId" FROM "profiles" p WHERE p."id" = m."profileId";
ALTER TABLE "association_members" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "association_members"
  ADD COLUMN "role" "AssociationMemberRole" NOT NULL DEFAULT 'MEMBER',
  ADD COLUMN "status" "AssociationMemberStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "joinedAt" TIMESTAMP(3);
ALTER TABLE "association_members" ADD CONSTRAINT "association_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "association_members_userId_status_idx" ON "association_members"("userId", "status");

CREATE TABLE "consulates" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "ConsulateType" NOT NULL,
  "country" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "website" TEXT NOT NULL,
  "openingHours" TEXT NOT NULL,
  "jurisdiction" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "consulates_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "consulates_country_type_idx" ON "consulates"("country", "type");
