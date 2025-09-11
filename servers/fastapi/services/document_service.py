import os
import uuid
from typing import List, Optional
from fastapi import UploadFile, HTTPException, FileResponse
from pydantic import BaseModel
from datetime import datetime
import mimetypes

class DocumentMetadata(BaseModel):
    id: str
    filename: str
    size: int
    upload_date: str
    content_type: str

class DocumentService:
    UPLOAD_DIRECTORY = "/app/uploads"

    def __init__(self):
        # Ensure upload directory exists
        os.makedirs(self.UPLOAD_DIRECTORY, exist_ok=True)

    def upload_document(self, file: UploadFile) -> DocumentMetadata:
        """
        Upload a document and save it to the server
        """
        try:
            # Generate unique filename
            file_id = str(uuid.uuid4())
            file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
            unique_filename = f"{file_id}.{file_extension}"
            file_path = os.path.join(self.UPLOAD_DIRECTORY, unique_filename)

            # Save the file
            with open(file_path, "wb") as buffer:
                buffer.write(file.file.read())

            # Create metadata
            return DocumentMetadata(
                id=file_id,
                filename=file.filename,
                size=os.path.getsize(file_path),
                upload_date=str(datetime.now()),
                content_type=file.content_type or 'application/octet-stream'
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    def list_documents(self) -> List[DocumentMetadata]:
        """
        List all uploaded documents
        """
        documents = []
        for filename in os.listdir(self.UPLOAD_DIRECTORY):
            file_path = os.path.join(self.UPLOAD_DIRECTORY, filename)
            if os.path.isfile(file_path):
                file_id = filename.split('.')[0]
                documents.append(DocumentMetadata(
                    id=file_id,
                    filename=filename,
                    size=os.path.getsize(file_path),
                    upload_date=str(datetime.fromtimestamp(os.path.getctime(file_path))),
                    content_type=mimetypes.guess_type(filename)[0] or 'application/octet-stream'
                ))
        return documents

    def get_document(self, document_id: str) -> Optional[str]:
        """
        Get the file path for a specific document
        """
        for filename in os.listdir(self.UPLOAD_DIRECTORY):
            if filename.startswith(document_id):
                return os.path.join(self.UPLOAD_DIRECTORY, filename)
        raise HTTPException(status_code=404, detail="Document not found")

    def delete_document(self, document_id: str) -> bool:
        """
        Delete a specific document
        """
        file_path = self.get_document(document_id)
        try:
            os.remove(file_path)
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

# Instantiate the service
document_service = DocumentService()