// Enhanced version with clear/change options
import React, { ChangeEvent, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Upload, FileText } from "lucide-react";

interface FileUploadProps {
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
  file: File | null;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileChange, 
  onClearFile,
  file,
  disabled = false
}) => {
  // Create a ref to the input element to programmatically trigger it
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to trigger file input when "Change File" is clicked
  const handleClickChangeFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-6">
      <label className="block mb-2 text-sm font-medium">Upload CSV File</label>
      
      {!file ? (
        // File selection UI when no file is selected
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Input 
            ref={fileInputRef}
            type="file" 
            accept=".csv" 
            onChange={onFileChange}
            className="hidden" // Hide the actual input
            disabled={disabled}
          />
          
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">Drag and drop a CSV file, or</p>
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClickChangeFile}
              disabled={disabled}
            >
              Select File
            </Button>
          </div>
        </div>
      ) : (
        // File info and action buttons when file is selected
        <div className="flex flex-col gap-4 border rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-blue-500 mr-2" />
            <div className="flex-1">
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(2)} KB • Last modified: {new Date(file.lastModified).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClickChangeFile}
              disabled={disabled}
              className="flex-1"
            >
              Change File
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
            accept=".csv" 
            onChange={onFileChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};