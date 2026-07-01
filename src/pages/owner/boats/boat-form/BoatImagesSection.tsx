import { ImageIcon, Trash2 } from 'lucide-react';

interface BoatImage {
  id?: string;
  imageUrl: string;
  base64?: string;
}

interface BoatImagesSectionProps {
  images: BoatImage[];
  error?: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}

const BoatImagesSection = ({
  images,
  error,
  onFileChange,
  onRemove,
}: BoatImagesSectionProps) => (
  <div
    className="rounded-2xl p-6"
    style={{
      backgroundColor: '#112240',
      border: `1px solid ${error ? '#EF4444' : 'rgba(255,255,255,0.04)'}`,
    }}
  >
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold" style={{ color: '#ffffff' }}>
        Hình ảnh tàu
      </h2>
      {images.length > 0 && (
        <label className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer flex items-center gap-1">
          + Thêm ảnh
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFileChange}
          />
        </label>
      )}
    </div>

    {images.length > 0 ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((img, i) => (
          <div
            key={i}
            className="relative aspect-video rounded-xl overflow-hidden group border border-slate-800"
          >
            <img
              src={img.imageUrl}
              alt={`boat-image-${i}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    ) : (
      <div
        className="relative flex flex-col items-center rounded-xl border-2 border-dashed py-12 bg-slate-800/20 hover:border-cyan-500/50 transition-colors group cursor-pointer"
        style={{ borderColor: error ? '#EF4444' : 'rgba(255,255,255,0.1)' }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={onFileChange}
        />
        <ImageIcon
          size={40}
          style={{ color: error ? '#EF4444' : 'rgba(0,240,255,0.3)' }}
          className="mb-4 group-hover:scale-110 transition-transform"
        />
        <p className="mt-3 text-sm" style={{ color: error ? '#EF4444' : '#ecf0ff' }}>
          Kéo thả hoặc nhấn vào đây để tải ảnh tàu lên
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Hỗ trợ JPG, PNG (Tối đa 5MB)
        </p>
      </div>
    )}
    {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
  </div>
);

export default BoatImagesSection;
