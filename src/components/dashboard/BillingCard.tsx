"use client";

import { useState } from "react";
import { Check, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { billingService } from "@/services/billingService";
import type { BillingPlanResponse } from "@/services/billingService";
import { toast } from "sonner";
import { format } from "date-fns";

interface BillingCardProps {
  plan: BillingPlanResponse;
}

const planDetails: Record<string, { label: string; price: string }> = {
  free: { label: "Free", price: "$0" },
  standard: { label: "Standard", price: "$49" },
  professional: { label: "Professional", price: "$99" },
  agency: { label: "Agency", price: "Custom" },
};

export function BillingCard({ plan }: BillingCardProps) {
  const details = planDetails[plan.plan] || { label: plan.plan, price: "Custom" };
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (plan.plan === "agency") {
      toast.info("Contact Reliastra for Agency pricing.");
      return;
    }
    const targetPlan = plan.plan === "free" ? "standard" : plan.plan === "standard" ? "professional" : null;
    if (!targetPlan) {
      toast.info("You are on the highest available plan.");
      return;
    }
    setUpgrading(true);
    try {
      const res = await billingService.initializePayment(targetPlan);
      window.location.href = res.authorization_url;
    } catch {
      setUpgrading(false);
      toast.error("Could not start checkout. Please try again.");
    }
  };

  return (
    <div className="rounded-lg border border-[#E4E4E7] bg-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#0891B2]/8 flex items-center justify-center">
            <Zap className="h-5 w-5 text-[#0891B2]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#09090B]">{details.label} Plan</h3>
            <p className="text-sm text-[#52525B]">{details.price}/month</p>
          </div>
        </div>
        {plan.plan !== "professional" && plan.plan !== "agency" && (
          <Button onClick={handleUpgrade} disabled={upgrading} className="bg-[#0891B2] hover:bg-[#0891B2]/90 text-white text-xs h-9">
            {upgrading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Starting checkout...
              </span>
            ) : (
              "Upgrade"
            )}
          </Button>
        )}
      </div>

      {plan.subscription_status && (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            plan.subscription_status === "active"
              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
              : plan.subscription_status === "past_due"
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-[#F8F9FA] text-[#52525B] border-[#E4E4E7]"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
              plan.subscription_status === "active" ? "bg-emerald-500" : "bg-[#71717A]"
            }`} />
            {plan.subscription_status.replace("_", " ")}
          </span>
          {plan.current_period_end && (
            <span className="text-xs text-[#A1A1AA]">
              Renews {format(new Date(plan.current_period_end), "MMM d, yyyy")}
            </span>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#52525B]">Dependencies</span>
          <span className="text-sm text-[#09090B] font-medium">{plan.max_dependencies === 10000 ? "Unlimited" : plan.max_dependencies}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#52525B]">Min check interval</span>
          <span className="text-sm text-[#09090B] font-medium">{plan.min_check_interval_seconds}s</span>
        </div>
      </div>

      <div className="border-t border-[#E4E4E7] pt-4 space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA] mb-3">Plan Features</p>
        {[
          `Up to ${plan.max_dependencies === 10000 ? "unlimited" : plan.max_dependencies} dependencies`,
          `${plan.min_check_interval_seconds}s minimum check interval`,
          "SLA evidence reports",
          "Multi-region monitoring",
          "Email, Slack, PagerDuty, and webhook notifications",
          "API key access",
        ].map((f) => (
          <div key={f} className="flex items-center gap-2 text-sm text-[#52525B]">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}
