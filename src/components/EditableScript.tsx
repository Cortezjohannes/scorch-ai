'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { editingService } from '@/services/editing-service'
import { Edit2, Save, X, FileText, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface EditableScriptProps {
  scriptData: any
  onUpdate: (updatedScript: any) => void
}

interface ScriptElement {
  type: 'scene_heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition'
  content: string
  id?: string
}

interface EditableScriptElementProps {
  element: ScriptElement
  elementIndex: number
  sceneId: string
  episodeId: string
  onSave: (episodeId: string, sceneId: string, elementIndex: number, newContent: string) => void
  onDelete?: (episodeId: string, sceneId: string, elementIndex: number) => void
  onAdd?: (episodeId: string, sceneId: string, afterIndex: number, elementType: string) => void
}

function EditableScriptElement({ 
  element, 
  elementIndex, 
  sceneId, 
  episodeId, 
  onSave, 
  onDelete, 
  onAdd 
}: EditableScriptElementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(element.content)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)

  useEffect(() => {
    setEditValue(element.content)
  }, [element.content])

  const handleSave = async () => {
    if (editValue !== element.content) {
      setIsSaving(true)
      await onSave(episodeId, sceneId, elementIndex, editValue)
      setIsSaving(false)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(element.content)
    setIsEditing(false)
  }

  const getElementStyle = (type: string) => {
    switch (type) {
      case 'scene_heading':
        return 'font-bold uppercase text-left mb-2'
      case 'action':
        return 'text-left mb-2'
      case 'character':
        return 'text-center font-semibold mb-1 ml-32'
      case 'dialogue':
        return 'text-left ml-16 mr-16 mb-2'
      case 'parenthetical':
        return 'text-center italic mb-1 ml-40'
      case 'transition':
        return 'text-right font-semibold mb-2'
      default:
        return 'text-left mb-2'
    }
  }

  const getElementBorderColor = (type: string) => {
    switch (type) {
      case 'scene_heading':
        return 'border-blue-200 bg-blue-50'
      case 'action':
        return 'border-gray-200 bg-gray-50'
      case 'character':
        return 'border-green-200 bg-green-50'
      case 'dialogue':
        return 'border-yellow-200 bg-yellow-50'
      case 'parenthetical':
        return 'border-purple-200 bg-purple-50'
      case 'transition':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 p-3 border rounded-lg bg-white"
      >
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">{element.type.replace('_', ' ').toUpperCase()}</Badge>
        </div>
        
        {element.type === 'action' || element.type === 'dialogue' || element.type === 'parenthetical' ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[80px] font-mono text-sm"
            disabled={isSaving}
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="font-mono text-sm"
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
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative p-3 border rounded-lg cursor-pointer hover:shadow-sm transition-all ${getElementBorderColor(element.type)}`}
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {element.type.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <div className={`font-mono text-sm ${getElementStyle(element.type)}`}>
            {element.content || <span className="text-gray-400 italic">Click to edit...</span>}
          </div>
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          
          {onAdd && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                setShowAddMenu(true)
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
          
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(episodeId, sceneId, elementIndex)
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Add Element Menu */}
      <AnimatePresence>
        {showAddMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg p-2 z-10"
          >
            <div className="space-y-1">
              {['action', 'character', 'dialogue', 'parenthetical', 'transition'].map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onAdd!(episodeId, sceneId, elementIndex, type)
                    setShowAddMenu(false)
                  }}
                  className="w-full justify-start text-sm"
                >
                  Add {type.replace('_', ' ').toUpperCase()}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function EditableScript({ scriptData, onUpdate }: EditableScriptProps) {
  const [isSaving, setIsSaving] = useState(false)

  const handleElementSave = async (episodeId: string, sceneId: string, elementIndex: number, newContent: string) => {
    try {
      setIsSaving(true)
      const result = await editingService.editScript(scriptData, episodeId, sceneId, elementIndex, newContent)
      
      if (result.success && result.updatedScript) {
        onUpdate(result.updatedScript)
      } else {
        alert(result.error || 'Failed to update script')
      }
    } catch (error) {
      console.error('Error updating script:', error)
      alert('Failed to update script')
    } finally {
      setIsSaving(false)
    }
  }

  const handleElementDelete = async (episodeId: string, sceneId: string, elementIndex: number) => {
    if (!confirm('Are you sure you want to delete this script element?')) {
      return
    }

    try {
      // Create updated script without the element
      const updatedScript = { ...scriptData }
      const episodes = [...(updatedScript.episodes || [])]
      const episodeIndex = episodes.findIndex(ep => ep.id === episodeId)
      
      if (episodeIndex === -1) return

      const scenes = [...(episodes[episodeIndex].scenes || [])]
      const sceneIndex = scenes.findIndex(scene => scene.id === sceneId)
      
      if (sceneIndex === -1) return

      const elements = [...(scenes[sceneIndex].elements || [])]
      elements.splice(elementIndex, 1)
      
      scenes[sceneIndex] = { ...scenes[sceneIndex], elements }
      episodes[episodeIndex] = { ...episodes[episodeIndex], scenes }
      updatedScript.episodes = episodes

      onUpdate(updatedScript)
    } catch (error) {
      console.error('Error deleting script element:', error)
      alert('Failed to delete script element')
    }
  }

  const handleElementAdd = async (episodeId: string, sceneId: string, afterIndex: number, elementType: string) => {
    try {
      // Create updated script with new element
      const updatedScript = { ...scriptData }
      const episodes = [...(updatedScript.episodes || [])]
      const episodeIndex = episodes.findIndex(ep => ep.id === episodeId)
      
      if (episodeIndex === -1) return

      const scenes = [...(episodes[episodeIndex].scenes || [])]
      const sceneIndex = scenes.findIndex(scene => scene.id === sceneId)
      
      if (sceneIndex === -1) return

      const elements = [...(scenes[sceneIndex].elements || [])]
      const newElement: ScriptElement = {
        type: elementType as any,
        content: '',
        id: `element_${Date.now()}`
      }
      
      elements.splice(afterIndex + 1, 0, newElement)
      
      scenes[sceneIndex] = { ...scenes[sceneIndex], elements }
      episodes[episodeIndex] = { ...episodes[episodeIndex], scenes }
      updatedScript.episodes = episodes

      onUpdate(updatedScript)
    } catch (error) {
      console.error('Error adding script element:', error)
      alert('Failed to add script element')
    }
  }

  if (!scriptData || !scriptData.episodes) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No script content available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Script Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Script Editor
            <Badge variant="default" className="bg-green-600">Always Editable</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              <div>
                <h4 className="font-semibold">Script Editing Enabled</h4>
                <p className="text-sm">
                  Pre-production scripts are always editable. Click any element to edit, or use the + button to add new elements.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Episodes */}
      {scriptData.episodes.map((episode: any, episodeIndex: number) => (
        <Card key={episode.id || episodeIndex}>
          <CardHeader>
            <CardTitle>
              Episode {episode.number || episodeIndex + 1}: {episode.title || 'Untitled'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Scenes */}
            <div className="space-y-6">
              {(episode.scenes || []).map((scene: any, sceneIndex: number) => (
                <motion.div
                  key={scene.id || sceneIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sceneIndex * 0.1 }}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Badge>Scene {sceneIndex + 1}</Badge>
                    {scene.title && <span className="font-medium">{scene.title}</span>}
                  </div>

                  {/* Script Elements */}
                  <div className="space-y-2">
                    {(scene.elements || []).map((element: ScriptElement, elementIndex: number) => (
                      <EditableScriptElement
                        key={element.id || elementIndex}
                        element={element}
                        elementIndex={elementIndex}
                        sceneId={scene.id || `scene_${sceneIndex}`}
                        episodeId={episode.id || `episode_${episodeIndex}`}
                        onSave={handleElementSave}
                        onDelete={handleElementDelete}
                        onAdd={handleElementAdd}
                      />
                    ))}

                    {(scene.elements || []).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <Button
                          variant="outline"
                          onClick={() => handleElementAdd(
                            episode.id || `episode_${episodeIndex}`,
                            scene.id || `scene_${sceneIndex}`,
                            -1,
                            'scene_heading'
                          )}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add First Element
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {(episode.scenes || []).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No scenes available for this episode.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

