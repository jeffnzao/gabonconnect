export type ImportEntityType = "ASSOCIATION" | "COMPANY" | "PERSONALITY";
export type ImportRecordStatus = "IMPORTED" | "VALIDATED" | "REJECTED";

export interface AssociationImportPayload {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  cityId?: string;
}

export interface ImportRecordDraft {
  entityType: ImportEntityType;
  name: string;
  rowNumber: number;
  externalId?: string;
  locationKey?: string;
  payload: Record<string, unknown>;
}

export interface ValidatedImportRecordDraft extends ImportRecordDraft {
  normalizedName: string;
  dedupeKey: string;
  sourceExternalKey?: string;
}

export function normalizeImportName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildImportDedupeKey(
  entityType: ImportEntityType,
  name: string,
  locationKey?: string,
): string {
  const normalizedName = normalizeImportName(name);
  const normalizedLocation = locationKey ? normalizeImportName(locationKey) : "global";

  return `${entityType}:${normalizedName}:${normalizedLocation}`;
}

export function validateImportRecordDraft(
  draft: ImportRecordDraft,
  source: string,
): ValidatedImportRecordDraft {
  const normalizedName = normalizeImportName(draft.name);
  const normalizedSource = source.trim();
  const externalId = draft.externalId?.trim() || undefined;

  if (!normalizedName) {
    throw new Error("An imported record must have a name.");
  }
  if (!normalizedSource) {
    throw new Error("An imported record must have a source.");
  }
  if (!Number.isInteger(draft.rowNumber) || draft.rowNumber < 1) {
    throw new Error("An imported record must have a positive row number.");
  }
  if (!draft.payload || Array.isArray(draft.payload)) {
    throw new Error("An imported record must have an object payload.");
  }

  return {
    ...draft,
    name: draft.name.trim(),
    externalId,
    normalizedName,
    dedupeKey: buildImportDedupeKey(draft.entityType, draft.name, draft.locationKey),
    sourceExternalKey: externalId
      ? `${draft.entityType}:${normalizedSource}:${externalId}`
      : undefined,
  };
}

export function isImportRecordPubliclyEligible(status: ImportRecordStatus): boolean {
  return status === "VALIDATED";
}

export function isReviewStatus(value: string): value is "VALIDATED" | "REJECTED" {
  return value === "VALIDATED" || value === "REJECTED";
}

export function canReviewImportRecord(status: ImportRecordStatus): boolean {
  return status === "IMPORTED";
}

export function isAdminRole(role: string): role is "ADMIN" {
  return role === "ADMIN";
}

export function isSupportedPublicationEntity(entityType: ImportEntityType): boolean {
  return entityType === "ASSOCIATION";
}

export function canPublishImportRecord(
  status: ImportRecordStatus,
  publishedAt: Date | null,
  publishedEntityId: string | null,
  entityType: ImportEntityType,
): boolean {
  return (
    status === "VALIDATED" &&
    publishedAt === null &&
    publishedEntityId === null &&
    isSupportedPublicationEntity(entityType)
  );
}

export function parseAssociationImportPayload(payload: unknown): AssociationImportPayload {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Association import payload must be an object.");
  }

  const input = payload as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const slug = typeof input.slug === "string" ? normalizeImportName(input.slug) : "";

  if (!name || !slug) {
    throw new Error("Association import payload requires a name and slug.");
  }

  const optionalString = (key: string): string | undefined => {
    const value = input[key];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  };

  return {
    name,
    slug,
    description: optionalString("description"),
    logo: optionalString("logo"),
    website: optionalString("website"),
    email: optionalString("email"),
    phone: optionalString("phone"),
    cityId: optionalString("cityId"),
  };
}