ALTER TABLE "articles"
  ADD COLUMN "relevanceScore" DOUBLE PRECISION,
  ADD COLUMN "relevanceLevel" TEXT,
  ADD COLUMN "sourceLevel" "SourceLevel",
  ADD COLUMN "reviewReason" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3);

CREATE INDEX "articles_moderationStatus_reviewedAt_idx" ON "articles"("moderationStatus", "reviewedAt");
CREATE INDEX "articles_relevanceLevel_idx" ON "articles"("relevanceLevel");