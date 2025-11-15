import apiClient from './client';

export interface SessionData {
  id: number;
  sessionId: string;
  userId: number;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: string;
  createdAt: string;
  user: {
    id: number;
    email: string;
    role: string;
    isActive: boolean;
  };
}

export interface SessionStats {
  totalActiveSessions: number;
  uniqueActiveUsers: number;
  sessionsByRole: {
    superadmin: number;
    admin: number;
    teacher: number;
    student: number;
  };
  expiringSoon: number;
}

export interface SessionFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  role?: string;
  deviceType?: string;
}

export interface PaginatedSessionsResponse {
  success: boolean;
  data: SessionData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const sessionApi = {
  getAllSessions: async (filters?: SessionFilters): Promise<PaginatedSessionsResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.deviceType) params.append('deviceType', filters.deviceType);

    const response = await apiClient.get<PaginatedSessionsResponse>(`/sessions?${params.toString()}`);
    return response.data;
  },

  getSessionStats: async (): Promise<SessionStats> => {
    const response = await apiClient.get('/sessions/stats');
    return response.data.data;
  },

  revokeSession: async (sessionId: number): Promise<void> => {
    await apiClient.delete(`/sessions/${sessionId}`);
  },

  revokeUserSessions: async (userId: number): Promise<void> => {
    await apiClient.delete(`/sessions/user/${userId}`);
  },
};

