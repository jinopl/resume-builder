import { useMemo } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import { cleanResume } from '../lib/clean';
import { SECTION_TITLES, type Resume } from '../schema/resume';

/**
 * Every editor section is a numbered "chapter" with its own colour band,
 * like a textbook. Colours are CSS tokens (see styles.css) chosen so white
 * text on them passes 4.5:1 in both themes.
 */
export interface Chapter {
  /** DOM id of the section card, e.g. `edit-work`. */
  id: string;
  title: string;
  num: number;
  color: string;
  done: boolean;
  hidden: boolean;
}

export interface Coach {
  kind: 'try' | 'know';
  text: string;
}

const COLOR: Record<string, string> = {
  basics: 'var(--ch-blue)',
  summary: 'var(--ch-violet)',
  work: 'var(--ch-ochre)',
  education: 'var(--ch-leaf)',
  projects: 'var(--ch-coral)',
  skills: 'var(--ch-cyan)',
  certificates: 'var(--ch-magenta)',
  awards: 'var(--ch-maroon)',
  languages: 'var(--ch-slate)',
  cover: 'var(--ch-blue)',
  recipient: 'var(--ch-violet)',
  letter: 'var(--ch-leaf)',
};

/** One coaching box per chapter, kept short. */
export const COACH: Record<string, Coach> = {
  'edit-basics': { kind: 'know', text: 'Use a plain, professional email, ideally your name. It’s the first thing a recruiter copies.' },
  'edit-summary': { kind: 'try', text: 'Start with your role and years of experience (or your degree), then one result with a number in it.' },
  'edit-work': { kind: 'try', text: 'Begin each bullet with an action verb and add a number: “Cut report time from 6 hours to 20 minutes.”' },
  'edit-education': { kind: 'try', text: 'Freshers: add Class XII (and Class X) with the board and your percentage. Many recruiters screen on it.' },
  'edit-projects': { kind: 'try', text: 'Name the tools you used and what changed because of the project: users, accuracy, time or money saved.' },
  'edit-skills': { kind: 'know', text: 'ATS software matches exact words. If the job post says “Power BI”, write “Power BI”, not “PowerBI”.' },
  'edit-certificates': { kind: 'know', text: 'Online certificates count, especially for freshers: NPTEL, Coursera, Google, AWS and similar.' },
  'edit-awards': { kind: 'try', text: 'Hackathons, scholarships and ranks all count. Give the scale: “1st of 120 teams”.' },
  'edit-languages': { kind: 'know', text: 'List the languages you can work in. Many employers value Hindi and regional languages.' },
  'edit-recipient': { kind: 'try', text: 'Look up the hiring manager on LinkedIn or the company site and address them by name.' },
  'edit-letter': { kind: 'try', text: 'Mention the company by name and connect one achievement from your resume to what the job asks for.' },
};

function resumeChapters(resume: Resume): Omit<Chapter, 'num'>[] {
  const r = cleanResume(resume);
  const hidden = new Set(resume.meta.hiddenSections);
  const basics: Omit<Chapter, 'num'> = {
    id: 'edit-basics',
    title: 'Personal details',
    color: COLOR.basics,
    done: !!(r.basics.name && r.basics.email),
    hidden: false,
  };
  return [
    basics,
    ...resume.meta.sectionOrder.map((key) => ({
      id: `edit-${key}`,
      title: SECTION_TITLES[key],
      color: COLOR[key],
      done: key === 'summary' ? !!r.basics.summary : r[key].length > 0,
      hidden: hidden.has(key),
    })),
  ];
}

function coverChapters(resume: Resume): Omit<Chapter, 'num'>[] {
  const cl = cleanResume(resume).meta.coverLetter;
  return [
    { id: 'edit-cover', title: 'The job', color: COLOR.cover, done: !!cl.role, hidden: false },
    { id: 'edit-recipient', title: 'Recipient', color: COLOR.recipient, done: !!cl.company, hidden: false },
    { id: 'edit-letter', title: 'Letter', color: COLOR.letter, done: !!cl.body, hidden: false },
  ];
}

/** Chapters of the document being edited, in editor order. */
export function useChapters(): Chapter[] {
  const resume = useResumeStore((s) => s.resume);
  const doc = useResumeStore((s) => s.doc);
  return useMemo(
    () => (doc === 'cover' ? coverChapters(resume) : resumeChapters(resume)).map((c, i) => ({ ...c, num: i + 1 })),
    [resume, doc],
  );
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Bring a chapter's band into view (used by the rail and "Next chapter"). */
export function scrollToChapter(id: string) {
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
  });
}
