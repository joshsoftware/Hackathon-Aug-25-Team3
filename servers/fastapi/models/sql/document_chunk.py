from typing import List
from pgvector.sqlalchemy import Vector
from sqlmodel import Field, SQLModel, Column
from pydantic import ConfigDict # NEW IMPORT


class DocumentChunk(SQLModel, table=True):
    model_config = ConfigDict(arbitrary_types_allowed=True) # NEW LINE
    id: int = Field(default=None, primary_key=True)
    content: str
    tenant_id: str = Field(index=True)
    document_id: str = Field(index=True)
    embedding: List[float] = Field(sa_column=Column(Vector(384)))
