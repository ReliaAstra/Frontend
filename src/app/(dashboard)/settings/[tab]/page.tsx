"use client";

import { useParams } from "next/navigation";
import { SettingsScreen } from "@/components/settings/SettingsScreen";

const ALIASES: Record<string, string> = {
  profile: "account",
  "api-keys": "security",
  api_keys: "security",
};

export default function SettingsTabPage() {
  const params = useParams();
  const raw = (params.tab as string) || "account";
  const tab = ALIASES[raw] || raw;

  return <SettingsScreen tab={tab} />;
}
