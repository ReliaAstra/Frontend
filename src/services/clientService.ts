import { apiClient } from "@/lib/api";

/** Matches live schema ClientResponse */
export interface Client {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/** Matches live schema ApplicationResponse (an application grouped under a client) */
export interface Application {
  id: string;
  org_id: string;
  client_id: string | null;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/** Matches live schema ClientCreateRequest */
export interface CreateClientRequest {
  name: string;
  description?: string | null;
}

/** Matches live schema ApplicationCreateRequest */
export interface CreateApplicationRequest {
  name: string;
  description?: string | null;
}

export const clientService = {
  /** GET /v1/clients — plain array of the org's agency clients. */
  async list(): Promise<Client[]> {
    const res = await apiClient.get<Client[]>("/clients");
    return Array.isArray(res.data) ? res.data : [];
  },

  /** POST /v1/clients */
  async create(data: CreateClientRequest): Promise<Client> {
    const res = await apiClient.post<Client>("/clients", data);
    return res.data;
  },

  /**
   * The live API has no GET /v1/clients/{id}; resolve a single client
   * from the list endpoint instead.
   */
  async getById(clientId: string): Promise<Client | null> {
    const clients = await clientService.list();
    return clients.find((c) => c.id === clientId) ?? null;
  },

  /** GET /v1/clients/{client_id}/applications */
  async listApplications(clientId: string): Promise<Application[]> {
    const res = await apiClient.get<Application[]>(`/clients/${clientId}/applications`);
    return Array.isArray(res.data) ? res.data : [];
  },

  /** POST /v1/clients/{client_id}/applications */
  async createApplication(clientId: string, data: CreateApplicationRequest): Promise<Application> {
    const res = await apiClient.post<Application>(`/clients/${clientId}/applications`, data);
    return res.data;
  },
};
