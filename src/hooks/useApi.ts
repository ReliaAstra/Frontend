import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { getAccessToken, getOrgContext } from "@/lib/api";
import { BackendError } from "@/lib/api";

import { dashboardService } from "@/services/dashboardService";
import { dependencyService, type Dependency, type DependencyHistory, type CheckResult, type CreateDependencyRequest, type UpdateDependencyRequest } from "@/services/dependencyService";
import { incidentService, type Incident, type IncidentDetail, type IncidentCorrelation, type IncidentStatus, type IncidentSeverity, type UpdateIncidentRequest, type CorrelateIncidentRequest } from "@/services/incidentService";
import { evidenceService, type EvidenceReport, type EvidenceReportDownload } from "@/services/evidenceService";
import { clientService, type Client, type Application, type CreateClientRequest, type CreateApplicationRequest } from "@/services/clientService";
import { billingService, type PricingPlansResponse, type CheckoutResponse, type VerifyTransactionResponse, type FoundingSpotsResponse, type ClaimFoundingSpotResponse } from "@/services/billingService";
import { vendorService, type VendorResponse, type VendorDetailResponse, type VendorMetricsResponse, type VendorHistoryResponse, type VendorIncidentsResponse, type VendorTimelineResponse } from "@/services/vendorService";
import { orgService, type OrgMemberResponse } from "@/services/orgService";
import { apiKeyService, type ApiKeyResponse, type ApiKeyCreateResponse } from "@/services/apiKeyService";
import { notificationService, type AlertConfig, type CreateAlertConfigRequest } from "@/services/notificationService";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Common stale time constants */
const STALE_30S = 30 * 1000;
const STALE_5MIN = 5 * 60 * 1000;
const STALE_1HR = 60 * 60 * 1000;

/**
 * Whether an authenticated session is available (used as the query `enabled` guard).
 * The live API resolves the org from the bearer token, so a stored access token
 * is all that's required. Demo mode is treated as ready without a real token
 * so the offline mocks can hydrate the dashboard.
 */
function sessionReady(): boolean {
  if (typeof window !== "undefined") {
    try {
      if (localStorage.getItem("reliastra_demo_mode") === "true") return true;
    } catch {}
  }
  return !!getAccessToken();
}

/** Query options guarded by an active session */
function useSessionQuery<T>(key: unknown[], queryFn: () => Promise<T>, opts?: Omit<UseQueryOptions<T, BackendError>, "queryKey" | "queryFn">) {
  return useQuery<T, BackendError>({
    queryKey: key,
    queryFn,
    enabled: sessionReady(),
    ...opts,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useDashboardSummary() {
  return useSessionQuery(
    ["dashboard", "summary"],
    () => dashboardService.getSummary(),
    { staleTime: STALE_30S, refetchInterval: STALE_30S },
  );
}

export function useLatencyData(hours?: number) {
  return useSessionQuery(
    ["dashboard", "latency", { hours }],
    () => dashboardService.getLatency(hours),
    { staleTime: STALE_5MIN },
  );
}

export function useSlaDegradation(periodDays?: number) {
  return useSessionQuery(
    ["dashboard", "sla-degradation", { periodDays }],
    () => dashboardService.getSlaDegradation(periodDays),
    { staleTime: STALE_5MIN },
  );
}

export function useDependencyHealth() {
  return useSessionQuery(
    ["dashboard", "dependency-health"],
    () => dashboardService.getDependencyHealth(),
    { staleTime: STALE_30S },
  );
}

export function useRecentChecks(limit?: number) {
  return useSessionQuery(
    ["dashboard", "recent-checks", { limit }],
    () => dashboardService.getRecentChecks(limit),
    { staleTime: STALE_30S, refetchInterval: 10_000 }, // Auto-refetch every 10s for live check results
  );
}

export function useIncidentTimeline(limit?: number) {
  return useSessionQuery(
    ["dashboard", "incident-timeline", { limit }],
    () => dashboardService.getIncidentTimeline(limit),
    { staleTime: STALE_30S },
  );
}

export function useVendorStatus() {
  return useQuery<VendorDetailResponse[], BackendError>({
    queryKey: ["dashboard", "vendor-status"],
    queryFn: () => dashboardService.getVendorStatus(),
    enabled: sessionReady(),
    staleTime: STALE_5MIN,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEPENDENCY HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useDependencies(limit?: number) {
  return useQuery<Dependency[], BackendError>({
    queryKey: ["dependencies", { limit }],
    queryFn: () => dependencyService.list(limit),
    enabled: sessionReady(),
  });
}

export function useDependency(id: string) {
  return useQuery<Dependency, BackendError>({
    queryKey: ["dependencies", { id }],
    queryFn: () => dependencyService.getById(id),
    enabled: sessionReady() && !!id,
  });
}

export function useDependencyHistory(id: string) {
  return useQuery<DependencyHistory, BackendError>({
    queryKey: ["dependencies", { id }, "history"],
    queryFn: () => dependencyService.getHistory(id),
    enabled: sessionReady() && !!id,
  });
}

export function useDependencyResults(id: string, limit?: number) {
  return useQuery<CheckResult[], BackendError>({
    queryKey: ["dependencies", { id }, "results", { limit }],
    queryFn: () => dependencyService.getResults(id, limit),
    enabled: sessionReady() && !!id,
  });
}

export function useCreateDependency() {
  const queryClient = useQueryClient();
  return useMutation<Dependency, BackendError, CreateDependencyRequest>({
    mutationFn: (data) => dependencyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependencies"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "dependency-health"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}

export function useUpdateDependency() {
  const queryClient = useQueryClient();
  return useMutation<Dependency, BackendError, { id: string; data: UpdateDependencyRequest }>({
    mutationFn: ({ id, data }) => dependencyService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dependencies"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "dependency-health"] });
    },
  });
}

export function useDeleteDependency() {
  const queryClient = useQueryClient();
  return useMutation<void, BackendError, string>({
    mutationFn: (id) => dependencyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependencies"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "dependency-health"] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// INCIDENT HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useIncidents(params?: { status?: string; severity?: string; limit?: number }) {
  return useQuery<Incident[], BackendError>({
    queryKey: ["incidents", { ...params }],
    queryFn: () =>
      incidentService.list(
        params?.status as IncidentStatus | undefined,
        params?.severity as IncidentSeverity | undefined,
        params?.limit,
      ),
    enabled: sessionReady(),
    refetchInterval: 15_000, // Auto-refetch every 15s for live incident notifications
  });
}

export function useIncident(id: string) {
  return useQuery<IncidentDetail, BackendError>({
    queryKey: ["incidents", { id }],
    queryFn: () => incidentService.getById(id),
    enabled: sessionReady() && !!id,
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  return useMutation<Incident, BackendError, { id: string; data: UpdateIncidentRequest }>({
    mutationFn: ({ id, data }) => incidentService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}

export function useCorrelateIncident() {
  const queryClient = useQueryClient();
  return useMutation<IncidentCorrelation, BackendError, { id: string; data: CorrelateIncidentRequest }>({
    mutationFn: ({ id, data }) => incidentService.correlate(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incidents", { id: variables.id }] });
    },
  });
}

export function useIncidentEvidence(incidentId: string) {
  return useQuery<EvidenceReport, BackendError>({
    queryKey: ["incidents", { id: incidentId }, "evidence"],
    queryFn: () => incidentService.getEvidence(incidentId),
    enabled: sessionReady() && !!incidentId,
    retry: false, // 404 simply means "no evidence yet"
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVIDENCE HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useEvidence(limit?: number) {
  return useQuery<EvidenceReport[], BackendError>({
    queryKey: ["evidence", { limit }],
    queryFn: () => evidenceService.list(limit),
    enabled: sessionReady(),
  });
}

export function useEvidenceDetail(reportId: string) {
  return useQuery<EvidenceReportDownload, BackendError>({
    queryKey: ["evidence", { id: reportId }],
    queryFn: () => evidenceService.getById(reportId),
    enabled: sessionReady() && !!reportId,
  });
}

export function useRegenerateEvidence() {
  const queryClient = useQueryClient();
  return useMutation<EvidenceReport, BackendError, string>({
    mutationFn: (reportId) => evidenceService.regenerate(reportId),
    onSuccess: (_data, reportId) => {
      queryClient.invalidateQueries({ queryKey: ["evidence", { id: reportId }] });
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useClients() {
  return useQuery<Client[], BackendError>({
    queryKey: ["clients"],
    queryFn: () => clientService.list(),
    enabled: sessionReady(),
  });
}

export function useClientApplications(clientId: string) {
  return useQuery<Application[], BackendError>({
    queryKey: ["clients", { clientId }, "applications"],
    queryFn: () => clientService.listApplications(clientId),
    enabled: sessionReady() && !!clientId,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation<Client, BackendError, CreateClientRequest>({
    mutationFn: (data) => clientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useCreateApplication(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation<Application, BackendError, CreateApplicationRequest>({
    mutationFn: (data) => clientService.createApplication(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", { clientId }, "applications"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// BILLING HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useBillingPlan() {
  return useSessionQuery(
    ["billing", "plan"],
    () => billingService.getPlan(),
    { staleTime: STALE_5MIN },
  );
}

export function usePricingPlans() {
  return useQuery<PricingPlansResponse, BackendError>({
    queryKey: ["billing", "pricing-plans"],
    queryFn: () => billingService.getPricingPlans(),
    staleTime: STALE_1HR,
  });
}

export function useFoundingSpots() {
  return useSessionQuery(
    ["billing", "founding-spots"],
    () => billingService.getFoundingSpots(),
    { staleTime: STALE_5MIN },
  );
}

export function useClaimFoundingSpot() {
  const queryClient = useQueryClient();
  return useMutation<ClaimFoundingSpotResponse, BackendError, string | undefined>({
    mutationFn: (email) => billingService.claimFoundingSpot(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "founding-spots"] });
      queryClient.invalidateQueries({ queryKey: ["billing", "plan"] });
    },
  });
}

export function useInitializePayment() {
  const queryClient = useQueryClient();
  return useMutation<CheckoutResponse, BackendError, { plan: string; email?: string }>({
    mutationFn: ({ plan, email }) => billingService.initializePayment(plan, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "plan"] });
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation<VerifyTransactionResponse, BackendError, string>({
    mutationFn: (reference) => billingService.verifyTransaction(reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "plan"] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useNotificationConfigs() {
  return useQuery<AlertConfig[], BackendError>({
    queryKey: ["notifications"],
    queryFn: () => notificationService.list(),
    enabled: sessionReady(),
  });
}

export function useCreateNotificationConfig() {
  const queryClient = useQueryClient();
  return useMutation<AlertConfig, BackendError, CreateAlertConfigRequest>({
    mutationFn: (data) => notificationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useUpdateNotificationConfig() {
  const queryClient = useQueryClient();
  return useMutation<AlertConfig, BackendError, { id: string; data: Partial<CreateAlertConfigRequest> }>({
    mutationFn: ({ id, data }) => notificationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotificationConfig() {
  const queryClient = useQueryClient();
  return useMutation<void, BackendError, string>({
    mutationFn: (id) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// API KEY HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useApiKeys() {
  return useQuery<ApiKeyResponse[], BackendError>({
    queryKey: ["api-keys"],
    queryFn: () => apiKeyService.list(),
    enabled: sessionReady(),
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation<ApiKeyCreateResponse, BackendError, { name: string; scopes?: string[]; expires_at?: string | null }>({
    mutationFn: (data) => apiKeyService.create(data.name, data.scopes, data.expires_at),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  return useMutation<void, BackendError, string>({
    mutationFn: (keyId) => apiKeyService.revoke(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// VENDOR HOOKS (public — no auth needed)
// ═══════════════════════════════════════════════════════════════════════════════

export function usePublicVendors() {
  return useQuery<VendorResponse[], BackendError>({
    queryKey: ["vendors", "public"],
    queryFn: () => vendorService.listPublicVendors(),
  });
}

export function usePublicVendor(name: string) {
  return useQuery<VendorDetailResponse, BackendError>({
    queryKey: ["vendors", "public", { name }],
    queryFn: () => vendorService.getVendorDetail(name),
    enabled: !!name,
  });
}

export function useVendorMetrics(name: string, window?: string) {
  return useQuery<VendorMetricsResponse, BackendError>({
    queryKey: ["vendors", { name }, "metrics", { window }],
    queryFn: () => vendorService.getVendorMetrics(name, window),
    enabled: !!name,
    refetchInterval: 30_000,
  });
}

export function useVendorHistory(name: string) {
  return useQuery<VendorHistoryResponse, BackendError>({
    queryKey: ["vendors", { name }, "history"],
    queryFn: () => vendorService.getVendorHistory(name),
    enabled: !!name,
  });
}

export function useVendorIncidents(name: string) {
  return useQuery<VendorIncidentsResponse, BackendError>({
    queryKey: ["vendors", { name }, "incidents"],
    queryFn: () => vendorService.getVendorIncidents(name),
    enabled: !!name,
  });
}

export function useVendorTimeline(
  name: string,
  params?: { window?: string; resolution?: string; region?: string },
) {
  return useQuery<VendorTimelineResponse, BackendError>({
    queryKey: ["vendors", { name }, "timeline", params],
    queryFn: () =>
      vendorService.getVendorTimeline(
        name,
        (params?.window as "1h" | "6h" | "24h" | "7d" | "30d" | "90d") ?? "24h",
        params?.resolution as "auto" | "1m" | "5m" | "15m" | "1h" | "6h" | undefined,
        params?.region,
      ),
    enabled: !!name,
    refetchInterval: 15_000,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORG / MEMBER HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useOrgMembers() {
  return useQuery<OrgMemberResponse[], BackendError>({
    queryKey: ["org", "members"],
    queryFn: () => orgService.listMembers(),
    enabled: sessionReady(),
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation<OrgMemberResponse, BackendError, { email: string; role?: string }>({
    mutationFn: ({ email, role }) => {
      const orgId = getOrgContext() ?? "current";
      return orgService.inviteMember(orgId, email, role as Parameters<typeof orgService.inviteMember>[2]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", "members"] });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation<OrgMemberResponse, BackendError, { memberId: string; role: string }>({
    mutationFn: ({ memberId, role }) => {
      const orgId = getOrgContext() ?? "current";
      return orgService.updateMemberRole(orgId, memberId, role as Parameters<typeof orgService.updateMemberRole>[2]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", "members"] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation<void, BackendError, string>({
    mutationFn: (memberId) => {
      const orgId = getOrgContext() ?? "current";
      return orgService.removeMember(orgId, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", "members"] });
    },
  });
}
