// Core data types for the application

// Repository and branch types
export type Commit = {
  id: string
  message: string
  author: string
  date: string // ISO date string
  avatar?: string // URL to author avatar
}

export type Branch = {
  name: string
  commits: Commit[]
}

// Code change types
export type ChangeType = "added" | "modified" | "deleted"

export type FileChange = {
  id: string
  filePath: string
  changeType: ChangeType
  diff: string
}

// Feature explanation types
export type FeatureExplanation = {
  shortDescription: string
  featureContext: string
  technicalDetails: string
  impact: string
  relatedChanges?: string[]
}

// Unit test types
export type TestType = "unit" | "integration" | "e2e"
export type TestFramework = "pytest" | "unittest" | "jest" | "vitest"

export type UnitTest = {
  id: string
  changeId: string
  testCode: string
  description: string
  testType: TestType
  framework: TestFramework
}

// Code impact types
export type ImpactSeverity = "high" | "medium" | "low"

export type CodeImpact = {
  id: string
  changeId: string
  impactedFilePath: string
  impactedCode: string
  description: string
  severity: ImpactSeverity
}

// API response types
export type CommitResponse = {
  branches: Branch[]
}

export type ChangeResponse = {
  changes: FileChange[]
  explanations: Record<string, FeatureExplanation>
  tests: Record<string, UnitTest[]>
  impacts: Record<string, CodeImpact[]>
}
