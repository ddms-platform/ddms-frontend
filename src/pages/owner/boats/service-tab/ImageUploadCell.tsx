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
      <label className="text-xs text-slate-400">{label}</label>
      <div className="relative mt-1">
        {imageUrl ? (
          <div className="relative h-10 rounded-md overflow-hidden border border-slate-700 group">
            <img
              src={imageUrl}
              alt={altLabel}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="text-[10px] text-white cursor-pointer bg-slate-800 px-2 py-1 rounded">
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
          <label className="flex items-center justify-center h-10 border border-dashed border-slate-700 rounded-md bg-[#0B132B] cursor-pointer hover:bg-slate-800/50 transition-colors">
            <span className="text-xs text-slate-400 text-center px-2">
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
