import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Simulated delays for testing UX
API_RESPONSE_DELAY = float(os.getenv("API_RESPONSE_DELAY", 0.3))
EDGE_CASES_SUBMISSION_DELAY = float(os.getenv("EDGE_CASES_SUBMISSION_DELAY", 0.5))
TEST_STATE_SYNC_DELAY = float(os.getenv("TEST_STATE_SYNC_DELAY", 0.3))

# Logging control
ENABLE_DETAILED_LOGGING = os.getenv("ENABLE_DETAILED_LOGGING", "True").lower() == "true"

# Default fallback project (e.g., pyshop)
DEFAULT_PROJECT = os.getenv("DEFAULT_PROJECT", "pyshop")
