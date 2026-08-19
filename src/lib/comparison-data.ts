/**
 * Vendor comparison content.
 *
 * Editorial rule: state what each product is designed to do, and say plainly
 * where the competitor is stronger. No fabricated metrics, no invented
 * customers, no claims about internals we cannot observe.
 */

export type Verdict = 'yes' | 'no' | 'partial';

export interface ComparisonRow {
  feature: string;
  /** Short, neutral explanation of what the row means. */
  detail: string;
  reliastra: Verdict;
  competitor: Verdict;
  /** Optional clarifier shown under the competitor cell. */
  competitorNote?: string;
  /** Optional clarifier shown under the Reliastra cell. */
  reliastraNote?: string;
}

export interface ComparisonCategory {
  title: string;
  rows: ComparisonRow[];
}

export interface Comparison {
  slug: string;
  competitor: string;
  /** Competitor's canonical URL, used in JSON-LD `about`. */
  competitorUrl: string;
  /** Short descriptor of the competitor's product category. */
  competitorCategory: string;
  /** One-line positioning statement under the H1. */
  positioning: string;
  /** Metadata description. */
  description: string;
  /** 2–3 paragraph honest summary. */
  intro: string[];
  /** Where the competitor genuinely wins. Non-negotiable: must be substantive. */
  competitorStrengths: { title: string; body: string }[];
  /** Where Reliastra is the right tool. */
  reliastraStrengths: { title: string; body: string }[];
  categories: ComparisonCategory[];
  bestFor: {
    reliastra: { headline: string; bullets: string[] };
    competitor: { headline: string; bullets: string[] };
  };
  /** Do they overlap or complement? Honest answer to the obvious question. */
  together: string;
  faqs: { q: string; a: string }[];
}

export const COMPARISONS: Comparison[] = [
  {
    slug: 'reliastra-vs-datadog',
    competitor: 'Datadog',
    competitorUrl: 'https://www.datadoghq.com',
    competitorCategory: 'Full-stack observability platform',
    positioning:
      'Datadog tells you your system is unhealthy. Reliastra tells you which vendor caused it — and produces the timestamped record you can attach to a credit claim.',
    description:
      'An honest comparison of Reliastra and Datadog: observability breadth versus independent vendor evidence. Where Datadog is stronger, where Reliastra is, and when teams run both.',
    intro: [
      'Datadog is one of the most complete observability platforms available. It covers infrastructure metrics, APM and distributed tracing, log management, RUM, security monitoring and synthetics. If your question is "what is happening inside my system?", Datadog answers it in more depth than Reliastra ever will.',
      'Reliastra answers a narrower question: "was this us, or one of our vendors — and can I prove it?" We observe the third-party APIs your stack depends on from regions outside your infrastructure, keep an immutable timestamped record of each observation, and correlate that record with your incidents so it can be used as evidence.',
      'These are different jobs. The comparison below is written for teams deciding whether Reliastra replaces Datadog (it does not), or whether it fills a gap Datadog leaves open (for vendor accountability, it does).',
    ],
    competitorStrengths: [
      {
        title: 'Far broader observability surface',
        body: 'APM, distributed tracing, profiling, log management, RUM, database monitoring, security signals. Reliastra does none of this and is not trying to.',
      },
      {
        title: 'Deep internal instrumentation',
        body: 'Datadog agents and tracing libraries see inside your processes — span-level latency, query plans, memory profiles. Reliastra only sees what an external HTTP client sees.',
      },
      {
        title: 'Mature integration and alerting ecosystem',
        body: 'Hundreds of maintained integrations, a large dashboard and monitor library, and a well-established alerting and on-call workflow built over more than a decade.',
      },
      {
        title: 'Synthetics from many global locations',
        body: 'Datadog Synthetic Monitoring can run API and browser tests worldwide, including against third-party endpoints, on a mature and configurable platform.',
      },
    ],
    reliastraStrengths: [
      {
        title: 'Vendor accountability is the product, not a feature',
        body: 'Every part of Reliastra is designed around one output: an independent, timestamped record of third-party behaviour that survives scrutiny from the vendor being claimed against.',
      },
      {
        title: 'Evidence packaging for SLA credit claims',
        body: 'Observations are compiled into a structured report — what was requested, when, from which region, and what came back — in a form you can attach to a support ticket rather than a folder of screenshots.',
      },
      {
        title: 'Multi-vendor correlation across your dependency graph',
        body: 'When several dependencies degrade in the same window, Reliastra groups them, which distinguishes a shared upstream or regional event from an isolated vendor failure.',
      },
      {
        title: 'Public vendor tracking with no instrumentation',
        body: 'Vendor reliability pages are populated by Reliastra\u2019s own external checks. There is nothing to install in your stack to start seeing data.',
      },
    ],
    categories: [
      {
        title: 'Observability depth',
        rows: [
          {
            feature: 'Application performance monitoring (APM)',
            detail: 'Traces and spans from inside your application runtime.',
            reliastra: 'no',
            competitor: 'yes',
            competitorNote: 'Core Datadog capability',
          },
          {
            feature: 'Log management and search',
            detail: 'Centralised ingestion, indexing and querying of logs.',
            reliastra: 'no',
            competitor: 'yes',
          },
          {
            feature: 'Infrastructure metrics',
            detail: 'Host, container and orchestrator level resource metrics.',
            reliastra: 'no',
            competitor: 'yes',
          },
          {
            feature: 'Real user monitoring',
            detail: 'Browser and mobile session performance from real users.',
            reliastra: 'no',
            competitor: 'yes',
          },
          {
            feature: 'External checks against third-party APIs',
            detail: 'Scheduled requests to vendor endpoints from outside your stack.',
            reliastra: 'yes',
            competitor: 'yes',
            competitorNote: 'Via Synthetic Monitoring',
          },
        ],
      },
      {
        title: 'Vendor accountability',
        rows: [
          {
            feature: 'Vendor-first data model',
            detail: 'Dependencies are first-class objects with their own history and status.',
            reliastra: 'yes',
            competitor: 'partial',
            competitorNote: 'Modelled as synthetic tests, not vendors',
          },
          {
            feature: 'SLA evidence report generation',
            detail: 'A shareable, timestamped document built for a credit claim.',
            reliastra: 'yes',
            competitor: 'no',
            competitorNote: 'Export raw data and assemble it yourself',
          },
          {
            feature: 'Chain-of-custody timestamps',
            detail: 'Observations recorded with immutable timestamps and origin metadata.',
            reliastra: 'yes',
            competitor: 'partial',
            competitorNote: 'Data is retained, but not framed as evidence',
          },
          {
            feature: 'Multi-vendor correlation window',
            detail: 'Automatic grouping of simultaneous degradation across dependencies.',
            reliastra: 'yes',
            competitor: 'partial',
            competitorNote: 'Achievable with custom dashboards and monitors',
          },
          {
            feature: 'Public vendor reliability pages',
            detail: 'Shareable, indexable pages showing observed vendor behaviour.',
            reliastra: 'yes',
            competitor: 'no',
          },
        ],
      },
      {
        title: 'Adoption and operations',
        rows: [
          {
            feature: 'Agent or SDK installation required',
            detail: 'Whether you must deploy software into your environment to get value.',
            reliastra: 'no',
            competitor: 'yes',
            reliastraNote: 'External checks need no install',
            competitorNote: 'Agent required for most features',
          },
          {
            feature: 'Free tier',
            detail: 'A usable, non-expiring free plan.',
            reliastra: 'yes',
            competitor: 'partial',
            competitorNote: 'Limited free tier; most features are paid',
          },
          {
            feature: 'Usage-based cost exposure',
            detail: 'Whether costs scale sharply with hosts, ingestion or custom metrics.',
            reliastra: 'no',
            competitor: 'yes',
            competitorNote: 'Widely reported as complex to forecast',
          },
        ],
      },
    ],
    bestFor: {
      reliastra: {
        headline: 'Choose Reliastra when the vendor is the question',
        bullets: [
          'You need to establish, independently, whether a vendor caused an incident',
          'You want a timestamped record you can attach to an SLA credit claim',
          'You depend on many third-party APIs and need to see them correlated',
          'You want vendor visibility without instrumenting your application',
        ],
      },
      competitor: {
        headline: 'Choose Datadog when your own system is the question',
        bullets: [
          'You need APM, tracing and profiling inside your services',
          'You want centralised log management alongside metrics',
          'You are consolidating many observability tools into one platform',
          'You need mature on-call, alerting and dashboard workflows at scale',
        ],
      },
    },
    together:
      'Most teams that use Reliastra also run an internal observability platform. Datadog shows you the symptom inside your system; Reliastra establishes, from outside it, whether a dependency was responsible. Running both is the common case, not the exception.',
    faqs: [
      {
        q: 'Is Reliastra a replacement for Datadog?',
        a: 'No. Datadog covers APM, logs, infrastructure metrics and RUM — none of which Reliastra provides. Reliastra covers independent third-party vendor observation and evidence generation, which is a narrow slice Datadog does not target directly.',
      },
      {
        q: 'Can Datadog Synthetics monitor third-party APIs?',
        a: 'Yes. Datadog Synthetic Monitoring can run scheduled API tests against vendor endpoints from global locations. The difference is packaging: Datadog gives you the raw test results, while Reliastra structures observations as vendor-attributed, timestamped evidence and correlates them across dependencies.',
      },
      {
        q: 'Which is cheaper?',
        a: 'It depends entirely on scale and what you monitor. Datadog pricing is usage-based across hosts, ingestion and custom metrics, which many teams find hard to forecast. Reliastra prices around monitored dependencies and has a free tier for public vendor tracking. Compare against your own workload rather than list prices.',
      },
      {
        q: 'Why does independence matter for evidence?',
        a: 'A record produced by the same infrastructure that failed is easier for a vendor to dispute. Observations taken from regions outside both your stack and the vendor\u2019s make the record harder to attribute to a local fault.',
      },
    ],
  },
  {
    slug: 'reliastra-vs-statuspage',
    competitor: 'Statuspage',
    competitorUrl: 'https://www.atlassian.com/software/statuspage',
    competitorCategory: 'Hosted status page and incident communication',
    positioning:
      'Statuspage is how you tell customers what happened. Reliastra is how you find out what happened — independently of the vendor telling you.',
    description:
      'Reliastra vs Atlassian Statuspage: incident communication versus independent vendor measurement. An honest look at what each tool is for and why most teams need both.',
    intro: [
      'Atlassian Statuspage is a communication product. It exists so that when something goes wrong, you can publish a clear, branded, subscribable update to your customers, and keep a public history of incidents. It does that job very well and has effectively defined the category.',
      'Reliastra is a measurement product. It runs independent checks against the third-party APIs you depend on, records what it observed and when, and correlates those observations with your incidents. It produces the input to a status update, not the status update itself.',
      'The reason the comparison comes up at all is that both surfaces look similar — coloured dots, uptime bars, incident timelines. The difference is who produces the underlying data. On a status page, the operator declares the status. On a Reliastra vendor page, the status comes from measurements the operator does not control.',
    ],
    competitorStrengths: [
      {
        title: 'Purpose-built customer communication',
        body: 'Subscriber management across email, SMS, Slack and webhooks; templated incident updates; maintenance scheduling; branded and custom-domain pages. Reliastra does not attempt this.',
      },
      {
        title: 'Established, expected format',
        body: 'Customers, auditors and procurement teams recognise a Statuspage layout immediately. That familiarity has real operational value during an incident.',
      },
      {
        title: 'Deep Atlassian and incident-tooling integration',
        body: 'Tight coupling with Jira Service Management, Opsgenie and existing incident response workflows.',
      },
      {
        title: 'Component and audience granularity',
        body: 'Fine-grained component hierarchies plus public, private and audience-specific pages for different customer tiers.',
      },
    ],
    reliastraStrengths: [
      {
        title: 'Data you did not author',
        body: 'A status page reflects what its operator chose to publish. Reliastra publishes what was measured from independent regions, on a fixed schedule, whether or not anyone declared an incident.',
      },
      {
        title: 'Observation of vendors, not just yourself',
        body: 'Statuspage shows your services. Reliastra shows the services you depend on, which is where a large share of customer-facing failures originate.',
      },
      {
        title: 'Evidence built for a credit claim',
        body: 'Timestamped observations with region and response metadata, compiled into a report intended to be read by the vendor you are claiming against.',
      },
      {
        title: 'Correlation across dependencies',
        body: 'Simultaneous degradation across several vendors is grouped automatically, which separates a shared upstream event from an isolated failure.',
      },
    ],
    categories: [
      {
        title: 'Communication',
        rows: [
          {
            feature: 'Public status page for your own services',
            detail: 'A branded page announcing your system health to customers.',
            reliastra: 'partial',
            competitor: 'yes',
            reliastraNote: 'Reliastra publishes a status page; it is not the product focus',
          },
          {
            feature: 'Subscriber notifications (email, SMS, webhook)',
            detail: 'Customers subscribe and are notified of incident updates.',
            reliastra: 'no',
            competitor: 'yes',
          },
          {
            feature: 'Scheduled maintenance windows',
            detail: 'Announce planned work in advance and suppress alerts.',
            reliastra: 'no',
            competitor: 'yes',
          },
          {
            feature: 'Custom domain and branding',
            detail: 'status.yourcompany.com with your own visual identity.',
            reliastra: 'no',
            competitor: 'yes',
          },
          {
            feature: 'Incident update templates and workflows',
            detail: 'Structured investigating → identified → monitoring → resolved updates.',
            reliastra: 'no',
            competitor: 'yes',
          },
        ],
      },
      {
        title: 'Measurement and evidence',
        rows: [
          {
            feature: 'Status derived from automated measurement',
            detail: 'Whether the displayed status comes from checks rather than a human toggle.',
            reliastra: 'yes',
            competitor: 'partial',
            competitorNote: 'Can be driven by an API, but is operator-declared by default',
          },
          {
            feature: 'Independent monitoring of third-party vendors',
            detail: 'Checks against the APIs your product depends on.',
            reliastra: 'yes',
            competitor: 'no',
          },
          {
            feature: 'Timestamped evidence export',
            detail: 'A structured record suitable for an SLA credit claim.',
            reliastra: 'yes',
            competitor: 'no',
          },
          {
            feature: 'Multi-region observation',
            detail: 'The same endpoint checked from several geographic origins.',
            reliastra: 'yes',
            competitor: 'no',
          },
          {
            feature: 'Cross-vendor incident correlation',
            detail: 'Grouping simultaneous degradation across dependencies.',
            reliastra: 'yes',
            competitor: 'no',
          },
        ],
      },
    ],
    bestFor: {
      reliastra: {
        headline: 'Choose Reliastra to establish what actually happened',
        bullets: [
          'You need independent measurement of the vendors you depend on',
          'You want evidence for a credit claim, not a customer announcement',
          'You need to distinguish a vendor fault from your own',
          'You want vendor history that continues whether or not anyone declares an incident',
        ],
      },
      competitor: {
        headline: 'Choose Statuspage to tell customers what happened',
        bullets: [
          'You need a branded public page on your own domain',
          'You need subscriber notifications during incidents',
          'You publish scheduled maintenance windows',
          'You already run incident response in Jira or Opsgenie',
        ],
      },
    },
    together:
      'These are complements, not alternatives. Reliastra establishes that a dependency degraded and when; Statuspage is where you tell your customers about the impact. Several teams use Reliastra observations as the trigger and the source of detail for a Statuspage update.',
    faqs: [
      {
        q: 'Can Reliastra replace my Statuspage?',
        a: 'Not for customer communication. Reliastra has no subscriber management, maintenance scheduling, custom domains or incident update templates. If your goal is telling customers what is happening, keep Statuspage.',
      },
      {
        q: 'Why not just read my vendors\u2019 status pages?',
        a: 'Vendor status pages are owned and updated by the vendor. They are useful context, but they are a communication artefact from the organisation whose service failed. An independent measurement is a different kind of record — and it exists during the window before a vendor posts anything.',
      },
      {
        q: 'Does Reliastra publish a status page?',
        a: 'Yes, for Reliastra\u2019s own monitoring infrastructure, and public reliability pages for each tracked vendor. Those pages are outputs of measurement rather than a communications product you configure.',
      },
      {
        q: 'Can I feed Reliastra data into Statuspage?',
        a: 'Statuspage exposes an API for programmatically setting component status, so measurement-driven updates are a standard pattern. Treat Reliastra as the measurement source and Statuspage as the publishing surface.',
      },
    ],
  },
  {
    slug: 'reliastra-vs-uptimerobot',
    competitor: 'UptimeRobot',
    competitorUrl: 'https://uptimerobot.com',
    competitorCategory: 'Uptime monitoring and alerting',
    positioning:
      'UptimeRobot tells you an endpoint stopped responding. Reliastra tells you which vendor it belonged to, what else broke at the same time, and gives you the record to claim against it.',
    description:
      'Reliastra vs UptimeRobot: simple, inexpensive uptime checks versus vendor-attributed evidence and correlation. Where UptimeRobot wins on price and simplicity, and where it stops.',
    intro: [
      'UptimeRobot is a well-established, deliberately simple uptime monitor. You give it a URL, it checks it on a schedule, and it alerts you when the check fails. It is inexpensive, quick to configure and widely used — for that job it is hard to beat on price or setup time.',
      'Reliastra starts from the same primitive — an HTTP check from outside your stack — but treats the result differently. Checks are attributed to a vendor, retained as timestamped evidence with origin metadata, correlated across your other dependencies, and compiled into a report intended for an SLA credit claim.',
      'If your requirement is "tell me when my site is down", UptimeRobot is very likely enough. If your requirement is "prove that a vendor breached its SLA during a specific window", the gap between raw check history and usable evidence is exactly what Reliastra fills.',
    ],
    competitorStrengths: [
      {
        title: 'Price and a genuinely generous free tier',
        body: 'A large number of monitors at no cost, with paid plans that remain inexpensive. For basic uptime alerting the cost-per-monitor is very hard to beat.',
      },
      {
        title: 'Setup takes seconds',
        body: 'Paste a URL, pick an interval, add a notification channel. No data model to learn and no configuration overhead.',
      },
      {
        title: 'Broad protocol coverage for basic checks',
        body: 'HTTP(S), keyword matching, ping, port and SSL certificate expiry monitoring in a single, familiar interface.',
      },
      {
        title: 'Mature alerting integrations',
        body: 'Email, SMS, voice, Slack, Telegram, Discord, webhooks and more, refined over many years of operation.',
      },
    ],
    reliastraStrengths: [
      {
        title: 'Vendor attribution, not just endpoints',
        body: 'A check belongs to a vendor with its own profile, history and public reliability page — so "Stripe degraded" is a first-class fact rather than something you infer from a URL.',
      },
      {
        title: 'Correlation across dependencies',
        body: 'When several vendors degrade in the same window, Reliastra groups them. A flat list of independent monitors cannot show you that shape.',
      },
      {
        title: 'Evidence packaging',
        body: 'Observations are compiled with region, timestamp and response metadata into a report designed to accompany a credit claim.',
      },
      {
        title: 'Incident linkage',
        body: 'Vendor observations attach to your own incidents, so the record of "what we saw externally" and "what our users experienced" live together.',
      },
    ],
    categories: [
      {
        title: 'Core monitoring',
        rows: [
          {
            feature: 'HTTP(S) endpoint checks',
            detail: 'Scheduled requests with status and latency capture.',
            reliastra: 'yes',
            competitor: 'yes',
          },
          {
            feature: 'Ping, port and SSL expiry checks',
            detail: 'Non-HTTP protocol coverage.',
            reliastra: 'no',
            competitor: 'yes',
          },
          {
            feature: 'Keyword matching in responses',
            detail: 'Fail a check when expected content is missing.',
            reliastra: 'partial',
            competitor: 'yes',
          },
          {
            feature: 'Multi-region checks',
            detail: 'The same endpoint observed from several origins.',
            reliastra: 'yes',
            competitor: 'partial',
            competitorNote: 'Available on higher paid tiers',
          },
          {
            feature: 'Alerting integrations',
            detail: 'Notification channels for failures.',
            reliastra: 'yes',
            competitor: 'yes',
            competitorNote: 'Broader channel selection',
          },
        ],
      },
      {
        title: 'Vendor intelligence',
        rows: [
          {
            feature: 'Vendor as a first-class object',
            detail: 'Checks roll up into a vendor profile with its own history.',
            reliastra: 'yes',
            competitor: 'no',
            competitorNote: 'Monitors are independent URLs',
          },
          {
            feature: 'Cross-dependency correlation',
            detail: 'Automatic grouping of simultaneous vendor degradation.',
            reliastra: 'yes',
            competitor: 'no',
          },
          {
            feature: 'SLA evidence report generation',
            detail: 'A structured, timestamped document for a credit claim.',
            reliastra: 'yes',
            competitor: 'no',
          },
          {
            feature: 'SLA credit estimation',
            detail: 'Mapping observed downtime to a published credit schedule.',
            reliastra: 'yes',
            competitor: 'no',
          },
          {
            feature: 'Public vendor reliability pages',
            detail: 'Indexable pages of observed vendor behaviour over time.',
            reliastra: 'yes',
            competitor: 'partial',
            competitorNote: 'Public status pages exist, for your own monitors',
          },
        ],
      },
      {
        title: 'Cost and fit',
        rows: [
          {
            feature: 'Free tier',
            detail: 'A usable plan at no cost.',
            reliastra: 'yes',
            competitor: 'yes',
            competitorNote: 'Notably generous monitor count',
          },
          {
            feature: 'Cheapest option for plain uptime alerting',
            detail: 'Lowest total cost when all you need is up/down notification.',
            reliastra: 'no',
            competitor: 'yes',
          },
        ],
      },
    ],
    bestFor: {
      reliastra: {
        headline: 'Choose Reliastra when downtime has a counterparty',
        bullets: [
          'A third party is contractually responsible for the failure',
          'You want to claim SLA credits and need a defensible record',
          'You depend on many vendors and need their failures correlated',
          'You need to answer "was it us or them?" during an incident review',
        ],
      },
      competitor: {
        headline: 'Choose UptimeRobot when you need simple, cheap alerting',
        bullets: [
          'You want to know when your own site or endpoint stops responding',
          'You need ping, port or SSL expiry checks',
          'Cost per monitor is the dominant constraint',
          'No one is going to be billed or credited over the outage',
        ],
      },
    },
    together:
      'They coexist comfortably. Teams commonly keep UptimeRobot pointed at their own endpoints for cheap up/down alerting, and use Reliastra for the third-party dependencies where attribution and evidence matter.',
    faqs: [
      {
        q: 'Can I just point UptimeRobot at my vendors\u2019 APIs?',
        a: 'You can, and it will tell you when those endpoints fail. What you will not get is vendor attribution, correlation across dependencies, or a report structured for a credit claim — you would be assembling that from raw check history yourself.',
      },
      {
        q: 'Is Reliastra more expensive than UptimeRobot?',
        a: 'For plain uptime alerting, yes — UptimeRobot is cheaper and we would not argue otherwise. The comparison only favours Reliastra when the evidence and correlation output is worth more to you than the difference in price.',
      },
      {
        q: 'Does Reliastra monitor my own services too?',
        a: 'Reliastra is built around external dependencies. It can observe your own public endpoints, but its data model, correlation logic and reporting are all oriented toward third-party vendors.',
      },
      {
        q: 'What does multi-region actually change?',
        a: 'A single-origin check cannot distinguish a vendor outage from a network problem between one location and that vendor. Observing from several regions makes that distinction visible, and makes the resulting record much harder to dispute.',
      },
    ],
  },
  {
    slug: 'reliastra-vs-pingdom',
    competitor: 'Pingdom',
    competitorUrl: 'https://www.pingdom.com',
    competitorCategory: 'Synthetic and real user monitoring',
    positioning:
      'Pingdom measures the experience of your own site. Reliastra measures the vendors underneath it, and turns those measurements into evidence.',
    description:
      'Reliastra vs Pingdom: end-user experience monitoring versus independent vendor accountability. What Pingdom does better, what Reliastra is built for, and how they fit together.',
    intro: [
      'Pingdom, part of SolarWinds, is a long-established synthetic and real user monitoring product. Its strength is measuring the experience of your own web properties: page speed, transaction flows through a browser, and real user metrics from actual visitors, from a large global network of test locations.',
      'Reliastra is not measuring your website. It measures the third-party APIs your website depends on, from independent regions, and keeps the result as a timestamped record attributable to a specific vendor. The output is intended to be read by someone deciding whether to grant an SLA credit.',
      'If your question is "how fast and available is my site for users in Singapore?", Pingdom answers it better. If your question is "our checkout failed for 40 minutes — can we show it was the payments provider?", that is what Reliastra is for.',
    ],
    competitorStrengths: [
      {
        title: 'Real user monitoring',
        body: 'Pingdom collects performance data from actual visitor sessions, segmented by geography, browser and device. Reliastra has no RUM capability.',
      },
      {
        title: 'Browser-based transaction monitoring',
        body: 'Scripted multi-step flows — log in, add to cart, check out — executed in a real browser. Reliastra performs API-level checks only.',
      },
      {
        title: 'Large global test-location network',
        body: 'A long-established set of worldwide checkpoints, valuable for geographic performance analysis of your own properties.',
      },
      {
        title: 'Page speed and front-end analysis',
        body: 'Waterfall breakdowns and page-performance grading for optimising your own front end — outside Reliastra\u2019s scope entirely.',
      },
    ],
    reliastraStrengths: [
      {
        title: 'Built around the vendor, not the page',
        body: 'Data is organised by dependency, so vendor reliability history accumulates as a durable, reviewable record rather than a set of test results.',
      },
      {
        title: 'Evidence rather than dashboards',
        body: 'The primary output is a structured, timestamped report for a credit claim, not a performance chart.',
      },
      {
        title: 'Correlation across simultaneous failures',
        body: 'Grouping degradation across multiple dependencies exposes shared upstream causes that per-check monitoring will not surface.',
      },
      {
        title: 'Public, citable vendor reliability pages',
        body: 'Each tracked vendor has a public page of observed behaviour, useful for procurement review and for sharing during an incident.',
      },
    ],
    categories: [
      {
        title: 'Experience monitoring',
        rows: [
          {
            feature: 'Real user monitoring (RUM)',
            detail: 'Performance data collected from actual visitor sessions.',
            reliastra: 'no',
            competitor: 'yes',
          },
          {
            feature: 'Browser transaction monitoring',
            detail: 'Scripted multi-step user journeys in a real browser.',
            reliastra: 'no',
            competitor: 'yes',
          },
          {
            feature: 'Page speed analysis',
            detail: 'Waterfalls and front-end performance grading.',
            reliastra: 'no',
            competitor: 'yes',
          },
          {
            feature: 'Global checkpoint network',
            detail: 'Checks executed from many worldwide locations.',
            reliastra: 'partial',
            competitor: 'yes',
            reliastraNote: 'Multi-region, smaller footprint',
          },
        ],
      },
      {
        title: 'Vendor accountability',
        rows: [
          {
            feature: 'Dependency-centric data model',
            detail: 'Observations roll up to a vendor rather than a test.',
            reliastra: 'yes',
            competitor: 'no',
          },
          {
            feature: 'SLA evidence report generation',
            detail: 'Structured, timestamped output for a credit claim.',
            reliastra: 'yes',
            competitor: 'no',
          },
          {
            feature: 'Multi-vendor correlation',
            detail: 'Automatic grouping of simultaneous vendor degradation.',
            reliastra: 'yes',
            competitor: 'no',
          },
          {
            feature: 'SLA credit estimation',
            detail: 'Observed downtime mapped to a published credit schedule.',
            reliastra: 'yes',
            competitor: 'no',
          },
          {
            feature: 'Public vendor reliability pages',
            detail: 'Indexable pages of measured vendor behaviour.',
            reliastra: 'yes',
            competitor: 'no',
          },
        ],
      },
      {
        title: 'Practicalities',
        rows: [
          {
            feature: 'Free tier',
            detail: 'A usable, non-expiring free plan.',
            reliastra: 'yes',
            competitor: 'no',
            competitorNote: 'Trial only',
          },
          {
            feature: 'API-level checks against third parties',
            detail: 'Scheduled requests to vendor endpoints.',
            reliastra: 'yes',
            competitor: 'yes',
            competitorNote: 'Supported, framed as uptime tests',
          },
        ],
      },
    ],
    bestFor: {
      reliastra: {
        headline: 'Choose Reliastra for vendor accountability',
        bullets: [
          'Third-party APIs are a material part of your critical path',
          'You need defensible evidence for SLA credit claims',
          'You want simultaneous vendor failures correlated automatically',
          'You need to separate vendor fault from your own during reviews',
        ],
      },
      competitor: {
        headline: 'Choose Pingdom for end-user experience',
        bullets: [
          'You are optimising your own site\u2019s speed and availability',
          'You need real user monitoring across geographies',
          'You want scripted browser transaction checks',
          'Front-end performance analysis is a primary use case',
        ],
      },
    },
    together:
      'Pingdom tells you that users in a region are having a bad time. Reliastra tells you whether a dependency is the reason and gives you something to send the vendor. Used together they cover both halves of an incident review.',
    faqs: [
      {
        q: 'Does Reliastra monitor page load speed?',
        a: 'No. Reliastra performs API-level checks against vendor endpoints. Front-end performance, waterfalls and page grading are outside its scope — use Pingdom or a similar tool for that.',
      },
      {
        q: 'Can Pingdom prove a vendor breached its SLA?',
        a: 'It can record that an endpoint was unavailable during a window, which is a useful input. What it does not produce is a vendor-attributed, correlated evidence report structured for a credit claim, which is the specific gap Reliastra targets.',
      },
      {
        q: 'Do I need both?',
        a: 'If third-party APIs are a material part of your critical path and you care about credits, yes. If you only need to know how your own site performs for users, Pingdom alone is a reasonable answer.',
      },
      {
        q: 'How many regions does Reliastra check from?',
        a: 'Checks run from multiple cloud regions, and each observation records its origin. The current region set for any tracked vendor is shown on that vendor\u2019s public reliability page.',
      },
    ],
  },
];

export const COMPARISON_SLUGS = COMPARISONS.map((c) => c.slug);

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}
