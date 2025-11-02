# Script Generation Issues - Identified & Need Fixing

## 🚨 **Critical Formatting Problems**

### 1. **HTML Tags Showing in Script**
**Problem:** Character names displaying as `<center>ROJAS</center>` instead of plain `ROJAS`

**Cause:** AI outputting HTML/markdown that parser doesn't strip

**Fix Needed:** Pre-process AI output to remove all HTML tags before parsing

### 2. **Dialogue Has Wrong Prefix**
**Problem:** Dialogue showing as `> Dialogue text` with `>` character

**Cause:** AI using markdown blockquote format

**Fix Needed:** Strip `>` prefix from lines before parsing

### 3. **Markdown Showing as Text**
**Problem:** `**BOLD TEXT**` showing asterisks instead of being bold

**Cause:** Parser treating markdown as literal text

**Fix Needed:** Convert markdown to proper formatting or strip it

### 4. **Wrong Data Structure**
**Current Structure:**
```typescript
{
  title: string
  pages: ScriptPage[]  // Array of pages with elements
  metadata: { pageCount, sceneCount, characterCount }
}
```

**Renderer Expects:**
```typescript
{
  title: string
  scenes: Scene[]  // Array of scenes with dialogue
  metadata: { ... }
}
```

**Mismatch:** Generator creates `pages` structure, but ScriptRenderer expects `scenes` structure

### 5. **Metadata Showing Zeros**
- Shows "0 Scenes • 0 Characters"
- Actual script has 3-4 scenes and 3 characters (ROJAS, NEXUS-7, SCRAP)
- Metadata calculation is wrong or data structure mismatch

## 📊 **Actual vs Expected Comparison**

### What AI Generated:
- 4 pages of script content
- Markdown/HTML mixed format
- Text-based structure

### What Was Rendered:
- HTML tags as literal text
- Blockquote `>` characters in dialogue
- Markdown `**` showing
- Wrong metadata (0 scenes, 0 characters)

## 🔧 **Required Fixes**

### Priority 1: Parser Pre-Processing
```typescript
function cleanAIOutput(text: string): string {
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '')
  // Remove blockquote markers
  text = text.replace(/^>\s*/gm, '')
  // Clean up markdown bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1')
  return text
}
```

### Priority 2: Data Structure Alignment
- Either: Fix generator to output `scenes` array
- Or: Fix renderer to accept `pages` array
- Current: Mismatch causing display issues

### Priority 3: Metadata Calculation
- Fix scene counting logic
- Fix character extraction
- Ensure metadata reflects actual content

### Priority 4: Episode Content Validation
**CRITICAL**: Need to verify if AI actually used episode content or invented its own story
- Compare generated script with episode scenes
- Check if characters match episode characters  
- Verify plot points align with episode content

## 🎬 **Episode Content Check Needed**

Cannot verify episode fidelity without access to original episode data. Need to:
1. Fetch Episode 1 from Firestore
2. Compare scenes, characters, plot points
3. Verify AI didn't invent new narrative

**Current Status:** Episode data not accessible via browser localStorage (authenticated mode stores in Firestore only)

## ✅ **Next Steps**

1. **Fix parser to clean AI output** - Remove HTML/markdown
2. **Align data structures** - Match generator output with renderer expectations
3. **Fix metadata calculation** - Count scenes/characters correctly
4. **Verify episode fidelity** - Compare generated script with source episode
5. **Update AI prompt** - Ensure clean plain-text output without HTML/markdown

---

**Generated:** 10/30/2025
**Status:** Issues identified, fixes pending


