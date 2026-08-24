"use server";

import { AssociationStatus, ImportEntityType, ImportRecordStatus, Prisma } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  type ImportRecordDraft,
  canReviewImportRecord,
  isAdminRole,
  canPublishImportRecord,
  isSupportedPublicationEntity,
  isReviewStatus,
  parseAssociationImportPayload,
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
      publishedAt: true,
      publishedById: true,
      publishedEntityId: true,
      batch: { select: { source: true, sourceType: true, sourceUrl: true } },
    },
  });
}

export async function publishImportRecord(recordId: string) {
  const user = await requireAdmin();

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "import_records" WHERE "id" = ${recordId} FOR UPDATE`;

    const record = await tx.importRecord.findUnique({
      where: { id: recordId },
      select: {
        id: true,
        entityType: true,
        status: true,
        payload: true,
        publishedAt: true,
        publishedEntityId: true,
        batch: { select: { id: true, source: true, sourceUrl: true } },
      },
    });

    if (!record) throw new Error("Import record not found.");
    if (record.status !== ImportRecordStatus.VALIDATED) {
      throw new Error("Only validated import records can be published.");
    }
    if (record.publishedAt || record.publishedEntityId) {
      throw new Error("Import record has already been published.");
    }
    if (!isSupportedPublicationEntity(record.entityType)) {
      throw new Error(`Import entity type ${record.entityType} is not supported for publication.`);
    }

    if (!canPublishImportRecord(record.status, record.publishedAt, record.publishedEntityId, record.entityType)) {
      throw new Error("Import record is not eligible for publication.");
    }

    const payload = parseAssociationImportPayload(record.payload);
    const existing = await tx.association.findUnique({
      where: { slug: payload.slug },
      select: { id: true, status: true },
    });

    let associationId: string;
    if (existing) {
      if (existing.status !== AssociationStatus.APPROVED) {
        throw new Error("An association with this slug already exists and is not approved.");
      }
      associationId = existing.id;
    } else {
      const association = await tx.association.create({
        data: {
          name: payload.name,
          slug: payload.slug,
          description: payload.description,
          logo: payload.logo,
          website: payload.website,
          email: payload.email,
          phone: payload.phone,
          cityId: payload.cityId,
          status: AssociationStatus.APPROVED,
        },
        select: { id: true },
      });
      associationId = association.id;
    }

    await tx.importRecord.update({
      where: { id: record.id },
      data: {
        publishedAt: new Date(),
        publishedById: user.id,
        publishedEntityId: associationId,
      },
    });

    return { associationId, source: record.batch.source, sourceUrl: record.batch.sourceUrl };
  });
}

export async function publishImportRecordFromForm(formData: FormData) {
  const recordId = String(formData.get("recordId") ?? "").trim();
  if (!recordId) throw new Error("Import record id is required.");
  await publishImportRecord(recordId);
}