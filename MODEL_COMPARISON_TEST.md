# 🧪 Model Comparison Test

## Purpose

This test compares **GPT-4.1 (Azure OpenAI)** vs **Gemini 2.5 Pro (Google)** for narrative prose generation to determine which model produces better, more cohesive content for your episodes.

## How to Run the Test

### Option 1: Web UI (Easiest)

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to:
   ```
   http://localhost:3000/model-test
   ```

3. Click **"Run Comparison Test"**

4. Wait 30-60 seconds while both models generate the same episode in parallel

5. Review the side-by-side comparison

### Option 2: API Direct (For Multiple Tests)

```bash
curl -X POST http://localhost:3000/api/test-model-comparison \
  -H "Content-Type: application/json" \
  -d '{}'
```

## What Gets Tested

Both models receive the **identical prompt** for:

**Test Scenario:**
- Series: "The Last Haven" (post-apocalyptic drama)
- Episode 3: Water crisis with sabotage suspicion
- Character: Elena facing trust issues with former partner
- Requirements: Narrative prose, 2-3 scenes, natural dialogue

**Both models must:**
- Write in engaging narrative prose (book-like, not script)
- Create rich character interiority
- Weave dialogue naturally
- Build atmospheric descriptions
- Create tension toward a choice
- Provide 3 branching options

## Metrics Compared

### 1. **Speed** ⚡
- Total generation time
- Which model is faster and by how much

### 2. **Content Length** 📝
- Total word count
- Words per scene
- Scene count

### 3. **Prose Quality** ✍️
- Paragraph structure
- Dialogue instances
- Words per paragraph
- **Script formatting detected (bad!)**
- **Action lines detected (bad!)**

### 4. **Quality Score** ⭐
Automated scoring based on:
- Ideal word count (800-1500)
- Scene count (2-3 preferred)
- Paragraph length (150-300 words)
- Dialogue balance (5-15 instances)
- **Penalties for script formatting**
- Valid branching options (3 required)

## How to Interpret Results

### Speed Winner
- **Faster is better** for user experience
- But only if quality is maintained

### Content Length
- **800-1500 words is ideal** for 5-minute episodes
- Too short = feels rushed
- Too long = loses focus

### Quality Score
- **Higher score = better automated metrics**
- But **read the actual content** - metrics don't tell the whole story

### Most Important: READ THE CONTENT
The automated metrics are helpful, but **you need to read the actual scenes** to determine:
- Which prose is more engaging?
- Which dialogue feels more natural?
- Which creates better atmosphere?
- Which you'd rather read and review?

## What to Look For

### ✅ Good Narrative Prose:
```
Elena's fingers traced the crack in the filtration membrane, 
cold water seeping through the worn rubber of her gloves. 
Twenty years of constant use had worn the system thin, but 
this wasn't age. The cut was clean, deliberate. Sabotage.

"Found something?" Marcus's voice echoed in the narrow chamber.

She didn't turn. Couldn't. The last time she'd trusted his 
voice in the dark, it had led to six months in the Council's 
detention cells.
```

### ❌ Bad Script Format:
```
INT. FILTRATION CHAMBER - DAY

Elena examines the membrane. She sees a crack.

ELENA
This looks deliberate.

MARCUS
(from behind her)
Found something?

Elena doesn't respond. She remembers the betrayal.
```

## Expected Results

Based on general AI model capabilities:

### GPT-4.1 Strengths:
- Consistent quality
- Good dialogue
- Follows instructions precisely
- Strong at structure

### Gemini 2.5 Pro Strengths:
- More creative/varied prose
- Better at long-form narrative
- 2M token context (vs 128K)
- Sometimes more "literary"

### Wild Card:
Both models are highly capable. The winner might come down to:
- Your subjective preference
- Which style matches your vision
- Cost considerations (if applicable)
- Speed requirements

## After Testing

Based on results, we'll:

1. **Choose the better model** for your default episode generation
2. **Optionally offer both** as user choices
3. **Tune prompts** for the winner to maximize quality
4. **Proceed with architecture improvements** (dynamic structure, engine removal)

## Custom Tests

Want to test your own scenario? Modify the test:

```typescript
// In /src/app/api/test-model-comparison/route.ts
const testScenario = {
  title: "Your Series Title",
  storyContext: "Your series setup...",
  episodePrompt: "Your specific episode scenario...",
  previousChoice: "Previous episode choice..."
}
```

Then POST to the API with your custom scenario:

```bash
curl -X POST http://localhost:3000/api/test-model-comparison \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": {
      "title": "Your Test",
      "storyContext": "...",
      "episodePrompt": "...",
      "previousChoice": "..."
    }
  }'
```

## Next Steps

After you've reviewed the test results:

1. **Tell me which model you prefer** (or if it's a tie)
2. **Share any specific observations** about quality differences
3. **We'll configure the winner** as the default
4. **Then proceed** with dynamic structure and engine removal

## Notes

- Both models use **temperature 0.9** (high creativity)
- Both get **identical prompts** (fair comparison)
- Both use **JSON output mode** for consistency
- Test runs both models **in parallel** (faster results)
- You can run multiple tests to see consistency

---

Ready to find out which AI writes better stories? 🎬










