import type { Resume } from '../schema/resume';
import { clean, cleanResume, visibleResume } from '../lib/clean';
import { isValidDate } from '../lib/dates';
import { isEmbeddedPhoto, photoForPdf } from '../lib/photo';
import { getTemplate } from '../templates';

export type Severity = 'error' | 'warning' | 'tip';

/** Where in the editor an issue can be fixed. */
export interface IssueTarget {
  doc: 'resume' | 'cover';
  /** DOM id of the section card. */
  section: string;
  /** Entry index in the editor's (raw) list. */
  index?: number;
  /** `data-field` of the input. */
  field?: string;
}

export interface Issue {
  severity: Severity;
  section: string;
  message: string;
  /** Stable key for issues the getting-started checklist tracks. */
  id?: string;
  target?: IssueTarget;
}

const at = (section: string, field?: string, index?: number): IssueTarget => ({ doc: 'resume', section, field, index });
const cover = (section: string, field?: string): IssueTarget => ({ doc: 'cover', section, field });

/** Raw-list index of each entry that survives cleaning (empty entries are dropped from the checks). */
const rawIndices = (list: unknown[]) => list.flatMap((item, i) => (clean(item) === undefined ? [] : [i]));

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
  const add = (severity: Severity, section: string, message: string, target?: IssueTarget, id?: string) =>
    issues.push({ severity, section, message, target, id });
  const b = r.basics;
  const workIdx = rawIndices(raw.work);
  const eduIdx = rawIndices(raw.education);
  const projIdx = rawIndices(raw.projects);

  // Contact
  if (!b.name) add('error', 'Personal details', 'Add your full name.', at('edit-basics', 'name'), 'name');
  if (!b.email) add('error', 'Personal details', 'Add an email address — recruiters need a way to contact you.', at('edit-basics', 'email'), 'email');
  else if (!EMAIL_RE.test(b.email)) add('error', 'Personal details', `“${b.email}” doesn't look like a valid email.`, at('edit-basics', 'email'), 'email');
  if (!b.phone) add('warning', 'Personal details', 'Add a phone number.', at('edit-basics', 'phone'));
  if (!b.location?.city) add('tip', 'Personal details', 'Add your city — many recruiters filter candidates by location.', at('edit-basics', 'city'));
  if (!b.label) add('tip', 'Personal details', 'Add a headline matching the job title you are targeting.', at('edit-basics', 'label'));
  if (!(b.profiles ?? []).some((p) => /linkedin/i.test(`${p.network} ${p.url}`)))
    add('tip', 'Personal details', 'Add your LinkedIn profile URL.', at('edit-basics', 'profiles'));

  if (b.birthDate) {
    if (!isValidDate(b.birthDate)) add('error', 'Personal details', 'Date of birth: use the date picker, or YYYY-MM-DD.', at('edit-basics', 'birthDate'));
    else
      add(
        'tip',
        'Personal details',
        'Your date of birth is shown. Employers in India, the Middle East and parts of Europe and Asia often expect it; leave it out for the US, UK, Canada and Australia, where it can invite age bias.',
        at('edit-basics', 'birthDate'),
      );
  }

  // Only the photo templates (not ATS-optimised) show a photo.
  const template = getTemplate(r.meta.template);
  if (!template.ats) {
    add(
      'tip',
      'Template',
      `${template.name} isn’t ATS-optimised: two columns and a photo can confuse the software behind online job portals. Use it when a recruiter reads your PDF directly; for portal applications, pick Classic, Modern, Compact or Executive in the Design tab.`,
    );
    if (photoForPdf(r))
      add(
        'tip',
        'Photo',
        'Your photo is shown. Many employers in India, Europe, the Middle East and Asia expect one; leave it out when applying in the US, UK, Canada or Australia.',
        at('edit-photo', 'photo-show'),
      );
    else if (!isEmbeddedPhoto(r.basics.image))
      add('tip', 'Photo', `The ${template.name} template is designed around a photo. Add one, or pick another template.`, at('edit-photo', 'photo-add'));
  }

  // Summary
  const summary = b.summary ?? '';
  if (!summary) add('warning', 'Summary', 'Add a short professional summary (2–4 sentences).', at('edit-summary', 'summary'));
  else if (summary.length > 700) add('warning', 'Summary', `Summary is ${summary.length} characters — trim it to under ~600.`, at('edit-summary', 'summary'));
  else if (summary.length < 120) add('tip', 'Summary', 'Summary is very short — mention your key skills and one achievement.', at('edit-summary', 'summary'));

  // Experience / education presence
  if (!r.work.length && !r.projects.length)
    add('error', 'Work Experience', 'Add work experience, or projects/internships if you are a fresher.', at('edit-work'), 'experience');
  if (!r.education.length) add('warning', 'Education', 'Add your education.', at('edit-education'), 'education');
  if (!r.skills.length) add('error', 'Skills', 'Add a Skills section — ATS systems match on skill keywords.', at('edit-skills'), 'skills');

  // Work entries
  const bullets: { text: string; target: IssueTarget }[] = [];
  r.work.forEach((w, i) => {
    const name = w.position || w.name || `Entry ${i + 1}`;
    const t = (field: string) => at('edit-work', field, workIdx[i]);
    if (!w.position) add('error', 'Work Experience', `${name}: add a job title.`, t('position'));
    if (!w.name) add('warning', 'Work Experience', `${name}: add the company name.`, t('company'));
    if (!w.startDate) add('warning', 'Work Experience', `${name}: add a start date.`, t('startDate'));
    if (!isValidDate(w.startDate) || !isValidDate(w.endDate))
      add('error', 'Work Experience', `${name}: use YYYY-MM dates so they display consistently.`, t(isValidDate(w.startDate) ? 'endDate' : 'startDate'));
    if (!w.highlights?.length) add('warning', 'Work Experience', `${name}: add 2–5 bullet points describing achievements.`, t('highlights'));
    else if (w.highlights.length > 7) add('tip', 'Work Experience', `${name}: ${w.highlights.length} bullets — keep the strongest 5–6.`, t('highlights'));
    bullets.push(...(w.highlights ?? []).map((text) => ({ text, target: t('highlights') })));
  });
  r.projects.forEach((p, i) =>
    bullets.push(...(p.highlights ?? []).map((text) => ({ text, target: at('edit-projects', 'highlights', projIdx[i]) }))),
  );
  /** Target the first bullet that matches, so the user lands on a real example. */
  const firstWhere = (pred: (t: string) => boolean) => bullets.find((x) => pred(x.text))?.target;

  // Bullet quality
  const isLong = (t: string) => t.length > MAX_BULLET_CHARS;
  const isWeak = (t: string) => WEAK_OPENERS.some((w) => t.toLowerCase().startsWith(w));
  const isFirstPerson = (t: string) => FIRST_PERSON_RE.test(t);
  const texts = bullets.map((x) => x.text);

  const long = texts.filter(isLong).length;
  if (long) add('warning', 'Bullets', `${long} bullet${long > 1 ? 's are' : ' is'} longer than 2 lines — make them tighter.`, firstWhere(isLong));

  const weak = texts.filter(isWeak);
  if (weak.length)
    add('warning', 'Bullets', `${weak.length} bullet${weak.length > 1 ? 's start' : ' starts'} with a weak phrase like “${WEAK_OPENERS.find((w) => weak[0].toLowerCase().startsWith(w))}”. Start with an action verb: Led, Built, Reduced, Increased…`, firstWhere(isWeak));

  const firstPerson = texts.filter(isFirstPerson).length;
  if (firstPerson) add('tip', 'Bullets', `${firstPerson} bullet${firstPerson > 1 ? 's use' : ' uses'} “I/my”. Resumes usually drop first-person pronouns.`, firstWhere(isFirstPerson));

  if (texts.length >= 3) {
    const hasNumber = (t: string) => HAS_NUMBER_RE.test(t);
    const quantified = texts.filter(hasNumber).length;
    const pct = Math.round((quantified / texts.length) * 100);
    if (pct < 40)
      add('warning', 'Bullets', `Only ${pct}% of bullets include a number. Quantify impact: %, money saved, time saved, users, team size.`, firstWhere((t) => !hasNumber(t)));
  }

  // Education
  r.education.forEach((e, i) => {
    const t = (field: string) => at('edit-education', field, eduIdx[i]);
    if (!e.institution) add('warning', 'Education', `Education ${i + 1}: add the school or university name.`, t('institution'));
    if (!isValidDate(e.startDate) || !isValidDate(e.endDate))
      add('error', 'Education', `${e.institution ?? `Education ${i + 1}`}: use YYYY-MM dates.`, t(isValidDate(e.startDate) ? 'endDate' : 'startDate'));
  });

  // Skills
  const skillCount = r.skills.reduce((n, s) => n + (s.keywords?.length ?? 0), 0);
  if (r.skills.length && skillCount < 6) add('tip', 'Skills', 'List at least 6–10 relevant skills, using the wording from job descriptions.', at('edit-skills'));

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
  const add = (severity: Severity, section: string, message: string, target?: IssueTarget, id?: string) =>
    issues.push({ severity, section, message, target, id });

  if (!r.basics.name || !r.basics.email)
    add('error', 'Header', 'Add your name and email in the resume’s Personal details. The letter header uses them.', at('edit-basics', r.basics.name ? 'email' : 'name'), 'cl-header');
  if (!cl.company) add('warning', 'Recipient', 'Add the company name. A letter addressed to a specific company reads as tailored, not generic.', cover('edit-recipient', 'company'), 'cl-company');
  if (!cl.recipientName) add('tip', 'Recipient', 'Find the hiring manager’s name (LinkedIn, company site) and address them directly.', cover('edit-recipient', 'recipientName'));
  if (!cl.role) add('tip', 'Letter', 'Add the job title you’re applying for. It appears as the subject line.', cover('edit-cover', 'role'));
  if (/to whom it may concern/i.test(cl.greeting ?? ''))
    add('tip', 'Letter', '“To whom it may concern” feels dated. Try “Dear Hiring Manager,” or the person’s name.', cover('edit-letter', 'greeting'));

  const body = cl.body ?? '';
  const words = body.split(/\s+/).filter(Boolean).length;
  const paragraphs = body.split(/\n\s*\n/).filter((p) => p.trim()).length;
  if (!words) add('error', 'Letter', 'Write the body of your letter.', cover('edit-letter', 'body'), 'cl-body');
  else {
    if (words < 150) add('warning', 'Letter', `Only ${words} words. Aim for 250–400 so you can show 2–3 relevant achievements.`, cover('edit-letter', 'body'));
    if (words > 450) add('warning', 'Letter', `${words} words is long. Recruiters skim, so keep it under ~400.`, cover('edit-letter', 'body'));
    if (paragraphs < 3) add('tip', 'Letter', 'Use 3–4 short paragraphs (blank line between them): opening, evidence, closing.', cover('edit-letter', 'body'));
    if (/\[[^\]]*\]|\{[^}]*\}|<[^>]*>|lorem ipsum/i.test(body))
      add('error', 'Letter', 'The letter still contains placeholder text like [Company] or {name}. Replace it.', cover('edit-letter', 'body'));
    if (cl.company && !body.toLowerCase().includes(cl.company.toLowerCase()))
      add('tip', 'Letter', `Mention ${cl.company} by name in the body to show the letter is written for them.`, cover('edit-letter', 'body'));
    if (!HAS_NUMBER_RE.test(body)) add('tip', 'Letter', 'Include at least one concrete number (%, revenue, users, time saved).', cover('edit-letter', 'body'));
  }
  return issues;
}

export function scoreFor(issues: Issue[]): number {
  const penalty = issues.reduce((n, i) => n + (i.severity === 'error' ? 12 : i.severity === 'warning' ? 5 : 2), 0);
  return Math.max(0, 100 - penalty);
}
