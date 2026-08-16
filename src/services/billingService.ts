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

  /** Get public pricing plans (no auth required) */
  async getPricingPlans(): Promise<PricingPlansResponse> {
    const res = await apiClient.get<PricingPlansResponse>("/public/pricing");
    return res.data;
  },
};
