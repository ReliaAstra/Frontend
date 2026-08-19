import { apiClient } from '@/lib/api';
import { formatMinor } from '@/types/partner';
import type {
  PartnerProgram,
  PartnerApplicationCreate,
  PartnerProfile,
  PartnerDashboardData,
  CommissionItem,
  ReferralLink,
  ReferralLinkCreate,
  ReferredCustomer,
  Settlement,
  PartnerAnalytics,
} from '@/types/partner';

// ── Unwrap paginated or array responses ─────────────────────────

function unwrap<T>(data: T[] | { items: T[] } | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return (data as { items: T[] }).items ?? [];
}

// ── Partner Program ─────────────────────────────────────────────

export async function getPartnerProgram(): Promise<PartnerProgram> {
  const { data } = await apiClient.get<PartnerProgram>('/partner-program');
  return data;
}

// ── Application ─────────────────────────────────────────────────

export async function applyToPartner(application: PartnerApplicationCreate): Promise<void> {
  await apiClient.post('/partners/apply', application);
}

// ── Partner Profile ─────────────────────────────────────────────

export async function getPartnerProfile(): Promise<PartnerProfile> {
  const { data } = await apiClient.get<PartnerProfile>('/partners/me');
  return data;
}

// ── Partner Dashboard ───────────────────────────────────────────

export async function getPartnerDashboard(): Promise<PartnerDashboardData> {
  const { data } = await apiClient.get<PartnerDashboardData>('/partners/me/dashboard');
  return data;
}

// ── Referral Links ──────────────────────────────────────────────

export async function getReferralLinks(): Promise<ReferralLink[]> {
  const { data } = await apiClient.get<ReferralLink[] | { items: ReferralLink[] }>('/partners/me/referral-links');
  return unwrap(data);
}

export async function createReferralLink(payload: ReferralLinkCreate): Promise<ReferralLink> {
  const { data } = await apiClient.post<ReferralLink>('/partners/me/referral-links', payload);
  return data;
}

// ── Commissions ─────────────────────────────────────────────────

export async function getCommissions(): Promise<CommissionItem[]> {
  const { data } = await apiClient.get<CommissionItem[] | { items: CommissionItem[] }>('/partners/me/commissions');
  return unwrap(data);
}

export async function getCommissionBalance(): Promise<{ available: number; pending: number; total_paid: number }> {
  const { data } = await apiClient.get('/partners/me/balance');
  return data;
}

// ── Referred Customers ──────────────────────────────────────────

export async function getReferredCustomers(): Promise<ReferredCustomer[]> {
  const { data } = await apiClient.get<ReferredCustomer[] | { items: ReferredCustomer[] }>('/partners/me/referred-customers');
  return unwrap(data);
}

// ── Settlements ─────────────────────────────────────────────────

export async function getSettlements(): Promise<Settlement[]> {
  const { data } = await apiClient.get<Settlement[] | { items: Settlement[] }>('/partners/me/settlements');
  return unwrap(data);
}

// ── Analytics ───────────────────────────────────────────────────

export async function getPartnerAnalytics(): Promise<PartnerAnalytics> {
  const { data } = await apiClient.get<PartnerAnalytics>('/partners/me/analytics');
  return data;
}

export { formatMinor };
