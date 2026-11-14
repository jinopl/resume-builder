import { useId, useState, type ReactNode } from 'react';
import { isValidDate } from '../lib/dates';
import { csvToList, linesToList, listToCsv, listToLines } from '../lib/clean';
import { useResumeStore } from '../store/useResumeStore';
import type { Resume } from '../schema/resume';

interface TextFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  type?: 'text' | 'email' | 'tel' | 'url';
  wide?: boolean;
  error?: string;
}

export function TextField({ label, value, onChange, placeholder, hint, type = 'text', wide, error }: TextFieldProps) {
  const id = useId();
  return (
    <div className={`field${wide ? ' field--wide' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value ?? ''}
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
}

export function TextArea({ label, value, onChange, placeholder, hint, rows = 4 }: TextAreaProps) {
  const id = useId();
  return (
    <div className="field field--wide">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <small className="field__hint">{hint}</small>}
    </div>
  );
}

/** Bullet points: one per line in a textarea, stored as a string array. */
export function BulletsField({
  label = 'Achievements (one per line)',
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  value: string[] | undefined;
  onChange: (list: string[]) => void;
  placeholder?: string;
}) {
  return (
    <TextArea
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
}: {
  label: string;
  value: string[] | undefined;
  onChange: (list: string[]) => void;
  placeholder?: string;
}) {
  return (
    <TextField
      wide
      label={label}
      value={listToCsv(value)}
      onChange={(t) => onChange(csvToList(t))}
      placeholder={placeholder}
      hint="Separate with commas"
    />
  );
}

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
  return (
    <section className="card" id={id}>
      <header className="card__header">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </header>
      {children}
    </section>
  );
}

interface ListEditorProps<T> {
  items: T[];
  /** Locates the same list inside an immer draft. */
  select: (draft: Resume) => T[];
  create: () => T;
  itemTitle: (item: T) => string;
  addLabel: string;
  renderItem: (item: T, patch: (recipe: (draft: T) => void) => void) => ReactNode;
}

/** Add / remove / reorder / collapse a list of entries in the resume. */
export function ListEditor<T>({ items, select, create, itemTitle, addLabel, renderItem }: ListEditorProps<T>) {
  const update = useResumeStore((s) => s.update);
  // Index of the entry that is expanded; new entries open automatically.
  const [open, setOpen] = useState<number | null>(items.length === 1 ? 0 : null);

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
                  ▸
                </span>
                <span className="list-item__title">{title}</span>
              </button>
              <div className="list-item__actions">
                <button type="button" className="icon-btn" title="Move up" aria-label={`Move ${title} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                  ↑
                </button>
                <button type="button" className="icon-btn" title="Move down" aria-label={`Move ${title} down`} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                  ↓
                </button>
                <button type="button" className="icon-btn icon-btn--danger" title="Remove" aria-label={`Remove ${title}`} onClick={() => remove(i)}>
                  ✕
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
