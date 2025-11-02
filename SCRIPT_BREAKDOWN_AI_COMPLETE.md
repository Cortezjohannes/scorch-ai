# Script Breakdown AI Generation - Implementation Complete ✅

## Summary

Successfully implemented AI-powered Script Breakdown generation that analyzes Hollywood-grade screenplays and produces micro-budget focused production breakdowns.

**Status:** ✅ **READY FOR TESTING**

---

## What Was Built

### 1. AI Generator Service ✅
**File:** `src/services/ai-generators/script-breakdown-generator.ts`

**Features:**
- Parses `GeneratedScript` structure from Scripts tab
- Extracts scenes from screenplay with full context
- Uses EngineAIRouter with Gemini 2.5 Pro (temperature: 0.6)
- Generates micro-budget focused breakdown ($1k-$20k range)

**Analysis Per Scene:**
- Cast with line counts and importance (lead/supporting/background)
- Props with source (buy/rent/borrow/actor-owned) and costs
- Locations (INT/EXT) and time of day
- Special equipment requirements
- Estimated shoot time (based on 1 page = 1 minute + setup)
- Budget impact ($50-$1000 per scene)
- Production notes

**Key Functions:**
- `generateScriptBreakdown()` - Main entry point
- `parseScriptToScenes()` - Extract scenes from GeneratedScript
- `buildSystemPrompt()` - Strict rules for micro-budget extraction
- `buildUserPrompt()` - Context with screenplay content
- `structureBreakdownData()` - Parse JSON into TypeScript types
- Validation helpers for all enum fields

### 2. API Route ✅
**File:** `src/app/api/generate/script-breakdown/route.ts`

**Endpoint:** `POST /api/generate/script-breakdown`

**Request Body:**
```typescript
{
  preProductionId: string
  storyBibleId: string
  episodeNumber: number
  userId: string
  scriptData: GeneratedScript  // from Scripts tab
  storyBibleData: StoryBible
}
```

**Response:**
```typescript
{
  success: boolean
  breakdown: ScriptBreakdownData
  preProductionId: string
  message: string
}
```

**Error Handling:**
- Validates script data exists (400 if missing)
- Validates story bible data
- Returns detailed error messages
- Budget range validation warnings

### 3. ScriptBreakdownTab Component ✅
**File:** `src/components/preproduction/tabs/ScriptBreakdownTab.tsx`

**New Features:**
- State management for generation process
- `handleGenerateBreakdown()` function
- Smart empty state UI:
  - Shows "Generate Script First" if no script exists (disabled button)
  - Shows "Generate Script Breakdown" if script exists
  - Displays loading spinner during generation
  - Shows error messages with retry capability
- Client-side data fetching (with auth context)
- Firestore save after generation

**UI States:**
1. **No Script:** Disabled state with explanation
2. **Script Ready:** Green button to generate
3. **Generating:** Loading spinner + "Analyzing Screenplay..."
4. **Error:** Red error message with retry
5. **Complete:** Full breakdown table/cards view

---

## Data Flow

```
Scripts Tab
  ↓ (has GeneratedScript?)
Script Breakdown Tab
  ↓ (user clicks "Generate Script Breakdown")
Client fetches story bible
  ↓
API Route validates data
  ↓
script-breakdown-generator.ts
  ↓ parseScriptToScenes()
Extract scenes from screenplay
  ↓ buildSystemPrompt() + buildUserPrompt()
AI analyzes with Gemini 2.5 Pro
  ↓ structureBreakdownData()
Parse JSON into TypeScript types
  ↓
Return to API
  ↓
Return to Client
  ↓
Client saves to Firestore
  ↓
Real-time sync updates UI
```

---

## AI Prompt Strategy

### System Prompt (Strict Rules)
- **Role:** Professional production coordinator for micro-budget web series
- **Extract ONLY** - No invention of props, characters, locations
- **Micro-budget focus** - $1k-$20k total episode budget
- **Realistic costs** - Simple scenes $50-$200, complex $500-$1000
- **Character analysis** - Line counts, importance classification
- **Prop sourcing** - Buy/rent/borrow/actor-owned with realistic costs
- **Time estimation** - 1 page = 15-30 minutes shoot time
- **Equipment** - Only if scene clearly requires it

### User Prompt (Context)
- Full screenplay text (all pages and elements)
- Series information (title, genre, budget range)
- Scene-by-scene content with context
- Detailed output format specification (JSON structure)
- Examples of expected output

### AI Output Format
```json
[
  {
    "sceneNumber": 1,
    "sceneTitle": "Jason's Penthouse - Morning",
    "location": "INT. JASON'S PENTHOUSE",
    "timeOfDay": "DAY",
    "estimatedShootTime": 20,
    "characters": [
      {"name": "JASON", "lineCount": 5, "importance": "lead"}
    ],
    "props": [
      {"item": "Whiskey tumbler", "importance": "hero", "source": "buy", "estimatedCost": 15}
    ],
    "specialRequirements": ["Natural light from windows"],
    "budgetImpact": 150,
    "notes": "Simple dialogue scene, natural lighting"
  }
]
```

---

## Budget Guidelines

**Per Scene:**
- Simple dialogue: $50-$200
- With props/location: $200-$500
- Complex with equipment: $500-$1000

**Total Episode:**
- Target: $1,000 - $20,000
- Warnings if outside range
- Realistic for indie web series

**Cost Breakdown:**
- Location fees (or savings if actor's space)
- Prop purchases/rentals
- Equipment rentals (stabilizer, lights, etc.)
- Setup and shoot time considerations

---

## Integration Points

### Dependencies
✅ **Scripts Tab** - Must have `GeneratedScript` data
✅ **Story Bible** - Used for series context
✅ **EngineAIRouter** - Gemini 2.5 Pro for analysis
✅ **Firestore** - Data persistence and sync

### Data Structure
✅ **ScriptBreakdownData** - Top-level structure with totals
✅ **ScriptBreakdownScene** - Per-scene analysis
✅ **ScriptBreakdownCharacter** - Cast info with line counts
✅ **ScriptBreakdownProp** - Props with sourcing and costs

### Future Potential
- Breakdown data CAN be referenced by other tabs
- Could auto-populate Locations, Props, Equipment tabs
- Currently decoupled for flexibility

---

## Testing Guide

### Prerequisites
1. ✅ Dev server running (`npm run dev`)
2. ✅ User authenticated
3. ✅ Story bible created
4. ✅ Episode generated
5. ✅ Script generated (Scripts tab)

### Test Steps

#### 1. Test Empty State (No Script)
1. Navigate to Pre-Production page
2. Go to Script Breakdown tab
3. **Expected:** "Generate Script First" button (disabled)
4. **Message:** "Please generate a script first..."

#### 2. Generate Script First
1. Go to Scripts tab
2. Click "Generate Hollywood-Grade Script"
3. Wait for generation (~30 seconds)
4. **Expected:** Script displays with pages, scenes, characters

#### 3. Generate Breakdown
1. Go back to Script Breakdown tab
2. **Expected:** "Generate Script Breakdown" button (enabled)
3. **Message:** "Analyze your screenplay and generate..."
4. Click button
5. **Expected:** 
   - Loading spinner
   - "Analyzing Screenplay..." text
   - Console logs showing progress
6. Wait for generation (~10-20 seconds)

#### 4. Verify Breakdown Data
**Check Console Logs:**
```
📋 Generating script breakdown...
✅ Script data found
📖 Fetching story bible...
✅ Story bible loaded
🤖 Calling breakdown generation API...
📋 Script Breakdown Generation API called
✅ Script data received
🤖 Generating script breakdown with AI...
✅ Breakdown generated successfully!
  Scenes analyzed: X
  Total shoot time: X minutes
  Total budget: $X
💾 Saving breakdown to Firestore...
✅ Breakdown saved!
```

**Check UI:**
- Stats cards show: Total Scenes, Est. Shoot Time, Total Budget, Completed Scenes
- Table/Cards view available
- All scenes listed with:
  - Scene number and title
  - Location and time of day
  - Characters with line counts
  - Props listed
  - Budget impact
  - Shoot time
  - Status badges

#### 5. Verify Data Quality
**Characters:**
- ✅ Match screenplay (no extra characters)
- ✅ Line counts seem reasonable
- ✅ Importance classifications correct (lead/supporting/background)

**Props:**
- ✅ Only items mentioned in script
- ✅ Source makes sense (buy/rent/borrow)
- ✅ Costs are realistic for indie budget
- ✅ Importance classifications correct

**Locations:**
- ✅ Match slug lines exactly
- ✅ INT/EXT correct
- ✅ Time of day correct (DAY/NIGHT/etc)

**Budget:**
- ✅ Total within $1k-$20k range
- ✅ Per-scene costs realistic
- ✅ Simple scenes cheaper than complex

**Shoot Time:**
- ✅ Based on page count
- ✅ Complex scenes get more time
- ✅ Total time seems reasonable (60-180 minutes typical)

#### 6. Test Editing
1. Click on editable fields (scene title, location, budget, etc.)
2. Make changes
3. **Expected:** Changes save to Firestore
4. Refresh page
5. **Expected:** Changes persist

#### 7. Test Export
1. Click "Export CSV" button
2. **Expected:** CSV file downloads with all scene data

#### 8. Test Error Handling
**No Script Error:**
1. Start fresh (no script generated)
2. Try to generate breakdown
3. **Expected:** "Please generate script first" message

**Network Error:**
1. Disconnect internet (or block API)
2. Try to generate breakdown
3. **Expected:** Error message displays
4. Button remains clickable for retry

---

## Success Criteria

✅ **Performance**
- Breakdown generation completes in < 30 seconds
- No hanging or timeout issues
- Responsive UI during generation

✅ **Data Accuracy**
- All scenes from script included
- Character names match screenplay
- Props extracted from script only
- No invented elements

✅ **Budget Realism**
- Total within $1k-$20k range
- Per-scene costs appropriate
- Simple vs complex scenes differentiated

✅ **User Experience**
- Clear dependency messaging (need script first)
- Loading states with progress indication
- Error messages helpful and actionable
- Data saves reliably to Firestore

✅ **Data Structure**
- Matches TypeScript types exactly
- All required fields present
- Enums validated correctly
- Totals calculated accurately

---

## Next Steps

1. **Test the implementation:**
   ```bash
   # Server should already be running
   # Navigate to: http://localhost:3000
   ```

2. **Test flow:**
   - Login → Story Bible → Episode → Pre-Production
   - Scripts tab → Generate Script
   - Script Breakdown tab → Generate Breakdown
   - Verify data quality

3. **If successful, move to next tab:**
   - 10 more tabs to implement AI generation
   - Follow same pattern (service + API + UI)
   - One at a time for quality focus

---

## Files Created/Modified

### New Files (2)
- ✅ `src/services/ai-generators/script-breakdown-generator.ts` (484 lines)
- ✅ `src/app/api/generate/script-breakdown/route.ts` (95 lines)

### Modified Files (1)
- ✅ `src/components/preproduction/tabs/ScriptBreakdownTab.tsx` (added generation logic)

### Reference Files
- `src/services/ai-generators/script-generator.ts` (pattern followed)
- `src/app/api/generate/scripts/route.ts` (API structure)
- `src/types/preproduction.ts` (TypeScript types)

---

## Architecture Highlights

**✅ Clean Separation of Concerns**
- Generator: Pure AI logic, no Firebase/UI dependencies
- API Route: Validation and orchestration
- Component: UI state and Firebase integration

**✅ Error Handling**
- Validation at every step
- Detailed error messages
- Graceful degradation

**✅ Type Safety**
- Full TypeScript throughout
- Enum validation helpers
- Structured data parsing

**✅ Performance**
- Efficient scene parsing
- Optimized AI prompts
- Client-side auth (no server-side Firebase issues)

**✅ User Experience**
- Smart dependency detection
- Clear loading states
- Helpful error messages
- Auto-save to Firestore

---

## Ready to Test! 🚀

The Script Breakdown AI generation is fully implemented and ready for browser testing. Test with the "Diamond Hands" story or any other generated episode to verify the breakdown analysis is accurate and micro-budget focused.


