import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { setPresentationData } from "@/store/slices/presentationGeneration";
import { dashboardApi } from "../../services/api/dashboard";

export const usePresentationData = (
  presentationId: string,
  setLoading: (loading: boolean) => void,
  setError: (error: boolean) => void
) => {
  const dispatch = useDispatch();

  const fetchUserSlides = useCallback(async () => {
    try {
      const data = await dashboardApi.getPresentation(presentationId);
      if (data) {
        dispatch(
          setPresentationData({
            ...data,
            language: "en",
            layout: {
              name: "default",
              ordered: true,
              slides: data.slides || [],
            },
            n_slides: data.slides?.length || 0,
          })
        );
        setLoading(false);
      }
    } catch (error) {
      setError(true);
      toast.error("Failed to load presentation");
      console.error("Error fetching user slides:", error);
      setLoading(false);
    }
  }, [presentationId, dispatch, setLoading, setError]);

  return {
    fetchUserSlides,
  };
};
