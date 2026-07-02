import React, { useState, useEffect } from 'react';
import { Star, X, UploadCloud, XCircle } from 'lucide-react';
import type { ReviewDto } from '../../../services/reviewService';
import { reviewService } from '../../../services/reviewService';
import { toast } from 'sonner';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tourId: string;
  bookingIds?: string[];
  initialData?: ReviewDto;
}

export default function ReviewFormModal({
  isOpen,
  onClose,
  onSuccess,
  tourId,
  bookingIds,
  initialData,
}: ReviewFormModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingVideos, setExistingVideos] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setRating(initialData.rating);
        setComment(initialData.comment);
        setExistingImages(initialData.imageUrls || []);
        setExistingVideos(initialData.videoUrls || []);
      } else {
        setRating(0);
        setComment('');
        setExistingImages([]);
        setExistingVideos([]);
      }
      setImageFiles([]);
      setVideoFiles([]);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao');
      return;
    }
    if (!comment.trim()) {
      toast.error('Vui lòng nhập bình luận');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('Rating', rating.toString());
      formData.append('Comment', comment);

      imageFiles.forEach((file) => {
        formData.append('Images', file);
      });

      videoFiles.forEach((file) => {
        formData.append('Videos', file);
      });

      if (initialData) {
        formData.append('ExistingImageUrls', JSON.stringify(existingImages));
        formData.append('ExistingVideoUrls', JSON.stringify(existingVideos));
        await reviewService.updateReview(initialData.id, formData);
        toast.success('Cập nhật đánh giá thành công!');
      } else {
        formData.append('BookingId', bookingIds?.[0] || '');
        formData.append('TourId', tourId);
        await reviewService.createReview(formData);
        toast.success('Gửi đánh giá thành công!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const removeExistingImage = (url: string) =>
    setExistingImages((prev) => prev.filter((u) => u !== url));
  const removeExistingVideo = (url: string) =>
    setExistingVideos((prev) => prev.filter((u) => u !== url));

  const removeNewImage = (idx: number) =>
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  const removeNewVideo = (idx: number) =>
    setVideoFiles((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
      <div className="bg-ddms-bg-card border border-border w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center p-5 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {initialData ? 'Sửa đánh giá' : 'Viết đánh giá'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <form id="review-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">
                Đánh giá của bạn <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="focus:outline-none transition-transform hover:scale-115 cursor-pointer"
                  >
                    <Star
                      size={28}
                      fill={i < rating ? '#EAB308' : 'none'}
                      className={
                        i < rating ? 'text-yellow-500' : 'text-muted-foreground'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2">
                Bình luận <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full bg-ddms-bg-main border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-ddms-secondary outline-none transition-all"
                placeholder="Chia sẻ trải nghiệm của bạn về tour này..."
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hình ảnh
              </label>
              <div className="flex flex-wrap gap-3 mb-3">
                {existingImages.map((url, idx) => (
                  <div
                    key={`ext-img-${idx}`}
                    className="relative w-20 h-20 group"
                  >
                    <img
                      src={url}
                      alt="Review"
                      className="w-full h-full object-cover rounded-md border border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
                {imageFiles.map((file, idx) => (
                  <div
                    key={`new-img-${idx}`}
                    className="relative w-20 h-20 group"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Review new"
                      className="w-full h-full object-cover rounded-md border border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:border-blue-500 transition text-gray-400 hover:text-blue-500">
                  <UploadCloud size={20} />
                  <span className="text-xs mt-1">Thêm</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files)
                        setImageFiles((prev) => [
                          ...prev,
                          ...Array.from(e.target.files!),
                        ]);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Videos */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video
              </label>
              <div className="flex flex-wrap gap-3 mb-3">
                {existingVideos.map((url, idx) => (
                  <div
                    key={`ext-vid-${idx}`}
                    className="relative w-24 h-20 group"
                  >
                    <video
                      src={url}
                      className="w-full h-full object-cover rounded-md border border-gray-600 bg-black"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingVideo(url)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
                {videoFiles.map((file, idx) => (
                  <div
                    key={`new-vid-${idx}`}
                    className="relative w-24 h-20 group"
                  >
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover rounded-md border border-blue-500 bg-black"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewVideo(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:border-blue-500 transition text-gray-400 hover:text-blue-500">
                  <UploadCloud size={20} />
                  <span className="text-xs mt-1">Thêm</span>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files)
                        setVideoFiles((prev) => [
                          ...prev,
                          ...Array.from(e.target.files!),
                        ]);
                    }}
                  />
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-border flex justify-end gap-3 bg-muted/40">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted transition cursor-pointer font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="review-form"
            disabled={submitting}
            className="px-6 py-2 bg-ddms-secondary hover:bg-ddms-secondary/90 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer font-bold shadow-md shadow-ddms-secondary/15"
          >
            {submitting
              ? 'Đang gửi...'
              : initialData
                ? 'Cập nhật'
                : 'Gửi đánh giá'}
          </button>
        </div>
      </div>
    </div>
  );
}
