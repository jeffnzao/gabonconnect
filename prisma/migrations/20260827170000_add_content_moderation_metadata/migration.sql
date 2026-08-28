CREATE TYPE "ContentModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "associations"
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "archivedAt" TIMESTAMP(3),
  ADD COLUMN "moderationStatus" "ContentModerationStatus" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN "canonicalUrl" TEXT,
  ADD COLUMN "sourceName" TEXT,
  ADD COLUMN "copyrightFlag" BOOLEAN NOT NULL DEFAULT false;
UPDATE "associations" SET "publishedAt" = "createdAt" WHERE "status" = 'APPROVED' AND "publishedAt" IS NULL;
CREATE INDEX "associations_moderationStatus_publishedAt_idx" ON "associations"("moderationStatus", "publishedAt");

ALTER TABLE "articles"
  ADD COLUMN "archivedAt" TIMESTAMP(3),
  ADD COLUMN "moderationStatus" "ContentModerationStatus" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN "canonicalUrl" TEXT,
  ADD COLUMN "sourceName" TEXT,
  ADD COLUMN "copyrightFlag" BOOLEAN NOT NULL DEFAULT false;
UPDATE "articles" SET "publishedAt" = COALESCE("publishedAt", "createdAt") WHERE "status" = 'PUBLISHED';
CREATE INDEX "articles_moderationStatus_publishedAt_idx" ON "articles"("moderationStatus", "publishedAt");

ALTER TABLE "shops"
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "archivedAt" TIMESTAMP(3),
  ADD COLUMN "moderationStatus" "ContentModerationStatus" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN "canonicalUrl" TEXT,
  ADD COLUMN "sourceName" TEXT,
  ADD COLUMN "copyrightFlag" BOOLEAN NOT NULL DEFAULT false;
UPDATE "shops" SET "publishedAt" = "createdAt" WHERE "status" = 'PUBLISHED' AND "publishedAt" IS NULL;
CREATE INDEX "shops_moderationStatus_publishedAt_idx" ON "shops"("moderationStatus", "publishedAt");

ALTER TABLE "administrative_procedures"
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "archivedAt" TIMESTAMP(3),
  ADD COLUMN "moderationStatus" "ContentModerationStatus" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN "canonicalUrl" TEXT,
  ADD COLUMN "sourceName" TEXT,
  ADD COLUMN "copyrightFlag" BOOLEAN NOT NULL DEFAULT false;
UPDATE "administrative_procedures" SET "publishedAt" = "createdAt" WHERE "publishedAt" IS NULL;
CREATE INDEX "administrative_procedures_moderationStatus_publishedAt_idx" ON "administrative_procedures"("moderationStatus", "publishedAt");

ALTER TABLE "scholarships"
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "archivedAt" TIMESTAMP(3),
  ADD COLUMN "moderationStatus" "ContentModerationStatus" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN "canonicalUrl" TEXT,
  ADD COLUMN "sourceName" TEXT,
  ADD COLUMN "copyrightFlag" BOOLEAN NOT NULL DEFAULT false;
UPDATE "scholarships" SET "publishedAt" = "createdAt" WHERE "publishedAt" IS NULL;
CREATE INDEX "scholarships_moderationStatus_publishedAt_idx" ON "scholarships"("moderationStatus", "publishedAt");

ALTER TABLE "events"
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "archivedAt" TIMESTAMP(3),
  ADD COLUMN "moderationStatus" "ContentModerationStatus" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN "canonicalUrl" TEXT,
  ADD COLUMN "sourceName" TEXT,
  ADD COLUMN "copyrightFlag" BOOLEAN NOT NULL DEFAULT false;
UPDATE "events" SET "publishedAt" = "createdAt" WHERE "status" = 'PUBLISHED' AND "publishedAt" IS NULL;
CREATE INDEX "events_moderationStatus_publishedAt_idx" ON "events"("moderationStatus", "publishedAt");

ALTER TABLE "opportunities"
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "archivedAt" TIMESTAMP(3),
  ADD COLUMN "moderationStatus" "ContentModerationStatus" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN "canonicalUrl" TEXT,
  ADD COLUMN "sourceName" TEXT,
  ADD COLUMN "copyrightFlag" BOOLEAN NOT NULL DEFAULT false;
UPDATE "opportunities" SET "publishedAt" = "createdAt" WHERE "status" = 'PUBLISHED' AND "publishedAt" IS NULL;
CREATE INDEX "opportunities_moderationStatus_publishedAt_idx" ON "opportunities"("moderationStatus", "publishedAt");
