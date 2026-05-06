"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MockPost } from "@/content/blog-content";
import { getSafeUser } from "@/lib/supabaseAuth";
import { supabase } from "@/lib/supabaseClient";
import { showGlobalToast } from "@/lib/toast";
import type { User } from "@supabase/supabase-js";

type PostRow = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_name?: string;
  author_id?: string;
  thumbnail_url?: string | null;
  views?: number;
  category?: string;
  likes?: number;
};

function toCommunityListErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const normalizedMessage = error.message.toLowerCase();

    if (normalizedMessage.includes("failed to fetch") || normalizedMessage.includes("network")) {
      return "네트워크 연결을 확인한 뒤 다시 시도해 주세요.";
    }

    return error.message;
  }

  return "게시글을 불러오지 못했습니다.";
}

function isAdmin(user: User | null): boolean {
  if (!user?.email && !user?.id) {
    return false;
  }
  
  // 이메일 prefix 확인
  const emailPrefix = user.email?.split("@")[0];
  if (emailPrefix === "admin5467" || emailPrefix === "kkangho5467") {
    return true;
  }
  
  // user ID 확인
  if (user.id === "admin5467" || user.id === "kkangho5467") {
    return true;
  }
  
  return false;
}

function formatPostDateTime(createdAt: string): string {
  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) {
    return "";
  }

  const now = Date.now();
  const diffMs = Math.max(0, now - createdTime);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return "방금 전";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}

function mapRowToMockPost(row: PostRow): MockPost {
  // DB row를 화면에서 쓰는 공통 Post 타입으로 정규화한다.
  return {
    id: row.id,
    title: row.title,
    excerpt: row.content,
    date: formatPostDateTime(row.created_at),
    author_name: row.author_name || "익명",
    author_id: row.author_id || "",
    thumbnail_url: row.thumbnail_url ?? null,
    category: row.category,
    views: row.views,
    likes: row.likes,
    created_at: row.created_at,
  };
}

export async function fetchCommunityPosts(): Promise<MockPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("게시글 목록을 불러오지 못했습니다.");
  }

  const rows = (data ?? []) as PostRow[];
  return rows.map(mapRowToMockPost);
}

export async function fetchPostById(postId: string): Promise<PostRow | null> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error) {
      console.warn("Failed to fetch post by id:", error);
      return null;
    }

    return (data as PostRow) || null;
  } catch (error) {
    console.warn("Error in fetchPostById:", error);
    return null;
  }
}

export async function incrementPostViews(postId: string): Promise<void> {
  try {
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("views")
      .eq("id", postId)
      .single();

    if (fetchError) {
      // views 컬럼이 없을 수 있으니 무시
      return;
    }

    if (post) {
      const currentViews = (post.views as number) || 0;
      await supabase
        .from("posts")
        .update({ views: currentViews + 1 })
        .eq("id", postId);
    }
  } catch {
    // 조용히 실패 (뷰 기능은 선택적)
  }
}

export async function createPostInSupabase(
  title: string,
  content: string,
  category?: string,
  thumbnailUrl?: string | null
): Promise<void> {
  try {
    // 현재 로그인한 유저 정보 가져오기
    const user = await getSafeUser();

    // 유저 정보 확인
    if (!user) {
      return;
    }

    // profiles 테이블에서 최신 닉네임 조회 (오른쪽 상단과 동일한 닉네임)
    const { data: profileData } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user.id)
      .maybeSingle();

    const author_name = profileData?.nickname || user.email?.split("@")[0] || "Unknown";
    const author_id = user.id;

    // 데이터 저장
    const { error } = await supabase.from("posts").insert({
      title,
      content,
      category: category || "자유수다",
      author_name,
      author_id,
      thumbnail_url: thumbnailUrl,
    });

    if (error) {
      console.error("Failed to create post - Supabase error:", {
        message: error.message,
        code: error.code,
        details: error,
      });
      showGlobalToast(`게시글 작성 중 오류가 발생했습니다: ${error.message}`);
      throw error;
    }
  } catch (error) {
    console.error("Error in createPostInSupabase:", {
      message: error instanceof Error ? error.message : String(error),
      error,
    });
    throw error;
  }
}

export async function updatePostInSupabase(
  postId: string,
  title: string,
  content: string,
  category?: string,
  thumbnailUrl?: string | null
): Promise<void> {
  const payload: {
    title: string;
    content: string;
    category?: string;
    thumbnail_url?: string | null;
  } = {
    title,
    content,
  };

  if (category !== undefined) {
    payload.category = category;
  }

  if (thumbnailUrl !== undefined) {
    payload.thumbnail_url = thumbnailUrl;
  }

  const { error } = await supabase.from("posts").update(payload).eq("id", postId);

  if (error) {
    console.error("Failed to update post:", error);
    showGlobalToast("게시글 수정 중 오류가 발생했습니다.");
    throw error;
  }
}

export async function deletePostInSupabase(postId: string, currentUser: User | null, postAuthorId: string): Promise<void> {
  // 권한 확인
  const isCurrentUserAdmin = isAdmin(currentUser);
  const isCurrentUserAuthor = currentUser?.id === postAuthorId;

  if (!isCurrentUserAdmin && !isCurrentUserAuthor) {
    throw new Error("삭제 권한이 없습니다.");
  }

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    console.error("Failed to delete post:", error);
    throw new Error("게시글 삭제 중 오류가 발생했습니다.");
  }
}

export async function deletePostsInSupabase(postIds: string[], currentUser: User | null): Promise<void> {
  if (postIds.length === 0) {
    return;
  }

  if (!isAdmin(currentUser)) {
    showGlobalToast("관리자만 선택 삭제를 사용할 수 있습니다.");
    throw new Error("관리자만 선택 삭제를 사용할 수 있습니다.");
  }

  const { error } = await supabase.from("posts").delete().in("id", postIds);

  if (error) {
    console.error("Failed to delete selected posts:", error);
    showGlobalToast("선택한 게시글 삭제 중 오류가 발생했습니다.");
    throw error;
  }
}

export function useCommunityPosts(initialPosts: MockPost[]) {
  const [posts, setPosts] = useState<MockPost[]>(initialPosts);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refetchPosts = useCallback(async () => {
    // 생성/수정/삭제 이후 목록 일관성을 위해 항상 서버 기준으로 동기화한다.
    setLoading(true);
    setErrorMessage(null);
    try {
      const nextPosts = await fetchCommunityPosts();
      setPosts(nextPosts);
    } catch (error) {
      console.warn("Failed to refetch posts:", error);
      setPosts(initialPosts);
      setErrorMessage(toCommunityListErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [initialPosts]);

  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const nextPosts = await fetchCommunityPosts();
        // 언마운트 이후 setState 경고를 방지한다.
        if (isMounted) {
          setPosts(nextPosts);
        }
      } catch (error) {
        if (isMounted) {
          setPosts(initialPosts);
          setErrorMessage(toCommunityListErrorMessage(error));
        }
        console.warn("Failed to load posts:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadPosts();

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
      async deletePosts(postIds: string[], currentUser: User | null) {
        await deletePostsInSupabase(postIds, currentUser);
        await refetchPosts();
      },
    }),
    [refetchPosts]
  );

  return { posts, loading, errorMessage, refetchPosts, ...actions };
}
