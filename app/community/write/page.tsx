"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/app/components/MainLayout";
import QuillEditor from "@/app/components/QuillEditor";
import { createPostInSupabase, fetchPostById, updatePostInSupabase } from "@/app/hooks/useCommunityPosts";
import { getSafeSession } from "@/lib/supabaseAuth";
import { uploadImageToSupabase } from "@/lib/uploadImageToSupabase";

const CATEGORY_OPTIONS = ["자유수다", "질문/답변", "정보공유"] as const;

type Category = (typeof CATEGORY_OPTIONS)[number];

export default function CommunityWritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const editingPostId = searchParams.get("id");
  // mode=edit&id=... 쿼리일 때 기존 글 수정 모드로 진입한다.
  const isEditMode = mode === "edit" && Boolean(editingPostId);
  const [category, setCategory] = useState<Category>("자유수다");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);

  function isAdminByUserId(userId: string | undefined, email?: string | null) {
    if (!userId && !email) {
      return false;
    }

    const emailPrefix = email?.split("@")[0];
    return emailPrefix === "admin5467" || emailPrefix === "kkangho5467" || userId === "admin5467" || userId === "kkangho5467";
  }

  useEffect(() => {
    let isMounted = true;

    async function guardWritePageAccess() {
      // 작성 화면은 로그인 사용자만 접근 가능하다.
      const session = await getSafeSession();

      if (!isMounted) {
        return;
      }

      if (!session?.user) {
        router.push("/auth?notice=login-required");
      }
    }

    void guardWritePageAccess();

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!isEditMode || !editingPostId) {
      return;
    }

    const postId = editingPostId;

    let isMounted = true;

    async function loadDraft() {
      setIsLoadingDraft(true);

      try {
        const session = await getSafeSession();

        if (!session?.user) {
          router.push("/auth?notice=login-required");
          return;
        }

        const post = await fetchPostById(postId);

        if (!post) {
          alert("게시글을 찾을 수 없습니다.");
          router.push("/daily");
          return;
        }

        const canEdit = isAdminByUserId(session.user.id, session.user.email) || session.user.id === post.author_id;

        if (!canEdit) {
          // 작성자/관리자 외에는 편집 모드 접근을 막는다.
          alert("수정 권한이 없습니다. 작성자나 관리자만 수정할 수 있습니다.");
          router.push(`/posts/${postId}`);
          return;
        }

        if (!isMounted) {
          return;
        }

        setCategory((post.category as Category) || "자유수다");
        setTitle(post.title || "");
        setContent(post.content || "");
      } finally {
        if (isMounted) {
          setIsLoadingDraft(false);
        }
      }
    }

    void loadDraft();

    return () => {
      isMounted = false;
    };
  }, [editingPostId, isEditMode, router]);

  function extractThumbnailUrl(html: string): string | null {
    try {
      // 본문 첫 이미지 URL을 썸네일로 사용한다.
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const imgElement = doc.querySelector("img");

      if (imgElement) {
        return imgElement.src;
      }
    } catch (error) {
      console.warn("Failed to parse HTML for thumbnail:", error);
    }

    // 파싱 실패 시 정규식으로 한 번 더 시도한다.
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/);
    return match ? match[1] : null;
  }

  async function handleSubmit() {
    const session = await getSafeSession();
    if (!session?.user) {
      router.push("/auth?notice=login-required");
      return;
    }

    const currentEditingPostId = editingPostId ?? "";

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!trimmedContent) {
      alert("본문을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const thumbnailUrl = extractThumbnailUrl(trimmedContent);

      if (isEditMode && currentEditingPostId) {
        await updatePostInSupabase(currentEditingPostId, trimmedTitle, trimmedContent, category, thumbnailUrl);
        alert("글이 수정되었습니다.");
        router.push(`/posts/${currentEditingPostId}`);
      } else {
        await createPostInSupabase(trimmedTitle, trimmedContent, category, thumbnailUrl);
        alert("글이 등록되었습니다.");
        router.push("/daily");
      }
    } catch (error) {
      console.error("Failed to save post:", error instanceof Error ? error.message : error);
      alert(isEditMode ? "글 수정에 실패했습니다." : "글 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const pageTitle = isEditMode ? "글 수정" : "커뮤니티 글 작성";
  const pageDescription = isEditMode
    ? "기존 게시글 내용을 수정하고 저장하세요."
    : "말머리를 선택하고 제목을 입력해 게시글 초안을 준비하세요.";
  const submitLabel = isEditMode ? "수정하기" : "등록하기";
  const submitPendingLabel = isEditMode ? "수정 중..." : "등록 중...";
  const cancelTarget = isEditMode && editingPostId ? `/posts/${editingPostId}` : "/daily";

  return (
    <MainLayout>
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{pageTitle}</h1>
          <p className="mt-2 text-sm text-slate-500">{pageDescription}</p>
        </header>

        {isEditMode && isLoadingDraft ? (
          <p className="mb-6 text-sm text-slate-500">기존 게시글을 불러오는 중입니다...</p>
        ) : null}

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="community-category" className="text-sm font-medium text-slate-700">
              말머리
            </label>
            <select
              id="community-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-blue-300 transition focus:ring"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="community-title" className="text-sm font-medium text-slate-700">
              제목
            </label>
            <input
              id="community-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="제목을 입력하세요"
              className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg text-slate-900 outline-none ring-blue-300 transition focus:ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">본문</label>
            <div className="overflow-hidden rounded-xl border border-slate-300 [&_.ql-container]:min-h-[52vh] [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[52vh] [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-300 md:[&_.ql-container]:min-h-[60vh] md:[&_.ql-editor]:min-h-[60vh]">
              <QuillEditor
                value={content}
                onChange={setContent}
                placeholder="본문을 입력하세요"
                onImageUpload={uploadImageToSupabase}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(cancelTarget)}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="rounded-xl border border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? submitPendingLabel : submitLabel}
          </button>
        </div>
      </section>

    </MainLayout>
  );
}
