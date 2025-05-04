"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  File,
  AlertTriangle,
  Microscope,
  Lightbulb,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCodeContext } from "@/context/code-context"
import { Button } from "@/components/ui/button"
import React from "react"
import { fetchDeepDiveAnalysis } from "@/lib/api"

// Simple syntax highlighting function (reused from commit-changes-viewer)
const highlightSyntax = (code: string): JSX.Element => {
  // Define regex patterns for different code elements
  const patterns = [
    {
      type: "keyword",
      regex:
        /\b(const|let|var|function|return|import|export|from|default|if|else|for|while|switch|case|break|continue|class|interface|type|extends|implements|new|this|super|try|catch|finally|throw|async|await|static|public|private|protected|def|class|import|from|return|if|elif|else|for|while|try|except|finally|with|as|lambda|yield|raise)\b/g,
      className: "text-purple-400",
    },
    { type: "string", regex: /(["'`])(.*?)\1/g, className: "text-amber-300" },
    { type: "comment", regex: /(\/\/.*|\/\*[\s\S]*?\*\/|#.*)/g, className: "text-slate-500 italic" },
    { type: "function", regex: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, className: "text-blue-400" },
    { type: "component", regex: /(<\/?)([A-Z][a-zA-Z0-9]*)/g, className: "text-cyan-400" },
    { type: "jsx-attr", regex: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(=)(?=["'{])/g, className: "text-yellow-300" },
    { type: "number", regex: /\b(\d+(\.\d+)?)\b/g, className: "text-orange-400" },
    {
      type: "type",
      regex: /\b(boolean|string|number|null|undefined|any|void|never|object|symbol|bigint)\b/g,
      className: "text-green-400",
    },
    { type: "bracket", regex: /[{}[\]()]/g, className: "text-slate-400" },
    { type: "django", regex: /({%.*?%}|{{.*?}})/g, className: "text-green-300" },
  ]

  // Replace HTML special characters to prevent rendering issues
  let highlightedCode = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  // Apply syntax highlighting patterns
  patterns.forEach((pattern) => {
    highlightedCode = highlightedCode.replace(pattern.regex, (match) => {
      return `<span class="${pattern.className}">${match}</span>`
    })
  })

  return React.createElement("span", { dangerouslySetInnerHTML: { __html: highlightedCode } })
}

export function ImpactsViewer() {
  const { currentChangeId, currentImpacts, isLoading } = useCodeContext()
  const [currentImpactIndex, setCurrentImpactIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isDeepDiveVisible, setIsDeepDiveVisible] = useState(false)
  const [isLoadingDeepDive, setIsLoadingDeepDive] = useState(false)
  const [deepDiveContent, setDeepDiveContent] = useState<string | null>(null)

  // Get current impact
  const currentImpact = currentImpacts[currentImpactIndex] || null

  // Handle navigation
  const goToPrevious = () => {
    if (currentImpactIndex > 0) {
      setCurrentImpactIndex(currentImpactIndex - 1)
      setIsExpanded(false)
      setIsDescriptionExpanded(true)
      setIsDeepDiveVisible(false)
      setDeepDiveContent(null)
    }
  }

  const goToNext = () => {
    if (currentImpactIndex < currentImpacts.length - 1) {
      setCurrentImpactIndex(currentImpactIndex + 1)
      setIsExpanded(false)
      setIsDescriptionExpanded(true)
      setIsDeepDiveVisible(false)
      setDeepDiveContent(null)
    }
  }

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  // Toggle description expanded state
  const toggleDescriptionExpanded = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded)
  }

  // Handle deep dive button click
  const handleDeepDiveClick = async () => {
    if (!currentImpact) return

    setIsLoadingDeepDive(true)

    try {
      // Fetch deep dive analysis from the server
      const analysis = await fetchDeepDiveAnalysis(currentImpact.id)
      setDeepDiveContent(analysis)
      setIsDeepDiveVisible(true)
    } catch (error) {
      console.error("Failed to load deep dive analysis:", error)
    } finally {
      setIsLoadingDeepDive(false)
    }
  }

  if (isLoading) {
    return (
      <div className="border rounded-lg p-6 mt-4 text-center">
        <p className="text-muted-foreground">Loading impact analysis...</p>
      </div>
    )
  }

  if (!currentChangeId || currentImpacts.length === 0) {
    return (
      <div className="border rounded-lg p-6 mt-4 text-center">
        <p className="text-muted-foreground">
          {!currentChangeId ? "Select a change to view impacts" : "No impacts identified for this change"}
        </p>
      </div>
    )
  }

  // Process the code to separate into lines
  const codeLines = currentImpact?.impactedCode.split("\n") || []

  return (
    <div className="border rounded-lg overflow-hidden shadow-md mt-4">
      {/* Header */}
      <div className="bg-muted/30 border-b p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="font-medium">Potential Impacts</h3>
        </div>
        <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full">
          {currentImpactIndex + 1} of {currentImpacts.length}
        </span>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-3 bg-muted/10 border-b">
        <button
          onClick={goToPrevious}
          disabled={currentImpactIndex === 0}
          className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous impact"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex-1 text-center">
          <span className="text-sm font-medium">
            Impact {currentImpactIndex + 1} of {currentImpacts.length}
          </span>
        </div>

        <button
          onClick={goToNext}
          disabled={currentImpactIndex === currentImpacts.length - 1}
          className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next impact"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* File path */}
      <div className="flex items-center gap-2 p-3 bg-background border-b">
        <File className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-mono">{currentImpact?.impactedFilePath}</span>
        <span
          className={cn(
            "text-xs px-1.5 py-0.5 rounded-full ml-2",
            currentImpact?.severity === "high"
              ? "bg-red-500/10 text-red-500"
              : currentImpact?.severity === "medium"
                ? "bg-amber-500/10 text-amber-500"
                : "bg-blue-500/10 text-blue-500",
          )}
        >
          {currentImpact?.severity} severity
        </span>
      </div>

      {/* Code with editor-like styling */}
      <div className="relative">
        <button
          onClick={toggleExpanded}
          className="absolute right-2 top-2 p-1 rounded-md bg-muted/80 hover:bg-muted z-10"
          aria-label={isExpanded ? "Collapse code" : "Expand code"}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        <div
          className={cn(
            "font-mono text-xs overflow-x-auto bg-slate-900 text-slate-200",
            isExpanded ? "max-h-[400px]" : "max-h-[200px]",
            "transition-all duration-300 ease-in-out",
          )}
        >
          {/* Code editor header */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-xs text-slate-400">{currentImpact?.impactedFilePath.split("/").pop()}</div>
            <div></div> {/* Empty div for flex spacing */}
          </div>

          {/* Code content with line numbers */}
          <div className="flex">
            {/* Line numbers */}
            <div className="flex-none py-1 pl-2 pr-3 text-right select-none bg-slate-800 border-r border-slate-700 text-slate-500">
              {codeLines.map((_, i) => (
                <div key={i} className="h-6 leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code with syntax highlighting */}
            <div className="flex-grow py-1 pl-4 pr-4">
              {codeLines.map((line, i) => (
                <div key={i} className="h-6 leading-6">
                  {highlightSyntax(line)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Impact description */}
      <div className="border-t">
        <button
          onClick={toggleDescriptionExpanded}
          className="w-full p-3 text-left flex items-center justify-between hover:bg-accent/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Lightbulb className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-medium">{currentImpact?.description.split(".")[0]}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Feature:{" "}
                <span className="font-medium text-foreground">
                  {currentImpact?.impactedFilePath.split("/")[1] || "Unknown"}
                </span>
              </p>
            </div>
          </div>
          {isDescriptionExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {/* Expanded content */}
        <div
          className={cn(
            "px-4 overflow-hidden transition-all duration-300 ease-in-out",
            isDescriptionExpanded ? "max-h-[1200px] pb-4" : "max-h-0",
          )}
        >
          <p className="text-sm text-muted-foreground mb-4">{currentImpact?.description}</p>

          {!isDeepDiveVisible && (
            <Button
              onClick={handleDeepDiveClick}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isLoadingDeepDive}
            >
              <Microscope className="h-4 w-4" />
              {isLoadingDeepDive ? "Loading analysis..." : "Deep Dive Analysis"}
            </Button>
          )}

          {isDeepDiveVisible && deepDiveContent && (
            <div className="mt-4 p-4 pb-5 border rounded-md bg-muted/30 overflow-auto">
              <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Microscope className="h-4 w-4 text-primary" />
                Deep Dive Analysis
              </h5>
              <div className="prose prose-sm max-w-none dark:prose-invert space-y-4 pb-2">
                {deepDiveContent.split("\n\n").map((paragraph, idx) => {
                  if (paragraph.startsWith("###")) {
                    return (
                      <h3 key={idx} className="text-sm font-semibold mt-6 mb-3 border-b pb-1 border-border">
                        {paragraph.replace("###", "").trim()}
                      </h3>
                    )
                  } else if (paragraph.startsWith("-")) {
                    return (
                      <ul key={idx} className="list-disc pl-5 my-3 space-y-1.5">
                        {paragraph.split("\n").map((item, i) => (
                          <li key={i} className="text-sm">
                            {item.replace("-", "").trim()}
                          </li>
                        ))}
                      </ul>
                    )
                  } else if (paragraph.startsWith("1.")) {
                    return (
                      <ol key={idx} className="list-decimal pl-5 my-3 space-y-1.5">
                        {paragraph.split("\n").map((item, i) => {
                          const match = item.match(/^\d+\.\s(.+)$/)
                          return match ? (
                            <li key={i} className="text-sm">
                              {match[1]}
                            </li>
                          ) : null
                        })}
                      </ol>
                    )
                  } else {
                    return (
                      <p key={idx} className="text-sm my-2">
                        {paragraph}
                      </p>
                    )
                  }
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
