import { Plus, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FileUploadBoxProps {
  files: File[];
  accept: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyHint: string;
  countLabel: (n: number) => string;
  addMoreLabel?: string;
  variant: 'image' | 'document';
  onAdd: (files: FileList | null) => void;
  onRemove: (index: number) => void;
}

const FileUploadBox = ({
  files,
  accept,
  icon: Icon,
  emptyTitle,
  emptyHint,
  countLabel,
  addMoreLabel = 'Thêm',
  variant,
  onAdd,
  onRemove,
}: FileUploadBoxProps) => (
  <div
    className="relative overflow-hidden rounded-lg bg-[#060D17] border border-dashed border-gray-700/70 hover:border-[#00F0FF]/50 transition-colors group"
    style={{ minHeight: '180px' }}
  >
    {files.length > 0 ? (
      <div className="absolute inset-0 flex flex-col z-20 pointer-events-auto bg-[#060D17]">
        <div className="p-3 bg-[#172A4A]/50 border-b border-gray-700/50 flex justify-between items-center">
          <p className="text-[13px] text-gray-300 font-bold">
            {countLabel(files.length)}
          </p>
          <label className="text-[12px] text-[#00F0FF] cursor-pointer hover:underline flex items-center gap-1">
            <Plus size={14} /> {addMoreLabel}
            <input
              type="file"
              accept={accept}
              multiple
              className="hidden"
              onChange={(e) => {
                onAdd(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
        </div>
        {variant === 'image' ? (
          <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2">
            {files.map((file, i) => (
              <div
                key={i}
                className="relative aspect-video rounded overflow-hidden group/img"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[12px] text-gray-300 bg-[#0A1322] p-2 rounded border border-gray-700/50 group/doc"
              >
                <Icon size={14} className="text-[#00F0FF] shrink-0" />
                <span className="truncate flex-1">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    ) : (
      <>
        <input
          required
          type="file"
          accept={accept}
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={(e) => onAdd(e.target.files)}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <Icon className="w-8 h-8 text-gray-400 mb-3 group-hover:text-[#00F0FF] transition-colors" />
          <p className="text-[15px] text-white mb-1">{emptyTitle}</p>
          <p className="text-[12px] text-gray-500">{emptyHint}</p>
        </div>
      </>
    )}
  </div>
);

export default FileUploadBox;
