import React, { useRef, useState } from 'react';
import { useImageUpload } from '../../hooks/useImageUpload';
import { getFilePreview, formatFileSize } from '../../utils/uploadUtils';
import Button from './Button';

interface ImageUploaderProps {
  onUploadSuccess: (result: { fileKey: string; publicUrl: string }) => void;
  onUploadError?: (error: Error) => void;
  folder?: string;
  existingImageUrl?: string;
  maxSizeMB?: number;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
  folder = 'uploads',
  existingImageUrl,
  maxSizeMB = 5,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(existingImageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { upload, uploading, progress, error } = useImageUpload({
    folder,
    onSuccess: onUploadSuccess,
    onError: onUploadError,
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB`);
      return;
    }

    setSelectedFile(file);

    // Generate preview
    try {
      const previewUrl = await getFilePreview(file);
      setPreview(previewUrl);
    } catch (err) {
      console.error('Error generating preview:', err);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await upload(selectedFile);
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(existingImageUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`image-uploader ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview Area */}
      <div className="preview-area border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-64 mx-auto rounded"
            />
            {selectedFile && (
              <div className="mt-2 text-sm text-gray-600 text-center">
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2">Belum ada gambar dipilih</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleChooseFile}
          disabled={uploading}
          variant="outline"
          fullWidth
        >
          Pilih Gambar
        </Button>

        {selectedFile && !uploading && (
          <>
            <Button
              onClick={handleUpload}
              disabled={uploading}
              variant="primary"
              fullWidth
            >
              Upload
            </Button>
            <Button
              onClick={handleCancel}
              disabled={uploading}
              variant="outline"
            >
              Batal
            </Button>
          </>
        )}
      </div>

      {/* Info */}
      <div className="mt-2 text-xs text-gray-500">
        Format: JPG, PNG, GIF, WebP. Maksimal {maxSizeMB}MB
      </div>
    </div>
  );
};

export default ImageUploader;

