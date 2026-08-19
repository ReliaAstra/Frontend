export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Engineering' | 'Insight' | 'Guide';
  date: string;
  readTime: string;
  author: { name: string; title: string; initials: string };
  gradient: string;
  content: string[];
}

const FOUNDER = { name: 'Emmanuel Osei', title: 'Founder & CEO', initials: 'EO' };

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-we-correlated-a-12k-aws-outage-in-23-seconds',
    title: 'What Independent Correlation Is For',
    excerpt: 'Why Reliastra treats vendor checks, your incidents, and timestamps as one record instead of three screenshots.',
    category: 'Engineering',
    date: 'Aug 8, 2025',
    readTime: '5 min read',
    author: FOUNDER,
    gradient: 'from-cyan-600 to-teal-500',
    content: [
      'When a checkout flow fails, the first question is rarely “is HTTP 500 happening?” It is “is this us, or a vendor?” Status pages, internal APM, and Slack threads each hold a slice of the answer. None of them is designed to be evidence.',
      'Reliastra’s job is narrower than a full observability suite. We independently check the endpoints you depend on, keep a timestamped history, and attach that history to incidents so you can show what we observed from outside your stack.',
      'We do not claim to detect every outage faster than a vendor, and we do not invent credit amounts. The product is the independent record: what we requested, when, from where, and what came back.',
      'If you are evaluating Reliastra, start with a vendor you already know is flaky. Compare our public tracking page with the vendor’s status page for a week. That comparison is more honest than any case-study number.',
    ],
  },
  {
    slug: 'why-vendor-status-pages-cant-be-trusted',
    title: 'Why Vendor Status Pages Are Not Evidence',
    excerpt: 'Status pages are communication tools owned by the same organization that is on fire. Treat them as context, not proof.',
    category: 'Insight',
    date: 'Jul 22, 2025',
    readTime: '5 min read',
    author: FOUNDER,
    gradient: 'from-violet-600 to-purple-500',
    content: [
      'Every major SaaS vendor operates a status page. Those pages are useful. They are also written, delayed, and severity-labeled by the vendor. That is a structural conflict of interest, not a conspiracy.',
      'During an incident, the people who would update the page are usually fixing production. Updates lag. Severity starts as “degraded” because no one wants to declare an outage they might walk back. Downstream teams still have customers waiting.',
      'Independent checks do not replace the vendor’s page. They give you a second clock: requests you control, from infrastructure the vendor does not operate, with timestamps you can keep.',
      'Use both. The status page tells you the vendor’s narrative. Independent measurements tell you what a third party observed. Reliastra is built for the second of those.',
    ],
  },
  {
    slug: 'the-complete-guide-to-sla-evidence-generation',
    title: 'What Belongs in an SLA Evidence Pack',
    excerpt: 'A practical checklist for timestamped measurements, methodology, and claims you can actually defend.',
    category: 'Guide',
    date: 'Jul 10, 2025',
    readTime: '5 min read',
    author: FOUNDER,
    gradient: 'from-amber-500 to-orange-500',
    content: [
      'An SLA is only as useful as the evidence behind a claim. If you cannot show when the service was unavailable, from where you measured it, and how that maps to the contract, credits are optional.',
      'A defensible pack usually includes: a baseline of normal latency and error rates, the window of deviation, the check interval and regions, and the vendor’s published commitment. Methodology matters as much as the chart. Vendors often dispute how you measured, not whether something felt broken.',
      'Reliastra automates collection of independent observations. We do not guarantee that a vendor will pay a credit. Credit decisions sit with the vendor and the contract you signed.',
      'If you already file claims by hand, keep your process. Use Reliastra as the timestamped appendix, not as a substitute for reading the SLA.',
    ],
  },
];
