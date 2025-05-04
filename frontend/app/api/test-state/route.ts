import { type NextRequest, NextResponse } from "next/server"
import { serverLog, serverError } from "@/server/utils"

// Base URL for the FastAPI backend
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000"

// Mark this as a server-side function
export const runtime = "nodejs" // 'edge' or 'nodejs'

// GET endpoint to retrieve the current test state
export async function GET() {
  try {
    serverLog("Proxying request to FastAPI: /api/test-state")

    // Forward the request to the FastAPI backend
    const response = await fetch(`${API_BASE_URL}/api/test-state`)

    if (!response.ok) {
      throw new Error(`FastAPI returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    serverError("Error proxying request to FastAPI", error)
    return NextResponse.json({ error: "Failed to fetch test state" }, { status: 500 })
  }
}

// PUT endpoint to update the test state
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    serverLog("Proxying request to FastAPI: /api/test-state", body)

    // Forward the request to the FastAPI backend
    const response = await fetch(`${API_BASE_URL}/api/test-state`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`FastAPI returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    serverError("Error proxying request to FastAPI", error)
    return NextResponse.json({ error: "Failed to update test state" }, { status: 500 })
  }
}
