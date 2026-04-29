'use client';

import { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { getSafeSession } from '@/lib/supabaseAuth';
import { supabase } from '@/lib/supabaseClient';

interface HobbyItem {
  id: string;
  author_id: string;
  category: string;
  title: string;
  rating: number;
  comment: string;
  author_nickname: string;
  likes_count: number;
}

const categories = ['축구', '영화', '음악', '독서', '게임', '기타'] as const;

const categoryBadgeColor: Record<string, string> = {
  축구: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-[#111827] dark:text-gray-200 dark:border-[#334155]',
  영화: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-[#111827] dark:text-gray-200 dark:border-[#334155]',
  음악: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-[#111827] dark:text-gray-200 dark:border-[#334155]',
  독서: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-[#111827] dark:text-gray-200 dark:border-[#334155]',
  게임: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-[#111827] dark:text-gray-200 dark:border-[#334155]',
  기타: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-[#111827] dark:text-gray-200 dark:border-[#334155]',
};

const renderStars = (rating: number) => {
  return '⭐'.repeat(rating);
};

function parseSupabaseError(error: unknown): { code?: string; message: string } {
  if (error instanceof Error) {
    return { message: error.message };
  }

  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const code = typeof record.code === 'string' ? record.code : undefined;
    const message = typeof record.message === 'string' ? record.message : '알 수 없는 Supabase 오류';
    return { code, message };
  }

  return { message: '알 수 없는 Supabase 오류' };
}

export default function HobbyReviewClient() {
  const [hobbies, setHobbies] = useState<HobbyItem[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());
  const [likedHobbyIds, setLikedHobbyIds] = useState<Set<string>>(new Set());
  const hasWarnedLikeLoadRef = useRef(false);

  const [formData, setFormData] = useState({
    author_nickname: '',
    category: '축구' as string,
    title: '',
    rating: 5,
    comment: '',
  });

  const fetchHobbies = async () => {
    const { data, error } = await supabase
      .from('hobbies')
      .select('id, author_id, category, title, rating, comment, author_nickname, likes_count');

    if (error) {
      console.error('취미 피드 로드 오류:', error);
      return;
    }

    // 목록은 항상 서버 기준 최신 상태로 다시 맞춘다.
    setHobbies((data || []) as HobbyItem[]);
  };

  const fetchLikedHobbyIds = async (userId: string | null) => {
    if (!userId) {
      setLikedHobbyIds(new Set());
      return;
    }

    const { data, error } = await supabase
      .from('hobby_likes')
      .select('hobby_id')
      .eq('user_id', userId);

    if (error) {
      if (!hasWarnedLikeLoadRef.current) {
        const normalizedError = parseSupabaseError(error);
        const configHint = normalizedError.code === '42P01'
          ? ' (hobby_likes 마이그레이션이 적용되지 않았을 수 있습니다.)'
          : '';

        console.warn(`좋아요 상태를 불러오지 못했습니다: ${normalizedError.message}${configHint}`);
        hasWarnedLikeLoadRef.current = true;
      }
      setLikedHobbyIds(new Set());
      return;
    }

    setLikedHobbyIds(new Set((data || []).map((item) => item.hobby_id as string)));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const session = await getSafeSession();
        const sessionUser = session?.user;
        setCurrentUserId(sessionUser?.id ?? null);

        const emailPrefix = sessionUser?.email?.split('@')[0] || '';
        setIsAdmin(emailPrefix === 'admin5467' || emailPrefix === 'kkangho5467');
        await fetchHobbies();
        await fetchLikedHobbyIds(sessionUser?.id ?? null);
      } catch (err) {
        console.error('데이터 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user?.id ?? null;
      setCurrentUserId(nextUserId);
      const emailPrefix = session?.user?.email?.split('@')[0] || '';
      setIsAdmin(emailPrefix === 'admin5467' || emailPrefix === 'kkangho5467');
      void fetchLikedHobbyIds(nextUserId);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLike = async (id: string) => {
    const target = hobbies.find((item) => item.id === id);
    if (!target) {
      return;
    }

    if (likingIds.has(id)) {
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      toast.error('로그인이 필요한 기능입니다.');
      return;
    }

    const wasLiked = likedHobbyIds.has(id);
    const optimisticLikesCount = wasLiked
      ? Math.max((target.likes_count || 0) - 1, 0)
      : (target.likes_count || 0) + 1;

    // 낙관적 업데이트: 먼저 UI 반영 후 실패 시 롤백한다.
    setLikingIds((prev) => new Set(prev).add(id));
    setHobbies((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, likes_count: optimisticLikesCount } : item
      )
    );
    setLikedHobbyIds((prev) => {
      const next = new Set(prev);
      if (wasLiked) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    try {
      const { data, error } = await supabase.rpc('toggle_hobby_like', {
        p_hobby_id: id,
      });

      if (error) {
        throw error;
      }

      const payload = Array.isArray(data) ? data[0] : data;
      if (payload && typeof payload.likes_count === 'number' && typeof payload.liked === 'boolean') {
        setHobbies((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, likes_count: payload.likes_count } : item
          )
        );
        setLikedHobbyIds((prev) => {
          const next = new Set(prev);
          if (payload.liked) {
            next.add(id);
          } else {
            next.delete(id);
          }
          return next;
        });
      }
    } catch (err) {
      const normalizedError = parseSupabaseError(err);
      const migrationHint = normalizedError.message.toLowerCase().includes('toggle_hobby_like')
        ? ' (toggle_hobby_like RPC가 배포되지 않았을 수 있습니다.)'
        : '';

      console.warn(`좋아요 업데이트 오류: ${normalizedError.message}${migrationHint}`);
      toast.error('좋아요 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      setHobbies((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, likes_count: target.likes_count || 0 } : item
        )
      );
      setLikedHobbyIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    } finally {
      setLikingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    if (!currentUserId) {
      alert('로그인 후 작성할 수 있습니다.');
      return;
    }

    if (
      !formData.author_nickname.trim() ||
      !formData.category.trim() ||
      !formData.title.trim() ||
      !formData.comment.trim()
    ) {
      alert('닉네임, 카테고리, 제목, 소감을 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        author_nickname: formData.author_nickname,
        category: formData.category,
        title: formData.title,
        rating: formData.rating,
        comment: formData.comment,
      };

      // editingId 유무로 등록/수정 API를 분기한다.
      const { error } = editingId
        ? await supabase.from('hobbies').update(payload).eq('id', editingId)
        : await supabase.from('hobbies').insert([
            {
              author_id: currentUserId,
              ...payload,
              likes_count: 0,
            },
          ]);

      if (error) {
        throw error;
      }

      setFormData({
        author_nickname: '',
        category: '축구',
        title: '',
        rating: 5,
        comment: '',
      });
      setEditingId(null);
      setFormOpen(false);
      await fetchHobbies();
    } catch (err) {
      console.error('등록 오류:', err);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review: HobbyItem) => {
    if (!currentUserId) {
      alert('로그인 후 이용할 수 있습니다.');
      return;
    }

    if (!isAdmin && review.author_id !== currentUserId) {
      alert('수정 권한이 없습니다.');
      return;
    }

    setEditingId(review.id);
    setFormData({
      author_nickname: review.author_nickname,
      category: review.category,
      title: review.title,
      rating: review.rating,
      comment: review.comment,
    });
    setFormOpen(true);
  };

  const handleDeleteReview = async (review: HobbyItem) => {
    if (!currentUserId) {
      alert('로그인 후 이용할 수 있습니다.');
      return;
    }

    if (!isAdmin && review.author_id !== currentUserId) {
      alert('삭제 권한이 없습니다.');
      return;
    }

    if (!window.confirm('해당 글을 삭제하시겠습니까?')) {
      return;
    }

    const { error } = await supabase.from('hobbies').delete().eq('id', review.id);
    if (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
      return;
    }

    await fetchHobbies();
  };

  return (
    <section className="space-y-6">
      {/* 헤더 */}
      <header className="rounded-lg border border-slate-200 bg-white p-6 md:p-8">
        <p className="text-xs tracking-[0.16em] text-slate-500">HOBBY</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">취미</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
          다양한 취미 경험을 공유하고 공감하는 피드입니다. 마음에 드는 글에는 좋아요를 눌러보세요.
        </p>
      </header>

      <div className="flex items-center justify-end">
        <button
          onClick={() => {
            if (formOpen) {
              setFormOpen(false);
              setEditingId(null);
            } else {
              setFormOpen(true);
              setEditingId(null);
              setFormData({
                author_nickname: '',
                category: '축구',
                title: '',
                rating: 5,
                comment: '',
              });
            }
          }}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-[#334155] dark:bg-[#111827] dark:text-gray-200 dark:hover:bg-[#0f172a]"
        >
          {formOpen ? '닫기' : '내 관심사 공유하기'}
        </button>
      </div>

      {/* 글쓰기 폼 */}
      {formOpen && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-[#334155] dark:bg-[#111827]">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-gray-100">{editingId ? '관심사 수정하기' : '관심사 작성하기'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-gray-200">닉네임</label>
              <input
                type="text"
                value={formData.author_nickname}
                onChange={(e) => setFormData({ ...formData, author_nickname: e.target.value })}
                placeholder="표시할 닉네임"
                className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-[#334155] dark:bg-[#0f172a] dark:text-gray-100"
              />
            </div>

            {/* 카테고리 선택 */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-gray-200">카테고리</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as typeof formData.category })
                }
                className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-[#334155] dark:bg-[#0f172a] dark:text-gray-100"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-gray-200">제목</label>
              <input
                type="text"
                placeholder="리뷰 제목을 입력해주세요"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-[#334155] dark:bg-[#0f172a] dark:text-gray-100"
              />
            </div>

            {/* 평점 */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-gray-200">평점 (1~5)</label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="mt-1 w-full"
              />
              <div className="mt-2 text-lg">{renderStars(formData.rating)}</div>
            </div>

            {/* 소감 */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-gray-200">소감</label>
              <textarea
                placeholder="간단한 소감을 입력해주세요"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-[#334155] dark:bg-[#0f172a] dark:text-gray-100"
                rows={3}
              />
            </div>

            {/* 버튼 */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border dark:border-[#334155] dark:bg-[#0f172a] dark:hover:bg-[#111827]"
            >
              {submitting ? (editingId ? '수정 중...' : '등록 중...') : editingId ? '수정 저장' : '등록'}
            </button>
          </div>
        </div>
      )}

      {/* 리뷰 카드 그리드 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hobbies.map((review) => (
          <article
            key={review.id}
            className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-[#334155] dark:bg-[#111827]"
          >
            {/* 상단: 닉네임 + 카테고리 뱃지 */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">{review.author_nickname}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${
                    categoryBadgeColor[review.category] || 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  {review.category}
                </span>

                {(isAdmin || review.author_id === currentUserId) && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleEditReview(review)}
                      className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:border-[#334155] dark:text-gray-300 dark:hover:bg-[#0f172a]"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(review)}
                      className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:border-[#334155] dark:text-gray-300 dark:hover:bg-[#0f172a]"
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 중앙: 제목, 별점, 본문 */}
            <h3 className="line-clamp-2 text-lg font-bold text-slate-900 dark:text-gray-100">{review.title}</h3>
            <div className="my-3 text-xl">{renderStars(review.rating)}</div>
            <p className="flex-1 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-gray-300">{review.comment}</p>

            {/* 하단: 좋아요 */}
            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-[#334155]">
              <button
                onClick={() => handleLike(review.id)}
                disabled={likingIds.has(review.id)}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  likedHobbyIds.has(review.id)
                    ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-[#334155] dark:text-gray-200 dark:hover:bg-[#0f172a]'
                }`}
                aria-label="좋아요 토글"
              >
                <Heart
                  className="h-4 w-4"
                  fill={likedHobbyIds.has(review.id) ? 'currentColor' : 'none'}
                />
                좋아요 {review.likes_count || 0}
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-[#334155] dark:bg-[#111827]">
          <p className="text-slate-600 dark:text-gray-300">취미 피드를 불러오는 중입니다...</p>
        </div>
      )}

      {/* 결과 없음 */}
      {!loading && hobbies.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-[#334155] dark:bg-[#111827]">
          <p className="text-slate-600 dark:text-gray-300">아직 등록된 관심사 글이 없습니다.</p>
        </div>
      )}
    </section>
  );
}
