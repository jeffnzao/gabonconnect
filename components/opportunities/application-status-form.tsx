"use client";

import { useState } from "react";
import { OpportunityApplicationStatus } from "@/app/generated/prisma";
import { updateOpportunityApplicationStatus } from "@/lib/actions/opportunities";
import type { Messages } from "@/lib/i18n";

export default function ApplicationStatusForm({ applicationId, currentStatus, labels }: { applicationId: string; currentStatus: OpportunityApplicationStatus; labels: Messages["opportunityEngagement"] }) {
  const [status, setStatus] = useState(currentStatus);
  const [pending, setPending] = useState(false);
  async function update(next: OpportunityApplicationStatus) {
    setPending(true);
    try { const result = await updateOpportunityApplicationStatus(applicationId, next); setStatus(result.status); } finally { setPending(false); }
  }
  return <select value={status} disabled={pending} onChange={(event) => void update(event.target.value as OpportunityApplicationStatus)} aria-label={labels.status} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"><option value="PENDING">{labels.pending}</option><option value="REVIEWED">{labels.reviewed}</option><option value="ACCEPTED">{labels.accepted}</option><option value="REJECTED">{labels.rejected}</option></select>;
}
