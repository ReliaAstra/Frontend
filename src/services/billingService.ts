import { apiClient } from "@/lib/api";

export interface BillingPlan {
  name: string;
  tier: string;
  price_monthly: number;
  dependencies_limit: number;
  checks_per_month: number;
  incidents_retention_days: number;
  current_usage: {
    dependencies: number;
    checks_this_month: number;
  };
}

export const mockPlan: BillingPlan = {
  name: "Pro",
  tier: "pro",
  price_monthly: 149,
  dependencies_limit: 50,
  checks_per_month: 500000,
  incidents_retention_days: 90,
  current_usage: {
    dependencies: 12,
    checks_this_month: 245890,
  },
};

export const billingService = {
  async getPlan(): Promise<BillingPlan> {
    try {
      const res = await apiClient.get("/billing/plan");
      return res.data;
    } catch {
      return mockPlan;
    }
  },
};
