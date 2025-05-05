"use client"

import { useState, useEffect } from "react"
import { Link, FileCode, HelpCircle, Minus, Square, X, ChevronDown, Clock, Bug, CheckCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { getCurrentProject, setCurrentProject, getAvailableProjects } from "@/lib/project"
import { CSSProperties } from "react"
import { toast } from "sonner"
import { cloneRepository , checkRepoCloned} from "@/lib/api"
import { CloneProjectModal } from "@/components/clone-project-modal"

interface HeaderProps {
  currentProject?: string
}

type ElectronDivStyle = React.CSSProperties & {
  WebkitAppRegion?: string
}

// ----------------------------------------------------------------------------
// Custom hook for debounced clone-status checking
// ----------------------------------------------------------------------------
/**
 * useRepoCloneStatus
 *
 * Watches `repoUrl`, waits `delay` ms after the last change,
 * then calls `checkRepoCloned` to see if it’s already on disk.
 *
 * @param repoUrl  the Git URL to check
 * @param delay    debounce interval in milliseconds
 * @returns { isCheckingStatus, isCloned }
 */
function useRepoCloneStatus(repoUrl: string, delay = 600) {
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [isCloned, setIsCloned] = useState(false)

  useEffect(() => {
    // reset state if the URL is empty
    if (!repoUrl.trim()) {
      setIsCloned(false)
      return
    }

    // debounce timer
    const timer = setTimeout(async () => {
      setIsCheckingStatus(true)
      try {
        const { cloned } = await checkRepoCloned(repoUrl)
        setIsCloned(cloned)
      } catch (err) {
        console.error("Error checking clone status:", err)
      } finally {
        setIsCheckingStatus(false)
      }
    }, delay)

    // cleanup on repoUrl or delay change
    return () => clearTimeout(timer)
  }, [repoUrl, delay])

  return { isCheckingStatus, isCloned }
}

// ----------------------------------------------------------------------------
// Header Component
// ----------------------------------------------------------------------------
export function Header({ currentProject: propCurrentProject }: HeaderProps) {
  // Clone dialog
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false)
  const [repoUrl, setRepoUrl] = useState("")

  // Clone
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false)
  
  // Project list
  const [availableProjects, setAvailableProjects] = useState<string[]>([])
  const [currentProject, setCurrentProjectState] = useState(
    propCurrentProject || getCurrentProject()
  )

  // Use our custom hook for clone-status
  const { isCheckingStatus, isCloned } = useRepoCloneStatus(repoUrl, 600)

  // ----------------------------------------------------------------------------
  // Fetch available projects on mount
  // ----------------------------------------------------------------------------
  useEffect(() => {
    ;(async () => {
      try {
        const projects = await getAvailableProjects()
        setAvailableProjects(projects)
      } catch (err) {
        console.error("Failed to fetch available projects:", err)
      }
    })()
  }, [])

  // ----------------------------------------------------------------------------
  // Handle the “Clone” button
  // ----------------------------------------------------------------------------
  /**
   * Initiates git-clone via API, shows toasts, refreshes project list on success.
   */

  // ----------------------------------------------------------------------------
  // Project switcher
  // ----------------------------------------------------------------------------
  const handleProjectChange = (projectName: string) => {
    setCurrentProjectState(projectName)
    setCurrentProject(projectName)
    window.location.reload()
  }

  // ----------------------------------------------------------------------------
  // Placeholder actions
  // ----------------------------------------------------------------------------
  const handleOpenProject = (path: string) => console.log("Open:", path)
  const handleOpenHelp = () => console.log("Open help")
  const handleMinimize = () => console.log("Minimize")
  const handleMaximize = () => console.log("Maximize")
  const handleClose = () => console.log("Close")

  // Dummy data
  const [recentProjects] = useState([
    { name: "PyShop", path: "/path/to/pyshop" },
    { name: "NextCommerce", path: "/path/to/nextcommerce" },
    { name: "DjangoAdmin", path: "/path/to/djangoadmin" },
  ])

  return (
    <header className="flex items-center justify-between h-9 bg-[#14213d] text-white px-4 select-none">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link className="h-4 w-4 mr-1" />
          <span className="font-semibold text-base tracking-tight">CodeLink</span>
        </div>

        {/* File dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-white hover:bg-white/10 text-xs">
              File
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => setIsCloneModalOpen(true)}>
              <FileCode className="mr-2 h-4 w-4" />
              <span>Clone Project</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="p-0">
              <div className="flex flex-col w-full">
                <div className="px-2 py-1.5 text-sm font-medium">
                  <Clock className="inline-block mr-2 h-4 w-4" />
                  Open Recent
                </div>
                {recentProjects.map((project) => (
                  <button
                    key={project.path}
                    className="flex items-center px-2 py-1.5 pl-8 text-sm hover:bg-accent hover:text-accent-foreground w-full text-left"
                    onClick={() => handleOpenProject(project.path)}
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help button */}
        <Button variant="ghost" size="sm" className="h-7 text-white hover:bg-white/10 text-xs" onClick={handleOpenHelp}>
          <HelpCircle className="mr-1 h-3.5 w-3.5" />
          Help
        </Button>

        {/* Test page link */}
        <Button variant="ghost" size="sm" className="h-7 text-white hover:bg-white/10 text-xs" asChild>
          <a href="/test">
            <Bug className="mr-1 h-3.5 w-3.5" />
            Test
          </a>
        </Button>
      </div>

      {/* Middle section - draggable area with project selector */}
      <div
        className="flex-1 flex items-center justify-center cursor-move"
      >
        <div className="px-4 py-0.5 bg-white/5 border border-white/10 rounded-md text-xs font-medium w-[50%] text-center flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-white hover:bg-white/10 text-xs">
                {currentProject}
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-40">
              {availableProjects.map((project) => (
                <DropdownMenuItem
                  key={project}
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleProjectChange(project)}
                >
                  {project === currentProject && <CheckCircle className="h-4 w-4 text-green-500" />}
                  <span>{project}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Right section - window controls */}
      <div className="flex items-center space-x-2">
        <button onClick={handleMinimize} className="p-1 hover:bg-white/10 rounded-sm" aria-label="Minimize">
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button onClick={handleMaximize} className="p-1 hover:bg-white/10 rounded-sm" aria-label="Maximize">
          <Square className="h-3.5 w-3.5" />
        </button>
        <button onClick={handleClose} className="p-1 hover:bg-red-500 rounded-sm" aria-label="Close">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

     {/* Clone Project Modal */}
      <CloneProjectModal open={isCloneModalOpen} onOpenChange={setIsCloneModalOpen} />
    </header>
  )
}
