import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { Shield, Sparkles, Sword, Trophy, Users, WandSparkles } from "lucide-react";
import MainLayout from "@/app/components/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type PlayerProfile = {
  nickname: string | null;
  level: number | null;
  current_hp: number | null;
  max_hp: number | null;
  atk: number | null;
  def: number | null;
  gold: number | null;
};

type MonsterRow = Record<string, unknown> & {
  id: string | number;
};

function formatNumber(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return new Intl.NumberFormat("ko-KR").format(value);
}

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

function resolveMonsterName(monster: MonsterRow): string {
  return firstText(monster.name, monster.monster_name, monster.title, monster.label) ?? "이름 미상";
}

function resolveMonsterElement(monster: MonsterRow): string | null {
  return firstText(monster.element, monster.type, monster.category, monster.biome);
}

function resolveMonsterDescription(monster: MonsterRow): string | null {
  return firstText(monster.description, monster.summary, monster.note);
}

export default async function RpgLobbyPage() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const monsterQuery = supabase.from("monsters").select("*");

  const [profileResult, monsterResult] = await Promise.all([
    session?.user
      ? supabase
          .from("profiles")
          .select("nickname, level, current_hp, max_hp, atk, def, gold")
          .eq("id", session.user.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    monsterQuery,
  ]);

  const playerProfile = (profileResult.data ?? null) as PlayerProfile | null;
  const monsters = (monsterResult.data ?? []) as MonsterRow[];

  const healthRate = playerProfile?.max_hp
    ? Math.min(100, Math.max(0, Math.round(((playerProfile.current_hp ?? 0) / playerProfile.max_hp) * 100)))
    : 0;

  return (
    <MainLayout>
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-background px-4 py-6 shadow-2xl shadow-black/30 md:px-6 md:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(109,167,255,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(194,154,115,0.12),transparent_26%),radial-gradient(circle_at_bottom,rgba(239,107,107,0.08),transparent_30%)]" />

        <div className="relative space-y-6">
          <header className="rounded-[1.5rem] border border-border bg-surface/95 p-5 backdrop-blur md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <Badge className="w-fit border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
                  Supa-Quest Lobby
                </Badge>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                    대기실에 오신 것을 환영합니다.
                  </h1>
                  <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                    로그인한 영웅의 능력치를 확인하고, 사냥터의 몬스터를 정찰해 전투를 준비하세요. 이곳은 Supa-Quest의 첫 관문입니다.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[36rem]">
                <div className="rounded-2xl border border-border bg-surface-2 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">세션</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {session?.user ? "연결됨" : "게스트"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-surface-2 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">캐릭터</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {playerProfile?.nickname ?? "미등록"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-surface-2 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">몬스터</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{monsters.length}종</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface-2 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">상태</p>
                  <p className="mt-2 text-sm font-semibold text-accent">
                    {session?.user ? "전투 준비" : "로그인 필요"}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="overflow-hidden border-border bg-surface/95 shadow-lg shadow-black/20">
              <CardHeader className="border-b border-border bg-surface-2/70">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">내 캐릭터</CardTitle>
                    <p className="text-sm text-muted-foreground">세션 기반 SSR로 불러온 영웅 정보</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 p-5 md:p-6">
                {session?.user ? (
                  playerProfile ? (
                    <>
                      <div className="rounded-3xl border border-accent/20 bg-[radial-gradient(circle_at_top_right,rgba(109,167,255,0.16),transparent_48%),linear-gradient(180deg,rgba(27,34,48,0.92),rgba(21,27,35,0.96))] p-5 shadow-[0_0_40px_rgba(109,167,255,0.12)]">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-accent/90">Hero</p>
                            <h2 className="mt-1 text-2xl font-bold text-foreground">
                              {playerProfile.nickname ?? session.user.email?.split("@")[0] ?? "용사"}
                            </h2>
                          </div>
                          <Badge className="border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
                            Lv.{formatNumber(playerProfile.level)}
                          </Badge>
                        </div>

                        <div className="mt-5 space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">생명력</span>
                            <span className="font-semibold text-foreground">
                              {formatNumber(playerProfile.current_hp)} / {formatNumber(playerProfile.max_hp)}
                            </span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-surface-2">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-accent via-primary to-danger shadow-[0_0_18px_rgba(109,167,255,0.45)]"
                              style={{ width: `${healthRate}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {[
                              { label: "ATK", value: playerProfile.atk, icon: Sword },
                              { label: "DEF", value: playerProfile.def, icon: Shield },
                              { label: "GOLD", value: playerProfile.gold, icon: Trophy },
                              { label: "HP", value: playerProfile.current_hp, icon: Sparkles },
                            ].map((stat) => {
                              const Icon = stat.icon;

                              return (
                                <div key={stat.label} className="rounded-2xl border border-border bg-surface-2 px-4 py-3">
                                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                                    <Icon className="h-3.5 w-3.5 text-accent" />
                                    {stat.label}
                                  </div>
                                  <p className="mt-2 text-lg font-bold text-foreground">{formatNumber(stat.value)}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-surface-2 px-4 py-3">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">닉네임</p>
                          <p className="mt-2 text-sm font-semibold text-foreground">
                            {playerProfile.nickname ?? "미설정"}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border bg-surface-2 px-4 py-3">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">전투 준비도</p>
                          <p className="mt-2 text-sm font-semibold text-accent">
                            {healthRate > 65 ? "매우 높음" : healthRate > 30 ? "보통" : "회복 필요"}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-border bg-surface-2/70 p-6 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background text-accent">
                        <WandSparkles className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-foreground">프로필 동기화 대기 중</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        로그인은 확인되었지만 profiles 데이터가 아직 준비되지 않았습니다.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="rounded-3xl border border-dashed border-border bg-surface-2/70 p-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background text-accent">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-foreground">게스트 모드</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      로그인하면 내 캐릭터 정보와 사냥 기록이 이 패널에 표시됩니다.
                    </p>
                    <div className="mt-5 flex justify-center">
                      <Button asChild className="bg-accent text-background hover:bg-accent/90">
                        <Link href="/auth?notice=login-required">로그인하기</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border bg-surface/95 shadow-lg shadow-black/20">
              <CardHeader className="border-b border-border bg-surface-2/70">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                    <Sword className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">사냥터</CardTitle>
                    <p className="text-sm text-muted-foreground">전투 시작 버튼은 아직 준비 중입니다.</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 md:p-6">
                {monsters.length > 0 ? (
                  <ul className="space-y-3">
                    {monsters.map((monster) => {
                      const name = resolveMonsterName(monster);
                      const element = resolveMonsterElement(monster);
                      const description = resolveMonsterDescription(monster);
                      const level = firstNumber(monster.level, monster.monster_level, monster.stage);
                      const currentHp = firstNumber(monster.current_hp, monster.hp, monster.health);
                      const maxHp = firstNumber(monster.max_hp, monster.max_hp_total, monster.health_max);
                      const atk = firstNumber(monster.atk, monster.attack);
                      const def = firstNumber(monster.def, monster.defense);

                      return (
                        <li
                          key={String(monster.id)}
                          className="rounded-3xl border border-border bg-[linear-gradient(180deg,rgba(17,23,34,0.95),rgba(21,27,35,0.96))] p-4 shadow-[0_0_30px_rgba(0,0,0,0.16)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-accent/30"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0 flex-1 space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className="border border-primary/20 bg-primary/10 text-primary">Lv.{formatNumber(level)}</Badge>
                                {element ? (
                                  <Badge className="border border-accent/20 bg-accent/10 text-accent">{element}</Badge>
                                ) : null}
                              </div>

                              <div>
                                <h3 className="text-lg font-semibold text-foreground md:text-xl">{name}</h3>
                                {description ? (
                                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{description}</p>
                                ) : (
                                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    몬스터의 정보가 전장 데이터로 대기 중입니다.
                                  </p>
                                )}
                              </div>

                              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                  { label: "HP", value: currentHp && maxHp ? `${formatNumber(currentHp)} / ${formatNumber(maxHp)}` : formatNumber(currentHp ?? maxHp) },
                                  { label: "ATK", value: formatNumber(atk) },
                                  { label: "DEF", value: formatNumber(def) },
                                  { label: "보상", value: formatNumber(firstNumber(monster.gold, monster.reward_gold)) },
                                ].map((stat) => (
                                  <div key={stat.label} className="rounded-2xl border border-border bg-surface-2 px-3 py-2.5">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                                    <p className="mt-1 text-sm font-semibold text-foreground">{stat.value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center lg:justify-end">
                              <Button
                                type="button"
                                className="border border-accent/30 bg-accent/10 text-accent transition hover:bg-accent hover:text-background"
                              >
                                전투 시작
                              </Button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="rounded-3xl border border-dashed border-border bg-surface-2/70 p-8 text-center">
                    <p className="text-sm text-muted-foreground">아직 등록된 몬스터가 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}