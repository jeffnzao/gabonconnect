-- CreateEnum
CREATE TYPE "EventOrganizerType" AS ENUM ('ASSOCIATION', 'USER');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventParticipantStatus" AS ENUM ('GOING', 'MAYBE', 'DECLINED');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "virtualUrl" TEXT,
    "organizerType" "EventOrganizerType" NOT NULL,
    "associationId" TEXT,
    "createdById" TEXT NOT NULL,
    "maxParticipants" INTEGER,
    "status" "EventStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_participants" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "EventParticipantStatus" NOT NULL DEFAULT 'GOING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");
CREATE INDEX "events_status_startDate_idx" ON "events"("status", "startDate");
CREATE INDEX "events_associationId_startDate_idx" ON "events"("associationId", "startDate");
CREATE INDEX "events_createdById_idx" ON "events"("createdById");
CREATE UNIQUE INDEX "event_participants_eventId_userId_key" ON "event_participants"("eventId", "userId");
CREATE INDEX "event_participants_eventId_status_idx" ON "event_participants"("eventId", "status");
CREATE INDEX "event_participants_userId_idx" ON "event_participants"("userId");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep drafts and cancelled events behind the server application boundary.
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "event_participants" ENABLE ROW LEVEL SECURITY;
