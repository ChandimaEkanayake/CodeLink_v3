"use client"

import { useState, useRef, useEffect } from "react"
import { Code, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCodeContext } from "@/context/code-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { submitEdgeCases } from "@/lib/api"

export function UnitTestViewer() {
  const { currentChangeId, currentUnitTests, isLoading } = useCodeContext()
  const [edgeCases, setEdgeCases] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [edgeCases])

  // Handle edge case submission
  const handleSubmitEdgeCases = async () => {
    if (!edgeCases.trim() || !currentChangeId) return

    setIsSubmitting(true)

    try {
      await submitEdgeCases(currentChangeId, edgeCases)

      // Clear the input after successful submission
      setEdgeCases("")

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    } catch (error) {
      console.error("Failed to submit edge cases:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="border rounded-lg p-6 mt-4 text-center">
        <p className="text-muted-foreground">Loading unit tests...</p>
      </div>
    )
  }

  if (!currentChangeId || currentUnitTests.length === 0) {
    return (
      <div className="border rounded-lg p-6 mt-4 text-center">
        <p className="text-muted-foreground">
          {!currentChangeId ? "Select a change to view unit tests" : "No unit tests available for this change"}
        </p>
      </div>
    )
  }

  // Only take the first test
  const test = currentUnitTests[0]

  return (
    <div className="border rounded-lg overflow-hidden shadow-md mt-4">
      {/* Header */}
      <div className="bg-muted/30 border-b p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Unit Test</h3>
        </div>
        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{test.framework}</span>
      </div>

      {/* Unit test */}
      <div className="p-4">
        <h4 className="font-medium text-sm mb-2">{test.description}</h4>
        <div className="font-mono text-xs overflow-x-auto bg-slate-900 text-slate-200 rounded-md">
          {/* Code editor header */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-xs text-slate-400">test_{test.id}.py</div>
            <div></div> {/* Empty div for flex spacing */}
          </div>
          <pre className="p-4 overflow-x-auto">{test.testCode}</pre>
        </div>
      </div>

      {/* Edge cases input */}
      <div className="p-4 border-t">
        <h4 className="font-medium text-sm mb-2">Suggest Edge Cases</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Suggest additional edge cases to improve test coverage for this code change.
        </p>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={edgeCases}
              onChange={(e) => setEdgeCases(e.target.value)}
              placeholder="Describe edge cases that should be tested..."
              className={cn("resize-none min-h-[40px] max-h-[200px] pr-10", "placeholder:text-muted-foreground/50")}
            />
          </div>
          <Button
            onClick={handleSubmitEdgeCases}
            disabled={!edgeCases.trim() || isSubmitting}
            className="h-10 px-4 flex items-center gap-2 bg-background border border-border hover:bg-muted/95 hover:border-muted-foreground/50 transition-colors text-foreground"
          >
            <span>Submit</span>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
