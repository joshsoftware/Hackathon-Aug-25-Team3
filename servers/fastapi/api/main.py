from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.lifespan import app_lifespan
from api.middlewares import UserConfigEnvUpdateMiddleware, ServerActionsValidationMiddleware
from api.v1.ppt.router import API_V1_PPT_ROUTER
from api.v1.router import API_V1_ROUTER


app = FastAPI(lifespan=app_lifespan)


# Routers
app.include_router(API_V1_PPT_ROUTER)
app.include_router(API_V1_ROUTER)

# Middlewares
origins = [
    "http://localhost:3000",  # Next.js development server
    "http://localhost:5001",  # FastAPI server
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Origin",
        "X-Requested-With",
        "X-Forwarded-Host",
        "Origin"
    ],
)

app.add_middleware(UserConfigEnvUpdateMiddleware)
app.add_middleware(ServerActionsValidationMiddleware)
