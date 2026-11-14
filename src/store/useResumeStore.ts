import { create } from 'zustand';
import { produce } from 'immer';
import { emptyResume, parseResume, type Resume } from '../schema/resume';
import { sampleResume } from '../data/sample';

const RESUME_KEY = 'resume-builder:resume';
const SETTINGS_KEY = 'resume-builder:settings';

// localStorage can be missing or throw (private mode, blocked storage).
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — autosave silently does nothing */
  }
}

function loadSettings(): { autosave: boolean } {
  try {
    const raw = readStorage(SETTINGS_KEY);
    if (raw) return { autosave: JSON.parse(raw).autosave !== false };
  } catch {
    /* ignore */
  }
  return { autosave: true };
}

function loadInitialResume(autosave: boolean): Resume {
  if (autosave) {
    const raw = readStorage(RESUME_KEY);
    if (raw) {
      try {
        const parsed = parseResume(JSON.parse(raw));
        if (parsed.ok) return parsed.resume;
      } catch {
        /* corrupted — fall through */
      }
    }
  }
  return sampleResume();
}

interface ResumeState {
  resume: Resume;
  /** Bumped whenever the whole resume is replaced, so editors can reset local UI state. */
  revision: number;
  autosave: boolean;
  /** Pages in the last rendered resume PDF (fed by the preview, read by the checker). */
  pageCount: number;
  /** Which document the editor, preview and download act on. */
  doc: 'resume' | 'cover';
  setDoc: (doc: 'resume' | 'cover') => void;
  update: (recipe: (draft: Resume) => void) => void;
  replace: (resume: Resume) => void;
  setAutosave: (on: boolean) => void;
  setPageCount: (n: number) => void;
  /** Wipe the saved copy and start with an empty resume. */
  clearAll: () => void;
}

const settings = loadSettings();

export const useResumeStore = create<ResumeState>((set) => ({
  resume: loadInitialResume(settings.autosave),
  revision: 0,
  autosave: settings.autosave,
  pageCount: 0,
  doc: 'resume',
  setDoc: (doc) => set({ doc }),
  update: (recipe) => set((s) => ({ resume: produce(s.resume, recipe) })),
  replace: (resume) => set((s) => ({ resume, revision: s.revision + 1 })),
  setAutosave: (on) => {
    writeStorage(SETTINGS_KEY, JSON.stringify({ autosave: on }));
    if (!on) writeStorage(RESUME_KEY, null);
    set({ autosave: on });
  },
  setPageCount: (n) => set({ pageCount: n }),
  clearAll: () => {
    writeStorage(RESUME_KEY, null);
    set((s) => ({ resume: emptyResume(), revision: s.revision + 1 }));
  },
}));

// Debounced autosave to this browser's localStorage only.
let saveTimer: ReturnType<typeof setTimeout> | undefined;
useResumeStore.subscribe((state, prev) => {
  if (!state.autosave) return;
  if (state.resume === prev.resume && state.autosave === prev.autosave) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    writeStorage(RESUME_KEY, JSON.stringify(useResumeStore.getState().resume));
  }, 400);
});
