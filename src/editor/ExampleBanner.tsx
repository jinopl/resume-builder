import { useResumeStore } from '../store/useResumeStore';
import { IconClose } from '../ui/icons';

/** Shown while an untouched example is loaded, so nobody mistakes it for their own data. */
export function ExampleBanner({ onOpenFile }: { onOpenFile: () => void }) {
  const example = useResumeStore((s) => s.example);
  const loadExample = useResumeStore((s) => s.loadExample);
  const dismissExample = useResumeStore((s) => s.dismissExample);
  const clearAll = useResumeStore((s) => s.clearAll);
  const requestFocus = useResumeStore((s) => s.requestFocus);
  const setDoc = useResumeStore((s) => s.setDoc);
  if (!example) return null;

  const other = example === 'fresher' ? 'experienced' : 'fresher';

  const start = () => {
    clearAll();
    setDoc('resume');
    requestFocus({ section: 'edit-basics', field: 'name' });
  };

  return (
    <section className="welcome" aria-labelledby="welcome-title">
      <div className="welcome__text">
        <h2 id="welcome-title">
          {example === 'fresher' ? 'This is an example fresher resume' : 'This is an example resume'}
        </h2>
        <p>
          Look around, try a template in Design, then start your own. Whatever you type stays in this browser. No
          account, nothing uploaded.
        </p>
      </div>
      <div className="welcome__actions">
        <button type="button" className="btn btn--primary" onClick={start}>
          Start my resume
        </button>
        <button type="button" className="btn" onClick={onOpenFile}>
          Open saved file
        </button>
        <button type="button" className="link-btn" onClick={() => loadExample(other)}>
          {other === 'fresher' ? 'See the fresher example' : 'See the experienced example'}
        </button>
      </div>
      <button type="button" className="icon-btn welcome__close" aria-label="Keep editing the example" title="Keep editing the example" onClick={dismissExample}>
        <IconClose />
      </button>
    </section>
  );
}
