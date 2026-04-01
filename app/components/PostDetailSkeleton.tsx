import type { ReactNode } from "react";

type PostDetailSkeletonProps = {
  title: string;
  date: string;
  children: ReactNode;
};

export default function PostDetailSkeleton({ title, date, children }: PostDetailSkeletonProps) {
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">작성일 {date}</p>
      </header>

      <article className="max-w-3xl leading-8 text-slate-700">{children}</article>
    </section>
  );
}