import { useTheme, type ThemePref } from '../lib/theme';
import { IconAuto, IconMoon, IconSun } from './icons';

const NEXT: Record<ThemePref, ThemePref> = { auto: 'light', light: 'dark', dark: 'auto' };
const NAME: Record<ThemePref, string> = { auto: 'Auto (matches your device)', light: 'Light', dark: 'Dark' };

/** Cycles Auto → Light → Dark. The icon shows the current setting. */
export function ThemeToggle() {
  const [pref, setPref] = useTheme();
  const label = `Theme: ${NAME[pref]}. Switch to ${NAME[NEXT[pref]].split(' (')[0]}.`;
  return (
    <button type="button" className="pill pill--icon" onClick={() => setPref(NEXT[pref])} title={label} aria-label={label}>
      {pref === 'auto' ? <IconAuto /> : pref === 'light' ? <IconSun /> : <IconMoon />}
    </button>
  );
}
