import apiClient from './client';

export interface TwoFactorSecret {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export interface TwoFactorVerifyPayload {
  token: string;
  secret: string;
}

export interface TwoFactorEnableResponse {
  success: boolean;
  message: string;
  data: {
    backupCodes: string[];
  };
}

export interface TwoFactorDisablePayload {
  token: string;
}

export interface TwoFactorBackupCodePayload {
  backupCode: string;
}

export const twoFactorApi = {
  generateSecret: async (): Promise<{ success: boolean; data: TwoFactorSecret }> => {
    const response = await apiClient.get<{ success: boolean; data: TwoFactorSecret }>(
      '/auth/2fa/generate-secret'
    );
    return response.data;
  },

  verify: async (
    payload: TwoFactorVerifyPayload
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/auth/2fa/verify',
      payload
    );
    return response.data;
  },

  enable: async (payload: TwoFactorVerifyPayload): Promise<TwoFactorEnableResponse> => {
    const response = await apiClient.post<TwoFactorEnableResponse>(
      '/auth/2fa/enable',
      payload
    );
    return response.data;
  },

  disable: async (
    payload: TwoFactorDisablePayload
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/auth/2fa/disable',
      payload
    );
    return response.data;
  },

  verifyBackupCode: async (
    payload: TwoFactorBackupCodePayload
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/auth/2fa/verify-backup-code',
      payload
    );
    return response.data;
  },
};

