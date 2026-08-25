import assert from "node:assert/strict";
import {
  canOrganizeAssociationEvent,
  hasEventCapacity,
  isUpcomingEvent,
} from "./events";

const now = new Date("2026-08-25T12:00:00.000Z");

assert.equal(isUpcomingEvent(new Date("2026-08-25T12:00:00.000Z"), now), true);
assert.equal(isUpcomingEvent(new Date("2026-08-25T11:59:59.000Z"), now), false);
assert.equal(hasEventCapacity(null, 999), true);
assert.equal(hasEventCapacity(10, 9), true);
assert.equal(hasEventCapacity(10, 10), false);
assert.equal(canOrganizeAssociationEvent(true), true);
assert.equal(canOrganizeAssociationEvent(false), false);

console.log("All event foundation tests passed.");
