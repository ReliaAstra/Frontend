"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { MemberTable } from "@/components/dashboard/MemberTable";
import { ApiKeyManager } from "@/components/dashboard/ApiKeyManager";
import { NotificationSettings } from "@/components/dashboard/NotificationSettings";
import { BillingCard } from "@/components/dashboard/BillingCard";
import { orgService, type OrgMember } from "@/services/orgService";
import { apiKeyService, type ApiKey } from "@/services/apiKeyService";
import { notificationService, type NotificationChannel } from "@/services/notificationService";
import { billingService, type BillingPlan } from "@/services/billingService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const tabs = ["profile", "team", "api-keys", "notifications", "billing"] as const;
const tabLabels: Record<string, string> = { profile: "Profile", team: "Team", "api-keys": "API Keys", notifications: "Notifications", billing: "Billing" };

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [plan, setPlan] = useState<BillingPlan | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.full_name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "team") orgService.listMembers().then(setMembers);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "api-keys") apiKeyService.list().then(setApiKeys);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "notifications") notificationService.list().then(setChannels);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "billing") billingService.getPlan().then(setPlan);
  }, [activeTab]);

  const handleProfileUpdate = () => {
    toast.success("Profile updated");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your account and organization</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-lg bg-white border border-gray-200 p-1 w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-500"
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-3xl">
        {activeTab === "profile" && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-[#0891B2] flex items-center justify-center text-white text-xl font-semibold">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-gray-50 border-gray-200 text-gray-900" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-50 border-gray-200 text-gray-900" />
            </div>
            <Button onClick={handleProfileUpdate} className="bg-[#0891B2] hover:bg-[#0891B2]/90 text-white">
              Update Profile
            </Button>
          </div>
        )}

        {activeTab === "team" && <MemberTable members={members} />}

        {activeTab === "api-keys" && <ApiKeyManager keys={apiKeys} />}

        {activeTab === "notifications" && <NotificationSettings channels={channels} />}

        {activeTab === "billing" && (plan ? <BillingCard plan={plan} /> : <Skeleton className="h-[400px] rounded-lg bg-white" />)}
      </div>
    </div>
  );
}