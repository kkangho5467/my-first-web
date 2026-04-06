"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/app/components/MainLayout";
import { createPostInSupabase } from "@/app/hooks/useCommunityPosts";
import { supabase } from "@/lib/supabaseClient";
import type QuillType from "quill";
import "quill/dist/quill.snow.css";

const CATEGORY_OPTIONS = ["자유수다", "질문/답변", "정보공유"] as const;

type Category = (typeof CATEGORY_OPTIONS)[number];

const QUILL_SIZE_OPTIONS = ["10px", "12px", "14px", "16px", "18px", "20px", "24px", "30px"] as const;

async function uploadImageToSupabase(file: File): Promise<string> {
  // 확장자만 추출 (예: .png, .jpg)
  const extension = file.name.substring(file.name.lastIndexOf('.')) || '';
  
  // 순수 영문과 숫자로만 이루어진 고유한 파일명 생성
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${extension}`;

  try {
    const { data, error } = await supabase.storage.from("images").upload(fileName, file);

    if (error) {
      console.error("Image upload error:", error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Failed to upload image:", error);
    throw new Error("이미지 업로드에 실패했습니다.");
  }
}

export default function CommunityWritePage() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("자유수다");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillType | null>(null);
  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function guardWritePageAccess() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted) {
          return;
        }

        if (error || !data.session?.user) {
          router.push("/auth?notice=login-required");
        }
      } catch {
        if (isMounted) {
          router.push("/auth?notice=login-required");
        }
      }
    }

    void guardWritePageAccess();

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    async function setupEditor() {
      if (!isMounted || !editorRef.current || quillRef.current) {
        return;
      }

      const Quill = (await import("quill")).default;

      const Size = Quill.import("attributors/style/size");
      Size.whitelist = [...QUILL_SIZE_OPTIONS];
      Quill.register(Size, true);

      // 개발 모드(HMR/StrictMode)에서 툴바가 중복 생성되는 경우를 방지한다.
      const editorParent = editorRef.current.parentElement;
      if (editorParent) {
        editorParent.querySelectorAll(".ql-toolbar").forEach((toolbarElement) => {
          toolbarElement.remove();
        });
      }
      editorRef.current.innerHTML = "";

      const editor = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "본문을 입력하세요",
        modules: {
          toolbar: [
            [{ size: [...QUILL_SIZE_OPTIONS] }],
            ["bold", "italic", "underline"],
            [{ align: [] }],
            ["link", "image"],
            [{ list: "ordered" }, { list: "bullet" }],
          ],
        },
      } as any);

      // 커스텀 이미지 핸들러
      const imageHandler = () => {
        if (hiddenFileInputRef.current) {
          hiddenFileInputRef.current.click();
        }
      };

      const toolbar = editor.getModule("toolbar");
      if (toolbar) {
        toolbar.addHandler("image", imageHandler);
      }

      // 기본 폰트 크기를 14px로 지정해 라벨이 Normal로 보이지 않게 한다.
      editor.format("size", "14px");

      editor.on("text-change", () => {
        setContent(editor.root.innerHTML);
      });

      quillRef.current = editor;
    }

    void setupEditor();

    return () => {
      isMounted = false;
      quillRef.current = null;

      const editorParent = editorRef.current?.parentElement;
      if (editorParent) {
        editorParent.querySelectorAll(".ql-toolbar").forEach((toolbarElement) => {
          toolbarElement.remove();
        });
      }

      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    };
  }, []);

  async function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    try {
      const publicUrl = await uploadImageToSupabase(file);

      if (quillRef.current) {
        const range = quillRef.current.getSelection();
        if (range) {
          quillRef.current.insertEmbed(range.index, "image", publicUrl);
          quillRef.current.setSelection(range.index + 1, 0);
        }
      }
    } catch (error) {
      console.error("Failed to handle image:", error);
      alert("이미지 업로드에 실패했습니다.");
    }

    // 같은 파일을 다시 선택할 수 있게 input 초기화
    event.target.value = "";
  }

  function extractThumbnailUrl(html: string): string | null {
    try {
      // DOMParser를 사용해 HTML 파싱
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const imgElement = doc.querySelector("img");

      if (imgElement) {
        return imgElement.src;
      }
    } catch (error) {
      console.warn("Failed to parse HTML for thumbnail:", error);
    }

    // 정규식 폴백
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/);
    return match ? match[1] : null;
  }

  async function handleSubmit() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user) {
        router.push("/auth?notice=login-required");
        return;
      }
    } catch {
      router.push("/auth?notice=login-required");
      return;
    }

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
      console.log("Extracted thumbnail URL:", thumbnailUrl);
      await createPostInSupabase(trimmedTitle, trimmedContent, category, thumbnailUrl);
      alert("글이 등록되었습니다.");
      router.push("/daily");
    } catch (error) {
      console.error("Failed to create post:", error instanceof Error ? error.message : error);
      alert("글 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MainLayout>
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">커뮤니티 글 작성</h1>
          <p className="mt-2 text-sm text-slate-500">말머리를 선택하고 제목을 입력해 게시글 초안을 준비하세요.</p>
        </header>

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
              <div ref={editorRef} />
            </div>
          </div>
        </div>

        {/* 숨겨진 파일 입력 */}
        <input
          ref={hiddenFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: "none" }}
        />

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/daily")}
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
            {isSubmitting ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </section>

      <style jsx global>{`
        .ql-editor img {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 0 0 0 0;
        }

        .ql-editor .ql-align-center img {
          margin-left: auto;
          margin-right: auto;
        }

        .ql-editor .ql-align-right img {
          margin-left: auto;
          margin-right: 0;
        }

        .ql-editor .ql-align-justify img {
          width: 100%;
        }

        .ql-snow .ql-picker.ql-size {
          width: 74px;
        }

        .ql-snow .ql-picker.ql-size .ql-picker-label {
          padding-right: 18px;
        }

        .ql-snow .ql-picker.ql-size .ql-picker-label::before {
          font-weight: 600;
        }

        .ql-snow .ql-picker.ql-size .ql-picker-options {
          max-height: 180px;
          overflow-y: auto;
        }

        .ql-snow .ql-picker.ql-size .ql-picker-label::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item::before {
          content: "14px";
        }

        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='10px']::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='10px']::before {
          content: "10px";
        }

        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='12px']::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='12px']::before {
          content: "12px";
        }

        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='14px']::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='14px']::before {
          content: "14px";
        }

        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='16px']::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='16px']::before {
          content: "16px";
        }

        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='18px']::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='18px']::before {
          content: "18px";
        }

        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='20px']::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='20px']::before {
          content: "20px";
        }

        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='24px']::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='24px']::before {
          content: "24px";
        }

        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='30px']::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='30px']::before {
          content: "30px";
        }
      `}</style>
    </MainLayout>
  );
}
