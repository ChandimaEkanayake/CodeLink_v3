"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { FileChange, FeatureExplanation, UnitTest, CodeImpact } from "@/lib/types"
import { fetchFileChanges, fetchExplanation, fetchUnitTests, fetchImpacts } from "@/lib/api"

type CodeContextType = {
  selectedCommitId: string | null
  currentChangeId: string | null
  setSelectedCommitId: (id: string | null) => void
  setCurrentChangeId: (id: string | null) => void
  getCurrentChange: () => FileChange | null
  currentChanges: FileChange[]
  currentExplanation: FeatureExplanation | null
  currentUnitTests: UnitTest[]
  currentImpacts: CodeImpact[]
  isLoading: boolean
  error: string | null
}

const CodeContext = createContext<CodeContextType | undefined>(undefined)

export function CodeProvider({ children }: { children: ReactNode }) {
  const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null)
  const [currentChangeId, setCurrentChangeId] = useState<string | null>(null)
  const [currentChanges, setCurrentChanges] = useState<FileChange[]>([])
  const [currentExplanation, setCurrentExplanation] = useState<FeatureExplanation | null>(null)
  const [currentUnitTests, setCurrentUnitTests] = useState<UnitTest[]>([])
  const [currentImpacts, setCurrentImpacts] = useState<CodeImpact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch file changes when commit ID changes
  useEffect(() => {
    if (!selectedCommitId) {
      setCurrentChanges([])
      return
    }

    const loadChanges = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const changes = await fetchFileChanges(selectedCommitId)
        setCurrentChanges(changes)

        // Reset current change ID if it's not in the new changes
        if (currentChangeId && !changes.some((change) => change.id === currentChangeId)) {
          setCurrentChangeId(changes.length > 0 ? changes[0].id : null)
        } else if (!currentChangeId && changes.length > 0) {
          setCurrentChangeId(changes[0].id)
        }
      } catch (error) {
        console.error("Failed to fetch file changes:", error)
        setCurrentChanges([])
        setError("Failed to fetch file changes. Please check if the backend is running.")
      } finally {
        setIsLoading(false)
      }
    }

    loadChanges()
  }, [selectedCommitId, currentChangeId])

  // Fetch explanation, unit tests, and impacts when change ID changes
  useEffect(() => {
    if (!currentChangeId) {
      setCurrentExplanation(null)
      setCurrentUnitTests([])
      setCurrentImpacts([])
      return
    }

    const loadChangeDetails = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch all details in parallel
        const [explanation, tests, impacts] = await Promise.all([
          fetchExplanation(currentChangeId),
          fetchUnitTests(currentChangeId),
          fetchImpacts(currentChangeId),
        ])

        setCurrentExplanation(explanation)
        setCurrentUnitTests(tests)
        setCurrentImpacts(impacts)
      } catch (error) {
        console.error("Failed to fetch change details:", error)
        setCurrentExplanation(null)
        setCurrentUnitTests([])
        setCurrentImpacts([])
        setError("Failed to fetch change details. Please check if the backend is running.")
      } finally {
        setIsLoading(false)
      }
    }

    loadChangeDetails()
  }, [currentChangeId])

  const getCurrentChange = (): FileChange | null => {
    if (!currentChangeId) return null
    return currentChanges.find((change) => change.id === currentChangeId) || null
  }

  return (
    <CodeContext.Provider
      value={{
        selectedCommitId,
        currentChangeId,
        setSelectedCommitId,
        setCurrentChangeId,
        getCurrentChange,
        currentChanges,
        currentExplanation,
        currentUnitTests,
        currentImpacts,
        isLoading,
        error,
      }}
    >
      {children}
    </CodeContext.Provider>
  )
}

export function useCodeContext() {
  const context = useContext(CodeContext)
  if (context === undefined) {
    throw new Error("useCodeContext must be used within a CodeProvider")
  }
  return context
}
