export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: AnalyticsPayload }) => void;
    gtag?: (...args: unknown[]) => void;
    posthog?: { capture?: (event: string, properties?: AnalyticsPayload) => void };
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent(event: string, payload: AnalyticsPayload = {}) {
  if (typeof window === 'undefined') return;

  try {
    window.plausible?.(event, { props: payload });
  } catch {}

  try {
    window.gtag?.('event', event, payload);
  } catch {}

  try {
    window.posthog?.capture?.(event, payload);
  } catch {}

  try {
    window.dataLayer?.push({ event, ...payload });
  } catch {}
}
