export default function GlobalLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
        <div className="h-7 w-40 rounded bg-slate-200" />
        <div className="mt-4 h-4 w-64 rounded bg-slate-200" />
        <div className="mt-8 space-y-3">
          <div className="h-20 rounded-xl bg-slate-200" />
          <div className="h-20 rounded-xl bg-slate-200" />
          <div className="h-20 rounded-xl bg-slate-200" />
        </div>
      </div>
    </section>
  );
}
