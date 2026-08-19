/**
 * Educational concept pages under /docs/concepts.
 *
 * Content is written as reference material: definitions, procedures and worked
 * arithmetic. Where a number comes from a published SLA document it is cited
 * with a source link. Nothing here describes measured Reliastra performance.
 */

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string; id: string }
  | { type: 'h3'; text: string; id: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'callout'; variant: 'info' | 'warn'; title: string; text: string }
  | { type: 'code'; language: string; caption?: string; code: string }
  | { type: 'table'; caption?: string; head: string[]; rows: string[][] }
  | { type: 'diagram'; name: 'correlation' | 'claim-flow' | 'observation' }
  | { type: 'faq'; items: { q: string; a: string }[] };

export interface Concept {
  slug: string;
  title: string;
  /** Nav label, shorter than the title. */
  navLabel: string;
  /** One-sentence TLDR shown in the callout at the top. */
  tldr: string;
  description: string;
  /** ISO date. */
  datePublished: string;
  dateModified: string;
  readTime: string;
  /** Ordering weight in the sidebar. */
  order: number;
  blocks: Block[];
  related: string[];
}

export const CONCEPTS: Concept[] = [
  {
    slug: 'what-is-vendor-sla-tracking',
    title: 'What is vendor SLA tracking?',
    navLabel: 'Vendor SLA tracking',
    order: 1,
    readTime: '7 min read',
    datePublished: '2025-08-12',
    dateModified: '2025-08-12',
    tldr: 'Vendor SLA tracking is the practice of independently measuring the third-party services you depend on, so that availability claims can be verified rather than assumed.',
    description:
      'A practical definition of vendor SLA tracking: what it measures, why an independent observer matters, how it differs from uptime monitoring, and what a usable observation record contains.',
    blocks: [
      {
        type: 'p',
        text: 'Almost every production system depends on services it does not operate — payments, authentication, email delivery, CDN, model inference, managed databases. Each of those services publishes a Service Level Agreement that commits to some monthly availability figure and specifies a remedy, usually a service credit, when the commitment is missed.',
      },
      {
        type: 'p',
        text: 'Vendor SLA tracking is the practice of maintaining your own measurement of whether those commitments were met. It is deliberately separate from the vendor\u2019s own reporting, because a commitment measured only by the party who made it is not independently verifiable.',
      },
      { type: 'h2', id: 'why-independent', text: 'Why the observer has to be independent' },
      {
        type: 'p',
        text: 'Three sources are usually available after an incident, and each has a structural limitation.',
      },
      {
        type: 'ul',
        items: [
          'The vendor status page is a communication artefact published by the organisation whose service failed. It is useful context, and it is frequently updated after the fact rather than during the window that matters to you.',
          'Your internal monitoring sits inside the environment that was also affected. When your own infrastructure is degraded, its record of a vendor is easy for that vendor to attribute to your side of the connection.',
          'Your application logs record symptoms — timeouts, 5xx responses, retries — but rarely capture the origin, timing granularity and response metadata that a claim needs.',
        ],
      },
      {
        type: 'p',
        text: 'An independent observer resolves this. Checks originate from infrastructure controlled by neither party, on a fixed schedule, and continue whether or not anyone has declared an incident. That last property matters more than it first appears: the record exists before you knew you needed it.',
      },
      { type: 'diagram', name: 'observation' },
      { type: 'h2', id: 'vs-uptime-monitoring', text: 'How this differs from uptime monitoring' },
      {
        type: 'p',
        text: 'The underlying primitive is the same — an HTTP request on a schedule. The difference is what happens to the result.',
      },
      {
        type: 'table',
        caption: 'Uptime monitoring compared with vendor SLA tracking',
        head: ['Dimension', 'Uptime monitoring', 'Vendor SLA tracking'],
        rows: [
          ['Subject', 'Your endpoints', 'Your dependencies'],
          ['Primary output', 'An alert', 'A retained, timestamped record'],
          ['Time horizon', 'Now', 'The full billing period'],
          ['Unit of analysis', 'A monitor', 'A vendor'],
          ['Consumer of the data', 'Your on-call engineer', 'Your vendor\u2019s support team'],
          ['Success criterion', 'You were notified quickly', 'The record survives scrutiny'],
        ],
      },
      { type: 'h2', id: 'what-to-record', text: 'What a usable observation record contains' },
      {
        type: 'p',
        text: 'A record that is going to be read by someone deciding whether to grant a credit needs to answer, for every single check, what was requested, when, from where, and what came back. Anything missing from that set becomes a question you cannot answer later.',
      },
      {
        type: 'code',
        language: 'json',
        caption: 'A single observation, with the fields a claim relies on',
        code: `{
  "vendor": "example-payments",
  "endpoint": "https://api.example.com/v1/charges",
  "observed_at": "2025-08-14T09:41:07.412Z",
  "region": "us-east-1",
  "request": { "method": "GET", "timeout_ms": 5000 },
  "response": {
    "status_code": 503,
    "latency_ms": 4998,
    "error": "upstream_timeout"
  },
  "is_up": false,
  "check_interval_seconds": 30
}`,
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Check interval sets your resolution',
        text: 'A monitor checking every five minutes cannot evidence a two-minute outage. If the SLA is measured in five-minute intervals, as many cloud SLAs are, your own sampling needs to be at least as fine or your figure will understate the downtime.',
      },
      { type: 'h2', id: 'measurement-mismatch', text: 'Your measurement will not match theirs' },
      {
        type: 'p',
        text: 'This is expected, and it is worth understanding before you file anything. Published SLAs define availability in specific terms — often the average availability across all five-minute intervals in a billing month, region by region, with a list of exclusions.',
      },
      {
        type: 'ul',
        items: [
          'Scheduled maintenance announced in advance is usually excluded from the calculation.',
          'Failures attributed to your configuration, your client, or the network between you and the provider are excluded.',
          'Many SLAs apply per region and per service, so a regional failure may not move a global figure.',
          'Some SLAs ignore degradation shorter than a minimum duration entirely.',
          'Elevated latency, as opposed to errors, is frequently not covered at all.',
        ],
      },
      {
        type: 'p',
        text: 'The point of your own record is not to replace the vendor\u2019s calculation. It is to give you a defensible position when the vendor\u2019s figure and your experience disagree, and to let you argue about a specific set of timestamps rather than a vague recollection.',
      },
      { type: 'h2', id: 'multi-region', text: 'Why one vantage point is not enough' },
      {
        type: 'p',
        text: 'A check from a single origin cannot distinguish a vendor failure from a network problem between that origin and the vendor. This is the most common way an otherwise reasonable claim gets dismissed: the vendor points out that only one location saw the failure.',
      },
      {
        type: 'p',
        text: 'Observing the same endpoint from several regions makes the distinction visible. If three regions record failures in the same window, a local network explanation is much harder to sustain. If only one does, you have learned something useful before you filed anything.',
      },
      { type: 'h2', id: 'getting-started', text: 'Where to start' },
      {
        type: 'ol',
        items: [
          'List the third-party services in your critical path — the ones where an outage is visible to your customers.',
          'For each, find the published SLA document and record the commitment, the credit schedule and the claim deadline.',
          'Identify a representative endpoint per vendor: something cheap to call, unauthenticated where possible, and genuinely representative of availability.',
          'Start observing on a fixed interval from more than one region, and retain every observation for at least one full billing period.',
          'When an incident occurs, capture the window immediately rather than reconstructing it later from logs.',
        ],
      },
      {
        type: 'faq',
        items: [
          {
            q: 'What is vendor SLA tracking?',
            a: 'Vendor SLA tracking is the practice of independently measuring the availability of third-party services you depend on, and retaining those measurements as a timestamped record, so that a provider\u2019s Service Level Agreement commitments can be verified rather than assumed.',
          },
          {
            q: 'Is vendor SLA tracking the same as uptime monitoring?',
            a: 'No. Uptime monitoring watches your own endpoints and its output is an alert. Vendor SLA tracking watches your dependencies and its output is a retained, timestamped record intended to be read by the vendor during a credit claim.',
          },
          {
            q: 'Why can I not rely on a vendor status page?',
            a: 'A status page is a communication artefact published by the organisation whose service failed. It is useful context, but it is operator-declared, often updated after the affected window, and not an independent measurement.',
          },
          {
            q: 'How often should vendor checks run?',
            a: 'At least as frequently as the interval the SLA uses for its own calculation. Many cloud SLAs average availability over five-minute intervals, so a check interval of 30 to 60 seconds gives you enough resolution to evidence short outages.',
          },
          {
            q: 'Do I need to observe from more than one region?',
            a: 'Yes, if the record needs to withstand scrutiny. A single origin cannot separate a vendor failure from a network problem on the path to that origin, and this is a common reason claims are dismissed.',
          },
        ],
      },
    ],
    related: ['how-to-claim-sla-credits', 'multi-region-outage-correlation'],
  },
  {
    slug: 'how-to-claim-sla-credits',
    title: 'How to claim SLA credits',
    navLabel: 'Claiming SLA credits',
    order: 2,
    readTime: '9 min read',
    datePublished: '2025-08-12',
    dateModified: '2025-08-12',
    tldr: 'SLA credits are almost never automatic — you calculate the shortfall, assemble timestamped evidence, and submit a claim within the provider\u2019s deadline, usually 30 days.',
    description:
      'A step-by-step procedure for claiming SLA credits from cloud and API vendors: reading the credit schedule, calculating the shortfall, assembling evidence, and submitting within the deadline.',
    blocks: [
      {
        type: 'p',
        text: 'A Service Level Agreement is a commitment with a penalty attached. The penalty is normally a service credit — a percentage of what you already paid the provider, applied against future bills. It is not compensation for your losses, and in nearly all cases it is not applied automatically. You have to ask, and you have to ask correctly, within a window.',
      },
      {
        type: 'callout',
        variant: 'warn',
        title: 'The deadline is the most common reason claims fail',
        text: 'Most major providers require the claim within 30 days of the affected billing period. Miss it and the entitlement is forfeited regardless of how strong the evidence is. Set a reminder the day an incident happens, not the day you get around to it.',
      },
      { type: 'h2', id: 'step-1', text: 'Step 1 — Read the SLA that applied at the time' },
      {
        type: 'p',
        text: 'SLAs are versioned and are updated regularly. The document that matters is the one in force during the affected month, not the one on the site today. Providers usually keep dated versions available; save a copy when you begin a claim.',
      },
      {
        type: 'p',
        text: 'From that document, extract four things: the availability commitment, the credit schedule, how availability is defined and measured, and the exclusions.',
      },
      {
        type: 'table',
        caption:
          'Representative published credit schedules. Always verify against the current document for your specific service — these vary by service and by version.',
        head: ['Provider / service', 'Commitment', 'Credit schedule', 'Source'],
        rows: [
          [
            'AWS Lambda (per region)',
            '99.95%',
            '10% below 99.95%, 25% below 99.0%, 100% below 95.0%',
            'aws.amazon.com/lambda/sla',
          ],
          [
            'AWS EC2 (region level)',
            '99.99%',
            '10% below 99.99%, 30% below 99.0%, 100% below 95.0%',
            'aws.amazon.com/compute/sla',
          ],
          [
            'Google Cloud Compute Engine',
            '99.95%',
            '10% below 99.95%, 25% below 99.0%, 50% below 95.0%',
            'cloud.google.com/compute/sla',
          ],
          [
            'Twilio Services APIs',
            '99.95%',
            'Flat 10% below the applicable threshold',
            'twilio.com/legal/service-level-agreement',
          ],
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Credits are capped, and often small',
        text: 'Google Cloud caps aggregate monthly credits at 50% of the affected service charge. AWS will not issue a credit below one dollar. A 10% credit on a $2,000 monthly spend is $200 — worth claiming, but it is a refund of part of your bill, never a recovery of your losses.',
      },
      { type: 'h2', id: 'step-2', text: 'Step 2 — Calculate the shortfall' },
      {
        type: 'p',
        text: 'Availability is expressed as a percentage of the billing month. Convert your observed downtime into that percentage and compare it against the commitment.',
      },
      {
        type: 'code',
        language: 'text',
        caption: 'Monthly uptime percentage',
        code: `minutes_in_month   = days_in_month × 24 × 60
uptime_percentage  = (minutes_in_month − downtime_minutes) / minutes_in_month × 100

Worked example — 30-day month, 4h 20m of observed downtime:
  minutes_in_month  = 30 × 24 × 60 = 43,200
  downtime_minutes  = 260
  uptime_percentage = (43,200 − 260) / 43,200 × 100 = 99.398%

99.398% is below a 99.95% commitment and at or above 99.0%,
so the first credit tier applies (10% on most schedules).`,
      },
      {
        type: 'p',
        text: 'Two details are easy to get wrong. Use the actual number of days in that month, not thirty. And apply the percentage to the charges for the affected service in the affected region, not your entire bill — most schedules are explicit about this.',
      },
      { type: 'h2', id: 'step-3', text: 'Step 3 — Assemble the evidence' },
      {
        type: 'p',
        text: 'Providers ask for specific dates, times and intervals. A support ticket saying "you were down for most of Tuesday" will be closed. What is needed is a per-interval record.',
      },
      {
        type: 'ul',
        items: [
          'The exact start and end timestamps of each degraded window, in UTC.',
          'Per-interval availability, at the granularity the SLA specifies — five-minute intervals for most cloud SLAs.',
          'The affected region, endpoint or resource identifier.',
          'Observed response codes and latency, not just a binary up or down.',
          'The origin of each observation, which is what makes the record independent.',
          'Any vendor incident identifier, if one was published — it makes confirmation faster.',
        ],
      },
      {
        type: 'code',
        language: 'text',
        caption: 'Evidence extract in the shape providers ask for',
        code: `Vendor:   example-cloud (us-east-1)
Service:  Object Storage API
Window:   2025-08-14 09:38:00Z → 2025-08-14 14:02:00Z  (264 min)
Observed from: us-west-2, eu-west-1, ap-southeast-1

  Interval (UTC)      Availability   Status   Median latency
  09:35 – 09:40       100%           200      142 ms
  09:40 – 09:45         0%           503      timeout
  09:45 – 09:50         0%           503      timeout
  ...
  14:00 – 14:05       100%           200      156 ms

Monthly uptime for August 2025: 99.409%
Commitment: 99.9%  →  first credit tier applies`,
      },
      { type: 'diagram', name: 'claim-flow' },
      { type: 'h2', id: 'step-4', text: 'Step 4 — Submit through the right channel' },
      {
        type: 'p',
        text: 'Each provider specifies a channel and a required format, and following it precisely matters more than the prose of your argument.',
      },
      {
        type: 'ol',
        items: [
          'Open a case in the provider\u2019s support console — not by email to a sales contact, unless the SLA names that route.',
          'Use the exact subject line the SLA specifies where one is given. AWS, for example, asks for "SLA Credit Request".',
          'State the billing cycle, the affected region and the specific service.',
          'Include your calculated monthly uptime percentage and the per-interval evidence supporting it.',
          'Reference the vendor\u2019s own incident identifier if one exists.',
          'Attach the full observation record rather than a summary — let them verify the arithmetic.',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Expect a slow, procedural response',
        text: 'Credits are applied to future bills, not refunded, and processing commonly takes a full billing cycle or longer. After a large outage, when the provider is handling many claims at once, longer still. A slow response is normal and is not a rejection.',
      },
      { type: 'h2', id: 'step-5', text: 'Step 5 — Track the outcome' },
      {
        type: 'p',
        text: 'Keep a register of claims: date filed, window claimed, amount expected, response, and the credit that actually appeared. Over a year this tells you which vendors honour their commitments in practice, which is a far more useful procurement input than a number in a contract.',
      },
      {
        type: 'callout',
        variant: 'warn',
        title: 'What credits are not',
        text: 'A service credit refunds a percentage of what you paid the provider for the affected service. It does not cover lost revenue, support costs, or churn. If a dependency failing is materially expensive for you, the remedy is architectural — the credit is not insurance.',
      },
      {
        type: 'faq',
        items: [
          {
            q: 'How do I claim an SLA credit?',
            a: 'Read the SLA version in force during the affected month, calculate your monthly uptime percentage, assemble per-interval timestamped evidence with region and response detail, then submit a claim through the provider\u2019s support console within the deadline — usually 30 days from the end of the affected billing period.',
          },
          {
            q: 'Are SLA credits automatic?',
            a: 'Almost never. Nearly all major providers require the customer to file a claim with supporting evidence. If you do not ask, no credit is issued.',
          },
          {
            q: 'How long do I have to claim an SLA credit?',
            a: 'Typically 30 days from the end of the billing period in which the incident occurred, though the exact window is set by each provider\u2019s SLA. Missing the deadline forfeits the entitlement regardless of the evidence.',
          },
          {
            q: 'How much is an SLA credit worth?',
            a: 'It is a percentage of what you paid for the affected service in the affected period — commonly 10% for the first tier, rising to 25%, 30%, 50% or 100% for deeper outages depending on the provider. It is a partial refund of your bill, not compensation for business losses.',
          },
          {
            q: 'What evidence do providers require for an SLA claim?',
            a: 'The dates and times of each affected interval, per-interval availability at the granularity the SLA specifies, the affected region and resource identifiers, and observed response behaviour. Providers routinely reject claims that give only an approximate duration.',
          },
        ],
      },
    ],
    related: ['what-is-vendor-sla-tracking', 'multi-region-outage-correlation'],
  },
  {
    slug: 'multi-region-outage-correlation',
    title: 'Multi-region outage correlation',
    navLabel: 'Multi-region correlation',
    order: 3,
    readTime: '8 min read',
    datePublished: '2025-08-12',
    dateModified: '2025-08-12',
    tldr: 'Correlation compares observations of the same endpoint from several independent regions to separate a genuine vendor outage from a local network fault or a shared upstream failure.',
    description:
      'How multi-region outage correlation works: the failure patterns it distinguishes, why a single vantage point produces ambiguous evidence, and how simultaneous multi-vendor degradation reveals shared upstream causes.',
    blocks: [
      {
        type: 'p',
        text: 'A single check failing tells you almost nothing on its own. The request could have failed because the vendor is down, because the network path from your check location is broken, because a regional DNS resolver is stale, or because one of the vendor\u2019s own regions is unhealthy while the rest are fine. Those four situations demand different responses, and only one of them supports a credit claim.',
      },
      {
        type: 'p',
        text: 'Correlation is the technique that separates them: observe the same endpoint from several independent origins, and read the pattern of which origins failed and when.',
      },
      { type: 'diagram', name: 'correlation' },
      { type: 'h2', id: 'patterns', text: 'The four patterns worth recognising' },
      {
        type: 'table',
        caption: 'Reading the failure pattern across observation regions',
        head: ['Pattern', 'What was observed', 'Most likely cause', 'Claimable?'],
        rows: [
          [
            'All regions fail',
            'Every observation point sees errors in the same window',
            'Genuine provider-wide outage',
            'Yes — strongest evidence',
          ],
          [
            'One region fails',
            'A single origin sees errors, others are healthy',
            'Local network or path fault',
            'No — investigate the path first',
          ],
          [
            'Geographic cluster fails',
            'All observers in one geography fail together',
            'Regional provider failure or transit issue',
            'Often — if scoped to the provider\u2019s region',
          ],
          [
            'Many vendors fail together',
            'Several unrelated dependencies degrade in the same window',
            'Shared upstream — DNS, transit, or a common cloud region',
            'Depends on where the shared cause sits',
          ],
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The single-region failure is the most valuable one to catch',
        text: 'It is the pattern that stops you filing a claim you would lose. A vendor that can show only one of your observation points saw a failure has a straightforward rebuttal, and filing anyway costs you credibility on the next claim.',
      },
      { type: 'h2', id: 'time-alignment', text: 'Aligning observations in time' },
      {
        type: 'p',
        text: 'Correlation depends on comparing observations that are genuinely simultaneous. Checks from different regions rarely fire at exactly the same instant, so observations are bucketed into fixed windows before comparison — commonly one or five minutes, matching the granularity most SLAs use.',
      },
      {
        type: 'code',
        language: 'text',
        caption: 'Bucketed observations across three regions during one window',
        code: `Bucket (UTC)   us-east-1   eu-west-1   ap-southeast-1   verdict
──────────────────────────────────────────────────────────────────────
09:35          200  138ms    200  201ms   200  187ms       healthy
09:40          503  timeout  200  198ms   200  191ms       single-region
09:45          503  timeout  503  timeout 503  timeout      provider-wide
09:50          503  timeout  503  timeout 503  timeout      provider-wide
09:55          503  timeout  503  timeout 200  205ms        partial
10:00          200  144ms    200  196ms   200  188ms        recovered

Provider-wide window: 09:45 → 09:55  (10 minutes, all regions)
Wider degradation:    09:40 → 10:00  (20 minutes, at least one region)`,
      },
      {
        type: 'p',
        text: 'Note that the two figures at the bottom are both true and mean different things. The conservative window — where every observer agreed — is what you put in a claim. The wider window is what you use to explain customer impact internally.',
      },
      { type: 'h2', id: 'cross-vendor', text: 'Cross-vendor correlation' },
      {
        type: 'p',
        text: 'The second axis of correlation compares different vendors to each other. When several unrelated dependencies degrade in the same window, the interesting question is what they share.',
      },
      {
        type: 'ul',
        items: [
          'A common cloud region hosting several of your vendors.',
          'A shared CDN or DNS provider sitting in front of them.',
          'A transit provider or internet exchange on the path.',
          'A widely used dependency further upstream — a certificate authority, an identity provider, a package registry.',
        ],
      },
      {
        type: 'p',
        text: 'This matters for claims because it changes who is accountable. If three vendors failed because they all sit in the same cloud region, the accountable party may be that cloud provider rather than the three vendors — and each vendor will likely point at it too.',
      },
      {
        type: 'callout',
        variant: 'warn',
        title: 'Simultaneity is not causation',
        text: 'Two vendors failing in the same ten-minute window can be coincidence, especially during a busy period. Correlation narrows the set of plausible explanations; it does not establish a shared cause on its own. State it as a hypothesis, not a finding.',
      },
      { type: 'h2', id: 'independence', text: 'Independence is what makes this work' },
      {
        type: 'p',
        text: 'Correlation only produces useful signal if the observation points genuinely fail independently. Three "regions" that are actually three availability zones of the same cloud region are not independent — a fault in that region takes out all three simultaneously and produces a convincing but wrong "provider-wide" reading.',
      },
      {
        type: 'ul',
        items: [
          'Separate the observation points geographically, across different continents where possible.',
          'Separate them by network path, so they do not share the same transit provider.',
          'Keep them off the infrastructure being observed, and off yours.',
          'Record the origin of every observation, so independence can be demonstrated afterwards rather than asserted.',
        ],
      },
      { type: 'h2', id: 'in-practice', text: 'What this looks like in practice' },
      {
        type: 'p',
        text: 'Reliastra runs scheduled checks against each tracked vendor from multiple cloud regions, buckets the results into fixed windows, and applies both axes of correlation: across regions for a single vendor, and across vendors within a time window. Each public vendor page shows the observation origins used, and every incident window records which regions agreed.',
      },
      {
        type: 'code',
        language: 'bash',
        caption: 'Fetching a vendor timeline from the public API',
        code: `curl "https://reliastra-backend.zevcloud.app/v1/vendors/stripe/timeline?window=24h&resolution=5m"

# Each point carries its bucket timestamp, observed availability,
# median latency and the incident it belongs to, if any.`,
      },
      {
        type: 'faq',
        items: [
          {
            q: 'What is multi-region outage correlation?',
            a: 'Multi-region outage correlation is the technique of comparing observations of the same endpoint taken from several independent geographic origins, in order to distinguish a genuine provider-wide outage from a local network fault, a regional failure, or a shared upstream cause.',
          },
          {
            q: 'Why is a single monitoring location not enough?',
            a: 'A single origin cannot separate a vendor failure from a network problem on the path between that origin and the vendor. Vendors routinely dismiss claims supported by only one observation point for exactly this reason.',
          },
          {
            q: 'How many regions are needed for reliable correlation?',
            a: 'Three genuinely independent origins is the practical minimum, because it allows a majority reading. They must be independent in network path as well as geography — three availability zones inside one cloud region do not qualify.',
          },
          {
            q: 'What does it mean when several vendors fail at once?',
            a: 'It suggests a shared upstream dependency such as a common cloud region, DNS provider, CDN or transit path. It is a hypothesis to investigate, not proof of a shared cause, and it can change which party is actually accountable.',
          },
          {
            q: 'Which time window should I put in a credit claim?',
            a: 'The conservative one — the window during which every independent observer recorded failures. Wider windows where only some origins failed are useful for internal impact analysis but are easier for a vendor to dispute.',
          },
        ],
      },
    ],
    related: ['what-is-vendor-sla-tracking', 'how-to-claim-sla-credits'],
  },
];

export const CONCEPT_SLUGS = CONCEPTS.map((c) => c.slug);

export function getConcept(slug: string): Concept | undefined {
  return CONCEPTS.find((c) => c.slug === slug);
}

export const CONCEPTS_ORDERED = [...CONCEPTS].sort((a, b) => a.order - b.order);
