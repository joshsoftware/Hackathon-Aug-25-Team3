import os
import uuid
from typing import Optional, Dict, Any
from datetime import datetime

from fastapi import UploadFile, HTTPException, File
from fastapi.responses import FileResponse

class DocumentService:
    UPLOAD_DIR = "uploads"

    @classmethod
    def upload_document(
        cls, 
        file: UploadFile, 
        user_id: int
    ) -> Dict[str, Any]:
        """
        Upload a document and store it securely
        
        Args:
            file (UploadFile): The file to upload
            user_id (int): ID of the user uploading the document
        
        Returns:
            dict: Details of the uploaded document
        """
        # Validate file size (e.g., max 50MB)
        MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
        file_size = file.file.seek(0, os.SEEK_END)
        file.file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds maximum limit")
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Create user-specific upload directory
        user_upload_dir = os.path.join(cls.UPLOAD_DIR, str(user_id))
        os.makedirs(user_upload_dir, exist_ok=True)
        
        # Full file path
        file_path = os.path.join(user_upload_dir, unique_filename)
        
        # Save file
        try:
            with open(file_path, "wb") as buffer:
                buffer.write(file.file.read())
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
        
        # Return document metadata
        return {
            "document_id": hash(unique_filename),  # Temporary ID generation
            "file_name": file.filename,
            "file_path": file_path,
            "uploaded_at": datetime.now(),
            "file_type": file.content_type,
            "file_size": file_size
        }

    @classmethod
    def preview_document(
        cls, 
        document_id: int, 
        user_id: int
    ) -> Dict[str, Any]:
        """
        Generate a preview for a document
        
        Args:
            document_id (int): ID of the document to preview
            user_id (int): ID of the user requesting preview
        
        Returns:
            dict: Preview information
        """
        # Placeholder preview logic
        user_upload_dir = os.path.join(cls.UPLOAD_DIR, str(user_id))
        
        try:
            # Find the file corresponding to the document_id
            files = os.listdir(user_upload_dir)
            if not files:
                raise HTTPException(status_code=404, detail="Document not found")
            
            # In a real-world scenario, you'd look up the specific file by document_id
            file_name = files[0]
            file_path = os.path.join(user_upload_dir, file_name)
            
            # Basic preview generation (could be more sophisticated)
            preview_text = f"Preview of {file_name}"
            
            return {
                "document_id": document_id,
                "file_name": file_name,
                "file_type": "application/octet-stream",
                "preview_url": f"/api/documents/{document_id}/preview",
                "preview_text": preview_text
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Preview generation failed: {str(e)}")

    @classmethod
    def download_document(
        cls, 
        document_id: int, 
        user_id: int
    ) -> FileResponse:
        """
        Download a document
        
        Args:
            document_id (int): ID of the document to download
            user_id (int): ID of the user requesting download
        
        Returns:
            FileResponse: The file to be downloaded
        """
        user_upload_dir = os.path.join(cls.UPLOAD_DIR, str(user_id))
        
        try:
            # Find the file corresponding to the document_id
            files = os.listdir(user_upload_dir)
            if not files:
                raise HTTPException(status_code=404, detail="Document not found")
            
            # In a real-world scenario, you'd look up the specific file by document_id
            file_name = files[0]
            file_path = os.path.join(user_upload_dir, file_name)
            
            return FileResponse(
                path=file_path, 
                filename=file_name,
                media_type='application/octet-stream'
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")
