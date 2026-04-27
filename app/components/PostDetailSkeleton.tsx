export default function PostDetailSkeleton() {
  return (
    <section className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-10 w-3/4 rounded-lg bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-200" />
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-11/12 rounded bg-slate-200" />
          <div className="h-4 w-10/12 rounded bg-slate-200" />
          <div className="h-4 w-9/12 rounded bg-slate-200" />
        </div>
      </div>
    </section>
  );
}