"use client"

import { useState } from "react"
import {
  fetchBranches,
  fetchFileChanges,
  fetchExplanation,
  fetchUnitTests,
  fetchImpacts,
  fetchDeepDiveAnalysis,
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, ArrowRight } from "lucide-react"

export default function TestPage() {
  const [activeTab, setActiveTab] = useState("branches")
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; data?: any }>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Test fetching branches
  const testFetchBranches = async () => {
    setIsLoading(true)
    try {
      const branches = await fetchBranches()
      setTestResults((prev) => ({
        ...prev,
        branches: {
          success: true,
          message: `Successfully fetched ${branches.length} branches`,
          data: branches,
        },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        branches: {
          success: false,
          message: error instanceof Error ? error.message : String(error),
        },
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // Test fetching file changes
  const testFetchFileChanges = async () => {
    setIsLoading(true)
    try {
      // Use a known commit ID from the branches data
      const commitId = "a1b2c3d" // Update this if needed
      const changes = await fetchFileChanges(commitId)
      setTestResults((prev) => ({
        ...prev,
        changes: {
          success: true,
          message: `Successfully fetched ${changes.length} changes for commit ${commitId}`,
          data: changes,
        },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        changes: {
          success: false,
          message: error instanceof Error ? error.message : String(error),
        },
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // Test fetching explanation
  const testFetchExplanation = async () => {
    setIsLoading(true)
    try {
      // Use a known change ID with the new format
      const changeId = "a1b2c3d_c1" // Updated to new format
      const explanation = await fetchExplanation(changeId)
      setTestResults((prev) => ({
        ...prev,
        explanation: {
          success: true,
          message: `Successfully fetched explanation for change ${changeId}`,
          data: explanation,
        },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        explanation: {
          success: false,
          message: error instanceof Error ? error.message : String(error),
        },
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // Test fetching unit tests
  const testFetchUnitTests = async () => {
    setIsLoading(true)
    try {
      // Use a known change ID with the new format
      const changeId = "a1b2c3d_c1" // Updated to new format
      const tests = await fetchUnitTests(changeId)
      setTestResults((prev) => ({
        ...prev,
        tests: {
          success: true,
          message: `Successfully fetched ${tests.length} tests for change ${changeId}`,
          data: tests,
        },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        tests: {
          success: false,
          message: error instanceof Error ? error.message : String(error),
        },
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // Test fetching impacts
  const testFetchImpacts = async () => {
    setIsLoading(true)
    try {
      // Use a known change ID with the new format
      const changeId = "a1b2c3d_c1" // Updated to new format
      const impacts = await fetchImpacts(changeId)
      setTestResults((prev) => ({
        ...prev,
        impacts: {
          success: true,
          message: `Successfully fetched ${impacts.length} impacts for change ${changeId}`,
          data: impacts,
        },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        impacts: {
          success: false,
          message: error instanceof Error ? error.message : String(error),
        },
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // Test fetching deep dive analysis
  const testFetchDeepDiveAnalysis = async () => {
    setIsLoading(true)
    try {
      // Use a known impact ID
      const impactId = "impact1" // This ID format hasn't changed
      const analysis = await fetchDeepDiveAnalysis(impactId)
      setTestResults((prev) => ({
        ...prev,
        deepDive: {
          success: true,
          message: `Successfully fetched deep dive analysis for impact ${impactId}`,
          data: analysis,
        },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        deepDive: {
          success: false,
          message: error instanceof Error ? error.message : String(error),
        },
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // Run all tests
  const runAllTests = async () => {
    await testFetchBranches()
    await testFetchFileChanges()
    await testFetchExplanation()
    await testFetchUnitTests()
    await testFetchImpacts()
    await testFetchDeepDiveAnalysis()
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">API Integration Tests</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Individual Endpoints</CardTitle>
            <CardDescription>
              Test each API endpoint individually to verify data is being fetched correctly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testFetchBranches} disabled={isLoading} className="w-full">
              Test Fetch Branches
            </Button>
            <Button onClick={testFetchFileChanges} disabled={isLoading} className="w-full">
              Test Fetch File Changes
            </Button>
            <Button onClick={testFetchExplanation} disabled={isLoading} className="w-full">
              Test Fetch Explanation
            </Button>
            <Button onClick={testFetchUnitTests} disabled={isLoading} className="w-full">
              Test Fetch Unit Tests
            </Button>
            <Button onClick={testFetchImpacts} disabled={isLoading} className="w-full">
              Test Fetch Impacts
            </Button>
            <Button onClick={testFetchDeepDiveAnalysis} disabled={isLoading} className="w-full">
              Test Fetch Deep Dive Analysis
            </Button>
          </CardContent>
          <CardFooter>
            <Button onClick={runAllTests} disabled={isLoading} variant="secondary" className="w-full">
              Run All Tests
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>View the results of your API tests.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="branches">Branches</TabsTrigger>
                <TabsTrigger value="changes">Changes</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="branches" className="space-y-4">
                {testResults.branches ? (
                  <Alert variant={testResults.branches.success ? "default" : "destructive"}>
                    <div className="flex items-center gap-2">
                      {testResults.branches.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>Branches Test</AlertTitle>
                    </div>
                    <AlertDescription>{testResults.branches.message}</AlertDescription>

                    {testResults.branches.data && (
                      <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-auto max-h-40">
                        {JSON.stringify(testResults.branches.data, null, 2)}
                      </pre>
                    )}
                  </Alert>
                ) : (
                  <div className="flex items-center justify-center p-8 text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>No test results yet</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="changes" className="space-y-4">
                {testResults.changes ? (
                  <Alert variant={testResults.changes.success ? "default" : "destructive"}>
                    <div className="flex items-center gap-2">
                      {testResults.changes.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>File Changes Test</AlertTitle>
                    </div>
                    <AlertDescription>{testResults.changes.message}</AlertDescription>

                    {testResults.changes.data && (
                      <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-auto max-h-40">
                        {JSON.stringify(testResults.changes.data, null, 2)}
                      </pre>
                    )}
                  </Alert>
                ) : (
                  <div className="flex items-center justify-center p-8 text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>No test results yet</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                {testResults.explanation ? (
                  <Alert variant={testResults.explanation.success ? "default" : "destructive"}>
                    <div className="flex items-center gap-2">
                      {testResults.explanation.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>Explanation Test</AlertTitle>
                    </div>
                    <AlertDescription>{testResults.explanation.message}</AlertDescription>
                  </Alert>
                ) : null}

                {testResults.tests ? (
                  <Alert variant={testResults.tests.success ? "default" : "destructive"}>
                    <div className="flex items-center gap-2">
                      {testResults.tests.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>Unit Tests Test</AlertTitle>
                    </div>
                    <AlertDescription>{testResults.tests.message}</AlertDescription>
                  </Alert>
                ) : null}

                {testResults.impacts ? (
                  <Alert variant={testResults.impacts.success ? "default" : "destructive"}>
                    <div className="flex items-center gap-2">
                      {testResults.impacts.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>Impacts Test</AlertTitle>
                    </div>
                    <AlertDescription>{testResults.impacts.message}</AlertDescription>
                  </Alert>
                ) : null}

                {testResults.deepDive ? (
                  <Alert variant={testResults.deepDive.success ? "default" : "destructive"}>
                    <div className="flex items-center gap-2">
                      {testResults.deepDive.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>Deep Dive Analysis Test</AlertTitle>
                    </div>
                    <AlertDescription>{testResults.deepDive.message}</AlertDescription>
                  </Alert>
                ) : null}

                {!testResults.explanation && !testResults.tests && !testResults.impacts && !testResults.deepDive && (
                  <div className="flex items-center justify-center p-8 text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>No test results yet</span>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
  </div>

      <div className="flex justify-center">
        <Button asChild variant="outline">
          <a href="/" className="flex items-center gap-2">
            Back to Dashboard
            <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  )
}
