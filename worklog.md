---
Task ID: 2
Agent: Main Agent
Task: Integrate real API, TanStack Query, recharts, Paystack, Framer Motion

Work Log:
- Read full OpenAPI spec from https://api.zevcloud.app/openapi.json — 59 endpoints, 86 schemas
- Created src/hooks/useApi.ts — 31 TanStack Query hooks covering all service domains
  - Dashboard: useDashboardSummary (30s stale+refetch), useLatencyData, useSlaDegradation, useDependencyHealth, useRecentChecks, useIncidentTimeline, useVendorStatus
  - Dependencies: useDependencies, useDependency, useDependencyHistory, useDependencyResults, useCreateDependency, useUpdateDependency, useDeleteDependency
  - Incidents: useIncidents (with status/severity params), useIncident, useUpdateIncident, useCorrelateIncident, useIncidentEvidence
  - Evidence: useEvidence, useEvidenceDetail, useRegenerateEvidence
  - Clients: useClients, useCreateClient
  - Billing: useBillingPlan, usePricingPlans, useInitializePayment, useVerifyPayment
  - Notifications: useNotificationConfigs, useCreateNotificationConfig, useUpdateNotificationConfig, useDeleteNotificationConfig
  - API Keys: useApiKeys, useCreateApiKey, useDeleteApiKey
  - Vendors: usePublicVendors, usePublicVendor, useVendorMetrics, useVendorHistory, useVendorIncidents, useVendorTimeline
  - Org: useOrgMembers, useInviteMember, useUpdateMemberRole, useRemoveMember
- Updated services: evidenceService (added regenerate method), clientService (verified getById/create)
- Fixed settings/page.tsx: removed invalid `import type { Plan, type PricingPlanResponse }` → `{ type Plan, type PricingPlanResponse }`
- Rewired ALL 9 dashboard pages + layout from useState/useEffect to TanStack Query hooks
- Added recharts AreaChart latency visualization on dashboard with time pill selectors (1h/24h/7d/30d)
- Integrated Paystack billing flow: initializePayment → window.location.href redirect → auto-verify on ?reference= return → toast + cache invalidation
- Added Framer Motion AnimatePresence page transitions in layout (opacity+y, 200ms easeOut)
- Fixed dashboard page JSX parsing errors (unclosed tags, box-drawing chars)
- Verified ALL 7 pages compile and return 200 with zero errors

Stage Summary:
- 31 TanStack Query hooks with proper cache invalidation and org-context gating
- Dashboard: real-time recharts latency chart, KPI cards from live API, auto-refresh
- Settings: complete Paystack billing flow with auto-verification
- All pages use TanStack Query for loading/error states
- Framer Motion page transitions between all routes
- 100% of pages verified: /dashboard, /dependencies, /incidents, /evidence, /clients, /vendors, /settings
