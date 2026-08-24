import assert from "node:assert/strict";
import {
  buildImportDedupeKey,
  canPublishImportRecord,
  canReviewImportRecord,
  isAdminRole,
  isImportRecordPubliclyEligible,
  isReviewStatus,
  isSupportedPublicationEntity,
  normalizeImportName,
  parseAssociationImportPayload,
  validateImportRecordDraft,
} from "./imports";

assert.equal(normalizeImportName("  Société des Étudiants  "), "societe-des-etudiants");

const firstRecord = validateImportRecordDraft(
  {
    entityType: "ASSOCIATION",
    name: "Association Gabon Connect",
    rowNumber: 1,
    externalId: "assoc-001",
    locationKey: "Libreville",
    payload: { name: "Association Gabon Connect" },
  },
  "registry-2026",
);

assert.equal(firstRecord.normalizedName, "association-gabon-connect");
assert.equal(firstRecord.dedupeKey, "ASSOCIATION:association-gabon-connect:libreville");
assert.equal(firstRecord.sourceExternalKey, "ASSOCIATION:registry-2026:assoc-001");
assert.equal(
  buildImportDedupeKey("ASSOCIATION", "Association Gabon Connect", "Libreville"),
  firstRecord.dedupeKey,
);

assert.equal(isImportRecordPubliclyEligible("IMPORTED"), false);
assert.equal(isImportRecordPubliclyEligible("REJECTED"), false);
assert.equal(isImportRecordPubliclyEligible("VALIDATED"), true);
assert.equal(canReviewImportRecord("IMPORTED"), true);
assert.equal(canReviewImportRecord("VALIDATED"), false);
assert.equal(canReviewImportRecord("REJECTED"), false);
assert.equal(isReviewStatus("VALIDATED"), true);
assert.equal(isReviewStatus("REJECTED"), true);
assert.equal(isReviewStatus("IMPORTED"), false);
assert.equal(isAdminRole("USER"), false);
assert.equal(isAdminRole("ADMIN"), true);
assert.equal(isSupportedPublicationEntity("ASSOCIATION"), true);
assert.equal(isSupportedPublicationEntity("COMPANY"), false);
assert.equal(isSupportedPublicationEntity("PERSONALITY"), false);
assert.equal(canPublishImportRecord("IMPORTED", null, null, "ASSOCIATION"), false);
assert.equal(canPublishImportRecord("REJECTED", null, null, "ASSOCIATION"), false);
assert.equal(canPublishImportRecord("VALIDATED", null, null, "ASSOCIATION"), true);
assert.equal(canPublishImportRecord("VALIDATED", new Date(), null, "ASSOCIATION"), false);
assert.equal(canPublishImportRecord("VALIDATED", null, "association-1", "ASSOCIATION"), false);
assert.equal(canPublishImportRecord("VALIDATED", null, null, "COMPANY"), false);

assert.deepEqual(
  parseAssociationImportPayload({ name: " Association Gabon ", slug: "association-gabon", email: "a@example.com", status: "REJECTED" }),
  {
    name: "Association Gabon",
    slug: "association-gabon",
    description: undefined,
    logo: undefined,
    website: undefined,
    email: "a@example.com",
    phone: undefined,
    cityId: undefined,
  },
);
assert.throws(() => parseAssociationImportPayload({ name: "Association Gabon" }), /requires a name and slug/);

assert.throws(
  () =>
    validateImportRecordDraft(
      {
        entityType: "COMPANY",
        name: "",
        rowNumber: 1,
        payload: {},
      },
      "registry-2026",
    ),
  /must have a name/,
);

console.log("All import foundation tests passed.");