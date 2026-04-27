"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSafeSession, getSafeUser } from "@/lib/supabaseAuth";
import { supabase } from "@/lib/supabaseClient";
import { showGlobalToast } from "@/lib/toast";
import { useCommunityPosts } from "@/app/hooks/useCommunityPosts";
import { POSTS_PER_PAGE, paginatePosts } from "@/lib/paginatePosts";
import { searchPostsByTitleOrContent } from "@/lib/searchPosts";
import type { MockPost } from "@/content/blog-content";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORY_OPTIONS = ["자유수다", "질문/답변", "정보공유"] as const;
const EMPTY_INITIAL_POSTS: MockPost[] = [];

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
  const { posts, loading, errorMessage, refetchPosts, deletePost, deletePosts } = useCommunityPosts(EMPTY_INITIAL_POSTS);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const resetPagingState = () => {
    setCurrentPage(1);
    setSelectedPostIds([]);
  };

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
      // 로그인/로그아웃 즉시 반영해서 버튼 권한 UI를 동기화한다.
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

    try {
      await deletePost(postId, user, postAuthorId);
      showGlobalToast("글이 삭제되었습니다.");
    } catch (error) {
      if (error instanceof Error && error.message) {
        showGlobalToast(error.message);
        return;
      }
      showGlobalToast("글 삭제에 실패했습니다.");
    }
  }

  function goToEditPage(postId: string, postAuthorId: string) {
    // 권한 확인
    if (!isAdmin(user) && user?.id !== postAuthorId) {
      alert("수정 권한이 없습니다. 작성자나 관리자만 수정할 수 있습니다.");
      return;
    }

    router.push(`/posts/new?mode=edit&id=${postId}`);
  }

  const filteredPosts = useMemo(() => {
    // 카테고리 + 검색어를 함께 반영한 최종 목록.
    if (!selectedCategory) {
      return searchPostsByTitleOrContent(posts, query);
    }
    return searchPostsByTitleOrContent(
      posts.filter((post) => (post.category ?? "자유수다") === selectedCategory),
      query
    );
  }, [posts, selectedCategory, query]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));

  const activePage = Math.min(currentPage, totalPages);
  const validSelectedPostIds = useMemo(
    () => selectedPostIds.filter((id) => posts.some((post) => post.id === id)),
    [posts, selectedPostIds]
  );

  const paginatedPosts = useMemo(() => paginatePosts(filteredPosts, activePage), [filteredPosts, activePage]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setSelectedPostIds((prev) => prev.filter((id) => posts.some((post) => post.id === id)));
  }, [posts]);

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

  function handleQueryChange(value: string) {
    setQuery(value);
    resetPagingState();
  }

  function handleCategoryChange(category: string | null) {
    setSelectedCategory(category);
    resetPagingState();
  }

  async function handleDeleteSelectedPosts() {
    if (!isCurrentUserAdmin || validSelectedPostIds.length === 0) {
      return;
    }

    if (!window.confirm(`선택한 ${validSelectedPostIds.length}개의 글을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deletePosts(validSelectedPostIds, user);
      setSelectedPostIds([]);
      showGlobalToast("선택한 글이 삭제되었습니다.");
    } catch (error) {
      if (error instanceof Error && error.message) {
        showGlobalToast(error.message);
        return;
      }
      showGlobalToast("선택 삭제에 실패했습니다.");
    }
  }

  async function handleClickWriteButton() {
    const session = await getSafeSession();
    if (!session?.user) {
      router.push("/auth?notice=login-required");
      return;
    }

    router.push("/posts/new");
  }

  return (
    <section className="space-y-6 md:space-y-8">
      <div className="flex items-center justify-between gap-3">
        {isCurrentUserAdmin ? (
          <Button
            type="button"
            onClick={handleDeleteSelectedPosts}
            disabled={validSelectedPostIds.length === 0}
            variant="destructive"
            size="sm"
            className="md:text-sm"
          >
            선택 삭제 ({validSelectedPostIds.length})
          </Button>
        ) : (
          <div />
        )}
        <Button
          type="button"
          onClick={handleClickWriteButton}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          새 글 작성하기
        </Button>
      </div>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">커뮤니티</h2>

        <div className="mt-4">
          <label htmlFor="community-search" className="sr-only">
            게시글 검색
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm focus-within:border-slate-500">
            <span aria-hidden className="text-sm text-slate-400">
              ●
            </span>
            <Input
              id="community-search"
              type="text"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="제목 또는 내용으로 검색"
              className="w-full border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
            />
            {query.trim().length > 0 ? (
              <Button
                type="button"
                onClick={() => handleQueryChange("")}
                variant="outline"
                size="xs"
              >
                X
              </Button>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-slate-500">검색 결과 {filteredPosts.length}건</p>
        </div>
        
        {/* 카테고리 필터 버튼 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleCategoryChange(null)}
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
              onClick={() => handleCategoryChange(category)}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition md:px-4 md:py-2 md:text-sm ${
                getCategoryFilterButtonClass(category, selectedCategory === category)
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
            게시글 목록을 불러오는 중입니다...
          </div>
        ) : null}

        {!loading && errorMessage ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-4">
            <p className="text-sm text-red-700">{errorMessage}</p>
            <Button
              type="button"
              onClick={() => void refetchPosts()}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              다시 시도
            </Button>
          </div>
        ) : null}

        {!loading && !errorMessage && filteredPosts.length === 0 ? (
          <div className="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
            조건에 맞는 게시글이 없습니다.
          </div>
        ) : null}

        {!loading && !errorMessage && filteredPosts.length > 0 ? (
          <ul className="mt-5 space-y-3 md:space-y-3">
            {paginatedPosts.map((post) => (
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
                        checked={validSelectedPostIds.includes(post.id)}
                        onChange={(event) => handleTogglePostSelection(post.id, event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900"
                      />
                    ) : null}
                    </div>
                    <p className="text-xs leading-5 text-slate-500 md:text-xs md:leading-5">작성일 {post.date} · 글쓴이: {post.author_name}</p>
                  </div>
                  <div className="flex shrink-0 flex-nowrap gap-1.5">
                    {(isAdmin(user) || user?.id === post.author_id) && (
                      <Button
                        type="button"
                        onClick={() => goToEditPage(post.id, post.author_id)}
                        variant="outline"
                        size="xs"
                        className="whitespace-nowrap"
                      >
                        수정
                      </Button>
                    )}
                    {(isAdmin(user) || user?.id === post.author_id) && (
                      <Button
                        type="button"
                        onClick={() => handleDelete(post.id, post.author_id)}
                        variant="outline"
                        size="xs"
                        className="whitespace-nowrap"
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-start gap-2.5">
                  {post.thumbnail_url ? (
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 md:h-24 md:w-24">
                      <Image
                        src={post.thumbnail_url}
                        alt="게시글 썸네일"
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
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
            ))}
          </ul>
        ) : null}

        {!loading && !errorMessage && filteredPosts.length > POSTS_PER_PAGE ? (
          <nav className="mt-6 flex items-center justify-center gap-2" aria-label="커뮤니티 페이지네이션">
            <Button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={activePage === 1}
              variant="outline"
            >
              이전
            </Button>
            {pageNumbers.map((pageNumber) => (
              <Button
                key={pageNumber}
                type="button"
                onClick={() => setCurrentPage(pageNumber)}
                className={`min-w-9 ${
                  activePage === pageNumber
                    ? "bg-foreground text-background"
                    : ""
                }`}
                variant={activePage === pageNumber ? "default" : "outline"}
                aria-current={activePage === pageNumber ? "page" : undefined}
              >
                {pageNumber}
              </Button>
            ))}
            <Button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={activePage === totalPages}
              variant="outline"
            >
              다음
            </Button>
          </nav>
        ) : null}
      </section>
    </section>
  );
}

