import { NextResponse } from "next/server"
import { serverLog, serverError } from "@/server/utils"

// Base URL for the FastAPI backend
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000"

// Mark this as a server-side function
export const runtime = "nodejs" // 'edge' or 'nodejs'

export async function GET() {
  try {
    serverLog("Proxying request to FastAPI: /api/branches")

    // Forward the request to the FastAPI backend with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}/api/branches`, {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`FastAPI returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      clearTimeout(timeoutId)

      // Check if it's an AbortError (timeout)
      if (error.name === "AbortError") {
        throw new Error("Request to FastAPI backend timed out. Make sure the backend is running.")
      }

      throw error
    }
  } catch (error) {
    serverError("Error proxying request to FastAPI", error)

    // Provide more detailed error message
    let errorMessage = "Failed to fetch branches"
    if (error.message) {
      errorMessage += `: ${error.message}`
    }

    if (error.message && error.message.includes("fetch")) {
      errorMessage += ". Make sure the FastAPI backend is running at " + API_BASE_URL
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
