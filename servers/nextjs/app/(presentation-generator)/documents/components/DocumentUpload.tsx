"use client";

import React, { useRef, useState } from "react";
import { File, X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FileWithId extends File {
  id: string;
}

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  status: 'uploading' | 'uploaded' | 'error';
  url?: string;
}

interface DocumentUploadProps {
  onFilesUploaded: (documents: UploadedDocument[]) => void;
}

const DocumentUpload = ({ onFilesUploaded }: DocumentUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert Files to FileWithId with proper type checking
  const filesWithIds: FileWithId[] = files.map(file => {
    const fileWithId = file as FileWithId;
    fileWithId.id = `${file.name || 'unnamed'}-${file.lastModified || Date.now()}-${file.size || 0}`;
    return fileWithId;
  });

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isDragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isDragging);
  };

  const validateFiles = (filesToValidate: File[]): File[] => {
    const validTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const invalidFiles = filesToValidate.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error('Invalid file type', {
        description: 'Please upload only PDF, TXT, PPTX, or DOCX files',
      });
      return [];
    }

    const hasPdf = files.some(file => file.type === 'application/pdf');
    if (hasPdf && filesToValidate.some(file => file.type === 'application/pdf')) {
      toast.error('Multiple PDF files are not allowed', {
        description: 'Please select only one PDF file',
      });
      return [];
    }

    return filesToValidate.filter(file => {
      return !(hasPdf && file.type === 'application/pdf');
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);

      toast.success('Files selected', {
        description: `${validFiles.length} file(s) have been added`,
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = validateFiles(selectedFiles);

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);

      toast.success('Files selected', {
        description: `${validFiles.length} file(s) have been added`,
      });
    }

    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(file => {
      const currentFileId = `${file.name || 'unnamed'}-${file.lastModified || Date.now()}-${file.size || 0}`;
      return currentFileId !== fileId;
    });
    setFiles(updatedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('No files selected', {
        description: 'Please select files to upload',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Mock API call - simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create mock uploaded documents
      const uploadedDocs: UploadedDocument[] = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        status: 'uploaded' as const,
        url: URL.createObjectURL(file), // Mock URL for preview
      }));

      // Call the parent callback
      onFilesUploaded(uploadedDocs);

      // Clear the files after successful upload
      setFiles([]);

      toast.success('Upload successful', {
        description: `${uploadedDocs.length} document(s) uploaded successfully`,
      });
    } catch (error) {
      toast.error('Upload failed', {
        description: 'There was an error uploading your files. Please try again.',
      });
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Documents</h2>
        
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={cn(
            "w-full border-2 border-dashed border-gray-400 rounded-lg",
            "transition-all duration-300 ease-in-out bg-white cursor-pointer",
            "min-h-[200px] flex flex-col",
            isDragging && "border-purple-400 bg-purple-50",
            isUploading && "cursor-not-allowed opacity-50"
          )}
          onDragOver={(e) => !isUploading && handleDragEvents(e, true)}
          onDragLeave={(e) => !isUploading && handleDragEvents(e, false)}
          onDrop={(e) => !isUploading && handleDrop(e)}
        >
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            {isUploading ? (
              <Loader2 className="w-12 h-12 text-purple-400 mb-4 animate-spin" />
            ) : (
              <Upload className={cn(
                "w-12 h-12 text-gray-400 mb-4",
                isDragging && "text-purple-400"
              )} />
            )}

            <p className="text-gray-600 text-center mb-2">
              {isUploading
                ? 'Uploading files...'
                : isDragging
                ? 'Drop your files here'
                : 'Drag and drop your files here or click to browse'
              }
            </p>
            <p className="text-gray-400 text-sm text-center mb-4">
              Supports PDFs, Text files, PPTX, DOCX
            </p>

            <input
              type="file"
              accept=".pdf,.txt,.pptx,.docx"
              onChange={handleFileInput}
              className="hidden"
              id="document-upload"
              ref={fileInputRef}
              multiple
              disabled={isUploading}
            />

            {!isUploading && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                variant="outline"
                className="mb-4"
              >
                Choose Files
              </Button>
            )}
          </div>

          {files.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Selected Files ({files.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {filesWithIds.map((file) => (
                    <div key={file.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden
                        hover:border-purple-200 group relative"
                    >
                      <div className="p-4 bg-purple-50 group-hover:bg-purple-100 
                        transition-colors flex items-center justify-center relative"
                      >
                        <File className="w-8 h-8 text-purple-600" />

                        {!isUploading && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(file.id);
                            }}
                            className="absolute top-1 right-2 p-1.5
                              bg-white/80 backdrop-blur-sm rounded-full
                              text-gray-500 hover:text-red-500 
                              shadow-sm hover:shadow-md
                              transition-all duration-200"
                            aria-label="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="p-3 relative">
                        <p className="text-sm font-medium text-gray-700 truncate mb-1 pr-2">
                          {file.name || 'Unnamed File'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={isUploading || files.length === 0}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload {files.length} File{files.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
