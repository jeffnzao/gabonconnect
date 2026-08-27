CREATE TYPE "AdministrativeProcedureCategory" AS ENUM ('CONSULAR', 'IMMIGRATION', 'INTEGRATION', 'RETURN');
CREATE TYPE "UserProcedureStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

CREATE TABLE "administrative_procedures" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AdministrativeProcedureCategory" NOT NULL,
    "estimatedDays" INTEGER NOT NULL,
    "cost" TEXT NOT NULL,
    "officialUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "administrative_procedures_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "procedure_steps" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "procedure_steps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_procedure_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "status" "UserProcedureStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completedStepIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_procedure_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "administrative_procedures_slug_key" ON "administrative_procedures"("slug");
CREATE INDEX "administrative_procedures_category_idx" ON "administrative_procedures"("category");
CREATE UNIQUE INDEX "procedure_steps_procedureId_order_key" ON "procedure_steps"("procedureId", "order");
CREATE UNIQUE INDEX "user_procedure_progress_userId_procedureId_key" ON "user_procedure_progress"("userId", "procedureId");
CREATE INDEX "user_procedure_progress_userId_status_idx" ON "user_procedure_progress"("userId", "status");

ALTER TABLE "procedure_steps" ADD CONSTRAINT "procedure_steps_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "administrative_procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_procedure_progress" ADD CONSTRAINT "user_procedure_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_procedure_progress" ADD CONSTRAINT "user_procedure_progress_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "administrative_procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;