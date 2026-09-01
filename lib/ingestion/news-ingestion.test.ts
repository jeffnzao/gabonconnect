import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { normalizedContentHash } from "./news-ingestion";

const root = join(__dirname, "..", "..");
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

const sourceItem = { title: "Bourse pour les etudiants gabonais", excerpt: "Une bourse destinee aux ressortissants gabonais.", canonicalUrl: "https://example.test/bourse", sourceName: "Source test", publishedAt: new Date(), domain: "articles" as const, externalId: "item-1" };
assert.equal(normalizedContentHash(sourceItem), normalizedContentHash({ ...sourceItem, title: "  BOURSE pour les etudiants GABONAIS  " }));
assert.notEqual(normalizedContentHash(sourceItem), normalizedContentHash({ ...sourceItem, excerpt: "Contenu distinct." }));

const ingestionSource = read("lib/ingestion/news-ingestion.ts");
assert.match(ingestionSource, /createHash\("sha256"\)/);
assert.match(ingestionSource, /canonicalUrl: item\.canonicalUrl/);
assert.match(ingestionSource, /contentHash/);
assert.match(ingestionSource, /evaluateGabonRelevance/);
assert.match(ingestionSource, /AUTO_PUBLISH/);
assert.match(ingestionSource, /HUMAN_REVIEW/);
assert.match(ingestionSource, /QUARANTINE/);
assert.match(ingestionSource, /relevanceDecision/);

const routeSource = read("app/api/cron/ingest/route.ts");
assert.match(routeSource, /AGGREGATION_CRON_SECRET/);
assert.match(routeSource, /Bearer/);
assert.match(routeSource, /runNewsIngestion/);

console.log("All news ingestion tests passed.");
