"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import type { MockPost } from "@/content/blog-content";
import { fetchCommunityPosts } from "@/app/hooks/useCommunityPosts";
import { supabase } from "@/lib/supabaseClient";

type GuestbookItem = {
  id: number;
  nickname: string;
  message: string;
};

type HobbyLatestItem = {
  id: string;
  category: string;
  title: string;
  comment: string;
  author_nickname: string;
  thumbnail_url?: string | null;
};

const initialGuestbook: GuestbookItem[] = [
  { id: 1, nickname: "강호2", message: "아직 구현되지 않았습니다" },
  { id: 2, nickname: "블루팬", message: "현재 한 줄 방명록은 Supabase 연동하지 않았습니다" },
  { id: 3, nickname: "프론트입문", message: "한 줄 방명록을 제외한 커뮤니티와 취미는 연동되어 있습니다" },
];

function extractFirstImageUrl(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

function normalizeThumbnailUrl(value: string | null | undefined): string | null {
  const src = value?.trim();
  if (!src) {
    return null;
  }

  if (src.startsWith("https://") || src.startsWith("http://") || src.startsWith("/")) {
    return src;
  }

  return null;
}

type ThumbnailImageProps = {
  src: string | null | undefined;
  alt: string;
  borderClassName: string;
  priority?: boolean;
};

function ThumbnailImage({ src, alt, borderClassName, priority = false }: ThumbnailImageProps) {
  const normalizedSrc = normalizeThumbnailUrl(src);
  const [hasImageError, setHasImageError] = useState(false);

  if (!normalizedSrc) {
    return null;
  }

  if (hasImageError) {
    return (
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-slate-100 text-slate-400 dark:bg-[#111827] dark:text-gray-500 ${borderClassName}`}
        aria-label={`${alt} 기본 이미지`}
      >
        <ImageIcon className="h-4 w-4" />
      </div>
    );
  }

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      width={40}
      height={40}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      unoptimized={normalizedSrc.startsWith("http")}
      onError={() => setHasImageError(true)}
      className={`h-10 w-10 shrink-0 rounded-md border object-cover ${borderClassName}`}
    />
  );
}

export default function HomeDashboardGrid() {
  const [guestbookItems, setGuestbookItems] = useState<GuestbookItem[]>(initialGuestbook);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [latestCommunityPosts, setLatestCommunityPosts] = useState<MockPost[]>([]);
  const [latestHobbyPosts, setLatestHobbyPosts] = useState<HobbyLatestItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadLatestPanels() {
      try {
        // 홈 패널은 커뮤니티/취미 최신 데이터를 병렬 조회해 초기 렌더 지연을 줄인다.
        const [communityPosts, hobbyResult] = await Promise.all([
          fetchCommunityPosts(),
          supabase
            .from("hobbies")
            .select("id, category, title, comment, author_nickname")
            .order("created_at", { ascending: false })
            .limit(4),
        ]);

        if (!isMounted) {
          return;
        }

        setLatestCommunityPosts(communityPosts.slice(0, 4));
        setLatestHobbyPosts((hobbyResult.data ?? []) as HobbyLatestItem[]);
      } catch {
        if (isMounted) {
          setLatestCommunityPosts([]);
          setLatestHobbyPosts([]);
        }
      }
    }

    void loadLatestPanels();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleSubmitGuestbook(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedNickname = nickname.trim();
    const trimmedMessage = message.trim();

    if (!trimmedNickname || !trimmedMessage) {
      return;
    }

    // 방명록은 현재 로컬 상태로만 관리한다(의도적 데모 동작).
    setGuestbookItems((prev) => [
      {
        id: Date.now(),
        nickname: trimmedNickname,
        message: trimmedMessage,
      },
      ...prev,
    ]);

    setNickname("");
    setMessage("");
  }

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <section className="grid gap-6 lg:grid-rows-[390px_310px]">
          <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">주인장이 엄선한 영상</h2>
            <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200">
              <div className="h-full w-full">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/RGrvm1CJh1c?autoplay=0"
                  title="오늘의 영상"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </article>

          <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">한 줄 방명록</h2>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
              <ul className="space-y-2">
                {guestbookItems.map((item) => (
                  <li key={item.id} className="rounded-md bg-white px-3 py-2 text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{item.nickname}</span>
                    <span className="mx-1 text-slate-400">:</span>
                    <span>{item.message}</span>
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmitGuestbook} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                type="text"
                placeholder="닉네임"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-300 focus:ring"
              />
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                type="text"
                placeholder="짧은 글을 남겨주세요"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-300 focus:ring"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                전송
              </button>
            </form>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-rows-[390px_310px]">
          <article className="flex h-full flex-col rounded-xl border border-sky-200 bg-sky-100 p-3 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
            <h2 className="text-base font-semibold text-slate-900 dark:text-gray-200">커뮤니티 최신 글</h2>
            {latestCommunityPosts.length > 0 ? (
              <ul className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto dark:[&::-webkit-scrollbar-track]:bg-[#020617] dark:[&::-webkit-scrollbar-thumb]:bg-[#334155]">
                {latestCommunityPosts.map((post, index) => {
                  const thumbnailSrc = post.thumbnail_url ?? null;
                  const hasThumbnail = Boolean(normalizeThumbnailUrl(thumbnailSrc));

                  return (
                  <li key={post.id} className="rounded-md bg-white p-3 shadow-sm dark:border dark:border-[#334155] dark:bg-[#0f172a]">
                    <div className={`flex items-start ${hasThumbnail ? "gap-3" : ""}`}>
                      {hasThumbnail ? (
                        <ThumbnailImage
                          src={thumbnailSrc}
                          alt="커뮤니티 썸네일"
                          borderClassName="border-sky-200 dark:border-[#334155]"
                          priority={index === 0}
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700 dark:border-[#334155] dark:bg-[#111827] dark:text-gray-200">
                          {post.category ?? "자유수다"}
                        </span>
                        <Link href={`/posts/${post.id}`} className="mt-2 block line-clamp-2 text-sm font-bold text-slate-900 hover:underline dark:text-gray-100">
                          {post.title}
                        </Link>
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-700 dark:text-gray-300">{post.excerpt.replace(/<[^>]*>/g, "")}</p>
                      </div>
                    </div>
                  </li>
                )})}
              </ul>
            ) : (
              <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm text-slate-600 shadow-sm dark:border dark:border-[#334155] dark:bg-[#0f172a] dark:text-gray-300">표시할 글이 없습니다.</p>
            )}
          </article>

          <article className="flex h-full flex-col rounded-xl border border-lime-200 bg-lime-100 p-3 shadow-sm dark:border-[#334155] dark:bg-[#111827]">
            <h2 className="text-base font-semibold text-slate-900 dark:text-gray-200">취미 탭 최신 글</h2>
            {latestHobbyPosts.length > 0 ? (
              <ul className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto dark:[&::-webkit-scrollbar-track]:bg-[#020617] dark:[&::-webkit-scrollbar-thumb]:bg-[#334155]">
                {latestHobbyPosts.map((item, index) => {
                  const thumbnailSrc = item.thumbnail_url || extractFirstImageUrl(item.comment);
                  const hasThumbnail = Boolean(normalizeThumbnailUrl(thumbnailSrc));

                  return (
                  <li key={item.id} className="rounded-md border border-lime-200 bg-white p-3 shadow-sm dark:border-[#334155] dark:bg-[#0f172a]">
                    <div className={`flex items-start ${hasThumbnail ? "gap-3" : ""}`}>
                      {hasThumbnail ? (
                        <ThumbnailImage
                          src={thumbnailSrc}
                          alt="취미 썸네일"
                          borderClassName="border-lime-200 dark:border-[#334155]"
                          priority={index === 0}
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <span className="inline-flex rounded-full border border-lime-200 bg-lime-50 px-2 py-1 text-[11px] font-semibold text-lime-700 dark:border-[#334155] dark:bg-[#111827] dark:text-gray-200">
                          {item.category}
                        </span>
                        <Link href="/hobby" className="mt-2 block line-clamp-2 text-sm font-bold text-slate-900 hover:underline dark:text-gray-100">
                          {item.title}
                        </Link>
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-700 dark:text-gray-300">작성자: {item.author_nickname || "익명"}</p>
                      </div>
                    </div>
                  </li>
                )})}
              </ul>
            ) : (
              <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm text-slate-600 shadow-sm dark:border dark:border-[#334155] dark:bg-[#0f172a] dark:text-gray-300">표시할 글이 없습니다.</p>
            )}
          </article>
        </section>
      </div>
    </section>
  );
}