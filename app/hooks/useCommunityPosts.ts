"use client";

import { useEffect, useMemo, useState } from "react";
import type { MockPost } from "@/content/blog-content";

export const COMMUNITY_POSTS_KEY = "community-posts";

export function readCommunityPostsFromStorage(): MockPost[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(COMMUNITY_POSTS_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as MockPost[];
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function useCommunityPosts(initialPosts: MockPost[]) {
  const [posts, setPosts] = useState<MockPost[]>(() => {
    const stored = readCommunityPostsFromStorage();
    return stored ?? initialPosts;
  });

  useEffect(() => {
    window.localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== COMMUNITY_POSTS_KEY) {
        return;
      }

      const nextPosts = readCommunityPostsFromStorage();
      if (nextPosts) {
        setPosts(nextPosts);
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const actions = useMemo(
    () => ({
      addPost(post: MockPost) {
        setPosts((prev) => [post, ...prev]);
      },
      removePost(postId: string) {
        setPosts((prev) => prev.filter((post) => post.id !== postId));
      },
    }),
    []
  );

  return { posts, ...actions };
}
