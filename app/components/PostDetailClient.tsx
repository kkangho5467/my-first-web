"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { MockPost } from "@/content/blog-content";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { fetchCommunityPosts, updatePostInSupabase, deletePostInSupabase } from "@/app/hooks/useCommunityPosts";
import { deleteMyComment, fetchCommentsByPostId, insertComment, type PostComment } from "@/app/hooks/usePostComments";
import PostDetailSkeleton from "./PostDetailSkeleton";

type PostDetailClientProps = {
  id: string;
  initialPost: MockPost | null;
};

function isAdmin(user: User | null): boolean {
  if (!user?.email && !user?.id) {
    return false;
  }
  
  const emailPrefix = user.email?.split("@")[0];
  if (emailPrefix === "admin5467") {
    return true;
  }
  
  if (user.id === "admin5467") {
    return true;
  }
  
  return false;
}

function formatKoreaDateTime(raw: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(raw));
}

export default function PostDetailClient({ id, initialPost }: PostDetailClientProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [post, setPost] = useState<MockPost | null>(initialPost);
  const [isLoadingPost, setIsLoadingPost] = useState(!initialPost);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingExcerpt, setEditingExcerpt] = useState("");
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  const isUserCreatedPost = typeof post?.id === "string" && post.id.startsWith("user-");
  
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (isMounted) {
        setCurrentUser(data.user);
      }
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setCurrentUser(session?.user ?? null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function refetchComments() {
    setCommentsLoading(true);
    try {
      const nextComments = await fetchCommentsByPostId(id);
      setComments(nextComments);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }

  useEffect(() => {
    if (initialPost) {
      return;
    }

    async function loadPost() {
      try {
        const posts = await fetchCommunityPosts();
        const matched = posts.find((item) => String(item.id) === id) ?? null;
        setPost(matched);
      } catch (error) {
        console.error("Failed to fetch post detail from Supabase:", error);
        setPost(null);
      } finally {
        setIsLoadingPost(false);
      }
    }

    loadPost();
  }, [id, initialPost]);

  useEffect(() => {
    void refetchComments();
  }, [id]);

  async function handleCreateComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = newComment.trim();

    if (!content) {
      return;
    }

    await insertComment(id, content);
    await refetchComments();
    setNewComment("");
  }

  async function handleDeleteComment(comment: PostComment) {
    await deleteMyComment(comment.postId, comment.content, comment.createdAt);
    await refetchComments();
  }

  function handleStartPostEdit() {
    if (!post) {
      return;
    }

    setEditingTitle(post.title);
    setEditingExcerpt(post.excerpt);
    setIsEditingPost(true);
  }

  function handleCancelPostEdit() {
    setIsEditingPost(false);
    setEditingTitle("");
    setEditingExcerpt("");
  }

  async function handleSavePostEdit() {
    if (!post) {
      return;
    }

    const nextTitle = editingTitle.trim();
    const nextExcerpt = editingExcerpt.trim();

    if (!nextTitle || !nextExcerpt) {
      return;
    }

    const updatedPost: MockPost = {
      ...post,
      title: nextTitle,
      excerpt: nextExcerpt,
    };

    await updatePostInSupabase(post.id, updatedPost.title, updatedPost.excerpt);

    try {
      const posts = await fetchCommunityPosts();
      const matched = posts.find((item) => item.id === post.id) ?? updatedPost;
      setPost(matched);
    } catch (error) {
      console.error("Failed to refetch posts after update:", error);
      setPost(updatedPost);
    }

    setIsEditingPost(false);
    setEditingTitle("");
    setEditingExcerpt("");
  }

  async function handleDeletePost() {
    if (!post) {
      return;
    }

    await deletePostInSupabase(post.id, currentUser, post.author_id);
    router.push("/daily");
  }

  if (isLoadingPost) {
    return (
      <section className="space-y-4">
        <Link
          href="/daily"
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-700 transition-colors hover:bg-slate-100"
        >
          <span aria-hidden>{"<-"}</span>
          <span>커뮤니티로 돌아가기</span>
        </Link>
        <p className="text-sm text-slate-500">게시글 정보를 불러오는 중입니다...</p>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="space-y-4">
        <Link
          href="/daily"
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-700 transition-colors hover:bg-slate-100"
        >
          <span aria-hidden>{"<-"}</span>
          <span>커뮤니티로 돌아가기</span>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">글을 찾을 수 없습니다.</h1>
        <p className="text-sm text-slate-600">삭제되었거나 잘못된 주소일 수 있습니다.</p>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <Link
        href="/daily"
        className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-700 transition-colors hover:bg-slate-100"
      >
        <span aria-hidden>{"<-"}</span>
        <span>커뮤니티로 돌아가기</span>
      </Link>

      <PostDetailSkeleton title={post.title} date={post.date} author_name={post.author_name}>
        <p>{post.excerpt}</p>
      </PostDetailSkeleton>

      {(isAdmin(currentUser) || currentUser?.id === post.author_id) && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">게시글 관리</h2>
            <div className="flex gap-2">
              {!isEditingPost ? (
                <>
                  <button
                    type="button"
                    onClick={handleStartPostEdit}
                    className="rounded border border-slate-300 px-3 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    수정 시작
                  </button>
                  <button
                    type="button"
                    onClick={handleDeletePost}
                    className="rounded border border-red-300 px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50"
                  >
                    삭제
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {isEditingPost ? (
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="edit-post-title" className="text-sm font-medium text-slate-700">
                  제목
                </label>
                <input
                  id="edit-post-title"
                  type="text"
                  value={editingTitle}
                  onChange={(event) => setEditingTitle(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-300 transition focus:ring"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-post-excerpt" className="text-sm font-medium text-slate-700">
                  내용
                </label>
                <textarea
                  id="edit-post-excerpt"
                  value={editingExcerpt}
                  onChange={(event) => setEditingExcerpt(event.target.value)}
                  rows={4}
                  className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-300 transition focus:ring"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSavePostEdit}
                  disabled={editingTitle.trim().length === 0 || editingExcerpt.trim().length === 0}
                  className="rounded border border-slate-300 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={handleCancelPostEdit}
                  className="rounded border border-slate-300 px-3 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-100"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">게시글을 수정하거나 삭제할 수 있습니다.</p>
          )}
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
        <h2 className="text-xl font-semibold text-slate-900">댓글</h2>
        <p className="mt-1 text-sm text-slate-500">댓글을 작성하거나 삭제할 수 있습니다.</p>

        <form onSubmit={handleCreateComment} className="mt-4 space-y-3">
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="댓글을 입력하세요"
            rows={3}
            className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-300 transition focus:ring"
          />
          <button
            type="submit"
            disabled={newComment.trim().length === 0}
            className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            댓글 등록
          </button>
        </form>

        <ul className="mt-6 space-y-3">
          {comments.map((comment, index) => (
            <li
              key={`${comment.postId}-${comment.createdAt}-${index}`}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">작성 {formatKoreaDateTime(comment.createdAt)}</p>
                <button
                  type="button"
                  onClick={() => handleDeleteComment(comment)}
                  className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-100"
                >
                  삭제
                </button>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{comment.content}</p>
            </li>
          ))}
        </ul>

        {comments.length === 0 ? (
          <p className="mt-5 text-sm text-slate-500">아직 댓글이 없습니다.</p>
        ) : null}
      </section>
    </section>
  );
}
