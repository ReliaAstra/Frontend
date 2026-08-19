import { changelogEntries, latestChangelogDate } from '@/lib/changelog-data';
import { SITE_NAME, SITE_URL } from '@/lib/site';

/** Statically generated at build time, revalidated daily. */
export const dynamic = 'force-static';
export const revalidate = 86400;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Normalises a YYYY-MM-DD date into a full RFC-3339 timestamp. */
function rfc3339(date: string): string {
  return new Date(`${date}T12:00:00Z`).toISOString();
}

export async function GET() {
  const entries = changelogEntries.slice(0, 20);
  const feedUrl = `${SITE_URL}/changelog/feed.xml`;
  const updated = rfc3339(latestChangelogDate());

  const items = entries
    .map((e) => {
      const id = `${SITE_URL}/changelog#${encodeURIComponent(e.version)}`;
      const title = `${e.version} — ${e.title}`;
      return `  <entry>
    <title>${escapeXml(title)}</title>
    <link rel="alternate" type="text/html" href="${escapeXml(id)}"/>
    <id>${escapeXml(id)}</id>
    <updated>${rfc3339(e.date)}</updated>
    <published>${rfc3339(e.date)}</published>
    <category term="${escapeXml(e.type)}"/>
    <summary type="text">${escapeXml(e.description)}</summary>
    <content type="html">${escapeXml(`<p>${e.description}</p>`)}</content>
    <author><name>${escapeXml(SITE_NAME)}</name></author>
  </entry>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(`${SITE_NAME} Changelog`)}</title>
  <subtitle>Release notes, feature updates and improvements to Reliastra.</subtitle>
  <link rel="self" type="application/atom+xml" href="${escapeXml(feedUrl)}"/>
  <link rel="alternate" type="text/html" href="${escapeXml(`${SITE_URL}/changelog`)}"/>
  <id>${escapeXml(feedUrl)}</id>
  <updated>${updated}</updated>
  <icon>${escapeXml(`${SITE_URL}/favicon.svg`)}</icon>
  <author><name>${escapeXml(SITE_NAME)}</name><uri>${escapeXml(SITE_URL)}</uri></author>
${items}
</feed>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
