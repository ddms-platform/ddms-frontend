import type { CSSProperties } from 'react';

/**
 * Style dung chung cho form dang ky chu thuyen.
 * Bam theo dung token cua cac man khac (owner/boats, profile, become-owner)
 * de trang nay hien dung mau o ca light mode va dark mode.
 */

/** Be mat the: giong BoatBasicInfoSection / ProfileInfo. */
export const cardStyle: CSSProperties = {
  backgroundColor: 'var(--ddms-bg-card)',
  border: '1px solid var(--border)',
};

/** Nen o nhap: trong suot o light, navy o dark. */
export const fieldStyle: CSSProperties = {
  backgroundColor: 'var(--ddms-bg-main)',
  borderColor: 'var(--border)',
  color: 'var(--foreground)',
};

export const cardClass = 'rounded-2xl p-6 sm:p-7';

export const labelClass =
  'mb-1.5 block text-xs font-medium text-muted-foreground';

export const selectClass =
  'h-11 w-full cursor-pointer rounded-lg border px-4 text-sm outline-none transition-colors focus:border-ddms-secondary';

/** DateInput chi nhan className nen mau phai nam trong class. */
export const dateInputClass =
  'h-11 w-full rounded-lg border border-border bg-ddms-bg-main px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ddms-secondary';

export const optionClass = 'bg-ddms-bg-card text-foreground';

/** Vung keo tha tep. */
export const dropzoneClass =
  'group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-foreground/5 transition-colors hover:border-ddms-secondary/50';
