from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def root():
    return { "message": "Welcome to CodeLink API", "status": "online" }

@router.get("/health")
async def health_check():
    return { "status": "healthy", "version": "1.0.0" }