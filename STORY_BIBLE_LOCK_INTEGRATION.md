# 🔒 Story Bible Lock System - Integration Guide

## Overview

The Story Bible Lock system prevents editing of the story bible once episodes have been generated, ensuring consistency and preventing continuity errors. Users can still add new characters even when locked.

---

## ✅ What's Included

### New Files Created

1. **`src/services/story-bible-lock.ts`** - Lock logic service
2. **`src/components/StoryBibleLockBanner.tsx`** - Visual lock status banner
3. **`src/components/modals/LockInfoModal.tsx`** - Detailed explanation modal

---

## 🔧 Integration Steps

### 1. Add Lock Banner to Story Bible Page

**File:** `src/app/story-bible/page.tsx`

```tsx
import { storyBibleLock } from '@/services/story-bible-lock'
import StoryBibleLockBanner from '@/components/StoryBibleLockBanner'
import LockInfoModal from '@/components/modals/LockInfoModal'

export default function StoryBiblePage() {
  const [showLockInfo, setShowLockInfo] = useState(false)
  
  // Get episode count (from Firestore or state)
  const episodeCount = Object.keys(episodes || {}).length
  
  // Check lock status
  const lockStatus = storyBibleLock.checkLockStatus(episodeCount)
  
  return (
    <div>
      {/* Lock Status Banner */}
      <StoryBibleLockBanner
        episodeCount={episodeCount}
        onLearnMore={() => setShowLockInfo(true)}
      />
      
      {/* Lock Info Modal */}
      <LockInfoModal
        isOpen={showLockInfo}
        onClose={() => setShowLockInfo(false)}
        episodeCount={episodeCount}
      />
      
      {/* Rest of your story bible UI */}
    </div>
  )
}
```

### 2. Update Edit Functions to Check Lock Status

**File:** `src/app/story-bible/page.tsx`

```tsx
// When editing a field:
const handleEditField = (field: string, value: any) => {
  const episodeCount = Object.keys(episodes || {}).length
  
  // Check if editing is allowed
  if (!storyBibleLock.canPerformAction('canEditContent', episodeCount)) {
    const message = storyBibleLock.getBlockedActionMessage('canEditContent', episodeCount)
    const alternative = storyBibleLock.getSuggestedAlternative('canEditContent')
    
    alert(`${message}\n\n${alternative}`)
    return
  }
  
  // Proceed with edit
  updateStoryBibleField(field, value)
}

// When deleting content:
const handleDeleteCharacter = (index: number) => {
  const episodeCount = Object.keys(episodes || {}).length
  
  if (!storyBibleLock.canPerformAction('canDeleteContent', episodeCount)) {
    const message = storyBibleLock.getBlockedActionMessage('canDeleteContent', episodeCount)
    alert(message)
    return
  }
  
  // Proceed with deletion
  deleteCharacter(index)
}
```

### 3. Allow Character Addition When Locked

**File:** `src/app/story-bible/page.tsx`

```tsx
// Character addition is ALWAYS allowed
const handleAddCharacter = () => {
  const episodeCount = Object.keys(episodes || {}).length
  
  // This check will always pass (canAddCharacters is true even when locked)
  if (!storyBibleLock.canPerformAction('canAddCharacters', episodeCount)) {
    alert('Cannot add characters')
    return
  }
  
  // Show Character Creation Wizard or add character directly
  setShowCharacterWizard(true)
}
```

### 4. Update EditableStoryBible Component

**File:** `src/components/EditableStoryBible.tsx`

```tsx
import { storyBibleLock } from '@/services/story-bible-lock'
import { Lock } from 'lucide-react'

export default function EditableStoryBible({ 
  storyBible, 
  onUpdate, 
  episodeCount = 0  // NEW: Pass episode count
}) {
  const lockStatus = storyBibleLock.checkLockStatus(episodeCount)
  const canEdit = lockStatus.allowedActions.canEditContent
  
  return (
    <div className="space-y-6">
      {/* Show lock warning if locked */}
      {lockStatus.isLocked && (
        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <Lock className="w-5 h-5" />
            <span className="font-semibold">
              Editing Disabled - {episodeCount} Episode{episodeCount !== 1 ? 's' : ''} Generated
            </span>
          </div>
        </div>
      )}
      
      {/* Disable edit buttons when locked */}
      <EditableField
        value={storyBible.seriesTitle}
        onSave={(value) => canEdit && handleSave('seriesTitle', value)}
        disabled={!canEdit}
        placeholder="Series title..."
      />
    </div>
  )
}
```

### 5. Update Character Creation Wizard Integration

**File:** `src/app/story-bible/page.tsx`

```tsx
// Character Wizard can be opened even when locked
<button
  onClick={() => setShowCharacterWizard(true)}
  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
>
  <Plus className="w-4 h-4" />
  Add Character {lockStatus.isLocked && '(Always Available)'}
</button>

<CharacterCreationWizard
  isOpen={showCharacterWizard}
  onClose={() => setShowCharacterWizard(false)}
  onComplete={(character) => {
    // Always allowed, even when locked
    const updatedBible = {
      ...storyBible,
      characters: [...(storyBible.characters || []), character]
    }
    updateStoryBible(updatedBible)
    setShowCharacterWizard(false)
  }}
  storyBible={storyBible}
/>
```

### 6. Disable AI Edit Modal for Locked Content

**File:** `src/components/modals/AIEditModal.tsx`

```tsx
interface AIEditModalProps {
  // ... existing props
  isLocked?: boolean  // NEW: Pass lock status
}

export default function AIEditModal({
  isOpen,
  onClose,
  onSave,
  isLocked = false,  // NEW
  // ... other props
}) {
  if (!isOpen) return null
  
  // Show lock warning
  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-gray-900 rounded-2xl p-6 max-w-md">
          <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white text-center mb-2">
            Editing Not Available
          </h3>
          <p className="text-gray-300 text-center mb-4">
            The story bible is locked because episodes have been generated. 
            You can still add new characters or use Episode Reflection.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            Close
          </button>
        </div>
      </div>
    )
  }
  
  // ... rest of component
}
```

---

## 📋 Lock Rules Summary

### ✅ Always Allowed (Even When Locked)

- **Add new characters** via Character Creation Wizard
- **Use Episode Reflection** to update story bible from episodes
- **View all content** in the story bible
- **Export story bible** as template
- **View version history**

### ❌ Not Allowed When Locked

- Edit existing character traits, backstory, or descriptions
- Edit world building (setting, rules, locations)
- Edit story arcs
- Delete any content (characters, locations, arcs)
- Manually add locations (must use Episode Reflection)

---

## 🎯 User Experience Flow

### Before First Episode (Unlocked)

1. User creates story bible
2. Adds characters, world building, arcs
3. Can freely edit everything
4. Lock banner shows "Unlocked" status with tip

### After First Episode (Locked)

1. User generates first episode
2. Lock banner appears showing "Locked" status
3. Edit buttons become disabled with lock icon
4. "Add Character" button remains enabled
5. Episode Reflection becomes primary way to update

### Adding Characters When Locked

1. User clicks "Add Character"
2. Character Creation Wizard opens normally
3. User completes wizard
4. New character is added to story bible
5. Character will appear in future episodes

---

## 🔍 Checking Lock Status in Code

```tsx
import { storyBibleLock } from '@/services/story-bible-lock'

// Get full lock status
const lockStatus = storyBibleLock.checkLockStatus(episodeCount)

// Check specific action
const canEdit = storyBibleLock.canPerformAction('canEditContent', episodeCount)

// Get blocked message
const message = storyBibleLock.getBlockedActionMessage('canEditContent', episodeCount)

// Get alternative suggestion
const alternative = storyBibleLock.getSuggestedAlternative('canEditContent')

// Get formatted display info
const displayInfo = storyBibleLock.formatLockStatusMessage(episodeCount)
```

---

## 💡 Best Practices

### For Users

1. **Plan before generating**: Make sure core world building is solid before first episode
2. **Use Episode Reflection**: Primary way to update story bible after locking
3. **Add characters freely**: New characters can always be added
4. **Version control**: Use version history if you need to see past states

### For Developers

1. **Always check lock status** before allowing edits
2. **Show helpful messages** explaining why action is blocked
3. **Provide alternatives** (suggest Episode Reflection or character addition)
4. **Make exceptions clear** (character addition is always allowed)
5. **Visual indicators** (lock icons, disabled buttons, banners)

---

## 🚀 Example: Complete Integration

```tsx
// src/app/story-bible/page.tsx

import { useState, useEffect } from 'react'
import { storyBibleLock } from '@/services/story-bible-lock'
import StoryBibleLockBanner from '@/components/StoryBibleLockBanner'
import LockInfoModal from '@/components/modals/LockInfoModal'
import CharacterCreationWizard from '@/components/modals/CharacterCreationWizard'
import AIEditModal from '@/components/modals/AIEditModal'

export default function StoryBiblePage() {
  const [storyBible, setStoryBible] = useState<any>(null)
  const [episodes, setEpisodes] = useState<any>({})
  const [showLockInfo, setShowLockInfo] = useState(false)
  const [showCharacterWizard, setShowCharacterWizard] = useState(false)
  const [showAIEdit, setShowAIEdit] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)

  const episodeCount = Object.keys(episodes).length
  const lockStatus = storyBibleLock.checkLockStatus(episodeCount)

  // Handle field editing
  const handleEditField = (field: string, value: any) => {
    if (!storyBibleLock.canPerformAction('canEditContent', episodeCount)) {
      const message = storyBibleLock.getBlockedActionMessage('canEditContent', episodeCount)
      const alternative = storyBibleLock.getSuggestedAlternative('canEditContent')
      alert(`${message}\n\n${alternative}`)
      return
    }

    // Proceed with edit
    const updated = { ...storyBible, [field]: value }
    setStoryBible(updated)
    saveStoryBible(updated)
  }

  // Handle character addition (always allowed)
  const handleAddCharacter = (character: any) => {
    const updated = {
      ...storyBible,
      characters: [...(storyBible.characters || []), character]
    }
    setStoryBible(updated)
    saveStoryBible(updated)
  }

  return (
    <div className="p-8">
      {/* Lock Status Banner */}
      <StoryBibleLockBanner
        episodeCount={episodeCount}
        onLearnMore={() => setShowLockInfo(true)}
      />

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        {/* Add Character - Always Available */}
        <button
          onClick={() => setShowCharacterWizard(true)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white"
        >
          Add Character
        </button>

        {/* Edit with AI - Disabled when locked */}
        <button
          onClick={() => {
            if (!lockStatus.allowedActions.canEditContent) {
              alert(storyBibleLock.getBlockedActionMessage('canEditContent', episodeCount))
              return
            }
            setShowAIEdit(true)
          }}
          disabled={!lockStatus.allowedActions.canEditContent}
          className="px-4 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50"
        >
          AI Edit
        </button>
      </div>

      {/* Story Bible Content */}
      <div className="space-y-6">
        {/* Your story bible tabs and content */}
      </div>

      {/* Modals */}
      <LockInfoModal
        isOpen={showLockInfo}
        onClose={() => setShowLockInfo(false)}
        episodeCount={episodeCount}
      />

      <CharacterCreationWizard
        isOpen={showCharacterWizard}
        onClose={() => setShowCharacterWizard(false)}
        onComplete={handleAddCharacter}
        storyBible={storyBible}
      />

      <AIEditModal
        isOpen={showAIEdit}
        onClose={() => setShowAIEdit(false)}
        onSave={(content) => handleEditField(editingField!, content)}
        isLocked={lockStatus.isLocked}
        // ... other props
      />
    </div>
  )
}
```

---

## ✅ Testing Checklist

- [ ] Lock banner shows "Unlocked" before first episode
- [ ] Lock banner shows "Locked" after first episode
- [ ] Edit buttons are disabled when locked
- [ ] "Add Character" button works when locked
- [ ] Lock info modal displays correctly
- [ ] Appropriate error messages when trying to edit
- [ ] Episode Reflection still works when locked
- [ ] Version history accessible when locked
- [ ] Lock status persists across page refreshes

---

## 🎉 Summary

The Story Bible Lock system is now complete with:

✅ **Lock Service** - Determines what's allowed based on episode count  
✅ **Lock Banner** - Visual status indicator  
✅ **Lock Info Modal** - Detailed explanation for users  
✅ **Character Exception** - New characters always allowed  
✅ **Clear Messaging** - Helpful error messages with alternatives  
✅ **Integration Ready** - Easy to add to existing story bible page  

This ensures story consistency while still allowing growth through new character addition and Episode Reflection!

