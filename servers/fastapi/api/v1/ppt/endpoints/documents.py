from typing import Annotated, List
from fastapi import APIRouter, Depends, UploadFile, HTTPException
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from dependencies.auth import get_current_user_id
from services.database import get_async_session
from services.docling_service import DoclingService
from services.score_based_chunker import ScoreBasedChunker
from services.llm_client import LLMClient
from services import TEMP_FILE_SERVICE
from models.sql.document_chunk import DocumentChunk
from sqlmodel import select

DOCUMENTS_ROUTER = APIRouter(prefix="/documents", tags=["Documents"])


@DOCUMENTS_ROUTER.get("", response_model=List[str])
async def list_documents(
    sql_session: Annotated[AsyncSession, Depends(get_async_session)],
    user_id: Annotated[str, Depends(get_current_user_id)],
):
    result = await sql_session.execute(
        select(DocumentChunk.document_id)
        .where(DocumentChunk.tenant_id == user_id)
        .distinct()
    )
    document_ids = result.scalars().all()
    return document_ids


@DOCUMENTS_ROUTER.post("/upload")
async def upload_document(
    files: List[UploadFile],
    sql_session: Annotated[AsyncSession, Depends(get_async_session)],
    user_id: Annotated[str, Depends(get_current_user_id)],
):
    temp_dir = TEMP_FILE_SERVICE.create_temp_dir()
    docling_service = DoclingService()
    chunker = ScoreBasedChunker()

    # --- TODO: Instantiate the embedding model client here --- #

    for file in files:
        # Use filename as the document_id. This is crucial for the 'delete-and-replace' strategy.
        document_id = file.filename
        if not document_id:
            raise HTTPException(400, "Uploaded files must have a filename.")

        # 1. Delete existing chunks for this document to handle updates.
        await sql_session.execute(
            delete(DocumentChunk).where(
                DocumentChunk.tenant_id == user_id, DocumentChunk.document_id == document_id
            )
        )

        # 2. Process and chunk the new document.
        file_path = TEMP_FILE_SERVICE.save_file(temp_dir, file.file, document_id)
        markdown_content = docling_service.parse_to_markdown(file_path)
        chunks = await chunker.get_n_chunks(markdown_content, 100) # Increased chunk limit

        # 3. Generate embeddings for each chunk.
        llm_client = LLMClient()
        chunk_contents = [chunk.content for chunk in chunks]
        embeddings = await llm_client.generate_embeddings(chunk_contents)

        # 4. Create DocumentChunk objects and save to the database.
        db_chunks = [
            DocumentChunk(
                content=chunk.content,
                tenant_id=user_id,
                document_id=document_id,
                embedding=embedding,
            )
            for chunk, embedding in zip(chunks, embeddings)
        ]
        sql_session.add_all(db_chunks)
        await sql_session.commit()

        print(f"Processed and saved {len(db_chunks)} chunks for file {document_id} for user {user_id}")

    return {"message": f"{len(files)} documents processed and queued for embedding."}


