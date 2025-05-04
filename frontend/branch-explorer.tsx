"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, GitBranch, GitCommit } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCodeContext } from "@/context/code-context"
import type { Branch, Commit } from "@/lib/types"
import { fetchBranches } from "@/lib/api"

interface BranchExplorerProps {
  onCommitSelect?: (commitId: string) => void
}

export default function BranchExplorer({ onCommitSelect }: BranchExplorerProps) {
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null)
  const { selectedCommitId, setSelectedCommitId } = useCodeContext()

  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const data = await fetchBranches()
        setBranches(data)
      } catch (error) {
        console.error("Failed to fetch branches:", error)
        setBranches([])
      } finally {
        setLoading(false)
      }
    }

    loadBranches()
  }, [])

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

  return (
    <div className="w-full max-w-xs border-r border-border h-screen overflow-y-auto bg-background">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Branches</h2>
      </div>
      {loading ? (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Loading branches...</p>
        </div>
      ) : (
        <div className="p-2">
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
                <span className="text-sm font-medium truncate">{branch.name}</span>
              </button>

              {expandedBranch === branch.name && (
                <div className="ml-8 mt-1 space-y-1">
                  {branch.commits.map((commit) => (
                    <CommitCard
                      key={commit.id}
                      commit={commit}
                      isSelected={selectedCommitId === commit.id}
                      onClick={() => handleCommitClick(commit.id)}
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
  isSelected: boolean
  onClick: () => void
}

function CommitCard({ commit, isSelected, onClick }: CommitCardProps) {
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
        <span className="text-xs font-medium truncate">{commit.message}</span>
      </div>
      <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
        <span>{commit.author}</span>
        <code className="bg-muted px-1 rounded text-[10px]">{commit.id.substring(0, 7)}</code>
      </div>
    </button>
  )
}
