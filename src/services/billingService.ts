import { apiClient, getOrgContext } from "@/lib/api";

// ── Types matching OpenAPI spec ──────────────────────────────────────────────

export type Plan = "free" | "starter" | "standard" | "professional" | "agency";

export interface PlanDetailsResponse {
  org_id: string;
  plan: Plan;
  max_dependencies: number;
  min_check_interval_seconds: number;
  subscription_status: string | null;
  current_period_end: string | null;
  is_founding_customer: boolean;
  founding_discount_pct: number;
  price_usd: number;
  discounted_price_usd: number | null;
}

export interface CheckoutResponse {
  authorization_url: string;
  reference: string;
  access_code: string;
}

export interface VerifyTransactionResponse {
  verified: boolean;
  plan: string;
  reference: string;
}

export interface FoundingSpotsResponse {
  total_spots: number;
  spots_taken: number;
  spots_remaining: number;
  founding_discount_pct: number;
  eligible_plans: string[];
  plan_discounts: Record<string, number>;
}

export interface ClaimFoundingSpotResponse {
  success: boolean;
  message: string;
  is_founding_customer: boolean;
  founding_discount_pct: number;
}

export interface PricingPlanResponse {
  plan: Plan;
  display_name: string;
  description: string;
  tag: string | null;
  price_usd: number;
  max_dependencies: number;
  min_check_interval_seconds: number;
  data_retention_days: number;
  features: Record<string, boolean>;
}

export interface PricingPlansResponse {
  plans: PricingPlanResponse[];
}

// ── Service ──────────────────────────────────────────────────────────────────

export const billingService = {
  /** Get current organization plan details (auth required) */
  async getPlan(): Promise<PlanDetailsResponse> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<PlanDetailsResponse>(`/orgs/${orgId}/billing/plan`);
    return res.data;
  },

  /** Initialize Paystack checkout for a plan upgrade */
  async initializePayment(plan: string, email?: string): Promise<CheckoutResponse> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.post<CheckoutResponse>(`/orgs/${orgId}/billing/initialize`, {
      plan,
      email: email || null,
    });
    return res.data;
  },

  /** Verify a Paystack transaction (public endpoint, no org context needed) */
  async verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
    const res = await apiClient.get<VerifyTransactionResponse>("/billing/verify", {
      params: { reference },
    });
    return res.data;
  },

  /** Get founding spots availability and discount info */
  async getFoundingSpots(): Promise<FoundingSpotsResponse> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<FoundingSpotsResponse>(`/orgs/${orgId}/billing/founding-spots`);
    return res.data;
  },

  /** Claim a founding spot discount */
  async claimFoundingSpot(email?: string): Promise<ClaimFoundingSpotResponse> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.post<ClaimFoundingSpotResponse>(
      `/orgs/${orgId}/billing/founding-spot/claim`,
      { email: email || null },
    );
    return res.data;
  },

  /** Get public pricing plans (no auth required) */
  async getPricingPlans(): Promise<PricingPlansResponse> {
    const res = await apiClient.get<PricingPlansResponse>("/public/pricing");
    return res.data;
  },
};
