from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DocumentUploadRequest(BaseModel):
    file_name: str
    file_type: str
    file_size: int
    organization_id: Optional[int] = None

class DocumentUploadResponse(BaseModel):
    document_id: int
    file_name: str
    file_path: str
    uploaded_at: datetime
    file_type: str
    file_size: int

class DocumentPreviewRequest(BaseModel):
    document_id: int

class DocumentPreviewResponse(BaseModel):
    document_id: int
    file_name: str
    file_type: str
    preview_url: Optional[str] = None
    preview_text: Optional[str] = None

class DocumentDownloadRequest(BaseModel):
    document_id: int
