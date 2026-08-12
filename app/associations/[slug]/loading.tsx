export default function AssociationProfileLoading() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-3xl animate-pulse px-6 py-10">
          <div className="h-4 w-40 rounded bg-slate-100" />

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="h-24 w-24 rounded-full bg-slate-100" />
            <div className="h-7 w-48 rounded bg-slate-100" />
            <div className="h-4 w-64 rounded bg-slate-100" />
            <div className="h-3 w-32 rounded bg-slate-100" />
            <div className="mt-2 h-10 w-44 rounded-full bg-slate-100" />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl animate-pulse px-6 py-12">
        <div className="h-5 w-24 rounded bg-slate-100" />
        <div className="mt-3 flex flex-col gap-2">
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-2/3 rounded bg-slate-100" />
        </div>

        <div className="mt-10 h-5 w-24 rounded bg-slate-100" />
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 rounded-2xl border border-slate-100 bg-slate-50" />
          ))}
        </div>
      </div>
    </div>
  );
}
