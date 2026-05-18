"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TaskRow = Record<string, unknown> & {
  id: string | number;
  name?: unknown;
  description?: unknown;
  hp_cost?: unknown;
  reward_gold?: unknown;
  reward_exp?: unknown;
  mental_cost?: unknown;
  gold_reward?: unknown;
  exp_reward?: unknown;
};

type RpgRequestBoardProps = {
  tasks: TaskRow[];
  currentHp: number | null;
  isAuthenticated: boolean;
};

function firstText(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

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

function formatNumber(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return new Intl.NumberFormat("ko-KR").format(value);
}

function resolveTaskName(task: TaskRow): string {
  return firstText(task.name, task.title, task.label) ?? "이름 미상";
}

function resolveTaskDescription(task: TaskRow): string | null {
  return firstText(task.description, task.summary, task.note);
}

export default function RpgRequestBoard({ tasks, currentHp, isAuthenticated }: RpgRequestBoardProps) {
  const router = useRouter();
  const [pendingTaskId, setPendingTaskId] = useState<string | number | null>(null);

  async function handleRequest(task: TaskRow) {
    if (!isAuthenticated) {
      router.push("/auth?notice=login-required");
      return;
    }

    const hpCost = Math.max(1, firstNumber(task.hp_cost, task.mental_cost) ?? 10);

    if (typeof currentHp !== "number") {
      alert("멘탈 정보를 불러오지 못했습니다.");
      return;
    }

    if (currentHp < hpCost) {
      alert("멘탈이 부족합니다");
      return;
    }

    setPendingTaskId(task.id);

    try {
      const response = await fetch("/api/rpg/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId: String(task.id) }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth?notice=login-required");
          return;
        }

        if (payload?.error === "MENTAL_TOO_LOW") {
          alert("멘탈이 부족합니다");
          return;
        }

        alert(typeof payload?.error === "string" ? payload.error : "의뢰 처리에 실패했습니다.");
        return;
      }

      router.refresh();
    } finally {
      setPendingTaskId(null);
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-surface-2/70 p-8 text-center">
        <p className="text-sm text-muted-foreground">아직 접수된 의뢰가 없습니다.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => {
        const hpCost = Math.max(1, firstNumber(task.hp_cost, task.mental_cost) ?? 10);
        const rewardGold = Math.max(0, firstNumber(task.reward_gold, task.gold_reward) ?? 0);
        const rewardExp = Math.max(0, firstNumber(task.reward_exp, task.exp_reward) ?? 0);
        const isPending = pendingTaskId === task.id;
        const description = resolveTaskDescription(task);

        return (
          <li
            key={String(task.id)}
            className="rounded-3xl border border-border bg-[linear-gradient(180deg,rgba(17,23,34,0.95),rgba(21,27,35,0.96))] p-4 shadow-[0_0_30px_rgba(0,0,0,0.16)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-accent/30"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border border-accent/20 bg-accent/10 text-accent">소모 멘탈 {formatNumber(hpCost)}</Badge>
                  <Badge className="border border-primary/20 bg-primary/10 text-primary">보상 골드 {formatNumber(rewardGold)}</Badge>
                  <Badge className="border border-danger/20 bg-danger/10 text-danger">보상 EXP {formatNumber(rewardExp)}</Badge>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground md:text-xl">{resolveTaskName(task)}</h3>
                  {description ? (
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{description}</p>
                  ) : (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">의뢰의 상세 설명이 아직 준비되지 않았습니다.</p>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { label: "소모 멘탈", value: formatNumber(hpCost) },
                    { label: "보상 골드", value: formatNumber(rewardGold) },
                    { label: "보상 EXP", value: formatNumber(rewardExp) },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-border bg-surface-2 px-3 py-2.5">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 items-start lg:justify-end">
                <Button
                  type="button"
                  onClick={() => handleRequest(task)}
                  disabled={isPending}
                  className="border border-accent/30 bg-accent/10 text-accent transition hover:bg-accent hover:text-background disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "처리 중..." : "업무 처리"}
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}