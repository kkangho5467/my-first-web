import MainLayout from "../components/MainLayout";
import { goals } from "../../content/blog-content";

export default function GoalsPage() {
  return (
    <MainLayout>
      <section className="space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white p-6 md:p-8">
          <p className="text-xs tracking-[0.16em] text-slate-500">GOALS</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">목표</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            운영 목표와 개인 성장 목표를 꾸준히 점검하는 공간입니다.
          </p>
        </header>

        <section className="space-y-3">
        {goals.map((goal) => (
          <article key={goal} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-base font-medium text-slate-700">{goal}</p>
          </article>
        ))}
        </section>
      </section>
    </MainLayout>
  );
}
