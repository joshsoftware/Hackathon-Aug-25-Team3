import { api } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export interface PresentationRequest {
  title: string;
  description: string;
  template_id?: string;
  // Add other fields as needed
}

export interface Presentation {
  id: string;
  title: string;
  description: string;
  template_id?: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const pptApi = {
  getAllPresentations: async (): Promise<Presentation[]> => {
    const response = await api.get(
      `${API_BASE_URL}/api/v1/ppt/presentation/all`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch presentations");
    }

    return response.json();
  },

  createPresentation: async (
    data: PresentationRequest
  ): Promise<Presentation> => {
    const response = await api.post(
      `${API_BASE_URL}/api/v1/ppt/presentation/generate`,
      data
    );

    if (!response.ok) {
      throw new Error("Failed to create presentation");
    }

    return response.json();
  },

  getPresentation: async (id: string): Promise<Presentation> => {
    const response = await api.get(
      `${API_BASE_URL}/api/v1/ppt/presentation?id=${id}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch presentation");
    }

    return response.json();
  },

  deletePresentation: async (id: string): Promise<void> => {
    const response = await api.delete(
      `${API_BASE_URL}/api/v1/ppt/presentation?id=${id}`
    );

    if (!response.ok) {
      throw new Error("Failed to delete presentation");
    }
  },
};
