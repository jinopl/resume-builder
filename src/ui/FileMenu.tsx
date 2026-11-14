import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { IconChevronDown, IconFile } from './icons';

export interface MenuItem {
  label: string;
  hint?: string;
  icon: ReactNode;
  onSelect: () => void;
  /** Draw a divider above this item. */
  separated?: boolean;
}

/** A pill button that opens an accessible dropdown menu (arrow keys, Esc, outside click). */
export function FileMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  // Focus the first item when the menu opens.
  useEffect(() => {
    if (open) itemRefs.current[0]?.focus();
  }, [open]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  const onMenuKey = (e: React.KeyboardEvent) => {
    const els = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
    const i = els.indexOf(document.activeElement as HTMLButtonElement);
    const focusAt = (n: number) => els[(n + els.length) % els.length]?.focus();
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusAt(i + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusAt(i - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusAt(0);
        break;
      case 'End':
        e.preventDefault();
        focusAt(els.length - 1);
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'Tab':
        close(false);
        break;
    }
  };

  return (
    <div className="menu-root" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="pill"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <IconFile />
        <span>File</span>
        <IconChevronDown className={`chevron-icon${open ? ' chevron-icon--open' : ''}`} />
      </button>

      {open && (
        <div className="menu" id={menuId} role="menu" aria-label="File" onKeyDown={onMenuKey}>
          {items.map((item, i) => (
            <div key={item.label}>
              {item.separated && <div className="menu__sep" role="separator" />}
              <button
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                type="button"
                role="menuitem"
                className="menu__item"
                onClick={() => {
                  close();
                  item.onSelect();
                }}
              >
                <span className="menu__icon">{item.icon}</span>
                <span className="menu__label">{item.label}</span>
                {item.hint && <span className="menu__hint">{item.hint}</span>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
