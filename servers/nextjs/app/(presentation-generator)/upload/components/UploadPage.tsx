/**
 * UploadPage Component
 * 
 * This component handles the presentation generation upload process, allowing users to:
 * - Configure presentation settings (slides, language)
 * - Input prompts
 * - Upload supporting documents with tags
 * 
 * @component
 */

"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearOutlines, setPresentationId } from "@/store/slices/presentationGeneration";
import { ConfigurationSelects } from "./ConfigurationSelects";
import { PromptInput } from "./PromptInput";
import { LanguageType, PresentationConfig } from "../type";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import Wrapper from "@/components/Wrapper";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Types for loading state
interface LoadingState {
  isLoading: boolean;
  message: string;
  duration?: number;
  showProgress?: boolean;
  extra_info?: string;
}

const PREDEFINED_TAGS = ['sales', 'marketing', 'technical', 'finance', 'hr', 'legal'];

const UploadPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  // State management
  const [config, setConfig] = useState<PresentationConfig>({
    slides: "8",
    language: LanguageType.English,
    prompt: "",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConfigChange = (key: keyof PresentationConfig, value: string | LanguageType | null) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      [key]: value,
    }));
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: "",
    duration: 4,
    showProgress: false,
    extra_info: "",
  });

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    if (selectedTags.length === 0) {
      toast.error("Please select at least one tag before uploading.");
      return;
    }

    setIsUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('tags', selectedTags.join(','));
      for (let i = 0; i < uploadedFiles.length; i++) {
        formData.append('files', uploadedFiles[i]);
      }
      await PresentationGenerationApi.uploadDocuments(formData);
      toast.success("Documents uploaded and processed!");
    } catch (error) {
      toast.error("Failed to upload documents.");
      console.error("Error uploading documents:", error);
    } finally {
      setIsUploadingDoc(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear the file input
      }
    }
  };

  const handleGeneratePresentation = async () => {
    if (!validateConfiguration()) return;

    setLoadingState({
      isLoading: true,
      message: "Generating outlines...",
      showProgress: true,
      duration: 30,
    });

    try {
      const createResponse = await PresentationGenerationApi.createPresentation({
        prompt: config?.prompt ?? "",
        n_slides: config?.slides ? parseInt(config.slides) : null,
        language: config?.language ?? "",
      });

      console.log("Created presentation with ID:", createResponse);

      dispatch(setPresentationId(createResponse.presentation_id));
      dispatch(clearOutlines());
      trackEvent(MixpanelEvent.Navigation, { from: pathname, to: "/outline" });
      router.push("/outline");
    } catch (error) {
      console.error("Error in upload page", error);
      setLoadingState({
        isLoading: false,
        message: "",
        duration: 0,
        showProgress: false,
      });
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Error in upload page.",
      });
    }
  };

  const validateConfiguration = () => {
    if (!config.prompt || config.prompt.trim() === "") {
      toast.error("Please enter a prompt for your presentation.");
      return false;
    }
    return true;
  };

  return (
    <Wrapper className="pb-10 lg:max-w-[70%] xl:max-w-[65%]">
      <OverlayLoader
        show={loadingState.isLoading}
        text={loadingState.message}
        showProgress={loadingState.showProgress}
        duration={loadingState.duration}
        extra_info={loadingState.extra_info}
      />
      <div className="flex flex-col gap-4 md:items-center md:flex-row justify-between py-4">
        <p></p>
        <ConfigurationSelects
          config={config}
          onConfigChange={handleConfigChange}
        />
      </div>

      <div className="relative">
        <PromptInput
          value={config.prompt}
          onChange={(value) => handleConfigChange("prompt", value)}
          data-testid="prompt-input"
        />
      </div>

      {/* Document Upload Section */}
      <div className="mt-4 p-4 border rounded-lg shadow-sm bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">1. Select Tags</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          {PREDEFINED_TAGS.map((tag) => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox
                id={tag}
                checked={selectedTags.includes(tag)}
                onCheckedChange={() => handleTagChange(tag)}
              />
              <Label htmlFor={tag} className="capitalize cursor-pointer">{tag}</Label>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-semibold mb-3">2. Upload Documents to Knowledge Base</h3>
        <p className="text-sm text-gray-500 mb-3">The documents uploaded will be associated with the tags you selected above.</p>
        <div className="flex items-center space-x-2">
          <Input type="file" multiple onChange={handleDocumentUpload} ref={fileInputRef} disabled={isUploadingDoc} />
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploadingDoc}>
            {isUploadingDoc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}Upload
          </Button>
        </div>
        {isUploadingDoc && <p className="text-sm text-gray-600 mt-2">Uploading and processing...</p>}
      </div>

      <Button
        onClick={handleGeneratePresentation}
        className="w-full rounded-[32px] flex items-center justify-center py-6 bg-[#5141e5] text-white font-instrument_sans font-semibold text-xl hover:bg-[#5141e5]/80 transition-colors duration-300 mt-6"
        data-testid="next-button"
      >
        <span>Generate Presentation</span>
        <ChevronRight className="!w-6 !h-6" />
      </Button>
    </Wrapper>
  );
};

export default UploadPage;
