import { useEffect } from 'react';
import { useResumeStore } from '../store/useResumeStore';

/** On wide screens, mark the chapter at the top of the editor pane as active. */
export function useScrollSpy(enabled: boolean, key: string) {
  const setActiveChapter = useResumeStore((s) => s.setActiveChapter);
  useEffect(() => {
    if (!enabled) return;
    const root = document.querySelector<HTMLElement>('.pane--left');
    if (!root) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = root.getBoundingClientRect().top + 96;
      const chapters = [...root.querySelectorAll<HTMLElement>('.chapter[id]')];
      const current = chapters.find((el) => el.getBoundingClientRect().bottom > top) ?? chapters[chapters.length - 1];
      if (current && useResumeStore.getState().activeChapter !== current.id) setActiveChapter(current.id);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    root.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      root.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [enabled, key, setActiveChapter]);
}
