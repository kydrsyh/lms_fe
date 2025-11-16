import apiClient from "./client";

export interface AuditLog {
  id: number;
  userId: number | null;
  action: string;
  resource: string;
  resourceId?: number | null;
  changes?: object | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: number;
    email: string;
  };
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  search?: string;
  resource?: string;
  action?: string;
}

export interface PaginatedAuditLogsResponse {
  success: boolean;
  data: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const auditLogApi = {
  getAll: async (
    filters?: AuditLogFilters
  ): Promise<PaginatedAuditLogsResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.resource) params.append("resource", filters.resource);
    if (filters?.action) params.append("action", filters.action);

    const response = await apiClient.get<PaginatedAuditLogsResponse>(
      `/developer/audit-logs?${params.toString()}`
    );
    return response.data;
  },
};
