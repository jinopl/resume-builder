import { z } from 'zod';

/**
 * JSON Resume (https://jsonresume.org/schema) — the subset this app edits.
 * `.passthrough()` everywhere so fields we don't edit (volunteer, publications,
 * interests, references, …) survive an import → export round trip untouched.
 */

const str = z.string().optional();
const strList = z.array(z.string()).optional();

export const LocationSchema = z
  .object({ address: str, postalCode: str, city: str, countryCode: str, region: str })
  .passthrough();

export const ProfileSchema = z.object({ network: str, username: str, url: str }).passthrough();

export const BasicsSchema = z
  .object({
    name: str,
    label: str,
    image: str,
    email: str,
    phone: str,
    /**
     * Not part of the JSON Resume standard (other tools ignore it). Optional,
     * ISO date (YYYY-MM-DD); printed as "Date of birth: 12 Mar 2002".
     */
    birthDate: str,
    url: str,
    summary: str,
    location: LocationSchema.optional(),
    profiles: z.array(ProfileSchema).optional(),
  })
  .passthrough();

export const WorkSchema = z
  .object({
    name: str,
    position: str,
    location: str,
    url: str,
    startDate: str,
    endDate: str,
    summary: str,
    highlights: strList,
  })
  .passthrough();

export const EducationSchema = z
  .object({
    institution: str,
    url: str,
    area: str,
    studyType: str,
    startDate: str,
    endDate: str,
    score: str,
    courses: strList,
  })
  .passthrough();

export const ProjectSchema = z
  .object({
    name: str,
    description: str,
    url: str,
    startDate: str,
    endDate: str,
    highlights: strList,
    keywords: strList,
  })
  .passthrough();

export const SkillSchema = z.object({ name: str, level: str, keywords: strList }).passthrough();

export const CertificateSchema = z
  .object({ name: str, date: str, issuer: str, url: str })
  .passthrough();

export const AwardSchema = z
  .object({ title: str, date: str, awarder: str, summary: str })
  .passthrough();

export const LanguageSchema = z.object({ language: str, fluency: str }).passthrough();

/** Sections the editor and templates know about, in their default order. */
export const SECTION_KEYS = [
  'summary',
  'work',
  'education',
  'projects',
  'skills',
  'certificates',
  'awards',
  'languages',
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_TITLES: Record<SectionKey, string> = {
  summary: 'Summary',
  work: 'Work Experience',
  education: 'Education',
  projects: 'Projects',
  skills: 'Skills',
  certificates: 'Certifications',
  awards: 'Awards',
  languages: 'Languages',
};

/**
 * Cover letter. JSON Resume has no cover letter field, so it lives in `meta`
 * (which the standard leaves open), keeping one file valid for other tools.
 */
export const CoverLetterSchema = z
  .object({
    recipientName: str,
    recipientTitle: str,
    company: str,
    address: str,
    date: str,
    role: str,
    greeting: str,
    body: str,
    closing: str,
  })
  .passthrough();

export const PHOTO_SHAPES = ['circle', 'rounded', 'square'] as const;
export type PhotoShape = (typeof PHOTO_SHAPES)[number];
export const PHOTO_SIZES = ['small', 'medium', 'large'] as const;
export type PhotoSize = (typeof PHOTO_SIZES)[number];

export const PhotoSettingsSchema = z
  .object({
    /** Show the photo in the PDF (resume and cover letter) when one is set. */
    show: z.boolean().catch(true).default(true),
    shape: z.enum(PHOTO_SHAPES).catch('circle').default('circle'),
    size: z.enum(PHOTO_SIZES).catch('medium').default('medium'),
  })
  .passthrough();

/** JSON Resume allows extra fields in `meta`; we keep our app settings there. */
export const MetaSchema = z
  .object({
    canonical: str,
    version: str,
    lastModified: str,
    template: z.string().default('classic'),
    /** Accent colour preset id (see templates/theme.ts). */
    color: z.string().default('navy'),
    /** Font preset id (see templates/theme.ts). */
    font: z.string().default('sans'),
    sectionOrder: z
      .array(z.string())
      .default([...SECTION_KEYS])
      .transform(normalizeSectionOrder),
    /** Sections kept in the data but left out of the PDF. */
    hiddenSections: z
      .array(z.string())
      .default([])
      .transform((keys) => normalizeSectionOrder(keys).filter((k) => keys.includes(k))),
    coverLetter: CoverLetterSchema.prefault({}),
    /** Photo display settings. The image itself is `basics.image` (an embedded data URL). */
    photo: PhotoSettingsSchema.prefault({}),
  })
  .passthrough();

export const ResumeSchema = z
  .object({
    $schema: str,
    basics: BasicsSchema.prefault({}),
    work: z.array(WorkSchema).default([]),
    education: z.array(EducationSchema).default([]),
    projects: z.array(ProjectSchema).default([]),
    skills: z.array(SkillSchema).default([]),
    certificates: z.array(CertificateSchema).default([]),
    awards: z.array(AwardSchema).default([]),
    languages: z.array(LanguageSchema).default([]),
    meta: MetaSchema.prefault({}),
  })
  .passthrough();

export type Resume = z.infer<typeof ResumeSchema>;
export type Basics = z.infer<typeof BasicsSchema>;
export type CoverLetter = z.infer<typeof CoverLetterSchema>;
export type PhotoSettings = z.infer<typeof PhotoSettingsSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Work = z.infer<typeof WorkSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Certificate = z.infer<typeof CertificateSchema>;
export type Award = z.infer<typeof AwardSchema>;
export type Language = z.infer<typeof LanguageSchema>;

/** Keep known keys only (no duplicates) and append any that are missing. */
export function normalizeSectionOrder(order: string[]): SectionKey[] {
  const known = new Set<string>(SECTION_KEYS);
  const seen = new Set<string>();
  const result: SectionKey[] = [];
  for (const key of order) {
    if (known.has(key) && !seen.has(key)) {
      seen.add(key);
      result.push(key as SectionKey);
    }
  }
  for (const key of SECTION_KEYS) if (!seen.has(key)) result.push(key);
  return result;
}

export const JSON_RESUME_SCHEMA_URL =
  'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json';

export function emptyResume(): Resume {
  return ResumeSchema.parse({ $schema: JSON_RESUME_SCHEMA_URL });
}

export type ParseResult = { ok: true; resume: Resume } | { ok: false; error: string };

/** Validate unknown input (e.g. an uploaded file) into a Resume. */
export function parseResume(input: unknown): ParseResult {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, error: 'The file does not contain a JSON Resume object.' };
  }
  const result = ResumeSchema.safeParse(input);
  if (result.success) return { ok: true, resume: result.data };
  const issues = result.error.issues
    .slice(0, 5)
    .map((i) => `• ${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('\n');
  return { ok: false, error: `This file doesn't match the JSON Resume format:\n${issues}` };
}
