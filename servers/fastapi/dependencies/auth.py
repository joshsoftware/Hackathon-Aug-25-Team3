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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
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
    except JWTError as e:
        # Log the error for debugging
        print(f"JWT Error: {str(e)}")
        
        # Raise an exception for invalid tokens
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )
