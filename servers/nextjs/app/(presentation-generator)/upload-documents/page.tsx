"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { isAdmin } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileIcon, UploadIcon, FileTextIcon, Trash2Icon } from "lucide-react";
import { DocumentPreview } from "./components/DocumentPreview";
import { documentsApi, DocumentUploadResponse } from "../services/api/documents";

export default function UploadDocumentsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("sales");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    Array<{
      id: string;
      name: string;
      category: string;
      uploadDate: Date;
    }>
  >([]);
  const [activeTab, setActiveTab] = useState("upload");
  const [previewDocument, setPreviewDocument] = useState<{
    id: string;
    name: string;
    category: string;
  } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (!isAdmin()) {
      toast.error("You don't have permission to access this page");
      router.push("/dashboard");
    } else {
      // Load uploaded documents
      loadUploadedDocuments();
    }
  }, [router]);

  const loadUploadedDocuments = async () => {
    try {
      const documents = await documentsApi.getUploadedDocuments();
      setUploadedDocuments(
        documents.map((doc: DocumentUploadResponse) => ({
          id: doc.document_id,
          name: doc.file_name,
          category: selectedCategory, // Note: Backend should return category
          uploadDate: new Date(doc.uploaded_at),
        }))
      );
    } catch (error) {
      // Error handling is done in the API service
      // The service will use mock data if network fails
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsLoading(true);

    try {
      const uploadedDoc = await documentsApi.uploadDocument(
        selectedFile, 
        selectedCategory
      );

      // Add the uploaded document to the list
      const newDocument = {
        id: uploadedDoc.document_id,
        name: uploadedDoc.file_name,
        category: selectedCategory,
        uploadDate: new Date(uploadedDoc.uploaded_at),
      };

      setUploadedDocuments((prev) => [newDocument, ...prev]);
      setSelectedFile(null);

      // Reset the file input
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

      setActiveTab("documents");
    } catch (error) {
      // Error handling is done in the API service
      // The service will use mock data if network fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await documentsApi.deleteDocument(id);
      
      setUploadedDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (error) {
      // Error handling is done in the API service
      // The service will handle deletion errors
    }
  };

  const handlePreviewDocument = async (id: string) => {
    try {
      const previewResult = await documentsApi.previewDocument(id);
      
      const document = uploadedDocuments.find((doc) => doc.id === id);
      if (document) {
        setPreviewDocument({
          id: document.id,
          name: document.name,
          category: document.category,
        });
        setIsPreviewOpen(true);
      }
    } catch (error) {
      // Error handling is done in the API service
      // The service will handle preview errors
    }
  };

  return (
    <div className="container mx-auto py-8 flex flex-col items-center justify-center max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Document Management
      </h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mx-auto"
      >
        <TabsList className="mb-6 flex justify-evenly">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="documents">Uploaded Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-center">Upload New Document</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Document Category</Label>
                  <RadioGroup
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    className="flex flex-row"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sales" id="sales" />
                      <Label htmlFor="sales">Sales</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="marketing" id="marketing" />
                      <Label htmlFor="marketing">Marketing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="technical" id="technical" />
                      <Label htmlFor="technical">Technical</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="finance" id="finance" />
                      <Label htmlFor="finance">Finance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hr" id="hr" />
                      <Label htmlFor="hr">HR</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="legal" id="legal" />
                      <Label htmlFor="legal">Legal</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-upload">Select Document</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                      className="flex-1"
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected file: {selectedFile.name} (
                      {Math.round(selectedFile.size / 1024)} KB)
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !selectedFile}
                  className="w-full"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UploadIcon className="h-4 w-4" /> Upload Document
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-center">Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {uploadedDocuments.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No documents have been uploaded yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {uploadedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileIcon className="h-6 w-6 text-primary" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="capitalize">{doc.category}</span>
                            <span>•</span>
                            <span>{doc.uploadDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewDocument(doc.id)}
                        >
                          <FileTextIcon className="h-4 w-4 mr-1" /> Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DocumentPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={previewDocument}
      />
    </div>
  );
}
