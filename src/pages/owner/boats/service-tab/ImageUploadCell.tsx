interface ImageUploadCellProps {
  imageUrl?: string;
  altLabel: string;
  label: string;
  onUpload: (file: File) => void;
}

const ImageUploadCell = ({
  imageUrl,
  altLabel,
  label,
  onUpload,
}: ImageUploadCellProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUpload(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative mt-1.5">
        {imageUrl ? (
          <div className="relative h-20 overflow-hidden rounded-lg border border-border group">
            <img
              src={imageUrl}
              alt={altLabel}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <label className="cursor-pointer rounded-md border border-border bg-ddms-bg-main px-3 py-2 text-sm font-semibold text-foreground">
                Đổi ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        ) : (
          <label className="flex h-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border bg-ddms-bg-main transition-colors hover:bg-foreground/5">
            <span className="px-3 text-center text-sm font-semibold text-muted-foreground">
              Tải ảnh lên
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploadCell;
