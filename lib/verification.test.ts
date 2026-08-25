import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  canModerateVerificationStatus,
  getVerificationBadgeText,
  isVerificationApproved,
} from "./verification";

assert.equal(isVerificationApproved({ isVerified: true, verificationStatus: "VERIFIED" }), true);
assert.equal(isVerificationApproved({ isVerified: false, verificationStatus: "PENDING" }), false);
assert.equal(isVerificationApproved({ isVerified: false, verificationStatus: "REJECTED" }), false);
assert.equal(canModerateVerificationStatus("ADMIN"), true);
assert.equal(canModerateVerificationStatus("USER"), false);
assert.equal(getVerificationBadgeText({ isVerified: true, verificationStatus: "VERIFIED" }), "Verified");
assert.equal(getVerificationBadgeText({ isVerified: false, verificationStatus: "PENDING" }), "Pending");

const root = join(__dirname, "..");
const actionsSource = readFileSync(join(root, "lib/verification-actions.ts"), "utf8");
const schemaSource = readFileSync(join(root, "prisma/schema.prisma"), "utf8");

assert.match(actionsSource, /ensureUser\(/);
assert.match(actionsSource, /isAdminRole|role !== "ADMIN"|role === "ADMIN"/);
assert.match(schemaSource, /verificationStatus|isVerified|verifiedAt|verificationNotes/);

console.log("All verification tests passed.");
