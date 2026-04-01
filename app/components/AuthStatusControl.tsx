"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) {
        return;
      }

      setUsername(getUsernameFromEmail(data.session?.user.email));
      const currentNickname = typeof data.session?.user.user_metadata?.nickname === "string" ? data.session.user.user_metadata.nickname : null;
      setNickname(currentNickname);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsername(getUsernameFromEmail(session?.user.email));
      const currentNickname = typeof session?.user.user_metadata?.nickname === "string" ? session.user.user_metadata.nickname : null;
      setNickname(currentNickname);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!username) {
    return (
      <Link
        href="/auth"
        className="rounded border border-slate-300 px-2.5 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        로그인/회원가입
      </Link>
    );
  }

  const displayName = nickname || username;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-700">👤 {displayName}님</span>
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
