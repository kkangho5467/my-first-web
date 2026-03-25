import BlogShell from "../components/BlogShell";
import { goals } from "../../content/blog-content";

export default function GoalsPage() {
  return (
    <BlogShell active="goals">
      <section className="mt-4 border border-slate-200 bg-white p-6 md:p-8">
        <p className="text-xs tracking-[0.16em] text-slate-500">GOAL BOARD</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">목표</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
          블로그 운영과 개인 성장 방향을 분명하게 유지하기 위한 목표 트래킹 공간입니다.
        </p>
      </section>

      <section className="mt-0 space-y-0">
        {goals.map((goal) => (
          <article key={goal} className="border border-slate-200 bg-white p-5">
            <p className="text-base font-medium text-slate-700">{goal}</p>
          </article>
        ))}
      </section>
    </BlogShell>
  );
}
