import axios from 'axios';
import { toast } from 'sonner';

// Dynamically set API base URL based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export interface DocumentUploadResponse {
  document_id: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  file_type: string;
  file_size: number;
}

export interface DocumentCategory {
  sales: boolean;
  marketing: boolean;
  technical: boolean;
  finance: boolean;
  hr: boolean;
  legal: boolean;
}

// Fallback mock data for development
const MOCK_DOCUMENTS: DocumentUploadResponse[] = [
  {
    document_id: '1',
    file_name: 'Sales Report Q1 2025.pdf',
    file_path: '/mock/sales-report.pdf',
    uploaded_at: new Date().toISOString(),
    file_type: 'application/pdf',
    file_size: 1024 * 100 // 100KB
  },
  {
    document_id: '2',
    file_name: 'Marketing Strategy 2025.docx',
    file_path: '/mock/marketing-strategy.docx',
    uploaded_at: new Date().toISOString(),
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    file_size: 1024 * 200 // 200KB
  }
];

// Create an axios instance with custom configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

export const documentsApi = {
  /**
   * Upload a document with category
   * @param file File to upload
   * @param category Document category
   * @returns Promise with upload details
   */
  uploadDocument: async (
    file: File, 
    category: string
  ): Promise<DocumentUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const response = await apiClient.post<DocumentUploadResponse>(
        '/documents/upload', 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Document uploaded successfully', {
        description: `File: ${response.data.file_name}`,
      });

      return response.data;
    } catch (error) {
      console.error('Document upload failed:', error);
      
      // Fallback to mock data for development
      const mockUpload: DocumentUploadResponse = {
        document_id: Date.now().toString(),
        file_name: file.name,
        file_path: `/mock/${file.name}`,
        uploaded_at: new Date().toISOString(),
        file_type: file.type,
        file_size: file.size
      };

      if (axios.isAxiosError(error)) {
        toast.warning('Upload failed. Using mock data', {
          description: error.message,
        });
      } else {
        toast.warning('Upload failed. Using mock data');
      }

      return mockUpload;
    }
  },

  /**
   * Get list of uploaded documents
   * @returns Promise with list of documents
   */
  getUploadedDocuments: async () => {
    try {
      const response = await apiClient.get<DocumentUploadResponse[]>('/documents');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      
      // Fallback to mock data for development
      if (axios.isAxiosError(error)) {
        toast.warning('Failed to load documents. Using mock data', {
          description: error.message,
        });
      } else {
        toast.warning('Failed to load documents. Using mock data');
      }

      return MOCK_DOCUMENTS;
    }
  },

  /**
   * Delete a document
   * @param documentId ID of the document to delete
   * @returns Promise resolving when document is deleted
   */
  deleteDocument: async (documentId: string) => {
    try {
      await apiClient.delete(`/documents/${documentId}`);
      
      toast.success('Document deleted successfully');
      return true;
    } catch (error) {
      console.error('Document deletion failed:', error);
      
      if (axios.isAxiosError(error)) {
        toast.warning('Deletion failed. Document removed from local list', {
          description: error.message,
        });
      } else {
        toast.warning('Deletion failed. Document removed from local list');
      }

      return true;
    }
  },

  /**
   * Preview a document
   * @param documentId ID of the document to preview
   * @returns Promise with preview details
   */
  previewDocument: async (documentId: string) => {
    try {
      const response = await apiClient.get(`/documents/${documentId}/preview`);
      return response.data;
    } catch (error) {
      console.error('Document preview failed:', error);
      
      if (axios.isAxiosError(error)) {
        toast.warning('Preview failed', {
          description: error.message,
        });
      } else {
        toast.warning('Preview failed');
      }

      // Return a basic preview object
      return {
        document_id: documentId,
        preview_text: 'Preview not available',
        preview_url: null
      };
    }
  }
};
