import MainLayout from "../components/MainLayout";
import Link from "next/link";
import { mockPosts } from "../../content/blog-content";

export default function DailyPage() {
  return (
    <MainLayout>
      <section className="space-y-6">
        <header className="p-1">
          <p className="text-xs tracking-[0.16em] text-slate-500">POST LIST</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">글 목록</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            최근 작성한 글을 날짜와 제목으로 간단히 확인할 수 있습니다.
          </p>
        </header>

        <ul className="space-y-5">
          {mockPosts.map((post) => (
            <li key={post.id}>
              <p className="text-sm text-slate-500">작성일 {post.date}</p>
              <Link
                href={`/posts/${post.id}`}
                className="mt-1 block text-lg font-medium text-slate-900 hover:underline"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </MainLayout>
  );
}
