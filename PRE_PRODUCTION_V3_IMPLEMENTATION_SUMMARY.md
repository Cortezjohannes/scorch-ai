# Pre-Production V3 - Implementation Summary

## Overview

Complete rebuild of the pre-production system with focus on micro-budget short-form web series production ($1K-$20K, 3-week shoot, 5-minute episodes).

**Date**: October 29, 2025  
**Status**: Core functionality built, auth persistence issue discovered during testing  
**Authentication**: Auth works on workspace, but doesn't persist when navigating to pre-production page  

---

## ✅ Completed Implementation

### 1. AI Script Generator Service

**File**: `src/services/script-generator.ts`

**Features**:
- Generates Hollywood-grade screenplays from episode content
- Uses structured prompts with episode-specific data
- JSON-based output matching strict TypeScript interfaces
- Multiple helper functions for dialogue enhancement and action lines

**Key Functions**:
```typescript
- generateScreenplay(input): Full episode screenplay generation
- generateSingleScene(sceneInput): Individual scene generation
- enhanceDialogue(dialogue, character, traits): Dialogue improvement
- generateActionLine(description, style): Action line formatting
```

**AI Engine**: Uses Azure OpenAI (GPT-4o) with temperature 0.7

---

### 2. Script Generation API

**File**: `src/app/api/generate/scripts/route.ts`

**Endpoints**:
- `POST /api/generate/scripts`: Generate screenplay from episode data
- `GET /api/generate/scripts?preProductionId=X`: Check if script exists

**Features**:
- Validates required fields (episodeNumber, episodeTitle, scenes, storyBible)
- Generates structured screenplay output
- Saves to Firestore automatically if preProductionId provided
- Returns detailed JSON response with scene count

**Input Schema**:
```json
{
  "episodeNumber": 1,
  "episodeTitle": "Pilot Episode",
  "episodeSynopsis": "Episode description",
  "scenes": [
    {
      "sceneNumber": 1,
      "location": "Coffee Shop",
      "timeOfDay": "DAY",
      "content": "Scene content",
      "characters": ["Sarah", "Mike"]
    }
  ],
  "storyBible": {
    "title": "Series Name",
    "genre": "Drama",
    "characters": [...]
  },
  "userId": "user_id",
  "preProductionId": "preprod_id"
}
```

---

### 3. Scripts Tab UI

**File**: `src/components/preproduction/tabs/ScriptsTab.tsx`

**Features**:
- Two view modes: **Script view** (formatted screenplay) and **Breakdown view** (production analysis)
- Scene-by-scene navigation with filter dropdown
- Industry-standard screenplay formatting:
  - Scene headings (INT./EXT. LOCATION - TIME)
  - Action lines (present tense, visual descriptions)
  - Character names (ALL CAPS)
  - Dialogue (natural flow)
  - Parentheticals (actor direction)
- Inline notes editing per scene
- Collaborative commenting system
- "Generate Scripts" button for empty state
- Loading states with spinner
- Error handling with user-friendly messages

**View Modes**:
1. **Script View**: White background, screenplay formatting, professional layout
2. **Breakdown View**: Production-focused scene analysis

**UI State**:
- `isGenerating`: Shows loading spinner during generation
- `generationError`: Displays error messages
- `expandedScenes`: Tracks which scenes are expanded
- `selectedScene`: Filters to specific scene or shows all

---

### 4. Pre-Production Shell Updates

**File**: `src/components/preproduction/PreProductionShell.tsx`

**Changes**:
- Added "Scripts" tab to navigation (first tab)
- Integrated `ScriptsTab` component into rendering logic
- Updated tab routing to include scripts
- Fixed auth imports (changed from `next-auth` to `useAuth`)

**Updated Tab List**:
```typescript
const TABS = [
  { id: 'scripts', label: 'Scripts', icon: '📝', description: 'Formatted screenplay' },
  { id: 'breakdown', label: 'Script Breakdown', icon: '📋', description: 'Scene analysis' },
  { id: 'schedule', label: 'Schedule', icon: '📅', description: 'Shoot timeline' },
  { id: 'shotlist', label: 'Shot List', icon: '🎬', description: 'Camera shots' },
  { id: 'budget', label: 'Budget', icon: '💰', description: 'Cost tracking' },
  { id: 'locations', label: 'Locations', icon: '📍', description: 'Filming sites' },
  { id: 'props', label: 'Props/Wardrobe', icon: '👗', description: 'Items needed' },
  { id: 'equipment', label: 'Equipment', icon: '🎥', description: 'Gear checklist' },
  { id: 'casting', label: 'Casting', icon: '🎭', description: 'Actor info' },
  { id: 'storyboards', label: 'Storyboards', icon: '🖼️', description: 'Visual plan' },
  { id: 'permits', label: 'Permits', icon: '📄', description: 'Legal docs' },
  { id: 'rehearsal', label: 'Rehearsal', icon: '🎪', description: 'Practice schedule' }
]
```

---

### 5. Auth Integration Fixes

**Files Updated**:
- `src/app/preproduction/page.tsx`
- `src/components/preproduction/PreProductionShell.tsx`

**Changes**:
- Replaced `next-auth/react` with `@/context/AuthContext`
- Changed `useSession()` to `useAuth()`
- Updated user ID access from `session?.user?.id` to `user?.uid`
- Updated user name access from `session?.user?.name` to `user?.displayName || user?.email`
- Fixed all auth state checks for consistency

**Before**:
```typescript
const { data: session, status } = useSession()
if (status === 'loading') return
if (!session?.user) redirect()
```

**After**:
```typescript
const { user, loading: authLoading } = useAuth()
if (authLoading) return
if (!user) redirect()
```

---

## 📋 Tab Implementation Status

| Tab | Status | Files | Notes |
|-----|--------|-------|-------|
| Scripts | ✅ Built | `ScriptsTab.tsx` + API + Service | Industry-standard screenplay formatting |
| Script Breakdown | ✅ Built | `ScriptBreakdownTab.tsx` | Scene-by-scene production analysis |
| Shooting Schedule | ✅ Built | `ShootingScheduleTab.tsx` | Calendar + list views, drag-drop |
| Shot List | ✅ Built | `ShotListTab.tsx` | Collapsible scenes, checkboxes |
| Budget Tracker | ✅ Built | `BudgetTrackerTab.tsx` | Real-time calculations, CSV export |
| Locations | ⏸️ Pending | - | Card/table hybrid, image upload |
| Props & Wardrobe | ⏸️ Pending | - | Procurement tracking |
| Equipment | ⏸️ Pending | - | Rental/ownership tracking |
| Casting | ⏸️ Pending | - | Actor profiles, availability |
| Storyboards | ⏸️ Pending | - | Visual grid, AI image generation |
| Permits | ⏸️ Pending | - | Document upload, checklist |
| Rehearsal | ⏸️ Pending | - | Optional scheduling |

---

## 🐛 Known Issues

### Critical: Auth Persistence

**Issue**: User authentication works on workspace page but doesn't persist when navigating to `/preproduction`

**Symptoms**:
- Workspace shows: `Auth state: authenticated (johannes@thegreenlitstudios.com)`
- Pre-production page shows: `Using mock auth implementation (not authenticated by default)`
- Page redirects to `/auth/signin` immediately
- 404 errors on signin page

**Affected Files**:
- `src/app/preproduction/page.tsx`
- `src/context/AuthContext.tsx` (likely)

**Logs**:
```
[LOG] 👤 Auth state: authenticated (johannes@thegreenlitstudios.com) // workspace
[LOG] Using mock auth implementation (not authenticated by default) // preproduction
```

**Hypothesis**:
1. AuthContext may not be properly initialized on preproduction page
2. Auth state might not be in React context tree for pre-production route
3. Firestore connection errors may be preventing auth state check
4. Page component may be checking auth before context fully loads

**Next Steps**:
1. Verify AuthContext Provider wraps pre-production route in `layout.tsx`
2. Add proper loading states while auth initializes
3. Check if Firestore connection issues affect auth state
4. Consider using Next.js middleware for auth checking

---

## 🧪 Testing Results

### Browser Testing Setup

**Environment**:
- Development server: `http://localhost:3000`
- Browser: Playwright automation
- User: `johannes@thegreenlitstudios.com` (authenticated)
- Story Bible: `bible_zero_state` (Test Series)
- Episode: Episode 1 "Pilot Episode" (3 scenes, recovered from localStorage)

### Test Actions Performed

✅ **Successfully Tested**:
1. Navigated to landing page
2. Clicked Login button
3. Navigated to workspace
4. Recovered Episode 1 from localStorage to Firestore
5. Verified episode appeared with pre-production status
6. Viewed episode details

❌ **Failed Tests**:
1. Navigation to `/preproduction` page
   - Redirected to `/auth/signin` (404)
   - Auth state not detected

### What We Confirmed Works

1. **AuthContext** works on workspace page
2. **Firebase/Firestore** initialization successful
3. **Episode recovery** from localStorage to Firestore works
4. **Pre-production metadata** preserved (🎬 1/1 Pre-Production indicator)
5. **Build compilation** successful (no TypeScript errors)
6. **Import fixes** resolved (`useAuth` instead of `next-auth`)

---

## 📝 Scripts Tab - Detailed Specification

### Screenplay Formatting Rules

Based on industry-standard screenplay format:

1. **Scene Headings**:
   - Format: `INT./EXT. LOCATION - TIME`
   - Always uppercase
   - Example: `INT. COFFEE SHOP - DAY`

2. **Action Lines**:
   - Present tense
   - Visual descriptions only (what camera sees)
   - Short paragraphs (2-4 lines)
   - Example: "Sarah checks her phone nervously. Her leg bounces under the table."

3. **Character Names**:
   - ALL CAPS
   - Centered on first appearance with (age, trait)
   - Example: `SARAH (28, determined, wearing business casual)`

4. **Dialogue**:
   - Character name in ALL CAPS
   - Dialogue indented, natural flow
   - Parentheticals for actor direction: `(without looking up)`

5. **Visual Styling**:
   - White background for script view (mimics paper)
   - Monospace font for authentic screenplay look
   - Proper margins and spacing
   - Black text on white for readability

### AI Generation Prompt Structure

**System Prompt**:
```
You are a professional screenwriter specializing in short-form web series.
Transform episode outlines into properly formatted, Hollywood-grade screenplays.

FORMATTING RULES: [scene headings, action lines, character names, dialogue, parentheticals]
CONTENT RULES: [use only provided narrative, expand dialogue naturally, add visual action]
5-MINUTE EPISODE SPECIFICS: [600-800 words, 4-6 pages, tight pacing]

OUTPUT FORMAT: Return valid JSON matching the schema.
```

**User Prompt Template**:
```
EPISODE INFO: [title, synopsis, genre, series]
CHARACTERS: [name, age, description, traits]
SCENES TO WRITE: [scene number, location, time, characters, content]

TASK: Transform into properly formatted screenplay with:
- Scene headings in correct format
- Rich action lines (present tense, visual)
- Expanded dialogue that flows naturally
- Character introductions on first appearance
- Parentheticals for actor direction
- Natural blocking and reactions

CONSTRAINTS:
- Total length: 600-800 words
- Use ONLY the characters listed
- Use ONLY the locations provided
- Keep the same plot/narrative
- Expand dialogue to be conversational
- Add visual descriptions
- Character-specific dialogue voices
```

---

## 🏗️ Architecture

### Data Flow

```
Episode Content (Workspace)
    ↓
User clicks "Generate Scripts"
    ↓
ScriptsTab.tsx → /api/generate/scripts (POST)
    ↓
script-generator.ts → Azure OpenAI (GPT-4o)
    ↓
Structured JSON Response
    ↓
Save to Firestore (preproduction-firestore.ts)
    ↓
Real-time update via Firestore subscription
    ↓
ScriptsTab re-renders with formatted screenplay
```

### File Structure

```
src/
├── services/
│   ├── script-generator.ts (NEW) ✅
│   └── preproduction-firestore.ts (existing)
├── app/api/generate/scripts/
│   └── route.ts (NEW) ✅
├── components/preproduction/
│   ├── PreProductionShell.tsx (UPDATED) ✅
│   ├── tabs/
│   │   ├── ScriptsTab.tsx (NEW) ✅
│   │   ├── ScriptBreakdownTab.tsx (existing)
│   │   ├── ShootingScheduleTab.tsx (existing)
│   │   ├── ShotListTab.tsx (existing)
│   │   └── BudgetTrackerTab.tsx (existing)
│   └── shared/
│       ├── EditableField.tsx (existing)
│       ├── CollaborativeNotes.tsx (existing)
│       └── ExportToolbar.tsx (existing)
└── app/preproduction/
    └── page.tsx (UPDATED) ✅
```

---

## 🎯 Next Steps

### Priority 1: Fix Auth Persistence (CRITICAL)

1. **Investigate AuthContext**:
   - Check if `AuthProvider` wraps `/preproduction` route
   - Verify context initialization timing
   - Add debug logs to track auth state changes

2. **Add Proper Loading States**:
   - Don't redirect until auth fully initialized
   - Show loading spinner while checking auth
   - Handle race conditions

3. **Verify Firestore Connection**:
   - Check if Firestore errors prevent auth check
   - Add connection state monitoring
   - Graceful degradation if Firestore unavailable

4. **Test Auth Fix**:
   - Navigate from workspace to pre-production
   - Verify user state persists
   - Confirm no redirects occur
   - Test page refresh (should stay authenticated)

### Priority 2: Complete Testing

Once auth is fixed:

1. **Test Script Generation**:
   - Click "Generate Scripts" button
   - Verify API call succeeds
   - Check Firestore save
   - Confirm UI updates with screenplay

2. **Test Script UI**:
   - View formatted screenplay
   - Switch between Script/Breakdown views
   - Filter by specific scenes
   - Add scene notes
   - Add comments
   - Test Export toolbar

3. **Test Other Tabs**:
   - Script Breakdown (table view, inline editing)
   - Shooting Schedule (calendar, drag-drop)
   - Shot List (checkboxes, expand/collapse)
   - Budget Tracker (calculations, CSV export)

### Priority 3: Build Remaining Tabs

Continue implementation plan:

1. **Locations Tab** (card/table hybrid)
2. **Props & Wardrobe Tab** (procurement tracking)
3. **Equipment Tab** (rental tracking)
4. **Casting Tab** (actor profiles)
5. **Storyboards Tab** (AI image generation)
6. **Permits Tab** (document upload)
7. **Rehearsal Tab** (optional)

### Priority 4: Enhance AI Generation

1. **Episode-Specific Content**:
   - Pull actual scene content from workspace episode
   - Extract real character names from story bible
   - Use actual locations from episode
   - Calculate realistic shoot times based on scene complexity

2. **Budget-Conscious Suggestions**:
   - Detect budget tier ($1K vs $10K vs $20K)
   - Adjust recommendations accordingly
   - Free location alternatives
   - DIY equipment suggestions

3. **Structured Output Validation**:
   - Validate JSON schema on response
   - Handle malformed AI output gracefully
   - Retry with adjusted prompts if needed

---

## 📚 Resources

### Screenplay Formatting References

- **Industry Standard**: Courier 12pt font, 1.5" left margin, 1" right margin
- **Page Count**: 1 page ≈ 1 minute screen time
- **Scene Headings**: INT./EXT. + LOCATION + TIME (DAY/NIGHT/SUNRISE/SUNSET/CONTINUOUS)
- **Character Introduction**: NAME (age, brief description) on first appearance
- **Dialogue Rules**: Character name centered, dialogue indented, parentheticals sparingly

### Micro-Budget Production References

- **Budget Tiers**: 
  - Ultra-low ($1K-$3K): Smartphone, natural light, minimal crew
  - Low ($3K-$10K): DSLR, basic lighting, small crew
  - Moderate ($10K-$20K): Cinema camera, full lighting kit, professional crew

- **Timeline**: 3-week shoot for 5-minute episode
  - Week 1: Pre-production finalization, rehearsals
  - Week 2: Principal photography
  - Week 3: Pickups, B-roll, wrap

- **Crew Minimums**:
  - Ultra-low: Actor-director + 1 camera operator
  - Low: Director, DP, sound person, 1-2 PAs
  - Moderate: Full crew (AD, gaffer, grip, sound mixer, script supervisor)

---

## ✨ Key Achievements

1. **✅ Built complete AI script generation system**
   - Service layer with multiple helper functions
   - API endpoint with validation and Firestore integration
   - Structured prompts optimized for short-form content

2. **✅ Created industry-standard Scripts tab**
   - Hollywood-grade screenplay formatting
   - Dual view modes (Script/Breakdown)
   - Collaborative features (notes, comments)
   - Professional visual design

3. **✅ Fixed authentication imports**
   - Migrated from `next-auth` to `useAuth`
   - Updated all user state references
   - Consistent auth checking across components

4. **✅ Extended tab navigation**
   - Added Scripts as primary tab
   - Updated routing logic
   - Integrated with existing shell architecture

5. **✅ Maintained code quality**
   - No linting errors
   - TypeScript type safety
   - Comprehensive error handling
   - Loading states and user feedback

---

## 📊 Code Statistics

**Files Created**: 2
- `src/services/script-generator.ts` (285 lines)
- `src/app/api/generate/scripts/route.ts` (112 lines)

**Files Updated**: 3
- `src/components/preproduction/tabs/ScriptsTab.tsx` (complete rewrite)
- `src/app/preproduction/page.tsx` (auth integration)
- `src/components/preproduction/PreProductionShell.tsx` (tab integration + auth)

**Total Lines of Code**: ~600 lines

**No Linting Errors**: ✅

---

## 🔗 Related Documents

- `/pre-production-complete-rebuild.plan.md` - Original implementation plan
- `PRE_PRODUCTION_REBUILD_PROGRESS.md` - Ongoing progress tracking
- `SCRIPTS_TAB_IMPLEMENTATION.md` - Scripts tab detailed spec

---

**Summary**: Successfully implemented core AI script generation system with industry-standard screenplay formatting. Discovered and documented auth persistence issue that prevents testing of live functionality. Once auth is fixed, system is ready for full testing and continued development of remaining tabs.


