-- CreateEnum
CREATE TYPE "ImportBatchStatus" AS ENUM ('DRAFT', 'VALIDATED', 'REJECTED', 'IMPORTED');

-- CreateEnum
CREATE TYPE "ImportRecordStatus" AS ENUM ('IMPORTED', 'VALIDATED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ImportEntityType" AS ENUM ('ASSOCIATION', 'COMPANY', 'PERSONALITY');

-- CreateTable
CREATE TABLE "import_batches" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "status" "ImportBatchStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_records" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "entityType" "ImportEntityType" NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "externalId" TEXT,
    "sourceExternalKey" TEXT,
    "normalizedName" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "ImportRecordStatus" NOT NULL DEFAULT 'IMPORTED',
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importedById" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "import_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "import_batches_status_idx" ON "import_batches"("status");

-- CreateIndex
CREATE INDEX "import_batches_createdById_idx" ON "import_batches"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "import_records_batchId_rowNumber_key" ON "import_records"("batchId", "rowNumber");

-- CreateIndex
CREATE UNIQUE INDEX "import_records_entityType_dedupeKey_key" ON "import_records"("entityType", "dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "import_records_sourceExternalKey_key" ON "import_records"("sourceExternalKey");

-- CreateIndex
CREATE INDEX "import_records_batchId_status_idx" ON "import_records"("batchId", "status");

-- CreateIndex
CREATE INDEX "import_records_status_idx" ON "import_records"("status");

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_records" ADD CONSTRAINT "import_records_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_records" ADD CONSTRAINT "import_records_importedById_fkey" FOREIGN KEY ("importedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_records" ADD CONSTRAINT "import_records_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Keep staging records inaccessible through Supabase's public/authenticated roles.
-- The server-side Prisma connection remains the controlled import boundary.
ALTER TABLE "import_batches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "import_records" ENABLE ROW LEVEL SECURITY;
