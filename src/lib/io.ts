import { JSON_RESUME_SCHEMA_URL, parseResume, type ParseResult, type Resume } from '../schema/resume';
import { cleanResume } from './clean';
import { APP_VERSION } from './env';

function safeFileName(name: string | undefined, suffix: string, ext: string) {
  const base = (name ?? '').trim().replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_|_$/g, '');
  return `${base || 'Resume'}${suffix}.${ext}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportJson(resume: Resume) {
  const cleaned = cleanResume(resume);
  const out: Resume = {
    ...cleaned,
    $schema: JSON_RESUME_SCHEMA_URL,
    meta: { ...cleaned.meta, version: APP_VERSION, lastModified: new Date().toISOString() },
  };
  // Put $schema first for readability.
  const { $schema, ...rest } = out;
  const blob = new Blob([JSON.stringify({ $schema, ...rest }, null, 2)], {
    type: 'application/json',
  });
  downloadBlob(blob, safeFileName(resume.basics.name, '_resume', 'json'));
}

export function pdfFileName(resume: Resume, kind: 'resume' | 'cover' = 'resume') {
  return safeFileName(resume.basics.name, kind === 'cover' ? '_Cover_Letter' : '_Resume', 'pdf');
}

const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

export async function importJsonFile(file: File): Promise<ParseResult> {
  if (file.size > MAX_IMPORT_BYTES) {
    return { ok: false, error: 'That file is too large to be a resume (limit 2 MB).' };
  }
  let data: unknown;
  try {
    data = JSON.parse(await file.text());
  } catch {
    return { ok: false, error: `"${file.name}" is not valid JSON.` };
  }
  return parseResume(data);
}
