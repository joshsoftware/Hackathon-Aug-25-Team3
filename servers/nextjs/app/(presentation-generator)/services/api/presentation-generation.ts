import { getHeader } from "./header";
import { IconSearch, ImageGenerate, ImageSearch, PreviousGeneratedImagesResponse } from "./params";
import { ApiResponseHandler } from "./api-error-handler";

export class PresentationGenerationApi {
 
    static async createPresentation({
    prompt,
    n_slides,
    language,
  }: {
    prompt: string;
    n_slides: number | null;
    language: string | null;
  }) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(
        `${baseUrl}/api/v1/ppt/presentation/create`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            prompt,
            n_slides,
            language,
          }),
          cache: "no-cache",
        }
      );
      
      return await ApiResponseHandler.handleResponse(response, "Failed to create presentation");
    } catch (error) {
      console.error("error in presentation creation", error);
      throw error;
    }
  }

  static async editSlide(
    slide_id: string,
    prompt: string
  ) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(
        `${baseUrl}/api/v1/ppt/slide/edit`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            id: slide_id,
            prompt,
          }),
          cache: "no-cache",
        }
      );

      return await ApiResponseHandler.handleResponse(response, "Failed to update slide");
    } catch (error) {
      console.error("error in slide update", error);
      throw error;
    }
  }

  static async updatePresentationContent(body: any) {
    try {
      // Use the correct API endpoint URL with the base URL
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(
        `${baseUrl}/api/v1/ppt/presentation/update`,
        {
          method: "PUT",
          headers: getHeader(),
          body: JSON.stringify(body),
          cache: "no-cache",
        }
      );
      
      return await ApiResponseHandler.handleResponse(response, "Failed to update presentation content");
    } catch (error) {
      console.error("error in presentation content update", error);
      throw error;
    }
  }

  static async presentationPrepare(presentationData: any) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(
        `${baseUrl}/api/v1/ppt/presentation/prepare`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(presentationData),
          cache: "no-cache",
        }
      );
      
      return await ApiResponseHandler.handleResponse(response, "Failed to prepare presentation");
    } catch (error) {
      console.error("error in data generation", error);
      throw error;
    }
  }
  
  // IMAGE AND ICON SEARCH
  
  
  static async generateImage(imageGenerate: ImageGenerate) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(
        `${baseUrl}/api/v1/ppt/images/generate?prompt=${imageGenerate.prompt}`,
        {
          method: "GET",
          headers: getHeader(),
          cache: "no-cache",
        }
      );
      
      return await ApiResponseHandler.handleResponse(response, "Failed to generate image");
    } catch (error) {
      console.error("error in image generation", error);
      throw error;
    }
  }

  static getPreviousGeneratedImages = async (): Promise<PreviousGeneratedImagesResponse[]> => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(
        `${baseUrl}/api/v1/ppt/images/generated`,
        {
          method: "GET",
          headers: getHeader(),
        }
      );
      
      return await ApiResponseHandler.handleResponse(response, "Failed to get previous generated images");
    } catch (error) {
      console.error("error in getting previous generated images", error);
      throw error;
    }
  }
  
  static async searchIcons(iconSearch: IconSearch) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(
        `${baseUrl}/api/v1/ppt/icons/search?query=${iconSearch.query}&limit=${iconSearch.limit}`,
        {
          method: "GET",
          headers: getHeader(),
          cache: "no-cache",
        }
      );
      
      return await ApiResponseHandler.handleResponse(response, "Failed to search icons");
    } catch (error) {
      console.error("error in icon search", error);
      throw error;
    }
  }



  // EXPORT PRESENTATION
  static async exportAsPPTX(presentationData: any) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(
        `${baseUrl}/api/v1/ppt/presentation/export/pptx`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(presentationData),
          cache: "no-cache",
        }
      );
      return await ApiResponseHandler.handleResponse(response, "Failed to export as PowerPoint");
    } catch (error) {
      console.error("error in pptx export", error);
      throw error;
    }
  }
  
  

}
