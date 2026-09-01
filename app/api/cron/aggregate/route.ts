import { NextResponse } from "next/server";
import { runAggregationPipeline } from "@/lib/actions/aggregation";

export async function GET(request: Request) {
  const expected = process.env.AGGREGATION_CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runAggregationPipeline({ bypassSessionAuth: true });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Aggregation failed" }, { status: 500 });
  }
}
