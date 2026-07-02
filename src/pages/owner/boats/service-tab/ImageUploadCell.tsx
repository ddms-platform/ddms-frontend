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
    }
  };

  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="relative mt-1">
        {imageUrl ? (
          <div className="relative h-10 rounded-md overflow-hidden border border-border group">
            <img
              src={imageUrl}
              alt={altLabel}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="text-[10px] text-foreground cursor-pointer bg-ddms-bg-main px-2 py-1 rounded border border-border">
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
          <label className="flex items-center justify-center h-10 border border-dashed border-border rounded-md bg-ddms-bg-main cursor-pointer hover:bg-foreground/5 transition-colors">
            <span className="text-xs text-muted-foreground text-center px-2">
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
