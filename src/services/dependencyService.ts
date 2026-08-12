import { apiClient } from "@/lib/api";

export type DependencyStatus = "up" | "down" | "degraded" | "unknown";

export interface Dependency {
  id: string;
  name: string;
  target_url: string;
  status: DependencyStatus;
  check_interval_seconds: number;
  expected_status_code: number;
  last_check_at: string;
  last_response_time_ms: number;
  uptime_24h: number;
  uptime_7d: number;
  is_active: boolean;
  recent_response_times: number[];
}

export interface CreateDependencyRequest {
  name: string;
  target_url: string;
  check_interval_seconds: number;
  expected_status_code: number;
  custom_headers?: Record<string, string>;
}

export const mockDependencies: Dependency[] = [
  {
    id: "dep_001", name: "Stripe API", target_url: "https://api.stripe.com/v1/charges",
    status: "up", check_interval_seconds: 60, expected_status_code: 200,
    last_check_at: "2026-08-12T18:47:00Z", last_response_time_ms: 89,
    uptime_24h: 99.98, uptime_7d: 99.95, is_active: true,
    recent_response_times: [92, 88, 95, 87, 91, 89, 93, 86, 90, 89],
  },
  {
    id: "dep_002", name: "Twilio SMS", target_url: "https://api.twilio.com/2010-04-01/Accounts",
    status: "down", check_interval_seconds: 30, expected_status_code: 200,
    last_check_at: "2026-08-12T18:47:00Z", last_response_time_ms: 0,
    uptime_24h: 94.2, uptime_7d: 97.1, is_active: true,
    recent_response_times: [120, 450, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: "dep_003", name: "Auth0 OIDC", target_url: "https://acme.us.auth0.com/oauth/token",
    status: "degraded", check_interval_seconds: 60, expected_status_code: 200,
    last_check_at: "2026-08-12T18:46:00Z", last_response_time_ms: 2450,
    uptime_24h: 98.7, uptime_7d: 99.4, is_active: true,
    recent_response_times: [95, 110, 890, 1200, 2450, 1800, 2100, 1650, 2300, 2450],
  },
  {
    id: "dep_004", name: "SendGrid Email", target_url: "https://api.sendgrid.com/v3/mail/send",
    status: "up", check_interval_seconds: 120, expected_status_code: 202,
    last_check_at: "2026-08-12T18:46:00Z", last_response_time_ms: 112,
    uptime_24h: 100.0, uptime_7d: 99.99, is_active: true,
    recent_response_times: [108, 115, 110, 118, 105, 112, 120, 109, 114, 112],
  },
  {
    id: "dep_005", name: "Cloudflare DNS", target_url: "https://1.1.1.1/dns-query",
    status: "up", check_interval_seconds: 30, expected_status_code: 200,
    last_check_at: "2026-08-12T18:45:00Z", last_response_time_ms: 12,
    uptime_24h: 100.0, uptime_7d: 100.0, is_active: true,
    recent_response_times: [11, 14, 10, 13, 12, 11, 15, 10, 12, 12],
  },
  {
    id: "dep_006", name: "OpenAI API", target_url: "https://api.openai.com/v1/chat/completions",
    status: "up", check_interval_seconds: 60, expected_status_code: 200,
    last_check_at: "2026-08-12T18:44:00Z", last_response_time_ms: 340,
    uptime_24h: 99.9, uptime_7d: 99.85, is_active: true,
    recent_response_times: [320, 350, 310, 380, 290, 340, 360, 330, 345, 340],
  },
  {
    id: "dep_007", name: "AWS S3", target_url: "https://s3.us-east-1.amazonaws.com/acme-bucket",
    status: "up", check_interval_seconds: 60, expected_status_code: 200,
    last_check_at: "2026-08-12T18:43:00Z", last_response_time_ms: 45,
    uptime_24h: 100.0, uptime_7d: 99.99, is_active: true,
    recent_response_times: [42, 48, 44, 50, 43, 45, 47, 41, 46, 45],
  },
  {
    id: "dep_008", name: "Datadog APM", target_url: "https://api.datadoghq.com/api/v1/series",
    status: "up", check_interval_seconds: 120, expected_status_code: 202,
    last_check_at: "2026-08-12T18:40:00Z", last_response_time_ms: 78,
    uptime_24h: 99.97, uptime_7d: 99.95, is_active: true,
    recent_response_times: [75, 82, 79, 80, 76, 78, 81, 74, 77, 78],
  },
  {
    id: "dep_009", name: "GitHub API", target_url: "https://api.github.com/repos/acme/app",
    status: "up", check_interval_seconds: 300, expected_status_code: 200,
    last_check_at: "2026-08-12T18:30:00Z", last_response_time_ms: 156,
    uptime_24h: 100.0, uptime_7d: 99.99, is_active: true,
    recent_response_times: [150, 162, 148, 170, 145, 156, 168, 142, 158, 156],
  },
  {
    id: "dep_010", name: "Slack Webhook", target_url: "https://hooks.slack.com/services/T00/B00/xxx",
    status: "up", check_interval_seconds: 300, expected_status_code: 200,
    last_check_at: "2026-08-12T18:25:00Z", last_response_time_ms: 210,
    uptime_24h: 99.95, uptime_7d: 99.9, is_active: true,
    recent_response_times: [205, 218, 198, 225, 200, 210, 222, 195, 215, 210],
  },
  {
    id: "dep_011", name: "MongoDB Atlas", target_url: "https://cluster0.xxxxx.mongodb.net",
    status: "up", check_interval_seconds: 60, expected_status_code: 200,
    last_check_at: "2026-08-12T18:42:00Z", last_response_time_ms: 8,
    uptime_24h: 100.0, uptime_7d: 100.0, is_active: true,
    recent_response_times: [7, 9, 8, 10, 7, 8, 9, 6, 8, 8],
  },
  {
    id: "dep_012", name: "Redis Cloud", target_url: "https://redis-12345.c1.us-east-1.ec2.cloud.redislabs.com",
    status: "up", check_interval_seconds: 60, expected_status_code: 200,
    last_check_at: "2026-08-12T18:41:00Z", last_response_time_ms: 3,
    uptime_24h: 100.0, uptime_7d: 100.0, is_active: true,
    recent_response_times: [2, 4, 3, 5, 2, 3, 4, 3, 3, 3],
  },
];

export const dependencyService = {
  async list(statusFilter?: string, search?: string): Promise<Dependency[]> {
    try {
      const res = await apiClient.get("/dependencies", { params: { status: statusFilter, search } });
      return res.data;
    } catch {
      let filtered = [...mockDependencies];
      if (statusFilter && statusFilter !== "all") {
        filtered = filtered.filter((d) => d.status === statusFilter);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((d) => d.name.toLowerCase().includes(q) || d.target_url.toLowerCase().includes(q));
      }
      return filtered;
    }
  },

  async getById(id: string): Promise<Dependency | null> {
    try {
      const res = await apiClient.get(`/dependencies/${id}`);
      return res.data;
    } catch {
      return mockDependencies.find((d) => d.id === id) || null;
    }
  },

  async create(data: CreateDependencyRequest): Promise<Dependency> {
    try {
      const res = await apiClient.post("/dependencies", data);
      return res.data;
    } catch {
      return {
        id: `dep_${Date.now()}`,
        name: data.name,
        target_url: data.target_url,
        status: "unknown",
        check_interval_seconds: data.check_interval_seconds,
        expected_status_code: data.expected_status_code,
        last_check_at: new Date().toISOString(),
        last_response_time_ms: 0,
        uptime_24h: 0,
        uptime_7d: 0,
        is_active: true,
        recent_response_times: [],
      };
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/dependencies/${id}`);
    } catch {
      // mock ok
    }
  },

  async toggleActive(id: string, active: boolean): Promise<void> {
    try {
      await apiClient.patch(`/dependencies/${id}`, { is_active: active });
    } catch {
      // mock ok
    }
  },
};
