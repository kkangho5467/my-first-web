"use client";

import { supabase } from "@/lib/supabaseClient";

export type PostComment = {
  postId: string;
  content: string;
  createdAt: string;
};

type CommentRow = {
  post_id: string;
  content: string;
  created_at: string;
};

function mapRowToComment(row: CommentRow): PostComment {
  return {
    postId: row.post_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

export async function fetchCommentsByPostId(postId: string): Promise<PostComment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("post_id, content, created_at")
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

export async function insertComment(postId: string, content: string): Promise<void> {
  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    content,
  });

  if (error) {
    console.error("Failed to insert comment:", error);
    alert("댓글 등록 중 오류가 발생했습니다.");
    throw error;
  }
}

export async function deleteMyComment(postId: string, content: string, createdAt: string): Promise<void> {
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
