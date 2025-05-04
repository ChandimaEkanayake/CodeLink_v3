from fastapi import APIRouter
from services.json_data import read_json_file, simulate_db_delay
from core.logging import server_log

router = APIRouter()

@router.get("/branches")
async def get_branches():
    """Fetch all branches and commits."""
    server_log("Fetching branches")
    simulate_db_delay()
    return read_json_file("branches")