# CodeLink Backend Integration Guide

This document provides instructions on how to integrate the CodeLink frontend with a Python backend.

## Overview

CodeLink is designed to visualize code changes, explanations, unit tests, and impact analysis. The frontend is built with Next.js and expects specific API endpoints to fetch data.

## API Endpoints

The frontend expects the following API endpoints:

### 1. Fetch Branches and Commits

**Endpoint:** `/api/branches`
**Method:** GET
**Response:**

```json
{
  "branches": [
    {
      "name": "main",
      "commits": [
        {
          "id": "a1b2c3d",
          "message": "Update README with deployment instructions",
          "author": "Maria Garcia",
          "date": "2023-11-15T14:32:00Z",
          "avatar": "/path/to/avatar.jpg"
        },
        // More commits...
      ]
    },
    // More branches...
  ]
}
