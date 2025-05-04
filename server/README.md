# CodeLink FastAPI Backend

This directory contains the FastAPI backend for the CodeLink application.

## Setup

1. Install Python 3.9+ if you don't have it already
2. Create a virtual environment:
   \`\`\`bash
   python -m venv venv
   \`\`\`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

## Running the Server

Start the FastAPI server with:

\`\`\`bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

Or simply run:

\`\`\`bash
python main.py
\`\`\`

The server will be available at http://localhost:8000

## API Documentation

FastAPI automatically generates API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

- `main.py`: The main FastAPI application
- `requirements.txt`: Python dependencies
- `data/`: Directory containing JSON data files organized by project

## Environment Variables

- `ENABLE_DETAILED_LOGGING`: Set to "True" to enable detailed logging (default: True)
- `API_RESPONSE_DELAY`: Simulated database query delay in seconds (default: 0.3)
- `EDGE_CASES_SUBMISSION_DELAY`: Simulated delay for edge cases submission in seconds (default: 0.5)
- `TEST  Simulated delay for edge cases submission in seconds (default: 0.5)
- `TEST_STATE_SYNC_DELAY`: Simulated delay for test state synchronization in seconds (default: 0.3)

## Frontend Integration

To connect the Next.js frontend to this FastAPI backend:

1. Set the `API_BASE_URL` environment variable in the Next.js app to point to this server:
   \`\`\`
   API_BASE_URL=http://localhost:8000
   \`\`\`

2. For local development, you can also set `NEXT_PUBLIC_API_BASE_URL` to allow client-side API calls:
   \`\`\`
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   \`\`\`

3. In production, make sure to set the correct URL for your deployed FastAPI backend.

## Error Handling

The API includes proper error handling and will return appropriate HTTP status codes and error messages when something goes wrong.

## Data Storage

Currently, the backend reads and writes data from/to JSON files in the `data/` directory. In a production environment, you would typically replace this with a database.
\`\`\`

Let's also create a `.env.example` file for the frontend:

```plaintext file="server/.env.example"
# FastAPI Backend Configuration
ENABLE_DETAILED_LOGGING=True
API_RESPONSE_DELAY=0.3
EDGE_CASES_SUBMISSION_DELAY=0.5
TEST_STATE_SYNC_DELAY=0.3
