from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from schemas.organisations import (
    OrganisationCreate,
    OrganisationResponse,
    UserCreate,
    UserResponse,
    Token,
    LoginRequest,
    OrganisationOnboardingRequest,
    OrganisationCreateResponse,
    SimpleOrganisationOnboardRequest
)
from models.sql.organisation import Organisation
from models.sql.user import User
from services.database import get_async_session
from utils.auth import (
    get_password_hash,
    create_user_token,
    verify_password,
    get_current_user
)

router = APIRouter()

@router.post("/create", response_model=OrganisationCreateResponse)
async def create_organisation(
    org_data: OrganisationCreate,
    session: Session = Depends(get_async_session)
):
    """
    Create a new organisation with just the name.
    
    This endpoint:
    1. Creates a new organisation with the provided name
    2. Returns a success message with the organisation ID
    """
    # Create organisation
    org = Organisation(name=org_data.name, logo_url=org_data.logo_url)
    session.add(org)
    await session.commit()
    await session.refresh(org)
    
    # Return success message
    return OrganisationCreateResponse(
        success=True,
        message=f"Organisation '{org.name}' created successfully",
        organisation_id=org.id
    )

@router.post("/onboard", response_model=OrganisationCreateResponse)
async def onboard_organisation(
    onboarding_data: SimpleOrganisationOnboardRequest,
    session: Session = Depends(get_async_session)
):
    """
    Onboard a new organisation with just the name.
    
    This endpoint:
    1. Creates a new organisation with the provided name
    2. Returns a success message with the organisation ID
    """
    # Create organisation
    org = Organisation(name=onboarding_data.name)
    session.add(org)
    await session.commit()
    await session.refresh(org)
    
    # Return success message
    return OrganisationCreateResponse(
        success=True,
        message=f"Organisation '{org.name}' created successfully",
        organisation_id=org.id
    )

@router.post("/onboard-with-admin", response_model=OrganisationCreateResponse)
async def onboard_organisation_with_admin(
    onboarding_data: OrganisationOnboardingRequest,
    session: Session = Depends(get_async_session)
):
    """
    Onboard a new organisation with an admin user.
    
    This endpoint:
    1. Creates a new organisation
    2. Creates an admin user for that organisation
    3. Returns a success message with the organisation ID
    """
    # Create organisation
    org = Organisation(name=onboarding_data.organisation_name)
    session.add(org)
    await session.commit()
    await session.refresh(org)
    
    # Check if email already exists
    query = select(User).where(User.email == onboarding_data.admin_email)
    result = await session.execute(query)
    existing_user_tuple = result.first()
    if existing_user_tuple:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Create admin user with hashed password
    hashed_password = get_password_hash(onboarding_data.admin_password)
    user = User(
        full_name=onboarding_data.admin_full_name,
        email=onboarding_data.admin_email,
        password=hashed_password,
        organisation_id=org.id,
        is_admin=True
    )
    
    session.add(user)
    await session.commit()
    await session.refresh(user)

    # Return success message
    return OrganisationCreateResponse(
        success=True,
        message=f"Organisation '{org.name}' onboarded successfully with admin",
        organisation_id=org.id
    )

@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    session: Session = Depends(get_async_session)
):
    """Login with email and password"""
    # Find user by email
    query = select(User).where(User.email == login_data.email)
    result = await session.execute(query)
    user_tuple = result.first()
    if not user_tuple:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Extract the User object from the tuple
    user = user_tuple[0]

    # Verify password
    if not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Generate JWT token
    access_token = create_user_token(user.id, user.email)
    
    return Token(
        access_token=access_token,
        user=UserResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            organisation_id=user.organisation_id,
            is_admin=user.is_admin,
            created_at=user.created_at
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return current_user
