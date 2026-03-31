import MainLayout from "../components/MainLayout";
import { dailyLines } from "../../content/blog-content";

export default function DailyPage() {
  return (
    <MainLayout>
      <section className="space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white p-6 md:p-8">
          <p className="text-xs tracking-[0.16em] text-slate-500">POST LIST</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">커뮤니티</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            최근 작성한 글을 한 눈에 확인할 수 있는 공간입니다.
          </p>
        </header>

        <section className="space-y-3">
        {dailyLines.map((line) => (
          <article key={line} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-base leading-7 text-slate-700">{line}</p>
          </article>
        ))}
        </section>
      </section>
    </MainLayout>
  );
}
