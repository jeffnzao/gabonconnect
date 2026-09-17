import { ShieldCheck } from "lucide-react";
import { PERIOD_MAP, SOURCE_LEVEL_MAP, type PeriodId, type SourceLevel } from "@/lib/histoire";

export function SourceBadge({ level }: { level: SourceLevel }) {
  const meta = SOURCE_LEVEL_MAP[level];
  return (
    <span
      title={meta.description}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badgeClass}`}
    >
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
      {level.replace("LEVEL_", "Niveau ")}
    </span>
  );
}

export function PeriodBadge({ period }: { period: PeriodId }) {
  const meta = PERIOD_MAP[period];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      {period} · {meta.label}
    </span>
  );
}
