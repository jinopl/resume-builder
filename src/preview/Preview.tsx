import { useEffect, useRef, useState } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import { renderPdfBlob } from '../lib/pdf';
import { renderPages } from './renderPages';

/** Pixel width pages are rasterised at (CSS scales them down to fit). */
const RENDER_WIDTH = 1400;
const DEBOUNCE_MS = 350;

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
  }, [resume, doc, setPageCount]);

  return (
    <div className="preview">
      <div className="preview__status" aria-live="polite">
        {status === 'rendering' && <span className="spinner" aria-hidden />}
        {status === 'rendering' && 'Updating preview…'}
        {status === 'ready' && `${doc === 'cover' ? 'Cover letter' : 'Resume'} · A4 · ${pages} page${pages === 1 ? '' : 's'}`}
        {status === 'error' && <span className="field__error">Couldn't render the preview. Check the console for details.</span>}
      </div>
      <div className="preview__pages" ref={pagesRef} />
    </div>
  );
}
