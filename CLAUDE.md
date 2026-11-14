# Resume Builder: notes for Claude

Free, private, browser-only resume and cover letter builder. No backend: all data stays in the user's browser (localStorage autosave plus JSON Resume download/upload). React 18 + TypeScript + Vite, PDFs via `@react-pdf/renderer`, preview via `pdfjs-dist`, state via Zustand + Immer, validation via Zod 4.

## Environment

- Node comes from **nvm** and isn't on the default PATH in non-interactive shells. Prefix commands with:
  `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" >/dev/null && <command>`
- `npm run dev`: local dev server. `npm run build`: type-check plus production build (run this before every commit).
- Browser preview: the `resume-builder` entry in `/home/jp/Documents/claude-box/.claude/launch.json` (port 5173, falls back to 5174). `resume-builder-dist` serves the built `dist/` at `http://localhost:5180/dist/` to test the production build under a sub-path.
- GitHub: remote `origin` = `git@github.com:jinopl/resume-builder.git` over **SSH** (works). The `gh` CLI is **not** installed, so GitHub settings, releases and PRs can't be changed from here; ask the user to do those in the web UI. CI status can be read without auth from `https://api.github.com/repos/jinopl/resume-builder/actions/runs`.
- Git author for this repo is set locally (user.name `jp`). Don't change global git config.

## Branch and release strategy (tag-based)

| Where | URL | Comes from |
|---|---|---|
| Live | https://jinopl.github.io/resume-builder/ | latest `v*` tag |
| Dev preview | https://jinopl.github.io/resume-builder/dev/ | head of `dev` |
| Local | http://localhost:5173 | working tree |

Flow:
1. **Work on `dev`** (or a feature branch merged into `dev`). Test locally first.
2. **Push `dev`** to update the `/dev/` preview (about 2 minutes).
3. **Merge `dev` into `main`** when the user is happy. Pushing `main` does *not* change the live site.
4. **Release = push a tag** on `main`: `git tag -a vX.Y.Z -m "vX.Y.Z: summary" && git push origin vX.Y.Z`. That updates the live site.

Rules for Claude:
- Do day-to-day work on `dev`. Never commit directly to `main` except by merging `dev`.
- Commit or push only when the user asks. **Create or push release tags only when the user says to release**, and confirm the version number.
- Versioning is SemVer: `vX.Y.Z+1` fixes, `vX.Y+1.0` features, `vX+1.0.0` breaking changes (e.g. JSON format changes). Keep `package.json` `version` in sync with the release (and run `npm install --package-lock-only` so the lockfile matches).
- Never move or delete a pushed tag without asking. Roll back by running the Deploy workflow manually with an older tag (**Actions → Deploy to GitHub Pages → Run workflow → release: vX.Y.Z**).
- After pushing, check the CI and Deploy runs, then load both URLs (cache-bust with `?nc=<timestamp>`) and confirm the footer version.

## How deployment works

- `.github/workflows/ci.yml`: `npm ci` plus `npm run build` on pushes to `main`/`dev`/`v*` tags and on PRs.
- `.github/workflows/deploy.yml`: triggered by `workflow_run` when CI succeeds (push events only, skipped for `main`), or manually. It builds the **latest `v*` tag** into `/` and **`origin/dev`** into `/dev/`, then publishes both in one Pages artifact (each Pages deploy replaces the whole site). Because `workflow_run` runs on the default branch, the `github-pages` environment's default "main only" rule needs no changes. **Don't switch Pages to "Deploy from a branch".**
- Build-time env vars: `VITE_APP_VERSION` (tag, `dev-<sha>`, or `local` when unset) and `VITE_CHANNEL=dev` for the preview. See `src/lib/env.ts`. The dev channel uses the localStorage prefix `resume-builder-dev:` (the live site uses `resume-builder:`) because both sites share the `jinopl.github.io` origin, and it shows a "Dev preview" badge. Local dev shows a "Local" badge.
- `vite.config.ts` uses `base: './'` so builds work under any sub-path. The pdf.js worker is bundled via `?worker` as a `.js` file so any static host serves it with the right MIME type.
- The GitHub user site `jinopl.github.io` must have **no custom domain**. A custom domain there (e.g. the old `jino.pl`) redirects all project pages away and breaks the site.

## Code map

- `src/schema/resume.ts`: JSON Resume schema (Zod, `.passthrough()` keeps unknown fields). App settings and the cover letter live in `meta` (`template`, `color`, `font`, `sectionOrder`, `hiddenSections`, `coverLetter`, `version`).
- `src/templates/layout.tsx`: the shared ATS-safe PDF layout (`ResumeDocument`, `CoverLetterDocument`). `variants.ts` holds per-template design parameters, `theme.ts` the colour/font presets, `index.ts` the registry.
- `src/editor/`, `src/design/`, `src/checker/`, `src/preview/`, `src/lib/`: forms, Design tab, checks, PDF-to-canvas preview, helpers.

## ATS rules for PDF templates (keep these)

- Single column, real text, standard headings, contact info in the page body, PDF standard fonts (Helvetica/Times), plain "•" bullets, no hyphenation.
- **No `letterSpacing` anywhere.** Tracking makes text extractors output `L A N G UAG E S`.
- After template changes, verify by extracting text with pdf.js for every template × font: headings must be clean lines, all content present, and the example resume should fit on one page.
- Only change the *app's* look when asked. The user is happy with the PDF templates as they are.
