from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
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
    SimpleOrganisationOnboardRequest,
    OrganisationUpdate,
    OrganisationUpdateResponse
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
from utils.file_upload import save_logo

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

@router.get("/{org_id}", response_model=OrganisationResponse)
async def get_organisation(
    org_id: str,
    session: Session = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get organization details by ID.
    
    This endpoint:
    1. Retrieves the organization details by ID
    2. Returns the organization details
    """
    # Check if the user belongs to the organization
    if current_user.organisation_id != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this organization"
        )
    
    # Get the organization
    org = await session.get(Organisation, org_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    return org

@router.put("/update", response_model=OrganisationUpdateResponse)
async def update_organisation(
    name: str = Form(None),
    logo: UploadFile = File(None),
    session: Session = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """
    Update the current user's organization details.
    
    This endpoint:
    1. Updates the organization name and/or logo
    2. Returns the updated organization details
    """
    # Check if the user is an admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this organization"
        )
    
    # Get the organization
    org_id = current_user.organisation_id
    org = await session.get(Organisation, org_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Update the organization name if provided
    if name:
        org.name = name
    
    # Update the organization logo if provided
    if logo:
        logo_path = await save_logo(logo)
        org.logo_url = logo_path
    
    # Save the changes
    session.add(org)
    await session.commit()
    await session.refresh(org)
    
    # Convert Organisation to OrganisationResponse
    org_response = OrganisationResponse(
        id=org.id,
        name=org.name,
        logo_url=org.logo_url,
        created_at=org.created_at
    )
    
    return OrganisationUpdateResponse(
        success=True,
        message=f"Organisation '{org.name}' updated successfully",
        organisation=org_response
    )
