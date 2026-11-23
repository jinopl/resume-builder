import { create } from 'zustand';
import { produce } from 'immer';
import { emptyResume, parseResume, type Resume } from '../schema/resume';
import { sampleResume } from '../data/sample';
import { STORAGE_PREFIX } from '../lib/env';

const RESUME_KEY = `${STORAGE_PREFIX}:resume`;
const SETTINGS_KEY = `${STORAGE_PREFIX}:settings`;

// localStorage can be missing or throw (private mode, blocked storage).
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
/** Returns false when storage is unavailable (private mode, full, blocked). */
function writeStorage(key: string, value: string | null): boolean {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
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

export type ExampleKind = 'experienced' | 'fresher';
export type Tab = 'edit' | 'design' | 'check' | 'preview';

/** Where the editor should jump to (set by the Check tab). `n` makes repeat requests distinct. */
export interface FocusRequest {
  /** DOM id of the section card, e.g. `edit-work`. */
  section: string;
  /** Entry in a list section. */
  index?: number;
  /** `data-field` of the input to focus. */
  field?: string;
  n: number;
}

function loadInitialResume(autosave: boolean): { resume: Resume; example: ExampleKind | null } {
  if (autosave) {
    const raw = readStorage(RESUME_KEY);
    if (raw) {
      try {
        const parsed = parseResume(JSON.parse(raw));
        if (parsed.ok) return { resume: parsed.resume, example: null };
      } catch {
        /* corrupted — fall through */
      }
    }
  }
  return { resume: sampleResume('experienced'), example: 'experienced' };
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
  /** Set while an untouched example is loaded; cleared by the first edit. */
  example: ExampleKind | null;
  /** Edits made since the last file save or load (guards closing the tab when autosave can't help). */
  unsaved: boolean;
  /** The last autosave failed because this browser blocks storage. */
  saveFailed: boolean;
  /** Time of the last successful autosave. */
  lastSaved: number | null;
  focusRequest: FocusRequest | null;
  tab: Tab;
  /** DOM id of the chapter in view (desktop) or open (phone), e.g. `edit-work`. */
  activeChapter: string | null;
  setTab: (tab: Tab) => void;
  setActiveChapter: (id: string | null) => void;
  setDoc: (doc: 'resume' | 'cover') => void;
  update: (recipe: (draft: Resume) => void) => void;
  /** Replace the whole resume, e.g. with a loaded file (counts as saved). */
  replace: (resume: Resume) => void;
  loadExample: (kind: ExampleKind) => void;
  dismissExample: () => void;
  markSaved: () => void;
  setAutosave: (on: boolean) => void;
  setPageCount: (n: number) => void;
  /** Wipe the saved copy and start with an empty resume. */
  clearAll: () => void;
  requestFocus: (target: Omit<FocusRequest, 'n'>) => void;
}

const settings = loadSettings();
const initial = loadInitialResume(settings.autosave);

export const useResumeStore = create<ResumeState>((set) => ({
  resume: initial.resume,
  revision: 0,
  autosave: settings.autosave,
  pageCount: 0,
  doc: 'resume',
  example: initial.example,
  unsaved: false,
  saveFailed: false,
  lastSaved: null,
  focusRequest: null,
  tab: 'edit',
  activeChapter: null,
  setTab: (tab) => set({ tab }),
  setActiveChapter: (activeChapter) => set({ activeChapter }),
  setDoc: (doc) => set((s) => (s.doc === doc ? {} : { doc, activeChapter: null })),
  update: (recipe) => set((s) => ({ resume: produce(s.resume, recipe), example: null, unsaved: true })),
  replace: (resume) => set((s) => ({ resume, revision: s.revision + 1, example: null, unsaved: false })),
  loadExample: (kind) =>
    set((s) => ({ resume: sampleResume(kind), revision: s.revision + 1, example: kind, unsaved: false })),
  dismissExample: () => set({ example: null }),
  markSaved: () => set({ unsaved: false }),
  setAutosave: (on) => {
    writeStorage(SETTINGS_KEY, JSON.stringify({ autosave: on }));
    if (!on) writeStorage(RESUME_KEY, null);
    set({ autosave: on, saveFailed: false, lastSaved: null });
  },
  setPageCount: (n) => set({ pageCount: n }),
  clearAll: () => {
    writeStorage(RESUME_KEY, null);
    set((s) => ({ resume: emptyResume(), revision: s.revision + 1, example: null, unsaved: false, activeChapter: null }));
  },
  requestFocus: (target) =>
    set((s) => ({ focusRequest: { ...target, n: (s.focusRequest?.n ?? 0) + 1 }, activeChapter: target.section })),
}));

// Debounced autosave to this browser's localStorage only.
let saveTimer: ReturnType<typeof setTimeout> | undefined;
useResumeStore.subscribe((state, prev) => {
  if (!state.autosave) return;
  if (state.resume === prev.resume && state.autosave === prev.autosave) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const ok = writeStorage(RESUME_KEY, JSON.stringify(useResumeStore.getState().resume));
    useResumeStore.setState(ok ? { saveFailed: false, lastSaved: Date.now() } : { saveFailed: true });
  }, 400);
});
