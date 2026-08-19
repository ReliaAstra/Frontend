"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Users,
  KeyRound,
  Hash,
  Mail,
  Bell,
  Webhook,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { apiClient, BackendError } from "@/lib/api";
import { getPlanConfig, canAccessFeature } from "@/lib/tierLimits";
import type { Plan } from "@/services/billingService";
import { apiKeyService, type ApiKeyResponse } from "@/services/apiKeyService";
import {
  notificationService,
  type AlertConfig,
  type ChannelType,
} from "@/services/notificationService";
import {
  useBillingPlan,
  usePricingPlans,
  useOrgMembers,
  useInviteMember,
  useInitializePayment,
  useVerifyPayment,
  useApiKeys,
  useNotificationConfigs,
  useClients,
} from "@/hooks/useApi";
import { Card, Skeleton, PageHeader, Button, EmptyState } from "@/components/rs/ui";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full bg-[#0B0F19] border border-[#374151] rounded-lg px-3.5 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_2px_rgba(59,130,246,0.2)] transition-[border-color,box-shadow]";

const TABS: Array<{ key: string; label: string }> = [
  { key: "account", label: "Account" },
  { key: "team", label: "Team" },
  { key: "notifications", label: "Notifications" },
  { key: "billing", label: "Billing" },
  { key: "security", label: "Security" },
  { key: "agency", label: "Agency" },
];

/* ── Account ────────────────────────────────────────────────────────────── */

function AccountTab() {
  const { user } = useAuth();
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (user) setName(user.full_name);
  }, [user]);

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.patch("/users/me", { full_name: name });
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof BackendError ? err.message : "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6 max-w-xl">
      <div className="flex items-center gap-4 mb-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1F2937] border border-[#374151] text-sm font-semibold text-[#F9FAFB]">
          {(user?.full_name || user?.email || "U")
            .split(/\s+/)
            .map((p) => p[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </span>
        <div>
          <p className="text-sm font-medium text-[#F9FAFB]">{user?.full_name}</p>
          <p className="text-xs text-[#6B7280]">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#F9FAFB] mb-1.5">Full name</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#F9FAFB] mb-1.5">Email</label>
          <input className={cn(inputCls, "opacity-60")} value={user?.email || ""} readOnly />
          <p className="text-xs text-[#6B7280] mt-1">Email is managed by your authentication provider.</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Update profile"}
        </Button>
      </div>
    </Card>
  );
}

/* ── Team ───────────────────────────────────────────────────────────────── */

function TeamTab() {
  const { currentOrg } = useAuth();
  const { data: members = [], isLoading, isError } = useOrgMembers();
  const invite = useInviteMember();
  const [email, setEmail] = React.useState("");

  const plan = (currentOrg?.plan || "free") as Plan;
  const teamAllowed = canAccessFeature(plan, "team").allowed;

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error("Enter an email address.");
      return;
    }
    try {
      await invite.mutateAsync({ email: email.trim() });
      toast.success(`Invitation sent to ${email.trim()}.`);
      setEmail("");
    } catch {
      toast.error("Failed to send invitation.");
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {!teamAllowed && (
        <Card className="p-4 flex items-center gap-3">
          <Lock className="h-4 w-4 text-[#F59E0B] shrink-0" />
          <p className="text-sm text-[#9CA3AF] flex-1">Team invites require the Starter plan or higher.</p>
          <Button onClick={() => (window.location.href = "/settings/billing")}>Upgrade</Button>
        </Card>
      )}

      {teamAllowed && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <input
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />
            <Button onClick={handleInvite} disabled={invite.isPending}>
              {invite.isPending ? "Inviting…" : "Invite"}
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </Card>
      ) : isError ? (
        <Card className="p-4">
          <p className="text-sm text-[#EF4444]">Unable to load team members.</p>
        </Card>
      ) : members.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No team members yet"
            body="Invite teammates to collaborate on monitoring."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-4 px-4 border-b border-[#1F2937]" style={{ height: 40 }}>
            {["Member", "Role", "Joined"].map((h) => (
              <span key={h} className="self-center text-[11px] font-medium uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
                {h}
              </span>
            ))}
          </div>
          <div className="divide-y divide-[#1F2937]">
            {members.map((m) => (
              <div key={m.id} className="grid grid-cols-[1fr_1fr_1fr] gap-4 px-4 items-center" style={{ height: 44 }}>
                <span className="text-sm text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                  {m.user_id.slice(0, 12)}
                </span>
                <span className="text-sm text-[#9CA3AF] capitalize">{m.role}</span>
                <span className="text-xs text-[#6B7280]">
                  {new Date(m.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ── Notifications ──────────────────────────────────────────────────────── */

const CHANNEL_META: Record<ChannelType, { label: string; icon: React.ElementType }> = {
  slack: { label: "Slack", icon: Hash },
  email: { label: "Email", icon: Mail },
  pagerduty: { label: "PagerDuty", icon: Bell },
  webhook: { label: "Webhook", icon: Webhook },
};

function NotificationsTab() {
  const { data: configs = [], isLoading, isError, refetch } = useNotificationConfigs();
  const [addOpen, setAddOpen] = React.useState(false);
  const [type, setType] = React.useState<ChannelType>("slack");
  const [value, setValue] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  const handleAdd = async () => {
    if (!value.trim()) return;
    setAdding(true);
    try {
      const config: Record<string, string> =
        type === "email" ? { recipients: value.trim() } : { webhook_url: value.trim() };
      await notificationService.create({ channel_type: type, config });
      toast.success("Notification channel added.");
      setValue("");
      setAddOpen(false);
      refetch();
    } catch {
      toast.error("Could not add channel.");
    } finally {
      setAdding(false);
    }
  };

  const toggle = async (c: AlertConfig) => {
    try {
      await notificationService.update(c.id, { is_active: !c.is_active });
      refetch();
    } catch {
      toast.error("Could not update channel.");
    }
  };

  const remove = async (id: string) => {
    try {
      await notificationService.delete(id);
      refetch();
      toast.success("Channel removed.");
    } catch {
      toast.error("Could not remove channel.");
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <Card className="p-4 flex items-center justify-between">
        <p className="text-sm text-[#9CA3AF]">Alert delivery channels</p>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add channel
        </Button>
      </Card>

      {isLoading ? (
        <Card className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </Card>
      ) : isError ? (
        <Card className="p-4">
          <p className="text-sm text-[#EF4444]">Unable to load channels.</p>
        </Card>
      ) : configs.length === 0 ? (
        <Card>
          <EmptyState icon={Bell} title="No notification channels" body="Add a channel to receive incident alerts." />
        </Card>
      ) : (
        <div className="divide-y divide-[#1F2937] border border-[#1F2937] rounded-xl bg-[#111827]">
          {configs.map((c) => {
            const meta = CHANNEL_META[c.channel_type] || CHANNEL_META.email;
            const Icon = meta.icon;
            return (
              <div key={c.id} className="flex items-center gap-3 px-4" style={{ height: 52 }}>
                <Icon className="h-4 w-4 text-[#6B7280]" />
                <span className="text-sm text-[#F9FAFB] flex-1">{meta.label}</span>
                <button
                  onClick={() => toggle(c)}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors",
                    c.is_active ? "bg-[#3B82F6]" : "bg-[#374151]"
                  )}
                  aria-label="Toggle channel"
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all",
                      c.is_active ? "left-[18px]" : "left-0.5"
                    )}
                  />
                </button>
                <button onClick={() => remove(c.id)} className="p-1.5 rounded-md text-[#374151] hover:text-[#EF4444] transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {addOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setAddOpen(false)}
        >
          <div
            className="w-[440px] max-w-[92vw] rounded-xl bg-[#111827] border border-[#1F2937] shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[#1F2937]">
              <h3 className="text-base font-semibold text-[#F9FAFB]">Add notification channel</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-1.5">Channel</label>
                <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as ChannelType)}>
                  {(Object.keys(CHANNEL_META) as ChannelType[]).map((t) => (
                    <option key={t} value={t}>
                      {CHANNEL_META[t].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-1.5">
                  {type === "email" ? "Recipients (comma-separated)" : "Webhook URL"}
                </label>
                <input className={inputCls} value={value} onChange={(e) => setValue(e.target.value)} placeholder="ops@company.com" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={adding || !value.trim()}>
                  {adding ? "Adding…" : "Add channel"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Security (API keys) ────────────────────────────────────────────────── */

function SecurityTab() {
  const { data: keys = [], isLoading, isError, refetch } = useApiKeys();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [rawKey, setRawKey] = React.useState<string | null>(null);
  const [showRaw, setShowRaw] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await apiKeyService.create(name.trim());
      setRawKey(res.full_key);
      setName("");
      setCreateOpen(false);
      refetch();
    } catch {
      toast.error("Could not create API key.");
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (id: string) => {
    try {
      await apiKeyService.revoke(id);
      refetch();
      toast.success("API key revoked.");
    } catch {
      toast.error("Could not revoke key.");
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-4">
      <Card className="p-4 flex items-center justify-between">
        <p className="text-sm text-[#9CA3AF]">API keys for programmatic access</p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create key
        </Button>
      </Card>

      {rawKey && (
        <Card className="p-5 border-[#F59E0B]/30">
          <p className="text-sm font-medium text-[#F59E0B] mb-2">Save this key now — it won&apos;t be shown again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-[#0B0F19] px-3 py-2 text-xs text-[#F9FAFB] break-all" style={{ fontFamily: "var(--font-geist-mono)" }}>
              {showRaw ? rawKey : "•".repeat(48)}
            </code>
            <button onClick={() => setShowRaw((v) => !v)} className="p-2 rounded-md text-[#6B7280] hover:text-[#F9FAFB]">
              {showRaw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button onClick={() => copy(rawKey)} className="p-2 rounded-md text-[#6B7280] hover:text-[#F9FAFB]">
              {copied ? <Check className="h-4 w-4 text-[#22C55E]" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <button onClick={() => setRawKey(null)} className="mt-3 text-xs text-[#6B7280] hover:text-[#F9FAFB]">
            Done, I&apos;ve saved it
          </button>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </Card>
      ) : isError ? (
        <Card className="p-4">
          <p className="text-sm text-[#EF4444]">Unable to load API keys.</p>
        </Card>
      ) : keys.length === 0 ? (
        <Card>
          <EmptyState icon={KeyRound} title="No API keys" body="Create a key to access the Reliastra API." />
        </Card>
      ) : (
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-x-auto">
          <table className="w-full border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-[#1F2937]" style={{ height: 40 }}>
                {["Name", "Prefix", "Created", "Scopes", ""].map((h, i) => (
                  <th
                    key={i}
                    className={cn(
                      "text-[11px] font-medium uppercase text-[#6B7280]",
                      i === 4 ? "text-right pr-4" : "text-left px-4"
                    )}
                    style={{ letterSpacing: "0.05em" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((key: ApiKeyResponse, i: number) => (
                <tr key={key.id} className={cn("hover:bg-[#1F2937] transition-colors", i < keys.length - 1 && "border-b border-[#1F2937]")} style={{ height: 48 }}>
                  <td className="px-4 text-sm font-medium text-[#F9FAFB]">{key.name}</td>
                  <td className="px-4 text-xs text-[#9CA3AF]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                    {key.prefix}…
                  </td>
                  <td className="px-4 text-xs text-[#6B7280]">
                    {new Date(key.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4">
                    <div className="flex flex-wrap gap-1">
                      {(key.scopes || []).slice(0, 3).map((s) => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-[#1F2937] text-[#9CA3AF]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-right pr-4">
                    <button
                      onClick={() => revoke(key.id)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#EF4444] hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {createOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="w-[440px] max-w-[92vw] rounded-xl bg-[#111827] border border-[#1F2937] shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[#1F2937]">
              <h3 className="text-base font-semibold text-[#F9FAFB]">Create API key</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-1.5">Key name</label>
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Production integration" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={create} disabled={creating || !name.trim()}>
                  {creating ? "Creating…" : "Create key"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Billing ────────────────────────────────────────────────────────────── */

function BillingTab() {
  const { user } = useAuth();
  const { data: plan, isLoading } = useBillingPlan();
  const { data: pricingPlans } = usePricingPlans();
  const initialize = useInitializePayment();
  const [upgrading, setUpgrading] = React.useState<string | null>(null);

  const currentPlan = (plan?.plan || "free") as Plan;
  const planConfig = getPlanConfig(currentPlan);
  const planOrder: Plan[] = ["free", "starter", "standard", "professional", "agency"];

  const upgrade = async (target: string) => {
    setUpgrading(target);
    try {
      const res = await initialize.mutateAsync({ plan: target, email: user?.email });
      window.location.assign(res.authorization_url);
    } catch {
      toast.error("Failed to initialize payment.");
      setUpgrading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Current plan */}
      <Card className="p-6" style={{ boxShadow: "inset 3px 0 0 0 #3B82F6" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
              Current plan
            </p>
            <h3 className="text-xl font-semibold text-[#F9FAFB] mt-1">{planConfig.name}</h3>
            <p className="text-sm text-[#9CA3AF] mt-1">
              {plan?.subscription_status === "active" ? "Active" : "Free"}{" "}
              {plan?.current_period_end && (
                <span className="text-[#6B7280]">
                  · renews {new Date(plan.current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
              ${plan?.price_usd ?? planConfig.price}
              <span className="text-sm text-[#6B7280] font-normal">/mo</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Plans grid */}
      {pricingPlans && pricingPlans.plans.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#9CA3AF] mb-3">All plans</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricingPlans.plans.map((p) => {
              const isCurrent = p.plan === currentPlan;
              const canUpgrade = !isCurrent && planOrder.indexOf(p.plan) > planOrder.indexOf(currentPlan);
              return (
                <Card key={p.plan} hover className="p-5 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[#F9FAFB]">{p.display_name}</h4>
                    {isCurrent && (
                      <span className="text-[10px] font-medium rounded-full bg-[#3B82F6]/15 text-[#3B82F6] px-2 py-0.5">Current</span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-[#F9FAFB] mt-3" style={{ fontFamily: "var(--font-geist-mono)" }}>
                    ${p.price_usd}
                    <span className="text-xs text-[#6B7280] font-normal">/mo</span>
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-2 line-clamp-2">{p.description}</p>
                  <div className="text-[11px] text-[#6B7280] space-y-1 mt-3 mb-4">
                    <p>{p.max_dependencies} dependencies</p>
                    <p>{p.data_retention_days} days retention</p>
                  </div>
                  {isCurrent ? (
                    <div className="mt-auto w-full text-center py-2 rounded-lg border border-[#1F2937] text-xs text-[#9CA3AF]">Current plan</div>
                  ) : canUpgrade ? (
                    <button
                      onClick={() => upgrade(p.plan)}
                      disabled={upgrading === p.plan}
                      className="mt-auto w-full bg-[#3B82F6] text-white text-xs font-medium py-2 rounded-lg hover:brightness-110 transition-[filter] disabled:opacity-50"
                    >
                      {upgrading === p.plan ? "Processing…" : `Upgrade to ${p.display_name}`}
                    </button>
                  ) : (
                    <div className="mt-auto w-full text-center py-2 rounded-lg border border-[#1F2937] text-xs text-[#6B7280]">Not available</div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Agency ─────────────────────────────────────────────────────────────── */

function AgencyTab() {
  const { data: clients = [], isLoading } = useClients();
  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-[#6B7280]">Client groups for agency-scoped monitoring.</p>
      {isLoading ? (
        <Card className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </Card>
      ) : clients.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No client groups"
            body="Add your first client to get started."
            actionLabel="Add client"
            actionHref="/clients"
          />
        </Card>
      ) : (
        <div className="divide-y divide-[#1F2937] border border-[#1F2937] rounded-xl bg-[#111827]">
          {clients.map((c) => (
            <div key={c.id} className="px-4 py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#F9FAFB]">{c.name}</p>
                {c.description && <p className="text-xs text-[#6B7280] mt-0.5">{c.description}</p>}
              </div>
              <a href={`/clients/${c.id}`} className="text-xs text-[#3B82F6] hover:underline shrink-0">
                Manage
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Screen ─────────────────────────────────────────────────────────────── */

export function SettingsScreen({ tab }: { tab: string }) {
  const router = useRouter();
  const { currentOrg } = useAuth();
  const verifyPayment = useVerifyPayment();
  const [verifyingRef, setVerifyingRef] = React.useState(false);

  // Auto-verify a Paystack payment when returning from checkout (?reference=).
  React.useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("reference");
    if (ref && !verifyingRef) {
      setVerifyingRef(true);
      verifyPayment
        .mutateAsync(ref)
        .then(() => {
          toast.success("Payment verified. Your plan has been updated.");
          const url = new URL(window.location.href);
          url.searchParams.delete("reference");
          router.replace(url.pathname + url.search);
        })
        .catch(() => toast.error("Payment verification failed. Please contact support."))
        .finally(() => setVerifyingRef(false));
    }
  }, [router, verifyPayment]);

  const visibleTabs = TABS.filter((t) => t.key !== "agency" || currentOrg?.has_agency_mode);
  const activeTab = visibleTabs.some((t) => t.key === tab) ? tab : "account";

  const setTab = (key: string) => {
    router.push(key === "account" ? "/settings" : `/settings/${key}`);
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and organization." />

      {/* Tab navigation */}
      <div className="flex items-center gap-6 border-b border-[#1F2937] mb-8 -mt-2">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "pb-3 text-sm -mb-px transition-colors",
              activeTab === t.key
                ? "text-[#F9FAFB] border-b-2 border-[#3B82F6]"
                : "text-[#6B7280] hover:text-[#9CA3AF] border-b-2 border-transparent"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "account" && <AccountTab />}
      {activeTab === "team" && <TeamTab />}
      {activeTab === "notifications" && <NotificationsTab />}
      {activeTab === "billing" && <BillingTab />}
      {activeTab === "security" && <SecurityTab />}
      {activeTab === "agency" && <AgencyTab />}
    </div>
  );
}
