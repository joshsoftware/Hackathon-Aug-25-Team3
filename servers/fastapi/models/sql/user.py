from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime
import uuid

if TYPE_CHECKING:
    from .organisation import Organisation

def generate_uuid():
    return str(uuid.uuid4())

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    full_name: str
    email: str = Field(unique=True, index=True)
    password: str
    organisation_id: str = Field(foreign_key="organisations.id")
    is_admin: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship to Organisation
    organisation: Optional["Organisation"] = Relationship(back_populates="users")
