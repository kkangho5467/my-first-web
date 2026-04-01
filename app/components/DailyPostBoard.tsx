"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCommunityPosts } from "@/app/hooks/useCommunityPosts";

export default function DailyPostBoard() {
  const { posts, loading, createPost, updatePost, deletePost } = useCommunityPosts([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && content.trim().length > 0;
  }, [title, content]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    await createPost(title.trim(), content.trim());
    setTitle("");
    setContent("");
  }

  async function handleDelete(postId: string) {
    await deletePost(postId);
  }

  function startEdit(postId: string, postTitle: string, postContent: string) {
    setEditingPostId(postId);
    setEditingTitle(postTitle);
    setEditingContent(postContent);
  }

  function cancelEdit() {
    setEditingPostId(null);
    setEditingTitle("");
    setEditingContent("");
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingPostId || editingTitle.trim().length === 0 || editingContent.trim().length === 0) {
      return;
    }

    await updatePost(editingPostId, editingTitle.trim(), editingContent.trim());
    cancelEdit();
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
              value={content}
              onChange={(event) => setContent(event.target.value)}
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
          {posts.map((post) =>
            editingPostId === post.id ? (
              <li key={post.id} className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-slate-900">글 수정</h3>
                <form onSubmit={handleUpdate} className="mt-4 space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor={`edit-title-${post.id}`} className="text-sm font-medium text-slate-700">
                      제목
                    </label>
                    <input
                      id={`edit-title-${post.id}`}
                      type="text"
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-300 transition focus:ring"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor={`edit-content-${post.id}`} className="text-sm font-medium text-slate-700">
                      내용
                    </label>
                    <textarea
                      id={`edit-content-${post.id}`}
                      value={editingContent}
                      onChange={(event) => setEditingContent(event.target.value)}
                      rows={4}
                      className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-300 transition focus:ring"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={editingTitle.trim().length === 0 || editingContent.trim().length === 0}
                      className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                    >
                      취소
                    </button>
                  </div>
                </form>
              </li>
            ) : (
              <li key={post.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-slate-500">작성일 {post.date}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(post.id, post.title, post.excerpt)}
                      className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <Link
                  href={`/posts/${post.id}`}
                  className="mt-1 block text-base font-semibold text-slate-900 hover:underline"
                >
                  {post.title}
                </Link>
                <p className="mt-1 text-sm text-slate-600">{post.excerpt}</p>
              </li>
            )
          )}
        </ul>
      </section>
    </section>
  );
}
