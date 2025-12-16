# VEO 3.1 API Limitations & Parameter Support

## Documentation Findings

Based on official Google VEO 3.1 API documentation:

### Quality Mode (`veo-3.1-generate-preview`)

**✅ SUPPORTS:**
- **Duration**: 4, 6, or 8 seconds per clip (NOT 15, 30, or 60 seconds)
- **Aspect Ratio**: 
  - `16:9` (horizontal/widescreen) ✅
  - `9:16` (vertical/portrait) ✅
- **Audio Generation**: `true` or `false` ✅
- **API Parameters**: 
  - `video_length_seconds`: 4, 6, or 8
  - `aspect_ratio`: "16:9" or "9:16"
  - `generate_audio`: true/false

### Fast Mode (`veo-3.1-fast-generate-preview`)

**✅ SUPPORTS:**
- **Duration**: 4, 6, or 8 seconds (via `durationSeconds` in config)
- **Aspect Ratio**: 
  - `16:9` (horizontal/widescreen) ✅
  - `9:16` (vertical/portrait) ✅
- **Resolution**: 720p (default) or 1080p (via `resolution` in config)
- **Audio Generation**: ⚠️ **ALWAYS GENERATES AUDIO** (cannot be disabled)
  - Despite documentation saying Fast Mode doesn't support audio, the API always generates it
  - `negativePrompt` can be used to discourage audio, but it's not guaranteed to work
- **API Parameters** (via SDK config object):
  - `aspectRatio`: "16:9" or "9:16"
  - `resolution`: "720p" or "1080p"
  - `durationSeconds`: 4, 6, or 8 (number)
  - `negativePrompt`: string (to discourage unwanted content)

## Key Findings

1. **Maximum clip length is 8 seconds** - To create longer videos, you need to chain multiple clips together
2. **Fast Mode supports both 16:9 and 9:16** - Both aspect ratios are supported (per official documentation)
3. **Fast Mode limitations**:
   - No audio generation (always silent)
   - All parameters must be specified in prompt text (API doesn't accept separate parameters)
4. **Quality Mode is required** for:
   - Audio generation
   - Full parameter control via API

## Implementation Changes Made

1. ✅ Updated UI to only show valid durations: 4, 6, 8 seconds
2. ✅ Added validation to reject invalid durations
3. ✅ Removed validation blocking 9:16 in Fast Mode (now supported per official docs)
4. ✅ Default resolution set to 720p to save costs
5. ✅ Removed fallback to simulated responses (prevents token waste)
6. ✅ All specifications (duration, aspect ratio, resolution) included in prompt text

## Cost Implications

- **Quality Mode with audio**: $0.40/second
- **Quality Mode without audio**: $0.20/second
- **Fast Mode** (no audio, 16:9 only): $0.10/second

## Recommendations

1. Use **Quality Mode** when you need:
   - Vertical (9:16) videos
   - Audio generation
   - Full control over parameters

2. Use **Fast Mode** when:
   - You need 16:9 or 9:16 videos
   - You don't need audio
   - You want lower cost ($0.10/sec vs $0.40/sec)
   - You want 720p resolution (default, saves costs)

3. For videos longer than 8 seconds:
   - Generate multiple 4-8 second clips
   - Chain them together in post-production

