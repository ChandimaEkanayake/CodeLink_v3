"use client"

import { ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TestStatus } from "@/context/test-state-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TestStatusIndicatorProps {
  status: TestStatus
  size?: "sm" | "md" | "lg"
  onChange?: (newStatus: TestStatus) => void
  className?: string
  disabled?: boolean
}

export function TestStatusIndicator({
  status,
  size = "md",
  onChange,
  className,
  disabled = false,
}: TestStatusIndicatorProps) {
  // Size mappings
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  // Status mappings
  const statusConfig = {
    passed: {
      icon: ThumbsUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      label: "Passed",
    },
    failed: {
      icon: ThumbsDown,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      label: "Failed",
    },
    not_tested: {
      icon: AlertTriangle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      label: "Not Tested",
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  // If no onChange handler or disabled, just render the indicator
  if (!onChange || disabled) {
    return (
      <div
        className={cn("flex items-center justify-center rounded-full p-1", config.bgColor, config.color, className)}
        title={config.label}
      >
        <Icon className={sizeClasses[size]} />
      </div>
    )
  }

  // If onChange handler is provided, make it interactive
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-center rounded-full p-1 cursor-pointer hover:opacity-80 transition-opacity",
            config.bgColor,
            config.color,
            className,
          )}
          title={`Current status: ${config.label}. Click to change.`}
          disabled={disabled}
        >
          <Icon className={sizeClasses[size]} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => onChange("passed")}>
          <ThumbsUp className="h-4 w-4 text-green-500" />
          <span>Mark as Passed</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => onChange("failed")}>
          <ThumbsDown className="h-4 w-4 text-red-500" />
          <span>Mark as Failed</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => onChange("not_tested")}>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>Mark as Not Tested</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
