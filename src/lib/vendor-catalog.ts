/**
 * Static vendor catalogue.
 *
 * This drives `generateStaticParams` for /track/[vendor], the sitemap, and the
 * SLA credit calculator. Live measurements are still fetched client-side from
 * the Reliastra API — everything here is public, verifiable reference data
 * (published SLA documents), never a measured claim.
 */

export interface SlaTier {
  /** Monthly uptime commitment, e.g. 99.9 */
  commitment: number;
  /** Credit schedule: applied when observed uptime is below `below`. */
  schedule: { below: number; atLeast: number | null; creditPercent: number }[];
}

export interface CatalogVendor {
  slug: string;
  name: string;
  category: string;
  /** Category-derived accent colour used across the UI. */
  color: string;
  /** One-line description of what the vendor provides. */
  summary: string;
  /** Homepage / canonical URL for Organization JSON-LD. */
  url: string;
  /** Vendor's own public status page, linked as context (not evidence). */
  statusPage?: string;
  /** Endpoint families Reliastra observes for this vendor. */
  observes: string[];
  /** Published SLA reference, when the vendor publishes one publicly. */
  sla?: {
    /** Label of the plan/product the schedule applies to. */
    productLabel: string;
    /** URL of the published SLA document. */
    documentUrl: string;
    tiers: SlaTier[];
    /** Window in days to submit a claim, per the published document. */
    claimWindowDays: number;
    notes: string;
  };
}

/** Standard "10 / 25 / 100" cloud schedule used by several providers. */
function schedule102510(commitment: number): SlaTier {
  return {
    commitment,
    schedule: [
      { below: commitment, atLeast: 99.0, creditPercent: 10 },
      { below: 99.0, atLeast: 95.0, creditPercent: 25 },
      { below: 95.0, atLeast: null, creditPercent: 100 },
    ],
  };
}

/** Google Cloud style schedule, capped at 50%. */
function scheduleGoogle(commitment: number): SlaTier {
  return {
    commitment,
    schedule: [
      { below: commitment, atLeast: 99.0, creditPercent: 10 },
      { below: 99.0, atLeast: 95.0, creditPercent: 25 },
      { below: 95.0, atLeast: null, creditPercent: 50 },
    ],
  };
}

export const VENDOR_CATALOG: CatalogVendor[] = [
  {
    slug: 'stripe',
    name: 'Stripe',
    category: 'payments',
    color: '#635BFF',
    summary: 'Payments, billing and financial infrastructure APIs.',
    url: 'https://stripe.com',
    statusPage: 'https://status.stripe.com',
    observes: ['api.stripe.com core API', 'Checkout availability', 'Webhook delivery endpoints'],
  },
  {
    slug: 'aws',
    name: 'AWS',
    category: 'infrastructure',
    color: '#FF9900',
    summary: 'Compute, storage, networking and managed services.',
    url: 'https://aws.amazon.com',
    statusPage: 'https://health.aws.amazon.com/health/status',
    observes: ['Regional API endpoints', 'S3 request paths', 'Public service health signals'],
    sla: {
      productLabel: 'AWS Lambda (per-region monthly uptime)',
      documentUrl: 'https://aws.amazon.com/lambda/sla/',
      tiers: [schedule102510(99.95)],
      claimWindowDays: 30,
      notes:
        'AWS publishes a separate SLA per service. Lambda commits to 99.95% monthly uptime per region with a 10% / 25% / 100% credit schedule; EC2 region-level uses 99.99% with 10% / 30% / 100%. Always check the SLA for the specific service you are claiming against.',
    },
  },
  {
    slug: 'gcp',
    name: 'Google Cloud',
    category: 'infrastructure',
    color: '#4285F4',
    summary: 'Google Cloud Platform compute, data and networking services.',
    url: 'https://cloud.google.com',
    statusPage: 'https://status.cloud.google.com',
    observes: ['Regional API endpoints', 'Cloud Storage request paths', 'Public status signals'],
    sla: {
      productLabel: 'Compute Engine / App Engine (monthly uptime)',
      documentUrl: 'https://cloud.google.com/compute/sla',
      tiers: [scheduleGoogle(99.95)],
      claimWindowDays: 30,
      notes:
        'Google Cloud financial credits are capped: the aggregate credit for a single billing month will not exceed 50% of the amount due for the affected covered service that month.',
    },
  },
  {
    slug: 'azure',
    name: 'Microsoft Azure',
    category: 'infrastructure',
    color: '#0078D4',
    summary: 'Microsoft cloud compute, identity and data services.',
    url: 'https://azure.microsoft.com',
    statusPage: 'https://azure.status.microsoft/status',
    observes: ['Regional service endpoints', 'Identity endpoints', 'Public status signals'],
    sla: {
      productLabel: 'Most Azure services (monthly uptime)',
      documentUrl:
        'https://www.microsoft.com/licensing/docs/view/Service-Level-Agreements-SLA-for-Online-Services',
      tiers: [
        {
          commitment: 99.9,
          schedule: [
            { below: 99.9, atLeast: 99.0, creditPercent: 10 },
            { below: 99.0, atLeast: 95.0, creditPercent: 25 },
            { below: 95.0, atLeast: null, creditPercent: 100 },
          ],
        },
      ],
      claimWindowDays: 30,
      notes:
        'Azure credit schedules vary by service and by SLA version in force at the time of the incident. Some services (for example Entra ID) publish a 99.99% tier. Check the dated SLA document that applied during the affected month.',
    },
  },
  {
    slug: 'cloudflare',
    name: 'Cloudflare',
    category: 'cdn',
    color: '#F48120',
    summary: 'CDN, DNS, WAF and edge compute.',
    url: 'https://www.cloudflare.com',
    statusPage: 'https://www.cloudflarestatus.com',
    observes: ['Edge POP reachability', 'DNS resolution', 'Public API endpoints'],
  },
  {
    slug: 'openai',
    name: 'OpenAI',
    category: 'ai',
    color: '#10A37F',
    summary: 'Model inference APIs for text, vision and embeddings.',
    url: 'https://openai.com',
    statusPage: 'https://status.openai.com',
    observes: ['api.openai.com chat completions', 'Embeddings endpoint', 'Error-rate signals'],
  },
  {
    slug: 'twilio',
    name: 'Twilio',
    category: 'communications',
    color: '#F22F46',
    summary: 'Programmable messaging, voice and verification APIs.',
    url: 'https://www.twilio.com',
    statusPage: 'https://status.twilio.com',
    observes: ['Messaging API', 'Voice API', 'Verify endpoints'],
    sla: {
      productLabel: 'Twilio Services APIs',
      documentUrl: 'https://www.twilio.com/en-us/legal/service-level-agreement/twilio-apis',
      tiers: [
        {
          commitment: 99.95,
          schedule: [{ below: 99.95, atLeast: null, creditPercent: 10 }],
        },
      ],
      claimWindowDays: 30,
      notes:
        'Twilio publishes a flat 10% API service credit when monthly availability falls below the applicable threshold (99.95% standard, 99.99% on Enterprise Edition), rather than a tiered schedule.',
    },
  },
  {
    slug: 'auth0',
    name: 'Auth0',
    category: 'auth',
    color: '#EB5424',
    summary: 'Identity, authentication and authorization as a service.',
    url: 'https://auth0.com',
    statusPage: 'https://status.auth0.com',
    observes: ['Token endpoint', 'Authorize endpoint', 'Management API'],
  },
  {
    slug: 'sendgrid',
    name: 'SendGrid',
    category: 'email',
    color: '#1A82E2',
    summary: 'Transactional and marketing email delivery.',
    url: 'https://sendgrid.com',
    statusPage: 'https://status.sendgrid.com',
    observes: ['Mail send API', 'Event webhook delivery'],
  },
  {
    slug: 'github',
    name: 'GitHub',
    category: 'developer',
    color: '#24292F',
    summary: 'Source hosting, CI runners and package registries.',
    url: 'https://github.com',
    statusPage: 'https://www.githubstatus.com',
    observes: ['REST API', 'Git operations endpoint', 'Actions availability signals'],
  },
  {
    slug: 'vercel',
    name: 'Vercel',
    category: 'hosting',
    color: '#0891B2',
    summary: 'Frontend hosting, edge network and serverless functions.',
    url: 'https://vercel.com',
    statusPage: 'https://www.vercel-status.com',
    observes: ['Edge network reachability', 'Deployment API', 'Serverless invocation paths'],
  },
  {
    slug: 'datadog',
    name: 'Datadog',
    category: 'monitoring',
    color: '#632CA6',
    summary: 'Observability platform for metrics, traces and logs.',
    url: 'https://www.datadoghq.com',
    statusPage: 'https://status.datadoghq.com',
    observes: ['Intake API', 'Public API endpoints'],
  },
];

export const VENDOR_SLUGS = VENDOR_CATALOG.map((v) => v.slug);

export function getVendor(slug: string): CatalogVendor | undefined {
  return VENDOR_CATALOG.find((v) => v.slug === slug.toLowerCase());
}

/** Vendors with a published SLA schedule — the calculator's selectable set. */
export const SLA_VENDORS = VENDOR_CATALOG.filter((v) => v.sla);

/** Title-cases an unknown slug so unlisted vendors still render sensibly. */
export function vendorLabel(slug: string): string {
  const known = getVendor(slug);
  if (known) return known.name;
  return slug
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const CATEGORY_COLORS: Record<string, string> = {
  payments: '#635BFF',
  auth: '#EB5424',
  identity: '#EB5424',
  cdn: '#F48120',
  ai: '#10A37F',
  communications: '#F22F46',
  infrastructure: '#F6821F',
  hosting: '#0891B2',
  database: '#007AF5',
  monitoring: '#6C5CE7',
  email: '#1A82E2',
  developer: '#24292F',
};
