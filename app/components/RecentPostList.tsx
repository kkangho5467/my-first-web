"use client";

import Link from "next/link";
import type { MockPost } from "@/content/blog-content";
import { useCommunityPosts } from "@/app/hooks/useCommunityPosts";

type RecentPostListProps = {
  initialPosts: MockPost[];
};

export default function RecentPostList({ initialPosts }: RecentPostListProps) {
  const { posts, loading } = useCommunityPosts(initialPosts);

  return (
    <section aria-label="최근 커뮤니티">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">최근 커뮤니티</h2>
      {loading ? <p className="mt-3 text-sm text-slate-500">게시글을 불러오는 중입니다...</p> : null}
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