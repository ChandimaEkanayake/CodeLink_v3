# PyShop Project Data

This directory contains the JSON data files for the PyShop project.

## Files

- `branches.json`: Repository branches and commits
- `file-changes.json`: Code changes for each commit
- `explanations.json`: Feature explanations for each change
- `unit-tests.json`: Unit tests for each change
- `impacts.json`: Code impacts for each change
- `test-state.json`: Test status for branches, commits, and changes
- `deep-dive-analysis.json`: Detailed technical analysis for impacts

## Structure

Each JSON file follows a specific structure that matches the TypeScript types defined in `/lib/types.ts`.

## Updating

To update the data:

1. Edit the corresponding JSON file in this directory
2. The changes will be reflected in the application immediately (may require a page refresh)

For production use, it's recommended to replace these JSON files with a proper database.
\`\`\`

Let's delete the old JSON files that are no longer needed:
