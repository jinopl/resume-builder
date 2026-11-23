import { JSON_RESUME_SCHEMA_URL, ResumeSchema, type Resume } from '../schema/resume';
import type { ExampleKind } from '../store/useResumeStore';

/** Fictional examples shown on first visit, so the preview isn't empty. */
export function sampleResume(kind: ExampleKind = 'experienced'): Resume {
  return ResumeSchema.parse(kind === 'fresher' ? FRESHER : EXPERIENCED);
}

const EXPERIENCED = {
  $schema: JSON_RESUME_SCHEMA_URL,
  basics: {
    name: 'Rohan Iyer',
    label: 'Senior Software Engineer',
    email: 'rohan.iyer@example.com',
    phone: '+91 98450 12345',
    url: 'https://rohaniyer.dev',
    summary:
      'Software engineer with 7 years of experience building reliable web platforms and data pipelines. Led teams of up to 6 engineers, cut infrastructure costs by 35%, and shipped products used by 2M+ customers. Comfortable across the stack, strongest in TypeScript, Python and cloud architecture.',
    location: { city: 'Bengaluru', region: 'Karnataka', countryCode: 'IN' },
    profiles: [
      { network: 'LinkedIn', username: 'rohaniyer', url: 'https://linkedin.com/in/rohaniyer' },
      { network: 'GitHub', username: 'rohaniyer', url: 'https://github.com/rohaniyer' },
    ],
  },
  work: [
    {
      name: 'Northwind Analytics',
      position: 'Senior Software Engineer',
      location: 'Bengaluru',
      startDate: '2021-03',
      endDate: '',
      highlights: [
        'Led a team of 6 engineers to rebuild the reporting platform in TypeScript and React, reducing page load time by 60%.',
        'Designed an event-driven ingestion pipeline on AWS (Kinesis, Lambda) processing 40M events per day with 99.95% uptime.',
        'Cut monthly cloud spend by 35% (Rs 40 lakh a year) by right-sizing services and introducing autoscaling.',
        'Mentored 4 junior engineers; two were promoted within 18 months.',
      ],
    },
    {
      name: 'Brightline Software',
      position: 'Software Engineer',
      location: 'Pune',
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
      institution: 'NIT Tiruchirappalli',
      studyType: 'B.Tech',
      area: 'Computer Science and Engineering',
      startDate: '2014-07',
      endDate: '2018-05',
      score: '8.4 CGPA',
      courses: ['Distributed Systems', 'Databases', 'Algorithms'],
    },
  ],
  projects: [
    {
      name: 'OpenBudget',
      description: 'Open-source personal finance tracker',
      url: 'https://github.com/rohaniyer/openbudget',
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
    { language: 'English', fluency: 'Fluent' },
    { language: 'Hindi', fluency: 'Fluent' },
    { language: 'Tamil', fluency: 'Native' },
  ],
  meta: {
    coverLetter: {
      recipientName: 'Ms. Anita Rao',
      recipientTitle: 'Director of Engineering',
      company: 'Lumen Labs',
      address: '12 MG Road\nBengaluru 560001',
      role: 'Staff Software Engineer',
      body: [
        'I am excited to apply for the Staff Software Engineer role at Lumen Labs. Your work making clinical data easier to act on is exactly the kind of problem I enjoy, and I believe my experience building reliable, high-volume data platforms would let me contribute from day one.',
        'At Northwind Analytics I led a team of six engineers to rebuild our reporting platform, cutting page load times by 60%. I also designed an event-driven pipeline that now processes 40 million events a day at 99.95% uptime, and reduced our cloud spend by 35% through right-sizing and autoscaling.',
        'Beyond the technical work, I care about growing the people around me. I have mentored four engineers, two of whom were promoted within 18 months, and I enjoy turning ambiguous goals into clear, incremental plans that a team can ship with confidence.',
        'I would welcome the chance to discuss how I can help Lumen Labs scale its platform. Thank you for your time and consideration.',
      ].join('\n\n'),
    },
  },
};

const FRESHER = {
  $schema: JSON_RESUME_SCHEMA_URL,
  basics: {
    name: 'Sneha Kulkarni',
    label: 'Data Analyst (Fresher)',
    email: 'sneha.kulkarni@example.com',
    phone: '+91 98220 54321',
    summary:
      'Final-year Computer Engineering student with hands-on experience in Python, SQL and Power BI from an analytics internship and data projects. Built a sales dashboard now used weekly by a 12-person team. Looking for an entry-level data analyst role where I can turn data into clear decisions.',
    location: { city: 'Pune', region: 'Maharashtra', countryCode: 'IN' },
    profiles: [
      { network: 'LinkedIn', username: 'snehakulkarni', url: 'https://linkedin.com/in/snehakulkarni' },
      { network: 'GitHub', username: 'snehak', url: 'https://github.com/snehak' },
    ],
  },
  work: [
    {
      name: 'Finlytics Pvt. Ltd.',
      position: 'Data Analyst Intern',
      location: 'Pune',
      startDate: '2025-05',
      endDate: '2025-07',
      highlights: [
        'Built a Power BI sales dashboard from 3 data sources, now used weekly by a 12-person sales team.',
        'Automated a monthly Excel report with Python (pandas), cutting preparation time from 6 hours to 20 minutes.',
        'Cleaned and merged 50,000+ customer records, removing 8% duplicates before a CRM migration.',
      ],
    },
  ],
  education: [
    {
      institution: 'Savitribai Phule Pune University',
      studyType: 'B.E.',
      area: 'Computer Engineering',
      startDate: '2022-08',
      endDate: '2026-05',
      score: '8.6 CGPA',
      courses: ['Database Management Systems', 'Statistics', 'Machine Learning'],
    },
    {
      institution: 'Fergusson College, Pune',
      studyType: 'Class XII (HSC)',
      area: 'Science',
      endDate: '2022',
      score: '91%',
    },
  ],
  projects: [
    {
      name: 'Pune Air Quality Tracker',
      description: 'Dashboard of daily AQI across 10 city stations',
      url: 'https://github.com/snehak/pune-aqi',
      highlights: [
        'Collected 2 years of public AQI data with Python and visualised trends in Power BI.',
        'Found that weekday traffic hours raise PM2.5 by 30%; presented the findings at a college seminar.',
      ],
      keywords: ['Python', 'pandas', 'Power BI'],
    },
  ],
  skills: [
    { name: 'Data & Analysis', keywords: ['SQL', 'Python', 'pandas', 'Excel', 'Statistics'] },
    { name: 'Visualisation', keywords: ['Power BI', 'Tableau', 'Matplotlib'] },
    { name: 'Tools', keywords: ['Git', 'Jupyter', 'Google Sheets'] },
  ],
  certificates: [
    { name: 'Google Data Analytics Professional Certificate', issuer: 'Coursera', date: '2025-01' },
  ],
  awards: [
    { title: 'Winner, inter-college data hackathon (120 teams)', awarder: 'Computer Society student chapter', date: '2024-09' },
  ],
  languages: [
    { language: 'English', fluency: 'Fluent' },
    { language: 'Marathi', fluency: 'Native' },
    { language: 'Hindi', fluency: 'Fluent' },
  ],
  meta: {
    // Freshers lead with education and projects.
    sectionOrder: ['summary', 'education', 'projects', 'work', 'skills', 'certificates', 'awards', 'languages'],
    coverLetter: {
      recipientName: 'Mr. Vikram Shah',
      recipientTitle: 'Analytics Manager',
      company: 'Lumen Labs',
      address: 'Baner Road\nPune 411045',
      role: 'Graduate Data Analyst',
      body: [
        'I am writing to apply for the Graduate Data Analyst role at Lumen Labs. I will complete my B.E. in Computer Engineering in May 2026, and the chance to work on healthcare data that affects real decisions is what draws me to your team.',
        'During my internship at Finlytics I built a Power BI sales dashboard that a 12-person team now uses every week, and automated a monthly report with Python, cutting its preparation from 6 hours to 20 minutes. In my own project I analysed two years of Pune air-quality data, which taught me to ask a clear question before touching the data.',
        'I learn quickly, enjoy explaining numbers to people who are not analysts, and am comfortable with SQL, Python and Power BI.',
        'I would be glad to talk about how I could contribute to Lumen Labs. Thank you for considering my application.',
      ].join('\n\n'),
    },
  },
};
