"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const savedTheme = window.localStorage.getItem("theme-mode") as ThemeMode | null;
    return savedTheme ?? getSystemTheme();
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme-mode", theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme: ThemeMode = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    window.localStorage.setItem("theme-mode", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="다크모드 토글"
      className="theme-toggle-btn rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-100"
    >
      {theme === "dark" ? "라이트" : "다크"}
    </button>
  );
}
