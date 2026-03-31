import Link from "next/link";
import type { ReactNode } from "react";

type MainLayoutProps = {
  children: ReactNode;
};

const menuItems = [
  { label: "홈", href: "/" },
  { label: "커뮤니티", href: "/daily" },
  { label: "취미", href: "/hobby" },
  { label: "목표", href: "/goals" },
];

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
            My Blog
          </Link>
          <nav aria-label="주요 메뉴">
            <ul className="flex items-center gap-4 text-sm font-medium text-slate-700">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-slate-900">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 text-sm text-slate-500">
          © {new Date().getFullYear()} My Blog. All rights reserved.
        </div>
      </footer>
    </div>
  );
}