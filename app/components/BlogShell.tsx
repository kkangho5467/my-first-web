"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

type BlogShellProps = {
  active: "home" | "daily" | "hobby" | "goals";
  children: ReactNode;
};

const menuItems = [
  { key: "home", label: "홈", href: "/" },
  { key: "daily", label: "하루한줄", href: "/daily" },
  { key: "hobby", label: "취미", href: "/hobby" },
  { key: "goals", label: "목표", href: "/goals" },
] as const;

export default function BlogShell({ active, children }: BlogShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderMenu = (onNavigate?: () => void) => (
    <nav className="mt-6 space-y-0 border-y border-slate-200">
      {menuItems.map((item) => {
        const isActive = item.key === active;

        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 border-b border-slate-200 px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-slate-100 text-slate-900"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isActive ? "bg-red-500" : "bg-slate-300"
              }`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <aside className="hidden h-screen w-64 border-r border-slate-200 bg-white px-4 py-6 md:fixed md:block">
        <div className="rounded-none bg-gradient-to-br from-red-500 to-rose-600 px-4 py-5 text-white">
          <p className="text-xs tracking-[0.2em] text-red-100">KANGHO LOG</p>
          <h1 className="mt-2 text-2xl font-bold">강호로그</h1>
          <p className="mt-1 text-sm text-red-100">하루한줄 아카이브</p>
        </div>

        {renderMenu()}
      </aside>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" aria-hidden="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative h-full w-72 border-r border-slate-200 bg-white px-4 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">메뉴</h2>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="border border-slate-200 px-2.5 py-1 text-sm text-slate-600"
              >
                닫기
              </button>
            </div>

            <div className="mt-4 rounded-none bg-gradient-to-br from-red-500 to-rose-600 px-4 py-5 text-white">
              <p className="text-xs tracking-[0.2em] text-red-100">KANGHO LOG</p>
              <p className="mt-2 text-xl font-bold">강호로그</p>
              <p className="mt-1 text-sm text-red-100">하루한줄 아카이브</p>
            </div>

            {renderMenu(() => setIsMobileMenuOpen(false))}
          </aside>
        </div>
      ) : null}

      <section className="w-full px-3 pb-10 pt-6 md:ml-64 md:w-[calc(100%-16rem)] md:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3 border border-slate-200 bg-white px-4 py-3 md:px-5">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 md:hidden"
          >
            메뉴
          </button>
          <div className="flex-1">
            <p className="text-xs tracking-[0.18em] text-slate-400">DESIGN BLOG</p>
          </div>
          <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-500">
            로그인 메뉴 (추가 예정)
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
