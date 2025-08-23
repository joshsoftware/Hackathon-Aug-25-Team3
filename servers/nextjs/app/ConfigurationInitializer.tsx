"use client";

import { useEffect, useState } from "react";
import { setCanChangeKeys, setLLMConfig } from "@/store/slices/userConfig";
import { hasValidLLMConfig } from "@/utils/storeHelpers";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { checkIfSelectedOllamaModelIsPulled } from "@/utils/providerUtils";
import { LLMConfig } from "@/types/llm_config";

export function ConfigurationInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const route = usePathname();

  // Fetch user config state
  useEffect(() => {
    fetchUserConfigState();
  }, []);

  const setLoadingToFalseAfterNavigatingTo = (pathname: string) => {
    const interval = setInterval(() => {
      if (window.location.pathname === pathname) {
        clearInterval(interval);
        setIsLoading(false);
      }
    }, 500);
  };

  const fetchUserConfigState = async () => {
    setIsLoading(true);
    const response = await fetch("/api/can-change-keys");
    const canChangeKeys = (await response.json()).canChange;
    dispatch(setCanChangeKeys(canChangeKeys));

    if (canChangeKeys) {
      const response = await fetch("/api/user-config");
      const llmConfig = await response.json();
      if (!llmConfig.LLM) {
        llmConfig.LLM = "openai";
      }
      dispatch(setLLMConfig(llmConfig));
      const isValid = hasValidLLMConfig(llmConfig);
      if (isValid) {
        // Check if the selected Ollama model is pulled
        if (llmConfig.LLM === "ollama") {
          const isPulled = await checkIfSelectedOllamaModelIsPulled(
            llmConfig.OLLAMA_MODEL
          );
          if (!isPulled) {
            router.push("/");
            setLoadingToFalseAfterNavigatingTo("/");
            return;
          }
        }
        if (llmConfig.LLM === "custom") {
          const isAvailable = await checkIfSelectedCustomModelIsAvailable(
            llmConfig
          );
          if (!isAvailable) {
            router.push("/");
            setLoadingToFalseAfterNavigatingTo("/");
            return;
          }
        }
        if (route === "/") {
          router.push("/upload");
          setLoadingToFalseAfterNavigatingTo("/upload");
        } else {
          setIsLoading(false);
        }
      } else if (route !== "/") {
        router.push("/");
        setLoadingToFalseAfterNavigatingTo("/");
      } else {
        setIsLoading(false);
      }
    } else {
      if (route === "/") {
        router.push("/upload");
        setLoadingToFalseAfterNavigatingTo("/upload");
      } else {
        setIsLoading(false);
      }
    }
  };

  const checkIfSelectedCustomModelIsAvailable = async (
    llmConfig: LLMConfig
  ) => {
    try {
      const response = await fetch("/api/v1/ppt/openai/models/available", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: llmConfig.CUSTOM_LLM_URL,
          api_key: llmConfig.CUSTOM_LLM_API_KEY,
        }),
      });
      const data = await response.json();
      return data.includes(llmConfig.CUSTOM_MODEL);
    } catch (error) {
      console.error("Error fetching custom models:", error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E9E8F8] via-[#F5F4FF] to-[#E0DFF7] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            {/* Logo/Branding */}
            <div className="mb-6">
               <div className="h-12 flex items-center justify-center mb-4 opacity-90 text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent select-none">
                PresentAi
              </div>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
            </div>

            {/* Loading Animation */}
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute w-full h-full border-4 border-t-blue-500 border-r-purple-500 border-b-blue-500 border-l-purple-500 rounded-full animate-spin"></div>
              <div className="absolute w-full h-full border-4 border-blue-200 rounded-full opacity-20"></div>
            </div>

            {/* Loading Text */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Initializing Application
              </h3>
              <p className="text-sm text-gray-600 font-inter animate-pulse">
                Loading configuration and checking model availability...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
