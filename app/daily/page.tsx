import BlogShell from "../components/BlogShell";
import { dailyLines } from "../../content/blog-content";

export default function DailyPage() {
  return (
    <BlogShell active="daily">
      <section className="mt-4 border border-slate-200 bg-white p-6 md:p-8">
        <p className="text-xs tracking-[0.16em] text-slate-500">DAILY ONE LINE</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">하루한줄</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
          매일 한 문장으로 생각을 정리하고, 블로그의 결을 단단하게 유지하는 기록 공간입니다.
        </p>
      </section>

      <section className="mt-0 space-y-0">
        {dailyLines.map((line) => (
          <article key={line} className="border border-slate-200 bg-white p-5">
            <p className="text-base leading-7 text-slate-700">{line}</p>
          </article>
        ))}
      </section>
    </BlogShell>
  );
}
