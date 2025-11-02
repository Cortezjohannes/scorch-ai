'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { editingService, EditingConstraints } from '@/services/editing-service'
import { Lock, Edit2, Save, X, AlertCircle, Play, RotateCcw, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface EditableEpisodeProps {
  episode: any
  onUpdate: (updatedEpisode: any) => void
  projectData?: any
}

interface EditableSceneFieldProps {
  sceneId: string
  field: string
  value: string
  onSave: (sceneId: string, field: string, newValue: string) => void
  placeholder?: string
  multiline?: boolean
  disabled?: boolean
  label?: string
}

function EditableSceneField({ 
  sceneId, 
  field, 
  value, 
  onSave, 
  placeholder, 
  multiline = false, 
  disabled = false,
  label 
}: EditableSceneFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleSave = async () => {
    if (editValue !== value) {
      setIsSaving(true)
      await onSave(sceneId, field, editValue)
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
      <div className="space-y-1">
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        <div className="flex items-center gap-2">
          <div className="flex-1 p-2 bg-gray-100 rounded text-gray-600">
            {value || placeholder}
          </div>
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="min-h-[80px]"
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
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex items-center gap-2 group">
        <div 
          className="flex-1 p-2 border rounded cursor-pointer hover:bg-gray-50 transition-colors min-h-[40px] flex items-center"
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
    </div>
  )
}

export default function EditableEpisode({ episode, onUpdate, projectData }: EditableEpisodeProps) {
  const [constraints, setConstraints] = useState<EditingConstraints | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenerationFromScene, setRegenerationFromScene] = useState<number | null>(null)

  useEffect(() => {
    loadConstraints()
  }, [projectData, episode])

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

  const handleSceneFieldUpdate = async (sceneId: string, field: string, newValue: string, shouldRegenerate: boolean = true) => {
    try {
      const result = await editingService.editEpisodeScene(episode, sceneId, field, newValue, shouldRegenerate)
      
      if (result.success && result.updatedEpisode) {
        onUpdate(result.updatedEpisode)
        
        // Handle regeneration feedback
        if (result.regeneratedContent && shouldRegenerate) {
          setIsRegenerating(true)
          // Find scene index for regeneration feedback
          const sceneIndex = episode.scenes?.findIndex((scene: any) => scene.id === sceneId) || 0
          setRegenerationFromScene(sceneIndex)
          
          // Clear regeneration state after a delay
          setTimeout(() => {
            setIsRegenerating(false)
            setRegenerationFromScene(null)
          }, 3000)
        }
      } else {
        alert(result.error || 'Failed to update scene')
      }
    } catch (error) {
      console.error('Error updating scene:', error)
      alert('Failed to update scene')
    }
  }

  const triggerRegenerationFromScene = async (sceneIndex: number) => {
    try {
      setIsRegenerating(true)
      setRegenerationFromScene(sceneIndex)
      
      const response = await fetch('/api/regenerate-scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episode,
          fromSceneIndex: sceneIndex,
          contextFromEdit: episode.scenes[sceneIndex - 1]
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.updatedEpisode) {
          onUpdate(result.updatedEpisode)
        }
      } else {
        alert('Failed to regenerate scenes')
      }
    } catch (error) {
      console.error('Error regenerating scenes:', error)
      alert('Failed to regenerate scenes')
    } finally {
      setIsRegenerating(false)
      setRegenerationFromScene(null)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p>Loading episode editing permissions...</p>
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

  const episodeConstraint = constraints.episodes[episode.id] || { canEditScenes: false }
  const canEditScenes = episodeConstraint.canEditScenes

  return (
    <div className="space-y-6">
      {/* Episode Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Episode {episode.episodeNumber}: {episode.title || episode.episodeTitle}
            </div>
            <Badge variant={canEditScenes ? "default" : "secondary"}>
              {canEditScenes ? 'Editable' : 'Locked'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Editing Status Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border mb-4 ${
              canEditScenes 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {canEditScenes ? (
                <Edit2 className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
              <div>
                <h4 className="font-semibold">
                  {canEditScenes ? 'Scene Editing Enabled' : 'Scene Editing Locked'}
                </h4>
                <p className="text-sm">
                  {canEditScenes 
                    ? 'You can edit scenes. Changes will trigger regeneration of subsequent scenes.'
                    : episodeConstraint.reason || 'Episode editing is currently locked'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Episode Synopsis */}
          <div className="space-y-2">
            <h4 className="font-medium">Episode Synopsis</h4>
            <p className="text-gray-600">{episode.synopsis || episode.summary || 'No synopsis available'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Regeneration Status */}
      <AnimatePresence>
        {isRegenerating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <div>
                <h4 className="font-semibold">Regenerating Content</h4>
                <p className="text-sm">
                  Updating scenes {regenerationFromScene !== null ? `from scene ${regenerationFromScene + 1}` : ''} based on your edits...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scenes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Scenes ({(episode.scenes || []).length})
        </h3>

        {(episode.scenes || []).map((scene: any, index: number) => (
          <motion.div
            key={scene.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: regenerationFromScene !== null && index > regenerationFromScene ? 0.98 : 1 
            }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-lg p-4 space-y-4 ${
              regenerationFromScene !== null && index > regenerationFromScene 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Scene {index + 1}</Badge>
                {!canEditScenes && <Lock className="w-4 h-4 text-gray-400" />}
                {regenerationFromScene !== null && index > regenerationFromScene && (
                  <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                    Regenerating...
                  </Badge>
                )}
              </div>
              
              {canEditScenes && index > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => triggerRegenerationFromScene(index)}
                  disabled={isRegenerating}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Regenerate from here
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableSceneField
                sceneId={scene.id || `scene_${index}`}
                field="title"
                value={scene.title || ''}
                onSave={handleSceneFieldUpdate}
                placeholder="Scene title..."
                disabled={!canEditScenes}
                label="Title"
              />

              <EditableSceneField
                sceneId={scene.id || `scene_${index}`}
                field="location"
                value={scene.location || ''}
                onSave={handleSceneFieldUpdate}
                placeholder="Scene location..."
                disabled={!canEditScenes}
                label="Location"
              />
            </div>

            <EditableSceneField
              sceneId={scene.id || `scene_${index}`}
              field="content"
              value={scene.content || scene.description || ''}
              onSave={handleSceneFieldUpdate}
              placeholder="Scene content and action..."
              multiline
              disabled={!canEditScenes}
              label="Content"
            />

            {/* Character Objectives (if available) */}
            {scene.goal && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableSceneField
                  sceneId={scene.id || `scene_${index}`}
                  field="goal.objective"
                  value={scene.goal.objective || ''}
                  onSave={handleSceneFieldUpdate}
                  placeholder="Character objective..."
                  disabled={!canEditScenes}
                  label="Character Objective"
                />

                <EditableSceneField
                  sceneId={scene.id || `scene_${index}`}
                  field="goal.stakes"
                  value={scene.goal.stakes || ''}
                  onSave={handleSceneFieldUpdate}
                  placeholder="What's at stake..."
                  disabled={!canEditScenes}
                  label="Stakes"
                />
              </div>
            )}

            {/* Conflict and Tension */}
            {scene.conflict && (
              <EditableSceneField
                sceneId={scene.id || `scene_${index}`}
                field="conflict.description"
                value={scene.conflict.description || ''}
                onSave={handleSceneFieldUpdate}
                placeholder="Conflict description..."
                multiline
                disabled={!canEditScenes}
                label="Conflict"
              />
            )}

            {/* Dialogue Approach */}
            {scene.dialogueApproach && (
              <EditableSceneField
                sceneId={scene.id || `scene_${index}`}
                field="dialogueApproach.subtext"
                value={scene.dialogueApproach.subtext || ''}
                onSave={handleSceneFieldUpdate}
                placeholder="Dialogue subtext..."
                multiline
                disabled={!canEditScenes}
                label="Dialogue Subtext"
              />
            )}
          </motion.div>
        ))}

        {(episode.scenes || []).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No scenes available for this episode.</p>
          </div>
        )}
      </div>
    </div>
  )
}

