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
