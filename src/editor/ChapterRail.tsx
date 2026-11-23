import { useResumeStore } from '../store/useResumeStore';
import { scrollToChapter, useChapters } from './chapters';

/**
 * The table of contents: numbered chapter tiles with a tick when done.
 * A column on wide screens, a compact strip of tiles on narrow ones.
 */
export function ChapterRail() {
  const chapters = useChapters();
  const doc = useResumeStore((s) => s.doc);
  const tab = useResumeStore((s) => s.tab);
  const active = useResumeStore((s) => s.activeChapter);
  const setTab = useResumeStore((s) => s.setTab);
  const setActiveChapter = useResumeStore((s) => s.setActiveChapter);

  const currentId = active ?? chapters[0]?.id;
  const current = tab === 'edit' ? chapters.find((c) => c.id === currentId) : undefined;
  const done = chapters.filter((c) => c.done).length;

  const go = (id: string) => {
    setTab('edit');
    setActiveChapter(id);
    scrollToChapter(id);
  };

  return (
    <nav className="rail" aria-label={doc === 'cover' ? 'Cover letter chapters' : 'Resume chapters'}>
      <h2 className="rail__title">Contents</h2>
      <p className="rail__progress">
        <span className="rail__count">
          {done} of {chapters.length} done
        </span>
        {current && (
          <span className="rail__here">{` · Chapter ${current.num}: ${current.title}`}</span>
        )}
      </p>
      <ol className="rail__list">
        {chapters.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className={`rail__item${c.done ? ' rail__item--done' : ''}${c.hidden ? ' rail__item--hidden' : ''}`}
              style={{ ['--ch' as string]: c.color }}
              aria-current={current?.id === c.id ? 'step' : undefined}
              onClick={() => go(c.id)}
            >
              <span className="rail__num" aria-hidden>
                {c.num}
              </span>
              <span className="rail__name">
                {c.title}
                {c.hidden && <span className="rail__tag"> · hidden</span>}
                {c.done && <span className="sr-only"> (done)</span>}
              </span>
              {c.done && (
                <svg className="rail__tick" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m4.5 10.5 3.5 3.5 7.5-8" />
                </svg>
              )}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
