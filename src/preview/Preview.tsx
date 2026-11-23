import { useEffect, useRef, useState } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import { renderPdfBlob } from '../lib/pdf';
import { cleanResume } from '../lib/clean';
import type { Resume } from '../schema/resume';
import { renderPages } from './renderPages';

/** Pixel width pages are rasterised at (CSS scales them down to fit). */
const RENDER_WIDTH = 1400;
const DEBOUNCE_MS = 350;

/** Nothing the PDF would show yet (a fresh "New resume"). */
function isBlank(resume: Resume, doc: 'resume' | 'cover') {
  const r = cleanResume(resume);
  if (doc === 'cover') return !r.meta.coverLetter.body && !r.meta.coverLetter.company;
  const b = r.basics;
  return !b.name && !b.summary && !r.work.length && !r.education.length && !r.projects.length && !r.skills.length;
}

/**
 * Renders the exact PDF that will be downloaded, page by page onto canvases.
 * The new pages replace the old ones in one step, so typing doesn't flicker.
 */
export function Preview() {
  const resume = useResumeStore((s) => s.resume);
  const doc = useResumeStore((s) => s.doc);
  const setPageCount = useResumeStore((s) => s.setPageCount);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'rendering' | 'ready' | 'error'>('rendering');
  const [pages, setPages] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setStatus('rendering');
      try {
        const blob = await renderPdfBlob(resume, doc);
        const { canvases, numPages } = await renderPages(blob, RENDER_WIDTH);
        if (cancelled || !pagesRef.current) return;
        const label = doc === 'cover' ? 'Cover letter' : 'Resume';
        canvases.forEach((c, i) => {
          c.className = 'preview__page';
          c.setAttribute('role', 'img');
          c.setAttribute('aria-label', `${label} page ${i + 1} of ${numPages}`);
        });
        pagesRef.current.replaceChildren(...canvases);
        setPages(numPages);
        if (doc === 'resume') setPageCount(numPages);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        console.error('Preview failed', err);
        setStatus('error');
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [resume, doc, setPageCount, attempt]);

  return (
    <div className="preview">
      <div className="preview__status" aria-live="polite">
        {status === 'rendering' && <span className="spinner" aria-hidden />}
        {status === 'rendering' && 'Updating preview…'}
        {status === 'ready' && `${doc === 'cover' ? 'Cover letter' : 'Resume'} · A4 · ${pages} page${pages === 1 ? '' : 's'}`}
        {status === 'error' && (
          <span className="preview__error">
            The preview couldn’t be drawn. Your data is safe.
            <button type="button" className="link-btn" onClick={() => setAttempt((a) => a + 1)}>
              Try again
            </button>
          </span>
        )}
      </div>
      <div className="preview__stage">
        <div className="preview__pages" ref={pagesRef} />
        {isBlank(resume, doc) && status !== 'error' && (
          <div className="preview__ghost" aria-hidden>
            <div className="ghost__head">
              <span className="ghost__bar ghost__bar--name" />
              <span className="ghost__bar ghost__bar--line" />
            </div>
            <p className="ghost__msg">
              {doc === 'cover'
                ? 'Your cover letter appears here as you write it.'
                : 'Your resume appears here as you type. Start with your name.'}
            </p>
            {[0, 1, 2].map((i) => (
              <div className="ghost__section" key={i}>
                <span className="ghost__bar ghost__bar--heading" />
                <span className="ghost__bar" />
                <span className="ghost__bar" />
                <span className="ghost__bar ghost__bar--short" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
