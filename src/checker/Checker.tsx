import { useMemo } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import { runChecks, runCoverLetterChecks, scoreFor, type Severity } from './checks';

const LABELS: Record<Severity, string> = { error: 'Fix', warning: 'Improve', tip: 'Tip' };

export function Checker() {
  const resume = useResumeStore((s) => s.resume);
  const pageCount = useResumeStore((s) => s.pageCount);
  const doc = useResumeStore((s) => s.doc);
  const issues = useMemo(
    () => (doc === 'cover' ? runCoverLetterChecks(resume) : runChecks(resume, pageCount)),
    [resume, pageCount, doc],
  );
  const score = scoreFor(issues);
  const grade = score >= 85 ? 'good' : score >= 60 ? 'ok' : 'poor';

  return (
    <div className="editor">
      <section className="card">
        <div className="score">
          <div className={`score__ring score__ring--${grade}`} style={{ ['--pct' as string]: score }}>
            <span>{score}</span>
          </div>
          <div>
            <h2>{doc === 'cover' ? 'Cover letter check' : 'Resume check'}</h2>
            <p className="muted">
              {doc === 'cover'
                ? 'Checks for a focused, tailored letter: recipient, length, structure and specifics.'
                : 'Rule-based checks for ATS readability and common resume mistakes. The template already handles formatting (single column, standard headings, real text). These checks are about your content and only count sections shown in the PDF.'}
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        {issues.length === 0 ? (
          <p>No issues found. Nice work! Tailor it to each job description for the best results.</p>
        ) : (
          <ul className="issues">
            {issues.map((issue, i) => (
              <li key={i} className={`issue issue--${issue.severity}`}>
                <span className="issue__badge">{LABELS[issue.severity]}</span>
                <span>
                  <strong>{issue.section}:</strong> {issue.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
