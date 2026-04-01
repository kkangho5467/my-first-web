import MainLayout from "./components/MainLayout";
import RecentPostList from "./components/RecentPostList";
import { mockPosts } from "@/content/blog-content";

export default function Home() {
  return (
    <MainLayout>
      <section className="space-y-10">
        <header className="py-20 md:py-28">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            안녕하세요, 김강호입니다.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500 md:text-lg">
            웹 프론트엔드와 블로그 제작 과정을 기록하는 개발자입니다. 실습 과정에서 배운 점과 구현
            경험을 짧고 읽기 쉽게 정리해 공유합니다.
          </p>
        </header>

        <RecentPostList posts={mockPosts} />
      </section>
    </MainLayout>
  );
}
