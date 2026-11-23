import { useEffect, useRef } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import { TEMPLATES, getTemplate } from '../templates';
import { COLORS, FONTS, getTheme } from '../templates/theme';
import { SECTION_TITLES, type Resume } from '../schema/resume';
import { renderPdfBlob } from '../lib/pdf';
import { renderPages } from '../preview/renderPages';
import { sampleResume } from '../data/sample';
import { SectionCard } from '../editor/fields';
import { IconArrowDown, IconArrowUp } from '../ui/icons';

/** First page of `templateId`, rendered with the user's data (or the example if empty). */
function Thumbnail({ templateId, resume }: { templateId: string; resume: Resume }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const source = resume.basics.name ? resume : { ...sampleResume(), meta: resume.meta };
        const blob = await renderPdfBlob(source, 'resume', templateId);
        const { canvases } = await renderPages(blob, 420, 1);
        if (!cancelled && ref.current) ref.current.replaceChildren(...canvases);
      } catch (err) {
        console.error('Thumbnail failed', err);
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [templateId, resume]);
  return <div className="thumb" ref={ref} aria-hidden />;
}

function TemplateGallery() {
  const resume = useResumeStore((s) => s.resume);
  const update = useResumeStore((s) => s.update);
  // Unknown ids from an imported file render with the fallback; show that as selected.
  const current = getTemplate(resume.meta.template).id;
  return (
    <SectionCard title="Template" description="All templates are single-column and ATS-friendly. Your content stays the same when you switch.">
      <div className="gallery" role="radiogroup" aria-label="Template">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={current === t.id}
            className={`gallery__item${current === t.id ? ' gallery__item--active' : ''}`}
            onClick={() => update((d) => void (d.meta.template = t.id))}
          >
            <Thumbnail templateId={t.id} resume={resume} />
            <span className="gallery__name">{t.name}</span>
            <span className="gallery__desc">{t.description}</span>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}

function ThemePicker() {
  const meta = useResumeStore((s) => s.resume.meta);
  const theme = getTheme(meta);
  const color = COLORS.find((c) => c.value === theme.accent)?.id;
  const font = theme.font.id;
  const update = useResumeStore((s) => s.update);
  return (
    <SectionCard title="Colour & font" description="Colours are dark enough to read and print well, including in black and white. Fonts are PDF standard fonts, which every ATS reads reliably.">
      <div className="swatches" role="radiogroup" aria-label="Accent colour">
        {COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={color === c.id}
            className={`swatch${color === c.id ? ' swatch--active' : ''}`}
            onClick={() => update((d) => void (d.meta.color = c.id))}
            title={c.name}
          >
            <span className="swatch__dot" style={{ background: c.value }} />
            <span className="swatch__name">{c.name}</span>
          </button>
        ))}
      </div>
      <div className="fonts" role="radiogroup" aria-label="Font">
        {FONTS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={font === f.id}
            className={`font-option${font === f.id ? ' font-option--active' : ''}`}
            onClick={() => update((d) => void (d.meta.font = f.id))}
          >
            <span className="font-option__sample" style={{ fontFamily: f.css }}>
              Aa
            </span>
            <span>
              <strong>{f.name}</strong>
              <span className="muted small"> · {f.sample}</span>
            </span>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}

function SectionsPanel() {
  const order = useResumeStore((s) => s.resume.meta.sectionOrder);
  const hidden = useResumeStore((s) => s.resume.meta.hiddenSections);
  const update = useResumeStore((s) => s.update);
  const move = (i: number, dir: -1 | 1) =>
    update((d) => {
      const list = d.meta.sectionOrder;
      const j = i + dir;
      [list[i], list[j]] = [list[j], list[i]];
    });
  const toggle = (key: (typeof order)[number], show: boolean) =>
    update((d) => {
      const set = new Set(d.meta.hiddenSections);
      if (show) set.delete(key);
      else set.add(key);
      d.meta.hiddenSections = order.filter((k) => set.has(k));
    });

  return (
    <SectionCard
      title="Sections"
      description="Reorder sections and choose which appear in the PDF. Hidden sections keep their data (and stay in your JSON). Freshers usually lead with Education and Projects, experienced professionals with Work Experience."
    >
      <ol className="order-list">
        {order.map((key, i) => {
          const visible = !hidden.includes(key);
          return (
            <li key={key} className={visible ? '' : 'is-hidden'}>
              <label className="switch">
                <input type="checkbox" checked={visible} onChange={(e) => toggle(key, e.target.checked)} />
                <span>{SECTION_TITLES[key]}</span>
              </label>
              <span className="list-item__actions">
                {!visible && <span className="badge">Hidden</span>}
                <button type="button" className="icon-btn" aria-label={`Move ${SECTION_TITLES[key]} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                  <IconArrowUp />
                </button>
                <button type="button" className="icon-btn" aria-label={`Move ${SECTION_TITLES[key]} down`} disabled={i === order.length - 1} onClick={() => move(i, 1)}>
                  <IconArrowDown />
                </button>
              </span>
            </li>
          );
        })}
      </ol>
    </SectionCard>
  );
}

export function DesignPanel() {
  const doc = useResumeStore((s) => s.doc);
  return (
    <div className="editor">
      <TemplateGallery />
      <ThemePicker />
      {doc === 'resume' ? <SectionsPanel /> : null}
    </div>
  );
}
