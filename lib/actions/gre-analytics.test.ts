import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..", "..");
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");
const analytics = read("lib/actions/gre-analytics.ts");

assert.match(analytics, /async function requireAdmin\(\)/);
assert.match(analytics, /prisma\.article\.findMany/);
assert.match(analytics, /prisma\.ingestionLog\.findMany/);
assert.match(analytics, /days7/);
assert.match(analytics, /days30/);
assert.match(analytics, /averageScore/);
console.log("All GRE analytics tests passed.");