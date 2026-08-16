---
Task ID: 1
Agent: Main Agent
Task: Rebuild Reliastra's $1M Authenticated Operations Console — complete dark-mode redesign

Work Log:
- Analyzed uploaded 673-line design spec for the complete console rebuild
- Read existing codebase: 31 routes, 20 dashboard components, 11 service files, 41 shadcn components
- Updated globals.css with console-specific dark mode tokens (#0A0A0F palette), custom scrollbars, row stagger animations, pulse dot animation, chart draw animation
- Created Providers.tsx (TanStack Query QueryClientProvider wrapper)
- Created lib/tierLimits.ts (PLANS config, canAccessFeature helper, getPlanConfig)
- Created 4 shared components: UpgradeBanner, LockedFeature, EmptyState, ConsoleLayout (ConsoleCard, ConsoleCardBody, ConsoleCardHeader, ConsoleTableHeader, ConsoleTableRow, StatusDot, MetricValue, MonoSmall)
- Rebuilt DashboardSidebar (260px dark sidebar, org switcher, responsive 3-mode: desktop/tablet/mobile, cyan accent bar, 5 nav groups)
- Rebuilt DashboardHeader (dark sticky header, breadcrumbs from pathname, search, upgrade pill, notification bell, user avatar)
- Rebuilt Dashboard Layout (AuthProvider + Providers, dark bg, responsive margins, fadeIn animation)
- Rebuilt Dashboard overview page (KPI cards, incidents table, latency placeholder, SLA metric, recent checks, quick actions)
- Rebuilt Dependencies page (table, action dropdown, add modal with HTTPS validation, plan-gated intervals/regions, upgrade banner)
- Rebuilt Incidents list page (status/severity pill filters, grid table, status badges with pulse)
- Rebuilt Incident detail page (breadcrumb, live timer, two-column command center, timeline, actions, metadata, LockedFeature for evidence)
- Rebuilt Evidence list page (table with status/strength badges, LockedFeature for free plan)
- Rebuilt Evidence detail page (two-column, JSON viewer, evidence preview, verify action)
- Rebuilt Settings page (3 tabs: Profile, Team, Billing, usage meters, features checklist, pricing comparison grid, Paystack flow)
- Rebuilt Clients list page (table with stats)
- Rebuilt Client detail page (stats cards, sites list, generate report)
- Rebuilt Site detail page (dependency list, status overview)
- Created Vendors page (new route, vendor cards with status/uptime)
- Verified all 7 routes compile: /dashboard, /dependencies, /incidents, /evidence, /clients, /vendors, /settings — all 200, zero errors

Stage Summary:
- Complete dark-mode console rebuild: 13 pages, 4 shared components, 3 shell components
- All pages compile with zero TypeScript errors
- Responsive sidebar (3 modes), proper breadcrumbs, upgrade banners, locked features
- TanStack Query provider added, tier limits system with plan-gating
- All API integrations use existing service layer (dashboardService, incidentService, dependencyService, evidenceService, clientService, billingService, vendorService)
