// Internal CLI entrypoint: persists aggregated feed items without a Supabase session cookie.
// Run with: npx tsx scripts/run-aggregation.ts
import "dotenv/config";
import { runAggregationPipeline } from "../lib/actions/aggregation";

async function main() {
  const result = await runAggregationPipeline({ bypassSessionAuth: true });
  console.log("[run-aggregation] result:", result);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[run-aggregation] failed:", error);
    process.exit(1);
  });
