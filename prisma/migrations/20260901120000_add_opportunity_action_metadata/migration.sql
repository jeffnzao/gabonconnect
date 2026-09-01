ALTER TABLE "opportunities" ADD COLUMN "deadline" TIMESTAMP(3);
ALTER TABLE "opportunities" ADD COLUMN "eligibilityCriteria" TEXT;

CREATE INDEX "opportunities_status_deadline_idx" ON "opportunities"("status", "deadline");