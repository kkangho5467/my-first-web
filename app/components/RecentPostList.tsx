"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MockPost } from "@/content/blog-content";
import { fetchCommunityPosts } from "@/app/hooks/useCommunityPosts";
import { supabase } from "@/lib/supabaseClient";

type RecentPostListProps = {
  initialPosts: MockPost[];
};

type HobbyPreview = {
  id: string;
  category: string;
  title: string;
  comment: string;
  author_nickname: string;
  created_at?: string;
};

export default function RecentPostList({ initialPosts }: RecentPostListProps) {
  const [posts, setPosts] = useState<MockPost[]>(initialPosts);
  const [hobbyPosts, setHobbyPosts] = useState<HobbyPreview[]>([]);

  const recentPosts = posts.slice(0, 4);
  const recentHobbyPosts = hobbyPosts.slice(0, 4);

  function getCategoryBadgeClass(category: string): string {
    switch (category) {
      case "질문/답변":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "정보공유":
        return "border-sky-200 bg-sky-50 text-sky-700";
      case "자유수다":
      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  }

  function stripHtmlTags(html: string): string {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").trim();
  }

  function getHobbyBadgeClass(category: string): string {
    switch (category) {
      case "축구":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "영화":
        return "border-rose-200 bg-rose-50 text-rose-700";
      case "음악":
        return "border-purple-200 bg-purple-50 text-purple-700";
      case "독서":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "게임":
        return "border-amber-200 bg-amber-50 text-amber-700";
      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      try {
        const [nextPosts, hobbyResult] = await Promise.all([
          fetchCommunityPosts(),
          supabase
            .from("hobbies")
            .select("id, category, title, comment, author_nickname, created_at")
            .order("created_at", { ascending: false }),
        ]);

        if (isMounted) {
          setPosts(nextPosts);

          if (hobbyResult.error) {
            console.warn("Failed to fetch hobby preview posts:", hobbyResult.error);
            setHobbyPosts([]);
          } else {
            setHobbyPosts((hobbyResult.data ?? []) as HobbyPreview[]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch recent posts from Supabase:", error);
      }
    }

    void loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section aria-label="최근 커뮤니티">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section
          aria-label="홈 커뮤니티 미리보기"
          className="rounded-2xl border-2 border-blue-200 bg-blue-50/30 p-4 shadow-sm md:p-5"
        >
          <div className="border-b border-blue-200 pb-3">
            <Link
              href="/daily"
              className="inline-block text-2xl font-extrabold tracking-tight text-blue-700 underline-offset-4 transition hover:text-blue-800 hover:underline"
            >
              커뮤니티
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-4">
            {recentPosts.map((post) => (
              <li key={post.id} className="aspect-square rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex h-full flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium ${getCategoryBadgeClass(
                        post.category ?? "자유수다"
                      )}`}
                    >
                      {post.category ?? "자유수다"}
                    </span>
                  </div>

                  <Link
                    href={`/posts/${post.id}`}
                    className="mt-2 block text-sm font-semibold leading-5 text-slate-900 hover:underline"
                  >
                    {post.title}
                  </Link>

                  <p className="mt-1 text-xs text-slate-500">{post.author_name}</p>
                  <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-600">{stripHtmlTags(post.excerpt)}</p>

                  {post.thumbnail_url ? (
                    <div className="mt-auto overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <img
                        src={post.thumbnail_url}
                        alt="게시글 썸네일"
                        className="h-24 w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="mt-auto" />
                  )}
                </div>
              </li>
            ))}
          </ul>

          {recentPosts.length === 0 ? <p className="mt-5 text-sm text-slate-500">아직 게시글이 없습니다.</p> : null}
        </section>

        <section
          aria-label="홈 취미 미리보기"
          className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/30 p-4 shadow-sm md:p-5"
        >
          <div className="border-b border-emerald-200 pb-3">
            <Link
              href="/hobby"
              className="inline-block text-2xl font-extrabold tracking-tight text-emerald-700 underline-offset-4 transition hover:text-emerald-800 hover:underline"
            >
              취미
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-4">
            {recentHobbyPosts.map((hobbyPost) => (
              <li key={hobbyPost.id} className="aspect-square rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex h-full flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium ${getHobbyBadgeClass(
                        hobbyPost.category
                      )}`}
                    >
                      {hobbyPost.category}
                    </span>
                  </div>

                  <Link href="/hobby" className="mt-2 block text-sm font-semibold leading-5 text-slate-900 hover:underline">
                    {hobbyPost.title}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">{hobbyPost.author_nickname || "익명"}</p>
                  <p className="mt-2 line-clamp-5 text-sm leading-5 text-slate-600">{hobbyPost.comment}</p>
                </div>
              </li>
            ))}
          </ul>

          {recentHobbyPosts.length === 0 ? <p className="mt-5 text-sm text-slate-500">아직 취미 글이 없습니다.</p> : null}
        </section>
      </div>
    </section>
  );
}