"use client";

// ---------------------------------------------------------------------------
// Demo mode — offline mock for design testing without backend
// ---------------------------------------------------------------------------

export const DEMO_FLAG = "reliastra_demo_mode";
export const DEMO_TOKEN = "demo_access_token_no_backend_required";
export const DEMO_REFRESH_TOKEN = "demo_refresh_token_no_backend_required";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(DEMO_FLAG) === "true";
  } catch {
    return false;
  }
}

export function enableDemoMode(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_FLAG, "true");
  localStorage.setItem("reliastra_access_token", DEMO_TOKEN);
  localStorage.setItem("reliastra_refresh_token", DEMO_REFRESH_TOKEN);
  // also store a marker for UI
  localStorage.setItem("reliastra_demo_org_id", MOCK_ORG.id);
}

export function disableDemoMode(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_FLAG);
  localStorage.removeItem("reliastra_access_token");
  localStorage.removeItem("reliastra_refresh_token");
  localStorage.removeItem("reliastra_demo_org_id");
  // clear org context helper key if present
  try {
    sessionStorage.removeItem("google_oauth_state");
    sessionStorage.removeItem("github_oauth_state");
  } catch {}
}

// ---------------------------------------------------------------------------
// Mock entities
// ---------------------------------------------------------------------------

const now = new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => iso(new Date(now.getTime() - n * 86400000));
const hoursAgo = (n: number) => iso(new Date(now.getTime() - n * 3600000));
const minutesAgo = (n: number) => iso(new Date(now.getTime() - n * 60000));

export const MOCK_USER = {
  id: "demo-user-0001",
  email: "demo@reliastra.design",
  full_name: "Alex Rivera",
  is_active: true,
  is_superuser: false,
  avatar_url: null as string | null,
  auth_provider: null as string | null,
  created_at: daysAgo(90),
  updated_at: hoursAgo(2),
};

export const MOCK_ORG = {
  id: "demo-org-0001",
  name: "Demo Design Lab",
  slug: "demo-design-lab",
  plan: "professional" as string,
  has_agency_mode: true,
  created_at: daysAgo(90),
  updated_at: hoursAgo(1),
};

export const MOCK_MEMBERS = [
  {
    id: "demo-member-0001",
    org_id: MOCK_ORG.id,
    user_id: MOCK_USER.id,
    role: "owner",
    joined_at: daysAgo(90),
  },
  {
    id: "demo-member-0002",
    org_id: MOCK_ORG.id,
    user_id: "demo-user-0002",
    role: "admin",
    joined_at: daysAgo(60),
  },
  {
    id: "demo-member-0003",
    org_id: MOCK_ORG.id,
    user_id: "demo-user-0003",
    role: "member",
    joined_at: daysAgo(30),
  },
];

// Dashboard
export const MOCK_DASHBOARD_SUMMARY = {
  active_dependencies_count: 12,
  open_incidents_count: 2,
  overall_uptime_percentage: 99.87,
  alerts_today_count: 5,
};

export const MOCK_SLA = {
  total_degradation_pct: 0.42,
  affected_services: 2,
  period: "30d",
};

export const MOCK_DEPENDENCY_HEALTH = [
  {
    dependency_id: "demo-dep-0001",
    name: "Stripe API",
    endpoint_url: "https://api.stripe.com/v1/charges",
    current_status: "up",
    uptime_percentage_24h: 99.98,
    avg_latency_ms_24h: 142.3,
  },
  {
    dependency_id: "demo-dep-0002",
    name: "Auth0 Login",
    endpoint_url: "https://auth.example.com/oauth/token",
    current_status: "degraded",
    uptime_percentage_24h: 98.12,
    avg_latency_ms_24h: 310.7,
  },
  {
    dependency_id: "demo-dep-0003",
    name: "SendGrid",
    endpoint_url: "https://api.sendgrid.com/v3/mail/send",
    current_status: "up",
    uptime_percentage_24h: 99.92,
    avg_latency_ms_24h: 98.4,
  },
  {
    dependency_id: "demo-dep-0004",
    name: "Mapbox Tiles",
    endpoint_url: "https://api.mapbox.com/styles/v1/mapbox/streets-v11",
    current_status: "down",
    uptime_percentage_24h: 96.44,
    avg_latency_ms_24h: 540.2,
  },
  {
    dependency_id: "demo-dep-0005",
    name: "Algolia Search",
    endpoint_url: "https://demo.algolia.net/1/indexes/products/query",
    current_status: "up",
    uptime_percentage_24h: 99.99,
    avg_latency_ms_24h: 76.1,
  },
];

// Latency — generate 48 points across 24h with 2 regions
export const MOCK_LATENCY: Array<{ timestamp: string; region: string; latency_ms: number; dependency_id: string | null }> =
  (() => {
    const points: Array<{ timestamp: string; region: string; latency_ms: number; dependency_id: string | null }> = [];
    const regions = ["us-east", "eu-west"];
    for (let i = 48; i >= 0; i--) {
      const ts = new Date(now.getTime() - i * 30 * 60000).toISOString();
      for (const region of regions) {
        const base = region === "us-east" ? 110 : 135;
        const jitter = Math.sin(i * 0.6) * 35 + Math.random() * 18;
        const spike = i === 8 || i === 33 ? 180 : 0;
        points.push({
          timestamp: ts,
          region,
          latency_ms: Math.max(45, Math.round((base + jitter + spike) * 10) / 10),
          dependency_id: null,
        });
      }
    }
    return points;
  })();

export const MOCK_RECENT_CHECKS = [
  {
    id: "demo-check-0001",
    dependency_id: "demo-dep-0001",
    org_id: MOCK_ORG.id,
    region: "us-east",
    executed_at: minutesAgo(2),
    latency_ms: 118.4,
    status_code: 200,
    is_up: true,
    error_message: null,
    quorum_confirmed: true,
  },
  {
    id: "demo-check-0002",
    dependency_id: "demo-dep-0002",
    org_id: MOCK_ORG.id,
    region: "eu-west",
    executed_at: minutesAgo(5),
    latency_ms: 342.1,
    status_code: 200,
    is_up: true,
    error_message: null,
    quorum_confirmed: true,
  },
  {
    id: "demo-check-0003",
    dependency_id: "demo-dep-0004",
    org_id: MOCK_ORG.id,
    region: "us-east",
    executed_at: minutesAgo(7),
    latency_ms: 0,
    status_code: 502,
    is_up: false,
    error_message: "Bad Gateway",
    quorum_confirmed: true,
  },
  {
    id: "demo-check-0004",
    dependency_id: "demo-dep-0003",
    org_id: MOCK_ORG.id,
    region: "apac-south",
    executed_at: minutesAgo(9),
    latency_ms: 89.6,
    status_code: 202,
    is_up: true,
    error_message: null,
    quorum_confirmed: true,
  },
  {
    id: "demo-check-0005",
    dependency_id: "demo-dep-0005",
    org_id: MOCK_ORG.id,
    region: "us-west",
    executed_at: minutesAgo(12),
    latency_ms: 72.3,
    status_code: 200,
    is_up: true,
    error_message: null,
    quorum_confirmed: false,
  },
  {
    id: "demo-check-0006",
    dependency_id: "demo-dep-0001",
    org_id: MOCK_ORG.id,
    region: "eu-west",
    executed_at: minutesAgo(15),
    latency_ms: 141.8,
    status_code: 200,
    is_up: true,
    error_message: null,
    quorum_confirmed: true,
  },
];

export const MOCK_DEPENDENCIES = [
  {
    id: "demo-dep-0001",
    org_id: MOCK_ORG.id,
    application_id: null,
    name: "Stripe API",
    endpoint_url: "https://api.stripe.com/v1/charges",
    method: "GET",
    headers: null,
    has_headers: false,
    expected_status_codes: [200],
    timeout_seconds: 10,
    check_interval_seconds: 60,
    next_check_at: iso(new Date(now.getTime() + 30000)),
    regions: ["us-east", "eu-west"],
    alert_threshold_ms: 300,
    is_active: true,
    created_at: daysAgo(45),
    updated_at: hoursAgo(1),
  },
  {
    id: "demo-dep-0002",
    org_id: MOCK_ORG.id,
    application_id: null,
    name: "Auth0 Login",
    endpoint_url: "https://auth.example.com/oauth/token",
    method: "POST",
    headers: null,
    has_headers: false,
    expected_status_codes: [200],
    timeout_seconds: 15,
    check_interval_seconds: 60,
    next_check_at: iso(new Date(now.getTime() + 15000)),
    regions: ["us-east"],
    alert_threshold_ms: 400,
    is_active: true,
    created_at: daysAgo(40),
    updated_at: hoursAgo(3),
  },
  {
    id: "demo-dep-0003",
    org_id: MOCK_ORG.id,
    application_id: "demo-app-0001",
    name: "SendGrid",
    endpoint_url: "https://api.sendgrid.com/v3/mail/send",
    method: "POST",
    headers: null,
    has_headers: false,
    expected_status_codes: [200, 202],
    timeout_seconds: 10,
    check_interval_seconds: 60,
    next_check_at: iso(new Date(now.getTime() + 45000)),
    regions: ["us-east", "us-west", "eu-west"],
    alert_threshold_ms: 250,
    is_active: true,
    created_at: daysAgo(38),
    updated_at: hoursAgo(6),
  },
  {
    id: "demo-dep-0004",
    org_id: MOCK_ORG.id,
    application_id: null,
    name: "Mapbox Tiles",
    endpoint_url: "https://api.mapbox.com/styles/v1/mapbox/streets-v11",
    method: "GET",
    headers: null,
    has_headers: false,
    expected_status_codes: [200],
    timeout_seconds: 10,
    check_interval_seconds: 300,
    next_check_at: iso(new Date(now.getTime() + 120000)),
    regions: ["us-east"],
    alert_threshold_ms: 500,
    is_active: true,
    created_at: daysAgo(30),
    updated_at: hoursAgo(8),
  },
  {
    id: "demo-dep-0005",
    org_id: MOCK_ORG.id,
    application_id: null,
    name: "Algolia Search",
    endpoint_url: "https://demo.algolia.net/1/indexes/products/query",
    method: "POST",
    headers: null,
    has_headers: false,
    expected_status_codes: [200],
    timeout_seconds: 10,
    check_interval_seconds: 60,
    next_check_at: iso(new Date(now.getTime() + 20000)),
    regions: ["eu-west", "apac-south"],
    alert_threshold_ms: 200,
    is_active: true,
    created_at: daysAgo(25),
    updated_at: hoursAgo(4),
  },
  {
    id: "demo-dep-0006",
    org_id: MOCK_ORG.id,
    application_id: "demo-app-0002",
    name: "Twilio SMS",
    endpoint_url: "https://api.twilio.com/2010-04-01/Accounts/messages.json",
    method: "POST",
    headers: null,
    has_headers: false,
    expected_status_codes: [200, 201],
    timeout_seconds: 15,
    check_interval_seconds: 60,
    next_check_at: iso(new Date(now.getTime() + 60000)),
    regions: ["us-east", "us-west"],
    alert_threshold_ms: 350,
    is_active: false,
    created_at: daysAgo(20),
    updated_at: hoursAgo(10),
  },
  {
    id: "demo-dep-0007",
    org_id: MOCK_ORG.id,
    application_id: null,
    name: "OpenAI Completions",
    endpoint_url: "https://api.openai.com/v1/chat/completions",
    method: "POST",
    headers: null,
    has_headers: true,
    expected_status_codes: [200],
    timeout_seconds: 20,
    check_interval_seconds: 60,
    next_check_at: iso(new Date(now.getTime() + 10000)),
    regions: ["us-east", "eu-west", "apac-south"],
    alert_threshold_ms: 1000,
    is_active: true,
    created_at: daysAgo(14),
    updated_at: hoursAgo(2),
  },
  {
    id: "demo-dep-0008",
    org_id: MOCK_ORG.id,
    application_id: null,
    name: "Cloudflare CDN",
    endpoint_url: "https://cdn.example.com/health",
    method: "HEAD",
    headers: null,
    has_headers: false,
    expected_status_codes: [200],
    timeout_seconds: 5,
    check_interval_seconds: 30,
    next_check_at: iso(new Date(now.getTime() + 5000)),
    regions: ["us-east", "us-west", "eu-west", "apac-south"],
    alert_threshold_ms: 150,
    is_active: true,
    created_at: daysAgo(10),
    updated_at: minutesAgo(30),
  },
];

export const MOCK_INCIDENTS = [
  {
    id: "demo-inc-0001",
    org_id: MOCK_ORG.id,
    dependency_id: "demo-dep-0004",
    started_at: hoursAgo(5),
    resolved_at: null,
    severity: "critical" as const,
    status: "open" as const,
    root_cause: "vendor_failure" as const,
    description: "Mapbox Tiles returning 502 Bad Gateway — regional outage detected in us-east. Quorum confirmed across 2 regions.",
    evidence_report_id: "demo-evid-0001",
    created_at: hoursAgo(5),
    updated_at: hoursAgo(1),
  },
  {
    id: "demo-inc-0002",
    org_id: MOCK_ORG.id,
    dependency_id: "demo-dep-0002",
    started_at: hoursAgo(26),
    resolved_at: null,
    severity: "major" as const,
    status: "open" as const,
    root_cause: "unknown" as const,
    description: "Auth0 login latency > 400ms p95 — degraded authentication for EU users.",
    evidence_report_id: null,
    created_at: hoursAgo(26),
    updated_at: hoursAgo(4),
  },
  {
    id: "demo-inc-0003",
    org_id: MOCK_ORG.id,
    dependency_id: "demo-dep-0005",
    started_at: daysAgo(3),
    resolved_at: daysAgo(2),
    severity: "minor" as const,
    status: "resolved" as const,
    root_cause: "network_issue" as const,
    description: "Algolia search elevated latency — auto-resolved after 47 minutes.",
    evidence_report_id: "demo-evid-0002",
    created_at: daysAgo(3),
    updated_at: daysAgo(2),
  },
  {
    id: "demo-inc-0004",
    org_id: MOCK_ORG.id,
    dependency_id: "demo-dep-0001",
    started_at: daysAgo(7),
    resolved_at: daysAgo(7),
    severity: "major" as const,
    status: "resolved" as const,
    root_cause: "vendor_failure" as const,
    description: "Stripe API timeout — vendor incident confirmed, evidence generated for SLA claim.",
    evidence_report_id: "demo-evid-0003",
    created_at: daysAgo(7),
    updated_at: daysAgo(7),
  },
];

export const MOCK_INCIDENT_DETAILS: Record<string, any> = {
  "demo-inc-0001": {
    ...MOCK_INCIDENTS[0],
    correlations: [
      {
        id: "demo-corr-0001",
        incident_id: "demo-inc-0001",
        correlated_dependency_id: "demo-dep-0008",
        correlation_confidence: 0.87,
        time_window_seconds: 300,
        correlation_method: "temporal",
        created_at: hoursAgo(4),
      },
    ],
  },
  "demo-inc-0002": { ...MOCK_INCIDENTS[1], correlations: [] },
  "demo-inc-0003": { ...MOCK_INCIDENTS[2], correlations: [] },
  "demo-inc-0004": {
    ...MOCK_INCIDENTS[3],
    correlations: [
      {
        id: "demo-corr-0002",
        incident_id: "demo-inc-0004",
        correlated_dependency_id: "demo-dep-0003",
        correlation_confidence: 0.62,
        time_window_seconds: 600,
        correlation_method: "manual",
        created_at: daysAgo(7),
      },
    ],
  },
};

export const MOCK_EVIDENCE = [
  {
    id: "demo-evid-0001",
    org_id: MOCK_ORG.id,
    incident_id: "demo-inc-0001",
    file_size_bytes: 284732,
    checksum: "sha256:demo-0001-abc123",
    generated_at: hoursAgo(4),
    expires_at: null,
    created_at: hoursAgo(4),
    updated_at: hoursAgo(4),
    download_url: "#demo-download-0001",
  },
  {
    id: "demo-evid-0002",
    org_id: MOCK_ORG.id,
    incident_id: "demo-inc-0003",
    file_size_bytes: 192004,
    checksum: "sha256:demo-0002-def456",
    generated_at: daysAgo(2),
    expires_at: null,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    download_url: "#demo-download-0002",
  },
  {
    id: "demo-evid-0003",
    org_id: MOCK_ORG.id,
    incident_id: "demo-inc-0004",
    file_size_bytes: 410112,
    checksum: "sha256:demo-0003-ghi789",
    generated_at: daysAgo(7),
    expires_at: null,
    created_at: daysAgo(7),
    updated_at: daysAgo(7),
    download_url: "#demo-download-0003",
  },
];

export const MOCK_CLIENTS = [
  {
    id: "demo-client-0001",
    org_id: MOCK_ORG.id,
    name: "Acme Corp",
    description: "Primary agency client — e-commerce platform",
    created_at: daysAgo(60),
    updated_at: daysAgo(2),
  },
  {
    id: "demo-client-0002",
    org_id: MOCK_ORG.id,
    name: "Globex Industries",
    description: "Fintech dashboard with 12 monitored endpoints",
    created_at: daysAgo(45),
    updated_at: daysAgo(5),
  },
  {
    id: "demo-client-0003",
    org_id: MOCK_ORG.id,
    name: "Soylent Corp",
    description: "Internal tools — 4 sites",
    created_at: daysAgo(30),
    updated_at: daysAgo(1),
  },
];

export const MOCK_APPLICATIONS: Record<string, any[]> = {
  "demo-client-0001": [
    { id: "demo-app-0001", org_id: MOCK_ORG.id, client_id: "demo-client-0001", name: "Acme Storefront", description: "Next.js storefront — US & EU", created_at: daysAgo(60), updated_at: daysAgo(2) },
    { id: "demo-app-0003", org_id: MOCK_ORG.id, client_id: "demo-client-0001", name: "Acme Admin", description: "Internal admin portal", created_at: daysAgo(55), updated_at: daysAgo(10) },
  ],
  "demo-client-0002": [
    { id: "demo-app-0002", org_id: MOCK_ORG.id, client_id: "demo-client-0002", name: "Globex API", description: "Core API — payments & KYC", created_at: daysAgo(45), updated_at: daysAgo(5) },
  ],
  "demo-client-0003": [
    { id: "demo-app-0004", org_id: MOCK_ORG.id, client_id: "demo-client-0003", name: "Soylent Intranet", description: "HR & ops tooling", created_at: daysAgo(30), updated_at: daysAgo(1) },
  ],
};

export const MOCK_BILLING_PLAN = {
  org_id: MOCK_ORG.id,
  plan: "professional" as const,
  max_dependencies: 50,
  min_check_interval_seconds: 15,
  subscription_status: "active",
  current_period_end: iso(new Date(now.getTime() + 30 * 86400000)),
  is_founding_customer: false,
  founding_discount_pct: 0,
  price_usd: 49,
  discounted_price_usd: null,
};

export const MOCK_PRICING_PLANS = {
  plans: [
    { plan: "free", display_name: "Free", description: "For personal projects", tag: null, price_usd: 0, max_dependencies: 3, min_check_interval_seconds: 60, data_retention_days: 1, features: {} },
    { plan: "starter", display_name: "Starter", description: "For small teams", tag: null, price_usd: 19, max_dependencies: 10, min_check_interval_seconds: 60, data_retention_days: 7, features: {} },
    { plan: "standard", display_name: "Standard", description: "For growing products", tag: "Popular", price_usd: 29, max_dependencies: 20, min_check_interval_seconds: 60, data_retention_days: 30, features: {} },
    { plan: "professional", display_name: "Professional", description: "For scale-ups", tag: null, price_usd: 49, max_dependencies: 50, min_check_interval_seconds: 15, data_retention_days: 90, features: {} },
    { plan: "agency", display_name: "Agency", description: "For agencies & MSPs", tag: null, price_usd: 99, max_dependencies: 200, min_check_interval_seconds: 15, data_retention_days: 365, features: {} },
  ],
};

export const MOCK_FOUNDING_SPOTS = {
  total_spots: 100,
  spots_taken: 73,
  spots_remaining: 27,
  founding_discount_pct: 25,
  eligible_plans: ["professional", "agency"],
  plan_discounts: {},
};

export const MOCK_NOTIFICATIONS = [
  { id: "demo-notif-0001", org_id: MOCK_ORG.id, channel_type: "email" as const, is_active: true, created_at: daysAgo(20), updated_at: daysAgo(1) },
  { id: "demo-notif-0002", org_id: MOCK_ORG.id, channel_type: "slack" as const, is_active: true, created_at: daysAgo(15), updated_at: hoursAgo(5) },
];

export const MOCK_API_KEYS: Array<any> = [
  {
    id: "demo-key-0001",
    org_id: MOCK_ORG.id,
    name: "CI Pipeline",
    prefix: "ra_live_abc",
    scopes: ["read:checks", "read:incidents"],
    last_used_at: hoursAgo(3),
    expires_at: null,
    created_at: daysAgo(14),
  },
  {
    id: "demo-key-0002",
    org_id: MOCK_ORG.id,
    name: "Demo Integration",
    prefix: "ra_demo_xyz",
    scopes: ["read:checks", "write:dependencies", "read:incidents", "read:evidence"],
    last_used_at: null,
    expires_at: iso(new Date(now.getTime() + 90 * 86400000)),
    created_at: daysAgo(2),
  },
];

export const MOCK_VENDORS: Array<any> = [
  {
    id: "demo-vendor-0001",
    vendor_name: "stripe",
    display_name: "Stripe",
    category: "payments",
    is_public: true,
    last_check_at: iso(new Date()),
    created_at: daysAgo(90),
    updated_at: iso(new Date()),
  },
  {
    id: "demo-vendor-0002",
    vendor_name: "auth0",
    display_name: "Auth0",
    category: "auth",
    is_public: true,
    last_check_at: iso(new Date()),
    created_at: daysAgo(90),
    updated_at: iso(new Date()),
  },
  {
    id: "demo-vendor-0003",
    vendor_name: "sendgrid",
    display_name: "SendGrid",
    category: "email",
    is_public: true,
    last_check_at: iso(new Date()),
    created_at: daysAgo(90),
    updated_at: iso(new Date()),
  },
];

export const MOCK_VENDOR_DETAILS: Record<string, any> = {
  stripe: {
    id: "demo-vendor-0001",
    vendor_name: "stripe",
    display_name: "Stripe",
    category: "payments",
    is_public: true,
    last_check_at: iso(new Date()),
    created_at: daysAgo(90),
    updated_at: iso(new Date()),
    recent_status: "operational",
    endpoints: [
      { id: "ep-1", endpoint_url: "https://api.stripe.com/v1", regions: ["us-east", "eu-west"], health_status: "up", is_active: true, last_check_at: iso(new Date()) },
    ],
  },
  auth0: {
    id: "demo-vendor-0002",
    vendor_name: "auth0",
    display_name: "Auth0",
    category: "auth",
    is_public: true,
    last_check_at: iso(new Date()),
    created_at: daysAgo(90),
    updated_at: iso(new Date()),
    recent_status: "degraded",
    endpoints: [
      { id: "ep-2", endpoint_url: "https://auth.example.com", regions: ["us-east"], health_status: "degraded", is_active: true, last_check_at: iso(new Date()) },
    ],
  },
  sendgrid: {
    id: "demo-vendor-0003",
    vendor_name: "sendgrid",
    display_name: "SendGrid",
    category: "email",
    is_public: true,
    last_check_at: iso(new Date()),
    created_at: daysAgo(90),
    updated_at: iso(new Date()),
    recent_status: "operational",
    endpoints: [
      { id: "ep-3", endpoint_url: "https://api.sendgrid.com/v3", regions: ["us-east"], health_status: "up", is_active: true, last_check_at: iso(new Date()) },
    ],
  },
};

// Vendor timeline mock generator
function mockTimeline(vendor: string): any {
  const points = Array.from({ length: 24 }).map((_, i) => {
    const ts = iso(new Date(now.getTime() - (23 - i) * 3600000));
    return {
      timestamp: ts,
      avg_latency_ms: 90 + Math.sin(i * 0.8) * 25 + Math.random() * 10,
      status_code: 200,
      is_up: true,
      observation_count: 12,
      incident_id: null,
    };
  });
  return {
    vendor_name: vendor,
    window: "24h",
    resolution: "1h",
    region: "us-east",
    from: iso(new Date(now.getTime() - 24 * 3600000)),
    to: iso(new Date()),
    current: { timestamp: iso(new Date()), latency_ms: 112.4, status_code: 200, is_up: true },
    points,
  };
}

// Mutable in-memory stores for mutations (demo feels live)
let mutableDeps = [...MOCK_DEPENDENCIES];
let mutableIncidents = [...MOCK_INCIDENTS];
let mutableEvidence = [...MOCK_EVIDENCE];
let mutableClients = [...MOCK_CLIENTS];
let mutableApiKeys = [...MOCK_API_KEYS];
let mutableNotifications = [...MOCK_NOTIFICATIONS];

export function getDemoMock(config: { url?: string; method?: string; params?: any; data?: any }): any | undefined {
  const rawUrl = config.url || "";
  // Strip baseURL if present and querystring
  const url = rawUrl.split("?")[0].replace(/^https?:\/\/[^/]+\/v1/, "");
  const method = (config.method || "get").toLowerCase();
  // data may be JSON string
  let body: any = config.data;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { /* keep string */ }
  }

  // Helper to extract id from /resource/{id}/...
  const idFrom = (prefix: string): string | null => {
    if (!url.startsWith(prefix)) return null;
    const rest = url.slice(prefix.length);
    const seg = rest.split("/")[0];
    return seg || null;
  };

  // ---- Auth & user/org ----
  if (url === "/auth/login" && method === "post") {
    return { access_token: DEMO_TOKEN, refresh_token: DEMO_REFRESH_TOKEN, token_type: "bearer", expires_in: 3600 };
  }
  if (url === "/auth/register" && method === "post") {
    return { access_token: DEMO_TOKEN, refresh_token: DEMO_REFRESH_TOKEN, token_type: "bearer", expires_in: 3600 };
  }
  if (url === "/auth/refresh" && method === "post") {
    return { access_token: DEMO_TOKEN, refresh_token: DEMO_REFRESH_TOKEN, token_type: "bearer", expires_in: 3600 };
  }
  if (url === "/auth/logout" && method === "post") {
    return { message: "logged out (demo)" };
  }
  if (url === "/users/me" && method === "get") {
    return MOCK_USER;
  }
  if ((url === "/orgs" || url === "/orgs/") && method === "get") {
    return [MOCK_ORG];
  }
  if ((url === "/orgs/current" || url === "/orgs/current/") && method === "get") {
    return MOCK_ORG;
  }
  if (url.startsWith("/orgs/members") && method === "get") {
    // support both flat array and paginated envelope — hooks handle both
    return { items: MOCK_MEMBERS, next_cursor: null, has_more: false };
  }
  if (url === "/orgs/members" && method === "post") {
    const newMember = {
      id: `demo-member-${Date.now()}`,
      org_id: MOCK_ORG.id,
      user_id: `demo-user-${Date.now()}`,
      role: body?.role || "member",
      joined_at: iso(new Date()),
    };
    MOCK_MEMBERS.push(newMember as any);
    return newMember;
  }
  if (url.startsWith("/orgs/members/") && method === "patch") {
    const memberId = url.split("/").pop();
    const m = MOCK_MEMBERS.find((x) => x.id === memberId);
    if (m && body?.role) (m as any).role = body.role;
    return m || MOCK_MEMBERS[0];
  }
  if (url.startsWith("/orgs/members/") && method === "delete") {
    const memberId = url.split("/").pop();
    const idx = MOCK_MEMBERS.findIndex((x) => x.id === memberId);
    if (idx >= 0) MOCK_MEMBERS.splice(idx, 1);
    return {};
  }
  if (url === "/orgs" && method === "post") {
    return MOCK_ORG;
  }
  if (url === "/orgs/current" && method === "patch") {
    if (body?.name) (MOCK_ORG as any).name = body.name;
    return MOCK_ORG;
  }

  // ---- Dashboard ----
  if (url === "/dashboard/summary" && method === "get") return MOCK_DASHBOARD_SUMMARY;
  if (url.startsWith("/dashboard/latency") && method === "get") return MOCK_LATENCY;
  if (url.startsWith("/dashboard/sla-degradation") && method === "get") return MOCK_SLA;
  if (url === "/dashboard/dependency-health" && method === "get") return MOCK_DEPENDENCY_HEALTH;
  if (url.startsWith("/dashboard/incident-timeline") && method === "get") {
    return { items: mutableIncidents.map((i) => MOCK_INCIDENT_DETAILS[i.id] || i), next_cursor: null, has_more: false };
  }
  if (url === "/dashboard/vendor-status" && method === "get") {
    return Object.values(MOCK_VENDOR_DETAILS);
  }
  if (url.startsWith("/checks/recent") && method === "get") return MOCK_RECENT_CHECKS;

  // ---- Dependencies ----
  if (url === "/dependencies" && method === "get") {
    // paginated envelope
    return { items: mutableDeps, next_cursor: null, has_more: false, total: mutableDeps.length };
  }
  if (url === "/dependencies" && method === "post") {
    const newDep: any = {
      id: `demo-dep-${Date.now()}`,
      org_id: MOCK_ORG.id,
      application_id: body?.application_id || null,
      name: body?.name || "New Dependency",
      endpoint_url: body?.endpoint_url || "https://example.com/health",
      method: body?.method || "GET",
      headers: body?.headers || null,
      has_headers: !!body?.headers,
      expected_status_codes: body?.expected_status_codes || [200],
      timeout_seconds: body?.timeout_seconds || 10,
      check_interval_seconds: body?.check_interval_seconds || 60,
      next_check_at: iso(new Date(now.getTime() + 60000)),
      regions: body?.regions || ["us-east"],
      alert_threshold_ms: body?.alert_threshold_ms || null,
      is_active: body?.is_active ?? true,
      created_at: iso(new Date()),
      updated_at: iso(new Date()),
    };
    mutableDeps.unshift(newDep);
    return newDep;
  }
  if (url.startsWith("/dependencies/") && method === "get") {
    const depId = idFrom("/dependencies/");
    if (!depId) return undefined;
    // /dependencies/{id}/history or /results or just /{id}
    if (url.endsWith("/history")) {
      const dep = mutableDeps.find((d) => d.id === depId);
      return {
        dependency_id: depId,
        uptime_percentage: dep?.id === "demo-dep-0004" ? 96.44 : 99.8,
        avg_latency_ms: dep?.id === "demo-dep-0002" ? 310.7 : 142.3,
        total_checks: 1440,
        total_up: 1380,
        total_down: 60,
      };
    }
    if (url.endsWith("/results") || url.includes("/results")) {
      // return paginated checks for that dep
      const filtered = MOCK_RECENT_CHECKS.filter((c) => c.dependency_id === depId);
      const items = filtered.length ? filtered : MOCK_RECENT_CHECKS.slice(0, 3).map((c) => ({ ...c, dependency_id: depId }));
      return { items, next_cursor: null, has_more: false };
    }
    const dep = mutableDeps.find((d) => d.id === depId);
    if (dep) return dep;
    // fallback — return first
    return mutableDeps[0];
  }
  if (url.startsWith("/dependencies/") && method === "patch") {
    const depId = idFrom("/dependencies/");
    const dep = mutableDeps.find((d) => d.id === depId);
    if (dep && body) Object.assign(dep as any, body, { updated_at: iso(new Date()) });
    return dep || mutableDeps[0];
  }
  if (url.startsWith("/dependencies/") && method === "delete") {
    const depId = idFrom("/dependencies/");
    mutableDeps = mutableDeps.filter((d) => d.id !== depId);
    return {};
  }

  // ---- Incidents ----
  if (url.startsWith("/incidents") && method === "get" && !url.includes("/evidence") && !url.includes("/correlate")) {
    // list vs detail
    // list: /incidents?limit
    // detail: /incidents/{id}
    if (url === "/incidents" || url === "/incidents/") {
      return { items: mutableIncidents, next_cursor: null, has_more: false, total: mutableIncidents.length };
    }
    // detail
    const incId = idFrom("/incidents/");
    if (incId) {
      // strip subpaths like /evidence
      const cleanId = incId.split("?")[0].split("/")[0];
      if (MOCK_INCIDENT_DETAILS[cleanId]) return MOCK_INCIDENT_DETAILS[cleanId];
      const found = mutableIncidents.find((i) => i.id === cleanId);
      if (found) return { ...found, correlations: [] };
    }
    // fallback list
    return { items: mutableIncidents, next_cursor: null, has_more: false };
  }
  if (url.startsWith("/incidents/") && method === "patch") {
    const incId = idFrom("/incidents/");
    const cleanId = incId?.split("/")[0] || "";
    const inc: any = mutableIncidents.find((i) => i.id === cleanId) || MOCK_INCIDENT_DETAILS[cleanId];
    if (inc && body) Object.assign(inc, body, { updated_at: iso(new Date()) });
    return inc || mutableIncidents[0];
  }
  if (url.includes("/correlate") && method === "post") {
    const incId = url.split("/")[2];
    return {
      id: `demo-corr-${Date.now()}`,
      incident_id: incId,
      correlated_dependency_id: body?.correlated_dependency_id || "demo-dep-0001",
      correlation_confidence: body?.correlation_confidence || 0.75,
      time_window_seconds: body?.time_window_seconds || 300,
      correlation_method: body?.correlation_method || "manual",
      created_at: iso(new Date()),
    };
  }
  if (url.includes("/incidents/") && url.includes("/evidence") && method === "get") {
    const incId = url.split("/")[2];
    const ev = mutableEvidence.find((e) => e.incident_id === incId);
    if (ev) return ev;
    // 404-like — but for demo return first evidence to avoid error; hooks have retry:false so we should return error?
    // Instead return empty and let caller handle. We throw to simulate 404 by returning undefined? We'll return undefined to let network attempt?
    // Better return a mocked 404 response via throwing? For demo we just return null and let hook not error.
    // We'll return not found by throwing special?
    // For simplicity return first evidence
    return mutableEvidence[0];
  }

  // ---- Evidence ----
  if (url.startsWith("/evidence") && method === "get") {
    if (url === "/evidence" || url.startsWith("/evidence?") || url === "/evidence/") {
      return mutableEvidence;
    }
    if (url.startsWith("/evidence/stats")) {
      return { total_gated_downloads: 42, total_accounts_created: 18, conversion_rate: 0.43, top_vendors: [], recent_conversions: [] };
    }
    // /evidence/{id}
    const evId = idFrom("/evidence/");
    if (evId && !url.includes("regenerate") && !url.includes("publicize") && !url.includes("gate") && !url.includes("stats") && !url.includes("/vendors")) {
      const cleanId = evId.split("/")[0].split("?")[0];
      const ev = mutableEvidence.find((e) => e.id === cleanId);
      if (ev) return { ...ev, download_url: `https://demo.reliastra.design/evidence/${cleanId}/download?token=demo-token-${cleanId}` };
      return mutableEvidence[0] ? { ...mutableEvidence[0], download_url: `https://demo.reliastra.design/evidence/${mutableEvidence[0].id}/download?token=demo` } : {};
    }
    // /vendors/.../incidents/public
    if (url.includes("/vendors/") && url.includes("/incidents/public")) {
      return [];
    }
  }
  if (url.includes("/evidence/") && url.includes("/regenerate") && method === "post") {
    const evId = url.split("/")[2];
    const ev = mutableEvidence.find((e) => e.id === evId);
    if (ev) {
      (ev as any).generated_at = iso(new Date());
      (ev as any).updated_at = iso(new Date());
      return ev;
    }
    return mutableEvidence[0];
  }
  if (url === "/evidence/publicize" && method === "post") {
    return { message: "Demo: evidence publicize mocked — no backend write.", report_id: body?.incident_id || "demo-evid-0001" };
  }
  if (url === "/evidence/gate" && method === "post") {
    return { download_url: "https://demo.reliastra.design/evidence/demo/download", report_id: "demo-evid-0001", report_token: "demo-token", expires_at: iso(new Date(now.getTime() + 3600000)), account_created: false, login_url: null, message: "Demo gate success" };
  }

  // ---- Clients ----
  if (url === "/clients" && method === "get") return mutableClients;
  if (url === "/clients" && method === "post") {
    const newClient: any = {
      id: `demo-client-${Date.now()}`,
      org_id: MOCK_ORG.id,
      name: body?.name || "New Client",
      description: body?.description || null,
      created_at: iso(new Date()),
      updated_at: iso(new Date()),
    };
    mutableClients.unshift(newClient);
    return newClient;
  }
  if (url.startsWith("/clients/") && url.endsWith("/applications") && method === "get") {
    const clientId = url.split("/")[2];
    return MOCK_APPLICATIONS[clientId] || [];
  }
  if (url.startsWith("/clients/") && url.endsWith("/applications") && method === "post") {
    const clientId = url.split("/")[2];
    const newApp: any = {
      id: `demo-app-${Date.now()}`,
      org_id: MOCK_ORG.id,
      client_id: clientId,
      name: body?.name || "New App",
      description: body?.description || null,
      created_at: iso(new Date()),
      updated_at: iso(new Date()),
    };
    if (!MOCK_APPLICATIONS[clientId]) MOCK_APPLICATIONS[clientId] = [];
    MOCK_APPLICATIONS[clientId].unshift(newApp);
    return newApp;
  }

  // ---- Billing ----
  if (url === "/billing/plan" && method === "get") return MOCK_BILLING_PLAN;
  if (url === "/billing/pricing-plans" && method === "get") return MOCK_PRICING_PLANS;
  if (url === "/billing/plans" && method === "get") return MOCK_PRICING_PLANS;
  if (url.startsWith("/billing/founding-spots") && method === "get") return MOCK_FOUNDING_SPOTS;
  if (url === "/billing/initialize" && method === "post") {
    return { authorization_url: "https://demo.reliastra.design/billing/demo-checkout", reference: `demo_ref_${Date.now()}`, access_code: "demo_access_code" };
  }
  if (url.startsWith("/billing/verify") && method === "post") {
    return { verified: true, plan: body?.plan || "professional", reference: body?.reference || "demo_ref" };
  }
  if (url.startsWith("/billing/claim-founding-spot") && method === "post") {
    return { success: true, message: "Demo founding spot claimed (mock)", is_founding_customer: true, founding_discount_pct: 25 };
  }

  // ---- Notifications ----
  if (url === "/notifications/configs" && method === "get") return mutableNotifications;
  if (url === "/notifications/configs" && method === "post") {
    const newNotif: any = {
      id: `demo-notif-${Date.now()}`,
      org_id: MOCK_ORG.id,
      channel_type: body?.channel_type || "email",
      is_active: true,
      created_at: iso(new Date()),
      updated_at: iso(new Date()),
    };
    mutableNotifications.unshift(newNotif);
    return newNotif;
  }
  if (url.startsWith("/notifications/configs/") && method === "patch") {
    const nid = url.split("/")[3];
    const n: any = mutableNotifications.find((x: any) => x.id === nid);
    if (n && body) Object.assign(n, body, { updated_at: iso(new Date()) });
    return n || mutableNotifications[0];
  }
  if (url.startsWith("/notifications/configs/") && method === "delete") {
    const nid = url.split("/")[3];
    mutableNotifications = mutableNotifications.filter((x: any) => x.id !== nid);
    return {};
  }
  if (url === "/notifications/test" && method === "post") {
    return { success: true, message: "Demo test notification sent (mock)" };
  }

  // ---- API Keys ----
  if (url === "/api-keys" && method === "get") return mutableApiKeys;
  if (url === "/api-keys" && method === "post") {
    const newKey: any = {
      id: `demo-key-${Date.now()}`,
      org_id: MOCK_ORG.id,
      name: body?.name || "Demo Key",
      prefix: `ra_demo_${Math.random().toString(36).slice(2, 6)}`,
      scopes: body?.scopes || ["read:checks"],
      last_used_at: null,
      expires_at: body?.expires_at || null,
      created_at: iso(new Date()),
      full_key: `ra_demo_${Math.random().toString(36).slice(2, 10)}_${Math.random().toString(36).slice(2, 10)}`,
    };
    mutableApiKeys.unshift(newKey);
    // Need to return full_key for creation
    return newKey;
  }
  if (url.startsWith("/api-keys/") && method === "delete") {
    const kid = url.split("/")[2];
    mutableApiKeys = mutableApiKeys.filter((k: any) => k.id !== kid);
    return {};
  }

  // ---- Vendors (public) ----
  if ((url === "/vendors" || url.startsWith("/vendors?") || url.startsWith("/vendors/?")) && method === "get") {
    // listPublicVendors with pagination
    return { items: MOCK_VENDORS, next_cursor: null, has_more: false };
  }
  if (url.startsWith("/vendors/") && method === "get") {
    const parts = url.split("/");
    // /vendors/{name} or /vendors/{name}/history etc.
    const vendorName = decodeURIComponent(parts[2] || "");
    if (url.endsWith("/history")) {
      return { vendor_name: vendorName, uptime_percentage_24h: 99.91, avg_latency_ms_24h: 112.4, recent_checks_count: 144 };
    }
    if (url.endsWith("/metrics")) {
      return {
        vendor_name: vendorName,
        metrics: {
          "24h": { window: "24h", total_observations: 288, uptime_percentage: 99.92, avg_latency_ms: 118.2, p95_latency_ms: 210.4 },
          "7d": { window: "7d", total_observations: 2016, uptime_percentage: 99.84, avg_latency_ms: 121.7, p95_latency_ms: 225.1 },
        },
      };
    }
    if (url.endsWith("/incidents")) {
      return { vendor_name: vendorName, incidents: MOCK_INCIDENTS.slice(0, 2).map((i) => ({ incident_id: i.id, dependency_name: "Demo Dep", started_at: i.started_at, resolved_at: i.resolved_at, severity: i.severity, status: i.status, duration_seconds: 3600 })) };
    }
    if (url.includes("/timeline")) {
      return mockTimeline(vendorName);
    }
    if (MOCK_VENDOR_DETAILS[vendorName]) return MOCK_VENDOR_DETAILS[vendorName];
    // fallback — return first vendor detail
    return Object.values(MOCK_VENDOR_DETAILS)[0];
  }

  // ---- Generic fallbacks for unknown demo routes ----
  // For any other GET that expects array, return []
  // For object, return {}
  // We signal handled by returning not undefined — caller will use fallback
  // But we only want to claim handled if we recognized pattern; otherwise return undefined to let real network attempt (which will fail gracefully)
  // For demo mode we still want to avoid network errors, so return empty defaults for unrecognized paths
  if (method === "get") {
    // Heuristic: if URL looks like list endpoint, return []
    // Check if service expects paginated envelope vs array — both unwrap to [] if we return {items: []}
    // To keep it safe, return array-like envelope for list-like URLs, and empty object for detail-like
    // List-like = plural, no id segment with UUID-like
    const isListLike = url.endsWith("s") || url.includes("?limit") || url === "/evidence" || url.includes("/results") || url.includes("/vendors");
    if (isListLike) {
      // try paginated first
      if (url.includes("/dependencies") || url.includes("/incidents") || url.includes("/vendors") || url.includes("/orgs/members")) {
        return { items: [], next_cursor: null, has_more: false };
      }
      return [];
    }
    return {};
  }
  // For POST/PATCH/DELETE unknown, just return empty success
  if (["post", "patch", "put", "delete"].includes(method)) {
    return body && typeof body === "object" ? { ...body, id: `demo-mock-${Date.now()}`, created_at: iso(new Date()), updated_at: iso(new Date()) } : { success: true };
  }

  return undefined;
}
