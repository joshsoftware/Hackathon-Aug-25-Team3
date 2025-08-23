import os
import shutil
import uuid
from fastapi import UploadFile
from pathlib import Path

# Define the base directory for file uploads
UPLOAD_DIR = Path("/app/servers/fastapi/static/uploads")
LOGO_DIR = UPLOAD_DIR / "logos"

# Ensure directories exist
os.makedirs(LOGO_DIR, exist_ok=True)

async def save_upload_file(upload_file: UploadFile, directory: Path = UPLOAD_DIR) -> str:
    """
    Save an uploaded file to the specified directory and return the file path.
    
    Args:
        upload_file: The uploaded file
        directory: The directory to save the file to (default: UPLOAD_DIR)
        
    Returns:
        The relative path to the saved file
    """
    # Generate a unique filename to avoid collisions
    file_extension = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Create the full file path
    file_path = directory / unique_filename
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    # Return the relative path from the static directory
    relative_path = str(file_path).replace("/app/servers/fastapi/static", "")
    return relative_path

async def save_logo(logo_file: UploadFile) -> str:
    """
    Save an organization logo and return the file path.
    
    Args:
        logo_file: The uploaded logo file
        
    Returns:
        The relative path to the saved logo
    """
    return await save_upload_file(logo_file, LOGO_DIR)
