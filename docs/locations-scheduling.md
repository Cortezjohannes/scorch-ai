# Locations → Scheduling Provision

### Purpose
Document how selected real-world locations flow into scheduling so we can wire it up next.

### Data we now have (Production Assistant / Arc)
- `ArcLocationsData.locationGroups[]` with:
  - `selectedSuggestionId` (auto-picks cheapest if none)
  - `shootingLocationSuggestions[]` (costs, permit, deposit, insurance, sourcing, address/search)
  - `episodesUsed`, `scenesUsed`, `timeOfDay`, `confidence`, `status`
- `costRollup` (per-location dayRate + permit + deposit + insurance flag, plus arcTotal)

### Intended scheduling inputs
For each scheduled day/scene:
- `locationId` → chosen location group `canonicalLocationId`
- `venueId` → `selectedSuggestionId`
- `address / sourcing` → from selected suggestion
- `cost` → from `costRollup.perLocation` (dayRate + permit + deposit)
- `permitRequired`, `insuranceRequired` → selected suggestion/logistics
- `timeOfDay` hints → `timeOfDay` on location group (for call sheets / daylight planning)

### Flow to implement
1) When schedule generation runs, load `ArcLocationsData`:
   - Pick `selectedSuggestionId`; if missing, use cheapest.
   - Map scenes by `episodeUsage.sceneNumbers` to assign location.
2) Compute per-day cost estimate:
   - Use `dayRate` + `permitCost` + `depositAmount`; flag `insuranceRequired`.
3) Populate schedule generator prompt/context:
   - Include selected venue name, address/area, sourcing, logistics (parking/power/restrooms/permit).
   - Prefer grouping scenes by identical `canonicalLocationId` to reduce company moves.
4) Persist on schedule:
   - Store `locationId`, `venueId`, `address`, `sourcing`, `permitRequired`, `insuranceRequired` per shooting day block.
5) UI:
   - Show selected venue on schedule days; warn if no selection; highlight permit/insurance flags.

### Notes
- Backward-compatible: if no `ArcLocationsData`, fall back to legacy episode locations.
- Confidence < 50% should prompt user verification before locking schedules.

