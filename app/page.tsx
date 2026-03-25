export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-4xl items-center justify-center">
        <article className="w-full max-w-xl rounded-lg bg-white p-8 shadow md:p-10">
          <h1 className="text-3xl font-bold text-slate-900">김강호</h1>
          <div className="mt-6 space-y-3 text-lg text-slate-700">
            <p>
              <span className="font-semibold text-slate-900">학교:</span> 한신대학교
            </p>
            <p>
              <span className="font-semibold text-slate-900">전공:</span> 공공인재빅데이터융합학과
            </p>
            <p>
              <span className="font-semibold text-slate-900">취미:</span> 축구, 음악감상, 영화시청
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
