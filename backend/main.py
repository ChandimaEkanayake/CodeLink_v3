from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import all route modules
from api.endpoints import (
    branches,
    commits,
    changes,
    impacts,
    test_state,
    health,
    clone,
)

app = FastAPI(
    title="CodeLink API",
    description="API for CodeLink code review and insight system",
    version="1.0.0"
)

# CORS middleware — update allowed origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use ["http://localhost:3000"] for dev frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(health.router, tags=["Health"])
app.include_router(clone.router, prefix="/api", tags=["Project"])
app.include_router(branches.router, prefix="/api", tags=["Branches"])
app.include_router(commits.router, prefix="/api", tags=["Commits"])
app.include_router(changes.router, prefix="/api", tags=["Changes"])
app.include_router(impacts.router, prefix="/api", tags=["Impacts"])
app.include_router(test_state.router, prefix="/api", tags=["Test State"])

# Run with: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)