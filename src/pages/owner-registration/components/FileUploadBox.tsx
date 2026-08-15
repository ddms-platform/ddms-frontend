import { useEffect, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { dropzoneClass } from './form-styles';

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

/** Tao preview URL cho anh va thu hoi khi danh sach tep doi. */
function useObjectUrls(files: File[], enabled: boolean) {
  const urls = useMemo(
    () => (enabled ? files.map((file) => URL.createObjectURL(file)) : []),
    [files, enabled],
  );

  useEffect(
    () => () => urls.forEach((url) => URL.revokeObjectURL(url)),
    [urls],
  );

  return urls;
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
}: FileUploadBoxProps) => {
  const previews = useObjectUrls(files, variant === 'image');

  if (files.length === 0) {
    return (
      <div className={`${dropzoneClass} cursor-pointer px-4 py-12`}>
        <input
          required
          type="file"
          accept={accept}
          multiple
          className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
          onChange={(e) => onAdd(e.target.files)}
        />
        <Icon
          size={36}
          className="mb-3 text-ddms-secondary/50 transition-transform group-hover:scale-110"
        />
        <p className="text-sm text-foreground">{emptyTitle}</p>
        <p className="mt-1 text-xs text-muted-foreground">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-foreground/5">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="text-xs font-semibold text-foreground">
          {countLabel(files.length)}
        </p>
        <label className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-ddms-secondary hover:underline">
          <Plus size={14} />
          {addMoreLabel}
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
        <div className="grid max-h-80 grid-cols-2 gap-3 overflow-y-auto p-3 sm:grid-cols-3">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="group/img relative aspect-video overflow-hidden rounded-lg border border-border"
            >
              {previews[i] && (
                <img
                  src={previews[i]}
                  alt={file.name}
                  className="size-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute right-1.5 top-1.5 rounded-md bg-red-500 p-1 text-white opacity-0 shadow-lg transition-opacity hover:bg-red-600 group-hover/img:opacity-100"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto p-3">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-2 rounded-lg border border-border bg-ddms-bg-main p-2.5 text-xs text-foreground"
            >
              <Icon size={14} className="shrink-0 text-ddms-secondary" />
              <span className="flex-1 truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadBox;
