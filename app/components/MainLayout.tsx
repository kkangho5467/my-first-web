import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
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

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
            My Blog
          </Link>
          <div className="flex items-center gap-4">
            <nav aria-label="주요 메뉴">
              <ul className="flex items-center gap-4 text-sm font-medium text-slate-700">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="nav-menu-link rounded px-2 py-1 transition-colors hover:text-slate-900"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <AuthStatusControl />
            <ThemeToggle />
          </div>
        </div>
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