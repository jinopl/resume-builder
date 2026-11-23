import type { Resume } from '../schema/resume';

/**
 * The editor keeps raw input (half-typed bullets, trailing commas, empty
 * entries). Before rendering or exporting we strip all of that:
 * strings are trimmed, empty strings / arrays / objects are dropped.
 */
export function clean(value: unknown): unknown {
  if (typeof value === 'string') {
    const t = value.trim();
    return t === '' ? undefined : t;
  }
  if (Array.isArray(value)) {
    const items = value.map(clean).filter((v) => v !== undefined);
    return items.length ? items : undefined;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const c = clean(v);
      if (c !== undefined) out[k] = c;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return value;
}

/** A cleaned copy that still satisfies the Resume shape (arrays always present). */
export function cleanResume(resume: Resume): Resume {
  const c = (clean(resume) ?? {}) as Partial<Resume>;
  return {
    ...c,
    basics: c.basics ?? {},
    work: c.work ?? [],
    education: c.education ?? [],
    projects: c.projects ?? [],
    skills: c.skills ?? [],
    certificates: c.certificates ?? [],
    awards: c.awards ?? [],
    languages: c.languages ?? [],
    meta: {
      ...c.meta,
      // App settings are always kept (cleaning would drop e.g. an empty hiddenSections list).
      template: resume.meta.template,
      color: resume.meta.color,
      font: resume.meta.font,
      sectionOrder: resume.meta.sectionOrder,
      hiddenSections: resume.meta.hiddenSections,
      coverLetter: c.meta?.coverLetter ?? {},
      photo: resume.meta.photo,
    },
  } as Resume;
}

/** Copy of the resume with hidden sections emptied: what the PDF actually shows. */
export function visibleResume(resume: Resume): Resume {
  const hidden = new Set(resume.meta.hiddenSections);
  const r: Resume = { ...resume, basics: { ...resume.basics } };
  for (const key of hidden) {
    if (key === 'summary') r.basics.summary = undefined;
    else r[key] = [];
  }
  return r;
}

/** Split a one-per-line textarea value into the stored list (kept raw). */
export const linesToList = (text: string) => text.split('\n');
export const listToLines = (list?: string[]) => (list ?? []).join('\n');

/** Comma-separated input <-> stored list (kept raw so typing ", " works). */
export const csvToList = (text: string) => text.split(',');
export const listToCsv = (list?: string[]) => (list ?? []).join(',');
