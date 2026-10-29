from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router
from app.api.verification import router as verification_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CREDEN - AICTE Student Data Management and Academic Verification Platform API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS configuration
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Mount health endpoint under /api
app.include_router(health_router, prefix="/api")
app.include_router(verification_router, prefix="/api")


@app.get("/", tags=["Root"])
def root_status():
    return {
        "name": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs",
        "health": "/api/health",
    }
