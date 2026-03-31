"use client";

import { useEffect } from "react";
import { useDebouncedPostSearch } from "@/app/hooks/useDebouncedPostSearch";
import type { SearchablePost } from "@/lib/searchPosts";

type PostSearchBoxProps<T extends SearchablePost> = {
  posts: T[];
  onFilteredChange?: (posts: T[]) => void;
  placeholder?: string;
  delay?: number;
};

export default function PostSearchBox<T extends SearchablePost>({
  posts,
  onFilteredChange,
  placeholder = "제목 또는 내용으로 검색",
  delay,
}: PostSearchBoxProps<T>) {
  const { query, setQuery, filteredPosts, isDebouncing } = useDebouncedPostSearch(posts, {
    delay,
  });

  useEffect(() => {
    onFilteredChange?.(filteredPosts);
  }, [filteredPosts, onFilteredChange]);

  return (
    <div className="space-y-2">
      <label htmlFor="post-search" className="text-sm font-medium text-slate-700">
        게시물 검색
      </label>
      <input
        id="post-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-blue-300 transition focus:ring"
      />
      <p className="text-xs text-slate-500">
        {isDebouncing ? "검색 중..." : `검색 결과 ${filteredPosts.length}건`}
      </p>
    </div>
  );
}