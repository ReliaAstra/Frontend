export interface PartnerUser {
  id: string;
  email: string;
  name: string | null;
  isPartner: boolean;
  partner?: Partner;
}

export interface Partner {
  id: string;
  referralCode: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Referral {
  id: string;
  referredEmail: string | null;
  referredName: string | null;
  plan: string | null;
  status: 'pending' | 'active' | 'cancelled';
  monthlyEarned: number;
  createdAt: string;
}

export interface Commission {
  id: string;
  referralId: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'payable' | 'paid';
  period: string | null;
  createdAt: string;
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface PartnerDashboardData {
  totalEarned: number;
  thisMonth: number;
  activeCustomers: number;
  payable: number;
  referralLink: string;
  referrals: Referral[];
  recentCommissions: Commission[];
}

export type PartnerPage =
  | 'home'
  | 'earn'
  | 'how-it-works'
  | 'commission'
  | 'faq'
  | 'resources'
  | 'apply'
  | 'login'
  | 'signup'
  | 'activation'
  | 'dashboard'
  | 'referrals'
  | 'earnings'
  | 'payouts'
  | 'settings'
  | 'support'
  | 'forgot-password';
