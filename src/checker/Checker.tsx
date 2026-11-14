import { useResumeStore } from '../store/useResumeStore';
import type { Severity } from './checks';
import { useScore } from './useScore';

const LABELS: Record<Severity, string> = { error: 'Fix', warning: 'Improve', tip: 'Tip' };

export function Checker() {
  const doc = useResumeStore((s) => s.doc);
  const { issues, score, grade, label } = useScore();

  return (
    <div className="editor">
      <section className="card">
        <div className="score">
          <div className={`score__ring score__ring--${grade}`} style={{ ['--pct' as string]: score }}>
            <span>{score}</span>
          </div>
          <div>
            <h2>{label}</h2>
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
