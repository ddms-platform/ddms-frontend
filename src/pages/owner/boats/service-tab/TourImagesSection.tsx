import { ImagePlus, Trash2 } from 'lucide-react';

interface TourImagesSectionProps {
  imageUrls: string[];
  onUpload: (file: File) => void;
  onRemove: (index: number) => void;
}

export default function TourImagesSection({
  imageUrls,
  onUpload,
  onRemove,
}: TourImagesSectionProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => onUpload(file));
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="text-base font-medium text-muted-foreground">
        Ảnh tour
      </label>
      <p className="text-xs text-muted-foreground">
        Ảnh này hiện trên danh sách tour của khách sau khi Admin duyệt. Ảnh đầu
        tiên là ảnh bìa.
      </p>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {imageUrls.map((url, idx) => (
          <div
            key={`${url}-${idx}`}
            className="group relative aspect-16/11 overflow-hidden rounded-lg border border-border"
          >
            <img
              src={url}
              alt={`Ảnh tour ${idx + 1}`}
              className="h-full w-full object-cover"
            />
            {idx === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded bg-ddms-secondary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                Ảnh bìa
              </span>
            )}
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Xóa ảnh"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <label className="flex aspect-16/11 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-ddms-bg-main text-muted-foreground transition-colors hover:bg-foreground/5">
          <ImagePlus className="h-5 w-5" />
          <span className="px-2 text-center text-xs font-semibold">
            Thêm ảnh
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
    </div>
  );
}
