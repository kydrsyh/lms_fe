import apiClient from './client';

export enum SettingValueType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

export enum SettingCategory {
  FEATURES = 'features',
  INTEGRATIONS = 'integrations',
  SYSTEM = 'system',
  BRANDING = 'branding',
}

export interface AppSetting {
  id: number;
  key: string;
  value: string;
  parsedValue: string | number | boolean | object | null;
  valueType: SettingValueType;
  category: SettingCategory;
  description?: string | null;
  isSensitive: boolean;
  isEditable: boolean;
  updatedBy: number | null;
  updatedAt: string;
}

export interface SettingUpdatePayload {
  value: string | number | boolean | object;
}

export const settingsApi = {
  getAll: async (): Promise<{ success: boolean; data: AppSetting[] }> => {
    const response = await apiClient.get<{ success: boolean; data: AppSetting[] }>(
      '/developer/settings'
    );
    return response.data;
  },

  getByKey: async (key: string): Promise<{ success: boolean; data: AppSetting }> => {
    const response = await apiClient.get<{ success: boolean; data: AppSetting }>(
      `/developer/settings/${key}`
    );
    return response.data;
  },

  update: async (
    key: string,
    payload: SettingUpdatePayload
  ): Promise<{ success: boolean; message: string; data: AppSetting }> => {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: AppSetting;
    }>(`/developer/settings/${key}`, payload);
    return response.data;
  },
};

