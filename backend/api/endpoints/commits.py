from fastapi import APIRouter
from services.json_data import read_json_file, simulate_db_delay
from core.logging import server_log

router = APIRouter()

@router.get("/commits/{commit_id}/changes")
async def get_commit_changes(commit_id: str):
    """Get file changes for a specific commit."""
    server_log(f"Fetching changes for commit: {commit_id}")
    simulate_db_delay()
    changes = read_json_file("file-changes").get(commit_id, [])
    return changes