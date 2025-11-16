import apiClient from './client';

export interface UserData {
  id: number;
  email: string;
  role: 'developer' | 'superadmin' | 'admin' | 'teacher' | 'student';
  permissions?: any;
  isActive: boolean;
  twoFactorEnabled?: boolean;
  profileImage?: string | null;
  profileImageKey?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  deletedUsers: number;
  roleDistribution: {
    superadmin: number;
    admin: number;
    teacher: number;
    student: number;
  };
}

export interface UserFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  role?: string;
  isActive?: string;
}

export interface PaginatedUsersResponse {
  success: boolean;
  data: UserData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const userApi = {
  getAll: async (filters?: UserFilters) => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.isActive) params.append('isActive', filters.isActive);

    const response = await apiClient.get<PaginatedUsersResponse>(`/users?${params.toString()}`);
    return response.data;
  },

  toggleAccess: async (userId: number) => {
    const response = await apiClient.patch(`/users/${userId}/toggle-access`, {
      isActive: true, // Backend will toggle based on current state
    });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get<{ success: boolean; data: UserStats }>('/users/stats');
    return response.data;
  },

  updatePermissions: async (userId: number, permissions: any) => {
    const response = await apiClient.patch(`/users/${userId}/permissions`, { permissions });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get<{ success: boolean; data: UserData }>('/users/profile');
    return response.data;
  },

  updateProfileImage: async (profileImage: string, profileImageKey: string) => {
    const response = await apiClient.patch('/users/profile/image', {
      profileImage,
      profileImageKey,
    });
    return response.data;
  },

  deleteProfileImage: async () => {
    const response = await apiClient.delete('/users/profile/image');
    return response.data;
  },
};
