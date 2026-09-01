CREATE TYPE "ProcedureContentType" AS ENUM ('OFFICIAL_DOCUMENTED', 'GABONCONNECT_EXPLANATORY');

ALTER TABLE "administrative_procedures"
  ADD COLUMN "contentType" "ProcedureContentType" NOT NULL DEFAULT 'GABONCONNECT_EXPLANATORY',
  ADD COLUMN "targetAudience" TEXT,
  ADD COLUMN "conditions" TEXT,
  ADD COLUMN "requiredDocuments" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "competentAuthority" TEXT,
  ADD COLUMN "verifiedAt" TIMESTAMP(3);

CREATE INDEX "administrative_procedures_contentType_verifiedAt_idx" ON "administrative_procedures"("contentType", "verifiedAt");