import { useRef, useState } from 'react';
import { useResumeStore } from './store/useResumeStore';
import { Editor } from './editor/Editor';
import { CoverLetterEditor } from './editor/CoverLetterEditor';
import { DesignPanel } from './design/DesignPanel';
import { Checker } from './checker/Checker';
import { Preview } from './preview/Preview';
import { exportJson, importJsonFile } from './lib/io';
import { downloadPdf } from './lib/pdf';
import { sampleResume } from './data/sample';

type Tab = 'edit' | 'design' | 'check' | 'preview';
type Notice = { kind: 'error' | 'success'; text: string } | null;

const TABS: { id: Tab; label: string }[] = [
  { id: 'edit', label: 'Edit' },
  { id: 'design', label: 'Design' },
  { id: 'check', label: 'Check' },
  { id: 'preview', label: 'Preview' },
];

export default function App() {
  const resume = useResumeStore((s) => s.resume);
  const replace = useResumeStore((s) => s.replace);
  const autosave = useResumeStore((s) => s.autosave);
  const setAutosave = useResumeStore((s) => s.setAutosave);
  const clearAll = useResumeStore((s) => s.clearAll);
  const doc = useResumeStore((s) => s.doc);
  const setDoc = useResumeStore((s) => s.setDoc);

  const [tab, setTab] = useState<Tab>('edit');
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    const result = await importJsonFile(file);
    if (result.ok) {
      replace(result.resume);
      setNotice({ kind: 'success', text: `Loaded “${file.name}”.` });
    } else {
      setNotice({ kind: 'error', text: result.error });
    }
  };

  const onDownloadPdf = async () => {
    setBusy(true);
    try {
      await downloadPdf(resume, doc);
    } catch (err) {
      console.error(err);
      setNotice({ kind: 'error', text: 'Could not create the PDF. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const onNew = () => {
    if (confirm('Start a new, empty resume and cover letter? Your current data will be cleared from this browser. Download the JSON first if you want to keep it.')) {
      clearAll();
      setNotice(null);
    }
  };

  const onSample = () => {
    if (confirm('Replace your current data with the example resume and cover letter?')) replace(sampleResume());
  };

  const left =
    tab === 'design' ? <DesignPanel /> : tab === 'check' ? <Checker /> : doc === 'cover' ? <CoverLetterEditor /> : <Editor />;

  return (
    <div className="app" data-tab={tab}>
      <header className="topbar">
        <div className="brand">
          <span className="brand__logo" aria-hidden>
            ▤
          </span>
          <div>
            <h1>Resume Builder</h1>
            <p className="muted small">Free &amp; private. Your data never leaves your browser.</p>
          </div>
        </div>

        <div className="segmented" role="radiogroup" aria-label="Document">
          {(['resume', 'cover'] as const).map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={doc === d}
              className={`segmented__btn${doc === d ? ' segmented__btn--active' : ''}`}
              onClick={() => setDoc(d)}
            >
              {d === 'resume' ? 'Resume' : 'Cover letter'}
            </button>
          ))}
        </div>

        <div className="toolbar">
          <button type="button" className="btn btn--ghost" onClick={onNew}>
            New
          </button>
          <button type="button" className="btn btn--ghost" onClick={onSample}>
            Example
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()} title="Load a resume.json you saved earlier">
            Upload JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              void onImport(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button type="button" className="btn" onClick={() => exportJson(resume)} title="Save your resume and cover letter to edit again later">
            Download JSON
          </button>
          <button type="button" className="btn btn--primary" onClick={onDownloadPdf} disabled={busy}>
            {busy ? 'Preparing…' : doc === 'cover' ? 'Download cover letter PDF' : 'Download resume PDF'}
          </button>
        </div>
      </header>

      {notice && (
        <div className={`notice notice--${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
          <pre>{notice.text}</pre>
          <button type="button" className="icon-btn" aria-label="Dismiss" onClick={() => setNotice(null)}>
            ✕
          </button>
        </div>
      )}

      <nav className="tabs" aria-label="View">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab tab--${t.id}${tab === t.id ? ' tab--active' : ''}`}
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="layout">
        <div className="pane pane--left">
          {left}
          <footer className="footer muted small">
            <label className="switch">
              <input type="checkbox" checked={autosave} onChange={(e) => setAutosave(e.target.checked)} />
              <span>Autosave in this browser</span>
            </label>
            <span>
              {autosave
                ? 'Your resume and cover letter are saved only in this browser’s local storage. Turn off to remove them.'
                : 'Autosave is off. Download the JSON before closing this page.'}
            </span>
          </footer>
        </div>
        <div className="pane pane--right">
          <Preview />
        </div>
      </main>
    </div>
  );
}
