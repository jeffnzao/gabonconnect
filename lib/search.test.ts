import assert from "node:assert/strict";
import { globalSearch, isEmptySearchQuery, normalizeSearchQuery } from "./search";

async function run() {
  assert.equal(normalizeSearchQuery("  hello   world  "), "hello world");
  assert.equal(isEmptySearchQuery("   "), true);
  assert.equal(isEmptySearchQuery("gabon"), false);

  const validResults = await globalSearch("Gabon", "all", 5);
  assert.ok(Array.isArray(validResults.all), "valid query should return an array");
  assert.ok(validResults.all.length >= 0, "valid query should not crash");

  const emptyResults = await globalSearch("   ", "all", 5);
  assert.deepEqual(emptyResults, {
    all: [],
    members: [],
    associations: [],
    events: [],
    opportunities: [],
    posts: [],
  });

  const categoryResults = await globalSearch("gabon", "members", 5);
  assert.ok(Array.isArray(categoryResults.members), "category filter should return array");
  assert.ok(Array.isArray(categoryResults.all), "all bucket should exist after category filter");

  console.log("All global search tests passed.");
}

void run();
