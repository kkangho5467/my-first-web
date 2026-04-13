"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { MockPost } from "@/content/blog-content";
import type { User } from "@supabase/supabase-js";
import { getSafeUser } from "@/lib/supabaseAuth";
import { supabase } from "@/lib/supabaseClient";
import { 
  deletePostInSupabase,
  fetchPostById,
  incrementPostViews 
} from "@/app/hooks/useCommunityPosts";
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
  if (emailPrefix === "admin5467" || emailPrefix === "kkangho5467") {
    return true;
  }
  
  if (user.id === "admin5467" || user.id === "kkangho5467") {
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
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const canEditPost = post && (isAdmin(currentUser) || currentUser?.id === post.author_id);
  
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const user = await getSafeUser();

      if (isMounted) {
        setCurrentUser(user);
      }
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // 인증 상태 변경을 즉시 반영해 댓글/수정/삭제 권한 UI를 맞춘다.
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
    // 서버 컴포넌트에서 initialPost를 내려준 경우 중복 fetch를 생략한다.
    if (initialPost) {
      return;
    }

    async function loadPost() {
      setIsLoadingPost(true);
      try {
        const postData = await fetchPostById(id);
        
        if (postData) {
          const mockPost: MockPost = {
            id: postData.id,
            title: postData.title,
            excerpt: postData.content,
            date: new Intl.DateTimeFormat("ko-KR", {
              timeZone: "Asia/Seoul",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(postData.created_at || "")),
            author_name: postData.author_name || "익명",
            author_id: postData.author_id || "",
            views: (postData.views as number) || 0,
            category: (postData.category as string) || "자유수다",
            likes: (postData.likes as number) || 0,
            created_at: postData.created_at,
          };

          setPost(mockPost);
          setLikeCount((postData.likes as number) || 0);

          // 조회수는 부가 기능이므로 실패해도 페이지 렌더링은 계속 진행한다.
          await incrementPostViews(id);
        } else {
          setPost(null);
        }
      } catch (error) {
        console.warn("Failed to load post:", error);
        setPost(null);
      } finally {
        setIsLoadingPost(false);
      }
    }

    void loadPost();
  }, [id, initialPost]);

  useEffect(() => {
    void refetchComments();
  }, [id]);

  async function handleCreateComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      router.push("/auth?notice=login-required");
      return;
    }

    const content = newComment.trim();

    if (!content) {
      return;
    }

    if (!window.confirm("댓글을 등록하시겠습니까?")) {
      return;
    }

    try {
      await insertComment(id, content, currentUser);
      await refetchComments();
      setNewComment("");
    } catch (error) {
      console.warn("Failed to create comment:", error);
    }
  }

  async function handleDeleteComment(comment: PostComment) {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) {
      return;
    }

    await deleteMyComment(comment.postId, comment.content, comment.createdAt, comment.authorId, currentUser);
    await refetchComments();
  }

  function handleStartPostEdit() {
    if (!post) {
      return;
    }

    // 권한 확인
    if (!isAdmin(currentUser) && currentUser?.id !== post.author_id) {
      alert("수정 권한이 없습니다. 작성자나 관리자만 수정할 수 있습니다.");
      return;
    }

    router.push(`/community/write?mode=edit&id=${post.id}`);
  }

  async function handleDeletePost() {
    if (!post) {
      return;
    }

    if (!window.confirm("글을 삭제하시겠습니까?")) {
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
      {/* 네비게이션 */}
      <Link
        href="/daily"
        className="inline-flex items-center text-sm text-gray-500 transition hover:text-gray-700"
      >
        ← 목록으로 돌아가기
      </Link>

      {/* 게시글 컨테이너 */}
      <div className="w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        {/* 헤더 영역 */}
        <header className="border-b border-gray-200 pb-6">
          {/* 카테고리 뱃지 */}
          <div className="mb-4">
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {post.category || "자유수다"}
            </span>
          </div>

          {/* 제목 */}
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">
            {post.title}
          </h1>

          {/* 메타 정보 */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{post.author_name}</span>
            <span>·</span>
            <time dateTime={post.created_at || post.date}>{post.date}</time>
            <span>·</span>
            <span>조회수 {post.views || 0}</span>
          </div>
        </header>

        {/* 본문 영역 */}
        <div 
          className="ql-editor py-8 text-lg leading-8 text-gray-800 prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.excerpt }}
        />

        {/* 액션 버튼 (수정/삭제) */}
        {canEditPost && (
          <div className="mb-6 flex justify-end gap-2 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={handleStartPostEdit}
              className="rounded-lg px-3 py-2 text-xs text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            >
              수정
            </button>
            <button
              type="button"
              onClick={handleDeletePost}
              className="rounded-lg px-3 py-2 text-xs text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            >
              삭제
            </button>
          </div>
        )}

        {/* 좋아요 버튼 */}
        <div className="flex justify-center border-t border-gray-200 py-6">
          <button
            onClick={() => {
              setIsLiked(!isLiked);
              setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
            }}
            type="button"
            className={`flex items-center gap-2 rounded-lg border-2 px-6 py-3 font-medium transition ${
              isLiked
                ? "border-red-400 bg-red-50 text-red-600 hover:bg-red-100"
                : "border-gray-300 bg-white text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-500"
            }`}
          >
            <span className="text-xl">♥</span>
            <span>{isLiked ? `좋아요 ${likeCount}` : "좋아요"}</span>
          </button>
        </div>
      </div>

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
            disabled={currentUser ? newComment.trim().length === 0 : false}
            className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {currentUser ? "댓글 등록" : "로그인 후 이용"}
          </button>
        </form>

        <ul className="mt-6 space-y-3">
          {comments.map((comment, index) => (
            <li
              key={`${comment.postId}-${comment.createdAt}-${index}`}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  작성자: <span className="font-medium">{comment.authorName}</span> · {formatKoreaDateTime(comment.createdAt)}
                </p>
                {(isAdmin(currentUser) || currentUser?.id === comment.authorId) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(comment)}
                    className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-100"
                  >
                    삭제
                  </button>
                )}
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
