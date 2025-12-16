# Marketing Features Documentation

## Overview

The Marketing Features system provides comprehensive marketing strategy generation and tools for actor-driven UGC episodic content. It integrates marketing at three levels:

1. **Story Bible Level**: Overall series marketing strategy
2. **Arc Level**: Arc-specific marketing approach
3. **Episode Level**: Episode-specific marketing hooks, viral moments, and ready-to-use content

## Features Implemented

### 1. Story Bible Marketing Section

**Location**: Story Bible → Marketing Tab

**Features**:
- Marketing Strategy Overview (primary approach, target audience, key selling points)
- Platform-Specific Strategies (TikTok, Instagram, YouTube) with tabs
- Marketing Hooks (episode, series, character hooks with variations)
- Distribution Timeline (pre-launch, launch, post-launch)
- UGC Strategy (actor marketing, authenticity, community building)
- Peer Casting Loop strategy and deliverables
- KPIs & Metrics (completion rate, velocity, share ratio, series conversion)
- Compliance & Legal (AI disclosure, IP ownership)
- Ready-to-Use Content (captions, hashtags, templates per platform)
- Copy-to-clipboard functionality for all marketing content

**Data Source**: Generated automatically during story bible generation via Marketing Engine

### 2. Episode Pre-Production Marketing Tab

**Location**: Episode Pre-Production → Marketing Tab

**Features**:
- Episode-specific marketing hooks
- Viral potential scenes with timestamps and platform recommendations
- Platform-specific content (TikTok, Instagram, YouTube)
- Ready-to-use posts (complete posts with captions + hashtags)
- Integration with story bible marketing strategy
- Manual "Scan for Viral Moments" button (AI-powered script analysis)
- Copy-to-clipboard for all content

**Data Source**: 
- Generated automatically during pre-production generation
- Can be manually scanned using the "Scan for Viral Moments" button

### 3. Production Assistant Marketing Tab

**Location**: Production Assistant → Marketing Tab

**Features**:
- Arc-level marketing strategy
- Cross-episode marketing themes
- Arc launch strategy (pre-launch, launch, post-launch)
- Platform-specific strategies
- Integration with story bible marketing

**Data Source**: Generated during production assistant generation (future enhancement)

### 4. Viral Potential Scanner

**Service**: `src/services/viral-potential-scanner.ts`

**Features**:
- AI-powered script analysis for viral moments
- Identifies scenes with high viral potential (slaps, kisses, shocking reveals, etc.)
- Generates timestamps, viral scores (1-10), and platform recommendations
- Creates hook variations, captions, and hashtags for each moment
- Automatically runs during episode pre-production generation
- Can be manually triggered from Episode Marketing Tab

**Output Structure**:
```typescript
{
  viralMoments: Array<{
    sceneNumber: number
    timestamp: string
    description: string
    viralScore: number (1-10)
    hookVariations: string[]
    recommendedPlatform: 'tiktok' | 'instagram' | 'youtube'
    platformReason: string
    suggestedCaption: string
    suggestedHashtags: string[]
  }>
  topMoments: Array<{ /* top 3 moments */ }>
}
```

## Data Flow

1. **Story Bible Generation** → Marketing Engine → Marketing Strategy in Story Bible
2. **Episode Pre-Production Generation** → Episode Marketing Generation → Episode-specific marketing + Viral Scanner
3. **Production Assistant Generation** → Arc Marketing Generation → Arc-level marketing strategy
4. All marketing data references story bible marketing for consistency

## Usage Guide

### For Actors/Producers

#### Using Story Bible Marketing

1. Navigate to Story Bible → Marketing section
2. Review the Marketing Strategy Overview
3. Switch between platform tabs (TikTok, Instagram, YouTube) to see platform-specific strategies
4. Expand sections to see hooks, distribution timeline, UGC strategy, etc.
5. Use copy buttons to copy any marketing content to clipboard
6. Use ready-to-use posts directly in your social media campaigns

#### Using Episode Marketing

1. Navigate to Episode Pre-Production → Marketing tab
2. Review episode-specific marketing hooks
3. Check viral potential scenes with timestamps
4. Use ready-to-use posts for each platform
5. Click "Scan for Viral Moments" to analyze script for additional viral opportunities
6. Copy any content using the copy buttons

#### Using Arc Marketing

1. Navigate to Production Assistant → Marketing tab
2. Review arc-level marketing strategy
3. Check cross-episode themes
4. Review arc launch strategy timeline
5. Use platform-specific strategies

## API Limitations & Workarounds

### Hashtag Manager (Future Feature)

**Status**: Documented for future implementation

**Limitation**: Requires API access to trending hashtag data

**Current Workaround**: 
- Marketing engine generates relevant hashtags based on story context
- Manual research recommended for trending hashtags
- Use hashtag suggestions from marketing strategy as starting point

**Future Implementation**: 
- Integrate with social media APIs (TikTok, Instagram, YouTube)
- Real-time trending hashtag suggestions
- Hashtag performance tracking

### Peer Casting Loop Assistant (Future Feature)

**Status**: Documented for future implementation

**Limitation**: Requires automation for network effect tracking

**Current Workaround**:
- Manual coordination with co-stars
- Use marketing deliverables from story bible marketing section
- Track manually: 1 Main Feed Post, 3 Story Posts, 1 Collab Post per co-star

**Future Implementation**:
- Automated co-star notification system
- Marketing deliverable tracking
- Network effect analytics

### Content Density Tracker (Future Feature)

**Status**: Documented for future implementation

**Limitation**: Requires content tracking and analytics

**Current Workaround**:
- Manual tracking of derivative content (bloopers, table reads, reaction cams)
- Target: 10 minutes derivative content per 1 minute premium footage
- Use content ideas from marketing strategy

**Future Implementation**:
- Automated content tracking
- Content density ratio monitoring
- Derivative content suggestions

### KPI Dashboard (Future Feature)

**Status**: Documented for future implementation

**Limitation**: Requires real-time analytics API access

**Current Workaround**:
- Manual tracking of KPIs:
  - Completion Rate: >40% (track via platform analytics)
  - Velocity: >1,000 views/Hour 1 (track first-hour views)
  - Share Ratio: >1.5% (track shares vs views)
  - Series Conversion: >20% (track Ep 1 to Ep 2 conversion)
- Use KPI targets from story bible marketing section as benchmarks

**Future Implementation**:
- Real-time KPI dashboard
- Automated tracking from social media APIs
- Performance alerts and recommendations

### Marketing A/B Testing (Future Feature)

**Status**: Documented for future implementation

**Limitation**: Requires analytics API and testing framework

**Current Workaround**:
- Manual A/B testing:
  - Create variations of posts using hook variations from marketing strategy
  - Test different captions, hashtags, posting times
  - Track performance manually
  - Use top performers as templates

**Future Implementation**:
- Automated A/B testing framework
- Performance comparison dashboard
- Winner selection and optimization

### Mobile Quick Actions (Future Feature)

**Status**: Documented for future implementation

**Limitation**: Requires mobile app development

**Current Workaround**:
- Use web app on mobile browser
- Bookmark marketing sections for quick access
- Use copy-to-clipboard feature for quick content sharing

**Future Implementation**:
- Native mobile app
- Quick action widgets
- Push notifications for marketing reminders

## Integration Points

### Story Bible Marketing
- Provides foundation strategy for entire series
- Referenced by episode and arc marketing
- Contains ready-to-use content templates

### Episode Marketing
- Episode-specific hooks and content
- Viral moment identification
- Platform-optimized posts

### Arc Marketing
- Arc-level promotion strategy
- Cross-episode themes
- Arc launch timeline

### Viral Scanner
- Enhances episode marketing with actionable clips
- Provides timestamps for video editing
- Platform-specific recommendations

## Best Practices

1. **Start with Story Bible Marketing**: Review overall strategy before diving into episode-specific content
2. **Use Ready-to-Use Content**: Copy and paste directly from marketing sections
3. **Scan for Viral Moments**: Use the viral scanner to identify high-performing clips
4. **Platform Optimization**: Use platform-specific content (TikTok vs Instagram vs YouTube)
5. **Hook Variations**: Test different hook variations to see what resonates
6. **Timeline Adherence**: Follow distribution timeline (pre-launch, launch, post-launch)
7. **Authenticity**: Maintain UGC authenticity while using marketing strategies
8. **Community Building**: Leverage community building tactics from UGC strategy

## Technical Details

### Files Modified/Created

**Story Bible**:
- `src/components/story-bible/StoryBibleSidebar.tsx` - Added marketing section
- `src/components/story-bible/MarketingSection.tsx` - Marketing display component
- `src/app/story-bible/page.tsx` - Integrated marketing section
- `src/app/api/generate/story-bible/route.ts` - Enhanced marketing engine

**Episode Pre-Production**:
- `src/components/preproduction/EpisodePreProductionShell.tsx` - Added marketing tab
- `src/components/preproduction/tabs/EpisodeMarketingTab.tsx` - Episode marketing component
- `src/types/preproduction.ts` - Added EpisodeMarketingData type
- `src/services/preproduction-v2-generators.ts` - Enhanced marketing generation

**Production Assistant**:
- `src/components/preproduction/ArcPreProductionShell.tsx` - Added marketing tab
- `src/components/preproduction/tabs/ArcMarketingTab.tsx` - Arc marketing component
- `src/types/preproduction.ts` - Added ArcMarketingData type

**Viral Scanner**:
- `src/services/viral-potential-scanner.ts` - Viral moment scanner service

## Future Roadmap

### High Priority
- [ ] Real-time KPI tracking dashboard
- [ ] Automated hashtag trending integration
- [ ] Enhanced viral scanner with video analysis

### Medium Priority
- [ ] Peer Casting Loop automation
- [ ] Content Density Tracker
- [ ] Marketing A/B Testing framework

### Low Priority
- [ ] Mobile app integration
- [ ] Advanced analytics and insights
- [ ] Marketing performance predictions

## Support

For questions or issues with marketing features:
1. Check this documentation
2. Review the marketing strategy in Story Bible
3. Use the "Scan for Viral Moments" feature for additional insights
4. Refer to the marketing workflow guide (coming soon)

---

**Last Updated**: Implementation completed per Marketing Features Implementation Plan
**Version**: 1.0.0



