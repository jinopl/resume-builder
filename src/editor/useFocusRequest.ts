import { useEffect } from 'react';
import { useResumeStore } from '../store/useResumeStore';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Scrolls to and focuses the input the Check tab asked for. Runs after the
 * target list entry has had a chance to open.
 */
export function useFocusRequest() {
  const request = useResumeStore((s) => s.focusRequest);
  useEffect(() => {
    if (!request) return;
    const timer = setTimeout(() => {
      const section = document.getElementById(request.section);
      // One-shot: clear it so remounting the editor doesn't jump again.
      useResumeStore.setState({ focusRequest: null });
      if (!section) return;
      const scope =
        request.index !== undefined
          ? (section.querySelectorAll<HTMLElement>('.list > .list-item')[request.index] ?? section)
          : section;
      const el =
        (request.field && scope.querySelector<HTMLElement>(`[data-field="${request.field}"]`)) ||
        scope.querySelector<HTMLElement>('input, textarea, button');
      const behavior: ScrollBehavior = reducedMotion() ? 'auto' : 'smooth';
      (el ?? section).scrollIntoView({ block: 'center', behavior });
      if (!el) return;
      el.focus({ preventScroll: true });
      const wrapper = el.closest<HTMLElement>('.field') ?? el;
      wrapper.classList.remove('is-target');
      void wrapper.offsetWidth; // restart the highlight if the same field is targeted twice
      wrapper.classList.add('is-target');
      setTimeout(() => wrapper.classList.remove('is-target'), 1800);
    }, 60);
    return () => clearTimeout(timer);
  }, [request]);
}
