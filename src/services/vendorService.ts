import { apiClient } from "@/lib/api";

export interface VendorStatus {
  vendor_name: string;
  status: "operational" | "degraded_performance" | "partial_outage" | "major_outage";
  url: string;
  updated_at: string;
}

export const mockVendorStatuses: VendorStatus[] = [
  { vendor_name: "Stripe", status: "operational", url: "https://status.stripe.com", updated_at: "2026-08-12T18:45:00Z" },
  { vendor_name: "Twilio", status: "major_outage", url: "https://status.twilio.com", updated_at: "2026-08-12T18:30:00Z" },
  { vendor_name: "Auth0", status: "degraded_performance", url: "https://status.auth0.com", updated_at: "2026-08-12T18:20:00Z" },
  { vendor_name: "SendGrid", status: "operational", url: "https://status.sendgrid.com", updated_at: "2026-08-12T18:00:00Z" },
  { vendor_name: "Cloudflare", status: "operational", url: "https://www.cloudflarestatus.com", updated_at: "2026-08-12T17:50:00Z" },
];

export const vendorService = {
  async getPublicStatuses(): Promise<VendorStatus[]> {
    try {
      const res = await apiClient.get("/vendor-status");
      return res.data;
    } catch {
      return mockVendorStatuses;
    }
  },
};
