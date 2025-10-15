# 🎬 Content Editing System - Integration Guide

## 📋 Overview

This guide shows how to integrate the new AI-powered content editing system into your existing workflows. The system provides intelligent editing capabilities with proper constraints and real-time regeneration.

## 🎯 Key Features

### ✅ Story Bible Editing
- **Full editing** when no episodes exist
- **Character addition only** after episodes are generated  
- **Real-time validation** of editing permissions
- **Intelligent constraints** based on project state

### ✅ Episode Scene Editing
- **Scene editing** until next episode is generated
- **Auto-regeneration** of subsequent scenes after edits
- **G.O.D.D. framework** support (Goal, Obstacle, Dilemma, Decision)
- **Conflict and dialogue** editing

### ✅ Script Editing (Pre-Production)
- **Always editable** screenplay format
- **Element-level editing** (action, dialogue, character, etc.)
- **Real-time updates** and professional formatting
- **Add/delete elements** with proper screenplay structure

## 🏗️ Architecture

```
ContentEditor (Main Component)
├── EditableStoryBible
├── EditableEpisode  
├── EditableScript
└── EditingService (Core Logic)

API Endpoints:
├── /api/save-story-bible
├── /api/save-episode
├── /api/save-script
└── /api/regenerate-scenes
```

## 🚀 Quick Integration

### 1. Story Bible Page Integration

```tsx
import ContentEditor from '@/components/ContentEditor'

function StoryBiblePage() {
  const [storyBible, setStoryBible] = useState(null)
  const [projectData, setProjectData] = useState(null)

  return (
    <div>
      {/* Your existing story bible display */}
      <YourExistingStoryBibleDisplay storyBible={storyBible} />
      
      {/* Add the content editor */}
      <ContentEditor
        storyBible={storyBible}
        projectData={projectData}
        activeTab="story-bible"
        onStoryBibleUpdate={(updated) => {
          setStoryBible(updated)
          // Save to your persistence layer
          saveStoryBible(updated)
        }}
      />
    </div>
  )
}
```

### 2. Episode Page Integration

```tsx
import ContentEditor from '@/components/ContentEditor'

function EpisodePage({ episodeId }: { episodeId: string }) {
  const [episodes, setEpisodes] = useState({})
  const [projectData, setProjectData] = useState(null)

  return (
    <div>
      {/* Your existing episode display */}
      <YourExistingEpisodeDisplay episode={episodes[episodeId]} />
      
      {/* Add the content editor */}
      <ContentEditor
        episodes={episodes}
        projectData={projectData}
        activeTab="episodes"
        selectedEpisodeId={episodeId}
        onEpisodeUpdate={(episodeId, updatedEpisode) => {
          setEpisodes(prev => ({
            ...prev,
            [episodeId]: updatedEpisode
          }))
          // Save to your persistence layer
          saveEpisode(updatedEpisode)
        }}
      />
    </div>
  )
}
```

### 3. Pre-Production Page Integration

```tsx
import ContentEditor from '@/components/ContentEditor'

function PreProductionPage() {
  const [preProductionContent, setPreProductionContent] = useState(null)

  return (
    <div>
      {/* Your existing pre-production displays */}
      <YourExistingScriptDisplay script={preProductionContent?.script} />
      
      {/* Add the content editor */}
      <ContentEditor
        preProductionContent={preProductionContent}
        activeTab="scripts"
        onScriptUpdate={(updatedScript) => {
          setPreProductionContent(prev => ({
            ...prev,
            script: updatedScript
          }))
          // Save to your persistence layer
          saveScript(updatedScript)
        }}
      />
    </div>
  )
}
```

## 🔧 Advanced Integration

### Custom Persistence Integration

Update the API endpoints to integrate with your existing data storage:

```typescript
// src/app/api/save-story-bible/route.ts
import { yourFirebaseService } from '@/services/firebase'

export async function POST(request: NextRequest) {
  const storyBible = await request.json()
  
  // Your custom persistence logic
  await yourFirebaseService.saveStoryBible(storyBible)
  
  return NextResponse.json({ success: true })
}
```

### Custom Validation Rules

Extend the editing service with custom validation:

```typescript
// src/services/custom-editing-rules.ts
import { editingService } from '@/services/editing-service'

export class CustomEditingRules {
  static async validateStoryBibleEdit(storyBible: any, field: string, newValue: any): Promise<boolean> {
    // Your custom validation logic
    if (field === 'genre' && !ALLOWED_GENRES.includes(newValue)) {
      return false
    }
    return true
  }
}
```

### Real-time Collaboration

Add WebSocket support for real-time editing:

```typescript
// src/services/realtime-editing.ts
import { editingService } from '@/services/editing-service'

export class RealtimeEditing {
  private ws: WebSocket

  constructor() {
    this.ws = new WebSocket('ws://your-websocket-endpoint')
    
    // Subscribe to editing events
    editingService.subscribe('story-bible-updated', (data) => {
      this.broadcastEdit('story-bible', data)
    })
  }

  private broadcastEdit(type: string, data: any) {
    this.ws.send(JSON.stringify({ type, data }))
  }
}
```

## 🔒 Security Considerations

### User Permissions

```typescript
// src/services/editing-permissions.ts
export class EditingPermissions {
  static async canUserEdit(userId: string, entityType: string, entityId: string): Promise<boolean> {
    // Check user roles and permissions
    const user = await getUserById(userId)
    
    switch (entityType) {
      case 'story-bible':
        return user.role === 'writer' || user.role === 'admin'
      case 'episode':
        return user.role === 'writer' || user.role === 'editor'
      case 'script':
        return user.role === 'writer' || user.role === 'script-writer'
      default:
        return false
    }
  }
}
```

### Audit Trail

```typescript
// src/services/edit-audit.ts
export class EditAudit {
  static async logEdit(edit: {
    userId: string
    entityType: string
    entityId: string
    field: string
    oldValue: any
    newValue: any
  }) {
    // Log to your audit system
    await auditService.log({
      ...edit,
      timestamp: new Date(),
      ip: request.ip,
      userAgent: request.headers['user-agent']
    })
  }
}
```

## 🎨 UI Customization

### Styling

The components use Tailwind CSS and can be customized:

```tsx
// Custom themed editor
<ContentEditor
  storyBible={storyBible}
  className="custom-editor-theme"
  editButtonClassName="bg-purple-600 hover:bg-purple-700"
  lockIconClassName="text-red-500"
/>
```

### Custom Components

Replace default components with your own:

```tsx
import { CustomEditableField } from '@/components/custom'

// In EditableStoryBible.tsx
<CustomEditableField
  value={character.name}
  onSave={(value) => handleFieldUpdate(`mainCharacters.${index}.name`, value)}
  theme="your-theme"
/>
```

## 📊 Analytics and Metrics

### Editing Analytics

```typescript
// src/services/editing-analytics.ts
export class EditingAnalytics {
  static trackEdit(edit: {
    entityType: string
    field: string
    userId: string
    regenerationTriggered: boolean
  }) {
    // Send to your analytics service
    analytics.track('content_edited', {
      entity_type: edit.entityType,
      field: edit.field,
      user_id: edit.userId,
      regeneration_triggered: edit.regenerationTriggered,
      timestamp: new Date()
    })
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Editing permissions not loading**
   - Check if `projectData` is properly passed to the component
   - Verify that episodes/story bible data is available

2. **Regeneration not working**
   - Ensure `/api/regenerate-scenes` endpoint is accessible
   - Check that AI service credentials are configured

3. **Save operations failing**
   - Verify persistence endpoints are implemented
   - Check network connectivity and API responses

### Debug Mode

Enable debug logging:

```typescript
// Add to your main app
window.EDITING_DEBUG = true

// The editing service will log detailed information
editingService.enableDebugMode()
```

## 🚀 Deployment

### Environment Variables

```env
# AI Service Configuration
AZURE_OPENAI_API_KEY=your_api_key
AZURE_OPENAI_ENDPOINT=your_endpoint
GEMINI_API_KEY=your_gemini_key

# Database Configuration
DATABASE_URL=your_database_url
FIREBASE_CONFIG=your_firebase_config

# WebSocket Configuration (optional)
WEBSOCKET_URL=your_websocket_url
```

### Build Configuration

```json
// package.json
{
  "dependencies": {
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.263.1"
  }
}
```

## 🎯 Next Steps

1. **Integrate** the ContentEditor into your existing pages
2. **Configure** persistence endpoints for your data storage
3. **Test** editing workflows with your content
4. **Customize** UI and validation rules as needed
5. **Deploy** with proper environment configuration

## 💡 Tips

- Start with story bible editing as it's the foundation
- Test regeneration carefully with your AI service configuration  
- Use the edit history feature to track changes
- Consider implementing user permissions for production use
- Monitor AI regeneration costs and usage

---

Happy editing! 🎬✨

