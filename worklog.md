---
Task ID: 1
Agent: Main Agent
Task: Full Production Frontend Build — Integrate all frontend services to live Reliastra API

Work Log:
- Fetched and read OpenAPI spec (7,349 lines, 93KB) from https://api.zevcloud.app/openapi.json
- Fetched and read Frontend API Integration Guide (1,211 lines) from GitHub
- Verified live server health: status=degraded (database ok, redis unavailable)
- Audited all 70+ existing frontend files
- Found existing services already well-aligned with OpenAPI spec
- Created .env.local pointing to https://api.zevcloud.app/v1
- Updated auth-context.tsx: Added is_superuser, avatar_url, auth_provider to User type; added updated_at to Org type
- Rewrote billingService.ts: Added founding spots, claim founding spot, pricing plans, plan details with founding discount, verify transaction
- Updated vendorService.ts: Added getVendorTimeline() with window/resolution/region params, TimelineBucket/TimelineCurrent types
- Updated BillingCard.tsx: Changed to PlanDetailsResponse type, added all 5 plan tiers, added founding customer discount display, improved upgrade path
- Updated settings/page.tsx: Changed BillingPlanResponse → PlanDetailsResponse
- Fixed SlaDegradationWidget.tsx: Replaced local cn() with import from @/lib/utils
- Rewrote status-content.tsx: Replaced hardcoded data with live API calls (vendorService.listPublicVendors, getVendorDetail, getVendorHistory, getVendorIncidents)
- Final build: 31 pages generated successfully, zero errors

Stage Summary:
- All 11 service modules now match the live OpenAPI spec exactly
- API base URL configured for production (https://api.zevcloud.app/v1)
- Public status page now pulls live vendor data with auto-refresh every 60s
- Dashboard fully wired to live API with loading/error/retry states
- Billing card supports 5-tier pricing (free/starter/standard/professional/agency) with founding discount
- Build passes cleanly with all routes generated
