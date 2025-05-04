// Server configuration settings

// API response delay in milliseconds (simulates network latency)
export const API_RESPONSE_DELAY = 300

// Edge cases submission delay in milliseconds
export const EDGE_CASES_SUBMISSION_DELAY = 500

// Test state sync delay in milliseconds
export const TEST_STATE_SYNC_DELAY = 300

// Server environment
export const SERVER_ENVIRONMENT = process.env.NODE_ENV || "development"

// Enable/disable detailed logging
export const ENABLE_DETAILED_LOGGING = SERVER_ENVIRONMENT === "development"

// Maximum number of items to return in paginated responses
export const DEFAULT_PAGE_SIZE = 20
