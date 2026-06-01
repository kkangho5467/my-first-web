"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { useUserStore } from "@/store/useUserStore";

function getUsernameFromEmail(email: string): string {
  const atIndex = email.indexOf("@");
  return atIndex === -1 ? email : email.slice(0, atIndex);
}

export default function AuthStatusControl() {
  const router = useRouter();
  const email = useUserStore((state) => state.email);
  const nickname = useUserStore((state) => state.nickname);
  const avatarUrl = useUserStore((state) => state.avatarUrl);
  const clearUser = useUserStore((state) => state.clearUser);

  async function handleSignOut() {
    await signOut();
    clearUser();
    router.push("/");
    router.refresh();
  }

  if (!email && !nickname) {
    return (
      <div className="flex justify-end">
        <Link
          href="/login"
          className="rounded border border-slate-300 px-2.5 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          로그인/회원가입
        </Link>
      </div>
    );
  }

  const displayName = nickname || getUsernameFromEmail(email) || "사용자";
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