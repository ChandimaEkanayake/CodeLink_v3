"use client"

import { useState } from "react"
import { CodeProvider } from "@/context/code-context"
import { TestStateProvider } from "@/context/test-state-context"
import BranchExplorer from "@/components/branch-explorer"
import { CommitChangesViewer } from "@/components/commit-changes-viewer"

export default function Home() {
  const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null)

  // This function will be passed to BranchExplorer
  const handleCommitSelect = (commitId: string) => {
    setSelectedCommitId(commitId)
  }

  return (
    <CodeProvider>
      <TestStateProvider>
        <div className="flex h-screen dark overflow-hidden">
          {/* Left panel - fixed width with its own scrolling */}
          <div className="w-80 flex-shrink-0 h-full">
            <BranchExplorer onCommitSelect={handleCommitSelect} />
          </div>

          {/* Right main tab with its own scrolling */}
          <div className="flex-1 p-6 overflow-auto pb-20">
            <div className="max-w-5xl mx-auto">
              {selectedCommitId ? (
                <CommitChangesViewer commitId={selectedCommitId} />
              ) : (
                <div className="p-8 border border-dashed border-border rounded-lg text-center">
                  <p className="text-muted-foreground">Select a commit from the sidebar to view changes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </TestStateProvider>
    </CodeProvider>
  )
}
