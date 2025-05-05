import type { Branch, FileChange, FeatureExplanation, UnitTest, CodeImpact } from "@/lib/types"
import type { TestState } from "@/context/test-state-context"
import { logApiRequest, logApiResponse } from "@/lib/debug"

// Base URL for the FastAPI backend from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
const FETCH_TIMEOUT = 5000

/**
 * Clone a Git repository via the backend (FastAPI)
 */
export async function cloneRepository(url: string, projectName?: string) {
  const response = await fetch("http://localhost:8000/api/projects/clone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, projectName }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || "Clone failed")
  }

  return data
}

/**
 * Check if a repository is already cloned
 */
export async function checkRepositoryStatus(url: string): Promise<{ isCloned: boolean }> {
  // In a real app, this would be an API call
  // Example: return fetch('/api/projects/status', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ url })
  // }).then(res => res.json())

  // For now, simulate a check with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate that pyshop is already cloned
      const urlParts = url.split("/")
      const repoName = urlParts[urlParts.length - 1].replace(".git", "")
      const isCloned = repoName.toLowerCase() === "pyshop"

      resolve({ isCloned })
    }, 700) // Simulate network delay
  })
}

/*
* Endpoint to check if the repo is cloned
*/
export async function checkRepoCloned(repoUrl: string): Promise<{ cloned: boolean }> {
  const res = await fetch(`/api/projects/status?repoUrl=${encodeURIComponent(repoUrl)}`);
  if (!res.ok) throw new Error("Failed to check project status");
  return res.json();
}


/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = FETCH_TIMEOUT
): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(id)
    return response
  } catch (error: any) {
    clearTimeout(id)

    if (error.name === "AbortError") {
      console.warn(`Fetch to ${url} aborted after timeout of ${timeout}ms.`)
      throw new Error(`Request to ${url} timed out.`)
    }

    throw error
  }
}


/**
 * Fetch all branches and commits
 */
export async function fetchBranches(): Promise<Branch[]> {
  const endpoint = `${API_BASE_URL}/api/branches`
  logApiRequest(endpoint)

  try {
    const response = await fetchWithTimeout(endpoint)

    if (!response.ok) {
      const error = `Failed to fetch branches: ${response.statusText}`
      logApiResponse(endpoint, null, error)
      throw new Error(error)
    }

    const data = await response.json()
    logApiResponse(endpoint, data)
    return data
  } catch (error) {
    logApiResponse(endpoint, null, error)
    console.error("Error fetching branches:", error)
    throw error
  }
}

/**
 * Fetch file changes for a specific commit
 */
export async function fetchFileChanges(commitId: string): Promise<FileChange[]> {
  const endpoint = `${API_BASE_URL}/api/commits/${commitId}/changes`
  logApiRequest(endpoint, { commitId })

  try {
    const response = await fetchWithTimeout(endpoint)

    if (!response.ok) {
      const error = `Failed to fetch changes for commit ${commitId}: ${response.statusText}`
      logApiResponse(endpoint, null, error)
      throw new Error(error)
    }

    const data = await response.json()
    logApiResponse(endpoint, data)
    return data
  } catch (error) {
    logApiResponse(endpoint, null, error)
    console.error(`Error fetching changes for commit ${commitId}:`, error)
    throw error
  }
}

/**
 * Fetch explanation for a specific file change
 */
export async function fetchExplanation(changeId: string): Promise<FeatureExplanation | null> {
  const endpoint = `${API_BASE_URL}/api/changes/${changeId}/explanation`
  logApiRequest(endpoint, { changeId })

  try {
    const response = await fetchWithTimeout(endpoint)

    if (!response.ok) {
      const error = `Failed to fetch explanation for change ${changeId}: ${response.statusText}`
      logApiResponse(endpoint, null, error)
      throw new Error(error)
    }

    const data = await response.json()
    logApiResponse(endpoint, data)
    return data
  } catch (error) {
    logApiResponse(endpoint, null, error)
    console.error(`Error fetching explanation for change ${changeId}:`, error)
    throw error
  }
}

/**
 * Fetch unit tests for a specific file change
 */
export async function fetchUnitTests(changeId: string): Promise<UnitTest[]> {
  const endpoint = `${API_BASE_URL}/api/changes/${changeId}/tests`
  logApiRequest(endpoint, { changeId })

  try {
    const response = await fetchWithTimeout(endpoint)

    if (!response.ok) {
      const error = `Failed to fetch tests for change ${changeId}: ${response.statusText}`
      logApiResponse(endpoint, null, error)
      throw new Error(error)
    }

    const data = await response.json()
    logApiResponse(endpoint, data)
    return data
  } catch (error) {
    logApiResponse(endpoint, null, error)
    console.error(`Error fetching tests for change ${changeId}:`, error)
    throw error
  }
}

/**
 * Fetch code impacts for a specific file change
 */
export async function fetchImpacts(changeId: string): Promise<CodeImpact[]> {
  const endpoint = `${API_BASE_URL}/api/changes/${changeId}/impacts`
  logApiRequest(endpoint, { changeId })

  try {
    const response = await fetchWithTimeout(endpoint)

    if (!response.ok) {
      const error = `Failed to fetch impacts for change ${changeId}: ${response.statusText}`
      logApiResponse(endpoint, null, error)
      throw new Error(error)
    }

    const data = await response.json()
    logApiResponse(endpoint, data)
    return data
  } catch (error) {
    logApiResponse(endpoint, null, error)
    console.error(`Error fetching impacts for change ${changeId}:`, error)
    throw error
  }
}

/**
 * Fetch deep dive analysis for a specific impact
 */
export async function fetchDeepDiveAnalysis(impactId: string): Promise<string | null> {
  const endpoint = `${API_BASE_URL}/api/impacts/${impactId}/deep-dive`
  logApiRequest(endpoint, { impactId })

  try {
    const response = await fetchWithTimeout(endpoint)

    if (!response.ok) {
      const error = `Failed to fetch deep dive analysis for impact ${impactId}: ${response.statusText}`
      logApiResponse(endpoint, null, error)
      throw new Error(error)
    }

    const data = await response.json()
    logApiResponse(endpoint, data)
    return data.analysis
  } catch (error) {
    logApiResponse(endpoint, null, error)
    console.error(`Error fetching deep dive analysis for impact ${impactId}:`, error)
    throw error
  }
}

/**
 * Submit edge cases for a specific file change
 */
export async function submitEdgeCases(changeId: string, edgeCases: string): Promise<{ success: boolean }> {
  const endpoint = `${API_BASE_URL}/api/changes/${changeId}/edge-cases`
  logApiRequest(endpoint, { changeId, edgeCases })

  try {
    const response = await fetchWithTimeout(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ edgeCases }),
    })

    if (!response.ok) {
      const error = `Failed to submit edge cases for change ${changeId}: ${response.statusText}`
      logApiResponse(endpoint, null, error)
      throw new Error(error)
    }

    const data = await response.json()
    logApiResponse(endpoint, data)
    return data
  } catch (error) {
    logApiResponse(endpoint, null, error)
    console.error(`Error submitting edge cases for change ${changeId}:`, error)
    throw error
  }
}

/**
 * Fetch test state from the backend
 */
export async function fetchTestState(): Promise<TestState> {
  const endpoint = `${API_BASE_URL}/api/test-state`
  logApiRequest(endpoint)

  try {
    const response = await fetchWithTimeout(endpoint)

    if (!response.ok) {
      const error = `Failed to fetch test state: ${response.statusText}`
      logApiResponse(endpoint, null, error)
      throw new Error(error)
    }

    const data = await response.json()
    logApiResponse(endpoint, data)
    return data
  } catch (error) {
    logApiResponse(endpoint, null, error)
    console.error("Error fetching test state:", error)
    throw error
  }
}

/**
 * Update test state on the backend
 */
export async function updateTestState(testState: TestState): Promise<void> {
  const endpoint = `${API_BASE_URL}/api/test-state`
  logApiRequest(endpoint, { testState })

  try {
    const response = await fetchWithTimeout(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testState),
    })

    if (!response.ok) {
      const errorData = await response.json()
      const error = errorData.error || "Failed to update test state"
      logApiResponse(endpoint, null, error)
      throw new Error(error)
    }

    const data = await response.json()
    logApiResponse(endpoint, data)
  } catch (error) {
    logApiResponse(endpoint, null, error)
    console.error("Error updating test state:", error)
    throw error
  }
}
