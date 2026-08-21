-- CreateTable
CREATE TABLE "association_members" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "association_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "association_members_associationId_idx" ON "association_members"("associationId");

-- CreateIndex
CREATE INDEX "association_members_profileId_idx" ON "association_members"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "association_members_associationId_profileId_key" ON "association_members"("associationId", "profileId");

-- AddForeignKey
ALTER TABLE "association_members" ADD CONSTRAINT "association_members_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "association_members" ADD CONSTRAINT "association_members_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
