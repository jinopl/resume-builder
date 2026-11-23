import { createContext, useContext, useEffect, useId, useState, type ReactNode } from 'react';
import { isValidDate } from '../lib/dates';
import { csvToList, linesToList, listToCsv, listToLines } from '../lib/clean';
import { useResumeStore } from '../store/useResumeStore';
import { PHONE_QUERY, useMedia } from '../lib/useMedia';
import { COACH, scrollToChapter, useChapters } from './chapters';
import { IconArrowDown, IconArrowUp, IconChevronRight, IconClose } from '../ui/icons';
import type { Resume } from '../schema/resume';

interface TextFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'date';
  /** Latest allowed value, for date inputs. */
  max?: string;
  wide?: boolean;
  error?: string;
  /** Key the Check tab uses to jump to this input. */
  field?: string;
}

export function TextField({ label, value, onChange, placeholder, hint, type = 'text', wide, error, field, max }: TextFieldProps) {
  const id = useId();
  return (
    <div className={`field${wide ? ' field--wide' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        data-field={field}
        value={value ?? ''}
        max={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? `${id}-hint` : undefined}
      />
      {(error || hint) && (
        <small id={`${id}-hint`} className={error ? 'field__error' : 'field__hint'}>
          {error ?? hint}
        </small>
      )}
    </div>
  );
}

export function DateField(props: Omit<TextFieldProps, 'type' | 'error'>) {
  const error = isValidDate(props.value) ? undefined : 'Use YYYY-MM (e.g. 2021-03) or YYYY';
  return <TextField placeholder="YYYY-MM" {...props} error={error} />;
}

interface TextAreaProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
  field?: string;
}

export function TextArea({ label, value, onChange, placeholder, hint, rows = 4, field }: TextAreaProps) {
  const id = useId();
  return (
    <div className="field field--wide">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        rows={rows}
        data-field={field}
        value={value ?? ''}
        aria-describedby={hint ? `${id}-hint` : undefined}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && (
        <small id={`${id}-hint`} className="field__hint">
          {hint}
        </small>
      )}
    </div>
  );
}

/** Bullet points: one per line in a textarea, stored as a string array. */
export function BulletsField({
  label = 'Achievements (one per line)',
  value,
  onChange,
  placeholder,
  field = 'highlights',
}: {
  label?: string;
  value: string[] | undefined;
  onChange: (list: string[]) => void;
  placeholder?: string;
  field?: string;
}) {
  return (
    <TextArea
      field={field}
      label={label}
      rows={5}
      value={listToLines(value)}
      onChange={(t) => onChange(linesToList(t))}
      placeholder={placeholder}
      hint="Start with an action verb and include a number where you can: “Cut load time by 40%…”"
    />
  );
}

/** Comma-separated tags, stored as a string array. */
export function TagsField({
  label,
  value,
  onChange,
  placeholder,
  field,
}: {
  label: string;
  value: string[] | undefined;
  onChange: (list: string[]) => void;
  placeholder?: string;
  field?: string;
}) {
  return (
    <TextField
      wide
      field={field}
      label={label}
      value={listToCsv(value)}
      onChange={(t) => onChange(csvToList(t))}
      placeholder={placeholder}
      hint="Separate with commas"
    />
  );
}

/** The id of the enclosing SectionCard, so its lists can answer focus requests. */
const SectionContext = createContext<string | undefined>(undefined);

export function SectionCard({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const chapters = useChapters();
  const isPhone = useMedia(PHONE_QUERY);
  const active = useResumeStore((s) => s.activeChapter);
  const setActiveChapter = useResumeStore((s) => s.setActiveChapter);
  const setTab = useResumeStore((s) => s.setTab);
  const doc = useResumeStore((s) => s.doc);
  const index = id ? chapters.findIndex((c) => c.id === id) : -1;
  const chapter = index >= 0 ? chapters[index] : undefined;

  // Plain card (Design tab and other non-chapter panels).
  if (!chapter || !id) {
    return (
      <SectionContext.Provider value={id}>
        <section className="panel" id={id}>
          <header className="panel__band">
            <h2>{title}</h2>
          </header>
          <div className="panel__body">
            {description && <p className="panel__intro">{description}</p>}
            {children}
          </div>
        </section>
      </SectionContext.Provider>
    );
  }

  // On phones one chapter is open at a time; on wider screens all are.
  const open = !isPhone || (active ?? chapters[0].id) === id;
  const next = chapters[index + 1];
  const coach = COACH[id];
  const goNext = () => {
    if (!next) return;
    setActiveChapter(next.id);
    scrollToChapter(next.id);
  };

  return (
    <SectionContext.Provider value={id}>
      <section
        className={`chapter${open ? '' : ' chapter--closed'}`}
        id={id}
        style={{ ['--ch' as string]: chapter.color }}
        aria-labelledby={`${id}-title`}
      >
        <header className="chapter__band">
          <span className="chapter__num" aria-hidden>
            {chapter.num}
          </span>
          <div className="chapter__heading">
            <h2 id={`${id}-title`}>
              {title}
              {chapter.done && (
                <span className="chapter__done">
                  <TickIcon />
                  <span className="sr-only"> (done)</span>
                </span>
              )}
            </h2>
            {description && open && <p>{description}</p>}
          </div>
          {!isPhone && next && open && (
            <button type="button" className="band-next" onClick={goNext} style={{ ['--next' as string]: next.color }}>
              Next: {next.num} {next.title}
              <IconChevronRight />
            </button>
          )}
          {isPhone && (
            <button
              type="button"
              className="chapter__toggle"
              aria-expanded={open}
              aria-controls={`${id}-body`}
              onClick={() => setActiveChapter(open ? null : id)}
            >
              <span className="sr-only">
                {open ? 'Close' : 'Open'} {title}
              </span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m5 7.5 5 5 5-5" />
              </svg>
            </button>
          )}
        </header>
        {open && (
          <div className="chapter__body" id={`${id}-body`}>
            {coach && (
              <aside className={`coach coach--${coach.kind}`} aria-label={coach.kind === 'try' ? 'Try this' : 'Do you know?'}>
                <span className="coach__icon" aria-hidden>
                  {coach.kind === 'try' ? <PencilIcon /> : <BulbIcon />}
                </span>
                <p>
                  <strong>{coach.kind === 'try' ? 'Try this. ' : 'Do you know? '}</strong>
                  {coach.text}
                </p>
              </aside>
            )}
            {children}
            <div className="chapter__next">
              {next ? (
                <button type="button" className="next-btn" onClick={goNext}>
                  Next chapter
                  <span className="next-btn__chip" style={{ ['--ch' as string]: next.color }}>
                    {next.num} {next.title}
                  </span>
                </button>
              ) : (
                <button type="button" className="next-btn" onClick={() => setTab('check')}>
                  Finished? Check your {doc === 'cover' ? 'cover letter' : 'resume'}
                  <span className="next-btn__chip next-btn__chip--check">Check</span>
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </SectionContext.Provider>
  );
}

const TickIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m4.5 10.5 3.5 3.5 7.5-8" />
  </svg>
);
const PencilIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 3.5l3 3L7 16H4v-3z" />
  </svg>
);
const BulbIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.5 15h5M8.5 17.5h3M10 2.5a5 5 0 0 0-3 9c.6.5 1 1.2 1 2V14h4v-.5c0-.8.4-1.5 1-2a5 5 0 0 0-3-9z" />
  </svg>
);

interface ListEditorProps<T> {
  items: T[];
  /** Locates the same list inside an immer draft. */
  select: (draft: Resume) => T[];
  create: () => T;
  itemTitle: (item: T) => string;
  addLabel: string;
  renderItem: (item: T, patch: (recipe: (draft: T) => void) => void) => ReactNode;
  /** `data-field` on the add button (a Check tab target when the list is empty). */
  field?: string;
}

/** Add / remove / reorder / collapse a list of entries in the resume. */
export function ListEditor<T>({ items, select, create, itemTitle, addLabel, renderItem, field }: ListEditorProps<T>) {
  const update = useResumeStore((s) => s.update);
  // Index of the entry that is expanded; new entries open automatically.
  const [open, setOpen] = useState<number | null>(items.length === 1 ? 0 : null);

  // Open the entry the Check tab asked for.
  const sectionId = useContext(SectionContext);
  const request = useResumeStore((s) => s.focusRequest);
  useEffect(() => {
    if (request && request.section === sectionId && request.index !== undefined && request.index < items.length)
      setOpen(request.index);
    // Only react to new requests, not to edits of the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, sectionId]);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    update((d) => {
      const list = select(d);
      [list[i], list[j]] = [list[j], list[i]];
    });
    if (open === i) setOpen(j);
    else if (open === j) setOpen(i);
  };

  const remove = (i: number) => {
    const title = itemTitle(items[i]);
    if (!confirm(`Remove ${title ? `“${title}”` : 'this entry'}?`)) return;
    update((d) => {
      select(d).splice(i, 1);
    });
    if (open === i) setOpen(null);
    else if (open !== null && open > i) setOpen(open - 1);
  };

  return (
    <div className="list">
      {items.map((item, i) => {
        const isOpen = open === i;
        const title = itemTitle(item) || 'Untitled entry';
        return (
          <div className={`list-item${isOpen ? ' list-item--open' : ''}`} key={i}>
            <div className="list-item__bar">
              <button
                type="button"
                className="list-item__toggle"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="chevron" aria-hidden>
                  <IconChevronRight />
                </span>
                <span className="list-item__title">{title}</span>
              </button>
              <div className="list-item__actions">
                <button type="button" className="icon-btn" title="Move up" aria-label={`Move ${title} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                  <IconArrowUp />
                </button>
                <button type="button" className="icon-btn" title="Move down" aria-label={`Move ${title} down`} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                  <IconArrowDown />
                </button>
                <button type="button" className="icon-btn icon-btn--danger" title="Remove" aria-label={`Remove ${title}`} onClick={() => remove(i)}>
                  <IconClose />
                </button>
              </div>
            </div>
            {isOpen && (
              <div className="list-item__body grid">
                {renderItem(item, (recipe) =>
                  update((d) => {
                    recipe(select(d)[i]);
                  }),
                )}
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        className="btn btn--ghost add-btn"
        data-field={field}
        onClick={() => {
          update((d) => {
            select(d).push(create());
          });
          setOpen(items.length);
        }}
      >
        + {addLabel}
      </button>
    </div>
  );
}
