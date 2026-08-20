import type { Plan } from "@/services/billingService";

export interface PlanLimits {
  dependencies: number;
  clients: number;
  sites: number;
  evidence: number;
  apiKeys: number;
  regions: number;
  interval: number;
  team: number;
  retentionDays: number;
  notifications: string[];
}

export interface PlanConfig {
  name: string;
  plan: Plan;
  price: number;
  priceDisplay: string;
  limits: PlanLimits;
  features: string[];
  upgradeCTA: string | null;
  nextPlan: Plan | null;
}

/**
 * Canonical commercial contract. Keep in lockstep with
 * src/app/(marketing)/pricing/pricing-content.tsx comparison table.
 */
export const PLANS: Record<Plan, PlanConfig> = {
  free: {
    name: "Free",
    plan: "free",
    price: 0,
    priceDisplay: "$0",
    limits: {
      dependencies: 3,
      clients: 0,
      sites: 0,
      evidence: 1,
      apiKeys: 0,
      regions: 1,
      interval: 60,
      team: 1,
      retentionDays: 1,
      notifications: ["email"],
    },
    features: [
      "Custom endpoint URLs",
      "Email alerts",
      "Basic incident detection",
      "24-hour data retention",
      "1 evidence report / month",
    ],
    upgradeCTA: "Upgrade to Starter",
    nextPlan: "starter",
  },
  starter: {
    name: "Starter",
    plan: "starter",
    price: 19,
    priceDisplay: "$19",
    limits: {
      dependencies: 10,
      clients: 0,
      sites: 0,
      evidence: 5,
      apiKeys: 0,
      regions: 1,
      interval: 60,
      team: 3,
      retentionDays: 7,
      notifications: ["email"],
    },
    features: [
      "7-day data retention",
      "Email alerts",
      "Limited attribution",
      "Limited evidence generation",
      "Basic dependency history",
    ],
    upgradeCTA: "Upgrade to Standard",
    nextPlan: "standard",
  },
  standard: {
    name: "Standard",
    plan: "standard",
    price: 49,
    priceDisplay: "$49",
    limits: {
      dependencies: 30,
      clients: 0,
      sites: 0,
      evidence: 100,
      apiKeys: 1,
      regions: 3,
      interval: 60,
      team: 5,
      retentionDays: 30,
      notifications: ["email", "slack"],
    },
    features: [
      "Incident correlation",
      "Deterministic attribution",
      "Evidence generation (PDF & JSON)",
      "Slack alerts",
      "API access",
      "30-day data retention",
    ],
    upgradeCTA: "Upgrade to Professional",
    nextPlan: "professional",
  },
  professional: {
    name: "Professional",
    plan: "professional",
    price: 99,
    priceDisplay: "$99",
    limits: {
      dependencies: 100,
      clients: 0,
      sites: 0,
      evidence: 500,
      apiKeys: 5,
      regions: 6,
      interval: 15,
      team: 10,
      retentionDays: 90,
      notifications: ["email", "slack", "webhook", "pagerduty"],
    },
    features: [
      "90-day evidence retention",
      "Advanced incident correlation",
      "Automated dependency attribution",
      "Custom-branded evidence reports",
      "Exportable PDF/JSON evidence",
      "API access",
      "Faster check intervals (15s)",
      "All notification channels",
      "Historical dependency analysis",
      "Team collaboration (up to 10)",
    ],
    upgradeCTA: "Upgrade to Agency",
    nextPlan: "agency",
  },
  agency: {
    name: "Agency",
    plan: "agency",
    price: 199,
    priceDisplay: "$199",
    limits: {
      dependencies: 500,
      clients: Infinity,
      sites: Infinity,
      evidence: Infinity,
      apiKeys: 10,
      regions: 12,
      interval: 15,
      team: 25,
      retentionDays: 90,
      notifications: ["email", "slack", "webhook", "pagerduty"],
    },
    features: [
      "Client workspaces",
      "Client isolation",
      "White-label branding",
      "Client-facing evidence reports",
      "Shared dependency intelligence",
      "Agency API",
      "Everything in Professional",
    ],
    upgradeCTA: null,
    nextPlan: null,
  },
};

export function getPlanConfig(plan: Plan): PlanConfig {
  return PLANS[plan] || PLANS.free;
}

export function canAccessFeature(
  currentPlan: Plan,
  feature: "evidence" | "apiKeys" | "slack" | "pagerduty" | "webhook" | "team" | "clients" | "interval_15" | "interval_30" | "multi_region",
  targetPlan?: Plan
): { allowed: boolean; requiredPlan: Plan } {
  const featureRequirements: Record<string, Plan> = {
    evidence: "standard",
    apiKeys: "standard",
    slack: "standard",
    pagerduty: "professional",
    webhook: "professional",
    team: "starter",
    clients: "agency",
    interval_15: "professional",
    interval_30: "standard",
    multi_region: "starter",
  };
  const required = targetPlan || featureRequirements[feature] || "standard";
  const planOrder: Plan[] = ["free", "starter", "standard", "professional", "agency"];
  return {
    allowed: planOrder.indexOf(currentPlan) >= planOrder.indexOf(required),
    requiredPlan: required,
  };
}
