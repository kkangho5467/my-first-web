import MainLayout from "@/app/components/MainLayout";
import PostDetailClient from "@/app/components/PostDetailClient";
import { fetchPostByIdAndIncrementViews, mapRowToMockPost } from "@/lib/communityServer";

type PostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;

  // 서버에서 조회수를 증가시키고 업데이트된 게시글을 로드한다.
  const postRow = await fetchPostByIdAndIncrementViews(id);
  const initialPost = postRow ? mapRowToMockPost(postRow) : null;

  return (
    <MainLayout>
      <PostDetailClient id={id} initialPost={initialPost} />
    </MainLayout>
  );
}