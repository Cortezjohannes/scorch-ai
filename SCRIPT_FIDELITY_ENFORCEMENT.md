# Script Fidelity Enforcement - ABSOLUTE ADHERENCE TO EPISODE

## Problem Identified
The user reported that the AI was **adding new plot elements** when regenerating scripts, and scripts were **changing too much between generations**, indicating the AI was being creative rather than strictly adapting the episode content.

## User's Requirement (Direct Quote)
> "THE EPISODE SHOULD BE THE ALPHA AND OMEGA EVERYTHING HAS BE RELATED TO IT DO NOT ADD NEW PLOT ELEMENTS IN THE SCRIPT"

## Solution Implemented

### 1. **Completely Rewritten System Prompt** (`buildSystemPrompt()`)

**Before:** Vague guidelines about "strict fidelity" and "expansion not invention"

**After:** **ABSOLUTE RULES - NON-NEGOTIABLE** framework:

```
1. THE EPISODE IS THE ALPHA AND OMEGA
   - Episode content is ONLY source material
   - FORBIDDEN from adding ANY plot elements
   - FORBIDDEN from adding ANY characters
   - FORBIDDEN from adding ANY locations
   - FORBIDDEN from adding ANY story beats
   - FORBIDDEN from changing sequence of events
   - FORBIDDEN from inventing backstory, motivations, subplots

2. YOUR ONLY JOB IS SCREENPLAY FORMATTING
   - Format existing scenes as screenplay
   - Expand dialogue (same meaning, better flow)
   - Add visual/cinematic descriptions to enhance what's ALREADY there
   - Add screenplay elements (slugs, parentheticals, transitions)

3. WHAT YOU CAN DO:
   - Format with proper slug lines
   - Add cinematic action descriptions
   - Expand dialogue naturally
   - Add parentheticals for direction
   - Describe character emotions/body language
   - Make script production-ready

4. WHAT YOU CANNOT DO:
   - Add new characters (even extras)
   - Add new locations or scenes
   - Add new plot points
   - Change character relationships
   - Invent backstories
   - Add subplots
   - Change beginning/middle/end
   - Add "creative flourishes"
```

### 2. **Enhanced User Prompt with Explicit Boundaries** (`buildUserPrompt()`)

Added **STRICT BOUNDARIES** section that explicitly lists:

#### A. **ALLOWED CHARACTERS** (extracted from episode)
Lists every single character by name with clear instruction: "use ONLY these, no new characters"

#### B. **ALLOWED LOCATIONS** (extracted from episode)
Lists every single location with clear instruction: "use ONLY these, no new locations"

#### C. **REQUIRED SCENES** (extracted from episode)
Lists every scene with location and time, in order, with instruction: "include ALL, in this order, add NOTHING new"

#### D. **ABSOLUTE FIDELITY Requirements**
```
1. ABSOLUTE FIDELITY: Use ONLY the episode content above
   - NO new characters (not even unnamed extras)
   - NO new locations or scenes
   - NO new plot points or story beats
   - If it's not listed above, DON'T ADD IT

2. FORMAT: Use proper screenplay formatting
   - Plain text only
   - Standard conventions

3. LENGTH: Target 5 pages

4. YOUR JOB: Adapt the episode into formatted screenplay
   - Expand dialogue (same meaning)
   - Add cinematic descriptions (visualize what's there)
   - Add screenplay elements
   - Hollywood-quality WITHOUT changing story
```

### 3. **Final Emphatic Reminder** (End of Prompt)

Added a highly visible final reminder:

```
**═══════════════════════════════════════**
**CRITICAL FINAL REMINDER:**
**═══════════════════════════════════════**

❌ DO NOT ADD: New characters, locations, plot points, scenes, or story beats
❌ DO NOT CHANGE: The sequence of events, character relationships, or story outcomes
❌ DO NOT INVENT: Backstories, motivations, or subplots not in the episode

✅ DO EXPAND: Sparse dialogue into natural speech (same meaning)
✅ DO ADD: Cinematic action descriptions that visualize what's already there
✅ DO FORMAT: Properly with slugs, parentheticals, and transitions

YOU ARE ADAPTING, NOT CREATING. THE EPISODE IS EVERYTHING.
If you add even ONE element not in the episode, you have FAILED.

Output ONLY the screenplay starting with "FADE IN:" and ending with "THE END".
No introduction, no notes, no explanation.
```

## Key Changes Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Tone** | Permissive ("may expand") | **Restrictive ("FORBIDDEN")** |
| **Boundaries** | Vague guidelines | **Explicit lists of allowed elements** |
| **Emphasis** | Mentioned once | **Repeated 4+ times throughout prompt** |
| **Clarity** | "Strict fidelity" (subjective) | **Itemized lists + visual separators** |
| **Consequences** | None stated | **"You have FAILED" explicit warning** |

## Expected Behavior After Fix

### ✅ Scripts Will Now:
1. Use **ONLY** characters from the episode
2. Use **ONLY** locations from the episode
3. Include **ONLY** scenes from the episode (in order)
4. Follow **ONLY** plot beats from the episode
5. Maintain **100% consistency** between regenerations (same story, different cinematic descriptions)

### ✅ AI Will:
- Expand terse dialogue into natural speech (same meaning)
- Add cinematic action descriptions (visualize existing story)
- Add proper screenplay formatting elements
- Make it production-ready

### ❌ AI Will NOT:
- Add new characters (including unnamed extras)
- Add new locations
- Add new scenes or story beats
- Change character relationships
- Invent backstories or motivations
- Add subplots or side narratives
- Change the sequence of events
- Add creative flourishes that alter narrative

## Testing Required

1. **Regenerate script multiple times** - should tell the SAME story with minimal variation
2. **Compare script to episode** - every element should trace back to episode
3. **Check for additions** - no characters, locations, or plot points not in episode
4. **Verify consistency** - regenerations should be consistent in story, varied only in prose/description

## File Modified

**`/src/services/ai-generators/script-generator.ts`**
- Lines 87-146: Completely rewritten `buildSystemPrompt()`
- Lines 207-282: Enhanced `buildUserPrompt()` with explicit boundaries and final reminder

## Status

**✅ PROMPT ENFORCEMENT MASSIVELY STRENGTHENED**

The AI now has:
- **7 explicit "FORBIDDEN" statements**
- **Itemized lists of allowed elements** (characters, locations, scenes)
- **4 repetitions of "do not add" warnings** throughout the prompt
- **Visual emphasis** with borders and emojis
- **Explicit failure condition** stated

**The episode is now treated as THE ABSOLUTE SOURCE OF TRUTH.**

---
*Updated: October 30, 2025*
*Addressing: Script consistency and fidelity to episode content*


