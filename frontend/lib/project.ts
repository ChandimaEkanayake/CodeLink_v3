/**
 * Client-side utility to get the current project name
 * This is a client-safe version of the server-side getCurrentProject function
 */
export function getCurrentProject(): string {
  // Get the project from localStorage if available
  const storedProject = typeof window !== "undefined" ? localStorage.getItem("current_project") : null
  return storedProject || "pyshop" // Default to pyshop only if no project is set
}

/**
 * Set the current project
 * @param projectName The name of the project to set as current
 */
export function setCurrentProject(projectName: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("current_project", projectName)
  }
}

/**
 * Get available projects
 * This would ideally fetch from the backend, but for now we'll return a static list
 * that can be updated when the backend provides this information
 */
export async function getAvailableProjects(): Promise<string[]> {
  // In a real implementation, this would fetch from the backend API
  // For example: const response = await fetch(`${API_BASE_URL}/api/projects`);
  // For now, we'll return a static list that includes the default project
  return ["pyshop"]
}
