import apiClient from './client';
import axios from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      email: string;
      role: 'admin' | 'teacher' | 'student';
    };
  };
}

export interface Device {
  id: number;
  deviceInfo: string;
  ipAddress: string;
  createdAt: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // Use axios directly for login (no token needed)
    const response = await axios.post('/api/auth/login', credentials);
    return response.data;
  },
  
  logout: async (refreshToken: string) => {
    const response = await axios.post('/api/auth/logout', { refreshToken });
    return response.data;
  },
  
  logoutAll: async () => {
    const response = await apiClient.post('/auth/logout-all');
    return response.data;
  },
  
  getDevices: async (): Promise<Device[]> => {
    const response = await apiClient.get<{ success: boolean; data: Device[] }>('/auth/devices');
    return response.data.data;
  },
  
  revokeDevice: async (deviceId: number) => {
    const response = await apiClient.delete(`/auth/devices/${deviceId}`);
    return response.data;
  },
};

