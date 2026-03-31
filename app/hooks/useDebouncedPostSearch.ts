"use client";

import { useEffect, useMemo, useState } from "react";
import { searchPostsByTitleOrContent, type SearchablePost } from "@/lib/searchPosts";

type UseDebouncedPostSearchOptions = {
  delay?: number;
  initialQuery?: string;
};

const DEFAULT_DEBOUNCE_DELAY = 300;

/**
 * 사용자가 타이핑하는 동안에는 검색을 지연하고, 일정 시간 후 필터링을 수행한다.
 */
export function useDebouncedPostSearch<T extends SearchablePost>(
  posts: T[],
  options?: UseDebouncedPostSearchOptions
) {
  const delay = options?.delay ?? DEFAULT_DEBOUNCE_DELAY;
  const [query, setQuery] = useState(options?.initialQuery ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(options?.initialQuery ?? "");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query, delay]);

  const filteredPosts = useMemo(() => {
    return searchPostsByTitleOrContent(posts, debouncedQuery);
  }, [posts, debouncedQuery]);

  return {
    query,
    setQuery,
    debouncedQuery,
    filteredPosts,
    isDebouncing: query !== debouncedQuery,
  };
}
