import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type SafeSession = {
  user: User;
};

let sessionRequest: Promise<SafeSession | null> | null = null;

function isAuthLockError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const normalizedMessage = message.toLowerCase();

  return normalizedMessage.includes("lock") || normalizedMessage.includes("auth session missing");
}

export async function getSafeSession(): Promise<SafeSession | null> {
  if (!sessionRequest) {
    sessionRequest = (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session?.user) {
          return null;
        }

        return {
          user: data.session.user,
        };
      } catch (error) {
        if (!isAuthLockError(error)) {
          throw error;
        }

        return null;
      }
    })().finally(() => {
      sessionRequest = null;
    });
  }

  return sessionRequest;
}

export async function getSafeUser(): Promise<User | null> {
  const session = await getSafeSession();
  return session?.user ?? null;
}