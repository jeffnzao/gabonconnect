CREATE TABLE "ingestion_logs" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "fetched" INTEGER NOT NULL DEFAULT 0,
    "created" INTEGER NOT NULL DEFAULT 0,
    "duplicates" INTEGER NOT NULL DEFAULT 0,
    "failed" BOOLEAN NOT NULL DEFAULT false,
    "autoPublished" INTEGER NOT NULL DEFAULT 0,
    "humanReview" INTEGER NOT NULL DEFAULT 0,
    "quarantined" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ingestion_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ingestion_logs_createdAt_idx" ON "ingestion_logs"("createdAt");
CREATE INDEX "ingestion_logs_sourceId_createdAt_idx" ON "ingestion_logs"("sourceId", "createdAt");
ALTER TABLE "ingestion_logs" ADD CONSTRAINT "ingestion_logs_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "source_registry"("id") ON DELETE CASCADE ON UPDATE CASCADE;