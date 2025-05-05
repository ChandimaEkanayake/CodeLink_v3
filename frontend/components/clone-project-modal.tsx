"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2, Github, ArrowRight, RefreshCw, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { cloneRepository } from "@/lib/api"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Add animation styles
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideDown {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  .animate-slideDown {
    animation: slideDown 0.3s ease-in-out;
  }
`

interface CloneProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type CloneStep = "url" | "rename" | "cloning" | "success"

interface StepCircleProps {
  number: number
  active: boolean
  completed: boolean
  disabled?: boolean
}

interface StepConnectorProps {
  completed: boolean
}

export function CloneProjectModal({ open, onOpenChange }: CloneProjectModalProps) {
  const [repoUrl, setRepoUrl] = useState("")
  const [projectName, setProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsRename, setNeedsRename] = useState(false)
  const [cloneSuccess, setCloneSuccess] = useState(false)
  const [clonedProject, setClonedProject] = useState("")
  const [currentStep, setCurrentStep] = useState<CloneStep>("url")
  const [progress, setProgress] = useState(0)

  const { toast } = useToast()

  useEffect(() => {
    if (!open) resetState()
  }, [open])

  // Simulate progress during cloning
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (currentStep === "cloning" && !cloneSuccess) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const increment = Math.random() * 15
          const newProgress = Math.min(prev + increment, 95) // Cap at 95% until complete
          return newProgress
        })
      }, 800)
    }

    return () => clearInterval(interval)
  }, [currentStep, cloneSuccess])

  const resetState = () => {
    setRepoUrl("")
    setProjectName("")
    setError(null)
    setNeedsRename(false)
    setIsLoading(false)
    setCloneSuccess(false)
    setClonedProject("")
    setCurrentStep("url")
    setProgress(0)
  }

  const handleClose = () => {
    onOpenChange(false)
    // Use setTimeout to reset state after animation completes
    setTimeout(() => {
      resetState()
    }, 300)
  }

  const validateUrl = (url: string): boolean => {
    return /^https:\/\/github\.com\/[\w-]+\/[\w-]+(\.git)?$/.test(url)
  }

  const handleNext = () => {
    setError(null)

    if (currentStep === "url") {
      if (!validateUrl(repoUrl)) {
        setError("Please enter a valid GitHub repository URL (https://github.com/username/repo).")
        return
      }
      handleCloneProject()
    } else if (currentStep === "rename") {
      if (!projectName.trim()) {
        setError("Please enter a project name.")
        return
      }
      handleCloneProject()
    }
  }

  const handleCloneProject = async () => {
    setError(null)
    setIsLoading(true)

    if (currentStep === "url" || currentStep === "rename") {
      setCurrentStep("cloning")
      setProgress(0)
    }

    try {
      const response = await cloneRepository(repoUrl, needsRename ? projectName : undefined)

      if (response.status === "success") {
        setProgress(100)
        setCloneSuccess(true)
        setClonedProject(response.project)
        setCurrentStep("success")

        toast({
          title: "Project cloned successfully",
          description: `Project "${response.project}" has been cloned.`,
          variant: "default",
        })
      } else if (response.status === "exists" && response.suggestRename) {
        setNeedsRename(true)
        setCurrentStep("rename")
        const defaultName = repoUrl.split("/").pop()?.replace(".git", "") || ""
        setProjectName(`${defaultName}-copy`)
        setError("A project with this name already exists. Please enter a new project name.")
      }
    } catch (err: any) {
      let message = "Failed to clone repository. Please try again."
      try {
        const parsed = await err?.response?.json?.()
        if (parsed?.detail) {
          message = typeof parsed.detail === "string" ? parsed.detail : JSON.stringify(parsed.detail)
        }
      } catch {
        // If we can't parse the error, use the original error message or fallback
        message = err?.message || message
      }

      setError(message)
      setCurrentStep(needsRename ? "rename" : "url")

      toast({
        title: "Error cloning repository",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8 pt-4">
        <div className="flex items-center">
          <StepCircle
            number={1}
            active={currentStep === "url"}
            completed={currentStep === "rename" || currentStep === "cloning" || currentStep === "success"}
          />
          <StepConnector
            completed={currentStep === "rename" || currentStep === "cloning" || currentStep === "success"}
          />
          <StepCircle
            number={2}
            active={currentStep === "rename"}
            completed={currentStep === "cloning" || currentStep === "success"}
            disabled={!needsRename}
          />
          <StepConnector completed={currentStep === "cloning" || currentStep === "success"} />
          <StepCircle
            number={3}
            active={currentStep === "cloning" || currentStep === "success"}
            completed={currentStep === "success"}
          />
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (currentStep) {
      case "url":
        return (
          <div className="grid gap-5 p-2">
            <div className="flex items-center gap-3 mb-1">
              <Label htmlFor="repo-url" className="text-sm font-medium">
                Repository URL
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p>
                      Enter the URL of a GitHub repository you want to clone (e.g., https://github.com/username/repo)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Github className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="repo-url"
                  className="pl-10 h-11 text-base"
                  placeholder="https://github.com/username/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button onClick={handleNext} disabled={!repoUrl.trim() || isLoading} className="h-11 px-5">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      case "rename":
        return (
          <div className="grid gap-5 p-2">
            <div className="flex items-center gap-3 mb-1">
              <Label htmlFor="project-name" className="text-sm font-medium">
                New Project Name
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p>
                      A project with this name already exists. Please provide a different name for your cloned project.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex gap-3">
              <Input
                id="project-name"
                className="flex-1 h-11 text-base"
                placeholder="my-project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isLoading}
              />
              <Button onClick={handleNext} disabled={!projectName.trim() || isLoading} className="h-11 px-5">
                Clone
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      case "cloning":
        return (
          <div className="grid gap-6 py-4 px-2">
            <div className="flex flex-col items-center justify-center py-8 animate-fadeIn">
              <RefreshCw className="h-14 w-14 text-primary animate-spin mb-6" />
              <h3 className="text-xl font-medium mb-3">Cloning Repository</h3>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                Please wait while we clone your repository. This may take a few moments...
              </p>
              <div className="w-full max-w-lg mb-3">
                <Progress value={progress} className="h-3 transition-all duration-300" />
              </div>
              <p className="text-sm text-muted-foreground transition-all duration-300">
                {Math.round(progress)}% complete
              </p>
            </div>
          </div>
        )
      case "success":
        return (
          <div className="grid gap-6 py-4 px-2">
            <div className="flex flex-col items-center justify-center py-8 animate-fadeIn">
              <div className="rounded-full bg-green-100 p-4 mb-6">
                <span className="text-5xl">✅</span>
              </div>
              <h3 className="text-xl font-medium mb-3">Repository Cloned!</h3>
              <p className="text-base text-center mb-6 max-w-md">
                Your project <span className="font-medium">{clonedProject}</span> has been successfully cloned and is
                ready to use.
              </p>
              <Button variant="outline" onClick={handleClose} className="mt-2 px-6 py-2 text-base">
                Close
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] p-6">
        <DialogHeader>
          <DialogTitle>Clone Repository</DialogTitle>
          <DialogDescription>
            {currentStep === "success"
              ? `Project "${clonedProject}" has been cloned successfully.`
              : "Clone a GitHub repository to create a new project."}
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        {error && (
          <Alert variant="destructive" className="mt-4 mb-6 p-4 animate-slideDown">
            <AlertCircle className="h-5 w-5 mr-2" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {renderContent()}

        {(currentStep === "url" || currentStep === "rename") && (
          <DialogFooter className="mt-8 gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isLoading} className="px-5 py-2">
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

function StepCircle({ number, active, completed, disabled = false }: StepCircleProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all duration-300",
        completed
          ? "border-primary bg-primary text-primary-foreground"
          : active
            ? "border-primary bg-primary/10 text-primary"
            : disabled
              ? "border-muted bg-muted text-muted-foreground"
              : "border-border bg-background text-foreground",
      )}
    >
      {completed ? <CheckCircle2 className="h-5 w-5 animate-fadeIn" /> : number}
    </div>
  )
}

function StepConnector({ completed }: StepConnectorProps) {
  return (
    <div className="mx-3 h-[2px] w-16 overflow-hidden">
      <div className={cn("h-full transition-all duration-500", completed ? "bg-primary w-full" : "bg-border w-full")} />
    </div>
  )
}
