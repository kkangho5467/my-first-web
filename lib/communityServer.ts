import type { MockPost } from "@/content/blog-content";
import { supabase } from "@/lib/supabaseClient";

export type PostRow = {
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

export function mapRowToMockPost(row: PostRow): MockPost {
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

/**
 * 서버 컴포넌트에서 게시글을 로드하고 조회수를 증가시킨 후,
 * 업데이트된 게시글을 반환합니다.
 */
export async function fetchPostByIdAndIncrementViews(postId: string): Promise<PostRow | null> {
  try {
    // 1. 조회수 증가
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("views")
      .eq("id", postId)
      .single();

    if (fetchError) {
      console.warn("Failed to fetch post for view increment:", fetchError);
      return null;
    }

    if (post) {
      const currentViews = (post.views as number) || 0;
      const { error: updateError } = await supabase
        .from("posts")
        .update({ views: currentViews + 1 })
        .eq("id", postId);

      if (updateError) {
        console.warn("Failed to increment views:", updateError);
        // 조회수 증가 실패해도 게시글은 로드하기
      }
    }

    // 2. 업데이트된 게시글 로드
    const { data: updatedPost, error: finalError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (finalError) {
      console.warn("Failed to fetch updated post:", finalError);
      return null;
    }

    return (updatedPost as PostRow) || null;
  } catch (error) {
    console.warn("Error in fetchPostByIdAndIncrementViews:", error);
    return null;
  }
}
