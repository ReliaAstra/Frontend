import { apiClient } from "@/lib/api";

// ── Types matching the live OpenAPI spec ─────────────────────────────────────

export type Plan = "free" | "starter" | "standard" | "professional" | "agency";

/** Matches live schema PlanDetailsResponse */
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

/** Matches live schema InitializePaymentResponse */
export interface CheckoutResponse {
  authorization_url: string;
  reference: string;
  access_code: string;
}

/** Matches live schema VerifyTransactionResponse */
export interface VerifyTransactionResponse {
  verified: boolean;
  plan: string;
  reference: string;
}

/** Matches live schema PricingPlanResponse */
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

/** Matches live schema PricingPlansResponse */
export interface PricingPlansResponse {
  plans: PricingPlanResponse[];
}

/** Matches live schema FoundingSpotsResponse */
export interface FoundingSpotsResponse {
  total_spots: number;
  spots_taken: number;
  spots_remaining: number;
  founding_discount_pct: number;
  eligible_plans: string[];
  plan_discounts: Record<string, Record<string, unknown>>;
}

/** Matches live schema ClaimFoundingSpotResponse */
export interface ClaimFoundingSpotResponse {
  success: boolean;
  message: string;
  is_founding_customer: boolean;
  founding_discount_pct: number;
}

// ── Service ──────────────────────────────────────────────────────────────────

export const billingService = {
  /** GET /v1/billing/plan — current organization plan details (auth) */
  async getPlan(): Promise<PlanDetailsResponse> {
    const res = await apiClient.get<PlanDetailsResponse>("/billing/plan");
    return res.data;
  },

  /** POST /v1/billing/initialize — initialize Paystack checkout for a plan upgrade (auth) */
  async initializePayment(plan: string, email?: string): Promise<CheckoutResponse> {
    const res = await apiClient.post<CheckoutResponse>("/billing/initialize", {
      plan,
      email: email || null,
    });
    return res.data;
  },

  /**
   * POST /v1/billing/verify?reference= — verify a Paystack transaction.
   * NOTE: the live endpoint requires authentication and takes the reference
   * as a query parameter (no request body).
   */
  async verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
    const res = await apiClient.post<VerifyTransactionResponse>("/billing/verify", null, {
      params: { reference },
    });
    return res.data;
  },

  /** GET /v1/pricing — public pricing plans (no auth required) */
  async getPricingPlans(): Promise<PricingPlansResponse> {
    const res = await apiClient.get<PricingPlansResponse>("/pricing");
    return res.data;
  },

  /** GET /v1/billing/founding-spots — founding customer program status (auth) */
  async getFoundingSpots(): Promise<FoundingSpotsResponse> {
    const res = await apiClient.get<FoundingSpotsResponse>("/billing/founding-spots");
    return res.data;
  },

  /** POST /v1/billing/founding-spot/claim — claim a founding spot (owner/admin) */
  async claimFoundingSpot(email?: string): Promise<ClaimFoundingSpotResponse> {
    const res = await apiClient.post<ClaimFoundingSpotResponse>("/billing/founding-spot/claim", {
      email: email ?? null,
    });
    return res.data;
  },
};
