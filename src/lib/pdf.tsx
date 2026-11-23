import { Font, pdf } from '@react-pdf/renderer';
import type { Resume } from '../schema/resume';
import { getTemplate } from '../templates';
import { CoverLetterDocument, ResumeDocument } from '../templates/layout';
import { ProfileCoverLetterDocument, ProfileResumeDocument } from '../templates/profile';
import { BannerCoverLetterDocument, BannerResumeDocument } from '../templates/banner';
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
  const layout = variant.sidebar?.layout;
  const Doc =
    layout === 'banner'
      ? kind === 'cover'
        ? BannerCoverLetterDocument
        : BannerResumeDocument
      : layout === 'sidebar'
        ? kind === 'cover'
          ? ProfileCoverLetterDocument
          : ProfileResumeDocument
        : kind === 'cover'
          ? CoverLetterDocument
          : ResumeDocument;
  return pdf(<Doc resume={cleaned} variant={variant} theme={theme} />).toBlob();
}

/** Render and download the PDF. Returns the file name. */
export async function downloadPdf(resume: Resume, kind: DocKind = 'resume'): Promise<string> {
  const blob = await renderPdfBlob(resume, kind);
  const filename = pdfFileName(resume, kind);
  downloadBlob(blob, filename);
  return filename;
}
