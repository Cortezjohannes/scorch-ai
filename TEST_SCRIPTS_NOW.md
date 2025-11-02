# ⚡ Quick Test Guide - Scripts AI Generation

## 🚀 Ready to Test!

Your Scripts AI generation is **fixed and ready**. Here's how to test it:

## 📍 Quick Steps

1. **Open Browser**
   ```
   http://localhost:3000/workspace
   ```

2. **Navigate to Pre-Production**
   - Find Episode 1 in your workspace
   - Click "Pre-Production" button

3. **Go to Scripts Tab**
   - Click "Scripts" tab (should be visible)

4. **Generate Script**
   - Click "✨ Generate Hollywood-Grade Script"
   - Wait 10-30 seconds (AI generation)

5. **Verify Results**
   - Script should appear in proper format
   - Check slug lines (INT./EXT. LOCATION - DAY)
   - Check dialogue formatting
   - Check action descriptions

## ✅ What Should Work

- Generate button triggers API call
- Loading spinner shows during generation
- Script renders in proper screenplay format
- Toggle between "Script" and "Breakdown" views
- Regenerate button works
- Print button works
- Data persists after page refresh

## 🔍 What to Look For

### Good Signs:
- ✅ No console errors
- ✅ Script content matches your episode
- ✅ Proper formatting (slug lines, dialogue centered)
- ✅ ~5 pages / 5 scenes
- ✅ Character names are correct
- ✅ Dialogue feels natural
- ✅ Action descriptions are visual

### Red Flags:
- ❌ Console errors (check developer tools)
- ❌ Script invents new story elements
- ❌ Formatting is broken
- ❌ Takes too long (>60 seconds)
- ❌ Empty or partial script

## 🐛 If Something Breaks

### Check Console:
```javascript
// Open browser console (F12 or Cmd+Option+I)
// Look for errors starting with:
// ❌ Error generating script
// ❌ API Error
```

### Common Issues:

**"Episode not found"**
- Make sure you have Episode 1 generated
- Check story bible ID is correct

**"Script generation failed"**
- Check GEMINI_API_KEY in .env.local
- Check API quota/limits

**Script doesn't display**
- Check if data saved to Firestore
- Check real-time subscription
- Try refreshing the page

## 📊 Expected Output

### Metadata:
- Pages: ~5
- Scenes: 6-10
- Characters: 3-5
- Runtime: ~5 minutes

### Format Example:
```
FADE IN:

INT. LOCATION - DAY

Action description in present tense, describing what we see and hear.

CHARACTER NAME
Dialogue goes here, centered under the 
character name.

CHARACTER NAME
(parenthetical)
More dialogue with a note about how 
it's delivered.

CUT TO:

FADE OUT.
```

## 🎯 Success Criteria

Test is successful if:
1. Script generates without errors
2. Content is based on your episode
3. Format matches industry standard
4. 5 pages, ~5 minutes runtime
5. No made-up characters or plot points
6. Dialogue is natural and expanded
7. Action descriptions are cinematic
8. Data persists in Firestore

## 💬 Report Back

After testing, let me know:
- ✅ Success: "Script generated successfully!"
- 🐛 Errors: Share console errors or issues
- 💭 Quality: Does it feel "Hollywood grade"?
- 🎨 Formatting: Does it look professional?
- 📝 Content: Does it match your episode?

## 🔧 Technical Details

**What's Running:**
- Dev server: http://localhost:3000
- API endpoint: /api/generate/scripts
- AI provider: Gemini 2.5 Pro
- Data source: Firestore + Episode Service

**What It Does:**
1. Fetches your episode data
2. Fetches story bible context
3. Sends to Gemini 2.5 Pro
4. Parses into structured screenplay
5. Saves to Firestore
6. Updates UI via real-time subscription

---

## 🎬 Let's Test It!

**Open**: http://localhost:3000/workspace

**Then**: Navigate to Episode 1 → Pre-Production → Scripts → Generate

**Let me know how it goes!** 🚀


