"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MockPost } from "@/content/blog-content";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

type PostRow = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_name?: string;
  author_id?: string;
};

function isAdmin(user: User | null): boolean {
  if (!user?.email && !user?.id) {
    return false;
  }
  
  // 이메일 prefix 확인
  const emailPrefix = user.email?.split("@")[0];
  if (emailPrefix === "admin5467") {
    return true;
  }
  
  // user ID 확인
  if (user.id === "admin5467") {
    return true;
  }
  
  return false;
}

function formatPostDate(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .split("-");

  return `${parts[0]}-${parts[1]}-${parts[2]}`;
}

function mapRowToMockPost(row: PostRow): MockPost {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.content,
    date: formatPostDate(row.created_at),
    author_name: row.author_name || "익명",
    author_id: row.author_id || "",
  };
}

export async function fetchCommunityPosts(): Promise<MockPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, content, created_at, author_name, author_id")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as PostRow[];
  return rows.map(mapRowToMockPost);
}

export async function createPostInSupabase(title: string, content: string): Promise<void> {
  // 현재 로그인한 유저 정보 가져오기
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // 유저 정보 확인
  if (!user) {
    alert("로그인이 필요합니다.");
    return;
  }

  // author_name과 author_id 설정
  const author_name =
    typeof user.user_metadata?.nickname === "string" && user.user_metadata.nickname
      ? user.user_metadata.nickname
      : user.email?.split("@")[0] || "Unknown";

  const author_id = user.id;

  // 데이터 저장
  const { error } = await supabase.from("posts").insert({
    title,
    content,
    author_name,
    author_id,
  });

  if (error) {
    console.error("Failed to create post:", error);
    alert("게시글 작성 중 오류가 발생했습니다.");
    throw error;
  }
}

export async function updatePostInSupabase(postId: string, title: string, content: string): Promise<void> {
  const { error } = await supabase.from("posts").update({ title, content }).eq("id", postId);

  if (error) {
    console.error("Failed to update post:", error);
    alert("게시글 수정 중 오류가 발생했습니다.");
    throw error;
  }
}

export async function deletePostInSupabase(postId: string, currentUser: User | null, postAuthorId: string): Promise<void> {
  // 권한 확인
  const isCurrentUserAdmin = isAdmin(currentUser);
  const isCurrentUserAuthor = currentUser?.id === postAuthorId;

  if (!isCurrentUserAdmin && !isCurrentUserAuthor) {
    alert("삭제 권한이 없습니다. 작성자나 관리자만 삭제할 수 있습니다.");
    return;
  }

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    console.error("Failed to delete post:", error);
    alert("게시글 삭제 중 오류가 발생했습니다.");
    throw error;
  }
}

export function useCommunityPosts(initialPosts: MockPost[]) {
  const [posts, setPosts] = useState<MockPost[]>(initialPosts);
  const [loading, setLoading] = useState(true);

  const refetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const nextPosts = await fetchCommunityPosts();
      setPosts(nextPosts);
    } catch (error) {
      console.error("Failed to refetch posts from Supabase:", error);
      alert("게시글 목록을 다시 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      setLoading(true);
      try {
        const nextPosts = await fetchCommunityPosts();
        if (isMounted) {
          setPosts(nextPosts);
        }
      } catch (error) {
        if (isMounted) {
          setPosts(initialPosts);
        }
        console.error("Failed to fetch posts from Supabase:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, [initialPosts]);

  const actions = useMemo(
    () => ({
      async createPost(title: string, content: string) {
        await createPostInSupabase(title, content);
        await refetchPosts();
      },
      async updatePost(postId: string, title: string, content: string) {
        await updatePostInSupabase(postId, title, content);
        await refetchPosts();
      },
      async deletePost(postId: string, currentUser: User | null, postAuthorId: string) {
        await deletePostInSupabase(postId, currentUser, postAuthorId);
        await refetchPosts();
      },
    }),
    [refetchPosts]
  );

  return { posts, loading, refetchPosts, ...actions };
}
