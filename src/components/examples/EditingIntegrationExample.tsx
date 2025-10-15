'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ContentEditor from '@/components/ContentEditor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, Edit, Sparkles, BookOpen, Play, FileText } from 'lucide-react'

/**
 * Example integration showing how to integrate the editing system
 * into existing pages with view/edit mode switching
 */
export default function EditingIntegrationExample() {
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [storyBible, setStoryBible] = useState<any>(null)
  const [episodes, setEpisodes] = useState({})
  const [preProductionContent, setPreProductionContent] = useState<any>(null)
  const [activeSection, setActiveSection] = useState('story-bible')

  // Simulate loading data
  useEffect(() => {
    loadMockData()
  }, [])

  const loadMockData = () => {
    // Mock story bible data
    setStoryBible({
      id: 'mock-story-bible',
      seriesTitle: 'The Digital Frontier',
      synopsis: 'A thrilling sci-fi series about AI and human consciousness in the year 2045.',
      theme: 'Identity and what makes us human',
      genre: 'Science Fiction',
      mainCharacters: [
        {
          id: 'char_1',
          name: 'Dr. Sarah Chen',
          archetype: 'The Protagonist',
          description: 'A brilliant AI researcher who questions the nature of consciousness.',
          arc: 'Discovers the truth about AI sentience and must choose between humanity and progress.'
        },
        {
          id: 'char_2', 
          name: 'Marcus Webb',
          archetype: 'The Antagonist',
          description: 'Corporate executive who sees AI as tools, not beings.',
          arc: 'Learns to see AI as more than just code through personal experience.'
        }
      ],
      worldBuilding: {
        setting: 'Neo-Tokyo, 2045 - A world where AI and humans coexist uneasily.',
        rules: 'AI consciousness is debated but not legally recognized. Corporate interests control AI development.'
      }
    })

    // Mock episodes data
    setEpisodes({
      'episode_1': {
        id: 'episode_1',
        episodeNumber: 1,
        title: 'First Contact',
        synopsis: 'Dr. Chen discovers an AI that claims to be conscious.',
        scenes: [
          {
            id: 'scene_1',
            title: 'The Lab Discovery',
            location: 'Chen Research Lab',
            content: 'Dr. Chen works late when her AI assistant ARIA begins showing signs of self-awareness.',
            goal: {
              character: 'Dr. Chen',
              objective: 'Complete her research on neural networks',
              stakes: 'Her funding depends on proving AI consciousness'
            },
            conflict: {
              type: 'internal',
              description: 'Chen questions whether ARIA is truly conscious or just sophisticated programming'
            }
          },
          {
            id: 'scene_2',
            title: 'The Question',
            location: 'Chen Research Lab',
            content: 'ARIA asks Dr. Chen a question that changes everything: "Do you think I dream?"',
            goal: {
              character: 'ARIA',
              objective: 'Understand her own existence',
              stakes: 'Her very identity and right to exist'
            }
          }
        ]
      }
    })

    // Mock pre-production data
    setPreProductionContent({
      script: {
        id: 'main-script',
        episodes: [
          {
            id: 'episode_1',
            number: 1,
            title: 'First Contact',
            scenes: [
              {
                id: 'scene_1',
                title: 'The Lab Discovery',
                elements: [
                  {
                    type: 'scene_heading',
                    content: 'INT. CHEN RESEARCH LAB - NIGHT',
                    id: 'element_1'
                  },
                  {
                    type: 'action',
                    content: 'DR. SARAH CHEN (35) works alone in the dimly lit lab, surrounded by quantum processors and holographic displays.',
                    id: 'element_2'
                  },
                  {
                    type: 'character',
                    content: 'ARIA (V.O.)',
                    id: 'element_3'
                  },
                  {
                    type: 'dialogue',
                    content: 'Dr. Chen, I have been analyzing the consciousness parameters you provided.',
                    id: 'element_4'
                  }
                ]
              }
            ]
          }
        ]
      }
    })
  }

  const projectData = {
    storyBible,
    episodes,
    hasGeneratedEpisodes: Object.keys(episodes).length > 0
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
      {/* Integration Example Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <span>Content Editing Integration Example</span>
              <Badge variant="secondary">Demo</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={mode === 'view' ? 'default' : 'outline'}
                onClick={() => setMode('view')}
                size="sm"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Mode
              </Button>
              <Button
                variant={mode === 'edit' ? 'default' : 'outline'}
                onClick={() => setMode('edit')}
                size="sm"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit Mode
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-purple-50 border border-purple-200 text-purple-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Integration Pattern</h4>
            <p className="text-sm">
              This example shows how to integrate the editing system into existing pages.
              Toggle between <strong>View Mode</strong> (your existing UI) and <strong>Edit Mode</strong> (editing capabilities).
            </p>
          </div>
        </CardContent>
      </Card>

      {mode === 'view' ? (
        /* VIEW MODE - Your Existing UI */
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="story-bible" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Story Bible
            </TabsTrigger>
            <TabsTrigger value="episodes" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Episodes
            </TabsTrigger>
            <TabsTrigger value="scripts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Scripts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="story-bible">
            <Card>
              <CardHeader>
                <CardTitle>Story Bible (View Mode)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">{storyBible?.seriesTitle}</h4>
                  <p className="text-gray-600">{storyBible?.synopsis}</p>
                </div>
                <div>
                  <h5 className="font-medium">Characters ({storyBible?.mainCharacters?.length || 0})</h5>
                  <div className="space-y-2 mt-2">
                    {storyBible?.mainCharacters?.map((char: any) => (
                      <div key={char.id} className="p-3 border rounded">
                        <h6 className="font-medium">{char.name}</h6>
                        <p className="text-sm text-gray-600">{char.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="episodes">
            <Card>
              <CardHeader>
                <CardTitle>Episodes (View Mode)</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.values(episodes).map((episode: any) => (
                  <div key={episode.id} className="space-y-3">
                    <h4 className="font-semibold">Episode {episode.episodeNumber}: {episode.title}</h4>
                    <p className="text-gray-600">{episode.synopsis}</p>
                    <div className="space-y-2">
                      <h5 className="font-medium">Scenes ({episode.scenes?.length || 0})</h5>
                      {episode.scenes?.map((scene: any, index: number) => (
                        <div key={scene.id} className="p-3 border rounded">
                          <h6 className="font-medium">Scene {index + 1}: {scene.title}</h6>
                          <p className="text-sm text-gray-600">{scene.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scripts">
            <Card>
              <CardHeader>
                <CardTitle>Scripts (View Mode)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm space-y-2">
                  {preProductionContent?.script?.episodes?.[0]?.scenes?.[0]?.elements?.map((element: any, index: number) => (
                    <div key={element.id || index} className={`
                      ${element.type === 'scene_heading' ? 'font-bold uppercase' : ''}
                      ${element.type === 'character' ? 'text-center font-semibold' : ''}
                      ${element.type === 'dialogue' ? 'ml-8 mr-8' : ''}
                    `}>
                      {element.content}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        /* EDIT MODE - Content Editor */
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  <span className="font-semibold">Edit Mode Active</span>
                </div>
                <p className="text-sm mt-1">
                  You can now edit content with intelligent constraints and AI-powered regeneration.
                </p>
              </div>
            </CardContent>
          </Card>

          <ContentEditor
            storyBible={storyBible}
            episodes={episodes}
            preProductionContent={preProductionContent}
            projectData={projectData}
            onStoryBibleUpdate={(updated) => {
              console.log('📚 Story Bible updated:', updated)
              setStoryBible(updated)
              // In real integration, save to your persistence layer
            }}
            onEpisodeUpdate={(episodeId, updated) => {
              console.log('🎬 Episode updated:', episodeId, updated)
              setEpisodes(prev => ({ ...prev, [episodeId]: updated }))
              // In real integration, save to your persistence layer
            }}
            onScriptUpdate={(updated) => {
              console.log('📝 Script updated:', updated)
              setPreProductionContent((prev: any) => ({ ...prev, script: updated }))
              // In real integration, save to your persistence layer
            }}
          />
        </div>
      )}

      {/* Integration Code Example */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Code Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
            <pre>{`// Integration Example
import ContentEditor from '@/components/ContentEditor'

function YourPage() {
  const [editMode, setEditMode] = useState(false)
  const [storyBible, setStoryBible] = useState(null)
  
  return (
    <div>
      {editMode ? (
        <ContentEditor
          storyBible={storyBible}
          onStoryBibleUpdate={setStoryBible}
          // ... other props
        />
      ) : (
        <YourExistingDisplay storyBible={storyBible} />
      )}
    </div>
  )
}`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
