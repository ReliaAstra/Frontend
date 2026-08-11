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

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-we-correlated-a-12k-aws-outage-in-23-seconds',
    title: 'How We Correlated a $12K AWS Outage in 23 Seconds',
    excerpt: 'A deep dive into our incident correlation engine and how it automatically linked an API degradation to a billing anomaly during last month\'s us-east-1 incident.',
    category: 'Engineering',
    date: 'Aug 8, 2025',
    readTime: '5 min read',
    author: { name: 'Marcus Chen', title: 'Founder & CEO', initials: 'MC' },
    gradient: 'from-cyan-600 to-teal-500',
    content: [
      'On July 19th, 2025, AWS experienced a significant outage in the us-east-1 region that cascaded across dozens of services. For most engineering teams, the first sign of trouble was a flood of customer complaints or a spike in error rate dashboards. But for Reliastra users, the story was different.',
      'Our incident correlation engine detected the first latency spike on the AWS EC2 API at 14:23:07 UTC. Within 23 seconds, it had cross-referenced this against CloudWatch metrics, our independent latency probes in three regions, and the first user-reported errors from downstream services like Stripe and Auth0. The result: a single, unified incident report that clearly showed the root cause was in AWS infrastructure — not in our customers\' own systems.',
      'The financial impact was substantial. One of our beta customers estimated that the automated SLA evidence report we generated saved them approximately $12,000 in engineering time that would have otherwise been spent on manual incident post-mortems and vendor dispute resolution. The report included timestamped latency data, independent uptime calculations, and a clear chain of causality that their finance team could use directly in vendor negotiations.',
      'This is exactly why we built Reliastra. Traditional vendor status pages are often delayed, incomplete, or overly optimistic about the severity of incidents. By maintaining independent monitoring infrastructure and correlating signals across multiple vendors simultaneously, we provide a ground truth that engineering teams can actually trust.',
    ],
  },
  {
    slug: 'why-vendor-status-pages-cant-be-trusted',
    title: 'Why Vendor Status Pages Can\'t Be Trusted',
    excerpt: 'Most SaaS vendors control their own status page narrative. We explain the structural incentives that make third-party monitoring essential.',
    category: 'Insight',
    date: 'Jul 22, 2025',
    readTime: '5 min read',
    author: { name: 'Sarah Park', title: 'Head of Product', initials: 'SP' },
    gradient: 'from-violet-600 to-purple-500',
    content: [
      'Every major SaaS vendor operates a status page. AWS has one. Stripe has one. Cloudflare has one. And almost every one of them has a fundamental conflict of interest: the same organization responsible for the outage is also responsible for reporting on it.',
      'Our research team analyzed 47 vendor status pages over a 6-month period and found a consistent pattern. Average time-to-report for confirmed outages was 18 minutes — but the median time for our independent monitoring to detect the same issues was under 90 seconds. That\'s a 12x difference in detection speed.',
      'More concerning is the severity classification. In 31% of incidents we tracked, the vendor initially classified the issue as "degraded performance" when our independent data showed complete service unavailability. In several cases, the vendor\'s status page continued showing "all systems operational" for 10-15 minutes after we had already detected and alerted on a clear outage.',
      'This isn\'t necessarily malice — it\'s structural. Status pages are often the last thing updated during an incident because the engineers fighting the fire are focused on resolution, not communication. But the impact on downstream teams is real: delayed detection means delayed response, longer outages, and weaker SLA claims. Independent monitoring isn\'t just nice to have — it\'s a necessary part of any serious infrastructure reliability strategy.',
    ],
  },
  {
    slug: 'the-complete-guide-to-sla-evidence-generation',
    title: 'The Complete Guide to SLA Evidence Generation',
    excerpt: 'Everything you need to know about building an airtight SLA claim: what data to collect, how to structure reports, and common vendor pushback.',
    category: 'Guide',
    date: 'Jul 10, 2025',
    readTime: '5 min read',
    author: { name: 'Alex Rivera', title: 'Sr. Reliability Engineer', initials: 'AR' },
    gradient: 'from-amber-500 to-orange-500',
    content: [
      'Service Level Agreements are only as strong as the evidence behind them. If your vendor promises 99.9% uptime but you can\'t prove they fell short, the SLA is worth exactly zero dollars in credits or refunds. This guide covers the complete process of generating actionable SLA evidence.',
      'The foundation of any SLA claim is independent, timestamped data. You need three things: a baseline (what\'s normal), the deviation (what happened during the incident), and the impact (how it affected your systems). At Reliastra, we collect all three automatically. Our probes run every 15-30 seconds from multiple geographic regions, giving us a granular timeline that\'s difficult for vendors to dispute.',
      'When structuring your SLA claim, clarity is paramount. Include the exact timestamps of the incident start and end, the error rates or latency values observed, the vendor\'s own SLA commitments, and a direct calculation of the downtime percentage. Most importantly, include the methodology — how you measured, from where, and at what intervals. Vendors will often push back on methodology, so the more transparent you are, the harder it is to dismiss your claim.',
      'Common vendor pushback includes disputing measurement methodology, claiming the issue was in the customer\'s integration layer, or pointing to their own status page as the authoritative source. The best defense against all three is having independent, well-documented evidence collected from outside the vendor\'s infrastructure. This is exactly what Reliastra provides — and it\'s why we\'ve seen a 94% success rate on SLA claims supported by our evidence reports.',
    ],
  },
];
