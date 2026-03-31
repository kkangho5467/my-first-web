export type SearchablePost = {
  title: string;
  excerpt?: string;
  content?: string;
  desc?: string;
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function getPostBody(post: SearchablePost): string {
  return post.content ?? post.excerpt ?? post.desc ?? "";
}

/**
 * 제목(title) 또는 내용(excerpt/content/desc)에 검색어가 포함된 게시물만 반환한다.
 */
export function searchPostsByTitleOrContent<T extends SearchablePost>(
  posts: T[],
  query: string
): T[] {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return posts;
  }

  return posts.filter((post) => {
    const title = normalizeText(post.title);
    const body = normalizeText(getPostBody(post));
    return title.includes(normalizedQuery) || body.includes(normalizedQuery);
  });
}