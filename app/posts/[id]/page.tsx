import MainLayout from "@/app/components/MainLayout";
import PostDetailClient from "@/app/components/PostDetailClient";

type PostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;

  return (
    <MainLayout>
      <PostDetailClient id={id} initialPost={null} />
    </MainLayout>
  );
}