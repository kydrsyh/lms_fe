import { useState, useCallback } from 'react';
import { uploadImage, deleteFile } from '../utils/uploadUtils';

interface UseImageUploadOptions {
  folder?: string;
  onSuccess?: (result: { fileKey: string; publicUrl: string }) => void;
  onError?: (error: Error) => void;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const { folder = 'uploads', onSuccess, onError } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ fileKey: string; publicUrl: string } | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        const result = await uploadImage(file, folder, setProgress);
        setUploadedFile(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload gagal';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [folder, onSuccess, onError]
  );

  const deleteUploadedFile = useCallback(
    async (fileKey: string) => {
      try {
        await deleteFile(fileKey);
        if (uploadedFile?.fileKey === fileKey) {
          setUploadedFile(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus file';
        setError(errorMessage);
        throw err;
      }
    },
    [uploadedFile]
  );

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setUploadedFile(null);
  }, []);

  return {
    upload,
    deleteUploadedFile,
    reset,
    uploading,
    progress,
    error,
    uploadedFile,
  };
};

