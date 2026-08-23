import assert from "node:assert/strict";
import {
  buildImportDedupeKey,
  isAdminRole,
  isImportRecordPubliclyEligible,
  normalizeImportName,
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
assert.equal(isAdminRole("USER"), false);
assert.equal(isAdminRole("ADMIN"), true);

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