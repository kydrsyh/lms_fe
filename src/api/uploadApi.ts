import apiClient from "./client";

export interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  folder?: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

export interface StorageConfig {
  maxFileSize: number;
  allowedTypes: string[];
  isConfigured: boolean;
}

export interface ConfirmUploadRequest {
  fileKey: string;
  publicUrl: string;
}

export interface DeleteFileRequest {
  fileKey: string;
}

/**
 * Get storage configuration
 */
export const getStorageConfig = async (): Promise<StorageConfig> => {
  const response = await apiClient.get<{ data: StorageConfig }>(
    "/upload/config"
  );
  return response.data.data;
};

/**
 * Request presigned URL untuk upload
 */
export const requestPresignedUrl = async (
  data: PresignedUrlRequest
): Promise<PresignedUrlResponse> => {
  const response = await apiClient.post<{ data: PresignedUrlResponse }>(
    "/upload/presigned-url",
    data
  );
  return response.data.data;
};

/**
 * Confirm upload success
 */
export const confirmUpload = async (
  data: ConfirmUploadRequest
): Promise<void> => {
  await apiClient.post("/upload/confirm", data);
};

/**
 * Delete file
 */
export const deleteFile = async (data: DeleteFileRequest): Promise<void> => {
  await apiClient.delete("/upload/file", { data });
};
