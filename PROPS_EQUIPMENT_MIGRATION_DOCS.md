# Props & Equipment Code Migration Documentation

## Overview
This document preserves the props and equipment code that was removed from Episode Pre-Production and will be migrated to Arc Pre-Production / Production Assistant page.

**Date Created:** December 2024  
**Status:** Code preserved for migration to Arc Pre-Production

---

## Components to Migrate

### 1. PropsWardrobeTab Component
**Location:** `src/components/preproduction/tabs/PropsWardrobeTab.tsx`

**Description:**
- Full-featured tab component for managing props and wardrobe items
- Supports both props and wardrobe categories
- Includes generation via questionnaire system
- Features table view with editable fields
- Tracks procurement status, costs, and responsible persons

**Key Features:**
- Props and Wardrobe categorization
- Status filtering (needed, sourced, obtained, packed)
- Cost tracking and totals
- Character association for wardrobe items
- Scene association for items
- Questionnaire-based AI generation
- Manual item addition
- Comments/collaboration system

**Dependencies:**
- `EditableField` component
- `StatusBadge` component
- `TableView` component
- `QuestionnaireModal` component
- `getStoryBible` service
- `/api/generate/questionnaire` endpoint
- `/api/generate/props-wardrobe` endpoint

**Data Structure:**
```typescript
interface PropsWardrobeData {
  episodeNumber: number
  episodeTitle: string
  totalItems: number
  obtainedItems: number
  totalCost: number
  props: PropItem[]
  wardrobe: PropItem[]
  lastUpdated: number
  updatedBy: string
  questionnaireAnswers?: Record<string, any>
}

interface PropItem {
  id: string
  type: 'prop' | 'wardrobe'
  name: string
  description: string
  scenes: string[]
  importance: 'hero' | 'secondary' | 'background'
  source: 'buy' | 'rent' | 'borrow' | 'actor-owned' | 'diy'
  estimatedCost: number
  procurementStatus: 'needed' | 'sourced' | 'obtained' | 'packed'
  referencePhotos: string[]
  notes: string
  comments: Array<{
    id: string
    userId: string
    userName: string
    content: string
    timestamp: number
  }>
  responsiblePerson?: string
  characterAssociated?: string
  characterName?: string
  quantity?: number
}
```

---

### 2. API Endpoints

#### `/api/generate/questionnaire`
**Purpose:** Generate questionnaire for props/wardrobe customization

**Request Body:**
```typescript
{
  preProductionId: string
  storyBibleId: string
  episodeNumber?: number
  userId: string
  scriptData: any
  breakdownData: any
  storyBibleData: any
  castingData?: any
  questionnaireType: 'props-wardrobe'
}
```

**Response:**
```typescript
{
  questionnaire: Questionnaire
}
```

#### `/api/generate/props-wardrobe`
**Purpose:** Generate props and wardrobe items based on script, breakdown, and questionnaire answers

**Request Body:**
```typescript
{
  preProductionId: string
  storyBibleId: string
  episodeNumber?: number
  userId: string
  scriptData: any
  breakdownData: any
  storyBibleData: any
  questionnaireAnswers?: Record<string, any>
}
```

**Response:**
```typescript
{
  propsWardrobe: PropsWardrobeData
}
```

---

### 3. Pre-Production API Route
**Location:** `src/app/api/generate/preproduction/route.ts`

**Props Generation Step (Step 4):**
```typescript
// STEP 4: PROPS - Generate per episode with ENGINES + IMAGE GENERATION
console.log('👗 Step 4/8: PROPS - Generating props & wardrobe with AI images...');
console.log('   Engines: VisualDesign, WorldBuilding, Production');
console.log('   Images: Generating reference images for key props and costumes');
await updateProgress('Props & Wardrobe', 'Starting props and image generation...', 0, 4);

// 🎨 ENGINE + IMAGE-ENHANCED PROPS GENERATION
const propsEngineOptions = {
  useEngines: false,  // FORCE DISABLE
  engineLevel,
  visualStyle: 'realistic' as const,
  worldBuildingDepth: 'moderate' as const,
  productionReality: 'budget-conscious' as const,
  narrativeIntegration: true,
  generateImages: true,
  imageStyle: 'reference' as const
}

const propsResult = await generateV2Props(
  context,
  preProductionContent.script,
  preProductionContent.storyboard,
  preProductionContent.narrative, 
  updateProgress,
  propsEngineOptions
)
preProductionContent.props = propsResult;
await updateProgress('Props & Wardrobe', 'Props with images generated', 100, 4);
console.log(`✅ PROPS: Generated props for ${propsResult.episodes.length} episodes with AI images`);
```

**Function:** `generateV2Props`
- Located in: `src/services/ai-generators/props-generator.ts` (or similar)
- Generates props and wardrobe items per episode
- Supports engine-based generation
- Includes AI image generation for reference photos

---

### 4. Type Definitions
**Location:** `src/types/preproduction.ts`

**Relevant Types:**
- `PropsWardrobeData`
- `PropItem`
- `PreProductionData` (contains `propsWardrobe` field)

---

## Migration Plan

### Target Location
**Arc Pre-Production / Production Assistant Page**

### Integration Points
1. **Props/Wardrobe Tab** - Add as a new tab in Arc Pre-Production
2. **Equipment Tab** - Create new equipment management (similar structure to props)
3. **Combined View** - Consider combining props, wardrobe, and equipment into a single "Production Items" section

### Key Considerations
1. **Scope Change:** 
   - Episode-level → Arc-level aggregation
   - Need to aggregate props across all episodes in an arc
   - Equipment is typically arc-level (cameras, lighting, etc.)

2. **Data Structure:**
   - Current: Episode-specific props/wardrobe
   - Future: Arc-level with episode breakdown
   - May need to add `episodeNumbers` array to track which episodes use each item

3. **Generation Logic:**
   - Currently generates per-episode
   - Future: Generate for entire arc, then break down by episode
   - Or: Generate per-episode, then aggregate at arc level

4. **Equipment Addition:**
   - Props/Wardrobe focuses on on-screen items
   - Equipment focuses on production gear (cameras, lights, sound, etc.)
   - May need separate EquipmentTab component or combined component

---

## Code Preservation

### Files to Preserve:
1. ✅ `src/components/preproduction/tabs/PropsWardrobeTab.tsx` - Full component preserved
2. ✅ `src/app/api/generate/props-wardrobe/route.ts` - API endpoint (if exists separately)
3. ✅ Props generation logic in `src/app/api/generate/preproduction/route.ts` (Step 4)
4. ✅ Type definitions in `src/types/preproduction.ts`

### Files Modified (Removed from Episode Pre-Production):
1. ✅ `src/components/preproduction/EpisodePreProductionShell.tsx` - Removed props tab
2. ✅ `src/components/PreProductionV2LoadingScreen.tsx` - Removed props step

---

## Next Steps for Migration

1. **Create Equipment Tab Component**
   - Similar structure to PropsWardrobeTab
   - Focus on production equipment (cameras, lighting, sound, grip, etc.)
   - May combine with props or keep separate

2. **Update Arc Pre-Production Shell**
   - Add Props/Wardrobe tab
   - Add Equipment tab (or combined Production Items tab)
   - Update tab navigation

3. **Update Generation Logic**
   - Modify props generation to work at arc level
   - Aggregate episode-level props into arc-level view
   - Add equipment generation logic

4. **Update Data Models**
   - Ensure arc pre-production data structure supports props/equipment
   - Add episode breakdown tracking for items

5. **Update API Routes**
   - Modify props generation to support arc-level generation
   - Add equipment generation endpoint

---

## Notes

- Narrative tab was completely removed (not being migrated)
- Props/Wardrobe functionality is being preserved for arc-level use
- Equipment is a new addition that will complement props/wardrobe
- Consider creating a unified "Production Items" section that combines props, wardrobe, and equipment




























