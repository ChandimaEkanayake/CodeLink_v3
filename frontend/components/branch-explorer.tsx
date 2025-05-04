"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, GitBranch, GitCommit, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCodeContext } from "@/context/code-context"
import { useTestState } from "@/context/test-state-context"
import { TestStatusIndicator } from "@/components/test-status-indicator"
import type { Branch, Commit } from "@/lib/types"
import { fetchBranches } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

interface BranchExplorerProps {
  onCommitSelect?: (commitId: string) => void
}

export default function BranchExplorer({ onCommitSelect }: BranchExplorerProps) {
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null)
  const { selectedCommitId, setSelectedCommitId } = useCodeContext()
  const { getBranchStatus, getCommitStatus } = useTestState()

  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const loadBranches = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchBranches()
        setBranches(data)

        // If we have branches and no selected commit, select the first commit of the first branch
        if (data.length > 0 && !selectedCommitId && data[0].commits && data[0].commits.length > 0) {
          setExpandedBranch(data[0].name)
          const firstCommit = data[0].commits[0]
          setSelectedCommitId(firstCommit.id)
          if (onCommitSelect) {
            onCommitSelect(firstCommit.id)
          }
        }
      } catch (error: any) {
        console.error("Failed to fetch branches:", error)
        setError(error.message || "Failed to fetch branches. Please check if the backend is running.")
        setBranches([])
      } finally {
        setLoading(false)
      }
    }

    loadBranches()
  }, [selectedCommitId, setSelectedCommitId, onCommitSelect, retryCount])

  const toggleBranch = (branchName: string) => {
    if (expandedBranch === branchName) {
      setExpandedBranch(null)
    } else {
      setExpandedBranch(branchName)
    }
  }

  const handleCommitClick = (commitId: string) => {
    setSelectedCommitId(commitId)
    if (onCommitSelect) {
      onCommitSelect(commitId)
    }
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  return (
    <div className="w-full max-w-xs border-r border-border h-full overflow-y-auto bg-background">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Branches</h2>
      </div>

      {error && (
        <Alert variant="destructive" className="m-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
          <Button variant="outline" size="sm" onClick={handleRetry} className="mt-2 w-full">
            Retry
          </Button>
        </Alert>
      )}

      {loading ? (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Loading branches...</p>
        </div>
      ) : (
        <div className="p-2 pb-20">
          {branches.map((branch) => (
            <div key={branch.name} className="mb-1">
              <button
                onClick={() => toggleBranch(branch.name)}
                className="flex items-center w-full p-2 rounded-md hover:bg-accent text-left"
              >
                {expandedBranch === branch.name ? (
                  <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
                )}
                <GitBranch className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm font-medium truncate flex-1">{branch.name}</span>
                <TestStatusIndicator status={getBranchStatus(branch.name)} size="sm" disabled />
              </button>

              {expandedBranch === branch.name && (
                <div className="ml-8 mt-1 space-y-1">
                  {branch.commits.map((commit) => (
                    <CommitCard
                      key={commit.id}
                      commit={commit}
                      branchName={branch.name}
                      isSelected={selectedCommitId === commit.id}
                      onClick={() => handleCommitClick(commit.id)}
                      testStatus={getCommitStatus(branch.name, commit.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface CommitCardProps {
  commit: Commit
  branchName: string
  isSelected: boolean
  onClick: () => void
  testStatus: "not_tested" | "passed" | "failed"
}

function CommitCard({ commit, branchName, isSelected, onClick, testStatus }: CommitCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-2 rounded-md border transition-colors",
        "hover:bg-accent/70 active:bg-accent/90 cursor-pointer",
        isSelected ? "border-primary/50 bg-accent/80" : "border-border bg-background hover:border-border/80",
      )}
    >
      <div className="flex items-center gap-2">
        <GitCommit className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-xs font-medium truncate flex-1">{commit.message}</span>
        <TestStatusIndicator status={testStatus} size="sm" disabled />
      </div>
      <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
        <span>{commit.author}</span>
        <code className="bg-muted px-1 rounded text-[10px]">{commit.id.substring(0, 7)}</code>
      </div>
    </button>
  )
}
