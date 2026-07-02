import { type ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  hasError: boolean;
  error?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  /** Render custom content inside the field (e.g., password toggle button) */
  endAdornment?: ReactNode;
  /** Label right side content (e.g., "Forgot password?" link) */
  labelExtra?: ReactNode;
}

export default function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  hasError,
  error,
  autoComplete,
  autoFocus,
  endAdornment,
  labelExtra,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={labelExtra ? 'flex items-center justify-between' : undefined}
      >
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        {labelExtra}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={`h-12 rounded-lg border px-4 text-sm bg-ddms-bg-main text-foreground ${endAdornment ? 'pr-12' : ''}`}
          style={{
            borderColor: hasError ? '#ff6b6b' : 'var(--border)',
          }}
        />
        {endAdornment}
      </div>
      {/* Always reserve space for error to prevent layout shift */}
      <div className="min-h-4.5">
        {hasError && error && <p className="text-xs text-rose-500">{error}</p>}
      </div>
    </div>
  );
}
