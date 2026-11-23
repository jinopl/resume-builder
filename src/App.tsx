import { useEffect, useRef, useState } from 'react';
import { useResumeStore } from './store/useResumeStore';
import { Editor } from './editor/Editor';
import { CoverLetterEditor } from './editor/CoverLetterEditor';
import { DesignPanel } from './design/DesignPanel';
import { Checker } from './checker/Checker';
import { Preview } from './preview/Preview';
import { exportJson, importJsonFile } from './lib/io';
import { downloadPdf } from './lib/pdf';
import { ExampleBanner } from './editor/ExampleBanner';
import { useScore } from './checker/useScore';
import type { IssueTarget } from './checker/checks';
import type { ExampleKind, Tab } from './store/useResumeStore';
import { ChapterRail } from './editor/ChapterRail';
import { APP_VERSION, CHANNEL_LABEL } from './lib/env';
import { FileMenu } from './ui/FileMenu';
import { ThemeToggle } from './ui/ThemeToggle';
import { IconClose, IconDownload, IconLock, IconNew, IconOpen, IconSave, IconSparkle, Logo } from './ui/icons';

type Notice = {
  kind: 'error' | 'success';
  text: string;
  action?: { label: string; run: () => void };
} | null;

/** Success notices clear themselves; errors stay until dismissed. */
const NOTICE_MS = 12000;

const TABS: { id: Tab; label: string }[] = [
  { id: 'edit', label: 'Edit' },
  { id: 'design', label: 'Design' },
  { id: 'check', label: 'Check' },
];

export default function App() {
  const resume = useResumeStore((s) => s.resume);
  const replace = useResumeStore((s) => s.replace);
  const autosave = useResumeStore((s) => s.autosave);
  const setAutosave = useResumeStore((s) => s.setAutosave);
  const clearAll = useResumeStore((s) => s.clearAll);
  const doc = useResumeStore((s) => s.doc);
  const setDoc = useResumeStore((s) => s.setDoc);
  const unsaved = useResumeStore((s) => s.unsaved);
  const saveFailed = useResumeStore((s) => s.saveFailed);
  const markSaved = useResumeStore((s) => s.markSaved);
  const example = useResumeStore((s) => s.example);
  const loadExample = useResumeStore((s) => s.loadExample);
  const requestFocus = useResumeStore((s) => s.requestFocus);
  const { issues } = useScore();
  const toFix = issues.filter((i) => i.severity !== 'tip').length;

  const tab = useResumeStore((s) => s.tab);
  const setTab = useResumeStore((s) => s.setTab);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (notice?.kind !== 'success') return;
    const t = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(t);
  }, [notice]);

  // Warn before closing the tab when edits exist only in memory.
  const atRisk = unsaved && (!autosave || saveFailed);
  useEffect(() => {
    if (!atRisk) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [atRisk]);

  const onSaveJson = () => {
    const name = exportJson(resume);
    markSaved();
    setNotice({ kind: 'success', text: `Saved “${name}”. Open it later with File → Open saved file to keep editing.` });
  };

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
    setNotice(null);
    // Let "Preparing…" paint before PDF rendering ties up the main thread.
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
    try {
      const name = await downloadPdf(resume, doc);
      setNotice({
        kind: 'success',
        text: `Downloaded “${name}”. Check your Downloads folder.`,
        action: { label: 'Also save an editable copy (.json)', run: onSaveJson },
      });
    } catch (err) {
      console.error(err);
      setNotice({
        kind: 'error',
        text: 'The PDF couldn’t be created. Your data is safe. Try again, or reload the page if it keeps failing.',
      });
    } finally {
      setBusy(false);
    }
  };

  const onNew = () => {
    if (confirm('Start a new, empty resume and cover letter? Your current data will be cleared from this browser. Use File → Save file for later first if you want to keep it.')) {
      clearAll();
      setNotice(null);
      setDoc('resume');
      setTab('edit');
      requestFocus({ section: 'edit-basics', field: 'name' });
    }
  };

  const onToggleAutosave = (on: boolean) => {
    if (
      !on &&
      !confirm(
        'Turn off autosave? The copy saved in this browser will be deleted. Your work stays open until you close this page, so save a file first if you want to keep it.',
      )
    )
      return;
    setAutosave(on);
  };

  const onSample = (kind: ExampleKind) => {
    if (example || confirm('Replace your current data with the example resume and cover letter?')) {
      loadExample(kind);
      setTab('edit');
    }
  };

  /** From the Check tab: open the editor at the field that needs work. */
  const onGo = ({ doc: targetDoc, section, index, field }: IssueTarget) => {
    setDoc(targetDoc);
    setTab('edit');
    requestFocus({ section, index, field });
  };

  const openFile = () => fileRef.current?.click();

  const left =
    tab === 'design' ? (
      <DesignPanel />
    ) : tab === 'check' ? (
      <Checker onGo={onGo} />
    ) : (
      <>
        <ExampleBanner onOpenFile={openFile} />
        {doc === 'cover' ? <CoverLetterEditor /> : <Editor />}
      </>
    );

  return (
    <div className="app" data-tab={tab}>
      <header className="topbar">
        <div className="brand">
          <Logo />
          <div className="brand__text">
            <h1>
              <span className="brand__name">Resume Builder</span>
              {CHANNEL_LABEL && <span className="channel-badge">{CHANNEL_LABEL}</span>}
            </h1>
            <SaveStatus autosave={autosave} saveFailed={saveFailed} />
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
          <ThemeToggle />
          <FileMenu
            items={[
              { label: 'New resume', icon: <IconNew />, onSelect: onNew },
              { label: 'Example: experienced', icon: <IconSparkle />, onSelect: () => onSample('experienced') },
              { label: 'Example: fresher', icon: <IconSparkle />, onSelect: () => onSample('fresher') },
              {
                label: 'Open saved file',
                hint: '.json',
                icon: <IconOpen />,
                onSelect: openFile,
                separated: true,
              },
              { label: 'Save file for later', hint: '.json', icon: <IconSave />, onSelect: onSaveJson },
            ]}
          />
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
          <button
            type="button"
            className="pill pill--primary topbar__pdf"
            onClick={onDownloadPdf}
            disabled={busy}
            title={doc === 'cover' ? 'Download your cover letter as a PDF' : 'Download your resume as a PDF'}
            aria-label={busy ? 'Preparing PDF' : doc === 'cover' ? 'Download cover letter PDF' : 'Download resume PDF'}
          >
            {busy ? <span className="spinner spinner--on-accent" aria-hidden /> : <IconDownload />}
            <span>{busy ? 'Preparing…' : 'Download PDF'}</span>
          </button>
        </div>
      </header>

      {notice && (
        <div className={`notice notice--${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
          <div className="notice__body">
            <p>{notice.text}</p>
            {notice.action && (
              <button type="button" className="notice__action" onClick={notice.action.run}>
                {notice.action.label}
              </button>
            )}
          </div>
          <button type="button" className="icon-btn" aria-label="Dismiss" onClick={() => setNotice(null)}>
            <IconClose />
          </button>
        </div>
      )}

      <main className="layout">
        <ChapterRail />
        <div className="pane pane--left">
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
            {t.id === 'check' && toFix > 0 && (
              <span className="tab__count" aria-label={`${toFix} to fix`}>
                {toFix}
              </span>
            )}
          </button>
        ))}
          </nav>

          {left}
          <footer className="footer muted small">
            <label className="switch">
              <input type="checkbox" checked={autosave} onChange={(e) => onToggleAutosave(e.target.checked)} />
              <span>Autosave in this browser</span>
            </label>
            {autosave && saveFailed ? (
              <span className="footer__warn" role="status">
                This browser isn’t letting the app save (private window or storage full). Use File → Save file for later
                before you close this page.
              </span>
            ) : (
              <span>
                {autosave
                  ? 'Your resume and cover letter are saved only in this browser, on this device. Nothing is uploaded.'
                  : 'Autosave is off. Use File → Save file for later before closing this page.'}
              </span>
            )}
            <span className="version">
              Version {APP_VERSION} ·{' '}
              <a href="https://github.com/jinopl/resume-builder" target="_blank" rel="noreferrer">
                Source on GitHub
              </a>
            </span>
          </footer>
        </div>
        <div className="pane pane--right">
          <Preview />
        </div>
      </main>

      <div className="bottombar">
        <button type="button" className="btn" onClick={() => setTab(tab === 'preview' ? 'edit' : 'preview')}>
          {tab === 'preview' ? 'Back to editing' : 'Preview'}
        </button>
        <button type="button" className="btn btn--primary" onClick={onDownloadPdf} disabled={busy}>
          {busy ? <span className="spinner spinner--on-accent" aria-hidden /> : <IconDownload />}
          {busy ? 'Preparing…' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
}

/** Always-visible privacy and autosave state. */
function SaveStatus({ autosave, saveFailed }: { autosave: boolean; saveFailed: boolean }) {
  const lastSaved = useResumeStore((s) => s.lastSaved);
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);
  if (autosave && saveFailed)
    return (
      <p className="save-status save-status--warn" role="status">
        <IconLock /> This browser isn’t saving your work
      </p>
    );
  if (!autosave)
    return (
      <p className="save-status save-status--warn">
        <IconLock /> Autosave off · save a file before closing
      </p>
    );
  const ago = lastSaved ? Math.round((Date.now() - lastSaved) / 60000) : null;
  return (
    <p className="save-status" title="Your resume is stored only in this browser. Nothing is uploaded.">
      <IconLock />
      <span className="save-status__long">Saved only on this device</span>
      <span className="save-status__short">On this device</span>
      {ago !== null && <span className="save-status__when">{ago < 1 ? ' · just now' : ` · ${ago} min ago`}</span>}
    </p>
  );
}
