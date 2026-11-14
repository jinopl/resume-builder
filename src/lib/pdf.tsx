import { Font, pdf } from '@react-pdf/renderer';
import type { Resume } from '../schema/resume';
import { getTemplate } from '../templates';
import { CoverLetterDocument, ResumeDocument } from '../templates/layout';
import { getTheme } from '../templates/theme';
import { cleanResume, visibleResume } from './clean';
import { downloadBlob, pdfFileName } from './io';

// Never hyphenate words: split words confuse ATS keyword matching.
Font.registerHyphenationCallback((word) => [word]);

export type DocKind = 'resume' | 'cover';

/** Render the resume or cover letter. `templateId` overrides the saved template (gallery thumbnails). */
export async function renderPdfBlob(resume: Resume, kind: DocKind = 'resume', templateId?: string): Promise<Blob> {
  const cleaned = visibleResume(cleanResume(resume));
  const { variant } = getTemplate(templateId ?? cleaned.meta.template);
  const theme = getTheme(cleaned.meta);
  const Doc = kind === 'cover' ? CoverLetterDocument : ResumeDocument;
  return pdf(<Doc resume={cleaned} variant={variant} theme={theme} />).toBlob();
}

export async function downloadPdf(resume: Resume, kind: DocKind = 'resume') {
  const blob = await renderPdfBlob(resume, kind);
  downloadBlob(blob, pdfFileName(resume, kind));
}
