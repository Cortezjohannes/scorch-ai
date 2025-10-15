'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import EditableStoryBible from './EditableStoryBible'
import EditableEpisode from './EditableEpisode'
import EditableScript from './EditableScript'
import { editingService } from '@/services/editing-service'
import { Book, Play, FileText, History, AlertCircle, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ContentEditorProps {
  // Main content data
  storyBible?: any
  episodes?: { [key: string]: any }
  preProductionContent?: any
  
  // Project context
  projectData?: any
  
  // Callbacks
  onStoryBibleUpdate?: (updatedStoryBible: any) => void
  onEpisodeUpdate?: (episodeId: string, updatedEpisode: any) => void
  onScriptUpdate?: (updatedScript: any) => void
  
  // Configuration
  activeTab?: 'story-bible' | 'episodes' | 'scripts'
  selectedEpisodeId?: string
}

interface EditHistoryEntry {
  id: string
  timestamp: Date
  entityType: string
  entityId: string
  action: string
  field: string
  summary: string
}

export default function ContentEditor({
  storyBible,
  episodes = {},
  preProductionContent,
  projectData,
  onStoryBibleUpdate,
  onEpisodeUpdate,
  onScriptUpdate,
  activeTab = 'story-bible',
  selectedEpisodeId
}: ContentEditorProps) {
  const [currentTab, setCurrentTab] = useState(activeTab)
  const [selectedEpisode, setSelectedEpisode] = useState(selectedEpisodeId)
  const [editHistory, setEditHistory] = useState<EditHistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeEditor()
  }, [])

  useEffect(() => {
    if (selectedEpisodeId) {
      setSelectedEpisode(selectedEpisodeId)
      setCurrentTab('episodes')
    }
  }, [selectedEpisodeId])

  const initializeEditor = async () => {
    try {
      setIsLoading(true)
      
      // Load edit history
      const history = editingService.getEditHistory()
      setEditHistory(history.slice(0, 20).map(entry => ({
        ...entry,
        summary: `${entry.action} ${entry.field} on ${entry.entityType}`
      }))) // Last 20 edits

      // Subscribe to editing events
      const unsubscribeStoryBible = editingService.subscribe('story-bible-updated', (data: any) => {
        console.log('📚 Story Bible updated:', data)
        loadEditHistory()
      })

      const unsubscribeEpisode = editingService.subscribe('episode-scene-updated', (data: any) => {
        console.log('🎬 Episode scene updated:', data)
        loadEditHistory()
      })

      const unsubscribeScript = editingService.subscribe('script-updated', (data: any) => {
        console.log('📝 Script updated:', data)
        loadEditHistory()
      })

      // Cleanup subscriptions on unmount
      return () => {
        unsubscribeStoryBible()
        unsubscribeEpisode()
        unsubscribeScript()
      }
    } catch (error) {
      console.error('Error initializing content editor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadEditHistory = () => {
    const history = editingService.getEditHistory()
    setEditHistory(history.slice(0, 20).map(entry => ({
      ...entry,
      summary: `${entry.action} ${entry.field} on ${entry.entityType}`
    })))
  }

  const handleStoryBibleUpdate = (updatedStoryBible: any) => {
    if (onStoryBibleUpdate) {
      onStoryBibleUpdate(updatedStoryBible)
    }
    loadEditHistory()
  }

  const handleEpisodeUpdate = (updatedEpisode: any) => {
    if (onEpisodeUpdate && updatedEpisode.id) {
      onEpisodeUpdate(updatedEpisode.id, updatedEpisode)
    }
    loadEditHistory()
  }

  const handleScriptUpdate = (updatedScript: any) => {
    if (onScriptUpdate) {
      onScriptUpdate(updatedScript)
    }
    loadEditHistory()
  }

  const formatEditSummary = (edit: any): string => {
    switch (edit.entityType) {
      case 'story-bible':
        return `Updated ${edit.field} in story bible`
      case 'episode':
        return `Updated episode ${edit.entityId}`
      case 'scene':
        return `Updated scene ${edit.field}`
      case 'script':
        return `Updated script element`
      default:
        return `Updated ${edit.entityType}`
    }
  }

  const getAvailableEpisodes = () => {
    return Object.values(episodes).sort((a: any, b: any) => 
      (a.episodeNumber || 0) - (b.episodeNumber || 0)
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Initializing Content Editor</h3>
          <p className="text-gray-600">Loading editing capabilities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Editor Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <span>Content Editor</span>
              <Badge variant="default" className="bg-green-600">
                AI-Powered Editing
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="w-4 h-4 mr-1" />
                History ({editHistory.length})
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-semibold">Smart Editing System</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Story Bible:</strong> Editable until episodes are generated (characters always addable)</li>
                  <li>• <strong>Episodes:</strong> Scenes editable until next episode generated (auto-regeneration enabled)</li>
                  <li>• <strong>Scripts:</strong> Always editable in pre-production</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Edits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {editHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No edits yet</p>
                  ) : (
                    editHistory.map((edit) => (
                      <div key={edit.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div>
                          <span className="font-medium">{formatEditSummary(edit)}</span>
                          <Badge variant="outline" className="ml-2">
                            {edit.entityType}
                          </Badge>
                        </div>
                        <span className="text-gray-500">
                          {new Date(edit.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Editing Tabs */}
      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as "episodes" | "story-bible" | "scripts")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="story-bible" className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            Story Bible
          </TabsTrigger>
          <TabsTrigger value="episodes" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Episodes ({Object.keys(episodes).length})
          </TabsTrigger>
          <TabsTrigger value="scripts" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Scripts
          </TabsTrigger>
        </TabsList>

        {/* Story Bible Tab */}
        <TabsContent value="story-bible" className="space-y-6">
          {storyBible ? (
            <EditableStoryBible
              storyBible={storyBible}
              onUpdate={handleStoryBibleUpdate}
              projectData={projectData}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Book className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Story Bible</h3>
                <p className="text-gray-600 mb-4">
                  Generate a story bible first to enable editing capabilities.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Episodes Tab */}
        <TabsContent value="episodes" className="space-y-6">
          {Object.keys(episodes).length > 0 ? (
            <div className="space-y-6">
              {/* Episode Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Episode to Edit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {getAvailableEpisodes().map((episode: any) => (
                      <Button
                        key={episode.id}
                        variant={selectedEpisode === episode.id ? "default" : "outline"}
                        onClick={() => setSelectedEpisode(episode.id)}
                        className="flex flex-col items-center p-3 h-auto"
                      >
                        <span className="font-semibold">Episode {episode.episodeNumber}</span>
                        <span className="text-xs text-muted-foreground truncate w-full">
                          {episode.title || episode.episodeTitle || 'Untitled'}
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Episode Editor */}
              {selectedEpisode && episodes[selectedEpisode] && (
                <EditableEpisode
                  episode={episodes[selectedEpisode]}
                  onUpdate={handleEpisodeUpdate}
                  projectData={projectData}
                />
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Episodes</h3>
                <p className="text-gray-600 mb-4">
                  Generate episodes first to enable scene editing capabilities.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Scripts Tab */}
        <TabsContent value="scripts" className="space-y-6">
          {preProductionContent?.script || preProductionContent?.generatedContent?.script ? (
            <EditableScript
              scriptData={preProductionContent.script || preProductionContent.generatedContent.script}
              onUpdate={handleScriptUpdate}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Scripts</h3>
                <p className="text-gray-600 mb-4">
                  Generate pre-production content first to enable script editing.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
