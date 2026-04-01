import MainLayout from "@/app/components/MainLayout";
import PostDetailClient from "@/app/components/PostDetailClient";
import { getMockPostById } from "@/content/blog-content";

type PostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const post = getMockPostById(id) ?? null;

  return (
    <MainLayout>
      <PostDetailClient id={id} initialPost={post} />
    </MainLayout>
  );
}