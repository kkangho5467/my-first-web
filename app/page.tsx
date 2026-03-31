import MainLayout from "./components/MainLayout";

export default function Home() {
  return (
    <MainLayout>
      <section className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">블로그 메인</h1>
        <p className="max-w-2xl text-slate-600">
          이 영역은 블로그의 메인 콘텐츠 구역입니다. 최신 글, 추천 글, 카테고리 요약 등을 배치할 수 있습니다.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">최신 글</h2>
            <p className="mt-2 text-sm text-slate-600">최근 작성한 글을 카드 형태로 보여주세요.</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">인기 카테고리</h2>
            <p className="mt-2 text-sm text-slate-600">방문자가 많이 찾는 주제를 정리해 노출하세요.</p>
          </article>
        </div>
      </section>
    </MainLayout>
  );
}
