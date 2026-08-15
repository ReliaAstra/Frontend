"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { MemberTable } from "@/components/dashboard/MemberTable";
import { ApiKeyManager } from "@/components/dashboard/ApiKeyManager";
import { NotificationSettings } from "@/components/dashboard/NotificationSettings";
import { BillingCard } from "@/components/dashboard/BillingCard";
import { orgService, type OrgMemberResponse } from "@/services/orgService";
import { apiKeyService, type ApiKeyResponse } from "@/services/apiKeyService";
import { notificationService, type AlertConfig } from "@/services/notificationService";
import { billingService, type BillingPlanResponse } from "@/services/billingService";
import { apiClient, BackendError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const tabs = ["profile", "team", "api-keys", "notifications", "billing"] as const;
const tabLabels: Record<string, string> = { profile: "Profile", team: "Team", "api-keys": "API Keys", notifications: "Notifications", billing: "Billing" };

export default function SettingsPage() {
  const { user, memberRole } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<OrgMemberResponse[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyResponse[]>([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(false);
  const [apiKeysError, setApiKeysError] = useState<string | null>(null);
  const [channels, setChannels] = useState<AlertConfig[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  const [plan, setPlan] = useState<BillingPlanResponse | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.full_name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "team") {
      setMembersLoading(true);
      setMembersError(null);
      orgService.listMembers()
        .then(setMembers)
        .catch(() => setMembersError("Unable to load team members."))
        .finally(() => setMembersLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "api-keys") {
      setApiKeysLoading(true);
      setApiKeysError(null);
      apiKeyService.list()
        .then(setApiKeys)
        .catch(() => setApiKeysError("Unable to load API keys."))
        .finally(() => setApiKeysLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "notifications") {
      setChannelsLoading(true);
      setChannelsError(null);
      notificationService.list()
        .then(setChannels)
        .catch(() => setChannelsError("Unable to load notification channels."))
        .finally(() => setChannelsLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "billing") {
      setBillingLoading(true);
      setBillingError(null);
      billingService.getPlan()
        .then(setPlan)
        .catch(() => setBillingError("Unable to load billing information."))
        .finally(() => setBillingLoading(false));
    }
  }, [activeTab]);

  const handleProfileUpdate = async () => {
    setSaving(true);
    try {
      await apiClient.patch("/users/me", { full_name: name, email });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[15px] font-semibold text-[#09090B] tracking-tight">SETTINGS</h1>
        <p className="text-[12px] text-[#A1A1AA] mt-1">Manage your account and organization</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-lg bg-white border border-[#E4E4E7] p-1 w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab ? "bg-[#F8F9FA] text-[#09090B]" : "text-[#A1A1AA] hover:text-[#52525B]"
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-3xl">
        {activeTab === "profile" && (
          <div className="rounded-lg border border-[#E4E4E7] bg-white p-6 space-y-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-[#0891B2] flex items-center justify-center text-white text-xl font-semibold">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-lg font-medium text-[#09090B]">{user?.full_name}</p>
                <p className="text-sm text-[#52525B] capitalize">{memberRole || "Member"}</p>
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-[#09090B] mb-1.5 block">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white border-[#E4E4E7] text-[#09090B]" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-[#09090B] mb-1.5 block">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white border-[#E4E4E7] text-[#09090B]" />
            </div>
            <Button onClick={handleProfileUpdate} disabled={saving} className="bg-[#0891B2] hover:bg-[#0891B2]/90 text-white">
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Update Profile"
              )}
            </Button>
          </div>
        )}

        {activeTab === "team" && (
          <div>
            {membersLoading ? (
              <Skeleton className="h-[200px] rounded-lg bg-white" />
            ) : membersError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">{membersError}</p>
                </div>
                <button onClick={() => {
                  setMembersLoading(true);
                  setMembersError(null);
                  orgService.listMembers().then(setMembers).catch(() => setMembersError("Unable to load team members.")).finally(() => setMembersLoading(false));
                }} className="text-xs font-medium text-red-600 hover:text-red-800">
                  Retry
                </button>
              </div>
            ) : (
              <MemberTable members={members} />
            )}
          </div>
        )}

        {activeTab === "api-keys" && (
          <div>
            {apiKeysLoading ? (
              <Skeleton className="h-[200px] rounded-lg bg-white" />
            ) : apiKeysError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">{apiKeysError}</p>
                </div>
                <button onClick={() => {
                  setApiKeysLoading(true);
                  setApiKeysError(null);
                  apiKeyService.list().then(setApiKeys).catch(() => setApiKeysError("Unable to load API keys.")).finally(() => setApiKeysLoading(false));
                }} className="text-xs font-medium text-red-600 hover:text-red-800">
                  Retry
                </button>
              </div>
            ) : (
              <ApiKeyManager keys={apiKeys} />
            )}
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            {channelsLoading ? (
              <Skeleton className="h-[200px] rounded-lg bg-white" />
            ) : channelsError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">{channelsError}</p>
                </div>
                <button onClick={() => {
                  setChannelsLoading(true);
                  setChannelsError(null);
                  notificationService.list().then(setChannels).catch(() => setChannelsError("Unable to load notification channels.")).finally(() => setChannelsLoading(false));
                }} className="text-xs font-medium text-red-600 hover:text-red-800">
                  Retry
                </button>
              </div>
            ) : (
              <NotificationSettings channels={channels} />
            )}
          </div>
        )}

        {activeTab === "billing" && (
          <div>
            {billingLoading ? (
              <Skeleton className="h-[400px] rounded-lg bg-white" />
            ) : billingError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">{billingError}</p>
                </div>
                <button onClick={() => {
                  setBillingLoading(true);
                  setBillingError(null);
                  billingService.getPlan().then(setPlan).catch(() => setBillingError("Unable to load billing information.")).finally(() => setBillingLoading(false));
                }} className="text-xs font-medium text-red-600 hover:text-red-800">
                  Retry
                </button>
              </div>
            ) : plan ? (
              <BillingCard plan={plan} />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
