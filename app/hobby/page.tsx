import BlogShell from "../components/BlogShell";
import { hobbyItems } from "../../content/blog-content";

export default function HobbyPage() {
  return (
    <BlogShell active="hobby">
      <section className="mt-4 border border-slate-200 bg-white p-6 md:p-8">
        <p className="text-xs tracking-[0.16em] text-slate-500">HOBBY ARCHIVE</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">취미</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
          일상 속 취미에서 얻은 영감을 디자인과 글쓰기에 연결하는 페이지입니다.
        </p>
      </section>

      <section className="mt-0 grid gap-0 md:grid-cols-3">
        {hobbyItems.map((hobby) => (
          <article key={hobby.title} className="border border-slate-200 bg-white p-5">
            <h3 className="text-xl font-bold text-slate-900">{hobby.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{hobby.desc}</p>
          </article>
        ))}
      </section>
    </BlogShell>
  );
}
