"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DownloadIcon, FileIcon } from 'lucide-react';
import { toast } from 'sonner';

// Define the prop types
interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    category: string;
  } | null;
}

// Main component function
export function DocumentPreview({ 
  isOpen, 
  onClose, 
  document 
}: DocumentPreviewProps) {
  // State and effect hooks
  const [fileBlob, setFileBlob] = React.useState<Blob | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Fetch document preview
  React.useEffect(() => {
    const fetchPreview = async () => {
      if (!document || !isOpen) return;

      setIsLoading(true);
      try {
        // Dynamically import the API to avoid circular dependencies
        const { documentsApi } = await import('../../services/api/documents');
        const blob = await documentsApi.previewDocument(document.id);
        setFileBlob(blob);
      } catch (error) {
        console.error('Preview failed:', error);
        toast.error('Failed to load document preview');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [document, isOpen]);

  // Download handler
  const handleDownload = async () => {
    if (!document) return;
  
    try {
      const { documentsApi } = await import('../../services/api/documents');
      
      const blob = await documentsApi.downloadDocument(document.id);
      
      // Ensure blob is valid
      if (!(blob instanceof Blob)) {
        throw new Error('Invalid download response');
      }
  
      // Use modern download method
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download document');
    }
  };

  // Render preview content
  const renderPreviewContent = () => {
    if (isLoading) return <div>Loading...</div>;
    if (!fileBlob) return <div>No preview available</div>;

    // Determine file type
    const fileType = fileBlob.type;

    // Handle different file types
    if (fileType === 'application/pdf') {
      return (
        <iframe 
          src={URL.createObjectURL(fileBlob)} 
          width="100%" 
          height="500px" 
          title="PDF Preview"
        />
      );
    }

    // For other file types, show download option
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <FileIcon className="h-16 w-16 text-gray-400 mb-4" />
        <p>File type not supported for preview</p>
        <p className="text-sm text-gray-600 mb-4">
          Please use the download button to view the document
        </p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileIcon />
            {document?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {renderPreviewContent()}
        </div>

        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleDownload} 
            disabled={!fileBlob}
            className="flex items-center gap-2"
          >
            <DownloadIcon className="h-4 w-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}