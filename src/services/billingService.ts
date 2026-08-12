import { apiClient, getOrgContext } from "@/lib/api";

export interface BillingPlanResponse {
  org_id: string;
  plan: "free" | "standard" | "professional" | "agency";
  max_dependencies: number;
  min_check_interval_seconds: number;
  subscription_status: string | null;
  current_period_end: string | null;
}

export interface CheckoutResponse {
  authorization_url: string;
  reference: string;
  access_code: string;
}

export const billingService = {
  async getPlan(): Promise<BillingPlanResponse> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<BillingPlanResponse>(`/orgs/${orgId}/billing/plan`);
    return res.data;
  },

  async initializePayment(plan: string, email?: string): Promise<CheckoutResponse> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.post<CheckoutResponse>(`/orgs/${orgId}/billing/initialize`, {
      plan,
      email: email || null,
    });
    return res.data;
  },
};
