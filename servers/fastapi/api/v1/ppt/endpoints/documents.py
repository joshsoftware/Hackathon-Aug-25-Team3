from typing import Annotated, List
from fastapi import APIRouter, Depends, UploadFile, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from dependencies.auth import get_current_user_id
from services.database import get_async_session
from services.docling_service import DoclingService
from services.score_based_chunker import ScoreBasedChunker
from services.llm_client import LLMClient
from services import TEMP_FILE_SERVICE
from models.sql.document_chunk import DocumentChunk
from utils.randomizers import get_random_uuid
from sqlmodel import select

DOCUMENTS_ROUTER = APIRouter(prefix="/documents", tags=["Documents"])


@DOCUMENTS_ROUTER.get("", response_model=List[str])
async def list_documents(
    sql_session: Annotated[AsyncSession, Depends(get_async_session)],
    user_id: Annotated[str, Depends(get_current_user_id)],
):
    result = await sql_session.execute(
        select(DocumentChunk.doc_id)
        .where(DocumentChunk.tenant_id == user_id)
        .distinct()
    )
    document_ids = result.scalars().all()
    return document_ids


@DOCUMENTS_ROUTER.post("/upload")
async def upload_document(
    files: List[UploadFile],
    tags: Annotated[str, Form()],
    sql_session: Annotated[AsyncSession, Depends(get_async_session)],
    user_id: Annotated[str, Depends(get_current_user_id)],
):
    temp_dir = TEMP_FILE_SERVICE.create_temp_dir()
    docling_service = DoclingService()
    chunker = ScoreBasedChunker()
    tag_list = [tag.strip() for tag in tags.split(',')]

    for file in files:
        doc_uuid = get_random_uuid()
        file_path = TEMP_FILE_SERVICE.save_file(temp_dir, file.file, file.filename or get_random_uuid())
        markdown_content = docling_service.parse_to_markdown(file_path)
        
        # Use the new chunker logic
        temporary_chunks = await chunker.get_n_chunks(markdown_content, 10) # Using top_k=10 headings
        chunk_contents = [chunk.content for chunk in temporary_chunks]

        if not chunk_contents:
            continue

        llm_client = LLMClient()
        embeddings = await llm_client.generate_embeddings(chunk_contents)

        db_chunks = [
            DocumentChunk(
                content=chunk_content,
                tenant_id=user_id,
                doc_id=doc_uuid,
                tags=tag_list,
                embedding=embedding,
            )
            for chunk_content, embedding in zip(chunk_contents, embeddings)
        ]
        sql_session.add_all(db_chunks)
        await sql_session.commit()

        print(f"Processed and saved {len(db_chunks)} chunks for document {doc_uuid} with tags {tag_list} for user {user_id}")

    return {"message": f"{len(files)} documents processed and queued for embedding."}


