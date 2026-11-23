import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import { PHOTO_SHAPES, PHOTO_SIZES, type PhotoShape, type PhotoSize } from '../schema/resume';
import { cropRect, dataUrlKb, isEmbeddedPhoto, loadImageFile, renderCroppedPhoto, type Crop } from '../lib/photo';
import { SectionCard } from './fields';

const SHAPE_LABELS: Record<PhotoShape, string> = { circle: 'Circle', rounded: 'Rounded', square: 'Square' };
const SIZE_LABELS: Record<PhotoSize, string> = { small: 'Small', medium: 'Medium', large: 'Large' };
const PREVIEW = 220;

const clamp = (n: number) => Math.max(-1, Math.min(1, n));

/** Square crop with a zoom slider, drag-to-pan and arrow keys. */
function Cropper({ img, shape, onDone, onCancel }: { img: HTMLImageElement; shape: PhotoShape; onDone: (dataUrl: string) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<Crop>({ zoom: 1, x: 0, y: 0 });
  const drag = useRef<{ px: number; py: number; crop: Crop } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = PREVIEW * dpr;
    canvas.height = PREVIEW * dpr;
    const { sx, sy, side } = cropRect(img, crop);
    // The crop is drawn on white, like the JPEG it produces.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, sx, sy, side, side, 0, 0, canvas.width, canvas.height);
  }, [img, crop]);

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, crop };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const start = drag.current;
    if (!start) return;
    const { side } = cropRect(img, start.crop);
    const perPx = side / PREVIEW; // source pixels per preview pixel
    const roomX = (img.naturalWidth - side) / 2;
    const roomY = (img.naturalHeight - side) / 2;
    setCrop({
      ...start.crop,
      x: roomX > 0 ? clamp(start.crop.x - ((e.clientX - start.px) * perPx) / roomX) : 0,
      y: roomY > 0 ? clamp(start.crop.y - ((e.clientY - start.py) * perPx) / roomY) : 0,
    });
  };
  const endDrag = () => {
    drag.current = null;
  };
  const onKey = (e: ReactKeyboardEvent<HTMLCanvasElement>) => {
    const step = 0.08;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    setCrop((c) => ({ ...c, x: clamp(c.x + m[0]), y: clamp(c.y + m[1]) }));
  };

  return (
    <div className="cropper">
      <div className={`cropper__frame cropper__frame--${shape}`} style={{ width: PREVIEW, height: PREVIEW }}>
        <canvas
          ref={canvasRef}
          style={{ width: PREVIEW, height: PREVIEW }}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKey}
          aria-label="Photo crop. Drag, or use the arrow keys, to move the photo."
          role="img"
        />
      </div>
      <div className="cropper__controls">
        <div className="photo-option">
          <label className="photo-option__label" htmlFor="photo-zoom">
            Zoom
          </label>
          <input
            id="photo-zoom"
            className="cropper__zoom"
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={crop.zoom}
            onChange={(e) => setCrop((c) => ({ ...c, zoom: Number(e.target.value) }))}
          />
        </div>
        <p className="field__hint">Drag the photo so your face sits in the middle of the {shape === 'square' ? 'square' : shape === 'circle' ? 'circle' : 'frame'}.</p>
        <div className="cropper__actions">
          <button type="button" className="btn btn--primary" onClick={() => onDone(renderCroppedPhoto(img, crop))}>
            Use photo
          </button>
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/** A row of pill-shaped radio buttons. */
function Choices<T extends string>({ label, options, labels, value, onChange, glyph }: {
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
  glyph?: (v: T) => string;
}) {
  return (
    <div className="photo-option">
      <span className="photo-option__label" id={`photo-${label.toLowerCase()}`}>
        {label}
      </span>
      <div className="choices" role="radiogroup" aria-labelledby={`photo-${label.toLowerCase()}`}>
        {options.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={value === o} className={`choice${value === o ? ' choice--active' : ''}`} onClick={() => onChange(o)}>
            {glyph ? <span className={`choice__glyph ${glyph(o)}`} aria-hidden /> : null}
            {labels[o]}
          </button>
        ))}
      </div>
    </div>
  );
}

const CameraIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 8h3l1.6-2.4h6.8L17 8h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

/** The Photo chapter. Shown only with the photo templates (Profile, Banner). */
export function PhotoEditor() {
  const image = useResumeStore((s) => s.resume.basics.image);
  const photo = useResumeStore((s) => s.resume.meta.photo);
  const update = useResumeStore((s) => s.update);
  const fileRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasPhoto = isEmbeddedPhoto(image);
  const linkedPhoto = !!image && !hasPhoto;

  const choose = () => {
    setError(null);
    fileRef.current?.click();
  };
  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setSource(await loadImageFile(file));
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const save = (dataUrl: string) => {
    update((d) => {
      d.basics.image = dataUrl;
      d.meta.photo.show = true;
    });
    setSource(null);
  };
  const remove = () => {
    if (!window.confirm('Remove your photo? It will be deleted from this resume (and from autosave).')) return;
    update((d) => {
      delete d.basics.image;
    });
  };

  return (
    <SectionCard id="edit-photo" title="Photo" description="Optional. Cropped to a square and kept only in your browser and JSON file.">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {error ? (
        <p className="field__error photo-error" role="alert">
          {error}
        </p>
      ) : null}

      {source ? (
        <Cropper img={source} shape={photo.shape} onDone={save} onCancel={() => setSource(null)} />
      ) : hasPhoto ? (
        <div className="photo-current">
          <img src={image} alt="Your resume photo" className={`photo-thumb photo-thumb--${photo.shape}${photo.show ? '' : ' photo-thumb--off'}`} width={104} height={104} />
          <div className="photo-current__options">
            <label className="switch">
              <input type="checkbox" data-field="photo-show" checked={photo.show} onChange={(e) => update((d) => void (d.meta.photo.show = e.target.checked))} />
              <span>Show photo on resume and cover letter</span>
            </label>
            <Choices
              label="Shape"
              options={PHOTO_SHAPES}
              labels={SHAPE_LABELS}
              value={photo.shape}
              glyph={(o) => `choice__glyph--${o}`}
              onChange={(shape) => update((d) => void (d.meta.photo.shape = shape))}
            />
            <Choices label="Size" options={PHOTO_SIZES} labels={SIZE_LABELS} value={photo.size} onChange={(size) => update((d) => void (d.meta.photo.size = size))} />
            <div className="photo-current__buttons">
              <button type="button" className="btn" onClick={choose}>
                Replace
              </button>
              <button type="button" className="btn btn--ghost btn--danger-text" onClick={remove}>
                Remove
              </button>
              <span className="field__hint">{dataUrlKb(image)} KB, saved in your JSON file</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="photo-empty">
          <span className="photo-empty__frame" aria-hidden>
            <CameraIcon />
          </span>
          <div className="photo-empty__text">
            <p>
              <strong>A clear, recent head-and-shoulders photo</strong> on a plain background works best.
            </p>
            <button type="button" className="btn" data-field="photo-add" onClick={choose}>
              Add photo
            </button>
            <p className="field__hint">JPEG or PNG. Nothing is uploaded.</p>
            {linkedPhoto ? (
              <p className="field__hint">
                Your file links to a photo on the web. Linked photos aren’t loaded, so nothing leaves your browser. Add the photo here to include it.
              </p>
            ) : null}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
