"use client";

import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export type PostComment = {
  postId: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorId: string;
};

type CommentRow = {
  post_id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_id: string;
};

function mapRowToComment(row: CommentRow): PostComment {
  return {
    postId: row.post_id,
    content: row.content,
    createdAt: row.created_at,
    authorName: row.author_name,
    authorId: row.author_id,
  };
}

export async function fetchCommentsByPostId(postId: string): Promise<PostComment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("post_id, content, created_at, author_name, author_id")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch comments:", error);
    alert("댓글 목록을 불러오는 중 오류가 발생했습니다.");
    throw error;
  }

  const rows = (data ?? []) as CommentRow[];
  return rows.map(mapRowToComment);
}

export async function insertComment(postId: string, content: string, user: User | null): Promise<void> {
  if (!user) {
    return;
  }

  const authorName = user.email?.split("@")[0] || "익명사용자";
  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    content,
    author_name: authorName,
    author_id: user.id,
  });

  if (error) {
    console.error("Failed to insert comment:", error);
    alert("댓글 등록 중 오류가 발생했습니다.");
    throw error;
  }
}

export async function deleteMyComment(
  postId: string,
  content: string,
  createdAt: string,
  authorId: string,
  currentUser: User | null
): Promise<void> {
  // 관리자 체크
  const isAdmin = currentUser?.email?.split("@")[0] === "admin5467" || 
                  currentUser?.email?.split("@")[0] === "kkangho5467" ||
                  currentUser?.id === "admin5467" ||
                  currentUser?.id === "kkangho5467";

  // 작성자 또는 관리자만 삭제 가능
  if (!isAdmin && currentUser?.id !== authorId) {
    alert("삭제할 권한이 없습니다. 본인의 댓글만 삭제할 수 있습니다.");
    throw new Error("User is not authorized to delete this comment");
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("post_id", postId)
    .eq("content", content)
    .eq("created_at", createdAt);

  if (error) {
    console.error("Failed to delete comment:", error);
    alert("댓글 삭제 중 오류가 발생했습니다.");
    throw error;
  }
}
