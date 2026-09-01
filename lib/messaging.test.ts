import assert from "node:assert/strict";
import { ProfileVisibility, UserStatus } from "@/app/generated/prisma";
import {
  canAccessConversation,
  countUnreadMessages,
  getPublicStatus,
  normalizeParticipantPair,
  visibleUserStatus,
} from "./messaging";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..");
const messagingActionsSource = readFileSync(join(root, "lib/messaging-actions.ts"), "utf8");

assert.deepEqual(normalizeParticipantPair("user-b", "user-a"), {
  participant1Id: "user-a",
  participant2Id: "user-b",
});
assert.throws(() => normalizeParticipantPair("user-a", "user-a"));

const conversation = { participant1Id: "user-a", participant2Id: "user-b" };
assert.equal(canAccessConversation(conversation, "user-a"), true);
assert.equal(canAccessConversation(conversation, "user-c"), false);

assert.equal(countUnreadMessages([
  { senderId: "user-b", isRead: false },
  { senderId: "user-b", isRead: false },
  { senderId: "user-a", isRead: false },
  { senderId: "user-b", isRead: true },
], "user-a"), 2);

assert.equal(visibleUserStatus(UserStatus.ONLINE, true), UserStatus.ONLINE);
assert.equal(visibleUserStatus(UserStatus.ONLINE, false), null);
assert.equal(getPublicStatus({ status: UserStatus.AWAY, showStatus: true, visibility: ProfileVisibility.PUBLIC }), UserStatus.AWAY);
assert.equal(getPublicStatus({ status: UserStatus.ONLINE, showStatus: true, visibility: ProfileVisibility.PRIVATE }), null);
assert.match(messagingActionsSource, /data: \{ isRead: true, readAt: new Date\(\) \}/);

console.log("All messaging foundation tests passed.");
