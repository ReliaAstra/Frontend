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
    <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#0891B2]/8 flex items-center justify-center">
            <Zap className="h-5 w-5 text-[#0891B2]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{plan.name} Plan</h3>
            <p className="text-sm text-gray-500">${plan.price_monthly}/month</p>
          </div>
        </div>
        <Button className="bg-[#0891B2] hover:bg-[#0891B2]/90 text-white text-xs h-9">
          Upgrade
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Dependencies</span>
            <span className="text-sm text-gray-900 font-medium">{plan.current_usage.dependencies} / {plan.dependencies_limit}</span>
          </div>
          <Progress value={depUsage} className="h-2 bg-gray-200" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Checks this month</span>
            <span className="text-sm text-gray-900 font-medium">{(plan.current_usage.checks_this_month / 1000).toFixed(0)}k / {(plan.checks_per_month / 1000).toFixed(0)}k</span>
          </div>
          <Progress value={checkUsage} className="h-2 bg-gray-200" />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3">Plan Features</p>
        {[`Up to ${plan.dependencies_limit} dependencies`, `${(plan.checks_per_month / 1000).toFixed(0)}k checks/month`, `${plan.incidents_retention_days}-day incident retention`, "SLA evidence reports", "Multi-region monitoring", "Email & Slack notifications"].map((f) => (
          <div key={f} className="flex items-center gap-2 text-sm text-gray-500">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}
