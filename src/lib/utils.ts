import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

/**
 * Get localized value from an object with _vn / _en suffix fields.
 * Example: getLocalizedField(tour, 'title', 'vn') → tour.title_vn
 */
export function getLocalizedField<T extends Record<string, unknown>>(
  obj: T,
  field: string,
  lang: string,
): string {
  const key = `${field}_${lang}` as keyof T;
  const fallback = `${field}_vn` as keyof T;
  return (obj[key] as string) || (obj[fallback] as string) || '';
}

/**
 * Safely parse an ISO-8601 date string from the backend.
 * If the string lacks timezone indicators (neither 'Z' nor '+/-HH:mm'),
 * it treats the string as UTC to prevent incorrect local timezone shifting.
 */
export function parseIsoDate(dateStr?: string | null): Date {
  if (!dateStr) return new Date();
  const trimmed = dateStr.trim();
  if (!trimmed) return new Date();

  if (trimmed.endsWith('Z') || /[+-]\d{2}(:\d{2})?$/.test(trimmed)) {
    return new Date(trimmed);
  }

  return new Date(`${trimmed}Z`);
}
