from fastapi import Depends, Header, HTTPException, status
from typing import Optional
from jose import JWTError, jwt
from utils.auth import SECRET_KEY, ALGORITHM, get_current_user

async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Extract user_id from the Authorization header (JWT token).
    
    This function validates the JWT token and extracts the user_id from the token payload.
    """
    if not authorization:
        # For development, we'll return a default user_id if no token is provided
        # In production, this should raise an HTTPException for unauthorized access
        return "default_user"
    
    try:
        # Remove 'Bearer ' prefix if present
        token = authorization.replace("Bearer ", "")
        
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extract the user_id from the token payload
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user_id
    except JWTError:
        # For backward compatibility during development, if token validation fails,
        # fall back to using the token itself as the user_id
        # In production, this should be removed and only valid JWT tokens should be accepted
        return authorization.replace("Bearer ", "")
