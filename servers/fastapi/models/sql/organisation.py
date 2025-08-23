from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
import uuid

if TYPE_CHECKING:
    from .user import User

def generate_uuid():
    return str(uuid.uuid4())

class Organisation(SQLModel, table=True):
    __tablename__ = "organisations"
    
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    name: str = Field(index=True)
    logo_url: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship to User
    users: List["User"] = Relationship(back_populates="organisation")
