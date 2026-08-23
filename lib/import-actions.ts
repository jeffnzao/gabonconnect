"use server";

import { ImportEntityType, ImportRecordStatus, Prisma } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  type ImportRecordDraft,
  isAdminRole,
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
  status: Extract<ImportRecordStatus, "VALIDATED" | "REJECTED">,
  rejectionReason?: string,
) {
  const user = await requireAdmin();

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