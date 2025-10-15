# Episode Engine Loader

A cinematic, in-brand loading screen for episode generation that showcases the engines being used with simulated progress and elapsed time tracking.

## Features

- **Simulated Progress**: No live binding required - smooth, predictable animation
- **Engine Visualization**: Shows different steps based on `useEngines` setting
- **Elapsed Timer**: MM:SS format display next to progress percentage
- **Brand Consistent**: Uses the same gold/onyx gradient as UltimateEngineLoader
- **Responsive Design**: Adapts grid layout based on number of steps

## Engine Modes

### With Engines (5 steps)
1. **🌊 Narrative Blueprint** - Structuring episode outline
2. **💬 Strategic Dialogue** - Sharpening character voice  
3. **⚡ Tension Escalation** - Tightening dramatic beats
4. **🔀 Choice Quality** - Aligning stakes & outcomes
5. **🧠 Final Synthesis** - Composing the episode

### Without Engines (3 steps)
1. **🌊 Narrative Blueprint** - Structuring episode outline
2. **📖 Story-Bible Synthesis** - Grounding in the bible
3. **🧠 Final Polish** - Composing the episode

## Usage

### Basic Implementation

```tsx
import EpisodeEngineLoader from '@/components/EpisodeEngineLoader'

function MyComponent() {
  const [isGenerating, setIsGenerating] = useState(false)
  
  const generateEpisode = async () => {
    setIsGenerating(true)
    try {
      await fetch('/api/generate/episode', { /* ... */ })
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <>
      <button onClick={generateEpisode}>Generate Episode</button>
      
      <EpisodeEngineLoader
        open={isGenerating}
        episodeNumber={1}
        seriesTitle="My Series"
        useEngines={true}
        onDone={() => console.log('Loader finished')}
      />
    </>
  )
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controls loader visibility |
| `episodeNumber` | `number` | - | Episode number to display |
| `seriesTitle` | `string` | - | Series title for context |
| `useEngines` | `boolean` | `true` | Toggle between 5-step and 3-step modes |
| `onDone` | `() => void` | - | Callback when simulation completes |
| `estimatedMs` | `number` | - | Override total duration (auto-calculated if not provided) |

## Integration with Episode Generation

### 1. Show loader before API call
```tsx
const [isGenerating, setIsGenerating] = useState(false)

const handleGenerate = async () => {
  setIsGenerating(true) // Show loader
  
  try {
    const response = await fetch('/api/generate/episode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyBible,
        episodeNumber,
        useEngines: true // Pass to API
      })
    })
    
    const data = await response.json()
    // Handle response...
    
  } catch (error) {
    // Handle error...
  } finally {
    setIsGenerating(false) // Hide loader
  }
}
```

### 2. Pass useEngines to match API behavior
```tsx
<EpisodeEngineLoader
  open={isGenerating}
  episodeNumber={episodeNumber}
  seriesTitle={storyBible.seriesTitle}
  useEngines={useEngines} // Match the API request
  onDone={() => {
    // Optional: Called when simulation reaches 100%
    // You might want to keep loader open until API responds
  }}
/>
```

## Customization

### Step Durations
The component automatically calculates step durations, but you can override with `estimatedMs`:

```tsx
<EpisodeEngineLoader
  open={isGenerating}
  estimatedMs={5000} // 5 seconds total
  // ... other props
/>
```

### Early Completion
If your API responds faster than the simulation, you can fast-forward:

```tsx
const [loaderComplete, setLoaderComplete] = useState(false)

// When API responds
setLoaderComplete(true) // This will fast-forward to 100%

<EpisodeEngineLoader
  open={isGenerating}
  onDone={() => setLoaderComplete(false)}
  // ... other props
/>
```

## Styling

The component uses Tailwind CSS classes and follows the brand color scheme:
- **Primary**: `#e2c376` (gold)
- **Secondary**: `#f0d995` (light gold)  
- **Background**: `#0a0a0a` to `#171717` (dark gradient)
- **Text**: `#e7e7e7` (light gray)

## Animation

- **Entrance/Exit**: Fade in/out with `AnimatePresence`
- **Progress Bar**: Smooth width animation
- **Step Transitions**: Staggered scale animations with delays
- **Active Step**: Pulsing animation with ⚡ icon
- **Completed Steps**: ✅ checkmark with green styling

## Performance

- Uses `requestAnimationFrame` for smooth 60fps updates
- Timer updates every second (not every frame)
- Automatic cleanup of intervals and animation frames
- Minimal re-renders with proper state management

## Examples

See the demo components:
- `EpisodeEngineLoaderDemo.tsx` - Interactive demo with controls
- `EpisodeGenerationExample.tsx` - Real API integration example

## Notes

- **Simulated**: This is not a live progress tracker - it's a smooth loading animation
- **Timing**: Step durations are randomized within ranges for natural feel
- **Responsive**: Grid adapts from 5 columns (engines) to 3 columns (no engines)
- **Accessibility**: Respects reduced motion preferences
- **Brand**: Consistent with existing Murphy Engine visual identity 