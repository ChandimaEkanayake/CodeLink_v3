from fastapi import APIRouter
from services.json_data import read_json_file, simulate_db_delay
from core.logging import server_log
from models.schema import EdgeCasesRequest

router = APIRouter()

@router.get("/changes/{change_id}/explanation")
async def get_explanation(change_id: str):
    server_log(f"Getting explanation for {change_id}")
    simulate_db_delay()
    return read_json_file("explanations").get(change_id)

@router.get("/changes/{change_id}/tests")
async def get_tests(change_id: str):
    server_log(f"Getting tests for {change_id}")
    simulate_db_delay()
    return read_json_file("unit-tests").get(change_id, [])

@router.get("/changes/{change_id}/impacts")
async def get_impacts(change_id: str):
    server_log(f"Getting impacts for {change_id}")
    simulate_db_delay()
    return read_json_file("impacts").get(change_id, [])

@router.post("/changes/{change_id}/edge-cases")
async def submit_edge_cases(change_id: str, payload: EdgeCasesRequest):
    server_log(f"Received edge cases for {change_id}", payload.edgeCases)
    simulate_db_delay()
    return {
        "success": True,
        "message": "Edge cases received",
        "changeId": change_id
    }