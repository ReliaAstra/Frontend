export type ChangelogType = 'major' | 'minor';

export interface ChangelogEntry {
  version: string;
  /** ISO-8601 date, used for the feed and <time> elements. */
  date: string;
  /** Human label shown in the UI. */
  dateLabel: string;
  title: string;
  description: string;
  type: ChangelogType;
}

/**
 * Single source of truth for the changelog page and the Atom feed.
 * Ordered newest first.
 */
export const changelogEntries: ChangelogEntry[] = [
  {
    version: 'v0.3.0',
    date: '2025-08-14',
    dateLabel: 'Aug 2025',
    title: 'Initial public beta',
    description:
      'Live vendor tracking for 6 major providers. Open signups, free tier, and core monitoring dashboard.',
    type: 'major',
  },
  {
    version: 'v0.2.0',
    date: '2025-07-18',
    dateLabel: 'Jul 2025',
    title: 'Incident correlation engine',
    description:
      'Added automated incident correlation across vendors and SLA evidence report generation with PDF export.',
    type: 'major',
  },
  {
    version: 'v0.1.1',
    date: '2025-07-02',
    dateLabel: 'Jul 2025',
    title: 'Monitoring improvements',
    description:
      'Improved monitoring intervals to 30 seconds. Added Slack notification support and alerting rules.',
    type: 'minor',
  },
  {
    version: 'v0.1.0-beta',
    date: '2025-06-10',
    dateLabel: 'Jun 2025',
    title: 'Private beta launch',
    description: 'Private beta. Core monitoring infrastructure deployed with manual alerting.',
    type: 'major',
  },
  {
    version: 'v0.0.1',
    date: '2025-05-06',
    dateLabel: 'May 2025',
    title: 'Internal alpha',
    description:
      'Core monitoring infrastructure deployed. Internal testing with synthetic vendor endpoints.',
    type: 'minor',
  },
];

/** Newest entry date, used as the feed's <updated> value. */
export function latestChangelogDate(): string {
  return changelogEntries[0]?.date ?? new Date().toISOString().slice(0, 10);
}
