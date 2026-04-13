"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/useUserStore";

function getUsernameFromEmail(email: string | null | undefined): string | null {
  if (!email) {
    return null;
  }

  const atIndex = email.indexOf("@");
  if (atIndex === -1) {
    return email;
  }

  return email.slice(0, atIndex);
}

export default function AuthStatusControl() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const setEmail = useUserStore((state) => state.setEmail);
  const nickname = useUserStore((state) => state.nickname);
  const avatarUrl = useUserStore((state) => state.avatarUrl);
  const setNickname = useUserStore((state) => state.setNickname);
  const setAvatarUrl = useUserStore((state) => state.setAvatarUrl);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    let isMounted = true;

    async function loadUserAndProfile() {
      // 세션과 profiles를 함께 조회해 헤더 사용자 표시를 초기화한다.
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!isMounted) return;

      if (session?.user) {
        setUsername(getUsernameFromEmail(session.user.email));
        setEmail(session.user.email ?? "");

        // user id 기준으로 닉네임/아바타를 가져와 store와 동기화한다.
        const { data: profileData } = await supabase
          .from("profiles")
          .select("nickname, avatar_url")
          .eq("id", session.user.id)
          .maybeSingle();

        if (isMounted) {
          setNickname(profileData?.nickname || "");
          setAvatarUrl(profileData?.avatar_url || "");
        }
      } else {
        setUsername(null);
        clearUser();
      }
    }

    void loadUserAndProfile();

    // 인증 상태가 바뀌면 동일한 방식으로 프로필 표시를 즉시 갱신한다.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUsername(getUsernameFromEmail(session.user.email));
        setEmail(session.user.email ?? "");
        
        supabase
          .from("profiles")
          .select("nickname, avatar_url")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (isMounted) {
              setNickname(data?.nickname || "");
              setAvatarUrl(data?.avatar_url || "");
            }
          });
      } else {
        setUsername(null);
        clearUser();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [clearUser, setAvatarUrl, setEmail, setNickname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    clearUser();
    router.push("/");
    router.refresh();
  }

  if (!username) {
    return (
      <div className="flex justify-end">
        <Link
          href="/auth"
          className="rounded border border-slate-300 px-2.5 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          로그인/회원가입
        </Link>
      </div>
    );
  }

  const displayName = nickname || username;
  const avatarSource = avatarUrl || "/profile-placeholder.svg";

  return (
    <div className="flex items-center justify-end gap-2.5">
      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-300 bg-slate-100 shadow-sm">
        <Image src={avatarSource} alt="아바타" fill sizes="28px" className="object-cover" />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="max-w-[110px] truncate text-sm font-semibold tracking-tight text-slate-800">{displayName}</span>
        <span className="text-xs font-medium text-slate-500">님</span>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded border border-slate-300 px-2.5 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        로그아웃
      </button>
    </div>
  );
}