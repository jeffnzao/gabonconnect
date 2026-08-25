import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..");
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

const source = read("lib/feed-actions.ts");

assert.match(source, /export\s+async\s+function\s+updatePost\s*\(/, "updatePost should exist");
assert.match(source, /ensureUser\(\)/, "updatePost must derive identity from ensureUser");
assert.match(source, /post\.authorId\s*!==\s*user\.id/, "Only the author can edit their post");
assert.match(source, /z\.string\(\)\.trim\(\)\.min\(1\)\.max\(5000\)/, "Post content must validate against the Zod schema");
assert.doesNotMatch(source, /formData\.get\(\s*["']authorId["']\s*\)/, "No authorId may be read from client input");
assert.match(source, /revalidatePath\(["']\/feed["']\)/, "Feed cache should be revalidated after update");
assert.match(source, /revalidatePath\(["']\/dashboard["']\)/, "Dashboard cache should be revalidated after update");

console.log("All post update security and validation tests passed.");
