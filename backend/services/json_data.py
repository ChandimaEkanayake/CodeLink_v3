import json
import time
from pathlib import Path
from fastapi import HTTPException

from core.config import API_RESPONSE_DELAY, DEFAULT_PROJECT
from core.logging import server_log, server_error

def simulate_db_delay(seconds=API_RESPONSE_DELAY):
    """Simulate a delay (as if querying a DB)."""
    time.sleep(seconds)

def get_analysis_file_path(filename: str, project: str = DEFAULT_PROJECT) -> Path:
    """Construct path to analysis JSON file for a given project."""
    base_path = Path(__file__).parents[2] / "data" / "projects" / project / "analysis"
    return base_path / f"{filename}.json"

def read_json_file(filename: str, project: str = DEFAULT_PROJECT):
    """Read JSON file from project analysis folder."""
    try:
        path = get_analysis_file_path(filename, project)
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        server_error(f"Failed to read {filename}.json", e)
        raise HTTPException(status_code=500, detail=f"Could not read {filename}.json")

def write_json_file(filename: str, data: dict, project: str = DEFAULT_PROJECT):
    """Write data to a JSON file inside project analysis folder."""
    try:
        path = get_analysis_file_path(filename, project)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        server_log(f"Wrote to {filename}.json")
    except Exception as e:
        server_error(f"Failed to write {filename}.json", e)
        raise HTTPException(status_code=500, detail=f"Could not write {filename}.json")