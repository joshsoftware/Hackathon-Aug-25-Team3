import os
from typing import List, Dict, Any
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from fastapi.responses import FileResponse

from services.document_service import DocumentService
from dependencies.auth import get_current_user
from models.document_upload import (
    DocumentUploadRequest, 
    DocumentUploadResponse, 
    DocumentPreviewRequest, 
    DocumentPreviewResponse,
    DocumentDownloadRequest
)

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...), 
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a document
    
    Args:
        file (UploadFile): The file to upload
        current_user (dict): Authenticated user details
    
    Returns:
        DocumentUploadResponse: Details of the uploaded document
    """
    try:
        upload_result = DocumentService.upload_document(file, current_user['id'])
        return upload_result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/preview", response_model=DocumentPreviewResponse)
async def preview_document(
    request: DocumentPreviewRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a preview for a document
    
    Args:
        request (DocumentPreviewRequest): Document preview request
        current_user (dict): Authenticated user details
    
    Returns:
        DocumentPreviewResponse: Document preview information
    """
    try:
        preview_result = DocumentService.preview_document(
            request.document_id, 
            current_user['id']
        )
        return preview_result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")

@router.post("/download")
async def download_document(
    request: DocumentDownloadRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Download a document
    
    Args:
        request (DocumentDownloadRequest): Document download request
        current_user (dict): Authenticated user details
    
    Returns:
        FileResponse: The file to be downloaded
    """
    try:
        return DocumentService.download_document(
            request.document_id, 
            current_user['id']
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

@router.get("/", response_model=List[Dict[str, Any]])
async def list_documents(
    current_user: dict = Depends(get_current_user)
):
    """
    List all documents for the current user
    
    Args:
        current_user (dict): Authenticated user details
    
    Returns:
        List[Dict[str, Any]]: List of documents
    """
    try:
        documents = DocumentService.list_documents(current_user['id'])
        return documents
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list documents: {str(e)}")
