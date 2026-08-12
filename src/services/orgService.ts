import { apiClient, getOrgContext } from "@/lib/api";

export interface OrgResponse {
  id: string;
  name: string;
  slug: string;
  plan: string;
  has_agency_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrgMemberResponse {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export const orgService = {
  async list(): Promise<OrgResponse[]> {
    const res = await apiClient.get<OrgResponse[]>("/orgs");
    return res.data;
  },

  async getById(orgId: string): Promise<OrgResponse> {
    const res = await apiClient.get<OrgResponse>(`/orgs/${orgId}`);
    return res.data;
  },

  async update(orgId: string, data: { name?: string; plan?: string }): Promise<OrgResponse> {
    const res = await apiClient.patch<OrgResponse>(`/orgs/${orgId}`, data);
    return res.data;
  },

  async listMembers(orgId?: string): Promise<OrgMemberResponse[]> {
    const oid = orgId || getOrgContext();
    if (!oid) throw new Error("No organization context");
    const res = await apiClient.get<OrgMemberResponse[]>(`/orgs/${oid}/members`);
    return res.data;
  },

  async inviteMember(orgId: string, email: string, role: string = "member"): Promise<OrgMemberResponse> {
    const res = await apiClient.post<OrgMemberResponse>(`/orgs/${orgId}/members`, { email, role });
    return res.data;
  },

  async updateMemberRole(orgId: string, memberId: string, role: string): Promise<OrgMemberResponse> {
    const res = await apiClient.patch<OrgMemberResponse>(`/orgs/${orgId}/members/${memberId}`, { role });
    return res.data;
  },

  async removeMember(orgId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/orgs/${orgId}/members/${memberId}`);
  },
};
