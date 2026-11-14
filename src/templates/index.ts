import { VARIANTS, type Variant } from './variants';

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  variant: Variant;
}

/**
 * Templates shown in the gallery. All share the ATS-safe layout engine
 * (layout.tsx); the JSON data is the same for every template.
 */
export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean and traditional. Safe for any industry.',
    variant: VARIANTS.classic,
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Bigger name, accent job titles, airy spacing.',
    variant: VARIANTS.modern,
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Tighter type and spacing to fit more on one page.',
    variant: VARIANTS.compact,
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Centred, formal header. Pairs well with the serif font.',
    variant: VARIANTS.executive,
  },
];

export function getTemplate(id: string | undefined): TemplateInfo {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
