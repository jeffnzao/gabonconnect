import assert from "node:assert/strict";
import {
  canManageResource,
  isAnnouncementVisible,
  isArticlePublic,
  isProductPublic,
  isShopPublic,
  normalizeSlug,
  validateAnnouncementTargets,
} from "./phase13";

const now = new Date("2026-08-24T12:00:00.000Z");

assert.equal(normalizeSlug("  Café Gabonais  "), "cafe-gabonais");
assert.equal(isArticlePublic("DRAFT", null, now), false);
assert.equal(isArticlePublic("ARCHIVED", new Date("2026-08-24T11:00:00.000Z"), now), false);
assert.equal(isArticlePublic("PUBLISHED", new Date("2026-08-24T11:00:00.000Z"), now), true);

assert.equal(isAnnouncementVisible("PAUSED", null, null, now), false);
assert.equal(isAnnouncementVisible("ACTIVE", new Date("2026-08-24T13:00:00.000Z"), null, now), false);
assert.equal(isAnnouncementVisible("ACTIVE", null, new Date("2026-08-24T11:00:00.000Z"), now), false);
assert.equal(isAnnouncementVisible("ACTIVE", null, null, now), true);

assert.equal(isShopPublic("DRAFT"), false);
assert.equal(isShopPublic("PUBLISHED"), true);
assert.equal(isProductPublic("ARCHIVED"), false);
assert.equal(isProductPublic("PUBLISHED"), true);

assert.equal(canManageResource("owner-1", "owner-1", "USER"), true);
assert.equal(canManageResource("owner-1", "other-user", "USER"), false);
assert.equal(canManageResource("owner-1", "other-user", "ADMIN"), true);

assert.deepEqual(
  validateAnnouncementTargets([{ type: "CITY", value: " Libreville " }]),
  [{ type: "CITY", value: "Libreville" }],
);
assert.throws(
  () => validateAnnouncementTargets([
    { type: "CITY", value: "Libreville" },
    { type: "CITY", value: "Libreville" },
  ]),
  /Duplicate announcement targets/,
);

console.log("All Task 013 foundation tests passed.");
