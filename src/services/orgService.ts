import { apiClient, unwrapItems, type PaginatedResponse } from "@/lib/api";

/** Matches live schema OrganizationResponse */
export interface OrgResponse {
  id: string;
  name: string;
  slug: string;
  plan: string;
  has_agency_mode: boolean;
  created_at: string;
  updated_at: string;
}

/** Matches live schema OrganizationMemberResponse */
export interface OrgMemberResponse {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export type OrgRole = "owner" | "admin" | "member" | "viewer";

export const orgService = {
  /** GET /v1/orgs — list organizations the current user belongs to. */
  async list(): Promise<OrgResponse[]> {
    const res = await apiClient.get<OrgResponse[]>("/orgs");
    return Array.isArray(res.data) ? res.data : [];
  },

  /** POST /v1/orgs — create a new organization. */
  async create(data: { name: string; slug?: string }): Promise<OrgResponse> {
    const res = await apiClient.post<OrgResponse>("/orgs", data);
    return res.data;
  },

  /** GET /v1/orgs/current — the organization resolved from the bearer token. */
  async getCurrent(): Promise<OrgResponse> {
    const res = await apiClient.get<OrgResponse>("/orgs/current");
    return res.data;
  },

  /** PATCH /v1/orgs/current — rename the current organization. */
  async updateCurrent(data: { name?: string }): Promise<OrgResponse> {
    const res = await apiClient.patch<OrgResponse>("/orgs/current", data);
    return res.data;
  },

  /** GET /v1/orgs/members — cursor-paginated member listing (unwrapped here). */
  async listMembers(limit = 50, cursor?: string): Promise<OrgMemberResponse[]> {
    const res = await apiClient.get<PaginatedResponse<OrgMemberResponse>>("/orgs/members", {
      params: { limit, ...(cursor ? { cursor } : {}) },
    });
    return unwrapItems(res.data);
  },

  /** POST /v1/orgs/members — invite a member by email. */
  async inviteMember(orgId: string, email: string, role: OrgRole = "member"): Promise<OrgMemberResponse> {
    void orgId; // org is resolved from the bearer token on the live API
    const res = await apiClient.post<OrgMemberResponse>("/orgs/members", { email, role });
    return res.data;
  },

  /** PATCH /v1/orgs/members/{member_id} — change a member's role. */
  async updateMemberRole(orgId: string, memberId: string, role: OrgRole): Promise<OrgMemberResponse> {
    void orgId;
    const res = await apiClient.patch<OrgMemberResponse>(`/orgs/members/${memberId}`, { role });
    return res.data;
  },

  /** DELETE /v1/orgs/members/{member_id} — remove a member. */
  async removeMember(orgId: string, memberId: string): Promise<void> {
    void orgId;
    await apiClient.delete(`/orgs/members/${memberId}`);
  },
};
