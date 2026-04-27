import MainLayout from "@/app/components/MainLayout";
import DailyPostBoard from "@/app/components/DailyPostBoard";

export default function PostsPage() {
  return (
    <MainLayout>
      <section className="space-y-8">
        <header className="p-1">
          <p className="text-xs tracking-[0.16em] text-slate-500">POST LIST</p>
          <h1 className="mt-2 text-[1.75rem] font-bold tracking-tight text-slate-900 md:text-3xl">커뮤니티</h1>
          <p className="mt-3 max-w-2xl text-xs leading-6 text-slate-600 md:text-base md:leading-7">
            글을 직접 작성하고, 작성된 글들을 목록에서 바로 확인할 수 있습니다.
          </p>
        </header>

        <DailyPostBoard />
      </section>
    </MainLayout>
  );
}
