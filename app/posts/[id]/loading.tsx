export default function PostDetailLoading() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="mt-4 h-4 w-48 rounded bg-slate-200" />
        <div className="mt-6 h-72 rounded-xl bg-slate-200" />
        <div className="mt-6 h-20 rounded-xl bg-slate-200" />
      </div>
    </section>
  );
}
