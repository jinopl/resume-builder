import { VARIANTS, type Variant } from './variants';

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  variant: Variant;
  /**
   * false for templates that trade ATS safety for design (two columns, photo).
   * The gallery labels them and the Check tab adds a tip.
   */
  ats: boolean;
}

/**
 * Templates shown in the gallery. The ATS templates share the single-column
 * layout engine (layout.tsx); Profile and Banner have their own photo-led
 * layouts (profile.tsx, banner.tsx). The JSON data is the same for every template.
 */
export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean and traditional. Safe for any industry.',
    variant: VARIANTS.classic,
    ats: true,
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Bigger name, accent job titles, airy spacing.',
    variant: VARIANTS.modern,
    ats: true,
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Tighter type and spacing to fit more on one page.',
    variant: VARIANTS.compact,
    ats: true,
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Centred, formal header. Pairs well with the serif font.',
    variant: VARIANTS.executive,
    ats: true,
  },
  {
    id: 'profile',
    name: 'Profile',
    description: 'Photo-led, with a coloured sidebar for contact, skills and languages.',
    variant: VARIANTS.profile,
    ats: false,
  },
  {
    id: 'banner',
    name: 'Banner',
    description: 'Photo beside a coloured name banner, with skills and languages in a side column.',
    variant: VARIANTS.banner,
    ats: false,
  },
];

export function getTemplate(id: string | undefined): TemplateInfo {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
