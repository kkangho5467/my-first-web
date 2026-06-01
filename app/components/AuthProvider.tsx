"use client";

import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/useUserStore";

function getUsernameFromEmail(email: string | null | undefined): string | null {
  if (!email) {
    return null;
  }

  const atIndex = email.indexOf("@");
  return atIndex === -1 ? email : email.slice(0, atIndex);
}

async function loadProfile(user: User) {
  const { data } = await supabase
    .from("profiles")
    .select("nickname, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return data ?? null;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setEmail = useUserStore((state) => state.setEmail);
  const setNickname = useUserStore((state) => state.setNickname);
  const setAvatarUrl = useUserStore((state) => state.setAvatarUrl);
  const setAuthReady = useUserStore((state) => state.setAuthReady);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    let isMounted = true;

    async function syncSession() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (!session?.user) {
        clearUser();
        setAuthReady(true);
        return;
      }

      setEmail(session.user.email ?? "");
      setNickname(getUsernameFromEmail(session.user.email) ?? "");

      const profile = await loadProfile(session.user);

      if (isMounted) {
        setNickname(profile?.nickname || getUsernameFromEmail(session.user.email) || "");
        setAvatarUrl(profile?.avatar_url || "");
        setAuthReady(true);
      }
    }

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        clearUser();
        setAuthReady(true);
        return;
      }

      setEmail(session.user.email ?? "");
      setNickname(getUsernameFromEmail(session.user.email) ?? "");

      void loadProfile(session.user).then((profile) => {
        if (!isMounted) {
          return;
        }

        setNickname(profile?.nickname || getUsernameFromEmail(session.user.email) || "");
        setAvatarUrl(profile?.avatar_url || "");
        setAuthReady(true);
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [clearUser, setAvatarUrl, setEmail, setNickname]);

  return <>{children}</>;
}
