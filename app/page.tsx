import BlogShell from "./components/BlogShell";
import { homePosts } from "../content/blog-content";

export default function Home() {
  return (
    <BlogShell active="home">
      <section>
        <article className="mt-4 overflow-hidden border border-slate-200 bg-white">
          <div className="relative h-24 bg-gradient-to-r from-[#8b1111] via-[#cc2323] to-[#ff4a3d] md:h-28">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.20),transparent_35%),radial-gradient(circle_at_65%_35%,rgba(255,255,255,0.15),transparent_30%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.02)_45%,rgba(0,0,0,0.25)_100%)]" />
          </div>
          <div className="px-5 pb-6 md:px-8">
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#d32121] to-[#f4522f] text-3xl font-extrabold text-white md:h-28 md:w-28">
                KH
              </div>

              <div>
                <h2 className="text-4xl font-black text-slate-900 md:text-5xl">김강호</h2>
                <p className="mt-1 text-lg font-semibold text-slate-700"></p>
                <p className="mt-2 text-sm text-slate-600 md:text-base">
                  한신대학교 23학번 김강호입니다
                </p>
                <a
                  href="https://www.instagram.com/04_kangho/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-[#c13584] underline underline-offset-2 hover:text-[#833ab4]"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-[6px] bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5]">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 text-white">
                      <rect x="5" y="5" width="14" height="14" rx="4" ry="4" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="16.6" cy="7.8" r="1" fill="currentColor" />
                    </svg>
                  </span>
                  https://www.instagram.com/04_kangho/
                </a>

              </div>
            </div>

            <p className="mt-4 border-t border-slate-200 pt-4 text-xs tracking-[0.16em] text-slate-500">
              CHANNEL STYLE MAIN INTRO
            </p>
          </div>
        </article>

        <section className="mt-0 grid gap-0 md:grid-cols-3">
          {homePosts.map((post) => (
            <article key={post.title} className="border border-slate-200 bg-white p-4">
              <div className={`h-32 bg-gradient-to-br ${post.accent}`} />
              <h3 className="mt-4 text-lg font-bold leading-7 text-slate-900">{post.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{post.desc}</p>
              <p className="mt-4 text-xs font-medium tracking-wide text-slate-400">{post.meta}</p>
            </article>
          ))}
        </section>
      </section>
    </BlogShell>
  );
}
