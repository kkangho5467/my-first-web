'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Review {
  id: string;
  author_id: string;
  category: '축구' | '영화' | '음악';
  title: string;
  rating: number;
  created_at: string;
  comment: string;
}

interface Comment {
  id: string;
  review_id: string;
  author_id: string;
  text: string;
  created_at: string;
}

const categories = ['전체', '축구', '영화', '음악'] as const;

const categoryBadgeColor: Record<string, string> = {
  축구: 'bg-blue-100 text-blue-800 border-blue-300',
  영화: 'bg-rose-100 text-rose-800 border-rose-300',
  음악: 'bg-purple-100 text-purple-800 border-purple-300',
};

const renderStars = (rating: number) => {
  return '⭐'.repeat(rating);
};

const truncateComment = (comment: string, lines: number = 2) => {
  const lineArray = comment.split('\n');
  if (lineArray.length > lines) {
    return lineArray.slice(0, lines).join('\n') + '...';
  }
  
  // 글자 수로도 제한 (약 2줄 기준 80자)
  if (comment.length > 80) {
    return comment.substring(0, 80) + '...';
  }
  
  return comment;
};

export default function HobbyReviewClient() {
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[number]>('전체');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComments, setNewComments] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    category: '축구' as (typeof categories)[number],
    title: '',
    rating: 5,
    comment: '',
  });

  // 현재 사용자 정보 로드 및 리뷰 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const userId = data.session.user.id;
          const userEmail = data.session.user.email || '';
          setCurrentUser({ id: userId, email: userEmail });

          // admin5467 또는 kkangho5467로 시작하는 이메일 체크
          setIsAdmin(
            userEmail.startsWith('admin5467') ||
            userEmail.startsWith('kkangho5467') ||
            userEmail.includes('admin5467') ||
            userEmail.includes('kkangho5467')
          );
        }

        // Supabase에서 리뷰 데이터 로드
        const { data: reviewsData, error } = await supabase
          .from('hobbies')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('리뷰 로드 오류:', error);
        } else if (reviewsData) {
          setReviews(reviewsData as Review[]);

          // 각 리뷰의 댓글 로드
          if (reviewsData.length > 0) {
            const commentsMap: Record<string, Comment[]> = {};
            for (const review of reviewsData) {
              const { data: commentsData } = await supabase
                .from('hobby_comments')
                .select('*')
                .eq('review_id', review.id)
                .order('created_at', { ascending: true });
              if (commentsData) {
                commentsMap[review.id] = commentsData as Comment[];
              }
            }
            setComments(commentsMap);
          }
        }
      } catch (err) {
        console.error('데이터 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userId = session.user.id;
        const userEmail = session.user.email || '';
        setCurrentUser({ id: userId, email: userEmail });
        setIsAdmin(
          userEmail.startsWith('admin5467') ||
          userEmail.startsWith('kkangho5467') ||
          userEmail.includes('admin5467') ||
          userEmail.includes('kkangho5467')
        );
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const filteredReviews =
    selectedCategory === '전체'
      ? reviews
      : reviews.filter((review) => review.category === selectedCategory);

  const handleAddReview = async () => {
    if (!formData.title.trim() || !formData.comment.trim()) {
      alert('제목과 소감을 입력해주세요.');
      return;
    }

    if (!currentUser) {
      alert('먼저 로그인해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // 수정
        const { error } = await supabase
          .from('hobbies')
          .update({
            category: formData.category,
            title: formData.title,
            rating: formData.rating,
            comment: formData.comment,
          })
          .eq('id', editingId);

        if (error) {
          alert('리뷰 수정 중 오류가 발생했습니다.');
          console.error('수정 오류:', error);
        } else {
          const { data: updatedData } = await supabase
            .from('hobbies')
            .select('*')
            .order('created_at', { ascending: false });

          if (updatedData) {
            setReviews(updatedData as Review[]);
          }

          setFormData({ category: '축구', title: '', rating: 5, comment: '' });
          setEditingId(null);
          setFormOpen(false);
          alert('리뷰가 수정되었습니다!');
        }
      } else {
        // 신규 작성
        const { error } = await supabase.from('hobbies').insert([
          {
            author_id: currentUser.id,
            category: formData.category,
            title: formData.title,
            rating: formData.rating,
            comment: formData.comment,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) {
          alert('리뷰 등록 중 오류가 발생했습니다.');
          console.error('등록 오류:', error);
        } else {
          const { data: refreshedData } = await supabase
            .from('hobbies')
            .select('*')
            .order('created_at', { ascending: false });

          if (refreshedData) {
            setReviews(refreshedData as Review[]);
          }

          setFormData({ category: '축구', title: '', rating: 5, comment: '' });
          setFormOpen(false);
          alert('리뷰가 등록되었습니다!');
        }
      }
    } catch (err) {
      console.error('오류:', err);
      alert('오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      // 댓글 먼저 삭제
      await supabase.from('hobby_comments').delete().eq('review_id', reviewId);

      // 리뷰 삭제
      const { error } = await supabase.from('hobbies').delete().eq('id', reviewId);

      if (error) {
        alert('삭제 중 오류가 발생했습니다.');
        console.error('삭제 오류:', error);
      } else {
        setReviews(reviews.filter((r) => r.id !== reviewId));
        setComments((prev) => {
          const newComments = { ...prev };
          delete newComments[reviewId];
          return newComments;
        });
      }
    } catch (err) {
      console.error('삭제 중 오류:', err);
    }
  };

  const handleEditReview = (review: Review) => {
    setFormData({
      category: review.category,
      title: review.title,
      rating: review.rating,
      comment: review.comment,
    });
    setEditingId(review.id);
    setFormOpen(true);
  };

  const handleAddComment = async (reviewId: string) => {
    const text = newComments[reviewId]?.trim();
    if (!text) {
      alert('댓글을 입력해주세요.');
      return;
    }

    if (!currentUser) {
      alert('먼저 로그인해주세요.');
      return;
    }

    try {
      const { error } = await supabase.from('hobby_comments').insert([
        {
          review_id: reviewId,
          author_id: currentUser.id,
          text,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('댓글 추가 오류:', error);
        alert('댓글 추가 중 오류가 발생했습니다.');
      } else {
        // 해당 리뷰의 댓글 다시 로드
        const { data: updatedComments } = await supabase
          .from('hobby_comments')
          .select('*')
          .eq('review_id', reviewId)
          .order('created_at', { ascending: true });

        if (updatedComments) {
          setComments((prev) => ({
            ...prev,
            [reviewId]: updatedComments as Comment[],
          }));
        }

        setNewComments((prev) => ({
          ...prev,
          [reviewId]: '',
        }));
      }
    } catch (err) {
      console.error('댓글 추가 오류:', err);
    }
  };

  const handleDeleteComment = async (commentId: string, reviewId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase.from('hobby_comments').delete().eq('id', commentId);

      if (error) {
        console.error('댓글 삭제 오류:', error);
      } else {
        setComments((prev) => ({
          ...prev,
          [reviewId]: prev[reviewId]?.filter((c) => c.id !== commentId) || [],
        }));
      }
    } catch (err) {
      console.error('댓글 삭제 오류:', err);
    }
  };

  const toggleComments = (reviewId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  return (
    <section className="space-y-6">
      {/* 헤더 */}
      <header className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-8">
        <p className="text-xs tracking-[0.16em] text-slate-500">HOBBY</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">취미</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
          일상 속 취미에서 얻은 영감을 정리하는 공간입니다. 영화, 음악, 축구 등 다양한 장르에 대한 개인적 리뷰를 기록합니다.
        </p>
      </header>

      {/* 필터 버튼 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 로그인한 사용자만 글쓰기 버튼 표시 */}
        {currentUser && (
          <button
            onClick={() => {
              setFormOpen(!formOpen);
              setEditingId(null);
              setFormData({ category: '축구', title: '', rating: 5, comment: '' });
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
          >
            {formOpen && !editingId ? '취소' : '➕ 새 리뷰 쓰기'}
          </button>
        )}
      </div>

      {/* 리뷰 추가/수정 폼 */}
      {formOpen && currentUser && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-slate-900">
            {editingId ? '리뷰 수정' : '새 리뷰 작성'}
          </h3>
          <div className="space-y-4">
            {/* 카테고리 선택 */}
            <div>
              <label className="block text-sm font-medium text-slate-900">카테고리</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as typeof formData.category })
                }
                className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="축구">축구</option>
                <option value="영화">영화</option>
                <option value="음악">음악</option>
              </select>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-slate-900">제목</label>
              <input
                type="text"
                placeholder="리뷰 제목을 입력해주세요"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            {/* 평점 */}
            <div>
              <label className="block text-sm font-medium text-slate-900">평점 (1~5)</label>
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
              <label className="block text-sm font-medium text-slate-900">소감</label>
              <textarea
                placeholder="간단한 소감을 입력해주세요"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm"
                rows={3}
              />
            </div>

            {/* 버튼 */}
            <button
              onClick={handleAddReview}
              disabled={submitting}
              className="w-full rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (editingId ? '수정 중...' : '등록 중...') : editingId ? '수정 완료' : '등록'}
            </button>
          </div>
        </div>
      )}

      {/* 리뷰 카드 그리드 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReviews.map((review) => (
          <article
            key={review.id}
            className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            {/* 상단: 카테고리 뱃지 + 날짜 + 액션 버튼 */}
            <div className="mb-3 flex items-center justify-between">
              <span
                className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${
                  categoryBadgeColor[review.category] || 'bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                {review.category}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {new Date(review.created_at).toLocaleDateString('ko-KR')}
                </span>
                {currentUser && currentUser.id === review.author_id && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="text-slate-400 hover:text-blue-500 transition-colors text-sm"
                      title="수정"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors text-lg"
                      title="삭제"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 제목 */}
            <h3 className="text-lg font-bold text-slate-900 line-clamp-2">{review.title}</h3>

            {/* 별점 */}
            <div className="my-3 text-xl">{renderStars(review.rating)}</div>

            {/* 소감 */}
            <p className="flex-1 text-sm leading-6 text-slate-600 line-clamp-2">{truncateComment(review.comment)}</p>

            {/* 평점 숫자 */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-right text-xs text-slate-500">
                평점 <span className="font-semibold text-slate-900">{review.rating}/5</span>
              </p>
            </div>

            {/* 댓글 섹션 */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => toggleComments(review.id)}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                💬 댓글 ({comments[review.id]?.length || 0})
              </button>

              {expandedComments.has(review.id) && (
                <div className="mt-3 space-y-3">
                  {/* 기존 댓글 */}
                  {comments[review.id]?.map((comment) => (
                    <div key={comment.id} className="rounded bg-slate-50 p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">
                          {comment.author_id.slice(0, 8) || 'Anonymous'}
                        </span>
                        {currentUser && currentUser.id === comment.author_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id, review.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-slate-600">{comment.text}</p>
                      <span className="text-slate-400">
                        {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  ))}

                  {/* 댓글 작성 */}
                  {currentUser && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="댓글을 작성하세요"
                        value={newComments[review.id] || ''}
                        onChange={(e) =>
                          setNewComments((prev) => ({
                            ...prev,
                            [review.id]: e.target.value,
                          }))
                        }
                        className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                      <button
                        onClick={() => handleAddComment(review.id)}
                        className="rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white hover:bg-slate-800"
                      >
                        등록
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">리뷰를 불러오는 중입니다...</p>
        </div>
      )}

      {/* 결과 없음 */}
      {!loading && filteredReviews.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">해당 카테고리의 리뷰가 없습니다.</p>
        </div>
      )}
    </section>
  );
}
