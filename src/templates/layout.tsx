import { Document, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import { SECTION_TITLES, type Resume, type SectionKey } from '../schema/resume';
import { formatDate, formatRange } from '../lib/dates';
import type { Theme } from './theme';
import type { Variant } from './variants';

/**
 * Shared ATS-first layout engine for every template.
 *
 * ATS rules followed regardless of variant:
 *  - real text (react-pdf writes text objects, never images)
 *  - one column in natural reading order; no tables, text boxes or icons
 *  - standard section headings ("Work Experience", "Education", "Skills")
 *  - contact details in the page body, not in a PDF header/footer
 *  - PDF standard fonts and plain "•" bullets
 */

/**
 * No letter-spacing anywhere: any tracking can make PDF text extractors insert
 * spaces between letters ("L A N G UAG E S"), which breaks ATS parsing.
 * Verified with pdf.js text extraction across every template and font.
 */

function makeStyles(v: Variant, t: Theme) {
  const z = (n: number) => +(n * v.scale * t.font.sizeScale).toFixed(2);
  const sp = (n: number) => +(n * v.spacing).toFixed(2);
  const center = v.header === 'center';

  const headingBase = { fontFamily: t.font.bold, color: t.accent, fontSize: z(11) };
  const headings = {
    rule: {
      ...headingBase,
      textTransform: 'uppercase',
      paddingBottom: 2,
      marginBottom: sp(6),
      borderBottomWidth: 0.75,
      borderBottomColor: t.accent,
    },
    bar: { ...headingBase, fontSize: z(12.5), marginBottom: 3 },
    center: {
      ...headingBase,
      textTransform: 'uppercase',
      textAlign: 'center',
      paddingBottom: 3,
      marginBottom: sp(6),
      borderBottomWidth: 0.5,
      borderBottomColor: '#9a9a9a',
    },
    subtle: {
      ...headingBase,
      fontSize: z(10),
      textTransform: 'uppercase',
      paddingBottom: 1.5,
      marginBottom: sp(4),
      borderBottomWidth: 0.5,
      borderBottomColor: '#b5b5b5',
    },
  } as const;

  return StyleSheet.create({
    page: {
      paddingVertical: v.margin,
      paddingHorizontal: v.margin + 8,
      fontFamily: t.font.regular,
      fontSize: z(10),
      lineHeight: 1.35,
      color: t.text,
    },
    header: { alignItems: center ? 'center' : 'flex-start' },
    name: {
      fontSize: z(v.nameSize),
      fontFamily: t.font.bold,
      color: t.accent,
      lineHeight: 1.1,
      textTransform: v.nameUpper ? 'uppercase' : 'none',
      textAlign: center ? 'center' : 'left',
    },
    label: {
      fontSize: z(11.5),
      marginTop: 3,
      color: v.labelAccent ? t.accent : t.muted,
      fontFamily: v.labelAccent ? t.font.bold : t.font.regular,
    },
    contact: {
      marginTop: sp(6),
      fontSize: z(9.5),
      color: t.muted,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: center ? 'center' : 'flex-start',
    },
    contactLinks: {
      marginTop: 2,
      fontSize: z(9.5),
      color: t.muted,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: center ? 'center' : 'flex-start',
    },
    link: { color: t.muted, textDecoration: 'none' },
    ruleSingle: { marginTop: sp(8), borderBottomWidth: 0.75, borderBottomColor: t.accent },
    ruleDouble: {
      marginTop: sp(9),
      height: 3,
      borderTopWidth: 1.25,
      borderBottomWidth: 0.5,
      borderTopColor: t.accent,
      borderBottomColor: t.accent,
    },
    section: { marginTop: sp(12) },
    heading: headings[v.heading],
    headingBar: { width: 26, height: 2, backgroundColor: t.accent, marginBottom: sp(6) },
    entry: { marginBottom: sp(8) },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    entryTitle: {
      fontFamily: t.font.bold,
      fontSize: z(10.5),
      flexShrink: 1,
      paddingRight: 8,
      color: v.entry === 'stacked' ? t.accent : t.text,
    },
    date: { fontSize: z(9.5), color: t.muted, flexShrink: 0 },
    sub: { fontFamily: t.font.italic, color: t.muted, flexShrink: 1, paddingRight: 8 },
    meta: { color: t.muted, fontSize: z(9.5), marginTop: 1 },
    paragraph: { marginTop: 2 },
    bulletRow: { flexDirection: 'row', marginTop: sp(2), paddingLeft: 4 },
    bullet: { width: 10 },
    bulletText: { flex: 1 },
    bold: { fontFamily: t.font.bold },
    line: { marginBottom: sp(2) },
    letterDate: { marginTop: 22 },
    letterBlock: { marginTop: 14 },
    letterSubject: { marginTop: 14, fontFamily: t.font.bold },
    letterPara: { marginTop: 10, lineHeight: 1.45, fontSize: z(10.5) },
    signature: { marginTop: 28, fontFamily: t.font.bold, fontSize: z(10.5) },
  });
}

type Styles = ReturnType<typeof makeStyles>;
interface Ctx {
  s: Styles;
  v: Variant;
}

const join = (parts: (string | undefined)[], sep: string) => parts.filter(Boolean).join(sep);
const SEP = '  |  ';
const stripProtocol = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
const href = (url: string) => (/^[a-z]+:/i.test(url) ? url : `https://${url}`);

function Section({ ctx, title, children }: { ctx: Ctx; title: string; children: ReactNode }) {
  const { s, v } = ctx;
  return (
    <View style={s.section}>
      {/* Keep the heading with at least the start of its first entry. */}
      <View minPresenceAhead={40}>
        <Text style={s.heading}>{title}</Text>
        {v.heading === 'bar' ? <View style={s.headingBar} /> : null}
      </View>
      {children}
    </View>
  );
}

function Bullets({ ctx, items }: { ctx: Ctx; items?: string[] }) {
  const { s } = ctx;
  if (!items?.length) return null;
  return (
    <>
      {items.map((t, i) => (
        <View style={s.bulletRow} key={i} wrap={false}>
          <Text style={s.bullet}>•</Text>
          <Text style={s.bulletText}>{t}</Text>
        </View>
      ))}
    </>
  );
}

/**
 * The heading of one entry (job, degree, project).
 *  split:   "Title — Org ............ Date" / italic "detail"
 *  stacked: "Title" / "Org | detail | Date"
 */
function EntryHeader({ ctx, title, org, detail, date }: { ctx: Ctx; title?: string; org?: string; detail?: string; date?: string }) {
  const { s, v } = ctx;
  if (v.entry === 'stacked') {
    const meta = join([title ? org : undefined, detail, date], SEP);
    return (
      <>
        <Text style={s.entryTitle}>{title || org}</Text>
        {meta ? <Text style={s.meta}>{meta}</Text> : null}
      </>
    );
  }
  return (
    <>
      <View style={s.row}>
        <Text style={s.entryTitle}>{join([title, org], ' — ')}</Text>
        {date ? <Text style={s.date}>{date}</Text> : null}
      </View>
      {detail ? <Text style={s.sub}>{detail}</Text> : null}
    </>
  );
}

/** Items separated by " | ". Each item is its own Text so it never breaks mid-item. */
function ContactLine({ items, style }: { items: ReactNode[]; style: Styles['contact'] }) {
  if (!items.length) return null;
  return (
    <View style={style}>
      {items.map((item, i) => (
        <Text key={i}>
          {i > 0 ? SEP : ''}
          {item}
        </Text>
      ))}
    </View>
  );
}

function Header({ ctx, basics }: { ctx: Ctx; basics: Resume['basics'] }) {
  const { s, v } = ctx;
  const loc = basics.location;
  const location = join([loc?.city, loc?.region, loc?.countryCode], ', ');
  const contact: ReactNode[] = [];
  if (location) contact.push(location);
  if (basics.phone) contact.push(basics.phone);
  if (basics.email)
    contact.push(
      <Link key="email" src={`mailto:${basics.email}`} style={s.link}>
        {basics.email}
      </Link>,
    );
  const links = [basics.url, ...(basics.profiles ?? []).map((p) => p.url)].filter(Boolean) as string[];
  const linkItems = links.map((url) => (
    <Link key={url} src={href(url)} style={s.link}>
      {stripProtocol(url)}
    </Link>
  ));

  return (
    <View style={s.header}>
      {basics.name ? <Text style={s.name}>{basics.name}</Text> : null}
      {basics.label ? <Text style={s.label}>{basics.label}</Text> : null}
      <ContactLine items={contact} style={s.contact} />
      <ContactLine items={linkItems} style={s.contactLinks} />
      {v.headerRule !== 'none' ? (
        <View style={[v.headerRule === 'double' ? s.ruleDouble : s.ruleSingle, { alignSelf: 'stretch' }]} />
      ) : null}
    </View>
  );
}

const renderers: Record<SectionKey, (r: Resume, ctx: Ctx) => ReactNode> = {
  summary: (r, ctx) =>
    r.basics.summary ? (
      <Section ctx={ctx} title={SECTION_TITLES.summary}>
        <Text>{r.basics.summary}</Text>
      </Section>
    ) : null,

  work: (r, ctx) =>
    r.work.length ? (
      <Section ctx={ctx} title={SECTION_TITLES.work}>
        {r.work.map((w, i) => (
          <View style={ctx.s.entry} key={i}>
            <EntryHeader ctx={ctx} title={w.position} org={w.name} detail={w.location} date={formatRange(w.startDate, w.endDate)} />
            {w.summary ? <Text style={ctx.s.paragraph}>{w.summary}</Text> : null}
            <Bullets ctx={ctx} items={w.highlights} />
          </View>
        ))}
      </Section>
    ) : null,

  education: (r, ctx) =>
    r.education.length ? (
      <Section ctx={ctx} title={SECTION_TITLES.education}>
        {r.education.map((e, i) => (
          <View style={ctx.s.entry} key={i} wrap={false}>
            <EntryHeader
              ctx={ctx}
              title={join([e.studyType, e.area], ', ')}
              org={e.institution}
              detail={e.score}
              date={formatRange(e.startDate, e.endDate)}
            />
            {e.courses?.length ? (
              <Text style={ctx.s.paragraph}>
                <Text style={ctx.s.bold}>Relevant courses: </Text>
                {e.courses.join(', ')}
              </Text>
            ) : null}
          </View>
        ))}
      </Section>
    ) : null,

  projects: (r, ctx) =>
    r.projects.length ? (
      <Section ctx={ctx} title={SECTION_TITLES.projects}>
        {r.projects.map((p, i) => (
          <View style={ctx.s.entry} key={i}>
            <EntryHeader
              ctx={ctx}
              title={p.name}
              org={p.description}
              detail={p.url ? stripProtocol(p.url) : undefined}
              date={p.startDate || p.endDate ? formatRange(p.startDate, p.endDate) : undefined}
            />
            <Bullets ctx={ctx} items={p.highlights} />
            {p.keywords?.length ? (
              <Text style={ctx.s.paragraph}>
                <Text style={ctx.s.bold}>Technologies: </Text>
                {p.keywords.join(', ')}
              </Text>
            ) : null}
          </View>
        ))}
      </Section>
    ) : null,

  skills: (r, ctx) =>
    r.skills.length ? (
      <Section ctx={ctx} title={SECTION_TITLES.skills}>
        {r.skills.map((sk, i) => (
          <Text key={i} style={ctx.s.line}>
            {sk.name ? <Text style={ctx.s.bold}>{sk.name}: </Text> : null}
            {(sk.keywords ?? []).join(', ')}
          </Text>
        ))}
      </Section>
    ) : null,

  certificates: (r, ctx) =>
    r.certificates.length ? (
      <Section ctx={ctx} title={SECTION_TITLES.certificates}>
        {r.certificates.map((c, i) => (
          <View style={[ctx.s.row, ctx.s.line]} key={i} wrap={false}>
            <Text style={{ flexShrink: 1, paddingRight: 8 }}>
              <Text style={ctx.s.bold}>{c.name}</Text>
              {c.issuer ? ` — ${c.issuer}` : ''}
            </Text>
            {c.date ? <Text style={ctx.s.date}>{formatDate(c.date)}</Text> : null}
          </View>
        ))}
      </Section>
    ) : null,

  awards: (r, ctx) =>
    r.awards.length ? (
      <Section ctx={ctx} title={SECTION_TITLES.awards}>
        {r.awards.map((a, i) => (
          <View style={ctx.s.line} key={i} wrap={false}>
            <View style={ctx.s.row}>
              <Text style={{ flexShrink: 1, paddingRight: 8 }}>
                <Text style={ctx.s.bold}>{a.title}</Text>
                {a.awarder ? ` — ${a.awarder}` : ''}
              </Text>
              {a.date ? <Text style={ctx.s.date}>{formatDate(a.date)}</Text> : null}
            </View>
            {a.summary ? <Text style={ctx.s.paragraph}>{a.summary}</Text> : null}
          </View>
        ))}
      </Section>
    ) : null,

  languages: (r, ctx) =>
    r.languages.length ? (
      <Section ctx={ctx} title={SECTION_TITLES.languages}>
        <Text>{r.languages.map((l) => join([l.language, l.fluency ? `(${l.fluency})` : undefined], ' ')).join(', ')}</Text>
      </Section>
    ) : null,
};

interface DocProps {
  /** Already cleaned (cleanResume) and with hidden sections removed (visibleResume). */
  resume: Resume;
  variant: Variant;
  theme: Theme;
}

export function ResumeDocument({ resume, variant, theme }: DocProps) {
  const ctx: Ctx = { s: makeStyles(variant, theme), v: variant };
  const { basics } = resume;
  const hidden = new Set(resume.meta.hiddenSections);
  return (
    <Document
      title={basics.name ? `${basics.name} – Resume` : 'Resume'}
      author={basics.name}
      subject={basics.label}
      keywords={resume.skills.flatMap((sk) => sk.keywords ?? []).join(', ')}
      creator="Resume Builder"
      producer="Resume Builder"
      language="en"
    >
      <Page size="A4" style={ctx.s.page}>
        <Header ctx={ctx} basics={basics} />
        {resume.meta.sectionOrder
          .filter((key) => !hidden.has(key))
          .map((key) => (
            <View key={key}>{renderers[key](resume, ctx)}</View>
          ))}
      </Page>
    </Document>
  );
}

const todayLong = () =>
  new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export function CoverLetterDocument({ resume, variant, theme }: DocProps) {
  const ctx: Ctx = { s: makeStyles(variant, theme), v: variant };
  const { s } = ctx;
  const { basics } = resume;
  const cl = resume.meta.coverLetter;
  const paragraphs = (cl.body ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const recipient = [cl.recipientName, cl.recipientTitle, cl.company, ...(cl.address ?? '').split('\n')]
    .map((l) => l?.trim())
    .filter(Boolean);
  const greeting = cl.greeting || (cl.recipientName ? `Dear ${cl.recipientName},` : 'Dear Hiring Manager,');

  return (
    <Document
      title={basics.name ? `${basics.name} – Cover Letter` : 'Cover Letter'}
      author={basics.name}
      subject={cl.role ? `Application for ${cl.role}` : undefined}
      creator="Resume Builder"
      producer="Resume Builder"
      language="en"
    >
      <Page size="A4" style={s.page}>
        <Header ctx={ctx} basics={basics} />
        <Text style={s.letterDate}>{cl.date || todayLong()}</Text>
        {recipient.length ? (
          <View style={s.letterBlock}>
            {recipient.map((line, i) => (
              <Text key={i}>{line}</Text>
            ))}
          </View>
        ) : null}
        {cl.role ? <Text style={s.letterSubject}>Re: Application for {cl.role}</Text> : null}
        <Text style={s.letterPara}>{greeting}</Text>
        {paragraphs.map((p, i) => (
          <Text key={i} style={s.letterPara}>
            {p}
          </Text>
        ))}
        <Text style={s.letterPara}>{cl.closing || 'Sincerely,'}</Text>
        {basics.name ? <Text style={s.signature}>{basics.name}</Text> : null}
      </Page>
    </Document>
  );
}
