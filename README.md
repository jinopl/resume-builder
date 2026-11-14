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

## Branches, previews and releases

| Where | URL | Updated when |
|---|---|---|
| Live site | https://jinopl.github.io/resume-builder/ | a new `v*` tag is pushed |
| Dev preview | https://jinopl.github.io/resume-builder/dev/ | `dev` is pushed |
| Local | http://localhost:5173 | `npm run dev` |

Workflow:

1. **Work and test locally** on `dev` (or a feature branch merged into `dev`): `npm run dev`.
2. **Preview:** push `dev`. About a minute later, check `/dev/`. It shows a "Dev preview" badge and uses separate browser storage, so it never touches data saved on the live site.
3. **Merge** `dev` into `main` (pull request or `git merge`). This alone doesn't change the live site.
4. **Release:** tag `main` with the next version and push the tag. The live site updates.

```bash
git checkout main && git pull
git tag -a v1.1.0 -m "v1.1.0: short summary"
git push origin v1.1.0
```

Versioning ([SemVer](https://semver.org)): `v1.0.1` for fixes, `v1.1.0` for new features, `v2.0.0` for breaking changes (e.g. JSON format changes).

**Roll back:** in GitHub → **Actions → Deploy to GitHub Pages → Run workflow**, enter an older tag (e.g. `v1.0.0`). Or delete the bad tag and run the workflow with the release field empty.

How it works: `ci.yml` builds every push and pull request. When CI succeeds for a push to `dev` or a tag, `deploy.yml` builds **both** the latest tag and `dev`, and publishes them together (each Pages deploy replaces the whole site). It runs via `workflow_run` on the default branch, so the `github-pages` environment needs no extra branch rules. The version (tag, `dev-<sha>` or `local`) is shown in the app footer and saved in exported JSON (`meta.version`).

Setup for a fresh fork: **Settings → Pages → Source: GitHub Actions**. Asset paths are relative (`base: './'`), so builds work under any sub-path.

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
