import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { dashboardApi } from "../services/api/dashboard";

export default function PdfMakerPage() {
  const searchParams = useSearchParams();
  const presentation_id = searchParams.get("presentation_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresentation = async () => {
      if (!presentation_id) {
        setError("No presentation ID provided");
        setLoading(false);
        return;
      }

      try {
        const data = await dashboardApi.getPresentation(presentation_id);
        if (data) {
          // Handle presentation data
          setLoading(false);
        }
      } catch (error) {
        setError("Failed to load presentation");
        console.error("Error fetching presentation:", error);
        setLoading(false);
      }
    };

    fetchPresentation();
  }, [presentation_id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>PDF Maker Page</div>;
}
