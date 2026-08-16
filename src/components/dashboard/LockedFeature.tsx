"use client";

import { Lock } from "lucide-react";
import { getPlanConfig, canAccessFeature } from "@/lib/tierLimits";
import type { Plan } from "@/services/billingService";

interface LockedFeatureProps {
  currentPlan: Plan;
  feature: "evidence" | "apiKeys" | "slack" | "pagerduty" | "webhook" | "team" | "clients" | "interval_15" | "interval_30" | "multi_region";
  children: React.ReactNode;
  onUpgrade?: () => void;
  className?: string;
}

export function LockedFeature({ currentPlan, feature, children, onUpgrade, className }: LockedFeatureProps) {
  const { allowed, requiredPlan } = canAccessFeature(currentPlan, feature);
  const requiredConfig = getPlanConfig(requiredPlan);

  if (allowed) return <>{children}</>;

  return (
    <div className={`relative ${className || ""}`}>
      <div className="opacity-50 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-[rgba(10,10,15,0.6)] backdrop-blur-sm rounded-xl">
        <div className="text-center">
          <Lock className="w-6 h-6 text-[#52525B] mx-auto" />
          <p className="text-sm font-medium text-[#FAFAFA] mt-2">
            {requiredConfig.name} plan required
          </p>
          <p className="text-xs text-[#A1A1AA] mt-1">Upgrade to unlock this feature</p>
          <button
            onClick={onUpgrade}
            className="mt-3 bg-[#0891B2] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#0E7490] transition-colors"
          >
            Upgrade to {requiredConfig.name}
          </button>
        </div>
      </div>
    </div>
  );
}
