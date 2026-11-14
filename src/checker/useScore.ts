import { useMemo } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import { runChecks, runCoverLetterChecks, scoreFor, type Issue } from './checks';

export type Grade = 'good' | 'ok' | 'poor';

export const gradeFor = (score: number): Grade => (score >= 85 ? 'good' : score >= 60 ? 'ok' : 'poor');

/** Score for the document currently being edited (resume or cover letter). */
export function useScore(): { issues: Issue[]; score: number; grade: Grade; label: string } {
  const resume = useResumeStore((s) => s.resume);
  const pageCount = useResumeStore((s) => s.pageCount);
  const doc = useResumeStore((s) => s.doc);
  return useMemo(() => {
    const issues = doc === 'cover' ? runCoverLetterChecks(resume) : runChecks(resume, pageCount);
    const score = scoreFor(issues);
    return { issues, score, grade: gradeFor(score), label: doc === 'cover' ? 'Cover letter score' : 'Resume score' };
  }, [resume, pageCount, doc]);
}
