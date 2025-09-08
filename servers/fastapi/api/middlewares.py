from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from utils.get_env import get_can_change_keys_env
from utils.user_config import update_env_with_user_config


class UserConfigEnvUpdateMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if get_can_change_keys_env() != "false":
            update_env_with_user_config()
        return await call_next(request)


class ServerActionsValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Validate Server Actions request headers
        forwarded_host = request.headers.get('x-forwarded-host', '')
        origin = request.headers.get('origin', '')
        
        # Allowed hosts for Server Actions
        allowed_hosts = ['localhost:3000', 'localhost:5001']
        
        # Check if the headers match or are in the allowed hosts
        if forwarded_host and origin:
            if forwarded_host not in allowed_hosts or origin not in allowed_hosts:
                # Detailed error logging
                print(f"Header mismatch: x-forwarded-host={forwarded_host}, origin={origin}")
                raise HTTPException(
                    status_code=403, 
                    detail="Invalid Server Actions request. Host and origin headers do not match."
                )
        
        return await call_next(request)
