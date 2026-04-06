"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthStatusControl from "./AuthStatusControl";
import FooterEmailLink from "./FooterEmailLink";
import ThemeToggle from "./ThemeToggle";

type MainLayoutProps = {
  children: ReactNode;
};

const menuItems = [
  { label: "홈", href: "/" },
  { label: "커뮤니티", href: "/daily" },
  { label: "취미", href: "/hobby" },
  { label: "목표", href: "/goals" },
  { label: "마이페이지", href: "/mypage" },
];

const TOAST_REMOVE_DELAY_MS = 3900;

export default function MainLayout({ children }: MainLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [runtimeToast, setRuntimeToast] = useState<{ id: number; message: string } | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const closeMenu = () => setIsMenuOpen(false);

  const isActiveMenu = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  const queryToastMessage =
    searchParams.get("notice") === "login-required" ? "로그인 이후 이용 가능합니다" : null;

  useEffect(() => {
    if (searchParams.get("notice") !== "login-required") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("notice");
      const nextQuery = params.toString();
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }, TOAST_REMOVE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const handleToastEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>;
      const message = customEvent.detail?.message;
      if (!message) {
        return;
      }

      setRuntimeToast({ id: Date.now(), message });
    };

    window.addEventListener("app:toast", handleToastEvent);

    return () => {
      window.removeEventListener("app:toast", handleToastEvent);
    };
  }, []);

  useEffect(() => {
    if (!runtimeToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRuntimeToast(null);
    }, TOAST_REMOVE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [runtimeToast]);

  const handleMenuLinkClick = async (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
    onAfterNavigate?: () => void
  ) => {
    if (href !== "/mypage") {
      onAfterNavigate?.();
      return;
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user) {
        event.preventDefault();
        onAfterNavigate?.();
        router.push("/auth?notice=login-required");
        return;
      }
    } catch {
      // 비로그인/세션 없음은 정상 흐름으로 처리
      event.preventDefault();
      onAfterNavigate?.();
      router.push("/auth?notice=login-required");
      return;
    }

    onAfterNavigate?.();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {queryToastMessage ? (
        <div key={`query-${pathname}-${searchParams.toString()}`} className="pointer-events-none fixed left-1/2 top-5 z-50 -translate-x-1/2">
          <div className="toast-auto-hide rounded-full bg-slate-900/95 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur">
            {queryToastMessage}
          </div>
        </div>
      ) : null}

      {runtimeToast ? (
        <div key={`runtime-${runtimeToast.id}`} className="pointer-events-none fixed left-1/2 top-5 z-50 -translate-x-1/2">
          <div className="toast-auto-hide rounded-full bg-slate-900/95 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur">
            {runtimeToast.message}
          </div>
        </div>
      ) : null}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-slate-900">
              My Blog
            </Link>

            <nav aria-label="주요 메뉴" className="hidden md:block">
              <ul className="flex items-center gap-3 text-sm font-medium text-slate-700">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch
                      onClick={(event) => {
                        void handleMenuLinkClick(event, item.href);
                      }}
                      aria-current={isActiveMenu(item.href) ? "page" : undefined}
                      className={`nav-menu-link rounded px-2 py-1 hover:text-slate-900 ${
                        isActiveMenu(item.href) ? "bg-slate-100 text-slate-900" : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="block md:hidden border border-slate-300 px-2 py-1 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              aria-label="메뉴 열기"
            >
              ☰
            </button>

            <div className="hidden w-[230px] justify-end md:flex">
              <AuthStatusControl />
            </div>
            <ThemeToggle />
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-slate-200 bg-white md:hidden">
            <nav aria-label="모바일 메뉴" className="mx-auto max-w-6xl px-4 py-3">
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch
                      aria-current={isActiveMenu(item.href) ? "page" : undefined}
                      onClick={(event) => {
                        void handleMenuLinkClick(event, item.href, closeMenu);
                      }}
                      className={`mobile-menu-link block rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 ${
                        isActiveMenu(item.href) ? "bg-slate-100 text-slate-900" : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={closeMenu}
                className="mt-3 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                ✕ 닫기
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-6 text-xs text-slate-400">
          <nav aria-label="푸터 링크">
            <ul className="flex items-center gap-4">
              <li>
                <a
                  href="https://github.com/kkangho5467"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-600"
                >
                  <Image className="footer-icon" src="/github.svg" alt="GitHub" width={12} height={12} />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/04_kangho/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-600"
                >
                  <Image
                    className="footer-icon"
                    src="/instagram.svg"
                    alt="Instagram"
                    width={12}
                    height={12}
                  />
                  Instagram
                </a>
              </li>
              <li>
                <FooterEmailLink />
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}