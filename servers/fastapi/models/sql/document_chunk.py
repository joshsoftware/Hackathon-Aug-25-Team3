from typing import List
from pgvector.sqlalchemy import Vector
from sqlmodel import Field, SQLModel, Column
from pydantic import ConfigDict
from sqlalchemy.dialects.postgresql import JSONB


class DocumentChunk(SQLModel, table=True):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    id: int = Field(default=None, primary_key=True)
    content: str
    tenant_id: str = Field(index=True)
    doc_id: str = Field(index=True)
    tags: List[str] = Field(sa_column=Column(JSONB))
    embedding: List[float] = Field(sa_column=Column(Vector(384)))
