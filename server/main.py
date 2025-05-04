from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional, Any, Union
import os
import json
import time
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

app = FastAPI(title="CodeLink API", description="API for CodeLink code review tool")

# Improved CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "X-Requested-With", "Authorization"],
)

# Configuration
API_RESPONSE_DELAY = float(os.getenv("API_RESPONSE_DELAY", "0.3"))  # seconds
EDGE_CASES_SUBMISSION_DELAY = float(os.getenv("EDGE_CASES_SUBMISSION_DELAY", "0.5"))  # seconds
TEST_STATE_SYNC_DELAY = float(os.getenv("TEST_STATE_SYNC_DELAY", "0.3"))  # seconds
ENABLE_DETAILED_LOGGING = os.getenv("ENABLE_DETAILED_LOGGING", "True").lower() == "true"

# Utility functions
def server_log(message: str, data: Any = None) -> None:
    """Server-side logging utility that respects the configuration settings"""
    if ENABLE_DETAILED_LOGGING:
        if data:
            print(f"[Server] {message}:", data)
        else:
            print(f"[Server] {message}")

def server_error(message: str, error: Any = None) -> None:
    """Server-side error logging utility"""
    print(f"[Server Error] {message}:", error or "")

def simulate_db_delay(ms: float = 0.1) -> None:
    """Simulates a database query delay"""
    time.sleep(ms)

def get_current_project() -> str:
    """Get the current project name"""
    # For now, we'll hardcode the project name
    return "pyshop"

def read_json_file(filename: str, project: Optional[str] = None) -> Any:
    """Reads a JSON file from the data/[project] directory"""
    try:
        project_name = project or get_current_project()
        file_path = Path(__file__).parent / "data" / project_name / f"{filename}.json"
        
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        server_error(f"Failed to read JSON file: {filename}.json", e)
        raise HTTPException(status_code=500, detail=f"Failed to read JSON file: {filename}.json")

def write_json_file(filename: str, data: Any, project: Optional[str] = None) -> None:
    """Writes data to a JSON file in the data/[project] directory"""
    try:
        project_name = project or get_current_project()
        file_path = Path(__file__).parent / "data" / project_name / f"{filename}.json"
        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        
        server_log(f"Successfully wrote to JSON file: {filename}.json")
    except Exception as e:
        server_error(f"Failed to write to JSON file: {filename}.json", e)
        raise HTTPException(status_code=500, detail=f"Failed to write to JSON file: {filename}.json")

# Pydantic models for request/response validation
class EdgeCasesRequest(BaseModel):
    edgeCases: str

class TestState(BaseModel):
    branches: Dict[str, Any]

# API endpoints
@app.get("/api/branches")
async def get_branches():
    """Get all branches and commits"""
    server_log("Fetching branches")
    simulate_db_delay(API_RESPONSE_DELAY)
    
    try:
        branches = read_json_file("branches")
        return branches
    except Exception as e:
        server_error("Error fetching branches", e)
        raise HTTPException(status_code=500, detail="Failed to fetch branches")

@app.get("/api/commits/{commit_id}/changes")
async def get_changes(commit_id: str):
    """Get file changes for a specific commit"""
    server_log(f"Fetching changes for commit: {commit_id}")
    simulate_db_delay(API_RESPONSE_DELAY)
    
    try:
        file_changes = read_json_file("file-changes")
        changes = file_changes.get(commit_id, [])
        return changes
    except Exception as e:
        server_error(f"Error fetching changes for commit {commit_id}", e)
        raise HTTPException(status_code=500, detail="Failed to fetch changes")

@app.get("/api/changes/{change_id}/explanation")
async def get_explanation(change_id: str):
    """Get explanation for a specific file change"""
    server_log(f"Fetching explanation for change: {change_id}")
    simulate_db_delay(API_RESPONSE_DELAY)
    
    try:
        explanations = read_json_file("explanations")
        explanation = explanations.get(change_id, None)
        return explanation
    except Exception as e:
        server_error(f"Error fetching explanation for change {change_id}", e)
        raise HTTPException(status_code=500, detail="Failed to fetch explanation")

@app.get("/api/changes/{change_id}/tests")
async def get_tests(change_id: str):
    """Get unit tests for a specific file change"""
    server_log(f"Fetching tests for change: {change_id}")
    simulate_db_delay(API_RESPONSE_DELAY)
    
    try:
        unit_tests = read_json_file("unit-tests")
        tests = unit_tests.get(change_id, [])
        return tests
    except Exception as e:
        server_error(f"Error fetching tests for change {change_id}", e)
        raise HTTPException(status_code=500, detail="Failed to fetch tests")

@app.get("/api/changes/{change_id}/impacts")
async def get_impacts(change_id: str):
    """Get code impacts for a specific file change"""
    server_log(f"Fetching impacts for change: {change_id}")
    simulate_db_delay(API_RESPONSE_DELAY)
    
    try:
        impacts = read_json_file("impacts")
        change_impacts = impacts.get(change_id, [])
        return change_impacts
    except Exception as e:
        server_error(f"Error fetching impacts for change {change_id}", e)
        raise HTTPException(status_code=500, detail="Failed to fetch impacts")

@app.get("/api/impacts/{impact_id}/deep-dive")
async def get_deep_dive(impact_id: str):
    """Get deep dive analysis for a specific impact"""
    server_log(f"Fetching deep dive analysis for impact: {impact_id}")
    simulate_db_delay(API_RESPONSE_DELAY)
    
    try:
        deep_dive_analysis = read_json_file("deep-dive-analysis")
        analysis = deep_dive_analysis.get(impact_id, None)
        return {"analysis": analysis}
    except Exception as e:
        server_error(f"Error fetching deep dive analysis for impact {impact_id}", e)
        raise HTTPException(status_code=500, detail="Failed to fetch deep dive analysis")

@app.post("/api/changes/{change_id}/edge-cases")
async def submit_edge_cases(change_id: str, request: EdgeCasesRequest):
    """Submit edge cases for a specific file change"""
    server_log(f"Received edge cases for change {change_id}:", request.edgeCases)
    simulate_db_delay(EDGE_CASES_SUBMISSION_DELAY)
    
    try:
        # In a real application, we would store the edge cases in a database
        # For now, we just log them and return a success response
        return {
            "success": True,
            "message": "Edge cases received successfully",
            "changeId": change_id,
        }
    except Exception as e:
        server_error(f"Error submitting edge cases for change {change_id}", e)
        raise HTTPException(status_code=500, detail="Failed to submit edge cases")

@app.get("/api/test-state")
async def get_test_state():
    """Get the current test state"""
    server_log("Fetching test state")
    simulate_db_delay(TEST_STATE_SYNC_DELAY)
    
    try:
        test_state = read_json_file("test-state")
        return test_state
    except Exception as e:
        server_error("Error fetching test state", e)
        raise HTTPException(status_code=500, detail="Failed to fetch test state")

@app.put("/api/test-state")
async def update_test_state(test_state: TestState):
    """Update the test state"""
    server_log("Updating test state")
    simulate_db_delay(TEST_STATE_SYNC_DELAY)
    
    try:
        write_json_file("test-state", test_state.dict())
        return {"success": True}
    except Exception as e:
        server_error("Error updating test state", e)
        raise HTTPException(status_code=500, detail="Failed to update test state")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}

# Add a root endpoint for easy testing
@app.get("/")
async def root():
    """Root endpoint for testing"""
    return {"message": "Welcome to CodeLink API", "status": "online"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
