import type { Resume } from '../schema/resume';
import { cleanResume, visibleResume } from '../lib/clean';
import { isValidDate } from '../lib/dates';

export type Severity = 'error' | 'warning' | 'tip';

export interface Issue {
  severity: Severity;
  section: string;
  message: string;
}

const WEAK_OPENERS = [
  'responsible for',
  'worked on',
  'helped',
  'assisted',
  'duties included',
  'tasked with',
  'involved in',
  'participated in',
  'in charge of',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIRST_PERSON_RE = /\b(I|me|my|mine)\b/;
const HAS_NUMBER_RE = /\d|%|\$|₹|€|£/;
const MAX_BULLET_CHARS = 220;

/** Rule-based checks for ATS-readiness and general resume quality. */
export function runChecks(raw: Resume, pageCount: number): Issue[] {
  // Check what the PDF actually shows: hidden sections count as empty.
  const r = visibleResume(cleanResume(raw));
  const issues: Issue[] = [];
  const add = (severity: Severity, section: string, message: string) => issues.push({ severity, section, message });
  const b = r.basics;

  // Contact
  if (!b.name) add('error', 'Personal details', 'Add your full name.');
  if (!b.email) add('error', 'Personal details', 'Add an email address — recruiters need a way to contact you.');
  else if (!EMAIL_RE.test(b.email)) add('error', 'Personal details', `“${b.email}” doesn't look like a valid email.`);
  if (!b.phone) add('warning', 'Personal details', 'Add a phone number.');
  if (!b.location?.city) add('tip', 'Personal details', 'Add your city — many recruiters filter candidates by location.');
  if (!b.label) add('tip', 'Personal details', 'Add a headline matching the job title you are targeting.');
  if (!(b.profiles ?? []).some((p) => /linkedin/i.test(`${p.network} ${p.url}`)))
    add('tip', 'Personal details', 'Add your LinkedIn profile URL.');

  // Summary
  const summary = b.summary ?? '';
  if (!summary) add('warning', 'Summary', 'Add a short professional summary (2–4 sentences).');
  else if (summary.length > 700) add('warning', 'Summary', `Summary is ${summary.length} characters — trim it to under ~600.`);
  else if (summary.length < 120) add('tip', 'Summary', 'Summary is very short — mention your key skills and one achievement.');

  // Experience / education presence
  if (!r.work.length && !r.projects.length)
    add('error', 'Work Experience', 'Add work experience, or projects/internships if you are a fresher.');
  if (!r.education.length) add('warning', 'Education', 'Add your education.');
  if (!r.skills.length) add('error', 'Skills', 'Add a Skills section — ATS systems match on skill keywords.');

  // Work entries
  const bullets: string[] = [];
  r.work.forEach((w, i) => {
    const name = w.position || w.name || `Entry ${i + 1}`;
    if (!w.position) add('error', 'Work Experience', `${name}: add a job title.`);
    if (!w.name) add('warning', 'Work Experience', `${name}: add the company name.`);
    if (!w.startDate) add('warning', 'Work Experience', `${name}: add a start date.`);
    if (!isValidDate(w.startDate) || !isValidDate(w.endDate))
      add('error', 'Work Experience', `${name}: use YYYY-MM dates so they display consistently.`);
    if (!w.highlights?.length) add('warning', 'Work Experience', `${name}: add 2–5 bullet points describing achievements.`);
    else if (w.highlights.length > 7) add('tip', 'Work Experience', `${name}: ${w.highlights.length} bullets — keep the strongest 5–6.`);
    bullets.push(...(w.highlights ?? []));
  });
  r.projects.forEach((p) => bullets.push(...(p.highlights ?? [])));

  // Bullet quality
  const long = bullets.filter((t) => t.length > MAX_BULLET_CHARS).length;
  if (long) add('warning', 'Bullets', `${long} bullet${long > 1 ? 's are' : ' is'} longer than 2 lines — make them tighter.`);

  const weak = bullets.filter((t) => WEAK_OPENERS.some((w) => t.toLowerCase().startsWith(w)));
  if (weak.length)
    add('warning', 'Bullets', `${weak.length} bullet${weak.length > 1 ? 's start' : ' starts'} with a weak phrase like “${WEAK_OPENERS.find((w) => weak[0].toLowerCase().startsWith(w))}”. Start with an action verb: Led, Built, Reduced, Increased…`);

  const firstPerson = bullets.filter((t) => FIRST_PERSON_RE.test(t)).length;
  if (firstPerson) add('tip', 'Bullets', `${firstPerson} bullet${firstPerson > 1 ? 's use' : ' uses'} “I/my”. Resumes usually drop first-person pronouns.`);

  if (bullets.length >= 3) {
    const quantified = bullets.filter((t) => HAS_NUMBER_RE.test(t)).length;
    const pct = Math.round((quantified / bullets.length) * 100);
    if (pct < 40)
      add('warning', 'Bullets', `Only ${pct}% of bullets include a number. Quantify impact: %, $, time saved, users, team size.`);
  }

  // Education
  r.education.forEach((e, i) => {
    if (!e.institution) add('warning', 'Education', `Education ${i + 1}: add the school or university name.`);
    if (!isValidDate(e.startDate) || !isValidDate(e.endDate))
      add('error', 'Education', `${e.institution ?? `Education ${i + 1}`}: use YYYY-MM dates.`);
  });

  // Skills
  const skillCount = r.skills.reduce((n, s) => n + (s.keywords?.length ?? 0), 0);
  if (r.skills.length && skillCount < 6) add('tip', 'Skills', 'List at least 6–10 relevant skills, using the wording from job descriptions.');

  // Length
  if (pageCount > 2) add('error', 'Length', `Your resume is ${pageCount} pages. Keep it to 1–2 pages.`);
  else if (pageCount === 2 && r.work.length <= 1)
    add('tip', 'Length', 'With limited experience, aim for a single page.');

  return issues;
}

/** Checks for the cover letter. */
export function runCoverLetterChecks(raw: Resume): Issue[] {
  const r = cleanResume(raw);
  const cl = r.meta.coverLetter;
  const issues: Issue[] = [];
  const add = (severity: Severity, section: string, message: string) => issues.push({ severity, section, message });

  if (!r.basics.name || !r.basics.email)
    add('error', 'Header', 'Add your name and email in the resume’s Personal details. The letter header uses them.');
  if (!cl.company) add('warning', 'Recipient', 'Add the company name. A letter addressed to a specific company reads as tailored, not generic.');
  if (!cl.recipientName) add('tip', 'Recipient', 'Find the hiring manager’s name (LinkedIn, company site) and address them directly.');
  if (!cl.role) add('tip', 'Letter', 'Add the job title you’re applying for. It appears as the subject line.');
  if (/to whom it may concern/i.test(cl.greeting ?? ''))
    add('tip', 'Letter', '“To whom it may concern” feels dated. Try “Dear Hiring Manager,” or the person’s name.');

  const body = cl.body ?? '';
  const words = body.split(/\s+/).filter(Boolean).length;
  const paragraphs = body.split(/\n\s*\n/).filter((p) => p.trim()).length;
  if (!words) add('error', 'Letter', 'Write the body of your letter.');
  else {
    if (words < 150) add('warning', 'Letter', `Only ${words} words. Aim for 250–400 so you can show 2–3 relevant achievements.`);
    if (words > 450) add('warning', 'Letter', `${words} words is long. Recruiters skim, so keep it under ~400.`);
    if (paragraphs < 3) add('tip', 'Letter', 'Use 3–4 short paragraphs (blank line between them): opening, evidence, closing.');
    if (/\[[^\]]*\]|\{[^}]*\}|<[^>]*>|lorem ipsum/i.test(body))
      add('error', 'Letter', 'The letter still contains placeholder text like [Company] or {name}. Replace it.');
    if (cl.company && !body.toLowerCase().includes(cl.company.toLowerCase()))
      add('tip', 'Letter', `Mention ${cl.company} by name in the body to show the letter is written for them.`);
    if (!HAS_NUMBER_RE.test(body)) add('tip', 'Letter', 'Include at least one concrete number (%, revenue, users, time saved).');
  }
  return issues;
}

export function scoreFor(issues: Issue[]): number {
  const penalty = issues.reduce((n, i) => n + (i.severity === 'error' ? 12 : i.severity === 'warning' ? 5 : 2), 0);
  return Math.max(0, 100 - penalty);
}
