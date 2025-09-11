from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from typing import List
import os
import uuid
import mimetypes
from datetime import datetime

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

# Ensure upload directory exists
UPLOAD_DIRECTORY = "/app/uploads"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

@router.get("/list")
async def list_documents():
    """
    List all uploaded documents
    """
    documents = []
    try:
        for filename in os.listdir(UPLOAD_DIRECTORY):
            file_path = os.path.join(UPLOAD_DIRECTORY, filename)
            if os.path.isfile(file_path):
                # Extract metadata from the filename
                parts = filename.split('__')
                original_filename = parts[0] if len(parts) > 1 else filename
                file_id = parts[-1].split('.')[0] if len(parts) > 1 else filename.split('.')[0]
                
                documents.append({
                    "id": file_id,
                    "filename": original_filename,
                    "size": os.path.getsize(file_path),
                    "upload_date": str(datetime.fromtimestamp(os.path.getctime(file_path))),
                    "content_type": mimetypes.guess_type(filename)[0] or 'application/octet-stream'
                })
        return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list documents: {str(e)}")

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a new document
    """
    try:
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
        
        # Create a filename that preserves the original name and includes a unique ID
        unique_filename = f"{file.filename}__{file_id}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIRECTORY, unique_filename)

        # Save the file
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        # Create metadata
        return {
            "id": file_id,
            "filename": file.filename,
            "size": os.path.getsize(file_path),
            "upload_date": str(datetime.now()),
            "content_type": file.content_type or 'application/octet-stream'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """
    Delete a specific document
    """
    try:
        for filename in os.listdir(UPLOAD_DIRECTORY):
            # Check if the filename contains the document_id
            if document_id in filename:
                file_path = os.path.join(UPLOAD_DIRECTORY, filename)
                os.remove(file_path)
                return {"success": True, "message": "Document deleted successfully"}
        
        raise HTTPException(status_code=404, detail="Document not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

@router.get("/preview/{document_id}")
async def preview_document(document_id: str):
    """
    Preview a specific document
    """
    try:
        for filename in os.listdir(UPLOAD_DIRECTORY):
            # Check if the filename contains the document_id
            if document_id in filename:
                file_path = os.path.join(UPLOAD_DIRECTORY, filename)
                
                # Extract original filename
                original_filename = filename.split('__')[0]
                
                # Determine MIME type
                mime_type = mimetypes.guess_type(original_filename)[0] or 'application/octet-stream'
                
                return FileResponse(
                    file_path, 
                    media_type=mime_type,
                    filename=original_filename
                )
        
        raise HTTPException(status_code=404, detail="Document not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")


@router.get("/download/{document_id}")
async def download_document(document_id: str):
    """
    Download a specific document
    """
    try:
        for filename in os.listdir(UPLOAD_DIRECTORY):
            # Check if the filename contains the document_id
            if document_id in filename:
                file_path = os.path.join(UPLOAD_DIRECTORY, filename)
                
                # Extract original filename
                original_filename = filename.split('__')[0]
                
                # Determine MIME type
                mime_type = mimetypes.guess_type(original_filename)[0] or 'application/octet-stream'
                
                return FileResponse(
                    file_path, 
                    media_type=mime_type,
                    filename=original_filename,
                    headers={
                        "Content-Disposition": f"attachment; filename*=UTF-8''{original_filename}"
                    }
                )
        
        raise HTTPException(status_code=404, detail="Document not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")