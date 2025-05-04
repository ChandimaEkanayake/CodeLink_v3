from fastapi import APIRouter
from services.json_data import read_json_file, write_json_file
from core.logging import server_log
from models.schema import TestState
from core.config import TEST_STATE_SYNC_DELAY
import time

router = APIRouter()

@router.get("/test-state")
async def get_test_state():
    server_log("Getting test state")
    time.sleep(TEST_STATE_SYNC_DELAY)
    return read_json_file("test-state")

@router.put("/test-state")
async def update_test_state(state: TestState):
    server_log("Updating test state")
    time.sleep(TEST_STATE_SYNC_DELAY)
    write_json_file("test-state", state.dict())
    return {"success": True}