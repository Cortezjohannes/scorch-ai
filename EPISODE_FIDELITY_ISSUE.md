# Episode Fidelity Issue - CRITICAL

## Problem
**The AI is STILL adding characters and plot elements not in the original episode, despite ultra-strict prompts.**

## Evidence from Regenerations

### Script 1 (Original):
- **3 characters**: Rojas, Nexus-7, **KAI** (tech specialist)
- Location: DATA-DEN with KAI scene

### Script 2 (After Ultra-Strict Prompt):
- **2 characters**: Rojas, Nexus-7
- ✅ **KAI removed** (good!)
- Locations: INDUSTRIAL ALLEY, ROJAS'S SPINNER, SUB-LEVEL DATA DEN

### Script 3 (Second Regeneration):
- **5 characters**: Rojas, Nexus-7, **WITNESS**, **BUREAU CHIEF**, **VOICE (V.O.)**
- ❌ **Added 3 new characters!**
- Locations: AETHELBURG STREETS, AETHELBURG CENTRAL PRECINCT, THE SUMP, GLITCH BAR

## Root Cause Analysis

### Hypothesis 1: Episode Data is Sparse
If the episode only has minimal content (e.g., "Rojas and Nexus-7 investigate a murder"), the AI is **filling gaps** with invented elements because the prompt asks for a "5-page Hollywood-grade script."

### Hypothesis 2: Prompt Interpretation
The AI interprets "expand dialogue" and "add cinematic descriptions" as permission to add **supporting characters** (witness, chief, etc.) to make the story work as a 5-minute screenplay.

### Hypothesis 3: Episode Actually Contains These Elements
The episode might actually have these characters/locations, and we need to verify the source data.

## What We Need to Do

### 1. **VERIFY EPISODE CONTENT** (Priority #1)
We MUST see the actual Episode 1 data to know:
- How many characters are actually in the episode?
- How many scenes are actually in the episode?
- What locations are actually in the episode?
- How much dialogue/content exists?

**Without this, we're shooting in the dark.**

### 2. **Adjust Prompt Based on Episode Density**

**If Episode is Sparse:**
- Modify prompt to explicitly state: "Do NOT add supporting characters to fill story gaps"
- Add: "If the episode only has 2 characters, the script must only have 2 characters"
- Add: "Do NOT add witnesses, chiefs, or background characters with dialogue"

**If Episode is Detailed:**
- The prompt is working, but needs consistency enforcement
- Add character validation step before returning script

### 3. **Add Validation Layer**
Before accepting the AI's output, validate:
```typescript
function validateScriptFidelity(script, episode) {
  const episodeCharacters = extractCharacters(episode)
  const scriptCharacters = extractCharactersFromScript(script)
  
  // Check if script added characters
  const addedCharacters = scriptCharacters.filter(c => 
    !episodeCharacters.some(ec => ec.name === c.name)
  )
  
  if (addedCharacters.length > 0) {
    throw new Error(`Script added unauthorized characters: ${addedCharacters.join(', ')}`)
  }
}
```

## Temporary Workaround

Until we can verify episode content, add this to the prompt:

```
**ABSOLUTE CHARACTER RESTRICTION:**
ONLY use these exact character names:
- [LIST FROM EPISODE]

If you include ANY character not on this list - even as "WITNESS", "VOICE (V.O.)", "CHIEF", "CROWD", etc. - you have FAILED.

NO background characters with dialogue.
NO unnamed characters with dialogue.
NO voices, no crowds, no chiefs, no witnesses.

ONLY the characters explicitly listed above.
```

## Status
🔴 **BLOCKED** - Need to verify actual episode content to proceed

## Next Steps
1. View Episode 1 in the browser (navigate to wherever episodes are displayed)
2. Extract character list, scene list, location list from episode
3. Compare with generated scripts to identify discrepancies
4. Adjust prompts or add validation based on findings

---
*Created: October 30, 2025*
*Issue: AI adds 2-5 characters across regenerations despite ultra-strict prompts*


