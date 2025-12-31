# Story Bible Image Generation - Manual Testing Checklist

This checklist provides structured guidance for human QA testing of the Story Bible image generation feature.

## Prerequisites

- Development server running (`npm run dev`)
- Valid `GEMINI_API_KEY` in `.env.local`
- Test user account (or guest mode)
- Browser with developer tools open

---

## Basic Functionality Tests

### Test 1: Generate New Story Bible with Auto-Images Enabled
- [ ] Navigate to Story Bible creation page
- [ ] Fill in story details (title, synopsis, theme)
- [ ] Ensure "Generate visual references" checkbox is checked (default)
- [ ] Submit form
- [ ] **Expected**: Story Bible generates, then images auto-generate
- [ ] **Expected**: Progress indicator shows image generation status
- [ ] **Expected**: Images appear in Overview, Characters, Arcs, and World sections
- [ ] **Expected**: All images are semi-realistic style (not photorealistic)

### Test 2: Generate New Story Bible with Auto-Images Disabled
- [ ] Navigate to Story Bible creation page
- [ ] Fill in story details
- [ ] Uncheck "Generate visual references" checkbox
- [ ] Submit form
- [ ] **Expected**: Story Bible generates without images
- [ ] **Expected**: Placeholder icons show in image slots
- [ ] **Expected**: "Generate Images" button is visible in header

### Test 3: Manual Hero Image Generation
- [ ] Open existing Story Bible (with or without images)
- [ ] Navigate to Overview section
- [ ] Click "Generate" or "Regenerate" button on hero image placeholder
- [ ] **Expected**: Loading spinner appears
- [ ] **Expected**: Image generates and displays (16:9 aspect ratio)
- [ ] **Expected**: Image matches series genre/tone
- [ ] **Expected**: Image is semi-realistic concept art style

### Test 4: Regenerate Existing Hero Image
- [ ] Open Story Bible with existing hero image
- [ ] Click "Regenerate" button on hero image
- [ ] **Expected**: New image generates (different from previous)
- [ ] **Expected**: Previous image is replaced
- [ ] **Expected**: Cache is bypassed (new image even with same prompt)

### Test 5: Generate Character Portraits (Batch)
- [ ] Open Story Bible with 3+ characters
- [ ] Navigate to Characters section
- [ ] Click "Generate All Images" button in section header
- [ ] **Expected**: All character portraits generate
- [ ] **Expected**: Progress indicator shows "Generating Character 1/3..."
- [ ] **Expected**: Images appear as they complete (not all at once)
- [ ] **Expected**: Each character has 1:1 aspect ratio portrait
- [ ] **Expected**: Characters are stylized (not celebrity likeness)

### Test 6: Regenerate Single Character Portrait
- [ ] Open Story Bible with existing character images
- [ ] Click "Regenerate" button on specific character card
- [ ] **Expected**: Only that character's image regenerates
- [ ] **Expected**: Other character images remain unchanged
- [ ] **Expected**: New image is different from previous

### Test 7: Generate Arc Key Art (Batch)
- [ ] Open Story Bible with 2+ narrative arcs
- [ ] Navigate to Arcs section
- [ ] Use "Generate Images" modal, select "Arc Key Art"
- [ ] Click "Generate Selected"
- [ ] **Expected**: All arc key art generates
- [ ] **Expected**: Images are 16:9 aspect ratio (cinematic)
- [ ] **Expected**: Images reflect arc themes/summaries

### Test 8: Generate Location Concepts (Batch)
- [ ] Open Story Bible with 2+ locations
- [ ] Navigate to World section
- [ ] Use "Generate Images" modal, select "Location Concepts"
- [ ] Click "Generate Selected"
- [ ] **Expected**: All location concept art generates
- [ ] **Expected**: Images are 16:9 aspect ratio (establishing shots)
- [ ] **Expected**: Images match location descriptions

### Test 9: Generate Images Modal - All Sections
- [ ] Open Story Bible
- [ ] Click "Generate Images" button in header
- [ ] **Expected**: Modal opens with all sections pre-selected
- [ ] **Expected**: Shows counts: "Character Portraits (3)", "Location Concepts (2)", etc.
- [ ] **Expected**: Can toggle sections on/off
- [ ] Click "Generate Selected"
- [ ] **Expected**: Progress bar shows overall progress
- [ ] **Expected**: Status message updates: "Generating hero image...", "Generating characters...", etc.
- [ ] **Expected**: Modal closes automatically on completion

### Test 10: Generate Images Modal - Selected Sections Only
- [ ] Open Story Bible
- [ ] Click "Generate Images" button
- [ ] Deselect "Hero Image" and "Arc Key Art"
- [ ] Keep only "Character Portraits" and "Location Concepts" selected
- [ ] Click "Generate Selected"
- [ ] **Expected**: Only selected sections generate
- [ ] **Expected**: Hero and Arc images remain unchanged (or show placeholders)

---

## Genre/Style Validation Tests

### Test 11: Comedy Genre Images
- [ ] Create or open Story Bible with genre: "comedy"
- [ ] Generate all images
- [ ] **Expected**: Images have bright, vibrant colors
- [ ] **Expected**: Lighting is soft and natural
- [ ] **Expected**: Overall aesthetic is lighthearted and approachable
- [ ] **Expected**: Characters look friendly, not menacing

### Test 12: Horror Genre Images
- [ ] Create or open Story Bible with genre: "horror"
- [ ] Generate all images
- [ ] **Expected**: Images have muted, desaturated tones
- [ ] **Expected**: Lighting is moody with deep shadows
- [ ] **Expected**: Overall atmosphere is dark and tense
- [ ] **Expected**: Locations feel atmospheric and foreboding

### Test 13: Sci-Fi Genre Images
- [ ] Create or open Story Bible with genre: "sci-fi" or "science fiction"
- [ ] Generate all images
- [ ] **Expected**: Images have cool tones with technological accents
- [ ] **Expected**: Lighting is futuristic and sleek
- [ ] **Expected**: Overall aesthetic is technological
- [ ] **Expected**: Locations feel futuristic

### Test 14: Action Genre Images
- [ ] Create or open Story Bible with genre: "action"
- [ ] Generate all images
- [ ] **Expected**: Images have high contrast, saturated colors
- [ ] **Expected**: Lighting is dynamic and dramatic
- [ ] **Expected**: Overall style is energetic and high-stakes
- [ ] **Expected**: Arc key art feels dynamic

### Test 15: Romance Genre Images
- [ ] Create or open Story Bible with genre: "romance"
- [ ] Generate all images
- [ ] **Expected**: Images have warm, soft tones
- [ ] **Expected**: Lighting is soft and romantic
- [ ] **Expected**: Overall style is intimate and warm
- [ ] **Expected**: Characters look approachable

### Test 16: Drama Genre Images (Default)
- [ ] Create or open Story Bible with genre: "drama" (or no genre specified)
- [ ] Generate all images
- [ ] **Expected**: Images have cinematic color grading
- [ ] **Expected**: Lighting is dramatic and cinematic
- [ ] **Expected**: Overall style is professional and cinematic
- [ ] **Expected**: Images feel production-ready

---

## Industry Standards Validation

For each genre test above, also verify:

### Character Portraits
- [ ] **Casting Flexibility**: Characters are stylized, not photorealistic
- [ ] **No Celebrity Likeness**: Faces don't resemble specific actors
- [ ] **Neutral Backgrounds**: Character portraits have simple backgrounds
- [ ] **Professional Quality**: Images look like concept art, not sketches
- [ ] **No Text**: No text overlays or labels on images

### Location Concepts
- [ ] **Concept Art Style**: Locations read as concept art, not photos
- [ ] **Establishing Shots**: Wide, cinematic framing
- [ ] **No People**: Locations don't include people (unless specified)
- [ ] **No Modern Signs**: No visible text, logos, or modern signage
- [ ] **Professional Design**: Production design quality

### Arc Key Art
- [ ] **Poster Composition**: Cinematic poster-style layout
- [ ] **No Text**: No title cards or text overlays
- [ ] **Visual Hierarchy**: Clear focal point
- [ ] **Genre-Appropriate**: Matches series genre aesthetic

### Hero Image
- [ ] **Banner Format**: 16:9 aspect ratio, wide format
- [ ] **Series Key Art**: Professional series key art quality
- [ ] **Cinematic**: High production value
- [ ] **Genre-Appropriate**: Matches series genre/tone

---

## Error Scenario Tests

### Test 17: Invalid Story Bible ID
- [ ] Open browser console
- [ ] Manually call API with invalid `storyBibleId`
- [ ] **Expected**: API returns 404 error
- [ ] **Expected**: User sees error message: "Story Bible not found"

### Test 18: Missing User ID
- [ ] Open browser console
- [ ] Manually call API without `userId`
- [ ] **Expected**: API returns 400 error
- [ ] **Expected**: Error message: "userId is required"

### Test 19: Empty Sections Array
- [ ] Open "Generate Images" modal
- [ ] Deselect all sections
- [ ] Click "Generate Selected"
- [ ] **Expected**: Button is disabled
- [ ] **Expected**: Error message: "Please select at least one section"

### Test 20: Gemini API Failure
- [ ] Temporarily set invalid `GEMINI_API_KEY` in `.env.local`
- [ ] Restart dev server
- [ ] Attempt to generate images
- [ ] **Expected**: Error is caught gracefully
- [ ] **Expected**: User sees friendly error message
- [ ] **Expected**: Retry button is available
- [ ] **Expected**: Other Story Bible functionality still works

### Test 21: Network Failure
- [ ] Open browser DevTools → Network tab
- [ ] Set throttling to "Offline"
- [ ] Attempt to generate images
- [ ] **Expected**: Error message appears
- [ ] **Expected**: Retry button available
- [ ] **Expected**: Can retry when network restored

### Test 22: Cancel During Generation
- [ ] Start generating images (large batch: 5+ characters)
- [ ] Click "Cancel" button in modal
- [ ] **Expected**: Generation stops
- [ ] **Expected**: Partial results are saved (images generated so far)
- [ ] **Expected**: Modal closes
- [ ] **Expected**: Can resume generation later

---

## Performance & Cost Tests

### Test 23: Generation Time
- [ ] Start timer
- [ ] Generate: 1 hero + 3 characters + 2 arcs + 2 locations (8 images total)
- [ ] Stop timer
- [ ] **Expected**: Total time < 60 seconds
- [ ] **Expected**: Average time per image < 8 seconds
- [ ] **Expected**: Progress updates every 2-3 seconds

### Test 24: Parallel Batching
- [ ] Open browser DevTools → Network tab
- [ ] Generate 5 character portraits
- [ ] **Expected**: Max 3 concurrent requests (not all 5 at once)
- [ ] **Expected**: Requests complete in batches
- [ ] **Expected**: No rate limit errors

### Test 25: Cache Hit
- [ ] Generate character portrait for "Sarah Chen"
- [ ] Note the generated image
- [ ] Regenerate same character (without changing description)
- [ ] **Expected**: Cache is hit (if `regenerate: false`)
- [ ] **Expected**: Same image returned (or very similar)
- [ ] **Expected**: Faster generation time

### Test 26: Cache Bypass
- [ ] Generate character portrait
- [ ] Click "Regenerate" (forces `regenerate: true`)
- [ ] **Expected**: Cache is bypassed
- [ ] **Expected**: New image generated
- [ ] **Expected**: Different from previous image

### Test 27: Cost Estimation
- [ ] Open "Generate Images" modal
- [ ] Select sections
- [ ] **Expected**: Shows estimated image count
- [ ] **Expected**: Shows estimated time
- [ ] **Expected**: Shows estimated cost (if implemented)
- [ ] **Expected**: Warning if batch is very large (>20 images)

---

## Mobile/Responsive Tests

### Test 28: Mobile Portrait Mode
- [ ] Open Story Bible on mobile device (or browser DevTools mobile view)
- [ ] Navigate to Characters section
- [ ] **Expected**: Character cards stack vertically
- [ ] **Expected**: Images display correctly (aspect ratios maintained)
- [ ] **Expected**: "Generate" buttons are accessible (not cut off)

### Test 29: Mobile Image Generation
- [ ] On mobile, click "Generate" on character portrait
- [ ] **Expected**: Loading spinner displays
- [ ] **Expected**: Image generates and displays correctly
- [ ] **Expected**: "Regenerate" button is accessible

### Test 30: Mobile Generate Images Modal
- [ ] On mobile, click "Generate Images" in header
- [ ] **Expected**: Modal is readable (text not too small)
- [ ] **Expected**: Modal is scrollable (doesn't overflow viewport)
- [ ] **Expected**: Checkboxes are large enough to tap
- [ ] **Expected**: "Generate Selected" button is accessible

### Test 31: Tablet View
- [ ] Open Story Bible on tablet (or browser DevTools tablet view)
- [ ] **Expected**: Images display in grid (2-3 columns)
- [ ] **Expected**: Aspect ratios maintained
- [ ] **Expected**: All controls accessible

---

## Integration Tests

### Test 32: CharacterGallery Integration
- [ ] Generate character images in Story Bible
- [ ] Navigate to CharacterGallery (if exists)
- [ ] **Expected**: Story Bible images appear in gallery
- [ ] **Expected**: "Imported from Story Bible" badge visible (if implemented)
- [ ] **Expected**: Can override with new style

### Test 33: LocationsTab Integration
- [ ] Generate location concepts in Story Bible
- [ ] Navigate to LocationsTab in pre-production
- [ ] **Expected**: Story Bible location concepts appear
- [ ] **Expected**: Can import concept art to location cards

### Test 34: Investor Materials Integration
- [ ] Generate all Story Bible images
- [ ] Generate investor materials
- [ ] **Expected**: Story Bible images included in investor materials
- [ ] **Expected**: Hero image appears in depth section
- [ ] **Expected**: Location concepts appear in production section

---

## Edge Cases

### Test 35: Story Bible with No Characters
- [ ] Create Story Bible with no characters
- [ ] Attempt to generate character images
- [ ] **Expected**: No errors
- [ ] **Expected**: "No characters" message or empty state

### Test 36: Story Bible with No Locations
- [ ] Create Story Bible with no locations
- [ ] Attempt to generate location concepts
- [ ] **Expected**: No errors
- [ ] **Expected**: "No locations" message or empty state

### Test 37: Very Long Character Names
- [ ] Create character with very long name (50+ characters)
- [ ] Generate character portrait
- [ ] **Expected**: Image generates successfully
- [ ] **Expected**: Name truncates in UI if needed

### Test 38: Special Characters in Names
- [ ] Create character with special characters: "José O'Brien-Smith"
- [ ] Generate character portrait
- [ ] **Expected**: Image generates successfully
- [ ] **Expected**: No encoding errors

### Test 39: Empty Character Descriptions
- [ ] Create character with no description
- [ ] Generate character portrait
- [ ] **Expected**: Image generates using name and archetype only
- [ ] **Expected**: Prompt doesn't include empty description

### Test 40: Page Reload During Generation
- [ ] Start generating images (large batch)
- [ ] Reload page mid-generation
- [ ] **Expected**: Generation state is lost (expected)
- [ ] **Expected**: Can resume generation manually
- [ ] **Expected**: No errors in console

---

## Completion Criteria

All tests should pass with:
- ✅ No console errors
- ✅ Images generate successfully
- ✅ Images match genre/tone
- ✅ Images are semi-realistic (industry standard)
- ✅ Error handling is graceful
- ✅ Performance is acceptable (< 8s per image)
- ✅ Mobile experience is usable
- ✅ Integration points work correctly

---

## Notes

- Test with different browsers: Chrome, Firefox, Safari
- Test with different network conditions: Fast 3G, Slow 3G, Offline
- Test with different screen sizes: Mobile (375px), Tablet (768px), Desktop (1920px)
- Document any bugs found with: Steps to reproduce, Expected vs Actual, Screenshots, Console logs




































