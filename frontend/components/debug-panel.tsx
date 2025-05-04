"use client"

import { useState, useEffect } from "react"
import { Bug, X, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCurrentProject } from "@/lib/project"

interface ApiCall {
  endpoint: string
  timestamp: string
  success: boolean
  params?: any
  response?: any
  error?: string
}

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  const [currentProject, setCurrentProject] = useState<string>("")
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Get current project
  useEffect(() => {
    setCurrentProject(getCurrentProject())
  }, [])

  // Monitor console logs for API calls
  useEffect(() => {
    if (!isOpen) return

    // Create a proxy for console.group to capture API calls
    const originalConsoleGroup = console.group
    const originalConsoleGroupEnd = console.groupEnd
    const originalConsoleLog = console.log
    const originalConsoleError = console.error

    console.group = (message: string, ...args: any[]) => {
      if (
        typeof message === "string" &&
        (message.includes("API Request") || message.includes("API Response") || message.includes("API Error"))
      ) {
        // Capture API call
        const isRequest = message.includes("API Request")
        const isError = message.includes("API Error")

        if (isRequest) {
          const endpoint = message.replace("🔷 API Request: ", "")
          setApiCalls((prev) => [
            {
              endpoint,
              timestamp: new Date().toISOString(),
              success: true,
              params: args[0],
            },
            ...prev.slice(0, 19), // Keep last 20 calls
          ])
        } else if (isError) {
          const endpoint = message.replace("❌ API Error: ", "")
          setApiCalls((prev) => {
            const updated = [...prev]
            const requestIndex = updated.findIndex((call) => call.endpoint === endpoint)
            if (requestIndex !== -1) {
              updated[requestIndex].success = false
              updated[requestIndex].error = args[0]
            }
            return updated
          })
        }
      }
      return originalConsoleGroup.apply(console, [message, ...args])
    }

    console.groupEnd = () => originalConsoleGroupEnd.apply(console)

    console.log = (message: string, ...args: any[]) => {
      if (typeof message === "string" && message === "Data:") {
        // Capture API response data
        setApiCalls((prev) => {
          const updated = [...prev]
          if (updated.length > 0) {
            updated[0].response = args[0]
          }
          return updated
        })
      }
      return originalConsoleLog.apply(console, [message, ...args])
    }

    console.error = (message: string, ...args: any[]) => {
      if (typeof message === "string" && message === "Error:") {
        // Capture API error
        setApiCalls((prev) => {
          const updated = [...prev]
          if (updated.length > 0) {
            updated[0].error = args[0]
          }
          return updated
        })
      }
      return originalConsoleError.apply(console, [message, ...args])
    }

    // Restore original console methods on cleanup
    return () => {
      console.group = originalConsoleGroup
      console.groupEnd = originalConsoleGroupEnd
      console.log = originalConsoleLog
      console.error = originalConsoleError
    }
  }, [isOpen])

  // Function to refresh the page
  const handleRefresh = () => {
    setIsLoading(true)
    window.location.reload()
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-amber-500 text-white p-2 rounded-full shadow-lg hover:bg-amber-600 transition-colors z-50"
        aria-label="Open debug panel"
      >
        <Bug className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg z-50 transition-all duration-200 w-96",
        isMinimized ? "h-10" : "h-96",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-medium">Debug Panel</h3>
          {currentProject && (
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
              Project: {currentProject}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-1 rounded-md hover:bg-accent"
            aria-label="Refresh page"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-md hover:bg-accent"
            aria-label={isMinimized ? "Expand panel" : "Minimize panel"}
          >
            {isMinimized ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md hover:bg-accent"
            aria-label="Close debug panel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-2 h-[calc(100%-2.5rem)] overflow-auto">
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Recent API Calls</h4>
            {apiCalls.length === 0 ? (
              <p className="text-xs text-center py-4 text-muted-foreground">No API calls recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {apiCalls.map((call, index) => (
                  <div
                    key={index}
                    className={cn(
                      "text-xs border rounded-md p-2",
                      call.success ? "border-green-500/30" : "border-red-500/30",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium">{call.endpoint}</span>
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded-full text-[10px]",
                          call.success ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500",
                        )}
                      >
                        {call.success ? "Success" : "Error"}
                      </span>
                    </div>
                    {call.params && (
                      <div className="mt-1">
                        <span className="text-muted-foreground">Params: </span>
                        <pre className="bg-muted p-1 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(call.params, null, 2)}
                        </pre>
                      </div>
                    )}
                    {call.response && (
                      <div className="mt-1">
                        <span className="text-muted-foreground">Response: </span>
                        <pre className="bg-muted p-1 rounded mt-1 overflow-x-auto max-h-20">
                          {JSON.stringify(call.response, null, 2)}
                        </pre>
                      </div>
                    )}
                    {call.error && (
                      <div className="mt-1">
                        <span className="text-red-500">Error: </span>
                        <pre className="bg-red-500/10 text-red-500 p-1 rounded mt-1 overflow-x-auto">
                          {typeof call.error === "object" ? JSON.stringify(call.error, null, 2) : call.error}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
