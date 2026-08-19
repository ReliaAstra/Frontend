import { BackendError, apiClient } from '@/lib/api';
import type { CommissionRate, PartnerProgram } from '@/types/partner';

export interface PartnerTier {
  id: string;
  key: string;
  title: string;
  rateLabel: string;
  description: string;
  availability?: string | null;
  source: 'api' | 'fallback';
}

export interface PartnerResource {
  id?: string;
  category: string;
  title: string;
  description: string;
  href?: string | null;
  type?: string | null;
  updated_at?: string | null;
}

export interface PublicPartnerApplicationInput {
  partner_type: string;
  earning_methods: string[];
  audience_description: string;
  agreement_accepted: boolean;
}

export interface PublicPartnerApplicationResponse {
  status?: string;
  partner_id?: string;
  referral_identity?: string;
  partner_code?: string;
  message?: string;
  [key: string]: unknown;
}

function asRateLabel(rate: number | null | undefined) {
  if (typeof rate !== 'number' || Number.isNaN(rate) || rate <= 0) return 'Contact us';
  return `${rate}% recurring`;
}

function transformCommission(commission: CommissionRate): PartnerTier {
  const key = commission.action_type;
  const title =
    key === 'refer'
      ? 'Refer'
      : key === 'deploy'
        ? 'Deploy'
        : key === 'introduce'
          ? 'Introduce'
          : 'Create';

  return {
    id: commission.id,
    key,
    title,
    rateLabel: asRateLabel(commission.rate),
    description: commission.description,
    source: 'api',
  };
}

function transformProgram(program: PartnerProgram | null | undefined): PartnerTier[] {
  return (program?.commission_rates ?? []).map(transformCommission);
}

function fallbackTiers(): PartnerTier[] {
  return [
    {
      id: 'fallback-refer',
      key: 'refer',
      title: 'Refer',
      rateLabel: '20% recurring',
      description: 'Share RELIASTRA with companies in your network and earn when they become qualified customers.',
      source: 'fallback',
    },
    {
      id: 'fallback-deploy',
      key: 'deploy',
      title: 'Deploy',
      rateLabel: 'Up to 30% recurring',
      description: 'Help customers implement RELIASTRA as part of a broader delivery or advisory engagement.',
      source: 'fallback',
    },
    {
      id: 'fallback-introduce',
      key: 'introduce',
      title: 'Introduce',
      rateLabel: 'Performance-based',
      description: 'Make a qualified introduction and earn when that opportunity converts under program terms.',
      source: 'fallback',
    },
    {
      id: 'fallback-create',
      key: 'create',
      title: 'Create',
      rateLabel: 'Performance-based',
      description: 'Publish technical content that brings high-intent infrastructure teams to RELIASTRA.',
      source: 'fallback',
    },
    {
      id: 'fallback-resell',
      key: 'resell',
      title: 'Resell',
      rateLabel: 'Wholesale margin',
      description: 'Selective models for partners managing RELIASTRA within a client service relationship.',
      availability: 'Availability varies',
      source: 'fallback',
    },
  ];
}

function isNotFound(error: unknown) {
  return error instanceof BackendError && error.status === 404;
}

export async function getPartnerTiers(signal?: AbortSignal): Promise<PartnerTier[]> {
  try {
    const { data } = await apiClient.get<PartnerTier[] | { items: PartnerTier[] }>('/partners/tiers', {
      signal,
    });
    const items = Array.isArray(data) ? data : data?.items ?? [];
    if (items.length > 0) {
      return items.map((item, index) => ({
        id: item.id ?? `${item.key ?? item.title}-${index}`,
        key: item.key ?? item.title?.toLowerCase().replace(/\s+/g, '-') ?? `tier-${index}`,
        title: item.title,
        rateLabel: item.rateLabel,
        description: item.description,
        availability: item.availability ?? null,
        source: 'api',
      }));
    }
  } catch (error) {
    if (!isNotFound(error)) {
      try {
        const tiers = await getPartnerProgram(signal);
        if (tiers.length > 0) return tiers;
      } catch {}
      throw error;
    }
  }

  const tiers = await getPartnerProgram(signal).catch(() => []);
  return tiers.length > 0 ? tiers : fallbackTiers();
}

export async function getPartnerProgram(signal?: AbortSignal): Promise<PartnerTier[]> {
  const { data } = await apiClient.get<PartnerProgram>('/partner-program', { signal });
  const transformed = transformProgram(data);
  return transformed.length > 0 ? transformed : fallbackTiers();
}

export async function getPartnerResources(signal?: AbortSignal): Promise<PartnerResource[]> {
  try {
    const { data } = await apiClient.get<PartnerResource[] | { items: PartnerResource[] }>('/partners/resources', {
      signal,
    });
    const items = Array.isArray(data) ? data : data?.items ?? [];
    return items.map((item, index) => ({
      id: item.id ?? `${item.category}-${index}`,
      category: item.category,
      title: item.title,
      description: item.description,
      href: item.href ?? null,
      type: item.type ?? null,
      updated_at: item.updated_at ?? null,
    }));
  } catch (error) {
    if (isNotFound(error)) return [];
    throw error;
  }
}

export async function applyPartner(
  payload: PublicPartnerApplicationInput,
  signal?: AbortSignal,
): Promise<PublicPartnerApplicationResponse> {
  const { data } = await apiClient.post<PublicPartnerApplicationResponse>('/partners/apply', payload, {
    signal,
  });
  return data ?? {};
}

export async function getPublicPartner(partnerSlug: string, signal?: AbortSignal) {
  const { data } = await apiClient.get(`/public/partners/${partnerSlug}`, { signal });
  return data;
}

export async function getPublicReferral(partnerCode: string, signal?: AbortSignal) {
  const { data } = await apiClient.get(`/public/referral/${partnerCode}`, { signal });
  return data;
}
