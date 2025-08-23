import React from "react";
import DocumentsPage from "./components/DocumentsPage";
import Header from "@/app/(presentation-generator)/dashboard/components/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PresentAI | Documents",
  description: "Manage and upload your documents for presentation generation",
  alternates: {
    canonical: "https://PresentAI.ai/documents",
  },
  keywords: [
    "document management",
    "file upload",
    "presentation documents",
    "document storage",
    "file manager",
  ],
  openGraph: {
    title: "Documents | PresentAI",
    description: "Manage and upload your documents for presentation generation",
    type: "website",
    url: "https://PresentAI.ai/documents",
    siteName: "PresentAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Documents | PresentAI",
    description: "Manage and upload your documents for presentation generation",
    site: "@PresentAI_ai",
    creator: "@PresentAI_ai",
  },
};

const DocumentsPageWrapper = () => {
  return (
    <div className="relative">
      <Header />
      <div className="flex flex-col items-center justify-center py-8">
        <h1 className="text-3xl font-semibold font-instrument_sans">
          Documents
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Upload and manage your documents
        </p>
      </div>
      <DocumentsPage />
    </div>
  );
};

export default DocumentsPageWrapper;
