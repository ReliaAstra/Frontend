// ── Partner Program ───────────────────────────────────────────────

export interface CommissionRate {
  id: string;
  partner_program_id: string;
  action_type: 'refer' | 'deploy' | 'create' | 'introduce';
  rate: number; // e.g. 20 means 20%
  description: string;
  created_at: string;
}

export interface PartnerProgram {
  id: string;
  name: string;
  description: string;
  status: string;
  commission_rates: CommissionRate[];
  created_at: string;
  updated_at: string;
}

// ── Partner Application ────────────────────────────────────────────

export interface PartnerApplicationCreate {
  partner_type: string;
  earning_methods: string[];
  audience_description: string;
  agreement_accepted: boolean;
}

// ── Partner Profile ───────────────────────────────────────────────

export interface PartnerProfile {
  id: string;
  user_id: string;
  partner_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  earning_methods: string[];
  commission_rate: number;
  total_earned: number; // minor units (cents)
  total_paid: number;
  total_pending: number;
  referral_count: number;
  created_at: string;
  updated_at: string;
}

// ── Partner Dashboard ─────────────────────────────────────────────

export interface CommissionItem {
  id: string;
  partner_id: string;
  type: string;
  amount: number; // minor units
  status: 'pending' | 'paid' | 'cancelled';
  description: string;
  created_at: string;
  paid_at: string | null;
}

export interface MonthlyEarning {
  month: string;
  amount: number;
  count: number;
}

export interface PartnerDashboardData {
  total_earned: number;
  total_pending: number;
  total_paid: number;
  referral_count: number;
  active_referral_links: number;
  recent_commissions: CommissionItem[];
  monthly_earnings: MonthlyEarning[];
}

// ── Referral Links ────────────────────────────────────────────────

export interface ReferralLink {
  id: string;
  partner_id: string;
  code: string;
  url: string;
  name: string;
  clicks: number;
  conversions: number;
  is_active: boolean;
  created_at: string;
}

export interface ReferralLinkCreate {
  name: string;
}

// ── Referred Customers ────────────────────────────────────────────

export interface ReferredCustomer {
  id: string;
  email: string;
  organization: string;
  status: string;
  referral_link_id: string;
  created_at: string;
}

// ── Settlements ───────────────────────────────────────────────────

export interface Settlement {
  id: string;
  partner_id: string;
  amount: number;
  status: string;
  period_start: string;
  period_end: string;
  paid_at: string | null;
  created_at: string;
}

// ── Analytics ─────────────────────────────────────────────────────

export interface PartnerAnalytics {
  total_clicks: number;
  total_conversions: number;
  conversion_rate: number;
  top_referral_links: ReferralLink[];
  earnings_by_type: Record<string, number>;
}

// ── Helpers ───────────────────────────────────────────────────────

/** Format minor-unit values (cents) to display currency. */
export function formatMinor(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}
