"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Lightbulb, Code, Zap, LinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FeatureExplanation } from "@/lib/mock-explanations"

interface FeatureExplanationCardProps {
  explanation: FeatureExplanation
  isActive?: boolean
}

export function FeatureExplanationCard({ explanation, isActive = false }: FeatureExplanationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden transition-all duration-200",
        isActive ? "border-primary shadow-md" : "border-border",
        isExpanded ? "shadow-lg" : "",
      )}
    >
      {/* Header - always visible */}
      <div
        className={cn(
          "p-4 flex items-start gap-3 cursor-pointer hover:bg-accent/50 transition-colors",
          isExpanded ? "bg-accent/30" : "bg-background",
        )}
        onClick={toggleExpanded}
      >
        <div className="mt-1 text-primary">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-base">{explanation.shortDescription}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Feature: <span className="font-medium text-foreground">{explanation.featureContext}</span>
          </p>
        </div>
        <button
          className="p-1 rounded-full hover:bg-accent"
          aria-label={isExpanded ? "Collapse explanation" : "Expand explanation"}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-border/50 bg-background/50">
          <div className="mt-4 space-y-4">
            <div className="flex gap-3">
              <Code className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Technical Details</h4>
                <p className="text-sm mt-1">{explanation.technicalDetails}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Zap className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Impact</h4>
                <p className="text-sm mt-1">{explanation.impact}</p>
              </div>
            </div>

            {explanation.relatedChanges && explanation.relatedChanges.length > 0 && (
              <div className="flex gap-3">
                <LinkIcon className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Related Changes</h4>
                  <ul className="text-sm mt-1 list-disc list-inside">
                    {explanation.relatedChanges.map((changeId) => (
                      <li key={changeId}>Change {changeId.replace("change", "")}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
