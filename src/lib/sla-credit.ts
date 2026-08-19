import type { SlaTier } from '@/lib/vendor-catalog';

export interface CreditInput {
  /** Monthly spend on the affected service, in USD. */
  monthlySpend: number;
  /** Observed downtime in minutes. */
  downtimeMinutes: number;
  /** Days in the billing month. */
  daysInMonth: number;
  tier: SlaTier;
}

export interface CreditResult {
  /** Observed monthly uptime as a percentage, e.g. 99.398 */
  uptimePercentage: number;
  /** Total minutes in the billing month. */
  minutesInMonth: number;
  /** Whether observed uptime is below the commitment. */
  breached: boolean;
  /** Credit percentage from the schedule, 0 when no tier applies. */
  creditPercent: number;
  /** Estimated credit in USD. */
  creditAmount: number;
  /** Downtime the commitment permits, in minutes. */
  allowanceMinutes: number;
  /** Minutes beyond the allowance. Negative when within budget. */
  excessMinutes: number;
  /** Human description of the matched schedule row. */
  matchedTierLabel: string;
}

export const DEFAULT_DAYS_IN_MONTH = 30;

/** Minutes of downtime a commitment permits in a month of `days` days. */
export function allowanceMinutes(commitment: number, days = DEFAULT_DAYS_IN_MONTH): number {
  const total = days * 24 * 60;
  return total * (1 - commitment / 100);
}

export function calculateCredit({
  monthlySpend,
  downtimeMinutes,
  daysInMonth,
  tier,
}: CreditInput): CreditResult {
  const minutesInMonth = Math.max(daysInMonth, 1) * 24 * 60;
  const clampedDowntime = Math.max(0, Math.min(downtimeMinutes, minutesInMonth));
  const uptimePercentage = ((minutesInMonth - clampedDowntime) / minutesInMonth) * 100;

  const allowance = allowanceMinutes(tier.commitment, daysInMonth);
  const breached = uptimePercentage < tier.commitment;

  let creditPercent = 0;
  let matchedTierLabel = `At or above the ${tier.commitment}% commitment — no credit applies.`;

  if (breached) {
    for (const row of tier.schedule) {
      const underCeiling = uptimePercentage < row.below;
      const overFloor = row.atLeast === null || uptimePercentage >= row.atLeast;
      if (underCeiling && overFloor) {
        creditPercent = row.creditPercent;
        matchedTierLabel =
          row.atLeast === null
            ? `Below ${row.below}% — ${row.creditPercent}% credit tier.`
            : `Below ${row.below}% and at or above ${row.atLeast}% — ${row.creditPercent}% credit tier.`;
        break;
      }
    }
  }

  const creditAmount = (Math.max(monthlySpend, 0) * creditPercent) / 100;

  return {
    uptimePercentage,
    minutesInMonth,
    breached,
    creditPercent,
    creditAmount,
    allowanceMinutes: allowance,
    excessMinutes: clampedDowntime - allowance,
    matchedTierLabel,
  };
}

/** "4h 20m" style duration from a minute count. */
export function formatMinutes(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  if (total < 1) return '0m';
  if (total < 60) return `${total}m`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h < 24) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
}

/** Precise duration for small allowances, e.g. "4m 19s". */
export function formatMinutesPrecise(minutes: number): string {
  const totalSeconds = Math.max(0, Math.round(minutes * 60));
  if (totalSeconds < 60) return `${totalSeconds}s`;
  if (totalSeconds < 3600) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  return formatMinutes(minutes);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount >= 100 ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Common uptime commitments used for the reference table. */
export const COMMON_COMMITMENTS = [99.9, 99.95, 99.99] as const;
