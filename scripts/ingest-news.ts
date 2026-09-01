import "dotenv/config";
import { runNewsIngestion } from "../lib/ingestion/news-ingestion";

runNewsIngestion()
  .then((result) => {
    console.log("[ingest-news] result:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("[ingest-news] failed:", error);
    process.exit(1);
  });
