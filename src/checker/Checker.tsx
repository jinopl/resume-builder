import { useResumeStore } from '../store/useResumeStore';
import type { Issue, IssueTarget, Severity } from './checks';
import { useScore } from './useScore';
import { SectionCard } from '../editor/fields';
import { useChapters, type Chapter } from '../editor/chapters';
import { getTemplate } from '../templates';

const GROUPS: { severity: Severity; title: string }[] = [
  { severity: 'error', title: 'Fix first' },
  { severity: 'warning', title: 'Improve' },
  { severity: 'tip', title: 'Tips' },
];

interface Essential {
  id: string;
  label: string;
  /** Where to go when the issue itself carries no target. */
  fallback: IssueTarget;
}

const RESUME_ESSENTIALS: Essential[] = [
  { id: 'name', label: 'Your full name', fallback: { doc: 'resume', section: 'edit-basics', field: 'name' } },
  { id: 'email', label: 'An email address', fallback: { doc: 'resume', section: 'edit-basics', field: 'email' } },
  { id: 'education', label: 'Your education', fallback: { doc: 'resume', section: 'edit-education', field: 'add' } },
  {
    id: 'experience',
    label: 'Work experience, an internship or a project',
    fallback: { doc: 'resume', section: 'edit-work', field: 'add' },
  },
  { id: 'skills', label: 'Your skills', fallback: { doc: 'resume', section: 'edit-skills', field: 'add' } },
];

const COVER_ESSENTIALS: Essential[] = [
  { id: 'cl-header', label: 'Your name and email, from the resume', fallback: { doc: 'resume', section: 'edit-basics', field: 'name' } },
  { id: 'cl-company', label: 'The company you’re writing to', fallback: { doc: 'cover', section: 'edit-recipient', field: 'company' } },
  { id: 'cl-body', label: 'The letter itself', fallback: { doc: 'cover', section: 'edit-letter', field: 'body' } },
];

const Arrow = () => (
  <svg className="issue__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export function Checker({ onGo }: { onGo: (target: IssueTarget) => void }) {
  const doc = useResumeStore((s) => s.doc);
  const { issues, score, label } = useScore();
  const chapters = useChapters();

  const essentials = (doc === 'cover' ? COVER_ESSENTIALS : RESUME_ESSENTIALS).map((e) => {
    const issue = issues.find((i) => i.id === e.id);
    return { ...e, done: !issue, target: issue?.target ?? e.fallback };
  });
  const done = essentials.filter((e) => e.done).length;
  const gettingStarted = done < essentials.length;
  const listed = gettingStarted ? issues.filter((i) => !essentials.some((e) => e.id === i.id)) : issues;
  const noun = doc === 'cover' ? 'cover letter' : 'resume';
  const atsTemplate = useResumeStore((s) => getTemplate(s.resume.meta.template).ats);

  return (
    <div className="editor">
      {gettingStarted ? (
        <SectionCard title={`Get your ${noun} ready to send`}>
          <div className="starter">
            <p className="muted">
              {done} of {essentials.length} essentials done. Your score appears once these are in.
            </p>
            <ol className="starter__list">
              {essentials.map((e) => (
                <li key={e.id} className={e.done ? 'starter__item starter__item--done' : 'starter__item'}>
                  {e.done ? (
                    <span className="starter__row">
                      <span className="starter__mark">
                        <Check />
                      </span>
                      <span>{e.label}</span>
                      <span className="sr-only">(done)</span>
                    </span>
                  ) : (
                    <button type="button" className="starter__row starter__row--todo" onClick={() => onGo(e.target)}>
                      <span className="starter__mark" />
                      <span>{e.label}</span>
                      <Arrow />
                    </button>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </SectionCard>
      ) : (
        <SectionCard title={label}>
          <div className="score">
            <p className="score__tile">
              <span className="score__num">{score}</span>
              <span className="score__of">out of 100</span>
            </p>
            <div>
              <p className="muted">
                {doc === 'cover'
                  ? 'Checks for a focused, tailored letter: recipient, length, structure and specifics.'
                  : atsTemplate
                    ? 'Rule-based checks for ATS readability and common resume mistakes. The template already handles formatting (single column, standard headings, real text). These checks are about your content and only count sections shown in the PDF.'
                    : 'Rule-based checks for common resume mistakes. Your template is not ATS-optimised (see Tips). These checks are about your content and only count sections shown in the PDF.'}
              </p>
            </div>
          </div>
        </SectionCard>
      )}

      {(!gettingStarted || listed.length > 0) && (
        <SectionCard title="Exercises" description={listed.length ? 'Each one opens the right chapter and puts the cursor in the field.' : undefined}>
          {listed.length === 0 ? (
            <p>No issues found. Nice work! Tailor it to each job description for the best results.</p>
          ) : (
            <div className="issue-groups">
              {GROUPS.map(({ severity, title }) => {
                const group = listed.filter((i) => i.severity === severity);
                if (!group.length) return null;
                return (
                  <div key={severity} className={`issue-group issue-group--${severity}`}>
                    <h3 className="issue-group__title">
                      <span className="issue-group__dot" aria-hidden />
                      {title}
                      <span className="issue-group__count">{group.length}</span>
                    </h3>
                    <ul className="issues">
                      {group.map((issue, i) => (
                        <li key={i}>
                          <IssueRow issue={issue} onGo={onGo} chapters={chapters} />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}

function IssueRow({ issue, onGo, chapters }: { issue: Issue; onGo: (target: IssueTarget) => void; chapters: Chapter[] }) {
  const ch = issue.target ? chapters.find((c) => c.id === issue.target!.section) : undefined;
  const tile = ch ? (
    <span className="issue__tile" style={{ ['--ch' as string]: ch.color }} aria-hidden>
      {ch.num}
    </span>
  ) : (
    <span className="issue__tile issue__tile--none" aria-hidden />
  );
  const text = (
    <span className="issue__text">
      <strong>{issue.section}:</strong> {issue.message}
    </span>
  );
  if (!issue.target)
    return (
      <div className="issue">
        {tile}
        {text}
      </div>
    );
  const target = issue.target;
  return (
    <button type="button" className="issue issue--link" onClick={() => onGo(target)}>
      {tile}
      {text}
      <Arrow />
    </button>
  );
}
