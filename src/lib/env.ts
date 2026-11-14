/** Release tag for the live site, "dev-<sha>" for the preview, "local" otherwise. */
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || 'local';

/** The /dev/ preview build. */
export const IS_DEV_PREVIEW = import.meta.env.VITE_CHANNEL === 'dev';

/** Label shown next to the logo so test builds are never mistaken for the live site. */
export const CHANNEL_LABEL = IS_DEV_PREVIEW ? 'Dev preview' : import.meta.env.DEV ? 'Local' : null;

/**
 * The live site and the /dev/ preview share one origin (jinopl.github.io),
 * so the preview uses its own keys and can never overwrite real saved data.
 */
export const STORAGE_PREFIX = IS_DEV_PREVIEW ? 'resume-builder-dev' : 'resume-builder';
