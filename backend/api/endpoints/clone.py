from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from services.git_clone import clone_repo, is_project_cloned

router = APIRouter()


class CloneRepoRequest(BaseModel):
    repoUrl: str


@router.post("/projects/clone", tags=["Projects"])
async def clone_repository(request: CloneRepoRequest):
    """
    Clone a Git repository into data/projects/{name}/repo.
    """
    try:
        project_name = clone_repo(request.repoUrl)
        return {
            "success": True,
            "message": f"Repository cloned as '{project_name}'.",
            "project": project_name,
        }

    except FileExistsError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unexpected error occurred during cloning.",
        )


@router.get("/projects/status", tags=["Projects"])
async def check_project_status(
    repoUrl: str = Query(..., description="Full Git repository URL")
):
    """
    Check whether a given repo URL has already been cloned.
    Returns { cloned: boolean }.
    """
    try:
        cloned = is_project_cloned(repoUrl)
        return {"cloned": cloned}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Could not determine clone status."
        )
