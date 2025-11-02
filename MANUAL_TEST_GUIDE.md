# 🖱️ MANUAL TEST GUIDE - CLIENT-FACING FEATURES
**Reeled AI Platform**

This guide provides step-by-step instructions for manually testing the client-facing features that require browser interaction.

---

## 🚀 PREREQUISITES

1. **Development Server Running:**
   ```bash
   npm run dev
   ```
   Server should be at: `http://localhost:3000`

2. **Browser:**  
   Modern browser (Chrome, Firefox, Safari, Edge)

3. **Clear Browser State (Optional):**
   ```javascript
   // Run in browser console to clear localStorage
   localStorage.clear()
   ```

---

## 📖 TEST SUITE 1: STORY BIBLE CREATION

### Step 1: Navigate to Story Bible Page
1. Open `http://localhost:3000/story-bible`
2. Verify page loads without errors

### Step 2: Create Story Bible (5-Question Method)
1. Fill in the 5 essential questions:
   - **Logline:** "A detective discovers a conspiracy in a small town"
   - **Protagonist:** "Sarah Martinez, a determined detective with a troubled past"
   - **Stakes:** "If she fails, the conspiracy will consume the entire town"
   - **Vibe:** "Dark noir thriller with mystery elements"
   - **Theme:** "Justice, redemption, and the cost of truth"

2. Click "Generate Story Bible"
3. **Expected:** Loading screen with engine progress indicators
4. **Wait Time:** 5-10 minutes (⚠️ known performance issue)
5. **Verify:** Story bible appears with:
   - Series title
   - Synopsis
   - Main characters (with names, descriptions, arcs)
   - Narrative arcs
   - World building details

### Step 3: Edit Story Bible
1. Click any editable field
2. Modify content
3. **Verify:** Changes are saved to localStorage
4. Refresh page
5. **Verify:** Changes persist

### Success Criteria:
- ✅ Story bible generates successfully
- ✅ All fields populated with relevant content
- ✅ Characters have unique names and backgrounds
- ✅ Narrative arcs are structured logically
- ✅ Edits persist across page reloads

---

## 🎬 TEST SUITE 2: EPISODE GENERATION

### Step 1: Navigate to Workspace
1. Open `http://localhost:3000/workspace`
2. **Verify:** Story bible is displayed
3. **Verify:** Arc navigation is visible

### Step 2: Generate Episode 1 (Baseline)
1. Click "Generate Episode 1" or similar button
2. Select generation mode: **Baseline** (no engines)
3. Click generate
4. **Wait Time:** 30-60 seconds
5. **Verify Episode Contains:**
   - Episode number and title
   - Synopsis
   - 1-5 scenes with content
   - Exactly 3 branching options
   - Episode rundown
   - One option marked as canonical

### Step 3: Generate Episode 2 (Comprehensive Engines)
1. **Make a choice** from Episode 1's branching options
2. Click "Generate Episode 2"
3. Select generation mode: **Comprehensive** (19 engines)
4. **Wait Time:** 90-180 seconds
5. **Verify:**
   - Previous choice is referenced in episode
   - Engine metadata is present
   - Quality appears higher than baseline

### Step 4: Generate Episode 3 (Gemini Path)
1. Make a choice from Episode 2
2. Generate Episode 3
3. Select: **Gemini 2.5 Pro Comprehensive**
4. **Wait Time:** 90-180 seconds
5. **Verify:** Gemini metadata present

### Step 5: Episode Studio
1. Navigate to `/episode-studio/1`
2. **Verify:** Episode 1 is displayed in detailed view
3. **Test:** Edit episode content
4. **Verify:** Changes save

### Success Criteria:
- ✅ All 3 generation paths work
- ✅ Episodes have proper structure
- ✅ User choices propagate to next episode
- ✅ Branching options are specific and unique
- ✅ Content quality is coherent
- ✅ Episode editing works

---

## 🎭 TEST SUITE 3: PRE-PRODUCTION SYSTEM

### Step 1: Navigate to Pre-Production
1. Open `http://localhost:3000/preproduction`
2. **Verify:** Pre-production dashboard loads

### Step 2: Generate Phase 1 Content
Test each content type:

#### A. Script Generation
1. Click "Generate Script" for Arc 1
2. **Wait Time:** 30-60 seconds
3. **Verify Script Contains:**
   - Professional screenplay format
   - Scene headings
   - Character dialogue
   - Action lines
   - References to story bible characters

#### B. Storyboard Generation
1. Click "Generate Storyboard"
2. **Verify:**
   - Shot descriptions
   - Visual compositions
   - Camera angles
   - Scene breakdowns

#### C. Casting Generation
1. Click "Generate Casting"
2. **Verify:**
   - Character casting suggestions
   - Physical descriptions
   - Acting notes
   - Character relationships

### Step 3: Generate Phase 2 Content

#### A. Production Planning
1. Navigate to `/preproduction/v2`
2. Generate production schedule
3. **Verify:**
   - Timeline
   - Resource allocation
   - Department breakdowns

#### B. Location Scouting
1. Generate location suggestions
2. **Verify:**
   - Location descriptions
   - Practical considerations
   - Visual references

### Step 4: Content Editing
1. Click "Edit" on any generated content
2. Make modifications
3. Save changes
4. Refresh page
5. **Verify:** Changes persist

### Step 5: Export Content
1. Click "Export" button
2. **Verify:** Content downloads or copies correctly

### Success Criteria:
- ✅ All content types generate successfully
- ✅ Content references story bible accurately
- ✅ Professional quality and formatting
- ✅ Editing and saving works
- ✅ Export functionality works

---

## 🧭 TEST SUITE 4: NAVIGATION & UX

### Step 1: Main Navigation
Test all major routes:
```
/ → Landing page
/workspace → Main workspace
/story-bible → Story bible creation
/preproduction → Pre-production dashboard
/episode-studio/[id] → Episode detail view
/analytics → Analytics (if available)
/settings → Settings (if available)
```

### Step 2: Loading States
1. Trigger a long operation (episode generation)
2. **Verify:**
   - Loading indicator appears
   - Progress updates in real-time
   - User can't trigger duplicate requests
   - Cancel button works (if available)

### Step 3: Error Handling
1. Disconnect internet
2. Try to generate content
3. **Verify:**
   - Error message appears
   - User is guided to resolve issue
   - No crash or blank screen

### Step 4: Responsive Design
Test on different screen sizes:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

**Verify:**
- Layout adapts appropriately
- All features accessible
- Text remains readable
- No horizontal scrolling

### Success Criteria:
- ✅ All routes load correctly
- ✅ Loading states are clear
- ✅ Errors are handled gracefully
- ✅ Responsive design works

---

## 💾 TEST SUITE 5: DATA PERSISTENCE

### Step 1: LocalStorage
1. Generate story bible
2. Generate 2 episodes
3. Make user choices
4. Open browser DevTools → Application → LocalStorage
5. **Verify Keys Exist:**
   ```
   greenlit-story-bible
   greenlit-user-choices
   greenlit-episodes-[number]
   greenlit-preproduction-content
   ```

### Step 2: Persistence Test
1. Close browser completely
2. Reopen and navigate to `/workspace`
3. **Verify:**
   - Story bible loads
   - Episodes load
   - User choices preserved
   - Progress continues where left off

### Step 3: Multi-Session Test
1. Open in two different tabs
2. Generate content in Tab 1
3. Refresh Tab 2
4. **Verify:** Content appears in both tabs

### Success Criteria:
- ✅ All data saves to localStorage
- ✅ Data persists across sessions
- ✅ Data syncs across tabs
- ✅ No data corruption

---

## 🎯 TEST SUITE 6: CONTENT QUALITY

### Manual Quality Checks

#### Story Bible Quality:
- ✅ Character names are unique and realistic
- ✅ Character backgrounds are detailed
- ✅ Narrative arcs have clear structure
- ✅ World building is cohesive
- ✅ Theme is consistently explored

#### Episode Quality:
- ✅ Scenes have vivid descriptions
- ✅ Dialogue sounds natural
- ✅ Story progresses logically
- ✅ Characters act consistently
- ✅ Pacing feels appropriate

#### Branching Options Quality:
- ✅ Options reference specific episode events
- ✅ Options use exact character names
- ✅ Options create meaningful consequences
- ✅ Exactly 3 options provided
- ✅ One option marked as canonical

#### Pre-Production Quality:
- ✅ Script format is professional
- ✅ Casting suggestions are specific
- ✅ Locations are practical and relevant
- ✅ Schedule is realistic

---

## 🐛 BUG REPORTING TEMPLATE

When you find an issue, document it:

```markdown
### Bug: [Brief Description]

**Severity:** Critical | High | Medium | Low
**Category:** API | UI | Data | Performance | Other

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**

**Actual Behavior:**

**Screenshots/Logs:**

**Environment:**
- Browser:
- OS:
- Date/Time:
```

---

## ✅ MANUAL TEST CHECKLIST

Use this checklist to track your testing progress:

### Story Bible:
- [ ] Create story bible (5-question method)
- [ ] Edit story bible fields
- [ ] Verify persistence after refresh

### Episodes:
- [ ] Generate Episode 1 (baseline)
- [ ] Generate Episode 2 (comprehensive engines)
- [ ] Generate Episode 3 (Gemini path)
- [ ] Make user choices
- [ ] Verify choice propagation
- [ ] Test episode editing

### Pre-Production:
- [ ] Generate script
- [ ] Generate storyboard
- [ ] Generate casting
- [ ] Generate production planning
- [ ] Generate location scouting
- [ ] Edit pre-production content
- [ ] Export content

### Navigation & UX:
- [ ] Test all major routes
- [ ] Verify loading states
- [ ] Test error handling
- [ ] Check responsive design

### Data Persistence:
- [ ] Verify localStorage
- [ ] Test cross-session persistence
- [ ] Test multi-tab sync

### Content Quality:
- [ ] Review story bible quality
- [ ] Review episode quality
- [ ] Review branching options
- [ ] Review pre-production quality

---

## 📊 TEST RESULTS

After completing manual tests, document results:

| Test Suite | Tests Run | Passed | Failed | Notes |
|------------|-----------|--------|--------|-------|
| Story Bible | | | | |
| Episodes | | | | |
| Pre-Production | | | | |
| Navigation | | | | |
| Data Persistence | | | | |
| Content Quality | | | | |

**Overall Status:** ⬜ All Pass | ⬜ Pass with Issues | ⬜ Major Issues Found

---

## 🔗 RELATED FILES

- `WORKFLOW_VALIDATION_REPORT.md` - Automated test results
- `comprehensive-workflow-test.ts` - Automated test script
- `test-results-comprehensive.json` - Detailed automated results

---

**Last Updated:** October 14, 2025  
**Tested By:** _[Your Name]_  
**Test Environment:** Development (`http://localhost:3000`)


















