import { apiClient, getOrgContext } from "@/lib/api";

export interface EvidenceSnapshot {
  status_code: number;
  response_time_ms: number;
  error_message: string | null;
  body_preview: string | null;
  headers: Record<string, string> | null;
}

export interface ObservationWindow {
  start: string;
  end: string;
  duration_seconds: number;
  total_checks: number;
  failed_checks: number;
}

export interface EvidenceContributor {
  dependency_id: string;
  dependency_name: string;
  role: "primary" | "contributing" | "correlated";
  evidence_strength: "strong" | "moderate" | "weak";
  confidence: number;
  observation_window: ObservationWindow;
}

export interface EvidenceDetail {
  id: string;
  incident_id: string;
  org_id: string;
  snapshot: EvidenceSnapshot;
  observation_window: ObservationWindow;
  contributors: EvidenceContributor[];
  evidence_strength: "strong" | "moderate" | "weak";
  data_hash: string;
  status: "verified" | "pending" | "failed";
  ai_assessment: string | null;
  created_at: string;
  verified_at: string | null;
  report_url: string | null;
}

export interface EvidenceTimelineEvent {
  id: string;
  timestamp: string;
  event_type: "check_started" | "check_completed" | "status_change" | "threshold_breach" | "evidence_captured" | "correlation_found";
  description: string;
  metadata: Record<string, unknown>;
  actor: string;
}

export const evidenceService = {
  async getById(evidenceId: string): Promise<EvidenceDetail> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<EvidenceDetail>(`/orgs/${orgId}/evidence/${evidenceId}`);
    return res.data;
  },

  async getByIncident(incidentId: string): Promise<EvidenceDetail> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<EvidenceDetail>(`/orgs/${orgId}/incidents/${incidentId}/evidence`);
    return res.data;
  },

  async getTimeline(evidenceId: string): Promise<EvidenceTimelineEvent[]> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<EvidenceTimelineEvent[]>(
      `/orgs/${orgId}/evidence/${evidenceId}/timeline`
    );
    return res.data;
  },

  async verify(evidenceId: string): Promise<{ verified: boolean; verified_at: string }> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.post<{ verified: boolean; verified_at: string }>(
      `/orgs/${orgId}/evidence/${evidenceId}/verify`
    );
    return res.data;
  },

  async downloadPdf(evidenceId: string): Promise<Blob> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get(`/orgs/${orgId}/evidence/${evidenceId}/pdf`, {
      responseType: "blob",
    });
    return res.data;
  },

  async getJson(evidenceId: string): Promise<Record<string, unknown>> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<Record<string, unknown>>(
      `/orgs/${orgId}/evidence/${evidenceId}/json`
    );
    return res.data;
  },

  async generateClientReport(evidenceId: string, clientName?: string): Promise<{ report_url: string }> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.post<{ report_url: string }>(
      `/orgs/${orgId}/evidence/${evidenceId}/client-report`,
      { client_name: clientName || null }
    );
    return res.data;
  },
};
