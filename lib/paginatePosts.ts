const POSTS_PER_PAGE = 10;

/**
 * 전체 게시물 배열에서 현재 페이지에 해당하는 10개 게시물만 반환한다.
 */
export function paginatePosts<T>(posts: T[], currentPage: number): T[] {
  const safePage = Number.isFinite(currentPage) ? Math.max(1, Math.floor(currentPage)) : 1;
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;

  return posts.slice(startIndex, endIndex);
}

export { POSTS_PER_PAGE };