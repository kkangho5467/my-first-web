import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

type RequestRow = Record<string, unknown> & {
  id: string | number;
  hp_cost?: number | string | null;
  reward_gold?: number | string | null;
  reward_exp?: number | string | null;
  mental_cost?: number | string | null;
  gold_reward?: number | string | null;
  exp_reward?: number | string | null;
};

type ProfileRow = {
  current_hp: number | string | null;
  gold: number | string | null;
  experience: number | string | null;
};

function firstNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function createSupabaseServerClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
  }

  const cookiesToSet: Array<{ name: string; value: string; options: any }> = [];

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies) {
        cookiesToSet.push(...cookies);
      },
    },
  });

  function jsonResponse(body: unknown, status = 200) {
    const response = NextResponse.json(body, { status });

    for (const cookie of cookiesToSet) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }

    return response;
  }

  return { supabase, jsonResponse };
}

async function loadTaskById(supabase: ReturnType<typeof createServerClient>, taskId: string) {
  const result = await supabase.from("tasks").select("*").eq("id", taskId).maybeSingle();

  if (!result.error && result.data) {
    return result.data as RequestRow;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const { supabase, jsonResponse } = createSupabaseServerClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonResponse({ error: "UNAUTHORIZED" }, 401);
  }

  const body = (await request.json().catch(() => null)) as { taskId?: unknown } | null;
  const taskId = typeof body?.taskId === "string" ? body.taskId.trim() : "";

  if (!taskId) {
    return jsonResponse({ error: "INVALID_TASK" }, 400);
  }

  const task = await loadTaskById(supabase, taskId);

  if (!task) {
    return jsonResponse({ error: "TASK_NOT_FOUND" }, 404);
  }

  const profileResult = await supabase
    .from("profiles")
    .select("current_hp, gold, experience")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileResult.data as ProfileRow | null;

  if (!profile) {
    return jsonResponse({ error: "PROFILE_NOT_FOUND" }, 404);
  }

  const hpCost = Math.max(1, firstNumber(task.hp_cost, task.mental_cost) ?? 10);
  const rewardGold = Math.max(0, firstNumber(task.reward_gold, task.gold_reward) ?? 0);
  const rewardExp = Math.max(0, firstNumber(task.reward_exp, task.exp_reward) ?? 0);
  const currentHp = Math.max(0, firstNumber(profile.current_hp) ?? 0);

  if (currentHp < hpCost) {
    return jsonResponse({ error: "MENTAL_TOO_LOW" }, 400);
  }

  const currentGold = Math.max(0, firstNumber(profile.gold) ?? 0);
  const currentExp = Math.max(0, firstNumber(profile.experience) ?? 0);

  const { error } = await supabase
    .from("profiles")
    .update({
      current_hp: currentHp - hpCost,
      gold: currentGold + rewardGold,
      experience: currentExp + rewardExp,
    })
    .eq("id", user.id);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  revalidatePath("/rpg");

  return jsonResponse({ success: true });
}