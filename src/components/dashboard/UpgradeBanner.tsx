"use client";

import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPlanConfig } from "@/lib/tierLimits";
import type { Plan } from "@/services/billingService";

interface UpgradeBannerProps {
  plan: Plan;
  usage: number;
  limit: number;
  resource: string;
  onUpgrade?: () => void;
}

export function UpgradeBanner({ plan, usage, limit, resource, onUpgrade }: UpgradeBannerProps) {
  const planConfig = getPlanConfig(plan);
  if (!planConfig.upgradeCTA) return null;

  const atLimit = limit > 0 && usage >= limit;
  const ratio = limit > 0 ? usage / limit : 0;
  const barColor = ratio > 0.9 ? "#DC2626" : ratio > 0.7 ? "#D97706" : "#0891B2";

  return (
    <div
      className={cn(
        "rounded-xl border p-4 mb-6 flex items-center justify-between",
        atLimit
          ? "bg-gradient-to-r from-[rgba(220,38,38,0.12)] to-[rgba(220,38,38,0.04)] border-[rgba(220,38,38,0.2)]"
          : "bg-gradient-to-r from-[rgba(8,145,178,0.12)] to-[rgba(8,145,178,0.04)] border-[rgba(8,145,178,0.2)]"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            atLimit ? "bg-[rgba(220,38,38,0.15)]" : "bg-[rgba(8,145,178,0.15)]"
          )}
        >
          <Zap className={cn("w-5 h-5", atLimit ? "text-[#DC2626]" : "text-[#0891B2]")} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#FAFAFA]">
            You&apos;re on the {planConfig.name} plan
          </p>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            {usage} of {limit === Infinity ? "\u221E" : limit} {resource} used.{" "}
            {limit > 0 && usage >= limit
              ? "You&apos;ve hit your limit."
              : `${Math.max(0, limit - usage)} remaining.`}
          </p>
          {limit > 0 && (
            <div className="w-48 h-1.5 bg-[rgba(255,255,255,0.08)] rounded-full mt-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ratio * 100)}%`, backgroundColor: barColor }}
              />
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onUpgrade}
        className="bg-[#FAFAFA] text-[#0A0A0F] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white hover:shadow-lg transition-all shrink-0"
      >
        {planConfig.upgradeCTA}
      </button>
    </div>
  );
}
