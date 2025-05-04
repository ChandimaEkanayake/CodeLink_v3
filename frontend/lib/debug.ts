/**
 * Debug utility for tracking API requests and responses
 */

// Enable or disable debug logging
const DEBUG_ENABLED = true

/**
 * Log API request details
 */
export function logApiRequest(endpoint: string, params?: any): void {
  if (!DEBUG_ENABLED) return

  console.group(`🔷 API Request: ${endpoint}`)
  if (params) {
    console.log("Params:", params)
  }
  console.log("Timestamp:", new Date().toISOString())
  console.groupEnd()
}

/**
 * Log API response details
 */
export function logApiResponse(endpoint: string, data: any, error?: any): void {
  if (!DEBUG_ENABLED) return

  if (error) {
    console.group(`❌ API Error: ${endpoint}`)
    console.error("Error:", error)
    console.log("Timestamp:", new Date().toISOString())
    console.groupEnd()
    return
  }

  console.group(`✅ API Response: ${endpoint}`)
  console.log("Data:", data)
  console.log("Timestamp:", new Date().toISOString())
  console.groupEnd()
}

/**
 * Log component render with data
 */
export function logComponentRender(componentName: string, props?: any, state?: any): void {
  if (!DEBUG_ENABLED) return

  console.group(`🔶 Component Render: ${componentName}`)
  if (props) {
    console.log("Props:", props)
  }
  if (state) {
    console.log("State:", state)
  }
  console.log("Timestamp:", new Date().toISOString())
  console.groupEnd()
}
