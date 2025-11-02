# Budget Tab AI Generation Implementation

## Overview

Build an AI-enhanced budget tracker that combines BASE budget (from Script Breakdown) with OPTIONAL costs (crew, equipment, post-production) to give filmmakers a complete picture of production costs.

## User Requirements (Confirmed)

1. **BASE Budget Source:** Script Breakdown (extras, props, locations)
2. **OPTIONAL Budget:** User adds crew, equipment, post-production costs
3. **Tracking:** Only in Budget tab (not in breakdown)

## Architecture

**Data Flow:**

```
Script Breakdown (BASE budget: extras, props, locations)
  ↓
Budget Tab UI (display BASE + calculate)
  ↓
AI Generator (suggest OPTIONAL crew/equipment based on script complexity)
  ↓
User adds/removes OPTIONAL line items
  ↓
Real-time TOTAL calculation (BASE + OPTIONAL)
  ↓
Firestore (budget field)
```

## Budget Structure

### BASE Budget (Auto-populated from Script Breakdown)

**Categories:**
- **Extras:** $10-$20/day per person (from breakdown scenes)
- **Props:** $5-$50 per item (from breakdown scenes)
- **Locations:** $0-$200 per location (from breakdown scenes)

**Source:** `preProductionData.scriptBreakdown.totalBudgetImpact`

**Example (Ghosts and Gut Instinct):**
```
BASE Budget: $165
  - Extras: $0 (no extras in this episode)
  - Props: $65 (whiskey tumbler, stock cert, phone, Knicks gear, whiteboards, etc.)
  - Locations: $100 (Chase Center fee, other locations free)
```

### OPTIONAL Budget (AI-suggested, user-editable)

**Categories:**

**1. Crew Costs:**
- Camera Operator: $100-$300/day
- Sound Person: $100-$200/day
- Lighting Tech: $100-$200/day
- Production Assistant: $50-$100/day
- Director (if not actor): $200-$500/day

**2. Equipment Rental:**
- Camera package: $50-$200/day
- Audio package: $30-$100/day
- Lighting package: $50-$200/day
- Stabilizer/gimbal: $30-$100/day
- Specialty lenses: $50-$150/day

**3. Post-Production:**
- Editor: $200-$500
- Color grading: $100-$300
- Sound mixing: $100-$200
- VFX (if needed): $100-$500
- Music licensing: $50-$200

**4. Miscellaneous:**
- Catering/craft services: $50-$150/day
- Transportation: $30-$100/day
- Insurance: $50-$200
- Permits (additional): $0-$200

### TOTAL Budget

```
TOTAL = BASE + OPTIONAL
```

**Color Coding:**
- 🟢 Green: $0-$300 (ultra-low budget)
- 🟡 Yellow: $300-$500 (moderate micro-budget)
- 🟠 Orange: $500-$625 (approaching max)
- 🔴 Red: Over $625 (exceeds per-episode target)

## Implementation Steps

### 1. Create AI Generator Service

**File:** `src/services/ai-generators/budget-generator.ts`

**Purpose:** Analyze script/breakdown and suggest realistic OPTIONAL budget items

**Key Functions:**

- `generateBudgetSuggestions(params)` - Main entry point
- `extractBaseBudget(scriptBreakdown)` - Get BASE from breakdown
- `suggestCrewNeeds(script, breakdown)` - AI suggests crew based on complexity
- `suggestEquipmentNeeds(script, breakdown)` - AI suggests equipment rentals
- `suggestPostProductionNeeds(script)` - AI suggests post costs
- `buildSystemPrompt()` - Instructions for AI (UGC micro-budget focus)
- `buildUserPrompt(script, breakdown, storyBible)` - Context

**AI Requirements:**

- Use EngineAIRouter
- Provider: Gemini 2.5 Pro
- Temperature: 0.7 (balanced suggestions)
- Focus: Practical, optional items (not mandatory)

**AI Output Format:**

```json
{
  "baseBudget": {
    "extras": 0,
    "props": 65,
    "locations": 100,
    "total": 165,
    "source": "script-breakdown"
  },
  "suggestedOptional": {
    "crew": [
      {
        "role": "Camera Operator",
        "costRange": [100, 300],
        "suggestedCost": 200,
        "necessity": "recommended",
        "reason": "3 scenes with different locations require professional camera work",
        "optional": true
      },
      {
        "role": "Sound Person",
        "costRange": [100, 200],
        "suggestedCost": 150,
        "necessity": "recommended",
        "reason": "Chase Center scene has ambient noise challenges",
        "optional": true
      }
    ],
    "equipment": [
      {
        "item": "Stabilizer/Gimbal",
        "costRange": [30, 100],
        "suggestedCost": 50,
        "necessity": "optional",
        "reason": "Nice to have for penthouse window shots",
        "optional": true
      }
    ],
    "postProduction": [
      {
        "item": "Editor",
        "costRange": [200, 500],
        "suggestedCost": 300,
        "necessity": "highly-recommended",
        "reason": "5-minute episode with 3 scenes needs professional editing",
        "optional": true
      },
      {
        "item": "Color Grading",
        "costRange": [100, 300],
        "suggestedCost": 150,
        "necessity": "recommended",
        "reason": "Night scenes and different locations benefit from color consistency",
        "optional": true
      }
    ],
    "miscellaneous": [
      {
        "item": "Catering/Craft Services",
        "costRange": [50, 150],
        "suggestedCost": 75,
        "necessity": "optional",
        "reason": "2+ hour shoot benefits from basic catering",
        "optional": true
      }
    ]
  },
  "totalSuggested": 925,
  "budgetAnalysis": {
    "baseOnly": 165,
    "withRecommended": 765,
    "withAll": 925,
    "withinRange": false,
    "recommendation": "Consider only highly-recommended items to stay under $625/episode"
  }
}
```

**Budget Guidelines for AI:**

- BASE budget is fixed (from breakdown)
- OPTIONAL items are SUGGESTIONS only
- User can accept/reject/modify any item
- Total per episode target: $30-$625
- Prioritize by necessity: "highly-recommended" > "recommended" > "optional"
- Consider shoot complexity (scenes, locations, actors)

### 2. Create API Route

**File:** `src/app/api/generate/budget/route.ts`

**Endpoints:** POST only

**Request Body:**

```typescript
{
  preProductionId: string
  storyBibleId: string
  episodeNumber: number
  userId: string
  scriptData: GeneratedScript  // from Scripts tab
  breakdownData: ScriptBreakdownData  // from Script Breakdown tab
  storyBibleData: StoryBible
}
```

**Response:**

```typescript
{
  success: boolean
  budget: BudgetData
  preProductionId: string
  message: string
}
```

**Process:**

1. Validate breakdownData exists (return 400 if missing)
2. Extract BASE budget from breakdown
3. Call `generateBudgetSuggestions()`
4. Return structured budget with BASE + OPTIONAL suggestions
5. Client saves to Firestore (with auth context)

**Error Handling:**

- Missing breakdown data: "Please generate script breakdown first"
- AI failure: Return error details
- Validation failure: Return specific issue

### 3. Update BudgetTrackerTab Component

**File:** `src/components/preproduction/tabs/BudgetTrackerTab.tsx`

**Current State:** Basic budget UI with line items

**Changes Needed:**

**Add state management:**

```typescript
const [isGenerating, setIsGenerating] = useState(false)
const [generationError, setGenerationError] = useState<string | null>(null)
const [showOptional, setShowOptional] = useState(true)
```

**Add generation function:**

```typescript
const handleGenerateBudget = async () => {
  // 1. Check if Script Breakdown exists
  const breakdownData = preProductionData.scriptBreakdown
  if (!breakdownData) {
    setGenerationError('Please generate script breakdown first')
    return
  }

  // 2. Check if Scripts exist
  const scriptsData = preProductionData.scripts
  if (!scriptsData?.fullScript) {
    setGenerationError('Please generate a script first')
    return
  }

  // 3. Fetch story bible
  const storyBible = await getStoryBible(storyBibleId, userId)

  // 4. Call API
  const response = await fetch('/api/generate/budget', {
    method: 'POST',
    body: JSON.stringify({
      preProductionId,
      storyBibleId,
      episodeNumber,
      userId,
      scriptData: scriptsData.fullScript,
      breakdownData: breakdownData,
      storyBibleData: storyBible
    })
  })

  // 5. Save result to Firestore
  await onUpdate('budget', result.budget)
}
```

**UI Structure:**

```jsx
<div className="budget-container">
  {/* Header */}
  <div className="budget-header">
    <h2>Budget Tracker</h2>
    <button onClick={handleGenerateBudget}>
      {isGenerating ? '🔄 Generating...' : '✨ Generate Budget'}
    </button>
  </div>

  {/* BASE Budget Section */}
  <div className="base-budget-section">
    <h3>BASE Budget (from Script Breakdown)</h3>
    <div className="budget-breakdown">
      <BudgetLineItem 
        category="Extras" 
        amount={baseBudget.extras} 
        readOnly 
        source="Script Breakdown"
      />
      <BudgetLineItem 
        category="Props" 
        amount={baseBudget.props} 
        readOnly 
        source="Script Breakdown"
      />
      <BudgetLineItem 
        category="Locations" 
        amount={baseBudget.locations} 
        readOnly 
        source="Script Breakdown"
      />
    </div>
    <div className="subtotal">
      BASE TOTAL: ${baseBudget.total}
    </div>
  </div>

  {/* OPTIONAL Budget Section */}
  <div className="optional-budget-section">
    <h3>OPTIONAL Costs (AI-Suggested, Editable)</h3>
    
    {/* Crew */}
    <BudgetCategory 
      name="Crew" 
      items={suggestedCrew}
      onToggle={handleToggleItem}
      onEdit={handleEditItem}
      onAdd={handleAddCustomItem}
    />

    {/* Equipment */}
    <BudgetCategory 
      name="Equipment Rental" 
      items={suggestedEquipment}
      onToggle={handleToggleItem}
      onEdit={handleEditItem}
      onAdd={handleAddCustomItem}
    />

    {/* Post-Production */}
    <BudgetCategory 
      name="Post-Production" 
      items={suggestedPostProd}
      onToggle={handleToggleItem}
      onEdit={handleEditItem}
      onAdd={handleAddCustomItem}
    />

    {/* Miscellaneous */}
    <BudgetCategory 
      name="Miscellaneous" 
      items={suggestedMisc}
      onToggle={handleToggleItem}
      onEdit={handleEditItem}
      onAdd={handleAddCustomItem}
    />

    <div className="subtotal">
      OPTIONAL TOTAL: ${optionalTotal}
    </div>
  </div>

  {/* TOTAL Budget */}
  <div className={`total-budget ${getBudgetColorClass(totalBudget)}`}>
    <h2>TOTAL EPISODE BUDGET</h2>
    <div className="amount">${totalBudget}</div>
    <div className="status">
      {totalBudget <= 300 && '🟢 Ultra-low budget'}
      {totalBudget > 300 && totalBudget <= 500 && '🟡 Moderate micro-budget'}
      {totalBudget > 500 && totalBudget <= 625 && '🟠 Approaching max'}
      {totalBudget > 625 && '🔴 Exceeds target ($625/episode)'}
    </div>
    <div className="breakdown-link">
      Target: $30-$625/episode (series budget: $1k-$20k ÷ 32 episodes)
    </div>
  </div>

  {/* Budget Analysis (if AI generated) */}
  {budgetAnalysis && (
    <div className="budget-analysis">
      <h3>Budget Analysis</h3>
      <ul>
        <li>BASE only: ${budgetAnalysis.baseOnly}</li>
        <li>With recommended items: ${budgetAnalysis.withRecommended}</li>
        <li>With all suggestions: ${budgetAnalysis.withAll}</li>
      </ul>
      <p className="recommendation">{budgetAnalysis.recommendation}</p>
    </div>
  )}
</div>
```

**BudgetCategory Component:**

```jsx
interface BudgetCategoryProps {
  name: string
  items: BudgetLineItem[]
  onToggle: (itemId: string) => void
  onEdit: (itemId: string, newCost: number) => void
  onAdd: (category: string) => void
}

function BudgetCategory({ name, items, onToggle, onEdit, onAdd }: BudgetCategoryProps) {
  return (
    <div className="budget-category">
      <h4>{name}</h4>
      
      {items.map(item => (
        <div key={item.id} className="budget-line-item">
          <input 
            type="checkbox" 
            checked={item.included} 
            onChange={() => onToggle(item.id)}
          />
          <div className="item-details">
            <div className="item-name">
              {item.role || item.item}
              <span className={`necessity ${item.necessity}`}>
                {item.necessity}
              </span>
            </div>
            <div className="item-reason">{item.reason}</div>
            <div className="cost-range">
              Range: ${item.costRange[0]}-${item.costRange[1]}
            </div>
          </div>
          <input 
            type="number" 
            value={item.suggestedCost}
            onChange={(e) => onEdit(item.id, Number(e.target.value))}
            className="cost-input"
            disabled={!item.included}
          />
        </div>
      ))}

      <button onClick={() => onAdd(name)} className="add-custom-item">
        + Add Custom {name} Item
      </button>
    </div>
  )
}
```

### 4. TypeScript Types

**File:** `src/types/preproduction.ts`

**Add/Update types:**

```typescript
export interface BudgetData {
  generated: boolean
  baseBudget: BaseBudget
  optionalBudget: OptionalBudget
  totalBudget: number
  budgetAnalysis?: BudgetAnalysis
  lastGenerated?: number
  status: 'draft' | 'generated' | 'approved'
}

export interface BaseBudget {
  extras: number
  props: number
  locations: number
  total: number
  source: 'script-breakdown'
}

export interface OptionalBudget {
  crew: BudgetLineItem[]
  equipment: BudgetLineItem[]
  postProduction: BudgetLineItem[]
  miscellaneous: BudgetLineItem[]
  total: number
}

export interface BudgetLineItem {
  id: string
  role?: string  // for crew
  item?: string  // for equipment/misc
  costRange: [number, number]
  suggestedCost: number
  actualCost?: number
  necessity: 'highly-recommended' | 'recommended' | 'optional'
  reason: string
  included: boolean
  custom?: boolean  // user-added item
}

export interface BudgetAnalysis {
  baseOnly: number
  withRecommended: number
  withAll: number
  withinRange: boolean
  recommendation: string
}
```

### 5. AI Prompt Strategy

**System Prompt:**

```
You are a micro-budget film production advisor analyzing a 5-minute web series episode.

Your job is to suggest OPTIONAL budget items (crew, equipment, post-production) based on the script and breakdown complexity.

CRITICAL RULES:

1. BASE BUDGET IS FIXED
   - Extras, props, locations come from Script Breakdown
   - You CANNOT change BASE budget
   - Only suggest OPTIONAL items

2. UGC ULTRA-MICRO-BUDGET FOCUS
   - Total series: $1k-$20k for ALL 32 episodes
   - Per episode target: $30-$625
   - BASE budget already calculated (e.g., $165)
   - OPTIONAL budget should fit within remaining budget

3. SUGGESTION PRIORITIES
   - "highly-recommended": Essential for quality (editor, sound)
   - "recommended": Improves quality (camera op, color grading)
   - "optional": Nice to have (gimbal, catering)

4. COST REALISM
   - Crew: $100-$300/day (not professional rates)
   - Equipment: Rental, not purchase
   - Post-production: UGC rates, not Hollywood
   - Give RANGES, not single prices

5. JUSTIFY SUGGESTIONS
   - Each item needs a REASON based on script analysis
   - "3 locations require camera operator" (specific)
   - NOT "professional look" (vague)

6. BUDGET AWARENESS
   - If BASE is $165 and target is $625, you have $460 for OPTIONAL
   - Prioritize most impactful items
   - Warn if all suggestions exceed budget
```

**User Prompt:**

```
Analyze this episode and suggest OPTIONAL budget items.

SERIES: {seriesTitle}
EPISODE: {episodeNumber} - {episodeTitle}
GENRE: {genre}
RUNTIME: 5 minutes

BASE BUDGET (from Script Breakdown): ${baseBudget.total}
  - Extras: ${baseBudget.extras}
  - Props: ${baseBudget.props}
  - Locations: ${baseBudget.locations}

SCRIPT COMPLEXITY:
  - Scenes: {sceneCount}
  - Locations: {locationCount}
  - Characters: {characterCount}
  - Shoot time estimate: {totalShootTime} minutes

SCENES OVERVIEW:
{sceneBreakdown}

TARGET BUDGET: $30-$625/episode
REMAINING BUDGET: ${625 - baseBudget.total} (for OPTIONAL items)

Suggest OPTIONAL items in these categories:
1. Crew (camera op, sound, lighting, PA)
2. Equipment Rental (camera, audio, lighting, gimbal, lenses)
3. Post-Production (editor, color, sound mix, VFX, music)
4. Miscellaneous (catering, transport, insurance, permits)

For each item, provide:
- Role/item name
- Cost range (min-max)
- Suggested cost (realistic mid-point)
- Necessity level (highly-recommended/recommended/optional)
- Specific reason based on script analysis

Output ONLY valid JSON matching the specified structure.
```

### 6. Testing Plan

**Test Sequence:**

1. Generate script (Scripts tab)
2. Generate breakdown (Script Breakdown tab)
3. Navigate to Budget tab
4. Click "Generate Budget"
5. Verify BASE budget matches breakdown total
6. Check OPTIONAL suggestions are reasonable
7. Toggle items on/off
8. Edit costs
9. Add custom items
10. Verify TOTAL updates in real-time
11. Check color coding by budget range
12. Confirm data saves to Firestore

**Success Criteria:**

- BASE budget = breakdown total (exact match)
- OPTIONAL items have clear justifications
- Cost ranges are realistic for UGC
- Total stays under $625 with recommended items
- UI updates in real-time
- Custom items can be added/removed
- Data persists across page reloads

## Key Differences from Script Breakdown

1. **BASE budget is READ-ONLY** (from breakdown)
2. **OPTIONAL budget is USER-CONTROLLED** (AI suggests, user decides)
3. **Real-time calculation** (BASE + selected OPTIONAL = TOTAL)
4. **No regeneration needed** (user can add/remove items freely)
5. **AI is ADVISOR** (not generator)

## Files to Create/Modify

**New Files:**
- `src/services/ai-generators/budget-generator.ts`
- `src/app/api/generate/budget/route.ts`

**Modified Files:**
- `src/components/preproduction/tabs/BudgetTrackerTab.tsx`
- `src/types/preproduction.ts` (add budget types)

**Reference Files:**
- `src/services/ai-generators/script-breakdown-generator.ts` (pattern)
- `src/app/api/generate/script-breakdown/route.ts` (API structure)

## Production Considerations

**Performance:**
- BASE budget extraction: <1 second
- AI suggestion generation: 10-15 seconds
- Total: <20 seconds end-to-end

**Flexibility:**
- Users can accept/reject any suggestion
- Users can add custom line items
- Users can edit costs
- Generation is starting point, not final

**Budget Tracking:**
- Real-time TOTAL calculation
- Color-coded budget status
- Warning if exceeding $625/episode
- Link to breakdown for BASE details

---

## Next Steps After Budget Tab

1. **Locations Tab** - Extract from breakdown + add photos/details
2. **Props/Wardrobe Tab** - Extract from breakdown + procurement tracking
3. **Equipment Tab** - Based on scene requirements
4. **Casting Tab** - Extract characters + add actor profiles
5. **Storyboards Tab** - Visual planning from script

---

**Estimated Time:** 3-4 hours (AI service + API route + UI updates + testing)


