# 🎬 Narrative Coherence Testing Suite

This comprehensive test suite validates that the Reeled AI application maintains **complete narrative coherence** across all components - from story bible creation through episode generation to pre-production content.

## 🎯 What These Tests Validate

### ✅ **End-to-End Narrative Flow**
- Story bible generation with adaptive structure
- Episode generation with user choice integration
- Dynamic story bible updates based on user decisions
- Pre-production content using actual workspace episodes
- Cross-content character and plot consistency

### ✅ **User Choice Coherence**
- Previous decisions influence future episodes
- Character relationships evolve based on choices
- Plot threads continue consistently
- Dialogue maintains character voice patterns

### ✅ **Content Consistency** 
- All scripts reference the same characters and events
- Storyboards reflect visual continuity from episodes
- Casting notes align with character developments
- New characters/locations propagate across all content

## 🚀 Quick Start

### Prerequisites
1. **Development server running**: `npm run dev`
2. **Dependencies installed**: `npm install`
3. **API keys configured** in `.env.local`

### Run All Tests
```bash
# Make script executable (one time only)
chmod +x run_narrative_coherence_tests.sh

# Run complete test suite
./run_narrative_coherence_tests.sh
```

## 📋 Test Components

### 1. **API Coherence Tests** (`comprehensive_narrative_coherence_test.js`)
Automated backend testing covering:
- ✅ Story bible generation with variable episode counts
- ✅ Episode generation with user choice context
- ✅ Dynamic story bible adaptation
- ✅ Pre-production content using workspace data
- ✅ Cross-content narrative validation

**Run individually:**
```bash
node comprehensive_narrative_coherence_test.js
```

### 2. **UI Workflow Tests** (`ui_workflow_coherence_test.html`)
Interactive frontend testing including:
- ✅ Story creation workflow simulation
- ✅ Episode generation with choice tracking
- ✅ Pre-production content validation
- ✅ Real-time coherence monitoring

**Run in browser:**
```bash
# Option 1: Direct file access
open ui_workflow_coherence_test.html

# Option 2: Local server
python3 -m http.server 8080
# Then open: http://localhost:8080/ui_workflow_coherence_test.html
```

## 📊 Understanding Test Results

### **Success Criteria**
- **90-100%**: 🟢 **EXCELLENT** - Narrative fully coherent
- **75-89%**: 🟡 **GOOD** - Minor coherence issues  
- **60-74%**: 🟠 **FAIR** - Significant coherence gaps
- **<60%**: 🔴 **POOR** - Major coherence problems

### **Key Metrics Tracked**
- **Story Bible Structure**: Adaptive episodes, character consistency
- **Episode Integration**: User choice references, character development
- **Cross-Content Coherence**: Character names, plot threads, choice consequences
- **Visual Continuity**: Storyboard consistency, location references

## 🔧 Test Phases Explained

### **Phase 1: Story Bible Generation**
Tests the foundation of narrative coherence:
```javascript
// Validates adaptive episode structure
const episodeCounts = storyBible.narrativeArcs.map(arc => arc.episodes.length);
const hasVariableEpisodes = new Set(episodeCounts).size > 1;
```

### **Phase 2: Episode Generation with Choices**
Tests user choice integration:
```javascript
// Episode 2 should reference Episode 1 choice
const episode2Content = JSON.stringify(episode2).toLowerCase();
const referencesChoice = episode2Content.includes(userChoice.text.toLowerCase());
```

### **Phase 3: Dynamic Story Bible Updates**
Tests story bible adaptation:
```javascript
// Story bible should track user choices and new elements
updatedBible.fanChoices = userChoices.map(choice => ({
  episode: choice.episodeNumber,
  choice: choice.choiceText,
  impact: `Shaped Episode ${choice.episodeNumber + 1}`
}));
```

### **Phase 4: Pre-Production Coherence**
Tests workspace integration:
```javascript
// Pre-production should use actual workspace episodes
const scriptContent = JSON.stringify(scriptResult.data.content);
const referencesWorkspace = scriptContent.includes(workspaceEpisode.title);
```

### **Phase 5: Cross-Content Validation**
Tests overall narrative consistency:
```javascript
// All content should reference the same characters
characterNames.forEach(name => {
  const allContentStr = JSON.stringify(allContent).toLowerCase();
  const isConsistent = allContentStr.includes(name.toLowerCase());
});
```

## 📄 Test Reports

### **API Test Report** (`narrative_coherence_test_report.json`)
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "summary": {
    "totalTests": 15,
    "passedTests": 14,
    "successRate": 93,
    "coherenceAssessment": "🟢 EXCELLENT - Narrative fully coherent"
  },
  "detailedResults": [...],
  "testData": {
    "storyBible": {...},
    "episodes": {...},
    "userChoices": [...]
  }
}
```

## 🐛 Troubleshooting

### **Common Issues**

#### **"Server not running"**
```bash
# Start development server
npm run dev
```

#### **"API test file not found"**
```bash
# Ensure you're in the project root
ls -la comprehensive_narrative_coherence_test.js
```

#### **"Missing dependencies"**
```bash
# Install required packages
npm install
```

#### **Tests failing due to API keys**
```bash
# Check .env.local configuration
cat .env.local | grep -E "(GEMINI|AZURE)"
```

### **Expected Failures**
Some tests may fail during development. Common acceptable failures:
- **Azure OpenAI tests** if using Gemini only
- **Image generation tests** without Unsplash keys
- **Firebase tests** without database configuration

## 🎯 Using Tests for Development

### **Before Making Changes**
```bash
# Establish baseline
./run_narrative_coherence_tests.sh
```

### **After Implementing Features**
```bash
# Validate coherence maintained
./run_narrative_coherence_tests.sh
```

### **Debugging Coherence Issues**
1. Check specific test failures in the report
2. Examine `testData` section for actual content
3. Use browser UI tests for visual validation
4. Add console logs to track data flow

## 🔄 Continuous Integration

### **Pre-commit Hook**
```bash
#!/bin/sh
# Run coherence tests before commits
./run_narrative_coherence_tests.sh || exit 1
```

### **GitHub Actions**
```yaml
- name: Run Narrative Coherence Tests
  run: |
    npm run dev &
    sleep 30
    ./run_narrative_coherence_tests.sh
```

## 📚 Additional Resources

- **API Documentation**: See individual route files in `src/app/api/`
- **Component Tests**: Check `src/components/` for component-specific logic
- **Story Bible Logic**: Review `src/app/story-bible/page.tsx`
- **Episode Generation**: Examine `src/app/episode/[id]/page.tsx`

---

## 🏁 Success Criteria Summary

**The narrative coherence test suite passes when:**

✅ Story bible adapts dynamically to user choices  
✅ Episodes reference previous decisions and developments  
✅ Pre-production content uses actual workspace episodes  
✅ Character developments propagate across all content types  
✅ Plot threads continue consistently throughout the series  
✅ Visual content maintains character and location continuity  
✅ All generated content references the same evolving story

**Result: Single, coherent narrative maintained across the entire application! 🎬** 