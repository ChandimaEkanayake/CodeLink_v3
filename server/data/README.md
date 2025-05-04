# CodeLink Data Directory

This directory contains project-based JSON data files for the CodeLink application.

## Structure

- `[project_name]/`: Directory for each project (e.g., "pyshop")
  - `branches.json`: Repository branches and commits
  - `file-changes.json`: Code changes for each commit
  - `explanations.json`: Feature explanations for each change
  - `unit-tests.json`: Unit tests for each change
  - `impacts.json`: Code impacts for each change
  - `test-state.json`: Test status for branches, commits, and changes
  - `deep-dive-analysis.json`: Detailed technical analysis for impacts

## Adding a New Project

To add a new project:

1. Create a new directory with the project name
2. Add the required JSON files with the appropriate structure
3. Update the `getCurrentProject()` function in `server/utils.ts` to return the new project name

## Updating Data

To update the data:

1. Edit the corresponding JSON file in the project directory
2. The changes will be reflected in the application immediately (may require a page refresh)

For production use, it's recommended to replace these JSON files with a proper database.
