# Resume Builder

A free, private resume and cover letter builder that runs entirely in the browser. There is no server and no account, and no data is stored by us.

1. Fill in your details (or start from the example).
2. **Design**: pick a template (Classic, Modern, Compact, Executive), an accent colour and a font, then reorder or hide sections.
3. **Cover letter**: switch documents at the top. The letter reuses your contact details and matches the resume's design.
4. **Download PDF**: A4, ATS-friendly, with real selectable text.
5. **Download JSON**: save everything (resume, cover letter, design choices). Next time, **Upload JSON** to keep editing.

Data is in the open [JSON Resume](https://jsonresume.org/schema) format, so files also work with other JSON Resume tools. Fields the editor doesn't show (e.g. `volunteer`, `publications`) are preserved on import/export. App settings and the cover letter live in `meta`, which the standard leaves open:

```jsonc
"meta": {
  "template": "modern",          // classic | modern | compact | executive
  "color": "teal",               // navy | charcoal | teal | burgundy | forest | slate | plum
  "font": "serif",               // sans | serif
  "sectionOrder": ["education", "projects", "work", "..."],
  "hiddenSections": ["awards"],  // kept in the data, left out of the PDF
  "coverLetter": { "company": "…", "role": "…", "body": "…" }
}
```

## Develop

Requires Node 20+.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
```

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository (branch `main`).
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Every push to `main` builds and publishes via `.github/workflows/deploy.yml`.

Asset paths are relative (`base: './'` in `vite.config.ts`), so it works at `https://<user>.github.io/<repo>/` without extra config.

## How it works

```
src/
  schema/resume.ts        JSON Resume schema (Zod): validation, defaults, settings, cover letter
  store/useResumeStore.ts App state (Zustand + Immer) and opt-out localStorage autosave
  editor/                 Resume and cover letter forms, reorderable lists
  design/DesignPanel.tsx  Template gallery (live thumbnails), colour, font, sections
  templates/
    layout.tsx            Shared ATS-safe layout engine: ResumeDocument, CoverLetterDocument
    variants.ts           Design parameters per template (header, headings, spacing…)
    theme.ts              Colour and font presets
    index.ts              Template registry
  preview/                Renders the exact PDF with pdf.js onto canvases
  checker/                Rule-based resume and cover letter checks
  lib/                    Cleaning, dates, JSON import/export, PDF download
```

**One source of truth for output:** templates are react-pdf documents. The live preview and gallery thumbnails render that same PDF with pdf.js, so what you see is exactly what downloads.

### Adding a template

Add a variant to `src/templates/variants.ts` (header alignment, heading style, entry layout, sizes, spacing), then register it in `TEMPLATES` in `src/templates/index.ts`. It appears in the gallery automatically and supports every colour, font and the cover letter.

### ATS design rules (all templates)

- Real text objects in the PDF (no screenshots/canvas images)
- Single column, natural reading order, no tables or text boxes
- Standard headings: Summary, Work Experience, Education, Skills…
- Contact info in the body, not in a PDF header/footer
- PDF standard fonts (Helvetica / Times), plain bullets, no hyphenation
- **No letter-spacing**: tracking makes text extractors read `L A N G U A G E S`
- Colour presets are all dark enough for print and greyscale
- PDF metadata: title, author, keywords (from skills)

Verified by extracting text with pdf.js for every template × font combination: all headings come out as clean lines and all content is present.

### Known limitations

- The standard fonts cover Latin characters only. Names or text in other scripts (e.g. Devanagari, CJK) need an embedded Unicode font, which is planned.
- Large first load (~640 KB gzipped) because of the PDF engine and pdf.js.
