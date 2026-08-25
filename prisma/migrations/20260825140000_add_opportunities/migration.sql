-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('JOB', 'INTERNSHIP', 'VOLUNTEERING', 'PROJECT_CALL', 'MUTUAL_AID');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "OpportunityType" NOT NULL,
    "location" TEXT NOT NULL,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "companyName" TEXT,
    "applicationUrl" TEXT,
    "contactEmail" TEXT,
    "associationId" TEXT,
    "createdById" TEXT NOT NULL,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunity_applications" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "opportunity_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "opportunities_slug_key" ON "opportunities"("slug");
CREATE INDEX "opportunities_status_createdAt_idx" ON "opportunities"("status", "createdAt");
CREATE INDEX "opportunities_type_status_idx" ON "opportunities"("type", "status");
CREATE INDEX "opportunities_associationId_idx" ON "opportunities"("associationId");
CREATE INDEX "opportunities_createdById_idx" ON "opportunities"("createdById");
CREATE UNIQUE INDEX "opportunity_applications_opportunityId_applicantId_key" ON "opportunity_applications"("opportunityId", "applicantId");
CREATE INDEX "opportunity_applications_opportunityId_idx" ON "opportunity_applications"("opportunityId");
CREATE INDEX "opportunity_applications_applicantId_idx" ON "opportunity_applications"("applicantId");

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "opportunity_applications" ADD CONSTRAINT "opportunity_applications_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "opportunity_applications" ADD CONSTRAINT "opportunity_applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep drafts and applications behind the server boundary.
ALTER TABLE "opportunities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "opportunity_applications" ENABLE ROW LEVEL SECURITY;
