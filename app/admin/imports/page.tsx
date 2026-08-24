import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  listImportRecordsForReview,
  reviewImportRecordFromForm,
} from "@/lib/import-actions";

export const dynamic = "force-dynamic";

export default async function ImportReviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let records;
  try {
    records = await listImportRecordsForReview();
  } catch (error) {
    if (error instanceof Error && error.message === "Admin access required.") {
      redirect("/");
    }
    throw error;
  }

  return (
    <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Import review</h1>
      <p className="mt-2 text-sm text-slate-500">Review imported records before any future publication.</p>
      {records.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">No imported records to review.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Reviewed</th><th className="px-4 py-3">Actions</th></tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{record.normalizedName}</td>
                  <td className="px-4 py-3 text-slate-600">{record.entityType}</td>
                  <td className="px-4 py-3 text-slate-600">{record.batch.source}</td>
                  <td className="px-4 py-3 text-slate-600">{record.status}</td>
                  <td className="px-4 py-3 text-slate-500">{record.reviewedAt?.toLocaleDateString("en-US") ?? "Pending"}</td>
                  <td className="px-4 py-3">
                    {record.status === "IMPORTED" && (
                      <div className="flex flex-col gap-2">
                        <form action={reviewImportRecordFromForm}>
                          <input type="hidden" name="recordId" value={record.id} />
                          <input type="hidden" name="status" value="VALIDATED" />
                          <button type="submit" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">Validate</button>
                        </form>
                        <form action={reviewImportRecordFromForm} className="flex gap-2">
                          <input type="hidden" name="recordId" value={record.id} />
                          <input type="hidden" name="status" value="REJECTED" />
                          <input name="rejectionReason" required placeholder="Reason" className="min-w-0 rounded border border-slate-200 px-2 py-1 text-xs" />
                          <button type="submit" className="text-sm font-semibold text-red-700 hover:text-red-800">Reject</button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}