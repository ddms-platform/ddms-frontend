import { useEffect, useState } from 'react';
import { Star, Edit2, Trash2, User } from 'lucide-react';
import type {
  ReviewDto,
  PaginatedReviewResult,
} from '../../../services/reviewService';
import { reviewService } from '../../../services/reviewService';
import { useAuth } from '@/hooks/use-auth';
import ReviewFormModal from './review-form-modal';
import { toast } from 'sonner';

interface TourReviewsProps {
  tourId: string;
}

export default function TourReviews({ tourId }: TourReviewsProps) {
  const { user } = useAuth();
  const [data, setData] = useState<PaginatedReviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [canReview, setCanReview] = useState(false);
  const [validBookingIds, setValidBookingIds] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<ReviewDto | undefined>(undefined);

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const res = await reviewService.getReviewsByTourId(tourId, page, 5);
      setData(res);
      setPageIndex(page);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    if (!user) return;
    try {
      const res = await reviewService.canReviewTour(tourId);
      setCanReview(res.canReview);
      setValidBookingIds(res.bookingIds);
    } catch (error) {
      console.error('Failed to check eligibility', error);
    }
  };

  useEffect(() => {
    if (tourId) {
      fetchReviews();
      checkReviewEligibility();
    }
  }, [tourId, user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await reviewService.deleteReview(id);
      toast.success('Đã xóa đánh giá');
      fetchReviews(pageIndex);
    } catch (error) {
      toast.error('Xóa đánh giá thất bại');
    }
  };

  const openCreateModal = () => {
    setEditData(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (review: ReviewDto) => {
    setEditData(review);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchReviews(1);
    checkReviewEligibility();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < rating ? '#EAB308' : 'none'}
        className={i < rating ? 'text-yellow-500' : 'text-gray-400'}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="mt-10 bg-[#112240] p-6 rounded-2xl shadow-sm border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-white">
          Đánh giá từ khách hàng{' '}
          {data?.totalCount ? `(${data.totalCount})` : ''}
        </h3>
        {canReview && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Viết đánh giá
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Đang tải...</div>
      ) : data && data.reviews.length > 0 ? (
        <div className="space-y-6">
          {data.reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-700 pb-6 last:border-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {review.userAvatarUrl ? (
                    <img
                      src={review.userAvatarUrl}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
                      <User size={20} />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">
                      {review.userName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-gray-400 text-xs">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {(user as any)?.id === review.userId && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEditModal(review)}
                      className="text-gray-400 hover:text-blue-400 transition"
                      title="Sửa"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-gray-400 hover:text-red-400 transition"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-3 text-[#ecf0ff] whitespace-pre-wrap text-sm leading-relaxed">
                {review.comment}
              </p>

              {(review.imageUrls?.length > 0 ||
                review.videoUrls?.length > 0) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {review.imageUrls?.map((url, idx) => (
                    <img
                      key={`img-${idx}`}
                      src={url}
                      alt="Review attachment"
                      className="h-24 w-24 object-cover rounded-lg border border-gray-600"
                    />
                  ))}
                  {review.videoUrls?.map((url, idx) => (
                    <video
                      key={`vid-${idx}`}
                      src={url}
                      controls
                      className="h-24 w-32 object-cover rounded-lg border border-gray-600 bg-black"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {data.totalCount > data.pageSize && (
            <div className="flex justify-center mt-6 gap-2">
              <button
                disabled={pageIndex === 1}
                onClick={() => fetchReviews(pageIndex - 1)}
                className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-white px-3 py-1">Trang {pageIndex}</span>
              <button
                disabled={pageIndex * data.pageSize >= data.totalCount}
                onClick={() => fetchReviews(pageIndex + 1)}
                className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400 bg-[#0a192f] rounded-xl border border-gray-700">
          <p>Chưa có đánh giá nào cho tour này.</p>
        </div>
      )}

      {isModalOpen && (
        <ReviewFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
          tourId={tourId}
          bookingIds={validBookingIds}
          initialData={editData}
        />
      )}
    </div>
  );
}
