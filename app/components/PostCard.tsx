import Image from "next/image";

type PostCardProps = {
  title: string;
  date: string;
  excerpt: string;
  imageUrl: string;
};

export default function PostCard({ title, date, excerpt, imageUrl }: PostCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-48 w-full bg-slate-100">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="space-y-3 p-5">
        <time className="block text-sm text-slate-500" dateTime={date}>
          {date}
        </time>
        <h2 className="text-xl font-semibold leading-tight text-slate-900">{title}</h2>
        <p className="text-sm leading-6 text-slate-600">{excerpt}</p>
      </div>
    </article>
  );
}