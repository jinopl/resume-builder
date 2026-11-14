/**
 * Every template shares one ATS-safe layout engine (layout.tsx) and differs
 * only by these design parameters. Whatever the variant, the output is:
 * one column, real text, standard headings, contact info in the page body.
 */
export interface Variant {
  /** Alignment of the name/contact block. */
  header: 'left' | 'center';
  nameSize: number;
  nameUpper: boolean;
  /** Show the headline (job title) in the accent colour. */
  labelAccent: boolean;
  /** Line(s) under the header block. */
  headerRule: 'none' | 'single' | 'double';
  /**
   * rule:   UPPERCASE heading with an accent underline
   * bar:    Title-case heading with a short accent bar
   * center: centred UPPERCASE heading with a thin grey underline
   * subtle: small UPPERCASE heading with a thin grey underline
   */
  heading: 'rule' | 'bar' | 'center' | 'subtle';
  /**
   * split:   "Title — Company ........ Dates" on one line
   * stacked: Title on its own line, then "Company | Location | Dates"
   */
  entry: 'split' | 'stacked';
  /** Font-size multiplier (1 = 10pt body). */
  scale: number;
  /** Vertical spacing multiplier. */
  spacing: number;
  /** Page margin in points. */
  margin: number;
}

export const VARIANTS = {
  classic: {
    header: 'left',
    nameSize: 22,
    nameUpper: false,
    labelAccent: false,
    headerRule: 'none',
    heading: 'rule',
    entry: 'split',
    scale: 1,
    spacing: 1,
    margin: 36,
  },
  modern: {
    header: 'left',
    nameSize: 26,
    nameUpper: false,
    labelAccent: true,
    headerRule: 'none',
    heading: 'bar',
    entry: 'stacked',
    scale: 0.98,
    spacing: 0.95,
    margin: 34,
  },
  compact: {
    header: 'left',
    nameSize: 19,
    nameUpper: false,
    labelAccent: false,
    headerRule: 'single',
    heading: 'subtle',
    entry: 'split',
    scale: 0.92,
    spacing: 0.75,
    margin: 28,
  },
  executive: {
    header: 'center',
    nameSize: 21,
    nameUpper: true,
    labelAccent: false,
    headerRule: 'double',
    heading: 'center',
    entry: 'split',
    scale: 0.98,
    spacing: 0.92,
    margin: 34,
  },
} satisfies Record<string, Variant>;
