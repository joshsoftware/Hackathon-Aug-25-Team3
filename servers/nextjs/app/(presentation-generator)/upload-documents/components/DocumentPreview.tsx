"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileIcon, XIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    category: string;
    url?: string;
    content?: string;
  } | null;
}

export function DocumentPreview({ isOpen, onClose, document }: DocumentPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("preview");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && document) {
      // Simulate loading document content
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        // For a PDF, we might have multiple pages
        if (document.name.endsWith(".pdf")) {
          setTotalPages(Math.floor(Math.random() * 10) + 1);
        } else {
          setTotalPages(1);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, document]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDownload = () => {
    // In a real implementation, this would trigger a download of the document
    alert(`Downloading ${document?.name}`);
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileIcon className="h-5 w-5" />
            <span className="truncate">{document.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="flex-1 flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin text-3xl mb-2">⏳</div>
                  <p>Loading document preview...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 border rounded-md bg-muted/30 overflow-hidden relative">
                  {/* This would be replaced with an actual document viewer */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8 max-w-md">
                      <FileIcon className="h-16 w-16 mx-auto mb-4 text-primary" />
                      <h3 className="text-lg font-semibold mb-2">{document.name}</h3>
                      <p className="text-muted-foreground mb-4">
                        This is a simulated document preview. In a real implementation, 
                        the actual document content would be displayed here.
                      </p>
                      <div className="p-4 bg-card rounded-md border text-left">
                        <p className="font-mono text-sm">
                          {document.content || `Sample content for ${document.name}.\nThis is page ${currentPage} of ${totalPages}.\nCategory: ${document.category}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeftIcon className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="properties" className="flex-1">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <span className="font-medium">Name:</span>
                <span>{document.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <span className="font-medium">Category:</span>
                <span className="capitalize">{document.category}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <span className="font-medium">Type:</span>
                <span>{document.name.split('.').pop()?.toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <span className="font-medium">Pages:</span>
                <span>{totalPages}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <span className="font-medium">Size:</span>
                <span>1.2 MB</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <span className="font-medium">Uploaded:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <XIcon className="h-4 w-4 mr-1" /> Close
          </Button>
          <Button onClick={handleDownload}>
            <DownloadIcon className="h-4 w-4 mr-1" /> Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
