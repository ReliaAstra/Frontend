import { apiClient } from "@/lib/api";

export interface OrgMember {
  id: string;
  email: string;
  full_name: string;
  role: "owner" | "admin" | "member" | "viewer";
  joined_at: string;
  avatar_url: string | null;
}

export const mockMembers: OrgMember[] = [
  { id: "mem_01", email: "sarah@acme.com", full_name: "Sarah Chen", role: "owner", joined_at: "2025-01-15T00:00:00Z", avatar_url: null },
  { id: "mem_02", email: "mike@acme.com", full_name: "Mike Rivera", role: "admin", joined_at: "2025-02-20T00:00:00Z", avatar_url: null },
  { id: "mem_03", email: "alex@acme.com", full_name: "Alex Kim", role: "member", joined_at: "2025-04-10T00:00:00Z", avatar_url: null },
  { id: "mem_04", email: "jordan@acme.com", full_name: "Jordan Lee", role: "member", joined_at: "2025-06-01T00:00:00Z", avatar_url: null },
  { id: "mem_05", email: "priya@acme.com", full_name: "Priya Patel", role: "viewer", joined_at: "2025-07-15T00:00:00Z", avatar_url: null },
];

export const orgService = {
  async listMembers(): Promise<OrgMember[]> {
    try {
      const res = await apiClient.get("/org/members");
      return res.data;
    } catch {
      return mockMembers;
    }
  },

  async inviteMember(email: string, role: string): Promise<void> {
    try {
      await apiClient.post("/org/members/invite", { email, role });
    } catch {
      // mock ok
    }
  },

  async updateMemberRole(memberId: string, role: string): Promise<void> {
    try {
      await apiClient.patch(`/org/members/${memberId}`, { role });
    } catch {
      // mock ok
    }
  },

  async removeMember(memberId: string): Promise<void> {
    try {
      await apiClient.delete(`/org/members/${memberId}`);
    } catch {
      // mock ok
    }
  },
};
