'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PreProductionData, PropItem, PropsWardrobeData } from '@/types/preproduction'
import { EditableField } from '../shared/EditableField'
import { StatusBadge } from '../shared/StatusBadge'
import { TableView } from '../shared/TableView'
import { QuestionnaireModal } from '../shared/QuestionnaireModal'
import type { Questionnaire } from '@/services/ai-generators/questionnaire-generator'
import { getStoryBible } from '@/services/story-bible-service'

interface PropsWardrobeTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
}

export function PropsWardrobeTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName
}: PropsWardrobeTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<'props' | 'wardrobe'>('props')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const hasShownQuestionnaireOnMount = useRef(false)
  
  // Detect context
  const isArcContext = preProductionData.type === 'arc'
  const isEpisodeContext = preProductionData.type === 'episode'
  
  // Get breakdown and script data for prerequisites
  const breakdownData = isEpisodeContext ? preProductionData.scriptBreakdown : undefined
  const scriptsData = (preProductionData as any).scripts
  
  const propsData: PropsWardrobeData = (isEpisodeContext && preProductionData.propsWardrobe) || {
    episodeNumber: isEpisodeContext ? preProductionData.episodeNumber : 0,
    episodeTitle: isEpisodeContext ? preProductionData.episodeTitle || '' : '',
    totalItems: 0,
    obtainedItems: 0,
    totalCost: 0,
    props: [],
    wardrobe: [],
    lastUpdated: Date.now(),
    updatedBy: currentUserId
  }

  // Generate questionnaire
  const handleGenerateQuestionnaire = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      console.log('❓ Generating questionnaire...')

      if (!breakdownData) {
        setGenerationError('Please generate script breakdown first')
        setIsGenerating(false)
        return
      }

      if (!scriptsData?.fullScript) {
        setGenerationError('Please generate a script first')
        setIsGenerating(false)
        return
      }

      const storyBible = await getStoryBible(preProductionData.storyBibleId, currentUserId)
      if (!storyBible) {
        throw new Error('Story bible not found')
      }

      const response = await fetch('/api/generate/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preProductionId: (preProductionData as any).id,
          storyBibleId: preProductionData.storyBibleId,
          episodeNumber: isEpisodeContext ? preProductionData.episodeNumber : undefined,
          userId: currentUserId,
          scriptData: scriptsData.fullScript,
          breakdownData: breakdownData,
          storyBibleData: storyBible,
          castingData: preProductionData.casting,
          questionnaireType: 'props-wardrobe'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to generate questionnaire')
      }

      const result = await response.json()
      setQuestionnaire(result.questionnaire)
      setShowQuestionnaire(true)
      console.log('✅ Questionnaire generated')
    } catch (error: any) {
      console.error('❌ Error generating questionnaire:', error)
      setGenerationError(error.message || 'Failed to generate questionnaire')
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate props/wardrobe
  const handleGeneratePropsWardrobe = async (questionnaireAnswers?: Record<string, any>) => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      console.log('🎬 Generating props and wardrobe...')

      if (!breakdownData) {
        setGenerationError('Please generate script breakdown first')
        setIsGenerating(false)
        return
      }

      if (!scriptsData?.fullScript) {
        setGenerationError('Please generate a script first')
        setIsGenerating(false)
        return
      }

      const storyBible = await getStoryBible(preProductionData.storyBibleId, currentUserId)
      if (!storyBible) {
        throw new Error('Story bible not found')
      }

      console.log('✅ Script breakdown found')
      console.log('✅ Script data found')
      console.log('✅ Story bible loaded:', storyBible.seriesTitle || storyBible.title)

      if (questionnaireAnswers) {
        console.log('✅ Questionnaire answers provided:', Object.keys(questionnaireAnswers).length, 'answers')
      }

      const response = await fetch('/api/generate/props-wardrobe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preProductionId: (preProductionData as any).id,
          storyBibleId: preProductionData.storyBibleId,
          episodeNumber: isEpisodeContext ? preProductionData.episodeNumber : undefined,
          userId: currentUserId,
          scriptData: scriptsData.fullScript,
          breakdownData: breakdownData,
          storyBibleData: storyBible,
          questionnaireAnswers: questionnaireAnswers || propsData.questionnaireAnswers || {}
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to generate props/wardrobe')
      }

      const result = await response.json()
      console.log('✅ Props/Wardrobe generated successfully!')
      console.log('  Props:', result.propsWardrobe.props.length)
      console.log('  Wardrobe:', result.propsWardrobe.wardrobe.length)

      // Save generated data (merge with existing)
      await onUpdate('propsWardrobe', {
        ...result.propsWardrobe,
        questionnaireAnswers: questionnaireAnswers || propsData.questionnaireAnswers,
        lastUpdated: Date.now(),
        updatedBy: currentUserId
      })

    } catch (error: any) {
      console.error('❌ Error generating props/wardrobe:', error)
      setGenerationError(error.message || 'Failed to generate props/wardrobe. Please try again.')
    } finally {
      setIsGenerating(false)
      setShowQuestionnaire(false)
    }
  }

  const handleQuestionnaireComplete = (answers: Record<string, any>) => {
    console.log('✅ Questionnaire completed with', Object.keys(answers).length, 'answers')
    handleGeneratePropsWardrobe(answers)
  }

  // Auto-show questionnaire on first access if no data exists
  useEffect(() => {
    // Skip if already shown or if data exists
    if (hasShownQuestionnaireOnMount.current) return
    if (propsData.props.length > 0 || propsData.wardrobe.length > 0) {
      hasShownQuestionnaireOnMount.current = true
      return
    }
    
    // Check prerequisites
    if (!breakdownData || !scriptsData?.fullScript) return

    // Show questionnaire automatically on first access
    const showOnFirstAccess = async () => {
      // Only show if not already generating/shown
      if (!questionnaire && !showQuestionnaire && !isGenerating) {
        await handleGenerateQuestionnaire()
      }
    }
    
    // Small delay to ensure component is fully mounted
    const timeout = setTimeout(() => {
      showOnFirstAccess()
      hasShownQuestionnaireOnMount.current = true
    }, 300)
    
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsData.props.length, propsData.wardrobe.length, breakdownData, scriptsData?.fullScript])

  const handleItemUpdate = async (itemId: string, updates: Partial<PropItem>) => {
    // Find which array the item is in (props or wardrobe)
    const updatedProps = propsData.props.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    )
    const updatedWardrobe = propsData.wardrobe.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    )
    
    const totalItems = updatedProps.length + updatedWardrobe.length
    const obtainedItems = [...updatedProps, ...updatedWardrobe].filter(
      item => item.procurementStatus === 'obtained' || item.procurementStatus === 'packed'
    ).length
    const totalCost = [...updatedProps, ...updatedWardrobe].reduce(
      (sum, item) => sum + (item.estimatedCost || 0), 0
    )
    
    await onUpdate('propsWardrobe', {
      ...propsData,
      props: updatedProps,
      wardrobe: updatedWardrobe,
      totalItems,
      obtainedItems,
      totalCost,
      lastUpdated: Date.now()
    })
  }

  const handleAddItem = async () => {
    const newItem: PropItem = {
      id: `prop_${Date.now()}`,
      type: 'prop',
      name: 'New Prop',
      description: '',
      scenes: [],
      importance: 'secondary',
      source: 'buy',
      estimatedCost: 0,
      procurementStatus: 'needed',
      referencePhotos: [],
      notes: '',
      comments: []
    }
    
    const updatedProps = [...propsData.props, newItem]
    const totalItems = updatedProps.length + propsData.wardrobe.length
    const totalCost = [...updatedProps, ...propsData.wardrobe].reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
    
    await onUpdate('propsWardrobe', {
      ...propsData,
      props: updatedProps,
      totalItems,
      totalCost,
      lastUpdated: Date.now()
    })
  }

  const handleAddWardrobeItem = async () => {
    const newItem: PropItem = {
      id: `wardrobe_${Date.now()}`,
      type: 'wardrobe',
      name: 'New Wardrobe Item',
      description: '',
      scenes: [],
      importance: 'secondary',
      source: 'actor-owned',
      estimatedCost: 0,
      characterAssociated: '',
      procurementStatus: 'needed',
      referencePhotos: [],
      notes: '',
      comments: []
    }
    
    const updatedWardrobe = [...propsData.wardrobe, newItem]
    const totalItems = propsData.props.length + updatedWardrobe.length
    const totalCost = [...propsData.props, ...updatedWardrobe].reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
    
    await onUpdate('propsWardrobe', {
      ...propsData,
      wardrobe: updatedWardrobe,
      totalItems,
      totalCost,
      lastUpdated: Date.now()
    })
  }

  const handleAddComment = async (rowIndex: number, comment: string) => {
    // Find item by rowIndex in filteredItems
    const item = filteredItems[rowIndex]
    if (!item) return

    const newComment = {
      id: `comment_${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content: comment,
      timestamp: Date.now()
    }

    // Find which array the item is in
    const propItem = propsData.props.find(i => i.id === item.id)
    const wardrobeItem = propsData.wardrobe.find(i => i.id === item.id)

    if (propItem) {
      const updatedProps = propsData.props.map(i =>
        i.id === item.id ? { ...i, comments: [...(i.comments || []), newComment] } : i
      )
      await onUpdate('propsWardrobe', {
        ...propsData,
        props: updatedProps,
        lastUpdated: Date.now()
      })
    } else if (wardrobeItem) {
      const updatedWardrobe = propsData.wardrobe.map(i =>
        i.id === item.id ? { ...i, comments: [...(i.comments || []), newComment] } : i
      )
      await onUpdate('propsWardrobe', {
        ...propsData,
        wardrobe: updatedWardrobe,
        lastUpdated: Date.now()
      })
    }
  }

  // Get items for selected category
  const categoryItems = selectedCategory === 'props' ? propsData.props : propsData.wardrobe
  
  // Filter items by status
  const filteredItems = categoryItems.filter(item => {
    const statusMatch = selectedStatus === 'all' || item.procurementStatus === selectedStatus
    return statusMatch
  })

  // Stats
  const allItems = [...propsData.props, ...propsData.wardrobe]
  const totalItems = propsData.totalItems || allItems.length
  const propsCount = propsData.props.length
  const wardrobeCount = propsData.wardrobe.length
  const obtainedCount = propsData.obtainedItems || allItems.filter(i => 
    i.procurementStatus === 'obtained' || i.procurementStatus === 'packed'
  ).length
  const totalCost = propsData.totalCost || allItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)

  // Table columns
  const columns = [
    {
      key: 'name',
      label: 'Item Name',
      render: (_value: any, item: PropItem) => (
        <EditableField
          value={item.name}
          onSave={(value) => handleItemUpdate(item.id, { name: String(value) })}
          className="font-medium text-[#e7e7e7]"
        />
      ),
      sortable: true
    },
    {
      key: 'type',
      label: 'Type',
      render: (_value: any, item: PropItem) => (
        <span className="px-2 py-1 rounded text-xs font-medium bg-[#2a2a2a] text-[#e7e7e7]">
          {item.type === 'prop' ? 'Prop' : 'Wardrobe'}
        </span>
      ),
      sortable: true
    },
    {
      key: 'source',
      label: 'Source',
      render: (_value: any, item: PropItem) => (
        <select
          value={item.source}
          onChange={(e) => handleItemUpdate(item.id, { source: e.target.value as any })}
          className="bg-[#1a1a1a] border border-[#36393f] rounded px-2 py-1 text-[#e7e7e7] text-sm"
        >
          <option value="buy">Buy</option>
          <option value="rent">Rent</option>
          <option value="borrow">Borrow</option>
          <option value="actor-owned">Actor-Owned</option>
          <option value="diy">DIY</option>
        </select>
      ),
      sortable: true
    },
    {
      key: 'importance',
      label: 'Importance',
      render: (_value: any, item: PropItem) => (
        <select
          value={item.importance}
          onChange={(e) => handleItemUpdate(item.id, { importance: e.target.value as any })}
          className="bg-[#1a1a1a] border border-[#36393f] rounded px-2 py-1 text-[#e7e7e7] text-sm"
        >
          <option value="hero">Hero</option>
          <option value="secondary">Secondary</option>
          <option value="background">Background</option>
        </select>
      ),
      sortable: true
    },
    {
      key: 'estimatedCost',
      label: 'Cost',
      render: (_value: any, item: PropItem) => (
        <div className="flex items-center gap-1">
          <span className="text-[#e7e7e7]/50">$</span>
          <EditableField
            value={item.estimatedCost?.toString() || '0'}
            onSave={(value) => handleItemUpdate(item.id, { estimatedCost: parseFloat(String(value)) || 0 })}
            type="number"
            className="text-[#10B981] font-medium"
          />
        </div>
      ),
      sortable: true
    },
    {
      key: 'procurementStatus',
      label: 'Status',
      render: (_value: any, item: PropItem) => (
        <select
          value={item.procurementStatus}
          onChange={(e) => handleItemUpdate(item.id, { procurementStatus: e.target.value as any })}
          className="bg-[#1a1a1a] border border-[#36393f] rounded px-2 py-1 text-[#e7e7e7] text-sm"
        >
          <option value="needed">Needed</option>
          <option value="sourced">Sourced</option>
          <option value="obtained">Obtained</option>
          <option value="packed">Packed</option>
        </select>
      ),
      sortable: true
    },
    {
      key: 'responsiblePerson',
      label: 'Responsible',
      render: (_value: any, item: PropItem) => (
        <EditableField
          value={item.responsiblePerson || ''}
          onSave={(value) => handleItemUpdate(item.id, { responsiblePerson: String(value) })}
          placeholder="Unassigned"
          className="text-sm text-[#e7e7e7]/70"
        />
      )
    },
    {
      key: 'characterAssociated',
      label: 'Character',
      render: (_value: any, item: PropItem) => (
        item.type === 'wardrobe' ? (
          <EditableField
            value={item.characterAssociated || ''}
            onSave={(value) => handleItemUpdate(item.id, { characterAssociated: String(value) })}
            placeholder="Character name"
            className="text-sm text-[#e7e7e7]/70"
          />
        ) : (
          <span className="text-xs text-[#e7e7e7]/30">—</span>
        )
      )
    },
    {
      key: 'scenes',
      label: 'Scenes',
      render: (_value: any, item: PropItem) => (
        <div className="flex flex-wrap gap-1">
          {item.scenes && item.scenes.length > 0 ? (
            item.scenes.map((scene, idx) => (
              <span key={idx} className="px-2 py-1 bg-[#1a1a1a] rounded text-xs text-[#e7e7e7]/70">
                {scene}
              </span>
            ))
          ) : (
            <span className="text-xs text-[#e7e7e7]/30">None</span>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Items</div>
          <div className="text-2xl font-bold text-[#10B981]">{totalItems}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Props</div>
          <div className="text-2xl font-bold text-[#e7e7e7]">{propsCount}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Wardrobe</div>
          <div className="text-2xl font-bold text-[#e7e7e7]">{wardrobeCount}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Obtained</div>
          <div className="text-2xl font-bold text-green-400">{obtainedCount}/{totalItems}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Cost</div>
          <div className="text-2xl font-bold text-[#10B981]">${totalCost.toLocaleString()}</div>
        </div>
      </div>

      {/* Categorized Tabs - Concept 1 (matching design preview) */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('props')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === 'props'
              ? 'bg-[#10B981] text-black'
              : 'bg-[#2a2a2a] text-[#e7e7e7] hover:bg-[#36393f]'
          }`}
        >
          Props
        </button>
        <button
          onClick={() => setSelectedCategory('wardrobe')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === 'wardrobe'
              ? 'bg-[#10B981] text-black'
              : 'bg-[#2a2a2a] text-[#e7e7e7] hover:bg-[#36393f]'
          }`}
        >
          Wardrobe
        </button>
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-[#2a2a2a] border border-[#36393f] rounded-lg text-[#e7e7e7] text-sm"
          >
            <option value="all">All Status</option>
            <option value="needed">Needed</option>
            <option value="sourced">Sourced</option>
            <option value="obtained">Obtained</option>
            <option value="packed">Packed</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {breakdownData && scriptsData?.fullScript && (
            <button
              onClick={handleGenerateQuestionnaire}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 rounded-lg hover:bg-[#10B981]/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? '🔄 Generating...' : '✨ Generate Props/Wardrobe'}
            </button>
          )}
          <button
            onClick={handleAddItem}
            className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] border border-[#36393f] rounded-lg hover:bg-[#36393f] transition-colors text-sm font-medium"
          >
            + Add Prop
          </button>
          <button
            onClick={handleAddWardrobeItem}
            className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] border border-[#36393f] rounded-lg hover:bg-[#36393f] transition-colors text-sm font-medium"
          >
            + Add Wardrobe
          </button>
        </div>
      </div>

      {/* Generation Error */}
      {generationError && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          <p className="font-medium">Generation Error</p>
          <p className="text-sm mt-1">{generationError}</p>
        </div>
      )}

      {/* Items Grid - Concept 1: Categorized Tabs (matching design preview) */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-[#2a2a2a] rounded-lg border border-[#36393f]">
          <div className="text-6xl mb-4">{selectedCategory === 'props' ? '🎬' : '👗'}</div>
          <h3 className="text-xl font-bold text-[#e7e7e7] mb-2">No {selectedCategory === 'props' ? 'Props' : 'Wardrobe'} Added</h3>
          <p className="text-[#e7e7e7]/70 mb-6">
            Generate {selectedCategory} breakdown based on your script, or add items manually
          </p>
          <div className="flex items-center justify-center gap-4">
            {!breakdownData || !scriptsData?.fullScript ? (
              <div className="text-center">
                <p className="text-sm text-[#e7e7e7]/50 mb-4">
                  Please generate Script and Script Breakdown first
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleGenerateQuestionnaire}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-[#10B981] text-black rounded-lg font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? '🔄 Generating...' : '✨ Generate Props/Wardrobe'}
                </button>
                <span className="text-[#e7e7e7]/50">or</span>
                <button
                  onClick={selectedCategory === 'props' ? handleAddItem : handleAddWardrobeItem}
                  className="px-6 py-3 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg border border-[#36393f] font-medium hover:bg-[#36393f] transition-colors"
                >
                  + Add {selectedCategory === 'props' ? 'Prop' : 'Wardrobe'} Manually
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-4">
              <h4 className="font-bold mb-2 text-[#e7e7e7]">{item.name}</h4>
              <p className="text-sm mb-3 text-[#e7e7e7]/70">{item.description || 'No description'}</p>
              <div className="text-xs text-[#e7e7e7]/50 space-y-1">
                <div>Character: {item.characterAssociated || item.characterName || 'N/A'}</div>
                <div>Scenes: {item.scenes && item.scenes.length > 0 ? item.scenes.join(', ') : 'None'}</div>
                <div>Quantity: {item.quantity || 1}</div>
                {item.estimatedCost !== undefined && item.estimatedCost > 0 && (
                  <div>Cost: ${item.estimatedCost}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Questionnaire Modal */}
      <QuestionnaireModal
        questionnaire={questionnaire}
        isOpen={showQuestionnaire}
        onClose={() => {
          setShowQuestionnaire(false)
          setQuestionnaire(null)
        }}
        onComplete={handleQuestionnaireComplete}
        existingAnswers={propsData.questionnaireAnswers || {}}
      />
    </div>
  )
}
