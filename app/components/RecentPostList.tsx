import Link from "next/link";
import type { MockPost } from "@/content/blog-content";

type RecentPostListProps = {
  posts: MockPost[];
};

export default function RecentPostList({ posts }: RecentPostListProps) {
  return (
    <section aria-label="최근 글 목록">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">최근 글 목록</h2>
      <ul className="mt-6 space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="flex items-baseline justify-between gap-6">
            <span className="shrink-0 text-sm text-slate-400">{post.date}</span>
            <Link
              href={`/posts/${post.id}`}
              className="text-right text-base font-medium text-slate-900 decoration-slate-500/60 underline-offset-4 hover:underline"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}