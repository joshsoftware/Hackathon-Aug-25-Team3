from fastapi import APIRouter
from .organisations import router as organisations_router

API_V1_ROUTER = APIRouter(prefix="/api/v1")
API_V1_ROUTER.include_router(organisations_router, prefix="/organisations", tags=["organisations"])
