import type { DayStatus, UptimeDay } from '@/components/uptime/UptimeTimeline';
import type { TimelineBucket } from '@/services/vendorService';

/** YYYY-MM-DD in UTC. */
export function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Builds an ordered list of the last `count` UTC day keys, oldest first. */
export function lastNDays(count: number, from: Date = new Date()): string[] {
  const days: string[] = [];
  const base = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  for (let i = count - 1; i >= 0; i--) {
    days.push(utcDayKey(new Date(base - i * 86_400_000)));
  }
  return days;
}

export function statusForUptime(uptime: number | null): DayStatus {
  if (uptime === null) return 'unknown';
  if (uptime >= 99.5) return 'operational';
  if (uptime >= 95) return 'degraded';
  return 'down';
}

/**
 * Aggregates raw timeline observations into one bucket per UTC day.
 *
 * Days with no observations are returned with `uptime: null` and an `unknown`
 * status — we never synthesise availability we did not measure.
 */
export function bucketTimelineByDay(
  points: TimelineBucket[] | undefined,
  dayCount = 90,
  now: Date = new Date(),
): UptimeDay[] {
  const keys = lastNDays(dayCount, now);
  const totals = new Map<string, { up: number; total: number }>();

  for (const point of points ?? []) {
    const ts = new Date(point.timestamp);
    if (Number.isNaN(ts.getTime())) continue;
    const key = utcDayKey(ts);
    const weight = Math.max(point.observation_count ?? 1, 1);
    const bucket = totals.get(key) ?? { up: 0, total: 0 };
    bucket.total += weight;
    if (point.is_up) bucket.up += weight;
    totals.set(key, bucket);
  }

  return keys.map((date) => {
    const bucket = totals.get(date);
    if (!bucket || bucket.total === 0) {
      return { date, uptime: null, status: 'unknown' as DayStatus };
    }
    const uptime = (bucket.up / bucket.total) * 100;
    return { date, uptime, status: statusForUptime(uptime) };
  });
}

/** Mean of the observed days only. Returns null when nothing was observed. */
export function observedAverage(days: UptimeDay[]): number | null {
  const observed = days.filter((d) => d.uptime !== null);
  if (observed.length === 0) return null;
  return observed.reduce((acc, d) => acc + (d.uptime ?? 0), 0) / observed.length;
}

export function countObservedDays(days: UptimeDay[]): number {
  return days.filter((d) => d.uptime !== null).length;
}

/** An all-unknown series, used as the placeholder before data arrives. */
export function emptySeries(dayCount = 90, now: Date = new Date()): UptimeDay[] {
  return lastNDays(dayCount, now).map((date) => ({
    date,
    uptime: null,
    status: 'unknown' as DayStatus,
  }));
}
