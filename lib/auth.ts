import { supabase } from "@/lib/supabaseClient";

type SignInInput = {
  username: string;
  password: string;
};

type SignUpInput = {
  username: string;
  nickname: string;
  password: string;
};

function normalizeUsername(username: string): string {
  return username.trim();
}

function buildPseudoEmail(username: string): string {
  return `${normalizeUsername(username)}@myboard.local.com`;
}

export async function signInWithPassword({ username, password }: SignInInput) {
  return supabase.auth.signInWithPassword({
    email: buildPseudoEmail(username),
    password: password.trim(),
  });
}

export async function signUp({ username, nickname, password }: SignUpInput) {
  return supabase.auth.signUp({
    email: buildPseudoEmail(username),
    password: password.trim(),
    options: {
      data: {
        nickname: nickname.trim(),
      },
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}
