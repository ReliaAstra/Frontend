import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { getOrgContext } from "@/lib/api";
import { BackendError } from "@/lib/api";

import { dashboardService } from "@/services/dashboardService";
import { dependencyService, type Dependency, type DependencyHistory, type CheckResult, type CreateDependencyRequest } from "@/services/dependencyService";
import { incidentService, type Incident, type IncidentDetail, type IncidentCorrelation, type IncidentStatus, type IncidentSeverity } from "@/services/incidentService";
import { evidenceService, type EvidenceDetail } from "@/services/evidenceService";
import { clientService, type Client, type PaginatedResponse, type ClientListParams } from "@/services/clientService";
import { billingService, type PricingPlansResponse, type CheckoutResponse, type VerifyTransactionResponse } from "@/services/billingService";
import { vendorService, type VendorResponse, type VendorDetailResponse, type VendorMetricsResponse, type VendorHistoryResponse, type VendorIncidentsResponse, type VendorTimelineResponse } from "@/services/vendorService";
import { orgService, type OrgMemberResponse } from "@/services/orgService";
import { apiKeyService, type ApiKeyResponse, type ApiKeyCreateResponse } from "@/services/apiKeyService";
import { notificationService, type AlertConfig, type CreateAlertConfigRequest } from "@/services/notificationService";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Common stale time constants */
const STALE_30S = 30 * 1000;
const STALE_5MIN = 5 * 60 * 1000;
const STALE_1HR = 60 * 60 * 1000;

/** Whether the org context is available (used as query `enabled` guard) */
function orgReady(): boolean {
  return !!getOrgContext();
}

/** Query options with org guard */
function orgQuery<T>(key: unknown[], queryFn: () => Promise<T>, opts?: Omit<UseQueryOptions<T, BackendError>, "queryKey" | "queryFn">) {
  return useQuery<T, BackendError>({
    queryKey: key,
    queryFn,
    enabled: orgReady(),
    ...opts,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useDashboardSummary() {
  return orgQuery(
    ["dashboard", "summary"],
    () => dashboardService.getSummary(),
    { staleTime: STALE_30S, refetchInterval: STALE_30S },
  );
}

export function useLatencyData(hours?: number) {
  return orgQuery(
    ["dashboard", "latency", { hours }],
    () => dashboardService.getLatency(hours),
    { staleTime: STALE_5MIN },
  );
}

export function useSlaDegradation(periodDays?: number) {
  return orgQuery(
    ["dashboard", "sla-degradation", { periodDays }],
    () => dashboardService.getSlaDegradation(periodDays),
    { staleTime: STALE_5MIN },
  );
}

export function useDependencyHealth() {
  return orgQuery(
    ["dashboard", "dependency-health"],
    () => dashboardService.getDependencyHealth(),
    { staleTime: STALE_30S },
  );
}

export function useRecentChecks(limit?: number) {
  return orgQuery(
    ["dashboard", "recent-checks", { limit }],
    () => dashboardService.getRecentChecks(limit),
    { staleTime: STALE_30S, refetchInterval: 10_000 }, // Auto-refetch every 10s for live check results
  );
}

export function useIncidentTimeline() {
  return orgQuery(
    ["dashboard", "incident-timeline"],
    () => incidentService.list(undefined, undefined, 20),
    { staleTime: STALE_30S },
  );
}

export function useVendorStatus() {
  return useQuery<VendorResponse[], BackendError>({
    queryKey: ["dashboard", "vendor-status"],
    queryFn: () => vendorService.listPublicVendors(),
    staleTime: STALE_5MIN,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEPENDENCY HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useDependencies(limit?: number) {
  const orgId = getOrgContext();
  return useQuery<Dependency[], BackendError>({
    queryKey: ["dependencies", { orgId, limit }],
    queryFn: () => dependencyService.list(limit),
    enabled: orgReady(),
  });
}

export function useDependency(id: string) {
  const orgId = getOrgContext();
  return useQuery<Dependency, BackendError>({
    queryKey: ["dependencies", { orgId, id }],
    queryFn: () => dependencyService.getById(id),
    enabled: orgReady() && !!id,
  });
}

export function useDependencyHistory(id: string) {
  const orgId = getOrgContext();
  return useQuery<DependencyHistory, BackendError>({
    queryKey: ["dependencies", { orgId, id }, "history"],
    queryFn: () => dependencyService.getHistory(id),
    enabled: orgReady() && !!id,
  });
}

export function useDependencyResults(id: string, limit?: number) {
  const orgId = getOrgContext();
  return useQuery<CheckResult[], BackendError>({
    queryKey: ["dependencies", { orgId, id }, "results", { limit }],
    queryFn: () => dependencyService.getResults(id, limit),
    enabled: orgReady() && !!id,
  });
}

export function useCreateDependency() {
  const queryClient = useQueryClient();
  return useMutation<Dependency, BackendError, CreateDependencyRequest>({
    mutationFn: (data) => dependencyService.create(data),
    onSuccess: () => {
      const orgId = getOrgContext();
      queryClient.invalidateQueries({ queryKey: ["dependencies", { orgId }] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "dependency-health"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}

export function useUpdateDependency() {
  const queryClient = useQueryClient();
  return useMutation<Dependency, BackendError, { id: string; data: Partial<CreateDependencyRequest> }>({
    mutationFn: ({ id, data }) => dependencyService.update(id, data),
    onSuccess: (_data, variables) => {
      const orgId = getOrgContext();
      queryClient.invalidateQueries({ queryKey: ["dependencies", { orgId }] });
      queryClient.invalidateQueries({ queryKey: ["dependencies", { orgId, id: variables.id }] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "dependency-health"] });
    },
  });
}

export function useDeleteDependency() {
  const queryClient = useQueryClient();
  return useMutation<void, BackendError, string>({
    mutationFn: (id) => dependencyService.delete(id),
    onSuccess: () => {
      const orgId = getOrgContext();
      queryClient.invalidateQueries({ queryKey: ["dependencies", { orgId }] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "dependency-health"] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// INCIDENT HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useIncidents(params?: { status?: string; severity?: string; limit?: number }) {
  const orgId = getOrgContext();
  return useQuery<Incident[], BackendError>({
    queryKey: ["incidents", { orgId, ...params }],
    queryFn: () =>
      incidentService.list(
        params?.status as IncidentStatus | undefined,
        params?.severity as IncidentSeverity | undefined,
        params?.limit,
      ),
    enabled: orgReady(),
    refetchInterval: 15_000, // Auto-refetch every 15s for live incident notifications
  });
}

export function useIncident(id: string) {
  const orgId = getOrgContext();
  return useQuery<IncidentDetail, BackendError>({
    queryKey: ["incidents", { orgId, id }],
    queryFn: () => incidentService.getById(id),
    enabled: orgReady() && !!id,
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  return useMutation<
    Incident,
    BackendError,
    { id: string; data: { status?: IncidentStatus; severity?: IncidentSeverity; root_cause?: string; description?: string | null } }
  >({
    mutationFn: ({ id, data }) => incidentService.update(id, data),
    onSuccess: (_data, variables) => {
      const orgId = getOrgContext();
      queryClient.invalidateQueries({ queryKey: ["incidents", { orgId }] });
      queryClient.invalidateQueries({ queryKey: ["incidents", { orgId, id: variables.id }] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}

export function useCorrelateIncident() {
  const queryClient = useQueryClient();
  return useMutation<
    IncidentCorrelation,
    BackendError,
    { id: string; data: { correlated_dependency_id: string; correlation_confidence?: number; correlation_method?: "temporal" | "manual" | "ml"; time_window_seconds?: number } }
  >({
    mutationFn: ({ id, data }) => incidentService.correlate(id, data),
    onSuccess: (_data, variables) => {
      const orgId = getOrgContext();
      queryClient.invalidateQueries({ queryKey: ["incidents", { orgId, id: variables.id }] });
    },
  });
}

export function useIncidentEvidence(incidentId: string) {
  const orgId = getOrgContext();
  return useQuery<EvidenceDetail, BackendError>({
    queryKey: ["incidents", { orgId, id: incidentId }, "evidence"],
    queryFn: () => incidentService.getEvidence(incidentId),
    enabled: orgReady() && !!incidentId,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVIDENCE HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useEvidence(limit?: number) {
  const orgId = getOrgContext();
  return useQuery<EvidenceDetail[], BackendError>({
    queryKey: ["evidence", { orgId, limit }],
    queryFn: () => evidenceService.list(),
    enabled: orgReady(),
  });
}

export function useEvidenceDetail(reportId: string) {
  const orgId = getOrgContext();
  return useQuery<EvidenceDetail, BackendError>({
    queryKey: ["evidence", { orgId, id: reportId }],
    queryFn: () => evidenceService.getById(reportId),
    enabled: orgReady() && !!reportId,
  });
}

export function useRegenerateEvidence() {
  const queryClient = useQueryClient();
  return useMutation<EvidenceDetail, BackendError, string>({
    mutationFn: (reportId) => evidenceService.regenerate(reportId),
    onSuccess: (_data, reportId) => {
      const orgId = getOrgContext();
      queryClient.invalidateQueries({ queryKey: ["evidence", { orgId, id: reportId }] });
      queryClient.invalidateQueries({ queryKey: ["evidence", { orgId }] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useClients(params?: ClientListParams) {
  const orgId = getOrgContext();
  return useQuery<PaginatedResponse<Client>, BackendError>({
    queryKey: ["clients", { orgId, ...params }],
    queryFn: () => clientService.list(params),
    enabled: orgReady(),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation<Client, BackendError, { name: string; slug?: string }>({
    mutationFn: (data) => clientService.create(data),
    onSuccess: () => {
      const orgId = getOrgContext();
      queryClient.invalidateQueries({ queryKey: ["clients", { orgId }] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// BILLING HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useBillingPlan() {
  return orgQuery(
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
  const orgId = getOrgContext();
  return useQuery<AlertConfig[], BackendError>({
    queryKey: ["notifications", { orgId }],
    queryFn: () => notificationService.list(),
    enabled: orgReady(),
  });
}

export function useCreateNotificationConfig() {
  const queryClient = useQueryClient();
  return useMutation<AlertConfig, BackendError, CreateAlertConfigRequest>({
    mutationFn: (data) => notificationService.create(data),
    onSuccess: () => {
      const orgId = getOrgContext();
      queryClient.invalidateQueries({ queryKey: ["notifications", { orgId }] });
    },
  });
}

export function useUpdateNotificationConfig() {
  const queryClient = useQueryClient();
  return useMutation<AlertConfig, BackendError, { id: string; data: Partial<CreateAlertConfigRequest> }>({
    mutationFn: ({ id, data }) => notificationService.update(id, data),
    onSuccess: () => {
      const orgId = getOrgContext();
      queryClient.invalidateQueries({ queryKey: ["notifications", { orgId }] });
    },
  });
}

export function useDeleteNotificationConfig() {
  const queryClient = useQueryClient();
  return useMutation<void, BackendError, string>({
    mutationFn: (id) => notificationService.delete(id),
    onSuccess: () => {
      const orgId = getOrgContext();
      queryClient.invalidateQueries({ queryKey: ["notifications", { orgId }] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// API KEY HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useApiKeys() {
  const orgId = getOrgContext();
  return useQuery<ApiKeyResponse[], BackendError>({
    queryKey: ["api-keys", { orgId }],
    queryFn: () => apiKeyService.list(),
    enabled: orgReady(),
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation<ApiKeyCreateResponse, BackendError, { name: string; scopes?: string[]; expires_at?: string | null }>({
    mutationFn: (data) => apiKeyService.create(data.name, data.scopes, data.expires_at),
    onSuccess: () => {
      const orgId = getOrgContext();
      queryClient.invalidateQueries({ queryKey: ["api-keys", { orgId }] });
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  return useMutation<void, BackendError, string>({
    mutationFn: (keyId) => apiKeyService.revoke(keyId),
    onSuccess: () => {
      const orgId = getOrgContext();
      queryClient.invalidateQueries({ queryKey: ["api-keys", { orgId }] });
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
  const orgId = getOrgContext();
  return useQuery<OrgMemberResponse[], BackendError>({
    queryKey: ["org", { orgId }, "members"],
    queryFn: () => orgService.listMembers(),
    enabled: orgReady(),
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation<OrgMemberResponse, BackendError, { email: string; role?: string }>({
    mutationFn: ({ email, role }) => {
      const orgId = getOrgContext();
      if (!orgId) throw new Error("No organization context");
      return orgService.inviteMember(orgId, email, role);
    },
    onSuccess: () => {
      const orgId = getOrgContext();
      queryClient.invalidateQueries({ queryKey: ["org", { orgId }, "members"] });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation<OrgMemberResponse, BackendError, { memberId: string; role: string }>({
    mutationFn: ({ memberId, role }) => {
      const orgId = getOrgContext();
      if (!orgId) throw new Error("No organization context");
      return orgService.updateMemberRole(orgId, memberId, role);
    },
    onSuccess: () => {
      const orgId = getOrgContext();
      queryClient.invalidateQueries({ queryKey: ["org", { orgId }, "members"] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation<void, BackendError, string>({
    mutationFn: (memberId) => {
      const orgId = getOrgContext();
      if (!orgId) throw new Error("No organization context");
      return orgService.removeMember(orgId, memberId);
    },
    onSuccess: () => {
      const orgId = getOrgContext();
      queryClient.invalidateQueries({ queryKey: ["org", { orgId }, "members"] });
    },
  });
}
