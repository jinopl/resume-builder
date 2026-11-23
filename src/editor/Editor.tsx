import { useResumeStore } from '../store/useResumeStore';
import { SECTION_TITLES, type SectionKey } from '../schema/resume';
import { useFocusRequest } from './useFocusRequest';
import { useScrollSpy } from './useScrollSpy';
import { PHONE_QUERY, useMedia } from '../lib/useMedia';
import { PhotoEditor } from './PhotoField';
import { getTemplate } from '../templates';
import { BulletsField, DateField, ListEditor, SectionCard, TagsField, TextArea, TextField } from './fields';

function BasicsEditor() {
  const basics = useResumeStore((s) => s.resume.basics);
  const update = useResumeStore((s) => s.update);
  const set = (key: 'name' | 'label' | 'email' | 'phone' | 'url' | 'birthDate') => (v: string) =>
    update((d) => {
      d.basics[key] = v;
    });
  const setLoc = (key: 'city' | 'region' | 'countryCode') => (v: string) =>
    update((d) => {
      d.basics.location ??= {};
      d.basics.location[key] = v;
    });

  return (
    <SectionCard id="edit-basics" title="Personal details" description="Shown at the top of your resume.">
      <div className="grid">
        <TextField field="name" label="Full name" value={basics.name} onChange={set('name')} placeholder="Jane Doe" />
        <TextField field="label" label="Headline / Job title" value={basics.label} onChange={set('label')} placeholder="Data Analyst" />
        <TextField field="email" label="Email" type="email" value={basics.email} onChange={set('email')} placeholder="jane@example.com" />
        <TextField field="phone" label="Phone" type="tel" value={basics.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
        <TextField field="city" label="City" value={basics.location?.city} onChange={setLoc('city')} placeholder="Bengaluru" />
        <TextField label="State / Region" value={basics.location?.region} onChange={setLoc('region')} placeholder="Karnataka" />
        <TextField label="Country code" value={basics.location?.countryCode} onChange={setLoc('countryCode')} placeholder="IN" hint="Optional, e.g. US, IN, GB" />
        <TextField label="Website / Portfolio" type="url" value={basics.url} onChange={set('url')} placeholder="https://janedoe.dev" />
        <TextField
          field="birthDate"
          label="Date of birth (optional)"
          // A picker for full dates; an imported "2002" or "2002-03" stays editable as text.
          type={!basics.birthDate || /^\d{4}-\d{2}-\d{2}$/.test(basics.birthDate) ? 'date' : 'text'}
          max={new Date().toISOString().slice(0, 10)}
          value={basics.birthDate}
          onChange={set('birthDate')}
          hint="Common in India, the Middle East and parts of Europe and Asia. Leave it empty for the US, UK, Canada and Australia."
        />
      </div>
      <PhotoHint />
      <h3 className="subheading">Online profiles</h3>
      <ListEditor
        items={basics.profiles ?? []}
        select={(d) => (d.basics.profiles ??= [])}
        create={() => ({ network: '', url: '' })}
        itemTitle={(p) => p.network ?? ''}
        addLabel="Add profile (LinkedIn, GitHub…)"
        field="profiles"
        renderItem={(p, patch) => (
          <>
            <TextField label="Network" value={p.network} onChange={(v) => patch((d) => void (d.network = v))} placeholder="LinkedIn" />
            <TextField label="Username" value={p.username} onChange={(v) => patch((d) => void (d.username = v))} placeholder="janedoe" />
            <TextField wide label="Profile URL" type="url" value={p.url} onChange={(v) => patch((d) => void (d.url = v))} placeholder="https://linkedin.com/in/janedoe" />
          </>
        )}
      />
    </SectionCard>
  );
}

/** Only the photo templates (Profile, Banner) print a photo; point people there instead of offering a photo that wouldn't show. */
function PhotoHint() {
  const usesPhoto = useResumeStore((s) => !!getTemplate(s.resume.meta.template).variant.sidebar);
  const setTab = useResumeStore((s) => s.setTab);
  if (usesPhoto) return null;
  return (
    <p className="photo-hint field__hint">
      Need a photo on your resume? Only the Profile and Banner templates show one.{' '}
      <button type="button" className="link-btn" onClick={() => setTab('design')}>
        Choose it in Design
      </button>
    </p>
  );
}

function SummaryEditor() {
  const summary = useResumeStore((s) => s.resume.basics.summary);
  const update = useResumeStore((s) => s.update);
  return (
    <SectionCard id="edit-summary" title={SECTION_TITLES.summary} description="2–4 sentences: who you are, your strongest skills, and a headline achievement.">
      <TextArea
        field="summary"
        label="Professional summary"
        rows={5}
        value={summary}
        onChange={(v) => update((d) => void (d.basics.summary = v))}
        placeholder="Data analyst with 3 years of experience turning messy data into decisions…"
        hint={`${(summary ?? '').trim().length} characters · aim for 300–600`}
      />
    </SectionCard>
  );
}

function WorkEditor() {
  const work = useResumeStore((s) => s.resume.work);
  return (
    <SectionCard id="edit-work" title={SECTION_TITLES.work} description="Most recent first. Leave the end date empty for your current job.">
      <ListEditor
        items={work}
        select={(d) => d.work}
        create={() => ({ position: '', name: '', startDate: '', endDate: '', highlights: [] })}
        itemTitle={(w) => [w.position, w.name].filter(Boolean).join(' · ')}
        addLabel="Add position"
        field="add"
        renderItem={(w, patch) => (
          <>
            <TextField field="position" label="Job title" value={w.position} onChange={(v) => patch((d) => void (d.position = v))} placeholder="Software Engineer" />
            <TextField field="company" label="Company" value={w.name} onChange={(v) => patch((d) => void (d.name = v))} placeholder="Acme Corp" />
            <TextField label="Location" value={w.location} onChange={(v) => patch((d) => void (d.location = v))} placeholder="Pune, India / Remote" />
            <TextField label="Company website" type="url" value={w.url} onChange={(v) => patch((d) => void (d.url = v))} hint="Optional" />
            <DateField field="startDate" label="Start date" value={w.startDate} onChange={(v) => patch((d) => void (d.startDate = v))} />
            <DateField field="endDate" label="End date" value={w.endDate} onChange={(v) => patch((d) => void (d.endDate = v))} hint="Empty = Present" />
            <TextArea label="Role summary" rows={2} value={w.summary} onChange={(v) => patch((d) => void (d.summary = v))} hint="Optional one-liner about the team or scope" />
            <BulletsField value={w.highlights} onChange={(l) => patch((d) => void (d.highlights = l))} placeholder={'Reduced report generation time by 50% by…\nLed a team of 4 to…'} />
          </>
        )}
      />
    </SectionCard>
  );
}

function EducationEditor() {
  const education = useResumeStore((s) => s.resume.education);
  return (
    <SectionCard id="edit-education" title={SECTION_TITLES.education} description="Most recent first. Freshers can add Class XII and Class X with board and percentage.">
      <ListEditor
        items={education}
        select={(d) => d.education}
        create={() => ({ institution: '', studyType: '', area: '', startDate: '', endDate: '' })}
        itemTitle={(e) => [e.studyType, e.area, e.institution].filter(Boolean).join(' · ')}
        addLabel="Add education"
        field="add"
        renderItem={(e, patch) => (
          <>
            <TextField wide field="institution" label="School / University" value={e.institution} onChange={(v) => patch((d) => void (d.institution = v))} placeholder="University of Mumbai" />
            <TextField label="Degree" value={e.studyType} onChange={(v) => patch((d) => void (d.studyType = v))} placeholder="B.Tech / Bachelor of Science" />
            <TextField label="Field of study" value={e.area} onChange={(v) => patch((d) => void (d.area = v))} placeholder="Computer Science" />
            <DateField field="startDate" label="Start date" value={e.startDate} onChange={(v) => patch((d) => void (d.startDate = v))} />
            <DateField field="endDate" label="End date (or expected)" value={e.endDate} onChange={(v) => patch((d) => void (d.endDate = v))} />
            <TextField label="Grade / GPA" value={e.score} onChange={(v) => patch((d) => void (d.score = v))} placeholder="8.6 CGPA / 91%" hint="Optional" />
            <TagsField label="Relevant courses" value={e.courses} onChange={(l) => patch((d) => void (d.courses = l))} placeholder="Data Structures, Databases" />
          </>
        )}
      />
    </SectionCard>
  );
}

function ProjectsEditor() {
  const projects = useResumeStore((s) => s.resume.projects);
  return (
    <SectionCard id="edit-projects" title={SECTION_TITLES.projects} description="Great for freshers and career changers. Show what you built and the result.">
      <ListEditor
        items={projects}
        select={(d) => d.projects}
        create={() => ({ name: '', description: '', highlights: [], keywords: [] })}
        itemTitle={(p) => p.name ?? ''}
        addLabel="Add project"
        renderItem={(p, patch) => (
          <>
            <TextField label="Project name" value={p.name} onChange={(v) => patch((d) => void (d.name = v))} />
            <TextField label="Link" type="url" value={p.url} onChange={(v) => patch((d) => void (d.url = v))} hint="Optional" />
            <TextField wide label="Short description" value={p.description} onChange={(v) => patch((d) => void (d.description = v))} placeholder="Mobile app for tracking…" />
            <DateField label="Start date" value={p.startDate} onChange={(v) => patch((d) => void (d.startDate = v))} hint="Optional" />
            <DateField label="End date" value={p.endDate} onChange={(v) => patch((d) => void (d.endDate = v))} hint="Optional" />
            <BulletsField label="Highlights (one per line)" value={p.highlights} onChange={(l) => patch((d) => void (d.highlights = l))} />
            <TagsField label="Technologies" value={p.keywords} onChange={(l) => patch((d) => void (d.keywords = l))} placeholder="React, Firebase" />
          </>
        )}
      />
    </SectionCard>
  );
}

function SkillsEditor() {
  const skills = useResumeStore((s) => s.resume.skills);
  return (
    <SectionCard id="edit-skills" title={SECTION_TITLES.skills} description="Group skills by category. Use the exact terms from job postings — ATS systems match keywords.">
      <ListEditor
        items={skills}
        select={(d) => d.skills}
        create={() => ({ name: '', keywords: [] })}
        itemTitle={(s) => s.name ?? ''}
        addLabel="Add skill group"
        field="add"
        renderItem={(s, patch) => (
          <>
            <TextField wide label="Category" value={s.name} onChange={(v) => patch((d) => void (d.name = v))} placeholder="Programming Languages" />
            <TagsField label="Skills" value={s.keywords} onChange={(l) => patch((d) => void (d.keywords = l))} placeholder="Python, SQL, Excel" />
          </>
        )}
      />
    </SectionCard>
  );
}

function CertificatesEditor() {
  const certificates = useResumeStore((s) => s.resume.certificates);
  return (
    <SectionCard id="edit-certificates" title={SECTION_TITLES.certificates}>
      <ListEditor
        items={certificates}
        select={(d) => d.certificates}
        create={() => ({ name: '', issuer: '', date: '' })}
        itemTitle={(c) => c.name ?? ''}
        addLabel="Add certification"
        renderItem={(c, patch) => (
          <>
            <TextField wide label="Certification" value={c.name} onChange={(v) => patch((d) => void (d.name = v))} placeholder="Google Data Analytics Certificate" />
            <TextField label="Issuer" value={c.issuer} onChange={(v) => patch((d) => void (d.issuer = v))} placeholder="Coursera / Google" />
            <DateField label="Date" value={c.date} onChange={(v) => patch((d) => void (d.date = v))} />
            <TextField wide label="Credential URL" type="url" value={c.url} onChange={(v) => patch((d) => void (d.url = v))} hint="Optional" />
          </>
        )}
      />
    </SectionCard>
  );
}

function AwardsEditor() {
  const awards = useResumeStore((s) => s.resume.awards);
  return (
    <SectionCard id="edit-awards" title={SECTION_TITLES.awards}>
      <ListEditor
        items={awards}
        select={(d) => d.awards}
        create={() => ({ title: '', awarder: '', date: '' })}
        itemTitle={(a) => a.title ?? ''}
        addLabel="Add award"
        renderItem={(a, patch) => (
          <>
            <TextField label="Award" value={a.title} onChange={(v) => patch((d) => void (d.title = v))} placeholder="Employee of the Year" />
            <TextField label="Awarded by" value={a.awarder} onChange={(v) => patch((d) => void (d.awarder = v))} />
            <DateField label="Date" value={a.date} onChange={(v) => patch((d) => void (d.date = v))} />
            <TextArea label="Details" rows={2} value={a.summary} onChange={(v) => patch((d) => void (d.summary = v))} hint="Optional" />
          </>
        )}
      />
    </SectionCard>
  );
}

function LanguagesEditor() {
  const languages = useResumeStore((s) => s.resume.languages);
  return (
    <SectionCard id="edit-languages" title={SECTION_TITLES.languages}>
      <ListEditor
        items={languages}
        select={(d) => d.languages}
        create={() => ({ language: '', fluency: '' })}
        itemTitle={(l) => l.language ?? ''}
        addLabel="Add language"
        renderItem={(l, patch) => (
          <>
            <TextField label="Language" value={l.language} onChange={(v) => patch((d) => void (d.language = v))} placeholder="English" />
            <TextField label="Fluency" value={l.fluency} onChange={(v) => patch((d) => void (d.fluency = v))} placeholder="Native / Fluent / Basic" />
          </>
        )}
      />
    </SectionCard>
  );
}

const SECTION_EDITORS: Record<SectionKey, () => JSX.Element> = {
  summary: SummaryEditor,
  work: WorkEditor,
  education: EducationEditor,
  projects: ProjectsEditor,
  skills: SkillsEditor,
  certificates: CertificatesEditor,
  awards: AwardsEditor,
  languages: LanguagesEditor,
};

export function Editor() {
  const order = useResumeStore((s) => s.resume.meta.sectionOrder);
  const hidden = useResumeStore((s) => s.resume.meta.hiddenSections);
  // Re-mount editors when a whole new resume is loaded so open/closed state resets.
  const revision = useResumeStore((s) => s.revision);
  useFocusRequest();
  const isPhone = useMedia(PHONE_QUERY);
  const usesPhoto = useResumeStore((s) => !!getTemplate(s.resume.meta.template).variant.sidebar);
  useScrollSpy(!isPhone, `${revision}:${usesPhoto}:${order.join()}`);
  return (
    <div className="editor" key={revision}>
      <BasicsEditor />
      {usesPhoto ? <PhotoEditor /> : null}
      {order.map((key) => {
        const SectionEditor = SECTION_EDITORS[key];
        return hidden.includes(key) ? (
          <div key={key} className="hidden-section">
            <p className="inline-note">
              <strong>{SECTION_TITLES[key]}</strong> is hidden from the PDF. Show it again in the Design tab.
            </p>
            <SectionEditor />
          </div>
        ) : (
          <SectionEditor key={key} />
        );
      })}
      <p className="muted small editor__hint">Reorder or hide sections, and pick a template, colour and font in the Design tab.</p>
    </div>
  );
}
