"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MockPost } from "@/content/blog-content";
import { useCommunityPosts } from "@/app/hooks/useCommunityPosts";

type DailyPostBoardProps = {
  initialPosts: MockPost[];
};

function formatKoreaDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .split("-");

  return `${parts[0]}-${parts[1]}-${parts[2]}`;
}

export default function DailyPostBoard({ initialPosts }: DailyPostBoardProps) {
  const { posts, addPost, removePost } = useCommunityPosts(initialPosts);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && excerpt.trim().length > 0;
  }, [title, excerpt]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const newPost: MockPost = {
      id: `user-${Date.now()}`,
      title: title.trim(),
      excerpt: excerpt.trim(),
      date: formatKoreaDate(),
    };

    addPost(newPost);
    setTitle("");
    setExcerpt("");
  }

  function handleDelete(postId: string) {
    removePost(postId);
  }

  return (
    <section className="space-y-8">
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
        <h2 className="text-xl font-semibold text-slate-900">글 작성</h2>
        <p className="mt-1 text-sm text-slate-500">제목과 내용을 입력하면 목록 맨 위에 새 글이 추가됩니다.</p>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="post-title" className="text-sm font-medium text-slate-700">
              제목
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="글 제목을 입력하세요"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-300 transition focus:ring"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="post-excerpt" className="text-sm font-medium text-slate-700">
              내용
            </label>
            <textarea
              id="post-excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="짧은 내용을 입력하세요"
              rows={4}
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-300 transition focus:ring"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            글 등록
          </button>
        </div>
      </form>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">커뮤니티</h2>
        <ul className="mt-5 space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs text-slate-500">작성일 {post.date}</p>
                <button
                  type="button"
                  onClick={() => handleDelete(post.id)}
                  className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  삭제
                </button>
              </div>
              <Link
                href={`/posts/${post.id}`}
                className="mt-1 block text-base font-semibold text-slate-900 hover:underline"
              >
                {post.title}
              </Link>
              <p className="mt-1 text-sm text-slate-600">{post.excerpt}</p>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
