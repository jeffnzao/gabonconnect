-- Add publication tracking to import records.
ALTER TABLE "import_records"
ADD COLUMN "publishedAt" TIMESTAMP(3),
ADD COLUMN "publishedById" TEXT,
ADD COLUMN "publishedEntityId" TEXT;

-- CreateIndex
CREATE INDEX "import_records_publishedEntityId_idx" ON "import_records"("publishedEntityId");

-- AddForeignKey
ALTER TABLE "import_records"
ADD CONSTRAINT "import_records_publishedById_fkey"
FOREIGN KEY ("publishedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
