import type { Resume } from '../schema/resume';

/**
 * Accent colours. Every preset is dark enough for body-size text and prints
 * well in greyscale: a deliberate choice instead of a free colour picker.
 */
export const COLORS = [
  { id: 'navy', name: 'Navy', value: '#1f4e79' },
  { id: 'charcoal', name: 'Charcoal', value: '#262626' },
  { id: 'teal', name: 'Teal', value: '#0e5e5e' },
  { id: 'burgundy', name: 'Burgundy', value: '#7a1f2b' },
  { id: 'forest', name: 'Forest', value: '#2c5a39' },
  { id: 'slate', name: 'Slate', value: '#3f4a63' },
  { id: 'plum', name: 'Plum', value: '#5a2a68' },
] as const;

/**
 * PDF standard fonts: built into every PDF reader, so nothing is embedded
 * and ATS text extraction is as reliable as it gets.
 */
export const FONTS = [
  {
    id: 'sans',
    name: 'Sans-serif',
    sample: 'Helvetica',
    regular: 'Helvetica',
    bold: 'Helvetica-Bold',
    italic: 'Helvetica-Oblique',
    sizeScale: 1,
    css: 'Helvetica, Arial, sans-serif',
  },
  {
    id: 'serif',
    name: 'Serif',
    sample: 'Times',
    regular: 'Times-Roman',
    bold: 'Times-Bold',
    italic: 'Times-Italic',
    // Times has a smaller x-height; a slight bump keeps both readable at the same size.
    sizeScale: 1.02,
    css: '"Times New Roman", Times, serif',
  },
] as const;

export type FontPreset = (typeof FONTS)[number];

export interface Theme {
  accent: string;
  font: FontPreset;
  text: string;
  muted: string;
}

export function getTheme(meta: Resume['meta']): Theme {
  const color = COLORS.find((c) => c.id === meta.color) ?? COLORS[0];
  const font = FONTS.find((f) => f.id === meta.font) ?? FONTS[0];
  return { accent: color.value, font, text: '#1a1a1a', muted: '#444444' };
}
