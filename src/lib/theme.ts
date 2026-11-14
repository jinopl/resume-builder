import { useEffect, useState } from 'react';

export type ThemePref = 'auto' | 'light' | 'dark';

/**
 * Shared by the live site and /dev/ on purpose: it's a display preference,
 * not resume data. The inline script in index.html reads the same key to
 * apply the theme before first paint (no white flash in dark mode).
 */
const KEY = 'resume-builder:theme';
const query = () => window.matchMedia('(prefers-color-scheme: dark)');

export function readThemePref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark' || v === 'auto') return v;
  } catch {
    /* storage unavailable */
  }
  return 'auto';
}

function applyTheme(pref: ThemePref) {
  const dark = pref === 'dark' || (pref === 'auto' && query().matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#171c23' : '#1f4e79');
}

/** Current preference and a setter. Follows the device setting live while on "auto". */
export function useTheme(): [ThemePref, (p: ThemePref) => void] {
  const [pref, setPref] = useState<ThemePref>(readThemePref);

  useEffect(() => {
    applyTheme(pref);
    try {
      localStorage.setItem(KEY, pref);
    } catch {
      /* storage unavailable: theme still applies for this visit */
    }
    if (pref !== 'auto') return;
    const mq = query();
    const onChange = () => applyTheme('auto');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [pref]);

  return [pref, setPref];
}
