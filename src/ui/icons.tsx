import type { SVGProps } from 'react';

/**
 * The "R" mark. Drawn as strokes (not text) so it looks identical everywhere.
 * The same shape is inlined as the favicon in index.html.
 */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden focusable="false">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path
        d="M11.5 23.5V8.5h5.25a4.25 4.25 0 0 1 0 8.5H11.5M16.5 17l5 6.5"
        fill="none"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

/** 20×20 line icons, 1.75px stroke, inherit the text colour. */
function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconDownload = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 3v10M5.5 8.5 10 13l4.5-4.5M4 16.5h12" />
  </Icon>
);

export const IconChevronDown = (p: IconProps) => (
  <Icon width="14" height="14" {...p}>
    <path d="m5 7.5 5 5 5-5" />
  </Icon>
);

export const IconFile = (p: IconProps) => (
  <Icon {...p}>
    <path d="M11.5 2.5H5.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V7z" />
    <path d="M11.5 2.5V7H16" />
  </Icon>
);

export const IconNew = (p: IconProps) => (
  <Icon {...p}>
    <path d="M11.5 2.5H5.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V7z" />
    <path d="M11.5 2.5V7H16M10 10v5M7.5 12.5h5" />
  </Icon>
);

export const IconSparkle = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 2.5 11.6 8.4 17.5 10l-5.9 1.6L10 17.5l-1.6-5.9L2.5 10l5.9-1.6z" />
  </Icon>
);

export const IconOpen = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 15.5v-10A1.5 1.5 0 0 1 4 4h3.5l2 2H15a1.5 1.5 0 0 1 1.5 1.5V9" />
    <path d="M2.5 15.5 4.6 10a1.5 1.5 0 0 1 1.4-1h11a1 1 0 0 1 .9 1.4l-2 5.1H2.5z" />
  </Icon>
);

export const IconSave = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 3.5h9.5L16.5 6.5V15a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 15V5A1.5 1.5 0 0 1 5 3.5" />
    <path d="M6.5 3.5v4h6v-4M6.5 16.5v-5h7v5" />
  </Icon>
);
