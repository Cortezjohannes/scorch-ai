# Locations Tab Integration with Schedule Generation

## Overview
Integrate the Locations tab (ArcLocationsData) into schedule generation to use real-world venue names, addresses, logistics, and cost data. Ensure Locations are generated before Schedule in all workflows.

## Requirements

### 1. Generation Order Enforcement
- **Locations must be generated before Schedule** in all generation workflows
- Add validation in schedule generation API to check for Locations data
- Update regeneration service to enforce order (already correct, but add validation)
- Add UI warnings if schedule is generated without locations

### 2. Locations Data Integration
- Use `ArcLocationsData.locationGroups[]` as the source of truth for location names
- Map scenes to location groups via `episodeUsage.sceneNumbers`
- Use `selectedSuggestionId` (or cheapest if none) to get venue details
- Extract venue name, address, logistics (parking/power/restrooms), permit/insurance flags
- Use `timeOfDay` from location groups for exterior scheduling

### 3. Schedule Generator Updates
- Update `generateSchedule()` to accept `ArcLocationsData` (arc-level) in addition to episode-level locations
- Create location mapping function: breakdown scenes → location groups → selected venues
- Enhance prompts with real venue names, addresses, logistics
- Use canonical location IDs for grouping (reduce company moves)
- Include cost estimates per day from `costRollup.perLocation`

### 4. Schedule Data Structure
- Add location metadata to `ShootingDay`:
  - `locationId` (canonical location group ID)
  - `venueId` (selected suggestion ID)
  - `venueAddress` (from selected suggestion)
  - `venueName` (from selected suggestion)
  - `permitRequired` (boolean)
  - `insuranceRequired` (boolean)
  - `locationCost` (dayRate + permit + deposit)
- Preserve backward compatibility if no Locations data exists

### 5. Validation & Warnings
- Validate that Locations tab has been generated before Schedule
- Warn if scenes don't match any location groups
- Warn if location groups have no selected venue
- Show permit/insurance flags in schedule UI

## Implementation Details

### Files to Modify

#### 1. `src/services/ai-generators/schedule-generator.ts`
- **Update `ScheduleGenerationParams` interface**: Add `arcLocationsData?: ArcLocationsData`
- **Create `mapScenesToLocationGroups()` function**: 
  - Match breakdown scenes to `ArcLocationGroup` via `episodeUsage.sceneNumbers`
  - Return mapping: `scene → locationGroup → selectedVenue`
- **Create `getSelectedVenue()` function**:
  - Use `selectedSuggestionId` or pick cheapest from `shootingLocationSuggestions[]`
  - Extract venue name, address, logistics, permit/insurance flags
- **Update `buildUserPrompt()`**:
  - Include real venue names instead of generic location names
  - Add venue addresses, logistics (parking/power/restrooms)
  - Include permit/insurance requirements
  - Use `timeOfDay` from location groups for exterior scenes
- **Update `buildFallbackSchedule()`**:
  - Use location group canonical IDs for grouping
  - Use selected venue names in day labels
  - Include location metadata in ShootingDay objects

#### 2. `src/app/api/generate/schedule/route.ts`
- **Add validation**: Check for `arcLocationsData` in request body or fetch from Firestore
- **Require Locations**: If `arcLocationsData` is missing, return error: "Locations must be generated before Schedule. Please generate Locations tab first."
- **Pass arcLocationsData**: Include in `generateSchedule()` call
- **Backward compatibility**: Allow schedule generation without Locations (fallback to breakdown location names)

#### 3. `src/services/arc-regeneration-service.ts`
- **Add validation**: Before generating schedule, check if `includeLocations` is true and locations were generated
- **Error handling**: If locations generation fails, skip schedule generation with clear error message
- **Dependency check**: Ensure `results.arcLocations` exists before calling schedule API

#### 4. `src/components/preproduction/tabs/ScheduleRehearsalTab.tsx`
- **Add validation check**: Before allowing schedule generation, check if `arcPreProdData.locations` exists
- **Show warning banner**: If locations not generated, display: "⚠️ Generate Locations tab first for better schedule accuracy with real venue names and logistics"
- **Pass arcLocationsData**: Include in schedule generation API call

#### 5. `src/types/preproduction.ts`
- **Update `ShootingDay` interface**: Add optional location metadata fields:
  ```typescript
  locationId?: string // canonicalLocationId from ArcLocationGroup
  venueId?: string // selectedSuggestionId
  venueName?: string // from selected ShootingLocationSuggestion
  venueAddress?: string // from selected suggestion
  permitRequired?: boolean
  insuranceRequired?: boolean
  locationCost?: number // dayRate + permitCost + depositAmount
  ```

### Location Mapping Logic

```typescript
function mapScenesToLocationGroups(
  breakdownData: Record<number, ScriptBreakdownData>,
  arcLocationsData: ArcLocationsData
): Map<string, {
  locationGroup: ArcLocationGroup
  selectedVenue: ShootingLocationSuggestion
  scenes: Array<{ episodeNumber: number; sceneNumber: number }>
}> {
  // 1. For each location group, find matching scenes via episodeUsage.sceneNumbers
  // 2. Get selected venue (selectedSuggestionId or cheapest)
  // 3. Return mapping: location canonical ID → { group, venue, scenes }
}
```

### Prompt Enhancement

Include in user prompt:
- **Real venue names**: "Coffee Shop → Blue Bottle Coffee (123 Main St, San Francisco)"
- **Logistics**: "Parking: Street parking available. Power: Standard outlets. Restrooms: Yes."
- **Permit/Insurance**: "Permit required: Yes. Insurance required: Yes."
- **Time of day**: Use `timeOfDay` array from location groups for exterior scenes
- **Cost awareness**: "Location cost: $500/day (includes permit)"

## Testing Checklist

- [ ] Schedule generation fails gracefully if Locations not generated
- [ ] Schedule uses real venue names from Locations tab
- [ ] Schedule includes venue addresses and logistics
- [ ] Permit/insurance flags appear in schedule days
- [ ] Location costs are included in schedule metadata
- [ ] Scenes map correctly to location groups
- [ ] Fallback works if Locations data missing (backward compatibility)
- [ ] Regeneration service enforces Locations → Schedule order
- [ ] UI shows warning if schedule generated without locations
- [ ] Schedule day labels use venue names instead of generic names

## Backward Compatibility

- If `arcLocationsData` is not provided, schedule generation falls back to:
  - Using breakdown location names (current behavior)
  - No venue metadata in ShootingDay
  - Generic location names in prompts
- This ensures existing schedules continue to work

## Success Criteria

1. ✅ Schedule generation requires Locations to be generated first (with clear error message)
2. ✅ Schedule uses real venue names, addresses, and logistics from Locations tab
3. ✅ Schedule includes permit/insurance flags and cost estimates
4. ✅ Scenes correctly map to location groups via episodeUsage
5. ✅ Schedule day labels are descriptive (venue names) instead of generic
6. ✅ Backward compatible: works without Locations data (fallback)
7. ✅ UI provides clear warnings and guidance
























