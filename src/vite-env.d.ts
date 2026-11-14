/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set by the deploy workflow: release tag (e.g. "v1.2.0") or "dev-<sha>". */
  readonly VITE_APP_VERSION?: string;
  /** "dev" for the /dev/ preview build. */
  readonly VITE_CHANNEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
