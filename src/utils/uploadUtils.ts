import apiClient from "../api/client";

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

/**
 * Get storage configuration dari backend
 */
export const getStorageConfig = async (): Promise<StorageConfig> => {
  const response = await apiClient.get<{ data: StorageConfig }>(
    "/upload/config"
  );
  return response.data.data;
};

/**
 * Validasi file sebelum upload
 */
export const validateFile = (
  file: File,
  config: StorageConfig
): { valid: boolean; error?: string } => {
  // Check ukuran file
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `Ukuran file terlalu besar. Maksimal ${(
        config.maxFileSize /
        1024 /
        1024
      ).toFixed(1)}MB`,
    };
  }

  // Check tipe file
  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipe file tidak diizinkan. Hanya boleh: ${config.allowedTypes
        .map((t) => t.split("/")[1])
        .join(", ")}`,
    };
  }

  return { valid: true };
};

/**
 * Request presigned URL dari backend
 */
export const getPresignedUrl = async (
  fileName: string,
  fileType: string,
  fileSize: number,
  folder: string = "uploads"
): Promise<PresignedUrlResponse> => {
  const response = await apiClient.post<{ data: PresignedUrlResponse }>(
    "/upload/presigned-url",
    {
      fileName,
      fileType,
      fileSize,
      folder,
    }
  );
  return response.data.data;
};

/**
 * Upload file ke DigitalOcean Spaces menggunakan presigned URL
 */
export const uploadFileToSpaces = async (
  file: File,
  uploadUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track progress
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });
    }

    // Handle completion
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload gagal dengan status: ${xhr.status}`));
      }
    });

    // Handle errors
    xhr.addEventListener("error", () => {
      reject(new Error("Upload gagal karena network error"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload dibatalkan"));
    });

    // Open and send request
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("x-amz-acl", "public-read");
    xhr.send(file);
  });
};

/**
 * Confirm upload ke backend (untuk tracking)
 */
export const confirmUpload = async (
  fileKey: string,
  publicUrl: string
): Promise<void> => {
  await apiClient.post("/upload/confirm", {
    fileKey,
    publicUrl,
  });
};

/**
 * Delete file dari storage
 */
export const deleteFile = async (fileKey: string): Promise<void> => {
  await apiClient.delete("/upload/file", {
    data: { fileKey },
  });
};

/**
 * Complete upload flow - main function untuk upload image
 */
export const uploadImage = async (
  file: File,
  folder: string = "uploads",
  onProgress?: (progress: number) => void
): Promise<{ fileKey: string; publicUrl: string }> => {
  try {
    // 1. Get storage config dan validasi
    const config = await getStorageConfig();

    if (!config.isConfigured) {
      throw new Error("Storage belum dikonfigurasi");
    }

    const validation = validateFile(file, config);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 2. Request presigned URL
    const { uploadUrl, fileKey, publicUrl } = await getPresignedUrl(
      file.name,
      file.type,
      file.size,
      folder
    );

    // 3. Upload file ke Spaces
    await uploadFileToSpaces(file, uploadUrl, onProgress);

    // 4. Confirm upload ke backend
    await confirmUpload(fileKey, publicUrl);

    return { fileKey, publicUrl };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

/**
 * Helper untuk preview image sebelum upload
 */
export const getFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Gagal membaca file"));
      }
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Helper untuk format ukuran file
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
