'use client';

import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';

interface DocumentUploadProps {
  onUploadSuccess?: (url: string, publicId: string) => void;
  onUploadError?: (error: string) => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  folder?: string;
  className?: string;
}

export function DocumentUpload({
  onUploadSuccess,
  onUploadError,
  maxSizeMB = 10,
  acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  folder = 'fast-connect/documents',
  className = ''
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!acceptedTypes.includes(selectedFile.type)) {
      const errorMsg = `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validate file size
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      const errorMsg = `File size exceeds ${maxSizeMB}MB limit`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setUploadedUrl(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      const missing = [];
      if (!cloudName) missing.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
      if (!uploadPreset) missing.push('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
      
      const errorMsg = `Cloudinary is not configured. Missing: ${missing.join(', ')}. Please add these to .env.local file.`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Create form data for direct Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);
      formData.append('resource_type', 'auto'); // Auto-detect file type

      // Upload directly to Cloudinary
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const url = response.secure_url;
          const publicId = response.public_id;

          setUploadedUrl(url);
          setProgress(100);
          toast.success('Document uploaded successfully!');
          
          if (onUploadSuccess) {
            onUploadSuccess(url, publicId);
          }
        } else {
          let errorResponse;
          try {
            errorResponse = JSON.parse(xhr.responseText);
          } catch {
            errorResponse = { error: { message: xhr.responseText || 'Upload failed' } };
          }
          
          let errorMsg = errorResponse.error?.message || 'Upload failed';
          
          // Better error messages
          if (errorMsg.includes('preset') || errorMsg.includes('Preset')) {
            errorMsg = `Upload preset "${uploadPreset}" not found. Please create it in Cloudinary Dashboard → Settings → Upload → Upload presets. Set it to "Unsigned" mode.`;
          }
          
          setError(errorMsg);
          toast.error(errorMsg);
          console.error('Cloudinary upload error:', errorResponse);
          
          if (onUploadError) {
            onUploadError(errorMsg);
          }
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        const errorMsg = 'Network error during upload';
        setError(errorMsg);
        toast.error(errorMsg);
        setUploading(false);
        
        if (onUploadError) {
          onUploadError(errorMsg);
        }
      });

      // Upload directly to Cloudinary - use /auto/upload to handle all file types properly
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
      xhr.send(formData);

    } catch (err: any) {
      const errorMsg = err.message || 'Upload failed';
      setError(errorMsg);
      toast.error(errorMsg);
      setUploading(false);
      
      if (onUploadError) {
        onUploadError(errorMsg);
      }
    }
  };

  const handleRemove = () => {
    setFile(null);
    setUploadedUrl(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeLabel = (type: string) => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('image')) return 'Image';
    if (type.includes('word') || type.includes('document')) return 'Document';
    return 'File';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-300">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {uploadedUrl && (
        <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-300">
            Document uploaded successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="document-upload" className="text-gray-900 dark:text-white">
          Upload Document
        </Label>
        <input
          ref={fileInputRef}
          id="document-upload"
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-900"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              PDF, DOC, DOCX, JPG, PNG (Max {maxSizeMB}MB)
            </p>
          </div>
        ) : (
          <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {getFileTypeLabel(file.type)} • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              {!uploading && !uploadedUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {uploading && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                  <span className="text-gray-600 dark:text-gray-400">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {uploadedUrl && (
              <div className="mt-4">
                <a
                  href={uploadedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View uploaded document →
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {file && !uploadedUrl && !uploading && (
        <Button
          onClick={handleUpload}
          className="w-full"
          disabled={uploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      )}

      {uploadedUrl && (
        <Button
          variant="outline"
          onClick={handleRemove}
          className="w-full"
        >
          Upload Another Document
        </Button>
      )}
    </div>
  );
}

