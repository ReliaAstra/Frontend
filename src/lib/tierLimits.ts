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
      evidence: 0,
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
      "24h data retention",
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
      evidence: 10,
      apiKeys: 0,
      regions: 2,
      interval: 60,
      team: 3,
      retentionDays: 7,
      notifications: ["email", "slack"],
    },
    features: [
      "7-day data retention",
      "Email & Slack alerts",
      "Limited attribution",
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
      clients: 5,
      sites: 20,
      evidence: 100,
      apiKeys: 1,
      regions: 4,
      interval: 30,
      team: 5,
      retentionDays: 30,
      notifications: ["email", "slack", "webhook", "pagerduty"],
    },
    features: [
      "Incident correlation",
      "Deterministic attribution",
      "Evidence generation",
      "Slack, Webhook, PagerDuty",
      "Historical analysis",
      "Client groups",
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
      clients: 15,
      sites: 50,
      evidence: 500,
      apiKeys: 5,
      regions: 6,
      interval: 15,
      team: 10,
      retentionDays: 90,
      notifications: ["email", "slack", "webhook", "pagerduty"],
    },
    features: [
      "90-day retention",
      "Custom-branded evidence",
      "15s check intervals",
      "Full API access",
      "All notification channels",
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
      retentionDays: 365,
      notifications: ["email", "slack", "webhook", "pagerduty"],
    },
    features: [
      "Unlimited clients & sites",
      "Agency branding",
      "Client-facing reports",
      "White-label evidence",
      "Dedicated support",
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
    slack: "starter",
    pagerduty: "standard",
    webhook: "standard",
    team: "starter",
    clients: "standard",
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
