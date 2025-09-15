import { getHeader, getHeaderForFormData } from "./header";
import { IconSearch, ImageGenerate, ImageSearch, PreviousGeneratedImagesResponse } from "./params";
import { ApiResponseHandler } from "./api-error-handler";

export class PresentationGenerationApi {
  static async uploadDoc(documents: File[]) {
    const formData = new FormData();

    documents.forEach((document) => {
      formData.append("files", document);
    });

    try {
      const response = await fetch(
        `/api/v1/ppt/files/upload`,
        {
          method: "POST",
          headers: getHeaderForFormData(),
          body: formData,
          cache: "no-cache",
        }
      );

      return await ApiResponseHandler.handleResponse(response, "Failed to upload documents");
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }

  static async uploadDocuments(formData: FormData) {
    try {
      const response = await fetch(
        `/api/v1/ppt/documents/upload`,
        {
          method: "POST",
          headers: getHeaderForFormData(),
          body: formData,
          cache: "no-cache",
        }
      );
      return await ApiResponseHandler.handleResponse(response, "Failed to upload documents to knowledge base");
    } catch (error) {
      console.error("Upload documents to knowledge base error:", error);
      throw error;
    }
  }

  static async listDocuments(): Promise<string[]> {
    try {
      const response = await fetch(
        `/api/v1/ppt/documents`,
        {
          method: "GET",
          headers: getHeader(),
          cache: "no-cache",
        }
      );
      return await ApiResponseHandler.handleResponse(response, "Failed to list documents");
    } catch (error) {
      console.error("List documents error:", error);
      throw error;
    }
  }

  static async decomposeDocuments(documentKeys: string[]) {
    try {
      const response = await fetch(
        `/api/v1/ppt/files/decompose`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            file_paths: documentKeys,
          }),
          cache: "no-cache",
        }
      );
      
      return await ApiResponseHandler.handleResponse(response, "Failed to decompose documents");
    } catch (error) {
      console.error("Error in Decompose Files", error);
      throw error;
    }
  }
 
    static async createPresentation({
    prompt,
    n_slides,
    file_paths,
    language,
    source_document_id,
  }: {
    prompt: string;
    n_slides: number | null;
    file_paths?: string[];
    language: string | null;
    source_document_id?: string | null;
  }) {
    try {
      const response = await fetch(
        `/api/v1/ppt/presentation/generate`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            prompt,
            n_slides,
            file_paths,
            language,
            source_document_id,
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
      const response = await fetch(
        `/api/v1/ppt/slide/edit`,
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
      const response = await fetch(
        `/api/v1/ppt/presentation/update`,
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
      const response = await fetch(
        `/api/v1/ppt/presentation/prepare`,
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
      const response = await fetch(
        `/api/v1/ppt/images/generate?prompt=${imageGenerate.prompt}`,
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
      const response = await fetch(
        `/api/v1/ppt/images/generated`,
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
      const response = await fetch(
        `/api/v1/ppt/icons/search?query=${iconSearch.query}&limit=${iconSearch.limit}`,
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
      const response = await fetch(
        `/api/v1/ppt/presentation/export/pptx`,
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