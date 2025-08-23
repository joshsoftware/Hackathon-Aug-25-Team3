import { api } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export interface PresentationResponse {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  thumbnail: string;
  slides: any[];
}

export const dashboardApi = {
  getPresentations: async (): Promise<PresentationResponse[]> => {
    try {
      const response = await api.get(
        `${API_BASE_URL}/api/v1/ppt/presentation/all`
      );

      // Handle the special case where 404 means "no presentations found"
      if (response.status === 404) {
        console.log("No presentations found");
        return [];
      }

      if (!response.ok) {
        throw new Error("Failed to fetch presentations");
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching presentations:", error);
      throw error;
    }
  },

  getPresentation: async (id: string): Promise<PresentationResponse> => {
    try {
      const response = await api.get(
        `${API_BASE_URL}/api/v1/ppt/presentation?id=${id}`
      );

      if (!response.ok) {
        throw new Error("Presentation not found");
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching presentation:", error);
      throw error;
    }
  },

  deletePresentation: async (
    presentationId: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(
        `${API_BASE_URL}/api/v1/ppt/presentation?id=${presentationId}`
      );

      if (!response.ok) {
        throw new Error("Failed to delete presentation");
      }

      return {
        success: true,
        message: "Presentation deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting presentation:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete presentation",
      };
    }
  },
};
