// Enhanced version with clear/change options
import React, { ChangeEvent, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Upload, FileText, FileUp, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
  file: File | null;
  allowedExtensions?: string[];
  maxSizeInMB?: number;
}

// Utility function to format file size
const formatFileSize = (sizeInBytes: number) => {
  const units = ['B', 'KB', 'MB'];
  let size = sizeInBytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

// Utility function to validate file
const validateFile = (file: File | null, allowedExtensions: string[], maxSizeInMB: number) => {
  if (!file) return { isValid: true, errors: [] };

  const errors: string[] = [];
  const isValidType = allowedExtensions.some(ext =>
    file.name.toLowerCase().endsWith(ext.toLowerCase())
  );
  const isValidSize = file.size <= maxSizeInMB * 1024 * 1024;

  if (!isValidType) {
    errors.push(`Invalid file type. Only ${allowedExtensions.join(", ")} files are allowed.`);
  }
  if (!isValidSize) {
    errors.push(`File exceeds maximum size of ${maxSizeInMB}MB.`);
  }

  return {
    isValid: isValidType && isValidSize,
    errors
  };
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  onClearFile,
  file,
  allowedExtensions = [".csv"],
  maxSizeInMB = 10
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isValid, errors } = validateFile(file, allowedExtensions, maxSizeInMB);

  const handleClickChangeFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Upload CSV File</h3>
        <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200 flex items-center">
          <FileUp className="h-3 w-3 mr-1" /> CSV Import
        </div>
      </div>

      {!file ? (
        // File selection UI when no file is selected
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors border-blue-200 bg-blue-50/30 hover:bg-blue-50/50 cursor-pointer")}
          onClick={handleClickChangeFile}
        >
          <Input
            ref={fileInputRef}
            type="file"
            accept={allowedExtensions.join(",")}
            onChange={onFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-blue-100">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-sm">Drag and drop your file, or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supported formats: {allowedExtensions.join(", ")} (max {maxSizeInMB}MB)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={e => {
                e.stopPropagation();
                handleClickChangeFile();
              }}
              className="mt-2"
            >
              Select File
            </Button>
          </div>
        </div>
      ) : (
        // File info and action buttons when file is selected
        <div className="flex flex-col gap-3 rounded-lg overflow-hidden">
          {/* Success or error message based on file validity */}
          {isValid ? (
            <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2">
              <div className="flex items-center text-green-800">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                <span>
                  File <span className="font-mono text-xs bg-green-100 px-1 rounded">{file.name}</span> is ready to be processed
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <div className="flex items-center text-red-800">
                <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                <span>{errors.join(" ")}</span>
              </div>
            </div>
          )}

          {/* File details card */}
          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-start">
              <div className="p-2 rounded-md bg-blue-100 mr-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <div className="flex flex-wrap gap-x-4 mt-1 text-xs text-muted-foreground">
                  <span>{formatFileSize(file.size)}</span>
                  <span>Last modified: {new Date(file.lastModified).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-3">

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClearFile}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" /> Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};