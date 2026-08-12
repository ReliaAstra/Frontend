"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Zap, Check } from "lucide-react";
import type { BillingPlan } from "@/services/billingService";

interface BillingCardProps {
  plan: BillingPlan;
}

export function BillingCard({ plan }: BillingCardProps) {
  const depUsage = (plan.current_usage.dependencies / plan.dependencies_limit) * 100;
  const checkUsage = (plan.current_usage.checks_this_month / plan.checks_per_month) * 100;

  return (
    <div className="rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#6366F1]/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-[#6366F1]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#F1F5F9]">{plan.name} Plan</h3>
            <p className="text-sm text-[#94A3B8]">${plan.price_monthly}/month</p>
          </div>
        </div>
        <Button className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white text-xs h-9">
          Upgrade
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#94A3B8]">Dependencies</span>
            <span className="text-sm text-[#F1F5F9] font-medium">{plan.current_usage.dependencies} / {plan.dependencies_limit}</span>
          </div>
          <Progress value={depUsage} className="h-2 bg-[#2A2D3A]" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#94A3B8]">Checks this month</span>
            <span className="text-sm text-[#F1F5F9] font-medium">{(plan.current_usage.checks_this_month / 1000).toFixed(0)}k / {(plan.checks_per_month / 1000).toFixed(0)}k</span>
          </div>
          <Progress value={checkUsage} className="h-2 bg-[#2A2D3A]" />
        </div>
      </div>

      <div className="border-t border-[#2A2D3A] pt-4 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-[#64748B] mb-3">Plan Features</p>
        {[`Up to ${plan.dependencies_limit} dependencies`, `${(plan.checks_per_month / 1000).toFixed(0)}k checks/month`, `${plan.incidents_retention_days}-day incident retention`, "SLA evidence reports", "Multi-region monitoring", "Email & Slack notifications"].map((f) => (
          <div key={f} className="flex items-center gap-2 text-sm text-[#94A3B8]">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}
