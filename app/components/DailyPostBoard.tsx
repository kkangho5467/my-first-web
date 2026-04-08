"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSafeSession, getSafeUser } from "@/lib/supabaseAuth";
import { supabase } from "@/lib/supabaseClient";
import { showGlobalToast } from "@/lib/toast";
import { useCommunityPosts } from "@/app/hooks/useCommunityPosts";
import { POSTS_PER_PAGE, paginatePosts } from "@/lib/paginatePosts";
import type { User } from "@supabase/supabase-js";

const CATEGORY_OPTIONS = ["자유수다", "질문/답변", "정보공유"] as const;

function isAdmin(user: User | null): boolean {
  if (!user?.email && !user?.id) {
    return false;
  }
  
  const emailPrefix = user.email?.split("@")[0];
  if (emailPrefix === "admin5467" || emailPrefix === "kkangho5467") {
    return true;
  }
  
  if (user.id === "admin5467" || user.id === "kkangho5467") {
    return true;
  }
  
  return false;
}

function stripHtmlTags(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").substring(0, 100);
}

function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case "질문/답변":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "정보공유":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "자유수다":
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function getCategoryFilterButtonClass(category: string, isActive: boolean): string {
  switch (category) {
    case "질문/답변":
      return isActive
        ? "border-emerald-700 bg-emerald-600 text-white"
        : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100";
    case "정보공유":
      return isActive
        ? "border-sky-700 bg-sky-600 text-white"
        : "border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100";
    case "자유수다":
    default:
      return isActive
        ? "border-amber-700 bg-amber-600 text-white"
        : "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100";
  }
}

export default function DailyPostBoard() {
  const { posts, updatePost, deletePost, deletePosts } = useCommunityPosts([]);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingAuthorId, setEditingAuthorId] = useState<string>("");
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

  const isCurrentUserAdmin = isAdmin(user);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const nextUser = await getSafeUser();

      if (isMounted) {
        setUser(nextUser);
      }
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleDelete(postId: string, postAuthorId: string) {
    if (!window.confirm("글을 삭제하시겠습니까?")) {
      return;
    }
    await deletePost(postId, user, postAuthorId);
    showGlobalToast("글이 삭제되었습니다.");
  }

  function startEdit(postId: string, postAuthorId: string, postTitle: string, postContent: string) {
    // 권한 확인
    if (!isAdmin(user) && user?.id !== postAuthorId) {
      alert("수정 권한이 없습니다. 작성자나 관리자만 수정할 수 있습니다.");
      return;
    }

    setEditingPostId(postId);
    setEditingAuthorId(postAuthorId);
    setEditingTitle(postTitle);
    setEditingContent(postContent);
  }

  function cancelEdit() {
    setEditingPostId(null);
    setEditingAuthorId("");
    setEditingTitle("");
    setEditingContent("");
  }

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) {
      return posts;
    }
    return posts.filter((post) => (post.category ?? "자유수다") === selectedCategory);
  }, [posts, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
    setSelectedPostIds([]);
  }, [selectedCategory]);

  useEffect(() => {
    setSelectedPostIds((prev) => prev.filter((id) => posts.some((post) => post.id === id)));
  }, [posts]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedPosts = useMemo(() => paginatePosts(filteredPosts, currentPage), [filteredPosts, currentPage]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  );

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingPostId || editingTitle.trim().length === 0 || editingContent.trim().length === 0) {
      return;
    }

    // 권한 재확인
    if (!isAdmin(user) && user?.id !== editingAuthorId) {
      alert("수정 권한이 없습니다. 작성자나 관리자만 수정할 수 있습니다.");
      return;
    }

    if (!window.confirm("글을 저장하시겠습니까?")) {
      return;
    }

    await updatePost(editingPostId, editingTitle.trim(), editingContent.trim());
    cancelEdit();
  }

  function handleTogglePostSelection(postId: string, checked: boolean) {
    setSelectedPostIds((prev) => {
      if (checked) {
        if (prev.includes(postId)) {
          return prev;
        }
        return [...prev, postId];
      }
      return prev.filter((id) => id !== postId);
    });
  }

  async function handleDeleteSelectedPosts() {
    if (!isCurrentUserAdmin || selectedPostIds.length === 0) {
      return;
    }

    if (!window.confirm(`선택한 ${selectedPostIds.length}개의 글을 삭제하시겠습니까?`)) {
      return;
    }

    await deletePosts(selectedPostIds, user);
    setSelectedPostIds([]);
    showGlobalToast("선택한 글이 삭제되었습니다.");
  }

  async function handleClickWriteButton() {
    const session = await getSafeSession();
    if (!session?.user) {
      router.push("/auth?notice=login-required");
      return;
    }

    router.push("/community/write");
  }

  return (
    <section className="space-y-6 md:space-y-8">
      <div className="flex items-center justify-between gap-3">
        {isCurrentUserAdmin ? (
          <button
            type="button"
            onClick={handleDeleteSelectedPosts}
            disabled={selectedPostIds.length === 0}
            className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            선택 삭제 ({selectedPostIds.length})
          </button>
        ) : (
          <div />
        )}
        <button
          type="button"
          onClick={handleClickWriteButton}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          새 글 작성하기
        </button>
      </div>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">커뮤니티</h2>
        
        {/* 카테고리 필터 버튼 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`rounded-lg px-3.5 py-2 text-xs font-medium transition md:px-4 md:py-2 md:text-sm ${
              selectedCategory === null
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            모든 글
          </button>
          {CATEGORY_OPTIONS.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition md:px-4 md:py-2 md:text-sm ${
                getCategoryFilterButtonClass(category, selectedCategory === category)
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <ul className="mt-5 space-y-3 md:space-y-3">
          {paginatedPosts.map((post) =>
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
              <li key={post.id} className="rounded-lg border border-slate-200 bg-white px-3 py-3 md:px-4 md:py-3">
                <div className="flex items-start justify-between gap-3 md:gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium md:px-2 md:py-0.5 md:text-xs ${getCategoryBadgeClass(
                        post.category ?? "자유수다"
                      )}`}
                    >
                      {post.category ?? "자유수다"}
                    </span>
                    {isCurrentUserAdmin ? (
                      <input
                        type="checkbox"
                        aria-label="삭제할 글 선택"
                        checked={selectedPostIds.includes(post.id)}
                        onChange={(event) => handleTogglePostSelection(post.id, event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900"
                      />
                    ) : null}
                    </div>
                    <p className="text-xs leading-5 text-slate-500 md:text-xs md:leading-5">작성일 {post.date} · 글쓴이: {post.author_name}</p>
                  </div>
                  <div className="flex shrink-0 flex-nowrap gap-1.5">
                    {(isAdmin(user) || user?.id === post.author_id) && (
                      <button
                        type="button"
                        onClick={() => startEdit(post.id, post.author_id, post.title, post.excerpt)}
                        className="whitespace-nowrap rounded border border-slate-300 px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:px-2 md:py-1 md:text-xs"
                      >
                        수정
                      </button>
                    )}
                    {(isAdmin(user) || user?.id === post.author_id) && (
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id, post.author_id)}
                        className="whitespace-nowrap rounded border border-slate-300 px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:px-2 md:py-1 md:text-xs"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-start gap-2.5">
                  {post.thumbnail_url ? (
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 md:h-24 md:w-24">
                      <img
                        src={post.thumbnail_url}
                        alt="게시글 썸네일"
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/posts/${post.id}`}
                      className="block text-base font-semibold leading-6 text-slate-900 hover:underline md:text-base md:leading-6"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-1 text-sm leading-5 text-slate-600 md:text-sm md:leading-5">{stripHtmlTags(post.excerpt)}</p>
                  </div>
                </div>
              </li>
            )
          )}
        </ul>

        {filteredPosts.length > POSTS_PER_PAGE ? (
          <nav className="mt-6 flex items-center justify-center gap-2" aria-label="커뮤니티 페이지네이션">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              이전
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setCurrentPage(pageNumber)}
                className={`h-9 min-w-9 rounded-md border px-3 text-sm font-medium transition ${
                  currentPage === pageNumber
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
                aria-current={currentPage === pageNumber ? "page" : undefined}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              다음
            </button>
          </nav>
        ) : null}
      </section>
    </section>
  );
}
