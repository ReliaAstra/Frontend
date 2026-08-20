import { apiClient } from "@/lib/api";

/**
 * Matches live schema EvidenceReportResponse.
 * Evidence reports are generated files (PDF/JSON bundles) referenced by metadata.
 */
export interface EvidenceReport {
  id: string;
  org_id: string;
  incident_id: string;
  file_size_bytes: number;
  checksum: string;
  generated_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Matches live schema EvidenceReportDownloadResponse (adds a signed download URL) */
export interface EvidenceReportDownload extends EvidenceReport {
  download_url: string;
}

/** Matches live schema PublicIncidentResponse (public evidence gate listing) */
export interface PublicIncident {
  incident_id: string;
  vendor_name: string;
  title: string;
  started_at: string;
  resolved_at: string | null;
  duration_minutes: number | null;
  severity: string;
  status: string;
  max_latency_ms: number | null;
  downtime_percentage: number | null;
  has_evidence_report: boolean;
  download_token: string | null;
}

/** Matches live schema EvidenceGateRequest */
export interface EvidenceGateRequest {
  email: string;
  incident_id: string;
  vendor_name: string;
  full_name?: string | null;
  org_name?: string | null;
  ref_code?: string | null;
}

/** Matches live schema EvidenceGateResponse */
export interface EvidenceGateResult {
  download_url: string;
  report_id: string;
  report_token: string;
  expires_at: string;
  account_created: boolean;
  login_url: string | null;
  message: string;
}

/** Matches live schema PublicizeEvidenceRequest / PublicizeResponse */
export interface PublicizeResult {
  message: string;
  report_id: string;
}

/** Matches live schema EvidenceGateStats */
export interface EvidenceGateStats {
  total_gated_downloads: number;
  total_accounts_created: number;
  conversion_rate: number;
  top_vendors: Record<string, unknown>[];
  recent_conversions: Record<string, unknown>[];
}

export const evidenceService = {
  /** GET /v1/evidence — list evidence reports for the current org. */
  async list(limit = 50): Promise<EvidenceReport[]> {
    const res = await apiClient.get<EvidenceReport[]>("/evidence", { params: { limit } });
    return Array.isArray(res.data) ? res.data : [];
  },

  /** GET /v1/evidence/{report_id} — report metadata incl. a signed download URL. */
  async getById(reportId: string): Promise<EvidenceReportDownload> {
    const res = await apiClient.get<EvidenceReportDownload>(`/evidence/${reportId}`);
    return res.data;
  },

  /** POST /v1/evidence/{report_id}/regenerate — regenerate the report file. */
  async regenerate(reportId: string): Promise<EvidenceReport> {
    const res = await apiClient.post<EvidenceReport>(`/evidence/${reportId}/regenerate`);
    return res.data;
  },

  /**
   * Download the report file. Fetches the signed `download_url` from the API first,
   * then triggers a browser navigation to it.
   */
  async getDownloadUrl(reportId: string): Promise<string> {
    const detail = await evidenceService.getById(reportId);
    return detail.download_url;
  },

  /** POST /v1/evidence/publicize — make an incident's evidence report public/private. */
  async publicize(
    incidentId: string,
    makePublic = true,
    customTitle?: string,
    customSummary?: string
  ): Promise<PublicizeResult> {
    const res = await apiClient.post<PublicizeResult>("/evidence/publicize", {
      incident_id: incidentId,
      make_public: makePublic,
      custom_title: customTitle ?? null,
      custom_summary: customSummary ?? null,
    });
    return res.data;
  },

  /** GET /v1/evidence/stats — evidence gate conversion stats (auth). */
  async getGateStats(): Promise<EvidenceGateStats> {
    const res = await apiClient.get<EvidenceGateStats>("/evidence/stats");
    return res.data;
  },

  /** GET /v1/vendors/{vendor}/incidents/public — public incidents w/ evidence (no auth). */
  async listPublicIncidents(vendorName: string): Promise<PublicIncident[]> {
    const res = await apiClient.get<PublicIncident[]>(
      `/vendors/${encodeURIComponent(vendorName)}/incidents/public`
    );
    return Array.isArray(res.data) ? res.data : [];
  },

  /** POST /v1/evidence/gate — email-gated public evidence download (lead capture). */
  async gate(data: EvidenceGateRequest): Promise<EvidenceGateResult> {
    const res = await apiClient.post<EvidenceGateResult>("/evidence/gate", data);
    return res.data;
  },
};
