"use client";

import { useEffect, useRef } from "react";
import type { QuillOptions } from "quill";
import "quill/dist/quill.snow.css";

const QUILL_SIZE_OPTIONS = ["10px", "12px", "14px", "16px", "18px", "20px", "24px", "30px"] as const;

type QuillEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder: string;
  onImageUpload?: (file: File) => Promise<string>;
};

export default function QuillEditor({ value, onChange, placeholder, onImageUpload }: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<import("quill").default | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onChangeRef = useRef(onChange);
  const onImageUploadRef = useRef(onImageUpload);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onImageUploadRef.current = onImageUpload;
  }, [onImageUpload]);

  useEffect(() => {
    let isMounted = true;
    const editorElement = editorRef.current;

    async function setupEditor() {
      if (!isMounted || !editorElement || quillRef.current) {
        return;
      }

      const Quill = (await import("quill")).default;

      // 글꼴 크기 옵션을 화이트리스트로 고정해 에디터/렌더 결과를 일치시킨다.
      const Size = Quill.import("attributors/style/size") as any;
      Size.whitelist = [...QUILL_SIZE_OPTIONS];
      Quill.register(Size, true);

      const editorParent = editorElement.parentElement;
      if (editorParent) {
        editorParent.querySelectorAll(".ql-toolbar").forEach((toolbarElement) => {
          toolbarElement.remove();
        });
      }
      editorElement.innerHTML = "";

      const editorOptions: QuillOptions = {
        theme: "snow",
        placeholder,
        modules: {
          toolbar: [
            [{ size: [...QUILL_SIZE_OPTIONS] }],
            ["bold", "italic", "underline"],
            [{ align: [] }],
            ["link", "image"],
            [{ list: "ordered" }, { list: "bullet" }],
          ],
        },
      };

      const editor = new Quill(editorElement, editorOptions);

      const toolbar = editor.getModule("toolbar") as { addHandler: (name: string, handler: () => void) => void } | null;
      if (toolbar) {
        // 이미지 버튼 클릭 시 숨김 input을 열어 업로드 흐름으로 연결한다.
        toolbar.addHandler("image", () => {
          fileInputRef.current?.click();
        });
      }

      const initialHtml = value.trim();
      if (initialHtml) {
        editor.clipboard.dangerouslyPasteHTML(initialHtml, "silent");
      }

      editor.format("size", "14px");

      editor.on("text-change", () => {
        // 내부 HTML 변경을 상위 폼 상태로 즉시 반영한다.
        onChangeRef.current(editor.root.innerHTML);
      });

      quillRef.current = editor;
    }

    void setupEditor();

    return () => {
      isMounted = false;
      quillRef.current = null;

      const editorParent = editorElement?.parentElement;
      if (editorParent) {
        editorParent.querySelectorAll(".ql-toolbar").forEach((toolbarElement) => {
          toolbarElement.remove();
        });
      }

      if (editorElement) {
        editorElement.innerHTML = "";
      }
    };
  }, [placeholder, value]);

  return (
    <>
      <div ref={editorRef} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={async (event) => {
          const files = event.target.files;
          const file = files?.[0];

          if (!file || !quillRef.current || !onImageUploadRef.current) {
            event.target.value = "";
            return;
          }

          try {
            const imageUrl = await onImageUploadRef.current(file);
            const range = quillRef.current.getSelection(true);
            const insertIndex = range?.index ?? quillRef.current.getLength();

            quillRef.current.insertEmbed(insertIndex, "image", imageUrl);
            quillRef.current.setSelection(insertIndex + 1, 0);
          } catch (error) {
            console.error("Failed to upload image:", error);
            alert("이미지 업로드에 실패했습니다.");
          } finally {
            event.target.value = "";
          }
        }}
        style={{ display: "none" }}
      />

      <style jsx global>{`
        .ql-editor img {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 0;
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
    </>
  );
}