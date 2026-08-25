import assert from "node:assert/strict";
import { PostType, PostVisibility } from "@/app/generated/prisma";
import { buildFeedWhere, canViewPost } from "./feed";

const member = { id: "user-1", isMember: true };
const nonMember = { id: "user-2", isMember: false };

assert.deepEqual(buildFeedWhere({ type: PostType.GENERAL }, null), {
  OR: [{ visibility: PostVisibility.PUBLIC }],
  type: PostType.GENERAL,
});
assert.equal(canViewPost(PostVisibility.PUBLIC, null, "author"), true);
assert.equal(canViewPost(PostVisibility.MEMBERS_ONLY, member, "author"), true);
assert.equal(canViewPost(PostVisibility.MEMBERS_ONLY, nonMember, "author"), false);
assert.equal(canViewPost(PostVisibility.MEMBERS_ONLY, nonMember, "user-2"), true);

console.log("All feed foundation tests passed.");