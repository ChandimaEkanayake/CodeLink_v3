"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { fetchTestState, updateTestState } from "@/lib/api"

// Define test status types
export type TestStatus = "not_tested" | "passed" | "failed"

// Define the structure for test state
export interface TestState {
  branches: {
    [branchId: string]: {
      status: TestStatus
      commits: {
        [commitId: string]: {
          status: TestStatus
          changes: {
            [changeId: string]: {
              status: TestStatus
            }
          }
        }
      }
    }
  }
}

// Context type definition
type TestStateContextType = {
  testState: TestState
  updateChangeStatus: (branchId: string, commitId: string, changeId: string, status: TestStatus) => Promise<void>
  getChangeStatus: (branchId: string, commitId: string, changeId: string) => TestStatus
  getCommitStatus: (branchId: string, commitId: string) => TestStatus
  getBranchStatus: (branchId: string) => TestStatus
  isLoading: boolean
  syncStatus: "synced" | "local_only" | "syncing"
  error: string | null
}

// Create context
const TestStateContext = createContext<TestStateContextType | undefined>(undefined)

// Initial empty state
const initialTestState: TestState = {
  branches: {},
}

export function TestStateProvider({ children }: { children: ReactNode }) {
  const [testState, setTestState] = useState<TestState>(initialTestState)
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<"synced" | "local_only" | "syncing">("synced")
  const [error, setError] = useState<string | null>(null)

  // Add this function to save state to local storage
  const saveStateToLocalStorage = useCallback((state: TestState) => {
    try {
      localStorage.setItem("codelink_test_state", JSON.stringify(state))
      console.log("Test state saved to local storage")
    } catch (error) {
      console.error("Failed to save test state to local storage:", error)
    }
  }, [])

  // Improved updateChangeStatus function with better error handling
  const updateChangeStatus = async (
    branchId: string,
    commitId: string,
    changeId: string,
    status: TestStatus,
  ): Promise<void> => {
    // Create a deep copy of the current state
    const newState = JSON.parse(JSON.stringify(testState)) as TestState

    // Ensure the branch exists
    if (!newState.branches[branchId]) {
      newState.branches[branchId] = {
        status: "not_tested",
        commits: {},
      }
    }

    // Ensure the commit exists
    if (!newState.branches[branchId].commits[commitId]) {
      newState.branches[branchId].commits[commitId] = {
        status: "not_tested",
        changes: {},
      }
    }

    // Update the change status
    newState.branches[branchId].commits[commitId].changes[changeId] = {
      status,
    }

    // Recalculate commit status
    const commitChanges = newState.branches[branchId].commits[commitId].changes
    const allChangesPassed = Object.values(commitChanges).every((change) => change.status === "passed")
    const anyChangeFailed = Object.values(commitChanges).some((change) => change.status === "failed")

    if (anyChangeFailed) {
      newState.branches[branchId].commits[commitId].status = "failed"
    } else if (allChangesPassed && Object.keys(commitChanges).length > 0) {
      newState.branches[branchId].commits[commitId].status = "passed"
    } else {
      newState.branches[branchId].commits[commitId].status = "not_tested"
    }

    // Recalculate branch status
    const branchCommits = newState.branches[branchId].commits
    const allCommitsPassed = Object.values(branchCommits).every((commit) => commit.status === "passed")
    const anyCommitFailed = Object.values(branchCommits).some((commit) => commit.status === "failed")

    if (anyCommitFailed) {
      newState.branches[branchId].status = "failed"
    } else if (allCommitsPassed && Object.keys(branchCommits).length > 0) {
      newState.branches[branchId].status = "passed"
    } else {
      newState.branches[branchId].status = "not_tested"
    }

    // Update local state immediately
    setTestState(newState)

    // Save to local storage
    saveStateToLocalStorage(newState)

    // Set sync status to local_only initially
    setSyncStatus("local_only")

    // Send update to backend
    try {
      setSyncStatus("syncing")
      await updateTestState(newState)
      setSyncStatus("synced")
      console.log("Test state successfully updated on server")
    } catch (error) {
      console.error("Failed to update test state on server:", error)
      setSyncStatus("local_only")
      setError("Failed to update test state on server. Changes saved locally.")
      // We don't revert the local state since we want to keep the user's changes
      // even if the server update fails
      throw error // Re-throw to allow component to handle the error
    }
  }

  // Add this to the useEffect that loads the initial state
  useEffect(() => {
    const loadTestState = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // First try to load from local storage
        const localState = localStorage.getItem("codelink_test_state")

        if (localState) {
          // If we have local state, use it
          const parsedState = JSON.parse(localState) as TestState
          setTestState(parsedState)
          console.log("Loaded test state from local storage")

          // Try to sync with server in the background
          try {
            setSyncStatus("syncing")
            await updateTestState(parsedState)
            setSyncStatus("synced")
            console.log("Synced local state with server")
          } catch (error) {
            console.warn("Using local state, couldn't sync with server:", error)
            setSyncStatus("local_only")
            setError("Couldn't sync with server. Using local state.")
          }
        } else {
          // If no local state, fetch from server
          const state = await fetchTestState()
          setTestState(state)
          // Save the fetched state to local storage
          saveStateToLocalStorage(state)
          setSyncStatus("synced")
          console.log("Loaded test state from server and saved to local storage")
        }
      } catch (error) {
        console.error("Failed to fetch test state:", error)
        // Initialize with empty state if fetch fails
        setTestState(initialTestState)
        setSyncStatus("local_only")
        setError("Failed to fetch test state. Using empty state.")
      } finally {
        setIsLoading(false)
      }
    }

    loadTestState()
  }, [saveStateToLocalStorage])

  // Helper to get change status
  const getChangeStatus = (branchId: string, commitId: string, changeId: string): TestStatus => {
    try {
      return testState.branches[branchId]?.commits[commitId]?.changes[changeId]?.status || "not_tested"
    } catch (error) {
      return "not_tested"
    }
  }

  // Helper to get commit status
  const getCommitStatus = (branchId: string, commitId: string): TestStatus => {
    try {
      return testState.branches[branchId]?.commits[commitId]?.status || "not_tested"
    } catch (error) {
      return "not_tested"
    }
  }

  // Helper to get branch status
  const getBranchStatus = (branchId: string): TestStatus => {
    try {
      return testState.branches[branchId]?.status || "not_tested"
    } catch (error) {
      return "not_tested"
    }
  }

  return (
    <TestStateContext.Provider
      value={{
        testState,
        updateChangeStatus,
        getChangeStatus,
        getCommitStatus,
        getBranchStatus,
        isLoading,
        syncStatus,
        error,
      }}
    >
      {children}
    </TestStateContext.Provider>
  )
}

export function useTestState() {
  const context = useContext(TestStateContext)
  if (context === undefined) {
    throw new Error("useTestState must be used within a TestStateProvider")
  }
  return context
}
