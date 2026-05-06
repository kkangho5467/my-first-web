"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSafeUser } from "@/lib/supabaseAuth";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

type CurrentUserInfo = {
  email: string;
  username: string;
  nickname: string;
};

function getUsernameFromEmail(email: string | null | undefined): string {
  if (!email) {
    return "";
  }

  const atIndex = email.indexOf("@");
  if (atIndex === -1) {
    return email;
  }

  return email.slice(0, atIndex);
}

export default function MyPageClient() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<CurrentUserInfo | null>(null);
  const [newNickname, setNewNickname] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      // 마이페이지 진입 시 현재 유저와 닉네임 편집 초기값을 세팅한다.
      const user = await getSafeUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        router.push("/");
        router.refresh();
        return;
      }

      const currentNickname = typeof user.user_metadata?.nickname === "string" ? user.user_metadata.nickname : "";

      setUserInfo({
        email: user.email ?? "",
        username: getUsernameFromEmail(user.email),
        nickname: currentNickname,
      });
      setNewNickname(currentNickname);
      setIsLoading(false);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // 세션 변경(로그인/로그아웃/정보 갱신)을 즉시 화면 상태에 반영한다.
      if (!session?.user) {
        router.push("/");
        router.refresh();
        return;
      }

      const currentNickname = typeof session.user.user_metadata?.nickname === "string" ? session.user.user_metadata.nickname : "";
      setUserInfo({
        email: session.user.email ?? "",
        username: getUsernameFromEmail(session.user.email),
        nickname: currentNickname,
      });
      setNewNickname(currentNickname);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleUpdateNickname() {
    setErrorMessage("");

    if (!newNickname.trim()) {
      setErrorMessage("닉네임을 입력해 주세요.");
      return;
    }

    // 서비스 전체 닉네임 정책과 동일한 정규식 규칙을 적용한다.
    if (!/^[가-힣A-Za-z0-9]{2,8}$/.test(newNickname.trim())) {
      setErrorMessage("닉네임은 특수문자 없이 한글, 영문, 숫자만 가능하고 2자 이상 8자 이하여야 합니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { nickname: newNickname.trim() },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const nextNickname = typeof data.user.user_metadata?.nickname === "string" ? data.user.user_metadata.nickname : newNickname.trim();

      setUserInfo((current) =>
        current
          ? {
              ...current,
              nickname: nextNickname,
            }
          : current
      );
      setNewNickname(nextNickname);
      toast.success("닉네임이 변경되었습니다");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">마이페이지 정보를 불러오는 중입니다...</p>
      </section>
    );
  }

  if (!userInfo) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="rounded-xl bg-slate-50 p-5">
        <p className="text-sm text-slate-500">마이페이지</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">👤 {userInfo.username}님</h1>
        <p className="mt-2 text-sm text-slate-600">현재 닉네임: <span className="font-semibold text-slate-900">{userInfo.nickname || "설정되지 않음"}</span></p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="mypage-nickname" className="text-sm font-medium text-slate-700">
            새 닉네임
          </label>
          <input
            id="mypage-nickname"
            type="text"
            value={newNickname}
            onChange={(event) => setNewNickname(event.target.value)}
            placeholder="변경할 닉네임을 입력하세요"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-300 transition focus:ring"
          />
        </div>

        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

        <button
          type="button"
          onClick={handleUpdateNickname}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          닉네임 변경하기
        </button>
      </div>
    </section>
  );
}
