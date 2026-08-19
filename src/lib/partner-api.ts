import type {
  PartnerUser,
  PartnerDashboardData,
  Referral,
  Commission,
  Payout,
} from '@/types/partner';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const partnerApi = {
  // Auth
  async signup(data: { name: string; email: string; password: string }) {
    return request<{ user: PartnerUser; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: { email: string; password: string }) {
    return request<{ user: PartnerUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async me() {
    return request<{ user: PartnerUser }>('/auth/me');
  },

  async logout() {
    return request<{ success: boolean }>('/auth/logout', { method: 'POST' });
  },

  // Partner
  async apply() {
    return request<{ partner: { referralCode: string; status: string } }>('/partners/apply', {
      method: 'POST',
    });
  },

  async getMe() {
    return request<{ partner: { id: string; referralCode: string; status: string } }>('/partners/me');
  },

  async getDashboard() {
    return request<PartnerDashboardData>('/partners/dashboard');
  },

  async getReferrals() {
    return request<Referral[]>('/partners/referrals');
  },

  async getCommissions() {
    return request<Commission[]>('/partners/commissions');
  },

  async getPayouts() {
    return request<Payout[]>('/partners/payouts');
  },

  async requestPayout() {
    return request<{ payout: Payout }>('/partners/payouts', {
      method: 'POST',
    });
  },
};
