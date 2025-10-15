# Pre-production System Test Guide

## Overview

This document provides instructions for testing the pre-production system. The system has been updated to fix several issues with the API integration and data rendering. These tests will verify that the system works correctly without any fallbacks or workarounds.

## Prerequisites

1. Make sure the development server is running:
   ```
   npm run dev
   ```

2. Make sure your `.env.local` file contains both server-side and client-side environment variables:
   - `AZURE_OPENAI_API_KEY` for server-side API calls
   - `NEXT_PUBLIC_AZURE_OPENAI_API_KEY` for client-side API calls
   - All other required variables for both prefixes

## Test 1: Direct API Calls

This test verifies that the API endpoints respond correctly with valid data structures.

1. Open `test-preproduction-api.html` in your browser
2. Click "Save Story Bible & Episodes" to set up basic data
3. Test each content type individually:
   - Click "Test Script", "Test Storyboard", etc.
   - Verify that each API call succeeds
4. Test all content types at once:
   - Click "Test All Content Types"
   - Verify that all API calls succeed
5. Navigate to the Pre-production Results page:
   - Click "Go To Pre-Production Results"
   - Verify that all content is displayed correctly

## Test 2: Response Structure Validation

This test ensures that the API response structure matches what the front-end components expect.

1. Open `test-direct-preproduction.html` in your browser
2. Test individual content types:
   - Click buttons for each content type
   - Check that both "API Success" and "Structure Valid" show as successful
3. Test all content types at once:
   - Click "Test All Content Types"
   - Verify all content types show both successes

## Test 3: Pre-production Access Test

This test verifies that the pre-production pages can be accessed with proper data.

1. Open `test-access.html` in your browser
2. Click "Set Up Test Data" to initialize localStorage with test data
3. Click "Go to Pre-production Results"
4. Verify that all tabs display content correctly:
   - Script tab shows screenplay content
   - Storyboard tab shows storyboard frames
   - Casting tab shows character descriptions
   - Props tab shows prop lists
   - Location tab shows location guides
   - Marketing tab shows marketing hooks
   - Post-Production tab shows post-production notes

## Fixing Common Issues

If you encounter issues during testing, check the following:

1. **Environment Variables**:
   - Make sure both `AZURE_OPENAI_*` and `NEXT_PUBLIC_AZURE_OPENAI_*` variables are set
   - Verify the API keys are valid

2. **API Endpoints**:
   - Check the browser console for API errors
   - Verify the Azure OpenAI endpoint is correctly configured

3. **Data Structure Issues**:
   - If content doesn't display, check the structure against the expected format in `test-direct-preproduction.js`
   - Ensure the API is returning data in the correct format

4. **LocalStorage Data**:
   - Clear localStorage if you see inconsistent behavior
   - Use the test HTML pages to set up fresh test data

## Detailed Component Requirements

Each content type requires specific data structures:

1. **Script**:
   - Must include `episodes` array with `episodeNumber`, `episodeTitle`, and `scenes`
   - Each scene must have `sceneNumber` and `screenplay`

2. **Storyboard**:
   - Must include `episodes` array with `episodeNumber`, `episodeTitle`, and `scenes`
   - Each scene must have `sceneNumber` and `storyboard`
   - Must include `visualStyle` with `description` and `cinematicReferences`

3. **Casting**:
   - Must include `characters` array with `name` and `description`
   - Must include `arcIndex` and `format`

4. **Props**:
   - Must include `episodes` array with `episodeNumber`, `episodeTitle`, and `props`
   - Must include `format`

5. **Location**:
   - Must include `episodes` array with `episodeNumber`, `episodeTitle`, and `locations`
   - Must include `format`

6. **Marketing**:
   - Must include `episodes` array with `episodeNumber`, `episodeTitle`, `marketingHooks`, and `hashtags`
   - Must include `totalEpisodes` and `format`

7. **Post-Production**:
   - Must include `episodes` array with `episodeNumber`, `episodeTitle`, and `scenes`
   - Each scene must have `sceneNumber`, `sceneTitle`, and `notes`
   - Must include `totalScenes` and `format`

## API Response Format

The API should return data in the following format:

```json
{
  "success": true,
  "preProduction": {
    "script": { /* script data */ },
    "storyboard": { /* storyboard data */ },
    "props": { /* props data */ },
    "casting": { /* casting data */ },
    "location": { /* location data */ },
    "marketing": { /* marketing data */ },
    "postProduction": { /* post-production data */ }
  },
  "episodesProcessed": 1,
  "scenesProcessed": 2,
  "version": "V2",
  "generationType": "engine-enhanced-professional",
  "generationTime": 123,
  "quality": "comprehensive-v2"
}
```

## LocalStorage Data Structure

The system looks for data in the following localStorage keys:

1. `reeled-story-bible` or `scorched-story-bible`
   - Contains basic story information

2. `reeled-episodes` or `scorched-episodes`
   - Contains episode data with scenes

3. `reeled-preproduction-${arcIndex}` or `scorched-preproduction-${arcIndex}`
   - Contains all content types for a specific arc
   - Arc index is usually 0 for the first arc

4. `reeled-preproduction-content` or `scorched-preproduction-content`
   - Contains a collection of content by type and arc
   - Keys are formatted as `arc${arcIndex}-${contentType}`

