import { NextResponse } from "next/server";
import { runNewsIngestion } from "@/lib/ingestion/news-ingestion";

function authorized(request: Request): boolean {
  const secret = process.env.AGGREGATION_CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ success: true, ...(await runNewsIngestion()) });
  } catch (error) {
    console.error("[cron/ingest] failed:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "News ingestion failed" }, { status: 500 });
  }
}
