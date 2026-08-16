"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { User, CreditCard, Users, Check, Lock, Zap, Globe, FileText, Key, Bell } from "lucide-react";
import { ConsoleCard, ConsoleCardHeader, ConsoleCardBody } from "@/components/dashboard/ConsoleLayout";
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner";
import { getPlanConfig, PLANS } from "@/lib/tierLimits";
import { apiClient, BackendError } from "@/lib/api";
import { type Plan, type PricingPlanResponse } from "@/services/billingService";
import { toast } from "sonner";
import {
  useBillingPlan,
  usePricingPlans,
  useOrgMembers,
  useInviteMember,
  useInitializePayment,
  useVerifyPayment,
} from "@/hooks/useApi";
import type { OrgMemberResponse } from "@/services/orgService";

const tabs = [
  { key: "profile", label: "Profile", icon: User },
  { key: "team", label: "Team", icon: Users },
  { key: "billing", label: "Billing", icon: CreditCard },
] as const;

// All features that can be checked across plans
const allFeatures = [
  { key: "dependencies", label: "Dependency monitoring" },
  { key: "email_alerts", label: "Email alerts" },
  { key: "slack_alerts", label: "Slack alerts" },
  { key: "webhook_alerts", label: "Webhook alerts" },
  { key: "pagerduty_alerts", label: "PagerDuty alerts" },
  { key: "evidence", label: "Evidence generation" },
  { key: "attribution", label: "Deterministic attribution" },
  { key: "client_groups", label: "Client groups" },
  { key: "api_keys", label: "API access" },
  { key: "custom_branding", label: "Custom branding" },
  { key: "client_reports", label: "Client-facing reports" },
  { key: "white_label", label: "White-label evidence" },
  { key: "multi_region", label: "Multi-region checks" },
  { key: "fast_intervals", label: "15s check intervals" },
  { key: "long_retention", label: "Extended data retention" },
];

const featurePlanMap: Record<string, Plan[]> = {
  dependencies: ["free", "starter", "standard", "professional", "agency"],
  email_alerts: ["free", "starter", "standard", "professional", "agency"],
  slack_alerts: ["starter", "standard", "professional", "agency"],
  webhook_alerts: ["standard", "professional", "agency"],
  pagerduty_alerts: ["standard", "professional", "agency"],
  evidence: ["standard", "professional", "agency"],
  attribution: ["standard", "professional", "agency"],
  client_groups: ["standard", "professional", "agency"],
  api_keys: ["standard", "professional", "agency"],
  custom_branding: ["professional", "agency"],
  client_reports: ["agency"],
  white_label: ["agency"],
  multi_region: ["starter", "standard", "professional", "agency"],
  fast_intervals: ["professional", "agency"],
  long_retention: ["starter", "standard", "professional", "agency"],
};

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, memberRole, currentOrg, isLoading: authLoading } = useAuth();

  const activeTab = searchParams.get("tab") || "profile";

  // ── TanStack Query hooks ──
  const { data: plan } = useBillingPlan();
  const { data: pricingPlans } = usePricingPlans();
  const {
    data: members = [],
    isLoading: membersLoading,
    isError: membersError,
  } = useOrgMembers();
  const inviteMutation = useInviteMember();
  const initializePayment = useInitializePayment();
  const verifyPayment = useVerifyPayment();

  // Profile state
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // Team state
  const [inviteEmail, setInviteEmail] = useState("");
  const [membersErrorMsg, setMembersErrorMsg] = useState<string | null>(null);

  // Billing state
  const [billingError, setBillingError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [verifyingRef, setVerifyingRef] = useState(false);

  // Initialize profile
  useEffect(() => {
    if (user) {
      setName(user.full_name);
    }
  }, [user]);

  // ── Auto-verify Paystack payment on return ──
  useEffect(() => {
    const reference = searchParams.get("reference");
    if (reference && !verifyingRef) {
      setVerifyingRef(true);
      verifyPayment.mutateAsync(reference)
        .then(() => {
          toast.success("Payment verified! Your plan has been updated.");
          // Clean URL
          const url = new URL(window.location.href);
          url.searchParams.delete("reference");
          router.replace(url.pathname + url.search);
        })
        .catch(() => {
          toast.error("Payment verification failed. Please contact support.");
        })
        .finally(() => {
          setVerifyingRef(false);
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProfileUpdate = async () => {
    setSaving(true);
    try {
      await apiClient.patch("/users/me", { full_name: name });
      toast.success("Profile updated.");
    } catch (err) {
      if (err instanceof BackendError) {
        toast.error(err.message);
      } else {
        toast.error("Unable to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !currentOrg?.id) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      await inviteMutation.mutateAsync({ orgId: currentOrg.id, email: inviteEmail });
      toast.success(`Invitation sent to ${inviteEmail}.`);
      setInviteEmail("");
    } catch {
      toast.error("Failed to send invitation.");
    }
  };

  const handleUpgrade = async (targetPlan: string) => {
    setUpgrading(targetPlan);
    try {
      const result = await initializePayment.mutateAsync({ plan: targetPlan, email: user?.email });
      // Paystack authorization_url handles the payment, then redirects back to our callback
      // The callback_url is configured server-side to include the reference param
      window.location.href = result.authorization_url;
    } catch {
      toast.error("Failed to initialize payment.");
    } finally {
      setUpgrading(null);
    }
  };

  const setTab = (tab: string) => {
    router.push(`/settings?tab=${tab}`);
  };

  if (authLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-48 bg-[#1C1C22]" />
        <Skeleton className="h-[400px] rounded-xl bg-[#1C1C22]" />
      </div>
    );
  }

  const currentPlanTyped = (plan?.plan || "free") as Plan;
  const planConfig = getPlanConfig(currentPlanTyped);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[15px] font-semibold text-[#FAFAFA] tracking-tight">
          Settings
        </h1>
        <p className="text-[12px] text-[#A1A1AA] mt-1">
          Manage your account and organization
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-lg bg-[#131318] border border-[rgba(255,255,255,0.08)] p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setTab(tab.key)}
              className={cn(
                "rounded-md px-4 py-2 text-xs font-medium transition-colors flex items-center gap-2",
                activeTab === tab.key
                  ? "bg-[rgba(255,255,255,0.08)] text-[#FAFAFA]"
                  : "text-[#A1A1AA] hover:text-[#FAFAFA]"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="max-w-2xl">
          <ConsoleCard>
            <ConsoleCardBody className="space-y-6">
              {/* Avatar + Name Row */}
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0891B2] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#FAFAFA]">
                    {user?.full_name}
                  </p>
                  <p className="text-[12px] text-[#A1A1AA] capitalize">
                    {memberRole || "Member"}
                  </p>
                </div>
              </div>

              <div className="h-px bg-[rgba(255,255,255,0.05)]" />

              {/* Full Name */}
              <div>
                <label className="text-[13px] font-medium text-[#A1A1AA] mb-1.5 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1C1C22] border border-[rgba(255,255,255,0.08)] rounded-lg px-3.5 py-2.5 text-[13px] text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-colors"
                />
              </div>

              {/* Email (readonly) */}
              <div>
                <label className="text-[13px] font-medium text-[#A1A1AA] mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="w-full bg-[#1C1C22] border border-[rgba(255,255,255,0.08)] rounded-lg px-3.5 py-2.5 text-[13px] text-[#52525B] cursor-not-allowed focus:outline-none"
                />
              </div>

              {/* Update Button */}
              <button
                onClick={handleProfileUpdate}
                disabled={saving}
                className="bg-[#FAFAFA] text-[#0A0A0F] px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Update Profile"}
              </button>
            </ConsoleCardBody>
          </ConsoleCard>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <div className="max-w-3xl space-y-5">
          {/* Free plan banner */}
          {currentPlanTyped === "free" && (
            <div className="rounded-xl border border-[rgba(8,145,178,0.2)] bg-[rgba(8,145,178,0.08)] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-[#0891B2]" />
                <div>
                  <p className="text-[13px] font-medium text-[#FAFAFA]">
                    Team invites require Starter plan
                  </p>
                  <p className="text-[12px] text-[#A1A1AA]">
                    Upgrade to invite team members to your organization.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleUpgrade("starter")}
                className="bg-[#FAFAFA] text-[#0A0A0F] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-white transition-all shrink-0"
              >
                Upgrade
              </button>
            </div>
          )}

          {/* Invite Bar */}
          {currentPlanTyped !== "free" && (
            <ConsoleCard>
              <ConsoleCardBody>
                <div className="flex items-center gap-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="flex-1 bg-[#1C1C22] border border-[rgba(255,255,255,0.08)] rounded-lg px-3.5 py-2.5 text-[13px] text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-colors"
                  />
                  <button
                    onClick={handleInvite}
                    disabled={inviteMutation.isPending || !inviteEmail}
                    className="bg-[#FAFAFA] text-[#0A0A0F] px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {inviteMutation.isPending ? "Inviting..." : "Invite"}
                  </button>
                </div>
              </ConsoleCardBody>
            </ConsoleCard>
          )}

          {/* Members Table */}
          {membersLoading ? (
            <ConsoleCard>
              <div className="p-5 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[48px] bg-[#1C1C22] rounded-lg" />
                ))}
              </div>
            </ConsoleCard>
          ) : membersError ? (
            <div className="rounded-xl border border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.08)] px-4 py-3">
              <p className="text-sm text-[#DC2626]">Unable to load team members.</p>
            </div>
          ) : members.length > 0 ? (
            <ConsoleCard>
              <ConsoleCardHeader className="grid grid-cols-[1fr_1fr_100px] gap-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                  Member
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                  Role
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                  Joined
                </span>
              </ConsoleCardHeader>
              <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="px-5 py-3.5 grid grid-cols-[1fr_1fr_100px] gap-4 items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.08)] flex items-center justify-center text-[11px] font-medium text-[#A1A1AA] shrink-0">
                        {m.user_id.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[13px] font-mono text-[#FAFAFA]">
                        {m.user_id.slice(0, 12)}
                      </span>
                    </div>
                    <span className="text-[12px] text-[#A1A1AA] capitalize">
                      {m.role}
                    </span>
                    <span className="text-[12px] text-[#52525B]">
                      {new Date(m.joined_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </ConsoleCard>
          ) : (
            <ConsoleCard>
              <ConsoleCardBody className="py-12 text-center">
                <Users className="w-8 h-8 text-[#52525B] mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-[14px] font-medium text-[#FAFAFA]">
                  No team members yet
                </p>
                <p className="text-[12px] text-[#A1A1AA] mt-1">
                  {currentPlanTyped === "free"
                    ? "Upgrade your plan to invite team members."
                    : "Invite team members to collaborate on monitoring."}
                </p>
              </ConsoleCardBody>
            </ConsoleCard>
          )}
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <div className="max-w-4xl space-y-6">
          {/* Billing loading handled by TanStack Query */}
          {plan ? (
            <>
              {/* Current Plan Card (Large, Prominent) */}
              <ConsoleCard className="border-[rgba(8,145,178,0.2)]">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-[rgba(8,145,178,0.12)] flex items-center justify-center">
                          <Zap className="w-5 h-5 text-[#0891B2]" />
                        </div>
                        <div>
                          <h2 className="text-[18px] font-semibold text-[#FAFAFA]">
                            {planConfig.name} Plan
                          </h2>
                          <p className="text-[13px] text-[#A1A1AA]">
                            {planConfig.priceDisplay}/month
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                            plan.subscription_status === "active"
                              ? "bg-[rgba(22,163,74,0.12)] text-[#16A34A]"
                              : plan.price_usd === 0
                                ? "bg-[rgba(255,255,255,0.05)] text-[#52525B]"
                                : "bg-[rgba(217,119,6,0.12)] text-[#D97706]"
                          )}
                        >
                          {plan.subscription_status === "active"
                            ? "Active"
                            : plan.price_usd === 0
                              ? "Free"
                              : plan.subscription_status || "Inactive"}
                        </span>
                        {plan.current_period_end && (
                          <span className="text-[11px] text-[#52525B]">
                            Renews {new Date(plan.current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                    {planConfig.upgradeCTA && (
                      <button
                        onClick={() => planConfig.nextPlan && handleUpgrade(planConfig.nextPlan)}
                        className="bg-[#FAFAFA] text-[#0A0A0F] px-6 py-3 rounded-lg text-[13px] font-semibold hover:bg-white hover:shadow-lg transition-all shrink-0"
                      >
                        {planConfig.upgradeCTA}
                      </button>
                    )}
                  </div>
                </div>
              </ConsoleCard>

              {/* Usage Meters Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Dependencies",
                    icon: Globe,
                    used: 0,
                    limit: plan.max_dependencies,
                  },
                  {
                    label: "Evidence",
                    icon: FileText,
                    used: 0,
                    limit: planConfig.limits.evidence,
                  },
                  {
                    label: "API Keys",
                    icon: Key,
                    used: 0,
                    limit: planConfig.limits.apiKeys,
                  },
                  {
                    label: "Team",
                    icon: Users,
                    used: 1,
                    limit: planConfig.limits.team,
                  },
                ].map((meter) => {
                  const ratio =
                    meter.limit > 0 && meter.limit !== Infinity
                      ? Math.min(meter.used / meter.limit, 1)
                      : 0;
                  const barColor =
                    ratio > 0.9
                      ? "#DC2626"
                      : ratio > 0.7
                        ? "#D97706"
                        : "#0891B2";

                  return (
                    <ConsoleCard key={meter.label}>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <meter.icon className="w-4 h-4 text-[#52525B]" />
                          <span className="text-[11px] font-medium uppercase tracking-wider text-[#52525B]">
                            {meter.label}
                          </span>
                        </div>
                        <p className="text-xl font-mono font-semibold text-[#FAFAFA]">
                          {meter.used}
                          <span className="text-[13px] text-[#52525B] font-normal">
                            /{meter.limit === Infinity ? "\u221E" : meter.limit}
                          </span>
                        </p>
                        {meter.limit > 0 && meter.limit !== Infinity && (
                          <div className="w-full h-1.5 bg-[rgba(255,255,255,0.08)] rounded-full mt-3">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${ratio * 100}%`,
                                backgroundColor: barColor,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </ConsoleCard>
                  );
                })}
              </div>

              {/* Features Checklist */}
              <ConsoleCard>
                <ConsoleCardHeader>
                  <span className="text-[13px] font-semibold text-[#FAFAFA]">
                    Features
                  </span>
                </ConsoleCardHeader>
                <ConsoleCardBody>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                    {allFeatures.map((feat) => {
                      const allowed = (featurePlanMap[feat.key] || []).includes(currentPlanTyped);
                      return (
                        <div
                          key={feat.key}
                          className="flex items-center gap-2.5 py-1"
                        >
                          {allowed ? (
                            <Check className="w-4 h-4 text-[#16A34A] shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-[#52525B] shrink-0" />
                          )}
                          <span
                            className={cn(
                              "text-[13px]",
                              allowed ? "text-[#FAFAFA]" : "text-[#52525B]"
                            )}
                          >
                            {feat.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </ConsoleCardBody>
              </ConsoleCard>

              {/* Pricing Plans Comparison Grid */}
              {pricingPlans && pricingPlans.plans.length > 0 && (
                <div>
                  <h3 className="text-[13px] font-semibold text-[#FAFAFA] mb-4">
                    All Plans
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {pricingPlans.plans.map((p) => {
                      const isCurrent = p.plan === currentPlanTyped;
                      const pConfig = getPlanConfig(p.plan);
                      const planOrder: Plan[] = ["free", "starter", "standard", "professional", "agency"];
                      const canUpgrade =
                        !isCurrent &&
                        planOrder.indexOf(p.plan) > planOrder.indexOf(currentPlanTyped);

                      return (
                        <ConsoleCard
                          key={p.plan}
                          className={cn(
                            isCurrent && "border-[rgba(8,145,178,0.3)]"
                          )}
                          hover
                        >
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-[14px] font-semibold text-[#FAFAFA]">
                                {p.display_name}
                              </h4>
                              {isCurrent && (
                                <span className="rounded-full bg-[rgba(8,145,178,0.12)] text-[#0891B2] text-[10px] font-medium px-2 py-0.5">
                                  Current
                                </span>
                              )}
                            </div>

                            <div className="mb-4">
                              <span className="text-[22px] font-semibold text-[#FAFAFA]">
                                ${p.price_usd}
                              </span>
                              <span className="text-[12px] text-[#52525B]">/mo</span>
                            </div>

                            <p className="text-[12px] text-[#A1A1AA] mb-4 line-clamp-2">
                              {p.description}
                            </p>

                            {/* Plan features from API */}
                            <div className="space-y-2 mb-5">
                              {Object.entries(p.features)
                                .filter(([, v]) => v)
                                .slice(0, 5)
                                .map(([key]) => (
                                  <div
                                    key={key}
                                    className="flex items-center gap-2"
                                  >
                                    <Check className="w-3 h-3 text-[#16A34A] shrink-0" />
                                    <span className="text-[11px] text-[#A1A1AA] capitalize">
                                      {key.replace(/_/g, " ")}
                                    </span>
                                  </div>
                                ))}
                            </div>

                            <div className="text-[11px] text-[#52525B] space-y-1 mb-4">
                              <p>
                                <span className="font-mono text-[#A1A1AA]">
                                  {p.max_dependencies}
                                </span>{" "}
                                dependencies
                              </p>
                              <p>
                                <span className="font-mono text-[#A1A1AA]">
                                  {p.data_retention_days}d
                                </span>{" "}
                                retention
                              </p>
                            </div>

                            {isCurrent ? (
                              <div className="w-full text-center py-2.5 rounded-lg border border-[rgba(8,145,178,0.2)] bg-[rgba(8,145,178,0.08)] text-[#0891B2] text-[12px] font-medium">
                                Current Plan
                              </div>
                            ) : canUpgrade ? (
                              <button
                                onClick={() => handleUpgrade(p.plan)}
                                disabled={upgrading === p.plan}
                                className="w-full bg-[#FAFAFA] text-[#0A0A0F] py-2.5 rounded-lg text-[12px] font-semibold hover:bg-white hover:shadow-lg transition-all disabled:opacity-50"
                              >
                                {upgrading === p.plan ? "Processing..." : `Upgrade to ${p.display_name}`}
                              </button>
                            ) : (
                              <div className="w-full text-center py-2.5 rounded-lg border border-[rgba(255,255,255,0.05)] text-[#52525B] text-[12px] font-medium">
                                Downgrade not available
                              </div>
                            )}
                          </div>
                        </ConsoleCard>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Billing loading skeleton (while plan is loading) */
            <div className="space-y-5">
              <Skeleton className="h-[180px] rounded-xl bg-[#1C1C22]" />
              <Skeleton className="h-[200px] rounded-xl bg-[#1C1C22]" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
