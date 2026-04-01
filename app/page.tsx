import MainLayout from "./components/MainLayout";
import RecentPostList from "./components/RecentPostList";
import KoreaLiveClock from "./components/KoreaLiveClock";

export const dynamic = "force-dynamic";

function getKoreaServerTime(): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

export default function Home() {
  const koreaServerTime = getKoreaServerTime();

  return (
    <MainLayout>
      <section className="space-y-10">
        <header className="py-20 md:py-28">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            안녕하세요, 김강호입니다.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500 md:text-lg">
            한신대학교 공공인재학부 김강호입니다.
          </p>
          <KoreaLiveClock initialServerTime={koreaServerTime} />
        </header>

        <RecentPostList initialPosts={[]} />
      </section>
    </MainLayout>
  );
}
