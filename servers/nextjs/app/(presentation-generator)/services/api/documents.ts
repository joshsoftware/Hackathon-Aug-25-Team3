import axios from 'axios';

const DOCUMENT_API_BASE_URL = '/api/v1/documents';

export interface DocumentUploadResponse {
  id: string;
  filename: string;
  size: number;
  upload_date: string;
  content_type: string;
}

export const documentsApi = {
  async getUploadedDocuments(): Promise<DocumentUploadResponse[]> {
    try   {
      const response = await axios.get(`${DOCUMENT_API_BASE_URL}/list`);
      return response.data.map((doc: DocumentUploadResponse) => ({
        id: doc.id,
        filename: doc.filename,
        upload_date: doc.upload_date,
        size: doc.size,
        content_type: doc.content_type
      }));
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      return [];
    }
  },

  async uploadDocument(file: File, category: string): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${DOCUMENT_API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return {
        id: response.data.id,
        filename: response.data.filename,
        upload_date: response.data.upload_date,
        size: response.data.size,
        content_type: response.data.content_type
      };
    } catch (error) {
      console.error('Document upload failed:', error);
      throw error;
    }
  },

  async deleteDocument(documentId: string): Promise<void> {
    try {
      await axios.delete(`${DOCUMENT_API_BASE_URL}/${documentId}`);
    } catch (error) {
      console.error('Document deletion failed:', error);
      throw error;
    }
  },

  async previewDocument(documentId: string): Promise<Blob> {
    try {
      const response = await axios.get(`${DOCUMENT_API_BASE_URL}/preview/${documentId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Document preview failed:', error);
      throw error;
    }
  },

  async downloadDocument(documentId: string): Promise<Blob> {
    try {
      const response = await axios.get(`${DOCUMENT_API_BASE_URL}/download/${documentId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Document download failed:', error);
      throw error;
    }
  }
};