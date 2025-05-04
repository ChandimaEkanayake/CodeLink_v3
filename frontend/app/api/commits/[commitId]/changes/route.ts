import { NextResponse } from "next/server"
import { serverLog, serverError } from "@/server/utils"

// Base URL for the FastAPI backend
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000"

// Mark this as a server-side function
export const runtime = "nodejs" // 'edge' or 'nodejs'

export async function GET(request: Request, { params }: { params: { commitId: string } }) {
  try {
    const commitId = params.commitId
    serverLog(`Proxying request to FastAPI: /api/commits/${commitId}/changes`)

    // Forward the request to the FastAPI backend
    const response = await fetch(`${API_BASE_URL}/api/commits/${commitId}/changes`)

    if (!response.ok) {
      throw new Error(`FastAPI returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    serverError(`Error proxying request to FastAPI for commit ${params.commitId}`, error)
    return NextResponse.json({ error: "Failed to fetch changes" }, { status: 500 })
  }
}
