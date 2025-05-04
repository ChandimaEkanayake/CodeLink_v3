from fastapi import APIRouter
from services.json_data import read_json_file, simulate_db_delay
from core.logging import server_log

router = APIRouter()

@router.get("/impacts/{impact_id}/deep-dive")
async def get_deep_dive(impact_id: str):
    server_log(f"Getting deep dive for {impact_id}")
    simulate_db_delay()
    return { "analysis": read_json_file("deep-dive-analysis").get(impact_id) }