from pydantic import BaseModel
from typing import Dict, Any

class EdgeCasesRequest(BaseModel):
    edgeCases: str

class TestState(BaseModel):
    branches: Dict[str, Any]