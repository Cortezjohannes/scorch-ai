# 🧪 Test Plan Execution - Live Testing

## Current System State

**Dev Server**: ✅ Running on http://localhost:3000  
**Last Generation**: "Wetware" - Cyberpunk detective story  
**Characters Generated**: 16 (within the old 12-18 range - this was BEFORE our fixes)  
**Arcs Generated**: 4

---

## Test Suite 1: Character CRUD

### Test 1.1: View Existing Characters ✅
**Steps**:
1. Open http://localhost:3000/story-bible
2. Navigate to Characters tab
3. Verify 16 characters are displayed

**Expected**: All 16 characters visible with navigation

### Test 1.2: Add New Character
**Steps**:
1. Click "➕ Add Character" button
2. Verify new character appears with placeholder values
3. Check localStorage for persistence

**Expected**: 
- New character added (17 total)
- Placeholder values: "New Character", "TBD" fields
- Auto-saved to localStorage
- Navigation jumps to new character

### Test 1.3: Edit Character Name
**Steps**:
1. Navigate to any character
2. Hover over character name
3. Click ✏️ edit button
4. Change name to "Test Character"
5. Click ✓ to save

**Expected**:
- Inline editor appears
- Name updates in UI
- Saved to localStorage
- Name persists after page reload

### Test 1.4: Edit Character Fields (Physiology)
**Steps**:
1. Navigate to any character
2. Hover over "Age" field
3. Click ✏️ edit button
4. Change age to "35"
5. Click ✓ to save

**Expected**:
- Age updates
- Saved to localStorage
- Persists after reload

### Test 1.5: Edit Character Fields (Psychology)
**Steps**:
1. Navigate to any character
2. Find "Want" field in Psychology section
3. Edit the want field
4. Save changes

**Expected**: Changes saved and persist

### Test 1.6: Delete Character
**Steps**:
1. Navigate to character
2. Click "🗑️ Delete" button
3. Confirm deletion
4. Verify character removed

**Expected**:
- Confirmation dialog appears
- Character deleted from list
- Total character count decreases
- Can't delete if only 1 character left

---

## Test Suite 2: World Building CRUD

### Test 2.1: View Locations
**Steps**:
1. Navigate to World Building tab
2. Scroll to "Key Locations" section
3. Verify locations are displayed

**Expected**: All generated locations visible

### Test 2.2: Add New Location
**Steps**:
1. Click "➕ Add Location" button
2. Verify new location appears with placeholder
3. Check localStorage

**Expected**:
- New location added
- Placeholder: "New Element", "To be defined"
- Saved to localStorage

### Test 2.3: Delete Location
**Steps**:
1. Hover over any location card
2. Click 🗑️ button
3. Confirm deletion

**Expected**:
- Confirmation dialog
- Location removed
- Saved to localStorage

---

## Test Suite 3: Verify No Hardcoded Limits

### Test 3.1: Generate New Story (Intimate Drama)
**Story**: "Two estranged siblings reunite at their mother's funeral"

**Steps**:
1. Clear localStorage: `localStorage.clear()`
2. Go to homepage
3. Enter story prompt
4. Generate story bible
5. Check character count in terminal logs

**Expected Character Count**: 2-4 characters (NOT 12-18!)

**Terminal Log to Check**:
```
✅ CHARACTER ENGINE: AI determined optimal character count: 3 (fully AI-driven, no hardcoded ranges)
```

### Test 3.2: Generate New Story (Epic Saga)
**Story**: "Five kingdoms battle for control of a dying planet while ancient aliens awaken"

**Expected Character Count**: 25-35 characters (NOT capped at 18!)

**Terminal Log to Check**:
```
✅ CHARACTER ENGINE: AI determined optimal character count: 28 (fully AI-driven, no hardcoded ranges)
```

### Test 3.3: Check Arc Count Flexibility
**Check Terminal Logs For**:
```
✅ NARRATIVE ENGINE: Determined optimal arc count: X
```

**Expected**: Arc count varies by story (not always 4)

---

## Test Suite 4: Data Persistence

### Test 4.1: Character Edit Persistence
**Steps**:
1. Edit a character name
2. Reload page (F5)
3. Verify name persists

**Expected**: Changes survive page reload

### Test 4.2: Added Character Persistence
**Steps**:
1. Add new character
2. Reload page
3. Verify character still there

**Expected**: New character persists

### Test 4.3: Deleted Character Persistence
**Steps**:
1. Delete a character
2. Reload page
3. Verify character is gone

**Expected**: Deletion persists

---

## Test Suite 5: Edge Cases

### Test 5.1: Minimum Characters
**Steps**:
1. Delete all characters except one
2. Try to delete last character

**Expected**: Delete button disappears or deletion blocked

### Test 5.2: Many Characters
**Steps**:
1. Add 20+ characters
2. Navigate through them
3. Check performance

**Expected**: System handles many characters smoothly

### Test 5.3: Long Text Fields
**Steps**:
1. Edit appearance field
2. Enter 500+ character description
3. Save

**Expected**: Long text handled correctly

### Test 5.4: Empty Fields
**Steps**:
1. Edit a field
2. Delete all text (leave empty)
3. Save

**Expected**: Empty value saved (or validation prevents it)

---

## Manual Testing Checklist

Open your browser to http://localhost:3000/story-bible and complete:

- [ ] Characters tab loads
- [ ] Can navigate between characters (←/→ buttons)
- [ ] Can click character names to jump
- [ ] ➕ Add Character button appears
- [ ] Clicking ➕ adds new character
- [ ] 🗑️ Delete button appears on characters
- [ ] Hover over character name shows ✏️
- [ ] Clicking ✏️ shows inline editor
- [ ] Editing character name works
- [ ] Saving edit works (✓ button)
- [ ] Canceling edit works (✕ button)
- [ ] Hover over Age shows ✏️
- [ ] Editing Age works
- [ ] Hover over Gender shows ✏️
- [ ] Editing Gender works
- [ ] Hover over Appearance shows ✏️
- [ ] Editing Appearance (textarea) works
- [ ] Reload page - edits persist
- [ ] Delete character - confirmation appears
- [ ] Delete character - actually removes it
- [ ] World Building tab loads
- [ ] ➕ Add Location button appears
- [ ] Clicking ➕ adds new location
- [ ] Hover over location shows 🗑️
- [ ] Deleting location works
- [ ] Reload page - world changes persist
- [ ] Helpful tip appears on Characters tab
- [ ] Helpful tip appears on World Building tab

---

## Automated Test Results

### Character CRUD: ⏳ TESTING IN PROGRESS
- Add: ⏳ Pending
- Edit: ⏳ Pending
- Delete: ⏳ Pending
- Persistence: ⏳ Pending

### World Building CRUD: ⏳ PENDING
- Add Location: ⏳ Pending
- Delete Location: ⏳ Pending
- Persistence: ⏳ Pending

### No Hardcoded Limits: ⏳ PENDING
- Intimate Story: ⏳ Pending (need to generate)
- Epic Story: ⏳ Pending (need to generate)
- Arc Count Variation: ⏳ Pending

---

## Next Steps

1. **YOU TEST**: Open http://localhost:3000/story-bible and manually test the features
2. **Report Results**: Let me know what works / what doesn't
3. **Generate New Story**: Test with intimate 2-person story to verify no 12-18 constraint
4. **Then Move to Phase 2**: Arc Management implementation

---

## Quick Test Commands

**Clear localStorage and start fresh**:
```javascript
localStorage.clear()
location.reload()
```

**Check current story bible**:
```javascript
console.log(JSON.parse(localStorage.getItem('greenlit-story-bible')))
```

**Check character count**:
```javascript
const bible = JSON.parse(localStorage.getItem('greenlit-story-bible'))
console.log('Character count:', bible?.storyBible?.mainCharacters?.length)
```

---

**Ready to test?** Open http://localhost:3000/story-bible and let me know what you find! 🧪








