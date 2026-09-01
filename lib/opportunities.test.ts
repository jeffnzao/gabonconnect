import assert from "node:assert/strict";
import { OpportunityStatus, OpportunityType } from "@/app/generated/prisma";
import {
  buildOpportunityWhere,
  canApplyToOpportunity,
  canCreateAssociationOpportunity,
  isOpportunityPublic,
} from "./opportunities";

const publicWhere = { status: OpportunityStatus.PUBLISHED, moderationStatus: "APPROVED", publishedAt: { not: null } };
assert.deepEqual(buildOpportunityWhere({ type: OpportunityType.JOB }), { ...publicWhere, type: OpportunityType.JOB });
assert.deepEqual(buildOpportunityWhere({ location: " Paris " }), { ...publicWhere, location: { contains: "Paris", mode: "insensitive" } });
assert.equal(isOpportunityPublic(OpportunityStatus.DRAFT), false);
assert.equal(isOpportunityPublic(OpportunityStatus.PUBLISHED), true);
assert.equal(canApplyToOpportunity(OpportunityStatus.CLOSED), false);
assert.equal(canApplyToOpportunity(OpportunityStatus.PUBLISHED), true);
assert.equal(canCreateAssociationOpportunity("APPROVED", true), true);
assert.equal(canCreateAssociationOpportunity("APPROVED", false), false);
assert.equal(canCreateAssociationOpportunity("PENDING", true), false);
assert.equal(canCreateAssociationOpportunity("REJECTED", true), false);
assert.equal(canCreateAssociationOpportunity(null, true), false);

console.log("All opportunity foundation tests passed.");
