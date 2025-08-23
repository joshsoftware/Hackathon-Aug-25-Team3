"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  File, 
  FileText, 
  FileImage, 
  Download, 
  Trash2, 
  Eye,
  Search,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Wrapper from "@/components/Wrapper";
import DocumentUpload from "./DocumentUpload";

// Mock API functions
const mockDocumentsApi = {
  // Mock function to upload documents
  uploadDocuments: async (files: File[]): Promise<UploadedDocument[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      status: 'uploaded' as const,
      url: URL.createObjectURL(file), // Mock URL for preview
    }));
  },

  // Mock function to get all documents
  getDocuments: async (): Promise<UploadedDocument[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock documents from localStorage or empty array
    const stored = localStorage.getItem('mockDocuments');
    return stored ? JSON.parse(stored) : [];
  },

  // Mock function to delete a document
  deleteDocument: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const stored = localStorage.getItem('mockDocuments');
    if (stored) {
      const documents = JSON.parse(stored);
      const filtered = documents.filter((doc: UploadedDocument) => doc.id !== id);
      localStorage.setItem('mockDocuments', JSON.stringify(filtered));
    }
  },
};

// Types
interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  status: 'uploading' | 'uploaded' | 'error';
  url?: string;
}

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await mockDocumentsApi.getDocuments();
      setDocuments(docs);
    } catch (error) {
      toast.error("Failed to load documents");
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesUploaded = async (uploadedDocs: UploadedDocument[]) => {
    // Update localStorage with new documents
    const allDocs = [...documents, ...uploadedDocs];
    localStorage.setItem('mockDocuments', JSON.stringify(allDocs));
    setDocuments(allDocs);
    
    toast.success(`${uploadedDocs.length} document(s) uploaded successfully`);
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await mockDocumentsApi.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success("Document deleted successfully");
    } catch (error) {
      toast.error("Failed to delete document");
      console.error("Error deleting document:", error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <File className="w-8 h-8 text-red-500" />;
    if (type.includes('text')) return <FileText className="w-8 h-8 text-blue-500" />;
    if (type.includes('image')) return <FileImage className="w-8 h-8 text-green-500" />;
    if (type.includes('presentation') || type.includes('powerpoint')) 
      return <File className="w-8 h-8 text-orange-500" />;
    if (type.includes('word') || type.includes('document')) 
      return <FileText className="w-8 h-8 text-blue-600" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const getFileTypeLabel = (type: string): string => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('text')) return 'TXT';
    if (type.includes('presentation')) return 'PPTX';
    if (type.includes('word')) return 'DOCX';
    if (type.includes('image')) return 'Image';
    return 'File';
  };

  // Filter documents based on search term and type
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type.includes(filterType);
    return matchesSearch && matchesType;
  });

  return (
    <Wrapper className="pb-10">
      {/* Upload Section */}
      <div className="mb-8">
        <DocumentUpload onFilesUploaded={handleFilesUploaded} />
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="text">Text</option>
            <option value="presentation">PowerPoint</option>
            <option value="word">Word</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Your Documents ({filteredDocuments.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {searchTerm || filterType !== 'all' ? 'No documents found' : 'No documents uploaded yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Upload your first document to get started'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getFileIcon(doc.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {doc.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {getFileTypeLabel(doc.type)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(doc.size)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (doc.url) {
                          window.open(doc.url, '_blank');
                        } else {
                          toast.info("Preview not available for this file");
                        }
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Mock download functionality
                        toast.success("Download started");
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default DocumentsPage;
