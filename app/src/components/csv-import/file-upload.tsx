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
  disabled?: boolean;
  allowedExtensions?: string[];
  maxSizeInMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  onClearFile,
  file,
  disabled = false,
  allowedExtensions = [".csv"],
  maxSizeInMB = 10
}) => {
  // Create a ref to the input element to programmatically trigger it
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if the file type is valid
  const isValidFileType = file ?
    allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext.toLowerCase())) :
    true;

  // Check if the file size is within limits
  const isValidFileSize = file ? file.size <= maxSizeInMB * 1024 * 1024 : true;

  // Format file size for display
  const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  // Function to trigger file input when "Change File" is clicked
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
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            disabled
              ? "border-gray-200 bg-gray-50"
              : "border-blue-200 bg-blue-50/30 hover:bg-blue-50/50 cursor-pointer"
          )}
          onClick={disabled ? undefined : handleClickChangeFile}
        >
          <Input
            ref={fileInputRef}
            type="file"
            accept={allowedExtensions.join(",")}
            onChange={onFileChange}
            className="hidden" // Hide the actual input
            disabled={disabled}
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
              disabled={disabled}
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
          {isValidFileType && isValidFileSize ? (
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
                <span>
                  {!isValidFileType && <span>Invalid file type. Only {allowedExtensions.join(", ")} files are allowed.</span>}
                  {!isValidFileSize && <span>File exceeds maximum size of {maxSizeInMB}MB.</span>}
                </span>
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
                onClick={handleClickChangeFile}
                disabled={disabled}
                className="flex-1"
              >
                Replace File
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClearFile}
                disabled={disabled}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" /> Clear
              </Button>
            </div>

            {/* Hidden input for changing file */}
            <Input
              ref={fileInputRef}
              type="file"
              accept={allowedExtensions.join(",")}
              onChange={onFileChange}
              className="hidden"
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
};