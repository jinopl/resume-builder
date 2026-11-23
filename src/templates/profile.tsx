import { Document, Image, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import { SECTION_TITLES, type Resume, type SectionKey } from '../schema/resume';
import { formatDate, formatFullDate, formatRange } from '../lib/dates';
import { photoForPdf } from '../lib/photo';
import type { Theme } from './theme';
import type { Variant } from './variants';
import { PHOTO_RADIUS, PHOTO_SCALE, href, join, letterParts, stripProtocol, tint } from './photoKit';

/**
 * "Profile": the one template designed around a photo. NOT ATS-optimised.
 *
 * A coloured sidebar (the accent colour, full page height) holds the photo,
 * contact details and the short list sections (skills, languages,
 * certifications). The wide main column holds the name and the long sections
 * in the user's chosen order. Meant for applications where a recruiter reads
 * the PDF directly and a photo is expected.
 *
 * It still keeps the habits that cost nothing: real text, PDF standard fonts,
 * standard section headings, no hyphenation and no letter-spacing, so copied
 * or extracted text stays readable. The photo is a plain image with no text.
 */

/** Short list sections that live in the sidebar; everything else goes in the main column. */
const SIDEBAR_SECTIONS: SectionKey[] = ['skills', 'languages', 'certificates'];

function makeStyles(v: Variant, t: Theme) {
  const z = (n: number) => +(n * v.scale * t.font.sizeScale).toFixed(2);
  const sp = (n: number) => +(n * v.spacing).toFixed(2);
  const side = v.sidebar?.width ?? 186;
  const onSide = '#ffffff';
  const sideSoft = tint(t.accent, 0.78);
  const sideRule = tint(t.accent, 0.35);
  const gap = 26;

  return StyleSheet.create({
    page: {
      // The main column comes first in the document (so copied or extracted
      // text starts with the name) but is drawn on the right.
      flexDirection: 'row-reverse',
      paddingVertical: v.margin,
      fontFamily: t.font.regular,
      fontSize: z(9.6),
      lineHeight: 1.35,
      color: t.text,
    },
    /** Full-height colour block, repeated on every page behind the sidebar column. */
    sideBg: { position: 'absolute', top: 0, bottom: 0, left: 0, width: side, backgroundColor: t.accent },
    side: { width: side, paddingHorizontal: 20, color: onSide },
    main: { flex: 1, paddingLeft: gap, paddingRight: v.margin + 4 },

    // Sidebar
    photoWrap: { alignItems: 'center', marginBottom: sp(18) },
    photoRing: { padding: 3, backgroundColor: onSide },
    sideSection: { marginBottom: sp(14) },
    sideHeading: {
      fontFamily: t.font.bold,
      fontSize: z(9.6),
      textTransform: 'uppercase',
      color: onSide,
      paddingBottom: 3,
      marginBottom: sp(6),
      borderBottomWidth: 0.75,
      borderBottomColor: sideRule,
    },
    sideItem: { marginBottom: sp(5) },
    sideLabel: { fontSize: z(7.8), color: sideSoft, textTransform: 'uppercase' },
    sideText: { fontSize: z(9), color: onSide },
    sideBold: { fontFamily: t.font.bold, fontSize: z(9), color: onSide },
    sideSoft: { fontSize: z(8.6), color: sideSoft },
    sideLink: { color: onSide, textDecoration: 'none' },

    // Main column
    name: { fontFamily: t.font.bold, fontSize: z(v.nameSize), lineHeight: 1.1, color: t.text },
    label: { fontFamily: t.font.bold, fontSize: z(12), color: t.accent, marginTop: 4 },
    nameBar: { width: 36, height: 3, backgroundColor: t.accent, marginTop: sp(10) },
    section: { marginTop: sp(16) },
    headingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: sp(7) },
    headingMark: { width: 7, height: 7, backgroundColor: t.accent, marginRight: 7 },
    heading: { fontFamily: t.font.bold, fontSize: z(11.5), color: t.accent, textTransform: 'uppercase' },
    headingRule: { flex: 1, marginLeft: 8, borderBottomWidth: 0.5, borderBottomColor: tint(t.accent, 0.7) },
    entry: { marginBottom: sp(9) },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    entryTitle: { fontFamily: t.font.bold, fontSize: z(10.4), flexShrink: 1, paddingRight: 8 },
    date: { fontSize: z(8.8), color: t.muted, flexShrink: 0, marginTop: 1 },
    org: { fontSize: z(9.4), color: t.accent, marginTop: 1 },
    paragraph: { marginTop: 2 },
    bulletRow: { flexDirection: 'row', marginTop: sp(2) },
    bullet: { width: 10, color: t.accent },
    bulletText: { flex: 1 },
    bold: { fontFamily: t.font.bold },

    // Cover letter
    letterDate: { marginTop: sp(22) },
    letterBlock: { marginTop: 14 },
    letterSubject: { marginTop: 14, fontFamily: t.font.bold },
    letterPara: { marginTop: 10, lineHeight: 1.45, fontSize: z(10.2) },
    signature: { marginTop: 26, fontFamily: t.font.bold, fontSize: z(10.4) },
  });
}

type Styles = ReturnType<typeof makeStyles>;
interface Ctx {
  s: Styles;
}

/* ---------- Sidebar ---------- */

function Photo({ resume, variant, s }: { resume: Resume; variant: Variant; s: Styles }) {
  const photo = photoForPdf(resume);
  if (!photo) return null;
  const size = Math.round((variant.sidebar?.photo ?? 112) * PHOTO_SCALE[resume.meta.photo.size]);
  const radius = PHOTO_RADIUS[resume.meta.photo.shape];
  return (
    <View style={s.photoWrap}>
      <View style={[s.photoRing, { borderRadius: (size + 6) * radius }]}>
        <Image src={photo} style={{ width: size, height: size, objectFit: 'cover', borderRadius: size * radius }} />
      </View>
    </View>
  );
}

function SideSection({ s, title, children }: { s: Styles; title: string; children: ReactNode }) {
  return (
    <View style={s.sideSection}>
      <View minPresenceAhead={30}>
        <Text style={s.sideHeading}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Contact({ s, basics }: { s: Styles; basics: Resume['basics'] }) {
  const loc = basics.location;
  const location = join([loc?.city, loc?.region, loc?.countryCode], ', ');
  const links = [basics.url, ...(basics.profiles ?? []).map((p) => p.url)].filter(Boolean) as string[];
  const items: { label: string; value: ReactNode }[] = [];
  if (basics.phone) items.push({ label: 'Phone', value: basics.phone });
  if (basics.email)
    items.push({
      label: 'Email',
      value: (
        <Link src={`mailto:${basics.email}`} style={s.sideLink}>
          {basics.email}
        </Link>
      ),
    });
  if (location) items.push({ label: 'Location', value: location });
  if (basics.birthDate) items.push({ label: 'Date of birth', value: formatFullDate(basics.birthDate) });
  for (const url of links) {
    const profile = (basics.profiles ?? []).find((p) => p.url === url);
    items.push({
      label: profile?.network || 'Website',
      value: (
        <Link src={href(url)} style={s.sideLink}>
          {stripProtocol(url)}
        </Link>
      ),
    });
  }
  if (!items.length) return null;
  return (
    <SideSection s={s} title="Contact">
      {items.map((it, i) => (
        <View key={i} style={s.sideItem} wrap={false}>
          <Text style={s.sideLabel}>{it.label}</Text>
          <Text style={s.sideText}>{it.value}</Text>
        </View>
      ))}
    </SideSection>
  );
}

const sideRenderers: Partial<Record<SectionKey, (r: Resume, s: Styles) => ReactNode>> = {
  skills: (r, s) =>
    r.skills.length ? (
      <SideSection s={s} title={SECTION_TITLES.skills}>
        {r.skills.map((sk, i) => (
          <View key={i} style={s.sideItem} wrap={false}>
            {sk.name ? <Text style={s.sideBold}>{sk.name}</Text> : null}
            <Text style={s.sideSoft}>{(sk.keywords ?? []).join(', ')}</Text>
          </View>
        ))}
      </SideSection>
    ) : null,

  languages: (r, s) =>
    r.languages.length ? (
      <SideSection s={s} title={SECTION_TITLES.languages}>
        {r.languages.map((l, i) => (
          <View key={i} style={[s.row, s.sideItem]} wrap={false}>
            <Text style={s.sideBold}>{l.language}</Text>
            {l.fluency ? <Text style={s.sideSoft}>{l.fluency}</Text> : null}
          </View>
        ))}
      </SideSection>
    ) : null,

  certificates: (r, s) =>
    r.certificates.length ? (
      <SideSection s={s} title={SECTION_TITLES.certificates}>
        {r.certificates.map((c, i) => (
          <View key={i} style={s.sideItem} wrap={false}>
            <Text style={s.sideBold}>{c.name}</Text>
            <Text style={s.sideSoft}>{join([c.issuer, c.date ? formatDate(c.date) : undefined], ', ')}</Text>
          </View>
        ))}
      </SideSection>
    ) : null,
};

function Sidebar({ resume, variant, s, sections }: { resume: Resume; variant: Variant; s: Styles; sections: SectionKey[] }) {
  return (
    <View style={s.side}>
      <Photo resume={resume} variant={variant} s={s} />
      <Contact s={s} basics={resume.basics} />
      {sections.map((key) => (
        <View key={key}>{sideRenderers[key]?.(resume, s)}</View>
      ))}
    </View>
  );
}

/* ---------- Main column ---------- */

function NameBlock({ s, basics }: { s: Styles; basics: Resume['basics'] }) {
  return (
    <View>
      {basics.name ? <Text style={s.name}>{basics.name}</Text> : null}
      {basics.label ? <Text style={s.label}>{basics.label}</Text> : null}
      <View style={s.nameBar} />
    </View>
  );
}

function Section({ ctx, title, children }: { ctx: Ctx; title: string; children: ReactNode }) {
  const { s } = ctx;
  return (
    <View style={s.section}>
      <View minPresenceAhead={40} style={s.headingRow}>
        <View style={s.headingMark} />
        <Text style={s.heading}>{title}</Text>
        <View style={s.headingRule} />
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

/** "Title ........ Date" then "Org · detail" in the accent colour. */
function EntryHeader({ ctx, title, org, detail, date }: { ctx: Ctx; title?: string; org?: string; detail?: string; date?: string }) {
  const { s } = ctx;
  const sub = join([title ? org : undefined, detail], '  ·  ');
  return (
    <>
      <View style={s.row}>
        <Text style={s.entryTitle}>{title || org}</Text>
        {date ? <Text style={s.date}>{date}</Text> : null}
      </View>
      {sub ? <Text style={s.org}>{sub}</Text> : null}
    </>
  );
}

const mainRenderers: Partial<Record<SectionKey, (r: Resume, ctx: Ctx) => ReactNode>> = {
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

  awards: (r, ctx) =>
    r.awards.length ? (
      <Section ctx={ctx} title={SECTION_TITLES.awards}>
        {r.awards.map((a, i) => (
          <View style={ctx.s.entry} key={i} wrap={false}>
            <EntryHeader ctx={ctx} title={a.title} org={a.awarder} date={a.date ? formatDate(a.date) : undefined} />
            {a.summary ? <Text style={ctx.s.paragraph}>{a.summary}</Text> : null}
          </View>
        ))}
      </Section>
    ) : null,
};

/* ---------- Documents ---------- */

interface DocProps {
  /** Already cleaned (cleanResume) and with hidden sections removed (visibleResume). */
  resume: Resume;
  variant: Variant;
  theme: Theme;
}

export function ProfileResumeDocument({ resume, variant, theme }: DocProps) {
  const s = makeStyles(variant, theme);
  const ctx: Ctx = { s };
  const { basics } = resume;
  const hidden = new Set(resume.meta.hiddenSections);
  const order = resume.meta.sectionOrder.filter((key) => !hidden.has(key));
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
      <Page size="A4" style={s.page}>
        <View style={s.sideBg} fixed />
        <View style={s.main}>
          <NameBlock s={s} basics={basics} />
          {order
            .filter((k) => !SIDEBAR_SECTIONS.includes(k))
            .map((key) => (
              <View key={key}>{mainRenderers[key]?.(resume, ctx)}</View>
            ))}
        </View>
        <Sidebar resume={resume} variant={variant} s={s} sections={order.filter((k) => SIDEBAR_SECTIONS.includes(k))} />
      </Page>
    </Document>
  );
}

export function ProfileCoverLetterDocument({ resume, variant, theme }: DocProps) {
  const s = makeStyles(variant, theme);
  const { basics } = resume;
  const { cl, paragraphs, recipient, greeting, date, closing } = letterParts(resume);

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
        <View style={s.sideBg} fixed />
        <View style={s.main}>
          <NameBlock s={s} basics={basics} />
          <Text style={s.letterDate}>{date}</Text>
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
          <Text style={s.letterPara}>{closing}</Text>
          {basics.name ? <Text style={s.signature}>{basics.name}</Text> : null}
        </View>
        <Sidebar resume={resume} variant={variant} s={s} sections={[]} />
      </Page>
    </Document>
  );
}
