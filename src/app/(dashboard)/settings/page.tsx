"use client";

import { useSearchParams } from "next/navigation";
import { SettingsScreen } from "@/components/settings/SettingsScreen";

const ALIASES: Record<string, string> = {
  profile: "account",
  account: "account",
  team: "team",
  notifications: "notifications",
  billing: "billing",
  security: "security",
  "api-keys": "security",
  api_keys: "security",
  agency: "agency",
};

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("tab") || "account";
  const tab = ALIASES[raw] || "account";

  return <SettingsScreen tab={tab} />;
}
