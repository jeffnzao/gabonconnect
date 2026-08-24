"use server";

import { ImportEntityType, ImportRecordStatus, Prisma } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  type ImportRecordDraft,
  canReviewImportRecord,
  isAdminRole,
  isReviewStatus,
  validateImportRecordDraft,
} from "@/lib/imports";

async function requireAdmin() {
  const user = await ensureUser();

  if (!user || !isAdminRole(user.role)) {
    throw new Error("Admin access required.");
  }

  return user;
}

export async function createImportBatch(input: {
  source: string;
  sourceType: string;
  sourceUrl?: string;
}) {
  const user = await requireAdmin();
  const source = input.source.trim();
  const sourceType = input.sourceType.trim();

  if (!source || !sourceType) {
    throw new Error("Import source and source type are required.");
  }

  return prisma.importBatch.create({
    data: {
      source,
      sourceType,
      sourceUrl: input.sourceUrl?.trim() || undefined,
      createdById: user.id,
    },
  });
}

export async function createImportRecord(batchId: string, draft: ImportRecordDraft) {
  const user = await requireAdmin();
  const batch = await prisma.importBatch.findUnique({
    where: { id: batchId },
    select: { id: true, source: true, status: true },
  });

  if (!batch || batch.status !== "DRAFT") {
    throw new Error("Import batch is not available for new records.");
  }

  const record = validateImportRecordDraft(draft, batch.source);

  return prisma.importRecord.create({
    data: {
      batchId: batch.id,
      entityType: ImportEntityType[record.entityType],
      rowNumber: record.rowNumber,
      externalId: record.externalId,
      sourceExternalKey: record.sourceExternalKey,
      normalizedName: record.normalizedName,
      dedupeKey: record.dedupeKey,
      payload: record.payload as Prisma.InputJsonObject,
      importedById: user.id,
    },
  });
}

export async function reviewImportRecord(
  recordId: string,
  status: string,
  rejectionReason?: string,
) {
  const user = await requireAdmin();
  if (!isReviewStatus(status)) {
    throw new Error("Invalid import review status.");
  }

  const record = await prisma.importRecord.findUnique({
    where: { id: recordId },
    select: { status: true },
  });
  if (!record || !canReviewImportRecord(record.status)) {
    throw new Error("Only imported records can be reviewed.");
  }

  if (status === ImportRecordStatus.REJECTED && !rejectionReason?.trim()) {
    throw new Error("A rejected import record requires a reason.");
  }

  return prisma.importRecord.update({
    where: { id: recordId },
    data: {
      status,
      reviewedAt: new Date(),
      reviewedById: user.id,
      rejectionReason: status === ImportRecordStatus.REJECTED ? rejectionReason!.trim() : null,
    },
  });
}

export async function reviewImportRecordFromForm(formData: FormData) {
  const recordId = String(formData.get("recordId") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const rejectionReason = String(formData.get("rejectionReason") ?? "");
  if (!recordId) throw new Error("Import record id is required.");

  await reviewImportRecord(recordId, status, rejectionReason);
}

export async function listImportRecordsForReview() {
  await requireAdmin();

  return prisma.importRecord.findMany({
    where: { status: { in: ["IMPORTED", "REJECTED", "VALIDATED"] } },
    orderBy: [{ status: "asc" }, { importedAt: "desc" }],
    select: {
      id: true,
      batchId: true,
      entityType: true,
      rowNumber: true,
      externalId: true,
      normalizedName: true,
      dedupeKey: true,
      payload: true,
      status: true,
      importedAt: true,
      reviewedAt: true,
      rejectionReason: true,
      importedById: true,
      reviewedById: true,
      batch: { select: { source: true, sourceType: true, sourceUrl: true } },
    },
  });
}