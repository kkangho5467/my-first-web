import MainLayout from "../components/MainLayout";
import { hobbyItems } from "../../content/blog-content";

export default function HobbyPage() {
  return (
    <MainLayout>
      <section className="space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white p-6 md:p-8">
          <p className="text-xs tracking-[0.16em] text-slate-500">HOBBY</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">취미</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            일상 속 취미에서 얻은 영감을 정리하는 공간입니다.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hobbyItems.map((hobby) => (
          <article key={hobby.title} className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="text-xl font-bold text-slate-900">{hobby.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{hobby.desc}</p>
          </article>
        ))}
        </section>
      </section>
    </MainLayout>
  );
}
