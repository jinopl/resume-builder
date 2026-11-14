import { JSON_RESUME_SCHEMA_URL, ResumeSchema, type Resume } from '../schema/resume';

/** Fictional example shown on first visit, so the preview isn't empty. */
export function sampleResume(): Resume {
  return ResumeSchema.parse({
    $schema: JSON_RESUME_SCHEMA_URL,
    basics: {
      name: 'Alex Morgan',
      label: 'Senior Software Engineer',
      email: 'alex.morgan@example.com',
      phone: '+1 555 010 2030',
      url: 'https://alexmorgan.dev',
      summary:
        'Software engineer with 7 years of experience building reliable web platforms and data pipelines. Led teams of up to 6 engineers, cut infrastructure costs by 35%, and shipped products used by 2M+ customers. Comfortable across the stack, strongest in TypeScript, Python and cloud architecture.',
      location: { city: 'Austin', region: 'TX', countryCode: 'US' },
      profiles: [
        { network: 'LinkedIn', username: 'alexmorgan', url: 'https://linkedin.com/in/alexmorgan' },
        { network: 'GitHub', username: 'alexmorgan', url: 'https://github.com/alexmorgan' },
      ],
    },
    work: [
      {
        name: 'Northwind Analytics',
        position: 'Senior Software Engineer',
        location: 'Austin, TX',
        startDate: '2021-03',
        endDate: '',
        highlights: [
          'Led a team of 6 engineers to rebuild the reporting platform in TypeScript and React, reducing page load time by 60%.',
          'Designed an event-driven ingestion pipeline on AWS (Kinesis, Lambda) processing 40M events per day with 99.95% uptime.',
          'Cut monthly cloud spend by 35% ($48K/year) by right-sizing services and introducing autoscaling.',
          'Mentored 4 junior engineers; two were promoted within 18 months.',
        ],
      },
      {
        name: 'Brightline Software',
        position: 'Software Engineer',
        location: 'Remote',
        startDate: '2018-06',
        endDate: '2021-02',
        highlights: [
          'Built REST and GraphQL APIs in Python (Django) serving 1,200 requests per second.',
          'Introduced automated testing and CI/CD with GitHub Actions, raising test coverage from 30% to 85%.',
          'Delivered a customer self-service portal that reduced support tickets by 25%.',
        ],
      },
    ],
    education: [
      {
        institution: 'University of Texas at Austin',
        studyType: 'B.S.',
        area: 'Computer Science',
        startDate: '2014-08',
        endDate: '2018-05',
        score: '3.7 GPA',
        courses: ['Distributed Systems', 'Databases', 'Algorithms'],
      },
    ],
    projects: [
      {
        name: 'OpenBudget',
        description: 'Open-source personal finance tracker',
        url: 'https://github.com/alexmorgan/openbudget',
        highlights: [
          'Grew to 3,000+ GitHub stars and 40 contributors.',
          'Implemented offline-first sync using IndexedDB and CRDTs.',
        ],
        keywords: ['TypeScript', 'React', 'IndexedDB'],
      },
    ],
    skills: [
      { name: 'Languages', keywords: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'Go'] },
      { name: 'Frameworks', keywords: ['React', 'Node.js', 'Django', 'FastAPI'] },
      { name: 'Cloud & Tools', keywords: ['AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'GitHub Actions'] },
    ],
    certificates: [
      { name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', date: '2022-09' },
    ],
    awards: [],
    languages: [
      { language: 'English', fluency: 'Native' },
      { language: 'Spanish', fluency: 'Professional working proficiency' },
    ],
    meta: {
      coverLetter: {
        recipientName: 'Ms. Jordan Lee',
        recipientTitle: 'Director of Engineering',
        company: 'Lumen Labs',
        address: '400 Congress Ave\nAustin, TX 78701',
        role: 'Staff Software Engineer',
        body: [
          "I am excited to apply for the Staff Software Engineer role at Lumen Labs. Your work making clinical data easier to act on is exactly the kind of problem I enjoy, and I believe my experience building reliable, high-volume data platforms would let me contribute from day one.",
          'At Northwind Analytics I led a team of six engineers to rebuild our reporting platform, cutting page load times by 60%. I also designed an event-driven pipeline that now processes 40 million events a day at 99.95% uptime, and reduced our cloud spend by 35% through right-sizing and autoscaling.',
          "Beyond the technical work, I care about growing the people around me. I have mentored four engineers, two of whom were promoted within 18 months, and I enjoy turning ambiguous goals into clear, incremental plans that a team can ship with confidence.",
          'I would welcome the chance to discuss how I can help Lumen Labs scale its platform. Thank you for your time and consideration.',
        ].join('\n\n'),
      },
    },
  });
}
