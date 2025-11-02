'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { editingService, EditingConstraints } from '@/services/editing-service'
import { Lock, Edit2, Plus, Save, X, AlertCircle, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface EditableStoryBibleProps {
  storyBible: any
  onUpdate: (updatedStoryBible: any) => void
  projectData?: any
}

interface EditableFieldProps {
  value: string
  onSave: (newValue: string) => void
  placeholder?: string
  multiline?: boolean
  disabled?: boolean
  className?: string
}

function EditableField({ value, onSave, placeholder, multiline = false, disabled = false, className = '' }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleSave = async () => {
    if (editValue !== value) {
      setIsSaving(true)
      await onSave(editValue)
      setIsSaving(false)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  if (disabled) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex-1 p-2 bg-gray-100 rounded text-gray-600">
          {value || placeholder}
        </div>
        <Lock className="w-4 h-4 text-gray-400" />
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className={`space-y-2 ${className}`}>
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="min-h-[100px]"
            disabled={isSaving}
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            disabled={isSaving}
          />
        )}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      <div 
        className="flex-1 p-2 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsEditing(true)}
      >
        {value || <span className="text-gray-400">{placeholder}</span>}
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

export default function EditableStoryBible({ storyBible, onUpdate, projectData }: EditableStoryBibleProps) {
  const [constraints, setConstraints] = useState<EditingConstraints | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddCharacter, setShowAddCharacter] = useState(false)
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    archetype: '',
    description: '',
    arc: ''
  })

  useEffect(() => {
    loadConstraints()
  }, [projectData])

  const loadConstraints = async () => {
    try {
      setIsLoading(true)
      const editConstraints = await editingService.getEditingConstraints(projectData || {})
      setConstraints(editConstraints)
    } catch (error) {
      console.error('Error loading editing constraints:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldUpdate = async (field: string, newValue: any, isAddingCharacter = false) => {
    try {
      const result = await editingService.editStoryBible(storyBible, field, newValue, isAddingCharacter)
      
      if (result.success && result.updatedStoryBible) {
        onUpdate(result.updatedStoryBible)
      } else {
        alert(result.error || 'Failed to update story bible')
      }
    } catch (error) {
      console.error('Error updating story bible:', error)
      alert('Failed to update story bible')
    }
  }

  const handleAddCharacter = async () => {
    if (!newCharacter.name.trim()) {
      alert('Character name is required')
      return
    }

    try {
      const result = await editingService.addCharacter(storyBible, newCharacter)
      
      if (result.success && result.updatedStoryBible) {
        onUpdate(result.updatedStoryBible)
        setNewCharacter({ name: '', archetype: '', description: '', arc: '' })
        setShowAddCharacter(false)
      } else {
        alert(result.error || 'Failed to add character')
      }
    } catch (error) {
      console.error('Error adding character:', error)
      alert('Failed to add character')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p>Loading editing permissions...</p>
      </div>
    )
  }

  if (!constraints) {
    return (
      <div className="p-6 text-center text-red-600">
        <AlertCircle className="w-8 h-8 mx-auto mb-4" />
        <p>Failed to load editing permissions</p>
      </div>
    )
  }

  const canEditContent = constraints.storyBible.canEditContent
  const canAddCharacters = constraints.storyBible.canAddCharacters

  return (
    <div className="space-y-6">
      {/* Editing Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-lg border ${
          canEditContent 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}
      >
        <div className="flex items-center gap-2">
          {canEditContent ? (
            <Edit2 className="w-5 h-5" />
          ) : (
            <Lock className="w-5 h-5" />
          )}
          <div>
            <h3 className="font-semibold">
              {canEditContent ? 'Story Bible Editing Enabled' : 'Content Editing Locked'}
            </h3>
            <p className="text-sm">
              {canEditContent 
                ? 'You can edit all story bible content. Generate episodes to lock content editing.'
                : constraints.storyBible.reason}
            </p>
            {canAddCharacters && !canEditContent && (
              <p className="text-sm font-medium mt-1">
                ✓ Character addition is still available
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Core Story Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Story Information
            {!canEditContent && <Lock className="w-4 h-4 text-gray-400" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Series Title</label>
            <EditableField
              value={storyBible.seriesTitle || ''}
              onSave={(value) => handleFieldUpdate('seriesTitle', value)}
              placeholder="Enter series title..."
              disabled={!canEditContent}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Synopsis</label>
            <EditableField
              value={storyBible.synopsis || ''}
              onSave={(value) => handleFieldUpdate('synopsis', value)}
              placeholder="Enter story synopsis..."
              multiline
              disabled={!canEditContent}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <EditableField
              value={storyBible.theme || ''}
              onSave={(value) => handleFieldUpdate('theme', value)}
              placeholder="Enter main theme..."
              disabled={!canEditContent}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Genre</label>
            <EditableField
              value={storyBible.genre || ''}
              onSave={(value) => handleFieldUpdate('genre', value)}
              placeholder="Enter genre..."
              disabled={!canEditContent}
            />
          </div>
        </CardContent>
      </Card>

      {/* World Building */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            World Building
            {!canEditContent && <Lock className="w-4 h-4 text-gray-400" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Setting</label>
            <EditableField
              value={storyBible.worldBuilding?.setting || ''}
              onSave={(value) => handleFieldUpdate('worldBuilding.setting', value)}
              placeholder="Describe the world setting..."
              multiline
              disabled={!canEditContent}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rules</label>
            <EditableField
              value={storyBible.worldBuilding?.rules || ''}
              onSave={(value) => handleFieldUpdate('worldBuilding.rules', value)}
              placeholder="Define world rules and constraints..."
              multiline
              disabled={!canEditContent}
            />
          </div>
        </CardContent>
      </Card>

      {/* Characters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Characters ({(storyBible.mainCharacters || []).length})
            </span>
            {canAddCharacters && (
              <Button
                onClick={() => setShowAddCharacter(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Character
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(storyBible.mainCharacters || []).map((character: any, index: number) => (
              <motion.div
                key={character.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{character.archetype || 'Character'}</Badge>
                  {!canEditContent && <Lock className="w-4 h-4 text-gray-400" />}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <EditableField
                    value={character.name || ''}
                    onSave={(value) => handleFieldUpdate(`mainCharacters.${index}.name`, value)}
                    placeholder="Character name..."
                    disabled={!canEditContent}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Archetype</label>
                  <EditableField
                    value={character.archetype || ''}
                    onSave={(value) => handleFieldUpdate(`mainCharacters.${index}.archetype`, value)}
                    placeholder="Character archetype..."
                    disabled={!canEditContent}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <EditableField
                    value={character.description || ''}
                    onSave={(value) => handleFieldUpdate(`mainCharacters.${index}.description`, value)}
                    placeholder="Character description..."
                    multiline
                    disabled={!canEditContent}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Character Arc</label>
                  <EditableField
                    value={character.arc || ''}
                    onSave={(value) => handleFieldUpdate(`mainCharacters.${index}.arc`, value)}
                    placeholder="Character development arc..."
                    multiline
                    disabled={!canEditContent}
                  />
                </div>
              </motion.div>
            ))}

            {(storyBible.mainCharacters || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No characters yet. Add your first character to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Character Modal */}
      <AnimatePresence>
        {showAddCharacter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddCharacter(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Add New Character</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input
                    value={newCharacter.name}
                    onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Character name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Archetype</label>
                  <Input
                    value={newCharacter.archetype}
                    onChange={(e) => setNewCharacter(prev => ({ ...prev, archetype: e.target.value }))}
                    placeholder="Character archetype..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={newCharacter.description}
                    onChange={(e) => setNewCharacter(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Character description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Character Arc</label>
                  <Textarea
                    value={newCharacter.arc}
                    onChange={(e) => setNewCharacter(prev => ({ ...prev, arc: e.target.value }))}
                    placeholder="Character development arc..."
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={handleAddCharacter}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Character
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddCharacter(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

