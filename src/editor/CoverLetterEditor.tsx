import { useResumeStore } from '../store/useResumeStore';
import type { CoverLetter } from '../schema/resume';
import { SectionCard, TextArea, TextField } from './fields';
import { useFocusRequest } from './useFocusRequest';
import { useScrollSpy } from './useScrollSpy';
import { PHONE_QUERY, useMedia } from '../lib/useMedia';

type Key = Exclude<keyof CoverLetter, number>;

export function CoverLetterEditor() {
  const cl = useResumeStore((s) => s.resume.meta.coverLetter);
  const basics = useResumeStore((s) => s.resume.basics);
  const update = useResumeStore((s) => s.update);
  const set = (key: Key) => (v: string) =>
    update((d) => {
      d.meta.coverLetter[key] = v;
    });
  useFocusRequest();
  const isPhone = useMedia(PHONE_QUERY);
  useScrollSpy(!isPhone, 'cover');
  const words = (cl.body ?? '').trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="editor">
      <SectionCard
        id="edit-cover"
        title="The job"
        description="Uses your name and contact details from the resume, and the same template, colour and font, so both documents match."
      >
        {!basics.name && (
          <p className="inline-note">Fill in your Personal details on the Resume first. The letter header uses them.</p>
        )}
        <div className="grid">
          <TextField field="role" label="Job you're applying for" value={cl.role} onChange={set('role')} placeholder="Senior Data Analyst" hint="Shown as the subject line" />
          <TextField label="Date" value={cl.date} onChange={set('date')} placeholder="Leave empty for today's date" />
        </div>
      </SectionCard>

      <SectionCard id="edit-recipient" title="Recipient" description="Addressing a named person makes a stronger impression than “To whom it may concern”.">
        <div className="grid">
          <TextField field="recipientName" label="Hiring manager's name" value={cl.recipientName} onChange={set('recipientName')} placeholder="Ms. Anita Rao" />
          <TextField label="Their title" value={cl.recipientTitle} onChange={set('recipientTitle')} placeholder="Head of Analytics" />
          <TextField wide field="company" label="Company" value={cl.company} onChange={set('company')} placeholder="Lumen Labs Pvt. Ltd." />
          <TextArea label="Company address" rows={2} value={cl.address} onChange={set('address')} placeholder={'12 MG Road\nBengaluru 560001'} hint="Optional" />
        </div>
      </SectionCard>

      <SectionCard id="edit-letter" title="Letter">
        <div className="grid">
          <TextField
            wide
            field="greeting"
            label="Greeting"
            value={cl.greeting}
            onChange={set('greeting')}
            placeholder={cl.recipientName ? `Dear ${cl.recipientName},` : 'Dear Hiring Manager,'}
            hint="Leave empty to use the placeholder shown"
          />
          <TextArea
            field="body"
            label="Body"
            rows={14}
            value={cl.body}
            onChange={set('body')}
            placeholder={
              'Opening: the role you are applying for and why this company.\n\nMiddle: 2–3 achievements from your resume that match the job, with numbers.\n\nClosing: restate your interest and invite them to talk.'
            }
            hint={`${words} words · aim for 250–400 · leave a blank line between paragraphs`}
          />
          <TextField label="Closing" value={cl.closing} onChange={set('closing')} placeholder="Sincerely," />
        </div>
      </SectionCard>
    </div>
  );
}
