import assert from "node:assert/strict";
import { OpportunityStatus, OpportunityType } from "@/app/generated/prisma";
import {
  buildOpportunityWhere,
  canApplyToOpportunity,
  isOpportunityPublic,
} from "./opportunities";

assert.deepEqual(buildOpportunityWhere({ type: OpportunityType.JOB }), { status: OpportunityStatus.PUBLISHED, type: OpportunityType.JOB });
assert.deepEqual(buildOpportunityWhere({ location: " Paris " }), { status: OpportunityStatus.PUBLISHED, location: { contains: "Paris", mode: "insensitive" } });
assert.equal(isOpportunityPublic(OpportunityStatus.DRAFT), false);
assert.equal(isOpportunityPublic(OpportunityStatus.PUBLISHED), true);
assert.equal(canApplyToOpportunity(OpportunityStatus.CLOSED), false);
assert.equal(canApplyToOpportunity(OpportunityStatus.PUBLISHED), true);

console.log("All opportunity foundation tests passed.");
