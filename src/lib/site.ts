/**
 * Canonical site configuration used by metadata, sitemap, feeds and JSON-LD.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://reliastra.com';

export const SITE_NAME = 'Reliastra';

export const SITE_TAGLINE = 'External Dependency Intelligence';

export const SITE_DESCRIPTION =
  'Reliastra monitors the third-party APIs your infrastructure depends on from independent regions, correlates vendor failures with your incidents, and produces timestamped evidence you can attach to an SLA credit claim.';

/** Absolute URL helper. `path` should start with a slash. */
export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export const ORGANIZATION_JSONLD = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl('/logo.svg'),
  description: SITE_DESCRIPTION,
  sameAs: ['https://github.com/ReliaAstra'],
} as const;

export const WEBSITE_JSONLD = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  publisher: { '@id': `${SITE_URL}/#organization` },
} as const;

/** Shared Open Graph defaults so every page inherits consistent branding. */
export const OG_DEFAULTS = {
  siteName: SITE_NAME,
  locale: 'en_US',
  type: 'website',
} as const;
