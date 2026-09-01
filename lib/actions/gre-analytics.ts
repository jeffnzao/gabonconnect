"use server";

import type { Prisma } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/imports";
import { prisma } from "@/lib/prisma";

type GreSignal = { signal: string };
type GreDecision = { score: number; level: string; routing: { primary_target: string }; score_breakdown: GreSignal[] };
export type TerritorialArea = "National" | "Provincial" | "Municipal" | "Diaspora";

function isGreDecision(value: Prisma.JsonValue | null): value is Prisma.JsonObject & GreDecision {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const routing = value.routing;
  const breakdown = value.score_breakdown;
  return typeof value.score === "number" && typeof value.level === "string" && Boolean(routing && typeof routing === "object" && !Array.isArray(routing) && typeof routing.primary_target === "string") && Array.isArray(breakdown) && breakdown.every((entry) => entry && typeof entry === "object" && !Array.isArray(entry) && typeof entry.signal === "string");
}

async function requireAdmin() {
  const user = await ensureUser();
  if (!user || !isAdminRole(user.role)) throw new Error("Admin access required.");
  return user;
}

function territoryFor(level: string): TerritorialArea {
  if (level === "L2_DIASPORA_GABONAISE") return "Diaspora";
  if (level === "L3_RELATIONS_INTERNATIONALES") return "Provincial";
  if (level === "L4_CAMPUS_OPPORTUNITIES") return "Municipal";
  return "National";
}

export async function getGreAnalytics() {
  await requireAdmin();
  const now = Date.now();
  const since30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const since7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const [articles, ingestionLogs] = await Promise.all([
    prisma.article.findMany({ where: { createdAt: { gte: since30Days } }, select: { createdAt: true, relevanceDecision: true } }),
    prisma.ingestionLog.findMany({ where: { createdAt: { gte: since30Days } }, select: { source: { select: { name: true } }, fetched: true, created: true, duplicates: true, failed: true, autoPublished: true, humanReview: true, durationMs: true } }),
  ]);
  const decisions = articles.flatMap((article) => isGreDecision(article.relevanceDecision) ? [{ createdAt: article.createdAt, decision: article.relevanceDecision }] : []);
  const period = (since: Date) => {
    const selection = decisions.filter((item) => item.createdAt >= since);
    const autoPublished = selection.filter((item) => item.decision.routing.primary_target === "AUTO_PUBLISH").length;
    const humanReview = selection.filter((item) => item.decision.routing.primary_target === "HUMAN_REVIEW").length;
    const total = selection.length;
    return { total, autoPublished, humanReview, autoPublishRate: total ? Math.round((autoPublished / total) * 100) : 0, humanReviewRate: total ? Math.round((humanReview / total) * 100) : 0 };
  };
  const territories: Record<TerritorialArea, number> = { National: 0, Provincial: 0, Municipal: 0, Diaspora: 0 };
  const reasons = new Map<string, number>();
  let totalScore = 0;
  for (const item of decisions) {
    territories[territoryFor(item.decision.level)] += 1;
    totalScore += item.decision.score;
    for (const entry of item.decision.score_breakdown) reasons.set(entry.signal, (reasons.get(entry.signal) ?? 0) + 1);
  }
  const sourceMetrics = [...new Map(ingestionLogs.map((log) => [log.source.name, ingestionLogs.filter((item) => item.source.name === log.source.name)])).entries()].map(([name, logs]) => {
    const fetched = logs.reduce((total, log) => total + log.fetched, 0);
    const created = logs.reduce((total, log) => total + log.created, 0);
    const failures = logs.filter((log) => log.failed).length;
    const durationMs = Math.round(logs.reduce((total, log) => total + log.durationMs, 0) / logs.length);
    return { name, fetched, created, failures, successRate: logs.length ? Math.round(((logs.length - failures) / logs.length) * 100) : 0, durationMs };
  }).sort((first, second) => second.created - first.created).slice(0, 6);
  return { periods: { days7: period(since7Days), days30: period(since30Days) }, averageScore: decisions.length ? Math.round(totalScore / decisions.length) : 0, territories: Object.entries(territories).map(([label, value]) => ({ label: label as TerritorialArea, value })), reasons: [...reasons.entries()].map(([label, value]) => ({ label, value })).sort((first, second) => second.value - first.value).slice(0, 5), sourceMetrics };
}