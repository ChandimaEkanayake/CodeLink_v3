import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Only run this middleware for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Check if the backend is available by setting a header
    const response = NextResponse.next()
    response.headers.set("x-middleware-cache", "no-cache")

    // Add CORS headers to allow requests from any origin during development
    if (process.env.NODE_ENV === "development") {
      response.headers.set("Access-Control-Allow-Origin", "*")
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    }

    return response
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/:path*",
}
