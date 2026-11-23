import { Document, Image, Link, Page, Path, Rect, Circle, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import { SECTION_TITLES, type Resume, type SectionKey } from '../schema/resume';
import { formatDate, formatFullDate, formatRange } from '../lib/dates';
import { photoForPdf } from '../lib/photo';
import type { Theme } from './theme';
import type { Variant } from './variants';
import { PHOTO_RADIUS, PHOTO_SCALE, href, join, letterParts, stripProtocol, tint } from './photoKit';

/**
 * "Banner": the second photo template. NOT ATS-optimised.
 *
 * A light side column holds the photo, contact details (with small icons),
 * skills (as boxed keywords) and languages. The main column opens with a
 * coloured banner carrying the name, headline and summary, then the long
 * sections in the user's order under accent headings with a rule.
 *
 * Like Profile it keeps real text, PDF standard fonts, standard headings,
 * no hyphenation and no letter-spacing. The main column comes first in the
 * document, so copied or extracted text starts with the name.
 */

/** Sections that live in the side column; everything else (bar the summary, which sits in the banner) goes in the main column. */
const SIDE_SECTIONS: SectionKey[] = ['skills', 'languages'];

function makeStyles(v: Variant, t: Theme) {
  const z = (n: number) => +(n * v.scale * t.font.sizeScale).toFixed(2);
  const sp = (n: number) => +(n * v.spacing).toFixed(2);
  const side = v.sidebar?.width ?? 170;
  const soft = tint(t.accent, 0.55);
  const onBanner = '#ffffff';

  return StyleSheet.create({
    page: {
      flexDirection: 'row-reverse',
      paddingVertical: v.margin,
      fontFamily: t.font.regular,
      fontSize: z(9.6),
      lineHeight: 1.35,
      color: t.text,
    },
    side: { width: side, paddingLeft: v.margin - 4, paddingRight: 14 },
    main: { flex: 1, paddingLeft: 10, paddingRight: v.margin },

    // Banner: pulled up to the page edge and out to the right edge.
    banner: {
      marginTop: -v.margin,
      marginRight: -v.margin,
      paddingTop: v.margin + 4,
      paddingBottom: sp(16),
      paddingLeft: 18,
      paddingRight: v.margin,
      backgroundColor: t.accent,
      color: onBanner,
    },
    name: { fontFamily: t.font.regular, fontSize: z(v.nameSize), lineHeight: 1.1, color: onBanner },
    label: { fontSize: z(11.5), color: onBanner, marginTop: 4, paddingBottom: 5, borderBottomWidth: 0.75, borderBottomColor: tint(t.accent, 0.45) },
    bannerSummary: { fontSize: z(9), lineHeight: 1.4, color: onBanner, marginTop: sp(7) },
    bannerPlain: { paddingBottom: 0, borderBottomWidth: 0 },

    // Side column
    photoWrap: { alignItems: 'center', marginBottom: sp(16) },
    sideSection: { marginTop: sp(14) },
    sideHeading: {
      fontFamily: t.font.bold,
      fontSize: z(11),
      color: t.accent,
      textTransform: 'uppercase',
      paddingBottom: 2,
      marginBottom: sp(6),
      borderBottomWidth: 1,
      borderBottomColor: soft,
    },
    contactItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: sp(6) },
    contactIcon: { width: 14, paddingTop: 1 },
    contactText: { flex: 1, fontSize: z(8.6) },
    contactLink: { color: t.text, textDecoration: 'none' },
    skillGroup: { marginBottom: sp(6) },
    skillName: { fontFamily: t.font.bold, fontSize: z(8.6), marginBottom: 3 },
    chips: { flexDirection: 'row', flexWrap: 'wrap' },
    chip: { fontSize: z(8.2), lineHeight: 1, borderWidth: 0.75, borderColor: soft, paddingTop: 3, paddingBottom: 2, paddingHorizontal: 4, marginRight: 3, marginBottom: 3 },
    langItem: { marginBottom: sp(5) },
    langName: { fontSize: z(9) },
    langFluency: { fontFamily: t.font.italic, fontSize: z(8.2), color: t.accent },

    // Main column
    section: { marginTop: sp(14) },
    heading: {
      fontFamily: t.font.bold,
      fontSize: z(12.5),
      color: t.accent,
      textTransform: 'uppercase',
      paddingBottom: 2,
      marginBottom: sp(6),
      borderBottomWidth: 1,
      borderBottomColor: soft,
    },
    entry: { marginBottom: sp(8) },
    entryTitle: { fontFamily: t.font.bold, fontSize: z(10.6), color: t.accent },
    entryOrg: { fontSize: z(10.2), marginTop: 1 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 1 },
    meta: { fontFamily: t.font.italic, fontSize: z(8.4), color: t.accent },
    metaRight: { fontFamily: t.font.italic, fontSize: z(8.4), color: t.accent, textAlign: 'right', paddingLeft: 8 },
    paragraph: { marginTop: 2 },
    bulletRow: { flexDirection: 'row', marginTop: sp(2) },
    bulletBox: { width: 12, paddingTop: z(3.6) },
    bulletSquare: { width: 4, height: 4, borderWidth: 0.9, borderColor: t.accent },
    bulletText: { flex: 1 },
    label2: { fontFamily: t.font.italic, color: t.accent },
    simpleItem: { marginBottom: sp(5) },

    // Cover letter
    letterDate: { marginTop: sp(20) },
    letterBlock: { marginTop: 14 },
    letterSubject: { marginTop: 14, fontFamily: t.font.bold },
    letterPara: { marginTop: 10, lineHeight: 1.45, fontSize: z(10.2) },
    signature: { marginTop: 26, fontFamily: t.font.bold, fontSize: z(10.4) },
  });
}

type Styles = ReturnType<typeof makeStyles>;

/* ---------- Icons (contact) ---------- */

type IconKind = 'mail' | 'phone' | 'pin' | 'calendar' | 'globe' | 'link';

function Icon({ kind, color }: { kind: IconKind; color: string }) {
  const stroke = { stroke: color, strokeWidth: 2, fill: 'none' } as const;
  return (
    <Svg width={9} height={9} viewBox="0 0 24 24">
      {kind === 'mail' ? (
        <>
          <Rect x={3} y={5} width={18} height={14} rx={1.5} {...stroke} />
          <Path d="M3 7l9 6 9-6" {...stroke} />
        </>
      ) : kind === 'phone' ? (
        <>
          <Rect x={6.5} y={2} width={11} height={20} rx={2} {...stroke} />
          <Path d="M10.5 18h3" {...stroke} />
        </>
      ) : kind === 'pin' ? (
        <>
          <Path d="M12 22s-7-6.4-7-12a7 7 0 0 1 14 0c0 5.6-7 12-7 12z" {...stroke} />
          <Circle cx={12} cy={10} r={2.6} {...stroke} />
        </>
      ) : kind === 'calendar' ? (
        <>
          <Rect x={3} y={5} width={18} height={16} rx={1.5} {...stroke} />
          <Path d="M3 10h18M8 3v4M16 3v4" {...stroke} />
        </>
      ) : kind === 'globe' ? (
        <>
          <Circle cx={12} cy={12} r={9} {...stroke} />
          <Path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" {...stroke} />
        </>
      ) : (
        <>
          <Path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2" {...stroke} />
          <Path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" {...stroke} />
        </>
      )}
    </Svg>
  );
}

/* ---------- Side column ---------- */

function Photo({ resume, variant }: { resume: Resume; variant: Variant }) {
  const photo = photoForPdf(resume);
  if (!photo) return null;
  const size = Math.round((variant.sidebar?.photo ?? 112) * PHOTO_SCALE[resume.meta.photo.size]);
  const radius = PHOTO_RADIUS[resume.meta.photo.shape];
  return <Image src={photo} style={{ width: size, height: size, objectFit: 'cover', borderRadius: size * radius }} />;
}

function SideSection({ s, title, children, first }: { s: Styles; title?: string; children: ReactNode; first?: boolean }) {
  return (
    <View style={first ? undefined : s.sideSection}>
      {title ? (
        <View minPresenceAhead={30}>
          <Text style={s.sideHeading}>{title}</Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

function Contact({ s, t, basics }: { s: Styles; t: Theme; basics: Resume['basics'] }) {
  const loc = basics.location;
  const location = join([loc?.city, loc?.region, loc?.countryCode], ', ');
  const items: { icon: IconKind; value: ReactNode }[] = [];
  if (basics.email)
    items.push({
      icon: 'mail',
      value: (
        <Link src={`mailto:${basics.email}`} style={s.contactLink}>
          {basics.email}
        </Link>
      ),
    });
  if (basics.phone) items.push({ icon: 'phone', value: basics.phone });
  if (location) items.push({ icon: 'pin', value: location });
  if (basics.birthDate) items.push({ icon: 'calendar', value: `Date of birth: ${formatFullDate(basics.birthDate)}` });
  const link = (url: string, icon: IconKind) =>
    items.push({
      icon,
      value: (
        <Link src={href(url)} style={s.contactLink}>
          {stripProtocol(url)}
        </Link>
      ),
    });
  for (const p of basics.profiles ?? []) if (p.url) link(p.url, 'link');
  if (basics.url) link(basics.url, 'globe');
  if (!items.length) return null;
  return (
    <SideSection s={s} first>
      {items.map((it, i) => (
        <View key={i} style={s.contactItem} wrap={false}>
          <View style={s.contactIcon}>
            <Icon kind={it.icon} color={t.accent} />
          </View>
          <Text style={s.contactText}>{it.value}</Text>
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
          <View key={i} style={s.skillGroup} wrap={false}>
            {sk.name ? <Text style={s.skillName}>{sk.name}</Text> : null}
            <View style={s.chips}>
              {(sk.keywords ?? []).map((k, j) => (
                <Text key={j} style={s.chip}>
                  {k}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </SideSection>
    ) : null,

  languages: (r, s) =>
    r.languages.length ? (
      <SideSection s={s} title={SECTION_TITLES.languages}>
        {r.languages.map((l, i) => (
          <View key={i} style={s.langItem} wrap={false}>
            <Text style={s.langName}>{l.language}</Text>
            {l.fluency ? <Text style={s.langFluency}>{l.fluency}</Text> : null}
          </View>
        ))}
      </SideSection>
    ) : null,
};

function SideColumn({ resume, variant, theme, s, sections }: { resume: Resume; variant: Variant; theme: Theme; s: Styles; sections: SectionKey[] }) {
  return (
    <View style={s.side}>
      {photoForPdf(resume) ? (
        <View style={s.photoWrap}>
          <Photo resume={resume} variant={variant} />
        </View>
      ) : null}
      <Contact s={s} t={theme} basics={resume.basics} />
      {sections.map((key) => (
        <View key={key}>{sideRenderers[key]?.(resume, s)}</View>
      ))}
    </View>
  );
}

/* ---------- Main column ---------- */

function Banner({ s, basics, summary }: { s: Styles; basics: Resume['basics']; summary?: string }) {
  return (
    <View style={s.banner}>
      {basics.name ? <Text style={s.name}>{basics.name}</Text> : null}
      {basics.label ? <Text style={summary ? s.label : [s.label, s.bannerPlain]}>{basics.label}</Text> : null}
      {summary ? <Text style={s.bannerSummary}>{summary}</Text> : null}
    </View>
  );
}

function Section({ s, title, children }: { s: Styles; title: string; children: ReactNode }) {
  return (
    <View style={s.section}>
      <View minPresenceAhead={40}>
        <Text style={s.heading}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Bullets({ s, items }: { s: Styles; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <>
      {items.map((t, i) => (
        <View style={s.bulletRow} key={i} wrap={false}>
          <View style={s.bulletBox}>
            <View style={s.bulletSquare} />
          </View>
          <Text style={s.bulletText}>{t}</Text>
        </View>
      ))}
    </>
  );
}

/** Title (accent, bold), organisation below, then "date ....... detail" in small italics. */
function EntryHeader({ s, title, org, date, detail }: { s: Styles; title?: string; org?: string; date?: string; detail?: string }) {
  return (
    <View wrap={false}>
      {title || org ? <Text style={s.entryTitle}>{title || org}</Text> : null}
      {title && org ? <Text style={s.entryOrg}>{org}</Text> : null}
      {date || detail ? (
        <View style={s.metaRow}>
          <Text style={s.meta}>{date ?? ''}</Text>
          {detail ? <Text style={s.metaRight}>{detail}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const mainRenderers: Partial<Record<SectionKey, (r: Resume, s: Styles) => ReactNode>> = {
  work: (r, s) =>
    r.work.length ? (
      <Section s={s} title={SECTION_TITLES.work}>
        {r.work.map((w, i) => (
          <View style={s.entry} key={i}>
            <EntryHeader s={s} title={w.position} org={w.name} date={formatRange(w.startDate, w.endDate)} detail={w.location} />
            {w.summary ? <Text style={s.paragraph}>{w.summary}</Text> : null}
            <Bullets s={s} items={w.highlights} />
          </View>
        ))}
      </Section>
    ) : null,

  education: (r, s) =>
    r.education.length ? (
      <Section s={s} title={SECTION_TITLES.education}>
        {r.education.map((e, i) => (
          <View style={s.entry} key={i} wrap={false}>
            <EntryHeader s={s} title={join([e.studyType, e.area], ', ')} org={e.institution} date={formatRange(e.startDate, e.endDate)} detail={e.score} />
            {e.courses?.length ? (
              <Text style={s.paragraph}>
                <Text style={s.label2}>Relevant courses: </Text>
                {e.courses.join(', ')}
              </Text>
            ) : null}
          </View>
        ))}
      </Section>
    ) : null,

  projects: (r, s) =>
    r.projects.length ? (
      <Section s={s} title={SECTION_TITLES.projects}>
        {r.projects.map((p, i) => (
          <View style={s.entry} key={i}>
            <EntryHeader
              s={s}
              title={p.name}
              org={p.description}
              date={p.startDate || p.endDate ? formatRange(p.startDate, p.endDate) : undefined}
              detail={p.url ? stripProtocol(p.url) : undefined}
            />
            <Bullets s={s} items={p.highlights} />
            {p.keywords?.length ? (
              <Text style={s.paragraph}>
                <Text style={s.label2}>Technologies: </Text>
                {p.keywords.join(', ')}
              </Text>
            ) : null}
          </View>
        ))}
      </Section>
    ) : null,

  certificates: (r, s) =>
    r.certificates.length ? (
      <Section s={s} title={SECTION_TITLES.certificates}>
        {r.certificates.map((c, i) => (
          <View key={i} style={s.simpleItem} wrap={false}>
            <Text>
              {c.name}
              {c.date ? ` (${formatDate(c.date)})` : ''}
            </Text>
            {c.issuer ? <Text style={s.meta}>{c.issuer}</Text> : null}
          </View>
        ))}
      </Section>
    ) : null,

  awards: (r, s) =>
    r.awards.length ? (
      <Section s={s} title={SECTION_TITLES.awards}>
        {r.awards.map((a, i) => (
          <View key={i} style={s.simpleItem} wrap={false}>
            <Text>
              {a.title}
              {a.date ? ` (${formatDate(a.date)})` : ''}
            </Text>
            {a.awarder ? <Text style={s.meta}>{a.awarder}</Text> : null}
            {a.summary ? <Text style={s.paragraph}>{a.summary}</Text> : null}
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

export function BannerResumeDocument({ resume, variant, theme }: DocProps) {
  const s = makeStyles(variant, theme);
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
        <View style={s.main}>
          <Banner s={s} basics={basics} summary={basics.summary} />
          {order
            .filter((k) => k !== 'summary' && !SIDE_SECTIONS.includes(k))
            .map((key) => (
              <View key={key}>{mainRenderers[key]?.(resume, s)}</View>
            ))}
        </View>
        <SideColumn resume={resume} variant={variant} theme={theme} s={s} sections={order.filter((k) => SIDE_SECTIONS.includes(k))} />
      </Page>
    </Document>
  );
}

export function BannerCoverLetterDocument({ resume, variant, theme }: DocProps) {
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
        <View style={s.main}>
          <Banner s={s} basics={basics} />
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
        <SideColumn resume={resume} variant={variant} theme={theme} s={s} sections={[]} />
      </Page>
    </Document>
  );
}
