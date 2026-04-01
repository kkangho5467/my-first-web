"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function FooterEmailLink() {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const isOpen = isHovered || isPinned;

  async function handleCopy(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      window.setTimeout(() => setCopiedEmail(null), 1200);
    } catch {
      setCopiedEmail(null);
    }
  }

  useEffect(() => {
    function handleDocumentMouseDown(event: MouseEvent) {
      if (!wrapperRef.current) {
        return;
      }

      if (!wrapperRef.current.contains(event.target as Node)) {
        setIsPinned(false);
        setIsHovered(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsPinned(false);
        setIsHovered(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        aria-label="이메일 링크"
        aria-describedby="footer-email-tooltip"
        aria-expanded={isOpen}
        aria-controls="footer-email-tooltip"
        className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-600"
        onClick={() => setIsPinned((prev) => !prev)}
      >
        <Image className="footer-icon" src="/email.svg" alt="Email" width={12} height={12} />
        Email
      </button>

      {isOpen ? (
        <div
          id="footer-email-tooltip"
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="truncate">학교: kkangho5467@hs.ac.kr</p>
            <button
              type="button"
              onClick={() => handleCopy("kkangho5467@hs.ac.kr")}
              className="shrink-0 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-slate-100"
              aria-label="학교 이메일 복사"
            >
              {copiedEmail === "kkangho5467@hs.ac.kr" ? "복사됨" : "복사"}
            </button>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="truncate">개인: kkangho0405@gmail.com</p>
            <button
              type="button"
              onClick={() => handleCopy("kkangho0405@gmail.com")}
              className="shrink-0 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-slate-100"
              aria-label="개인 이메일 복사"
            >
              {copiedEmail === "kkangho0405@gmail.com" ? "복사됨" : "복사"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
