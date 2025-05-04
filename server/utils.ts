import fs from "fs"
import path from "path"
import { ENABLE_DETAILED_LOGGING } from "./config"

/**
 * Server-side logging utility that respects the configuration settings
 */
export function serverLog(message: string, data?: any): void {
  if (ENABLE_DETAILED_LOGGING) {
    if (data) {
      console.log(`[Server] ${message}:`, data)
    } else {
      console.log(`[Server] ${message}`)
    }
  }
}

/**
 * Server-side error logging utility
 */
export function serverError(message: string, error?: any): void {
  console.error(`[Server Error] ${message}:`, error || "")
}

/**
 * Simulates a database query delay
 * @param ms Milliseconds to delay
 */
export async function simulateDbDelay(ms = 100): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Get the current project name
 * In a real application, this would be determined by the user's selection
 * or from the request context
 */
export function getCurrentProject(): string {
  // For now, we'll hardcode the project name
  return "pyshop"
}

/**
 * Reads a JSON file from the server/data/[project] directory
 * @param filename The name of the JSON file (without the .json extension)
 * @param project The project name (defaults to the current project)
 * @returns The parsed JSON data
 */
export async function readJsonFile<T>(filename: string, project?: string): Promise<T> {
  try {
    const projectName = project || getCurrentProject()
    const filePath = path.join(process.cwd(), "server", "data", projectName, `${filename}.json`)
    const fileContents = fs.readFileSync(filePath, "utf8")
    return JSON.parse(fileContents) as T
  } catch (error) {
    serverError(`Failed to read JSON file: ${filename}.json`, error)
    throw new Error(`Failed to read JSON file: ${filename}.json`)
  }
}

/**
 * Writes data to a JSON file in the server/data/[project] directory
 * @param filename The name of the JSON file (without the .json extension)
 * @param data The data to write
 * @param project The project name (defaults to the current project)
 */
export async function writeJsonFile<T>(filename: string, data: T, project?: string): Promise<void> {
  try {
    const projectName = project || getCurrentProject()
    const filePath = path.join(process.cwd(), "server", "data", projectName, `${filename}.json`)
    const fileContents = JSON.stringify(data, null, 2)
    fs.writeFileSync(filePath, fileContents, "utf8")
    serverLog(`Successfully wrote to JSON file: ${filename}.json`)
  } catch (error) {
    serverError(`Failed to write to JSON file: ${filename}.json`, error)
    throw new Error(`Failed to write to JSON file: ${filename}.json`)
  }
}
