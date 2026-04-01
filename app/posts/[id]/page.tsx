import { notFound } from "next/navigation";
import MainLayout from "@/app/components/MainLayout";
import PostDetailSkeleton from "@/app/components/PostDetailSkeleton";
import { getMockPostById } from "@/content/blog-content";

type PostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const post = getMockPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <MainLayout>
      <PostDetailSkeleton title={post.title} date={post.date}>
        <p>{post.excerpt}</p>
        <p className="mt-4">
          상세 본문 영역입니다. 추후 Markdown 렌더러 또는 CMS 데이터를 연결해 실제 콘텐츠를 표시할 수
          있습니다.
        </p>
      </PostDetailSkeleton>
    </MainLayout>
  );
}