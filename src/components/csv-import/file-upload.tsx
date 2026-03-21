import React, { useRef, useState } from 'react'
import {
    AlertCircle,
    CheckCircle2,
    FileText,
    FileUp,
    Upload,
    X,
} from 'lucide-react'
import Papa from 'papaparse'
import type { ChangeEvent } from 'react'
import type { ParseResult } from 'papaparse'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
    onClearFile: () => void
    onParsedData?: (results: ParseResult<Record<string, string>>) => void
    file: File | null
    allowedExtensions?: Array<string>
    maxSizeInMB?: number
}

// --- UTILITY FUNCTIONS ---

// Function to format file size in human-readable format
const formatFileSize = (sizeInBytes: number) => {
    const units = ['B', 'KB', 'MB']
    let size = sizeInBytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
}

// Function to validate file type and size
const validateFile = (
    file: File | null,
    allowedExtensions: Array<string>,
    maxSizeInMB: number,
) => {
    if (!file) return { isValid: true, errors: [] }

    const errors: Array<string> = []
    const isValidType = allowedExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext.toLowerCase()),
    )
    const isValidSize = file.size <= maxSizeInMB * 1024 * 1024

    if (!isValidType) {
        errors.push(
            `Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`,
        )
    }
    if (!isValidSize) {
        errors.push(`File exceeds maximum size of ${maxSizeInMB}MB.`)
    }

    return {
        isValid: isValidType && isValidSize,
        errors,
    }
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onFileChange,
    onClearFile,
    onParsedData,
    file,
    allowedExtensions = ['.csv'],
    maxSizeInMB = 10,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { isValid, errors } = validateFile(
        file,
        allowedExtensions,
        maxSizeInMB,
    )
    const [parsingStatus, setParsingStatus] = useState<
        'idle' | 'parsing' | 'success' | 'error'
    >('idle')
    const [parseError, setParseError] = useState<string | null>(null)

    const handleClickChangeFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    // Function to handle file input change and parse the file
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]

        // Call the original onFileChange callback
        onFileChange(e)

        // Parse the file if it exists and onParsedData is provided
        if (selectedFile && onParsedData) {
            setParsingStatus('parsing')
            setParseError(null)

            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setParsingStatus('success')
                    onParsedData(results as ParseResult<Record<string, string>>)
                },
                error: (error) => {
                    setParsingStatus('error')
                    setParseError(error.message)
                    console.error('Error parsing CSV:', error)
                },
            })
        }
    }

    return (
        <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium">Upload CSV File</h3>
                <div className="flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                    <FileUp className="mr-1 h-3 w-3" /> CSV Import
                </div>
            </div>

            {!file ? (
                // File selection UI when no file is selected
                <div
                    className={cn(
                        'cursor-pointer rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/30 p-6 text-center transition-colors hover:bg-blue-50/50',
                    )}
                    onClick={handleClickChangeFile}
                    onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        e.currentTarget.classList.add('bg-blue-100')
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        e.currentTarget.classList.remove('bg-blue-100')
                    }}
                    onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        e.currentTarget.classList.remove('bg-blue-100')

                        // TODO: Recheck this drag-and-drop file handling. Doesn't look right. Why the unknown casting?
                        const droppedFile = e.dataTransfer.files[0]
                        if (droppedFile) {
                            // Manually trigger file parsing
                            const fakeEvent = {
                                target: { files: [droppedFile] },
                            } as unknown as ChangeEvent<HTMLInputElement>
                            handleInputChange(fakeEvent)
                        }
                    }}
                >
                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept={allowedExtensions.join(',')}
                        onChange={handleInputChange}
                        className="hidden"
                    />

                    <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-blue-100 p-3">
                            <Upload className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                Drag and drop your file, or click to browse
                            </p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Supported formats:{' '}
                                {allowedExtensions.join(', ')} (max{' '}
                                {maxSizeInMB}MB)
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleClickChangeFile()
                            }}
                            className="mt-2"
                        >
                            Select File
                        </Button>
                    </div>
                </div>
            ) : (
                // File info and action buttons when file is selected
                <div className="flex flex-col gap-3 overflow-hidden rounded-lg">
                    {/* Success or error message based on file validity */}
                    {isValid ? (
                        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2">
                            <div className="flex items-center text-green-800">
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                <span>
                                    File{' '}
                                    <span className="rounded bg-green-100 px-1 font-mono text-xs">
                                        {file.name}
                                    </span>{' '}
                                    is ready to be processed
                                </span>
                            </div>
                            {parsingStatus === 'parsing' && (
                                <p className="mt-1 text-xs text-green-700">
                                    Parsing CSV data...
                                </p>
                            )}
                            {parsingStatus === 'success' && (
                                <p className="mt-1 text-xs text-green-700">
                                    CSV data parsed successfully!
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                            <div className="flex items-center text-red-800">
                                <AlertCircle className="mr-2 h-4 w-4 text-red-600" />
                                <span>{errors.join(' ')}</span>
                            </div>
                        </div>
                    )}

                    {/* Show parsing error if it exists */}
                    {parseError && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                            <div className="flex items-center text-red-800">
                                <AlertCircle className="mr-2 h-4 w-4 text-red-600" />
                                <span>Error parsing CSV: {parseError}</span>
                            </div>
                        </div>
                    )}

                    {/* File details card */}
                    <div className="bg-card rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex min-w-0 items-start">
                                <div className="mr-3 rounded-md bg-blue-100 p-2">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {file.name}
                                    </p>
                                    <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-4 text-xs">
                                        <span>{formatFileSize(file.size)}</span>
                                        <span>
                                            Last modified:{' '}
                                            {new Date(
                                                file.lastModified,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onClearFile}
                                className="flex shrink-0 items-center gap-1"
                            >
                                <X className="h-4 w-4" /> Clear
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
