import { apiClient } from "@/lib/api";

export type IncidentSeverity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "open" | "investigating" | "monitoring" | "resolved";

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  correlation_count: number;
  confidence_score: number;
  started_at: string;
  resolved_at: string | null;
  updated_at: string;
  dependency_id: string;
  dependency_name: string;
  assignee: string | null;
  region: string;
  impact: string;
}

export interface TimelineEvent {
  id: string;
  incident_id: string;
  timestamp: string;
  actor: string;
  action: string;
  type: "status_change" | "acknowledged" | "correlation" | "evidence_generated" | "note" | "resolved";
  details: string;
}

export interface CorrelatedSignal {
  id: string;
  name: string;
  metric: string;
  values: number[];
  correlation: number;
}

export const mockIncidents: Incident[] = [
  {
    id: "inc_001", title: "Twilio SMS API - Complete Outage",
    description: "## Impact\n\nTwilio SMS API is returning 503 errors for all regions. This is affecting our SMS notification pipeline and two-factor authentication flows.\n\n## Scope\n\n- **Regions Affected**: US-East, EU-West, AP-Southeast\n- **Dependencies**: Twilio SMS API\n- **Impact Level**: Critical - Authentication and notifications blocked\n\n## Timeline\n\nInitial detection at 17:42 UTC when health checks began failing across all monitoring regions.",
    severity: "critical", status: "open", correlation_count: 3, confidence_score: 0.94,
    started_at: "2026-08-12T17:42:00Z", resolved_at: null, updated_at: "2026-08-12T18:30:00Z",
    dependency_id: "dep_002", dependency_name: "Twilio SMS", assignee: "Sarah Chen",
    region: "all", impact: "2FA and SMS notifications blocked for all users",
  },
  {
    id: "inc_002", title: "Auth0 OIDC - Elevated Latency",
    description: "## Impact\n\nAuth0 OIDC token endpoint experiencing 20x normal latency. Login flows are severely degraded but still functional.\n\n## Scope\n\n- **Regions Affected**: US-East primarily\n- **Dependencies**: Auth0 OIDC\n- **Impact Level**: High - Login times increased from ~100ms to ~2.5s",
    severity: "high", status: "investigating", correlation_count: 1, confidence_score: 0.87,
    started_at: "2026-08-12T16:15:00Z", resolved_at: null, updated_at: "2026-08-12T18:20:00Z",
    dependency_id: "dep_003", dependency_name: "Auth0 OIDC", assignee: "Mike Rivera",
    region: "us_east_1", impact: "Login latency increased from 100ms to 2.5s",
  },
  {
    id: "inc_003", title: "Stripe API - Intermittent 5xx Errors",
    description: "Stripe payment API returned sporadic 500 errors between 08:00 and 09:30 UTC. Approximately 2.3% of payment requests failed during this window.",
    severity: "medium", status: "resolved", correlation_count: 2, confidence_score: 0.78,
    started_at: "2026-08-12T08:00:00Z", resolved_at: "2026-08-12T09:45:00Z", updated_at: "2026-08-12T09:45:00Z",
    dependency_id: "dep_001", dependency_name: "Stripe API", assignee: "Alex Kim",
    region: "us_east_1", impact: "2.3% of payment requests failed",
  },
  {
    id: "inc_004", title: "SendGrid Email - Delivery Delays",
    description: "SendGrid reporting elevated delivery times. Emails are being delivered but with 5-10 minute delays. SLA evidence report generated for potential credit claim.",
    severity: "low", status: "resolved", correlation_count: 0, confidence_score: 0.65,
    started_at: "2026-08-11T14:00:00Z", resolved_at: "2026-08-11T18:30:00Z", updated_at: "2026-08-11T18:30:00Z",
    dependency_id: "dep_004", dependency_name: "SendGrid Email", assignee: "Jordan Lee",
    region: "us_east_1", impact: "Email delivery delayed by 5-10 minutes",
  },
  {
    id: "inc_005", title: "Cloudflare DNS - Brief Resolution Failure",
    description: "Cloudflare 1.1.1.1 DNS resolver experienced a brief outage lasting approximately 3 minutes. Our fallback DNS resolver handled traffic during this period.",
    severity: "low", status: "resolved", correlation_count: 1, confidence_score: 0.91,
    started_at: "2026-08-10T22:10:00Z", resolved_at: "2026-08-10T22:13:00Z", updated_at: "2026-08-10T22:13:00Z",
    dependency_id: "dep_005", dependency_name: "Cloudflare DNS", assignee: "Sarah Chen",
    region: "global", impact: "Minimal - fallback DNS handled traffic",
  },
];

export const mockTimelineEvents: Record<string, TimelineEvent[]> = {
  inc_001: [
    { id: "evt_001", incident_id: "inc_001", timestamp: "2026-08-12T17:42:00Z", actor: "System", action: "Incident Opened", type: "status_change", details: "Automated detection: 3 consecutive health check failures on Twilio SMS API" },
    { id: "evt_002", incident_id: "inc_001", timestamp: "2026-08-12T17:43:15Z", actor: "System", action: "Correlation Found", type: "correlation", details: "Correlated with 2 additional signals: error rate spike in auth service, user complaint surge" },
    { id: "evt_003", incident_id: "inc_001", timestamp: "2026-08-12T17:45:00Z", actor: "Sarah Chen", action: "Acknowledged", type: "acknowledged", details: "Investigating - confirmed Twilio status page shows active outage" },
    { id: "evt_004", incident_id: "inc_001", timestamp: "2026-08-12T18:00:00Z", actor: "System", action: "Evidence Report Generated", type: "evidence_generated", details: "SLA evidence report #RPT-2026-0812-001 generated with timestamped logs" },
    { id: "evt_005", incident_id: "inc_001", timestamp: "2026-08-12T18:15:00Z", actor: "Mike Rivera", action: "Note Added", type: "note", details: "Twilio engineering confirmed widespread outage. ETA for fix: 1-2 hours." },
    { id: "evt_006", incident_id: "inc_001", timestamp: "2026-08-12T18:30:00Z", actor: "System", action: "Status Updated", type: "status_change", details: "Escalated to critical - outage duration exceeding 1 hour" },
  ],
  inc_002: [
    { id: "evt_010", incident_id: "inc_002", timestamp: "2026-08-12T16:15:00Z", actor: "System", action: "Incident Opened", type: "status_change", details: "Latency threshold exceeded: Auth0 OIDC response time >1000ms" },
    { id: "evt_011", incident_id: "inc_002", timestamp: "2026-08-12T16:20:00Z", actor: "Mike Rivera", action: "Acknowledged", type: "acknowledged", details: "Investigating - appears to be US-East region specific" },
    { id: "evt_012", incident_id: "inc_002", timestamp: "2026-08-12T16:30:00Z", actor: "Mike Rivera", action: "Status Updated", type: "status_change", details: "Moved to investigating - contacted Auth0 support" },
    { id: "evt_013", incident_id: "inc_002", timestamp: "2026-08-12T18:20:00Z", actor: "System", action: "Correlation Found", type: "correlation", details: "Related to increased login error rate on our auth service" },
  ],
};

export const mockCorrelatedSignals: Record<string, CorrelatedSignal[]> = {
  inc_001: [
    { id: "sig_001", name: "Auth Error Rate", metric: "auth.errors/minute", values: [12, 15, 18, 25, 42, 68, 95, 88, 72, 65], correlation: 0.94 },
    { id: "sig_002", name: "User Complaints", metric: "support.tickets/minute", values: [0, 1, 0, 2, 5, 8, 12, 10, 8, 6], correlation: 0.89 },
    { id: "sig_003", name: "2FA Failure Rate", metric: "auth.2fa_failures/minute", values: [0, 0, 2, 8, 22, 45, 67, 60, 55, 50], correlation: 0.97 },
  ],
  inc_002: [
    { id: "sig_004", name: "Login Latency P99", metric: "auth.login_p99_ms", values: [120, 150, 180, 350, 800, 1500, 2200, 2500, 2300, 2400], correlation: 0.92 },
    { id: "sig_005", name: "Token Refresh Rate", metric: "auth.token_refreshes/minute", values: [45, 48, 52, 60, 75, 90, 85, 80, 78, 76], correlation: 0.74 },
  ],
};

export const incidentService = {
  async list(statusFilter?: string): Promise<Incident[]> {
    try {
      const res = await apiClient.get("/incidents", { params: { status: statusFilter } });
      return res.data;
    } catch {
      let filtered = [...mockIncidents];
      if (statusFilter && statusFilter !== "all") {
        filtered = filtered.filter((i) => i.status === statusFilter);
      }
      return filtered;
    }
  },

  async getById(id: string): Promise<Incident | null> {
    try {
      const res = await apiClient.get(`/incidents/${id}`);
      return res.data;
    } catch {
      return mockIncidents.find((i) => i.id === id) || null;
    }
  },

  async getTimeline(id: string): Promise<TimelineEvent[]> {
    try {
      const res = await apiClient.get(`/incidents/${id}/timeline`);
      return res.data;
    } catch {
      return mockTimelineEvents[id] || [];
    }
  },

  async getCorrelatedSignals(id: string): Promise<CorrelatedSignal[]> {
    try {
      const res = await apiClient.get(`/incidents/${id}/correlations`);
      return res.data;
    } catch {
      return mockCorrelatedSignals[id] || [];
    }
  },

  async updateStatus(id: string, status: IncidentStatus): Promise<void> {
    try {
      await apiClient.patch(`/incidents/${id}`, { status });
    } catch {
      // mock ok
    }
  },
};
