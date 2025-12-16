'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import type { PreProductionData, EquipmentItem } from '@/types/preproduction'
import { EditableField } from '../shared/EditableField'
import { TableView } from '../shared/TableView'
import { QuestionnaireModal } from '../shared/QuestionnaireModal'
import type { Questionnaire } from '@/services/ai-generators/questionnaire-generator'
import { getStoryBible } from '@/services/story-bible-service'
import { aggregateEquipmentFromEpisodes } from '@/services/arc-preproduction-aggregator'

interface EquipmentTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
  // Arc-wide props (optional)
  arcPreProdData?: any
  episodePreProdData?: Record<number, any>
  storyBible?: any
  arcIndex?: number
}

export function EquipmentTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName,
  arcPreProdData,
  episodePreProdData,
  storyBible,
  arcIndex
}: EquipmentTabProps) {
  // Detect arc context
  const isArcContext = preProductionData.type === 'arc' || !!arcPreProdData
  
  // Equipment is only managed at arc level
  if (!isArcContext) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="text-6xl mb-4">🎥</div>
        <h3 className="text-xl font-bold text-[#e7e7e7] mb-2">Equipment Managed at Arc Level</h3>
        <p className="text-[#e7e7e7]/70 mb-6 max-w-md">
          Equipment is shared across all episodes in an arc, so it's managed at the production assistant level.
          <br /><br />
          Please navigate to the production assistant page to manage equipment for this arc.
        </p>
      </div>
    )
  }
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({})
  const hasShownQuestionnaireOnMount = useRef(false)

  // Hybrid data source: Use arc document first, fall back to aggregation
  const arcEquipmentData = (preProductionData as any).equipment
  const aggregatedEquipmentData = useMemo(() => {
    if (isArcContext && episodePreProdData && Object.keys(episodePreProdData).length > 0) {
      return aggregateEquipmentFromEpisodes(episodePreProdData)
    }
    return null
  }, [isArcContext, episodePreProdData])
  
  // Priority: Arc document > Aggregated from episodes > Empty
  const equipmentData = arcEquipmentData && (
    (Array.isArray(arcEquipmentData.items) && arcEquipmentData.items.length > 0) ||
    (arcEquipmentData.camera && arcEquipmentData.camera.length > 0) ||
    (arcEquipmentData.lighting && arcEquipmentData.lighting.length > 0)
  )
    ? arcEquipmentData
    : aggregatedEquipmentData || {
        items: [],
        camera: [],
        lens: [],
        lighting: [],
        audio: [],
        grip: [],
        other: [],
        lastUpdated: Date.now()
      }

  // Helper function to get all items from EquipmentData (handles both structures)
  const getAllItems = (data: any): EquipmentItem[] => {
    if (!data) return []
    
    // If items array exists, use it
    if (Array.isArray(data.items)) {
      return data.items
    }
    
    // Otherwise, collect from category arrays
    const categories: Array<'camera' | 'lens' | 'lighting' | 'audio' | 'grip' | 'other'> = 
      ['camera', 'lens', 'lighting', 'audio', 'grip', 'other']
    
    const allItems: EquipmentItem[] = []
    categories.forEach(category => {
      if (Array.isArray(data[category])) {
        allItems.push(...data[category])
      }
    })
    
    return allItems
  }

  // Get all items as a flat array for easy access
  const allItems = useMemo(() => getAllItems(equipmentData), [equipmentData])

  // Get breakdown and script data based on context
  const breakdownData = preProductionData.type === 'episode' 
    ? preProductionData.scriptBreakdown 
    : undefined // For arc context, we'll check episodePreProdData
  
  const scriptsData = preProductionData.type === 'episode' 
    ? (preProductionData as any).scripts 
    : undefined // For arc context, we'll check episodePreProdData
  
  // For arc context, check if any episode has breakdown and script data
  const hasArcPrerequisites = useMemo(() => {
    if (!isArcContext || !episodePreProdData) return false
    
    // Check if at least one episode has both breakdown and script
    return Object.values(episodePreProdData).some((epPreProd: any) => {
      const hasBreakdown = epPreProd?.scriptBreakdown?.scenes && epPreProd.scriptBreakdown.scenes.length > 0
      const hasScript = epPreProd?.scripts?.fullScript
      return hasBreakdown && hasScript
    })
  }, [isArcContext, episodePreProdData])

  // Cross-episode equipment inventory (localStorage per story bible)
  const inventoryKey = `equipmentInventory:${preProductionData.storyBibleId}`
  const loadInventory = (): Array<{ name: string; category: string }> => {
    try {
      const raw = localStorage.getItem(inventoryKey)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  const saveInventory = (items: Array<{ name: string; category: string }>) => {
    try {
      localStorage.setItem(inventoryKey, JSON.stringify(items))
    } catch {}
  }

  // Apply inventory: mark matching items as owned
  const applyInventoryToItems = (items: EquipmentItem[]): EquipmentItem[] => {
    const inv = loadInventory()
    if (!inv.length) return items
    const normalized = inv.map(i => ({ name: i.name.trim().toLowerCase(), category: i.category }))
    return items.map((it: any) => {
      const match = normalized.find(n => n.name === String(it.name || '').trim().toLowerCase() && (n.category === it.category))
      if (match) {
        return { ...it, ownership: 'owned' as any }
      }
      return it
    }) as any
  }

  const handleMarkOwnedGlobally = async (itemId: string) => {
    const item = allItems.find((i: any) => i.id === itemId)
    if (!item) return
    const inv = loadInventory()
    const exists = inv.some(i => i.name.toLowerCase() === String(item.name).toLowerCase() && i.category === (item as any).category)
    const next = exists ? inv : [...inv, { name: String(item.name), category: (item as any).category }]
    saveInventory(next)

    // Also reflect locally as owned - update the item in its category array
    const category = item.category || 'other'
    const updatedCategory = (equipmentData[category] || []).map((i: any) => i.id === itemId ? { ...i, ownership: 'owned' as any } : i)
    await onUpdate('equipment', { 
      ...equipmentData, 
      [category]: updatedCategory,
      lastUpdated: Date.now() 
    })
  }

  const handleApplyInventoryToList = async () => {
    const updated = applyInventoryToItems(allItems)
    // Update each category array
    const categories: Array<'camera' | 'lens' | 'lighting' | 'audio' | 'grip' | 'other'> = 
      ['camera', 'lens', 'lighting', 'audio', 'grip', 'other']
    
    const updatedData: any = { ...equipmentData }
    categories.forEach(category => {
      updatedData[category] = updated.filter((item: EquipmentItem) => item.category === category)
    })
    
    await onUpdate('equipment', { ...updatedData, lastUpdated: Date.now() })
  }

  // Auto-apply inventory on load (once)
  const autoAppliedRef = useRef(false)
  useEffect(() => {
    if (autoAppliedRef.current) return
    const inv = loadInventory()
    if (!inv.length) {
      autoAppliedRef.current = true
      return
    }
    const updated = applyInventoryToItems(allItems)
    const changed = JSON.stringify(updated) !== JSON.stringify(allItems)
    if (changed) {
      autoAppliedRef.current = true
      // Update each category array
      const categories: Array<'camera' | 'lens' | 'lighting' | 'audio' | 'grip' | 'other'> = 
        ['camera', 'lens', 'lighting', 'audio', 'grip', 'other']
      
      const updatedData: any = { ...equipmentData }
      categories.forEach(category => {
        updatedData[category] = updated.filter((item: EquipmentItem) => item.category === category)
      })
      
      onUpdate('equipment', { ...updatedData, lastUpdated: Date.now() })
    } else {
      autoAppliedRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Derive count of matches available in inventory
  const inventoryOwnedCount = useMemo(() => {
    const inv = loadInventory()
    if (!inv.length || allItems.length === 0) return 0
    const normalized = inv.map(i => ({ name: i.name.trim().toLowerCase(), category: i.category }))
    return allItems.filter((it: any) => normalized.find(n => n.name === String(it.name||'').trim().toLowerCase() && n.category === it.category)).length
  }, [allItems.length])

  const handleItemUpdate = async (itemId: string, updates: Partial<EquipmentItem>) => {
    const item = allItems.find((i: EquipmentItem) => i.id === itemId)
    if (!item) return
    
    const category = item.category || 'other'
    const updatedCategory = (equipmentData[category] || []).map((i: EquipmentItem) =>
      i.id === itemId ? { ...i, ...updates } : i
    )
    
    await onUpdate('equipment', {
      ...equipmentData,
      [category]: updatedCategory,
      lastUpdated: Date.now()
    })
  }

  const handleAddItem = async () => {
    const newItem: EquipmentItem = {
      id: `equip_${Date.now()}`,
      name: 'New Equipment',
      category: 'camera',
      ownership: 'renting',
      quantity: 1,
      totalCost: 0,
      notes: '',
      status: 'needed',
      comments: []
    } as any
    
    const category = newItem.category || 'other'
    const currentCategory = equipmentData[category] || []
    
    await onUpdate('equipment', {
      ...equipmentData,
      [category]: [...currentCategory, newItem],
      lastUpdated: Date.now()
    })
  }

  const handleAddComment = async (itemId: string, content: string) => {
    const item = allItems.find((i: EquipmentItem) => i.id === itemId)
    if (!item) return

    const newComment = {
      id: `comment_${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content,
      timestamp: Date.now()
    }

    const category = item.category || 'other'
    const updatedCategory = (equipmentData[category] || []).map((i: EquipmentItem) =>
      i.id === itemId
        ? { ...i, comments: [...(i.comments || []), newComment] }
        : i
    )

    await onUpdate('equipment', {
      ...equipmentData,
      [category]: updatedCategory,
      lastUpdated: Date.now()
    })
  }

  // Generate questionnaire
  const handleGenerateQuestionnaire = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      // Check prerequisites based on context
      if (isArcContext) {
        if (!hasArcPrerequisites) {
          setGenerationError('Please generate Script and Script Breakdown for at least one episode first')
          setIsGenerating(false)
          return
        }
      } else {
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
      }

      const storyBible = await getStoryBible(preProductionData.storyBibleId, currentUserId)
      if (!storyBible) throw new Error('Story bible not found')

      const requestBody: any = {
        preProductionId: (preProductionData as any).id,
        storyBibleId: preProductionData.storyBibleId,
        userId: currentUserId,
        storyBibleData: storyBible,
        castingData: preProductionData.casting,
        questionnaireType: 'both'
      }

      if (isArcContext && arcPreProdData && episodePreProdData) {
        // For arc context, aggregate breakdown and scripts from episodes
        const aggregatedBreakdown: any = {
          scenes: [],
          totalScenes: 0
        }
        const aggregatedScripts: any[] = []
        
        console.log('📊 Aggregating breakdown and script data from episodes for equipment questionnaire...')
        Object.entries(episodePreProdData).forEach(([epNumStr, epPreProd]: [string, any]) => {
          const epNum = parseInt(epNumStr)
          
          // Check for script breakdown
          const breakdown = epPreProd.scriptBreakdown
          if (breakdown?.scenes && Array.isArray(breakdown.scenes) && breakdown.scenes.length > 0) {
            console.log(`  ✅ Episode ${epNum}: Found ${breakdown.scenes.length} scenes in breakdown`)
            aggregatedBreakdown.scenes.push(...breakdown.scenes)
            aggregatedBreakdown.totalScenes += breakdown.scenes.length
          }
          
          // Check for scripts
          const scripts = epPreProd.scripts
          if (scripts?.fullScript) {
            console.log(`  ✅ Episode ${epNum}: Found script`)
            aggregatedScripts.push(scripts.fullScript)
          }
        })
        
        console.log(`📊 Aggregation results:`, {
          totalScenes: aggregatedBreakdown.scenes.length,
          totalScripts: aggregatedScripts.length
        })
        
        requestBody.arcPreProductionId = preProductionData.id
        requestBody.episodeNumbers = arcPreProdData.episodeNumbers || []
        requestBody.breakdownData = aggregatedBreakdown.scenes.length > 0 ? aggregatedBreakdown : null
        requestBody.scriptData = aggregatedScripts.length > 0 ? aggregatedScripts[0] : null
        requestBody.episodePreProdData = episodePreProdData // Pass full episode data for server-side fallback
      } else if (preProductionData.type === 'episode') {
        requestBody.episodeNumber = preProductionData.episodeNumber
        requestBody.scriptData = scriptsData?.fullScript
        requestBody.breakdownData = breakdownData
      }

      const response = await fetch('/api/generate/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to generate questionnaire')
      }
      const result = await response.json()
      setQuestionnaire(result.questionnaire)
      setShowQuestionnaire(true)
    } catch (e: any) {
      setGenerationError(e.message || 'Failed to generate questionnaire')
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate equipment
  const handleGenerateEquipment = async (answers?: Record<string, any>) => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      // Check prerequisites based on context
      if (isArcContext) {
        if (!hasArcPrerequisites) {
          setGenerationError('Please generate Script and Script Breakdown for at least one episode first')
          setIsGenerating(false)
          return
        }
      } else {
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
      }
      const storyBible = await getStoryBible(preProductionData.storyBibleId, currentUserId)
      if (!storyBible) throw new Error('Story bible not found')

      const combinedAnswers = answers || questionnaireAnswers || (arcPreProdData as any)?.propsWardrobe?.questionnaireAnswers || {}

      const requestBody: any = {
        preProductionId: (preProductionData as any).id,
        storyBibleId: preProductionData.storyBibleId,
        userId: currentUserId,
        storyBibleData: storyBible,
        questionnaireAnswers: combinedAnswers
      }

      if (isArcContext && arcPreProdData && episodePreProdData) {
        // For arc context, aggregate breakdown and scripts from episodes
        const aggregatedBreakdown: any = {
          scenes: [],
          totalScenes: 0
        }
        const aggregatedScripts: any[] = []
        
        console.log('📊 Aggregating breakdown and script data from episodes for equipment generation...')
        Object.entries(episodePreProdData).forEach(([epNumStr, epPreProd]: [string, any]) => {
          const epNum = parseInt(epNumStr)
          
          // Check for script breakdown
          const breakdown = epPreProd.scriptBreakdown
          if (breakdown?.scenes && Array.isArray(breakdown.scenes) && breakdown.scenes.length > 0) {
            console.log(`  ✅ Episode ${epNum}: Found ${breakdown.scenes.length} scenes in breakdown`)
            aggregatedBreakdown.scenes.push(...breakdown.scenes)
            aggregatedBreakdown.totalScenes += breakdown.scenes.length
          }
          
          // Check for scripts
          const scripts = epPreProd.scripts
          if (scripts?.fullScript) {
            console.log(`  ✅ Episode ${epNum}: Found script`)
            aggregatedScripts.push(scripts.fullScript)
          }
        })
        
        console.log(`📊 Aggregation results:`, {
          totalScenes: aggregatedBreakdown.scenes.length,
          totalScripts: aggregatedScripts.length
        })
        
        requestBody.arcPreProductionId = preProductionData.id
        requestBody.episodeNumbers = arcPreProdData.episodeNumbers || []
        requestBody.breakdownData = aggregatedBreakdown.scenes.length > 0 ? aggregatedBreakdown : null
        requestBody.scriptData = aggregatedScripts.length > 0 ? aggregatedScripts[0] : null
        requestBody.episodePreProdData = episodePreProdData // Pass full episode data for server-side fallback
      } else if (preProductionData.type === 'episode') {
        requestBody.episodeNumber = preProductionData.episodeNumber
        requestBody.scriptData = scriptsData?.fullScript
        requestBody.breakdownData = breakdownData
      }

      const response = await fetch('/api/generate/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to generate equipment')
      }
      const result = await response.json()

      // Map EquipmentData (categorized arrays) to legacy items[]
      const mapCategory = (arr: any[] | undefined, category: string) =>
        (arr || []).map((it: any) => ({
          id: it.id,
          name: it.name,
          category: category as any,
          ownership: (it.ownership === 'owned' ? 'own' : it.ownership === 'borrowing' ? 'borrow' : 'rent') as any,
          quantity: it.quantity || 1,
          cost: (it.totalCost || it.costPerDay || 0) as any,
          supplier: it.vendor || '',
          rentalDuration: it.pickupDate && it.returnDate ? `${it.pickupDate} → ${it.returnDate}` : '',
          notes: it.notes || '',
          status: (it.status || 'needed') as any,
          comments: []
        } as unknown as EquipmentItem))

      const eq = result.equipment
      const items: EquipmentItem[] = [
        ...mapCategory(eq.camera, 'camera'),
        ...mapCategory(eq.lens, 'lens'),
        ...mapCategory(eq.lighting, 'lighting'),
        ...mapCategory(eq.audio, 'audio'),
        ...mapCategory(eq.grip, 'grip'),
        ...mapCategory(eq.other, 'other'),
      ]

      // Update category arrays from generated items
      const categories: Array<'camera' | 'lens' | 'lighting' | 'audio' | 'grip' | 'other'> = 
        ['camera', 'lens', 'lighting', 'audio', 'grip', 'other']
      
      const updatedData: any = { ...equipmentData }
      categories.forEach(category => {
        updatedData[category] = items.filter((item: EquipmentItem) => item.category === category)
      })
      
      await onUpdate('equipment', {
        ...updatedData,
        lastUpdated: Date.now()
      })
    } catch (e: any) {
      setGenerationError(e.message || 'Failed to generate equipment')
    } finally {
      setIsGenerating(false)
      setShowQuestionnaire(false)
    }
  }

  const handleQuestionnaireComplete = (answers: Record<string, any>) => {
    setQuestionnaireAnswers(answers)
    setShowQuestionnaire(false)
    setQuestionnaire(null)
    handleGenerateEquipment(answers)
  }

  // Auto-show questionnaire on first access if no data exists
  useEffect(() => {
    // Skip if already shown or if data exists
    if (hasShownQuestionnaireOnMount.current) return
    if (allItems.length > 0) {
      hasShownQuestionnaireOnMount.current = true
      return
    }
    
    // Check prerequisites based on context
    if (isArcContext) {
      if (!hasArcPrerequisites) return
    } else {
      if (!breakdownData || !scriptsData?.fullScript) return
    }

    const sharedAnswers = (arcPreProdData as any)?.propsWardrobe?.questionnaireAnswers

    const showOnFirstAccess = async () => {
      if (!questionnaire && !showQuestionnaire && !isGenerating) {
        if (sharedAnswers && Object.keys(sharedAnswers).length > 0) {
          setQuestionnaireAnswers(sharedAnswers)
          await handleGenerateEquipment(sharedAnswers)
          hasShownQuestionnaireOnMount.current = true
        } else {
          await handleGenerateQuestionnaire()
          hasShownQuestionnaireOnMount.current = true
        }
      }
    }
    
    const timeout = setTimeout(() => {
      showOnFirstAccess()
      hasShownQuestionnaireOnMount.current = true
    }, 300)
    
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allItems.length, breakdownData, scriptsData?.fullScript, isArcContext, hasArcPrerequisites])

  // Filter items
  const filteredItems = selectedCategory === 'all'
    ? allItems
    : allItems.filter((item: EquipmentItem) => item.category === selectedCategory)

  // Stats
  const totalItems = allItems.length
  const cameraCount = allItems.filter((i: EquipmentItem) => i.category === 'camera').length
  const lightingCount = allItems.filter((i: EquipmentItem) => i.category === 'lighting').length
  const soundCount = allItems.filter((i: EquipmentItem) => (i as any).category === 'sound' || (i as any).category === 'audio').length
  const totalCost = allItems.reduce((sum: number, item: any) => sum + (item.totalCost || item.costPerDay || 0) * (item.quantity || 1), 0)
  const ownedCount = allItems.filter((i: any) => i.ownership === 'own' || i.ownership === 'owned').length

  // Table columns
  const columns = [
    {
      key: 'name',
      label: 'Equipment Name',
      render: (_: any, item: EquipmentItem) => (
        <div className="flex items-center gap-2">
          <EditableField
            value={item.name}
            onSave={(value) => handleItemUpdate(item.id, { name: String(value) } as any)}
            className="font-medium text-[#e7e7e7]"
          />
          <button
            onClick={() => handleMarkOwnedGlobally((item as any).id)}
            className="px-2 py-1 text-xs rounded border border-[#36393f] text-[#e7e7e7]/70 hover:text-[#e7e7e7] hover:bg-[#2a2a2a]"
            title="Mark as Owned (cross-episode)"
          >
            Mark Owned (global)
          </button>
        </div>
      ),
      sortable: true
    },
    {
      key: 'category',
      label: 'Category',
      render: (_: any, item: EquipmentItem) => (
        <select
          value={item.category}
          onChange={(e) => handleItemUpdate(item.id, { category: e.target.value as any })}
          className="bg-[#1a1a1a] border border-[#36393f] rounded px-2 py-1 text-[#e7e7e7] text-sm"
        >
          <option value="camera">Camera</option>
          <option value="lens">Lens</option>
          <option value="lighting">Lighting</option>
          <option value="audio">Audio</option>
          <option value="grip">Grip</option>
          <option value="other">Other</option>
        </select>
      ),
      sortable: true
    },
    {
      key: 'quantity',
      label: 'Qty',
      render: (_: any, item: EquipmentItem) => (
        <EditableField
          value={(item as any).quantity?.toString() || '1'}
          onSave={(value) => handleItemUpdate(item.id, { quantity: parseInt(String(value)) || 1 } as any)}
          type="number"
          className="text-center text-[#e7e7e7]"
        />
      ),
      sortable: true
    },
    {
      key: 'ownership',
      label: 'Ownership',
      render: (_: any, item: EquipmentItem) => (
        <select
          value={(item as any).ownership}
          onChange={(e) => handleItemUpdate(item.id, { ownership: e.target.value as any } as any)}
          className="bg-[#1a1a1a] border border-[#36393f] rounded px-2 py-1 text-[#e7e7e7] text-sm"
        >
          <option value="owned">Owned</option>
          <option value="borrowing">Borrow</option>
          <option value="renting">Rent</option>
        </select>
      ),
      sortable: true
    },
    {
      key: 'cost',
      label: 'Cost',
      render: (_: any, item: EquipmentItem) => (
        <div className="flex items-center gap-1">
          <span className="text-[#e7e7e7]/50">$</span>
          <EditableField
            value={(item as any).cost?.toString() || '0'}
            onSave={(value) => handleItemUpdate(item.id, { totalCost: parseFloat(String(value)) || 0 } as any)}
            type="number"
            className="text-[#10B981] font-medium"
          />
        </div>
      ),
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, item: EquipmentItem) => (
        <select
          value={(item as any).status}
          onChange={(e) => handleItemUpdate(item.id, { status: e.target.value as any } as any)}
          className="bg-[#1a1a1a] border border-[#36393f] rounded px-2 py-1 text-[#e7e7e7] text-sm"
        >
          <option value="needed">Needed</option>
          <option value="reserved">Reserved</option>
          <option value="obtained">Obtained</option>
          <option value="returned">Returned</option>
        </select>
      ),
      sortable: true
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
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Camera</div>
          <div className="text-2xl font-bold text-[#e7e7e7]">{cameraCount}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Lighting</div>
          <div className="text-2xl font-bold text-[#e7e7e7]">{lightingCount}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Sound</div>
          <div className="text-2xl font-bold text-[#e7e7e7]">{soundCount}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Owned</div>
          <div className="text-2xl font-bold text-green-400">{ownedCount}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Cost</div>
          <div className="text-2xl font-bold text-[#10B981]">${totalCost.toLocaleString()}</div>
        </div>
      </div>

      {/* Callout: Reuse Owned Gear */}
      {inventoryOwnedCount > 0 && (
        <div className="bg-[#121212] border border-[#36393f] rounded-lg p-4 flex items-center justify-between">
          <div className="text-sm text-[#e7e7e7]/80">
            Reused {inventoryOwnedCount} item(s) from your global owned gear inventory for this series.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyInventoryToList}
              className="px-3 py-1.5 text-xs bg-[#2a2a2a] text-[#e7e7e7] border border-[#36393f] rounded hover:bg-[#36393f]"
            >
              ↻ Re-apply
            </button>
            <button
              onClick={() => saveInventory([])}
              className="px-3 py-1.5 text-xs text-[#e7e7e7]/60 hover:text-[#e7e7e7]"
              title="Clear global owned gear list for this series"
            >
              Clear list
            </button>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="flex items-center justify-between gap-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-[#2a2a2a] border border-[#36393f] rounded-lg text-[#e7e7e7] text-sm"
        >
          <option value="all">All Categories</option>
          <option value="camera">Camera Only</option>
          <option value="lighting">Lighting Only</option>
          <option value="audio">Audio Only</option>
          <option value="grip">Grip Only</option>
          <option value="other">Other</option>
        </select>

        <div className="flex items-center gap-3">
          {((isArcContext && hasArcPrerequisites) || (!isArcContext && breakdownData && scriptsData?.fullScript)) && (
            <button
              onClick={handleGenerateQuestionnaire}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 rounded-lg hover:bg-[#10B981]/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? '🔄 Generating...' : '✨ Generate Equipment'}
            </button>
          )}
          <button
            onClick={handleApplyInventoryToList}
            className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] border border-[#36393f] rounded-lg hover:bg-[#36393f] transition-colors text-sm font-medium"
          >
            ↻ Apply Global Owned Gear
          </button>
          <button
            onClick={handleAddItem}
            className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] border border-[#36393f] rounded-lg hover:bg-[#36393f] transition-colors text-sm font-medium"
          >
            + Add Equipment
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

      {/* Equipment Table */}
      {allItems.length === 0 ? (
        <div className="text-center py-16 bg-[#2a2a2a] rounded-lg border border-[#36393f]">
          <div className="text-6xl mb-4">🎥</div>
          <h3 className="text-xl font-bold text-[#e7e7e7] mb-2">No Equipment Added</h3>
          <p className="text-[#e7e7e7]/70 mb-6">
            Generate an equipment package based on your script, or add items manually
          </p>
          <div className="flex items-center justify-center gap-4">
            {((isArcContext && !hasArcPrerequisites) || (!isArcContext && (!breakdownData || !scriptsData?.fullScript))) ? (
              <div className="text-center">
                <p className="text-sm text-[#e7e7e7]/50 mb-4">
                  {isArcContext 
                    ? 'Please generate Script and Script Breakdown for at least one episode first'
                    : 'Please generate Script and Script Breakdown first'
                  }
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleGenerateQuestionnaire}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-[#10B981] text-black rounded-lg font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? '🔄 Generating...' : '✨ Generate Equipment'}
                </button>
                <span className="text-[#e7e7e7]/50">or</span>
                <button
                  onClick={handleAddItem}
                  className="px-6 py-3 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg border border-[#36393f] font-medium hover:bg-[#36393f] transition-colors"
                >
                  + Add Item Manually
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <TableView
          columns={columns}
          data={filteredItems}
          keyField="id"
          showSearch={true}
          showPagination={true}
          pageSize={20}
          striped={true}
          hoverable={true}
          enableComments={true}
          onAddComment={async (rowIndex: number, comment: string) => {
            const item = filteredItems[rowIndex]
            if (!item) return
            await handleAddComment((item as any).id, comment)
          }}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          emptyMessage={`No equipment in ${selectedCategory === 'all' ? 'list' : selectedCategory}`}
        />
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
        existingAnswers={questionnaireAnswers}
      />
    </div>
  )
}
