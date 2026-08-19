import { apiClient, unwrapItems, type PaginatedResponse } from "@/lib/api";
import type { EvidenceReport } from "@/services/evidenceService";

export type IncidentSeverity = "critical" | "major" | "minor";
export type IncidentStatus = "open" | "resolved" | "false_positive";
export type RootCause = "vendor_failure" | "network_issue" | "config_error" | "unknown";

/** Matches live schema IncidentResponse */
export interface Incident {
  id: string;
  org_id: string;
  dependency_id: string;
  started_at: string;
  resolved_at: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  root_cause: RootCause;
  description: string | null;
  evidence_report_id: string | null;
  created_at: string;
  updated_at: string;
}

/** Matches live schema IncidentCorrelationResponse */
export interface IncidentCorrelation {
  id: string;
  incident_id: string;
  correlated_dependency_id: string;
  correlation_confidence: number;
  time_window_seconds: number;
  correlation_method: "temporal" | "manual" | "ml" | string;
  created_at: string;
}

/** Matches live schema IncidentDetailResponse */
export interface IncidentDetail extends Incident {
  correlations: IncidentCorrelation[];
}

/** Matches live schema IncidentUpdateRequest */
export interface UpdateIncidentRequest {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  root_cause?: RootCause;
  description?: string | null;
}

/** Matches live schema IncidentCorrelateRequest */
export interface CorrelateIncidentRequest {
  correlated_dependency_id: string;
  correlation_confidence?: number;
  correlation_method?: "temporal" | "manual" | "ml";
  time_window_seconds?: number;
}

// Timeline events derived from incident data + correlations
// (no dedicated backend timeline endpoint — built from incident fields)
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
  for (const c of incident.correlations ?? []) {
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
  return (incident.correlations ?? []).map((c) => ({
    id: c.id,
    name: `Dependency ${c.correlated_dependency_id.slice(0, 8)}`,
    correlation: c.correlation_confidence,
    metric: `Time window: ${c.time_window_seconds}s · Method: ${c.correlation_method}`,
    values: [],
  }));
}

export const incidentService = {
  async list(status?: IncidentStatus, severity?: IncidentSeverity, limit = 50): Promise<Incident[]> {
    const params: Record<string, unknown> = { limit };
    if (status) params.status = status;
    if (severity) params.severity = severity;
    const res = await apiClient.get<PaginatedResponse<Incident>>("/incidents", { params });
    return unwrapItems(res.data);
  },

  async getById(id: string): Promise<IncidentDetail> {
    const res = await apiClient.get<IncidentDetail>(`/incidents/${id}`);
    return res.data;
  },

  async update(id: string, data: UpdateIncidentRequest): Promise<Incident> {
    const res = await apiClient.patch<Incident>(`/incidents/${id}`, data);
    return res.data;
  },

  async correlate(id: string, data: CorrelateIncidentRequest): Promise<IncidentCorrelation> {
    const res = await apiClient.post<IncidentCorrelation>(`/incidents/${id}/correlate`, data);
    return res.data;
  },

  async getEvidence(id: string): Promise<EvidenceReport> {
    const res = await apiClient.get<EvidenceReport>(`/incidents/${id}/evidence`);
    return res.data;
  },
};
