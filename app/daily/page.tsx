import MainLayout from "../components/MainLayout";
import DailyPostBoard from "../components/DailyPostBoard";
import { mockPosts } from "../../content/blog-content";

export default function DailyPage() {
  return (
    <MainLayout>
      <section className="space-y-8">
        <header className="p-1">
          <p className="text-xs tracking-[0.16em] text-slate-500">POST LIST</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">커뮤니티</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            글을 직접 작성하고, 작성된 글들을 목록에서 바로 확인할 수 있습니다.
          </p>
        </header>

        <DailyPostBoard initialPosts={mockPosts} />
      </section>
    </MainLayout>
  );
}
