import type { PhotoShape, PhotoSize, Resume } from '../schema/resume';

/**
 * Small helpers shared by the photo templates (profile.tsx, banner.tsx).
 * The ATS templates (layout.tsx) don't use this file.
 */

/** Multipliers on the variant's medium photo size. */
export const PHOTO_SCALE: Record<PhotoSize, number> = { small: 0.8, medium: 1, large: 1.18 };
/** Corner radius as a fraction of the photo's side. */
export const PHOTO_RADIUS: Record<PhotoShape, number> = { circle: 0.5, rounded: 0.14, square: 0 };

/** Mix a hex colour with white; `amount` 0 = the colour, 1 = white. */
export function tint(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => {
    const c = (n >> shift) & 255;
    return Math.round(c + (255 - c) * amount)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${ch(16)}${ch(8)}${ch(0)}`;
}

export const join = (parts: (string | undefined)[], sep: string) => parts.filter(Boolean).join(sep);
export const stripProtocol = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
export const href = (url: string) => (/^[a-z]+:/i.test(url) ? url : `https://${url}`);

export const todayLong = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** The pieces of a cover letter, with the same defaults as the ATS layout. */
export function letterParts(resume: Resume) {
  const cl = resume.meta.coverLetter;
  const paragraphs = (cl.body ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const recipient = [cl.recipientName, cl.recipientTitle, cl.company, ...(cl.address ?? '').split('\n')]
    .map((l) => l?.trim())
    .filter(Boolean) as string[];
  const greeting = cl.greeting || (cl.recipientName ? `Dear ${cl.recipientName},` : 'Dear Hiring Manager,');
  return { cl, paragraphs, recipient, greeting, date: cl.date || todayLong(), closing: cl.closing || 'Sincerely,' };
}
