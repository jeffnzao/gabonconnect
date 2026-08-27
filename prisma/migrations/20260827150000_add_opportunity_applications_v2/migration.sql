CREATE TYPE "OpportunityApplicationStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED');

ALTER TABLE "opportunity_applications"
  ADD COLUMN "coverLetter" TEXT,
  ADD COLUMN "cvUrl" TEXT,
  ADD COLUMN "status" "OpportunityApplicationStatus" NOT NULL DEFAULT 'PENDING';

CREATE TABLE "saved_opportunities" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_opportunities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "saved_opportunities_opportunityId_userId_key" ON "saved_opportunities"("opportunityId", "userId");
CREATE INDEX "saved_opportunities_userId_createdAt_idx" ON "saved_opportunities"("userId", "createdAt");
ALTER TABLE "saved_opportunities" ADD CONSTRAINT "saved_opportunities_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_opportunities" ADD CONSTRAINT "saved_opportunities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
