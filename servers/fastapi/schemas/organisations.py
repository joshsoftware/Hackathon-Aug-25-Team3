from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# Organisation Schemas
class OrganisationCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None

class OrganisationResponse(BaseModel):
    id: str
    name: str
    logo_url: Optional[str] = None
    created_at: datetime

# User Schemas
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    organisation_id: Optional[str] = None
    is_admin: bool = True

# Organisation Onboarding Schema
class OrganisationOnboardingRequest(BaseModel):
    organisation_name: str
    admin_full_name: str
    admin_email: EmailStr
    admin_password: str

# Simple Organisation Onboarding Schema
class SimpleOrganisationOnboardRequest(BaseModel):
    name: str


# Authentication Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    organisation_id: str
    is_admin: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class OrganisationCreateResponse(BaseModel):
    success: bool
    message: str
    organisation_id: str
