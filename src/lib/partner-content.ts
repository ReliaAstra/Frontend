export const partnerAudience = [
  'Consultants',
  'Agencies',
  'MSPs',
  'Engineers',
  'Founders',
  'Communities',
  'Creators',
] as const;

export const partnerAccessComparison = {
  yours: [
    'Client relationships',
    'Professional trust',
    'Qualified introductions',
    'Community access',
    'Industry context',
  ],
  reliastra: [
    'External dependency intelligence',
    'Independent evidence layer',
    'Attribution infrastructure',
    'Recurring commercial model',
    'Operational product support',
  ],
};

export const participantCategories = [
  {
    title: 'Consultants',
    description: 'Recommend RELIASTRA to clients who depend on third-party infrastructure.',
    icon: 'briefcase',
    hint: 'Advisory relationships → qualified accounts',
  },
  {
    title: 'Agencies',
    description: 'Add RELIASTRA to client infrastructure, operations, and reliability engagements.',
    icon: 'building',
    hint: 'Projects → recurring customer value',
  },
  {
    title: 'MSPs',
    description: 'Extend external dependency visibility across managed environments.',
    icon: 'server',
    hint: 'Managed environments → ongoing monitoring',
  },
  {
    title: 'Developers & Engineers',
    description: 'Introduce RELIASTRA to teams in your professional network.',
    icon: 'code',
    hint: 'Peer trust → informed introductions',
  },
  {
    title: 'Creators & Educators',
    description: 'Publish technical content that reaches qualified users with real infrastructure problems.',
    icon: 'pen-tool',
    hint: 'Technical content → qualified demand',
  },
  {
    title: 'Communities & Newsletters',
    description: 'Give members a practical infrastructure tool they can actually use.',
    icon: 'users',
    hint: 'Curated audiences → relevant distribution',
  },
  {
    title: 'Founders',
    description: 'Recommend RELIASTRA to other technical founders and operators.',
    icon: 'rocket',
    hint: 'Founder networks → direct buyer access',
  },
  {
    title: 'Sales Professionals',
    description: 'Introduce qualified companies when you already know the buying context.',
    icon: 'handshake',
    hint: 'Qualified pipeline → outcome-based economics',
  },
] as const;

export const economicModelStages = [
  { label: 'Visitor', payout: 'No payout', state: 'observe' },
  { label: 'Signup', payout: 'No payout', state: 'observe' },
  { label: 'Activated', payout: 'Tracked', state: 'track' },
  { label: 'Qualified customer', payout: 'Commission begins', state: 'qualified' },
] as const;

export const earningMethods = [
  {
    title: 'Refer',
    subtitle: 'Simple entry point',
    description: 'Share RELIASTRA with companies already in your network.',
    payout: '20% recurring',
    depth: 'simple',
  },
  {
    title: 'Deploy',
    subtitle: 'More involved',
    description: 'Help a customer implement RELIASTRA as part of an engagement.',
    payout: 'Up to 30% recurring',
    depth: 'involved',
  },
  {
    title: 'Introduce',
    subtitle: 'Qualified handoff',
    description: 'Send a qualified lead for RELIASTRA to handle directly.',
    payout: 'Earn when it converts',
    depth: 'involved',
  },
  {
    title: 'Create',
    subtitle: 'Technical content',
    description: 'Publish useful technical content that brings the right users.',
    payout: 'Performance-based',
    depth: 'partner',
  },
  {
    title: 'Resell',
    subtitle: 'Deeper partnership',
    description: 'Manage RELIASTRA for clients under a wholesale-style model where available.',
    payout: 'Wholesale margin',
    depth: 'partner',
  },
] as const;

export const lifecycleSteps = [
  {
    number: '01',
    title: 'Join',
    description: 'Create your Partner profile and tell us how you reach the teams we serve.',
  },
  {
    number: '02',
    title: 'Share',
    description: 'Get your RELIASTRA referral path and approved positioning resources.',
  },
  {
    number: '03',
    title: 'Introduce',
    description: 'Bring the right companies into RELIASTRA through referrals, content, or client work.',
  },
  {
    number: '04',
    title: 'Earn',
    description: 'Qualified customer revenue creates recurring partner economics.',
  },
] as const;

export const longLifecycle = [
  'Join',
  'Get your link',
  'Share / introduce',
  'Customer activates',
  'Customer pays',
  'You earn',
] as const;

export const scenarios = [
  {
    title: 'A DevOps Consultant',
    description:
      'A consultant supports infrastructure for twelve SaaS companies and recommends RELIASTRA where dependency evidence matters.',
    result: '1 relationship → multiple qualified accounts → recurring partner revenue',
  },
  {
    title: 'An MSP',
    description:
      'An MSP adds RELIASTRA to a dependency monitoring stack across managed customer environments.',
    result: 'Managed environments → external dependency visibility → retained customer value',
  },
  {
    title: 'A Technical Creator',
    description:
      'A creator publishes practical content like “How to prove a vendor caused your outage” and links to RELIASTRA.',
    result: 'Technical trust → qualified demand → performance-based earnings',
  },
  {
    title: 'A Community',
    description:
      'A DevOps or SaaS operations community shares RELIASTRA as a practical infrastructure resource.',
    result: 'Curated audience → relevant product discovery → higher-quality introductions',
  },
] as const;

export const maturityLadder = [
  { title: 'Referrer', status: 'Available now' },
  { title: 'Partner', status: 'Available now' },
  { title: 'Certified Partner', status: 'As the network grows' },
  { title: 'Agency / Implementation', status: 'As the network grows' },
  { title: 'Strategic Partner', status: 'Selective' },
] as const;

export const faqItems = [
  {
    id: 'who-can-become-a-partner',
    question: 'Who can become a RELIASTRA partner?',
    answer:
      'People and organizations with credible access to RELIASTRA’s ideal customers: consultants, agencies, MSPs, engineers, creators, communities, founders, and other qualified introducers.',
  },
  {
    id: 'do-i-need-a-large-audience',
    question: 'Do I need a large audience?',
    answer:
      'No. RELIASTRA values qualified access more than raw reach. A small set of relevant customer relationships can be more valuable than a large generic audience.',
  },
  {
    id: 'do-i-need-to-be-a-technical-creator',
    question: 'Do I need to be a technical creator?',
    answer:
      'No. Content is only one path. Many partners participate through consulting, agency work, managed services, or direct introductions.',
  },
  {
    id: 'how-do-referrals-work',
    question: 'How do referrals work?',
    answer:
      'Partners receive an attribution path or referral identity. When a qualified customer activates and converts under program terms, the referral is credited to the partner.',
  },
  {
    id: 'when-do-commissions-begin',
    question: 'When do commissions begin?',
    answer:
      'RELIASTRA rewards qualified customer outcomes. Commissions begin when the referred customer reaches the qualifying commercial stage defined by the program.',
  },
  {
    id: 'do-clicks-or-signups-earn-money',
    question: 'Do clicks or signups earn money?',
    answer:
      'No. The network is designed around qualified customer outcomes rather than traffic volume, impressions, or low-intent signups.',
  },
  {
    id: 'can-agencies-and-consultants-participate',
    question: 'Can agencies and consultants participate?',
    answer:
      'Yes. Agencies, consultants, and MSPs are central to the network because they often already advise the exact teams RELIASTRA needs to reach.',
  },
  {
    id: 'can-i-refer-clients-i-already-work-with',
    question: 'Can I refer clients I already work with?',
    answer:
      'In many cases, yes—provided the account is eligible under program terms and attribution rules. The application process is the right place to describe your client model.',
  },
  {
    id: 'can-i-use-reliastra-for-multiple-client-organizations',
    question: 'Can I use RELIASTRA for multiple client organizations?',
    answer:
      'RELIASTRA is designed for teams managing multiple environments and client contexts. Eligibility for partner economics depends on the relationship model and program terms.',
  },
  {
    id: 'how-does-attribution-work',
    question: 'How does RELIASTRA attribute referrals?',
    answer:
      'Attribution is handled through partner-specific links or referral identity, with qualification determined by backend rules and customer conversion state.',
  },
  {
    id: 'can-i-become-an-implementation-partner',
    question: 'Can I become an implementation partner?',
    answer:
      'Yes. Implementation and deeper partnership models are part of the network direction, with broader availability expanding as the program grows.',
  },
  {
    id: 'what-if-company-already-uses-reliastra',
    question: 'What happens if a referred company already uses RELIASTRA?',
    answer:
      'Existing customer relationships are handled by attribution and eligibility rules. If you are working with an existing customer, describe that context in your application.',
  },
] as const;

export const fallbackResources = [
  {
    category: 'Product',
    title: 'What RELIASTRA does',
    description: 'Understand the Track → Correlate → Prove workflow behind external dependency intelligence.',
    href: '/#solution',
    cta: 'Explore product overview',
  },
  {
    category: 'Sales',
    title: 'How to introduce RELIASTRA',
    description: 'Use clear positioning around dependency evidence, vendor behavior, and qualified infrastructure teams.',
    href: '/partner/how-it-works',
    cta: 'Review the partner workflow',
  },
  {
    category: 'Technical',
    title: 'Vendor Intelligence',
    description: 'Show live public vendor intelligence to anchor conversations in a real operational problem.',
    href: '/track',
    cta: 'See live vendor data',
  },
  {
    category: 'Content',
    title: 'Approved talking points',
    description: 'Focus on evidence, correlation, and customer qualification rather than hype or generic uptime claims.',
    href: '/partner/earn',
    cta: 'See the earning narrative',
  },
  {
    category: 'Brand',
    title: 'RELIASTRA brand context',
    description: 'Keep the Partner Network connected to the main RELIASTRA product story and brand system.',
    href: '/about',
    cta: 'Read company context',
  },
] as const;
