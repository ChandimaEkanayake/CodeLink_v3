import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import Optional
from pathlib import Path

from services.git_clone import clone_repo, extract_project_name_from_url, is_project_existing
from core.logging import server_log, server_error

router = APIRouter()


class CloneRequest(BaseModel):
    url: HttpUrl
    projectName: Optional[str] = None  # override name if project exists


@router.post("/projects/clone")
async def clone_project(request: CloneRequest):
    try:
        repo_url = str(request.url)
        override_name = request.projectName

        # Determine project name
        project_name = override_name or extract_project_name_from_url(repo_url)

        if is_project_existing(project_name):
            if not override_name:
                return {
                    "status": "exists",
                    "message": f"Project '{project_name}' already exists.",
                    "suggestRename": True
                }
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Project '{project_name}' already exists. Please choose a new name.",
                )

        # Attempt to clone
        success, resolved_name, error_msg = clone_repo(repo_url, project_name)

        if not success:
            raise HTTPException(status_code=500, detail=error_msg or "Failed to clone repository.")

        return {
            "status": "success",
            "project": resolved_name,
            "message": f"Repository cloned successfully into 'data/projects/{resolved_name}/repo'"
        }

    except HTTPException:
        raise
    except Exception as e:
        server_error(f"[clone_project] Unexpected: {str(e)}")
        raise HTTPException(status_code=500, detail="Unexpected server error.")

