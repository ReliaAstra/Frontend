import { apiClient, getOrgContext } from "@/lib/api";

export type IncidentSeverity = "critical" | "major" | "minor";
export type IncidentStatus = "open" | "resolved" | "false_positive";

export interface Incident {
  id: string;
  org_id: string;
  dependency_id: string;
  started_at: string;
  resolved_at: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  root_cause: "vendor_failure" | "network_issue" | "config_error" | "unknown";
  description: string | null;
  evidence_report_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentCorrelation {
  id: string;
  incident_id: string;
  correlated_dependency_id: string;
  correlation_confidence: number;
  time_window_seconds: number;
  correlation_method: "temporal" | "manual" | "ml";
  created_at: string;
}

export interface IncidentDetail extends Incident {
  correlations: IncidentCorrelation[];
}

// Timeline events derived from incident data + correlations
// (no dedicated backend timeline endpoint :  built from incident fields)
export interface TimelineEvent {
  id: string;
  type: "status_change" | "correlation" | "evidence_generated" | "resolved" | "acknowledged" | "note";
  timestamp: string;
  action: string;
  details: string;
  actor: string;
}

// Correlated signals derived from incident correlations
export interface CorrelatedSignal {
  id: string;
  name: string;
  correlation: number;
  metric: string;
  values: number[];
}

export interface VendorIncident {
  incident_id: string;
  dependency_name: string;
  started_at: string;
  resolved_at: string | null;
  severity: string;
  status: string;
  duration_seconds: number | null;
}

export interface VendorIncidentsResponse {
  vendor_name: string;
  incidents: VendorIncident[];
}

// Build timeline events from incident data
export function buildTimeline(incident: IncidentDetail): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Incident started
  events.push({
    id: `${incident.id}-start`,
    type: "status_change",
    timestamp: incident.started_at,
    action: "Incident opened",
    details: `Severity: ${incident.severity}. ${incident.description || "No description provided."}`,
    actor: "System",
  });

  // Correlations
  for (const c of incident.correlations) {
    events.push({
      id: c.id,
      type: "correlation",
      timestamp: c.created_at,
      action: `Correlation established`,
      details: `Dependency correlated via ${c.correlation_method} method (confidence: ${(c.correlation_confidence * 100).toFixed(0)}%, window: ${c.time_window_seconds}s).`,
      actor: c.correlation_method === "manual" ? "User" : "System",
    });
  }

  // Evidence
  if (incident.evidence_report_id) {
    events.push({
      id: `${incident.id}-evidence`,
      type: "evidence_generated",
      timestamp: incident.updated_at,
      action: "Evidence report generated",
      details: `Evidence snapshot created for this incident.`,
      actor: "System",
    });
  }

  // Resolution
  if (incident.resolved_at) {
    events.push({
      id: `${incident.id}-resolved`,
      type: "resolved",
      timestamp: incident.resolved_at,
      action: "Incident resolved",
      details: incident.root_cause !== "unknown"
        ? `Root cause: ${incident.root_cause.replace(/_/g, " ")}.`
        : "Root cause was not determined.",
      actor: "System",
    });
  }

  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// Build correlated signals from incident correlations
export function buildCorrelatedSignals(incident: IncidentDetail): CorrelatedSignal[] {
  return incident.correlations.map((c) => ({
    id: c.id,
    name: `Dependency ${c.correlated_dependency_id.slice(0, 8)}`,
    correlation: c.correlation_confidence,
    metric: `Time window: ${c.time_window_seconds}s · Method: ${c.correlation_method}`,
    values: [],
  }));
}

export const incidentService = {
  async list(status?: IncidentStatus, severity?: IncidentSeverity, limit = 50): Promise<Incident[]> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const params: Record<string, unknown> = { limit };
    if (status) params.status = status;
    if (severity) params.severity = severity;
    const res = await apiClient.get<Incident[]>(`/orgs/${orgId}/incidents`, { params });
    return res.data;
  },

  async getById(id: string): Promise<IncidentDetail> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<IncidentDetail>(`/orgs/${orgId}/incidents/${id}`);
    return res.data;
  },

  async update(
    id: string,
    data: {
      status?: IncidentStatus;
      severity?: IncidentSeverity;
      root_cause?: string;
      description?: string | null;
    }
  ): Promise<Incident> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.patch<Incident>(`/orgs/${orgId}/incidents/${id}`, data);
    return res.data;
  },

  async correlate(
    id: string,
    data: {
      correlated_dependency_id: string;
      correlation_confidence?: number;
      correlation_method?: "temporal" | "manual" | "ml";
      time_window_seconds?: number;
    }
  ): Promise<IncidentCorrelation> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.post<IncidentCorrelation>(`/orgs/${orgId}/incidents/${id}/correlate`, data);
    return res.data;
  },

  async getEvidence(id: string) {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get(`/orgs/${orgId}/incidents/${id}/evidence`);
    return res.data;
  },
};
