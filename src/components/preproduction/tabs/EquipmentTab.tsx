'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import type { PreProductionData, EquipmentItem } from '@/types/preproduction'
import { EditableField } from '../shared/EditableField'
import { TableView } from '../shared/TableView'
import { QuestionnaireModal } from '../shared/QuestionnaireModal'
import type { Questionnaire } from '@/services/ai-generators/questionnaire-generator'
import { getStoryBible } from '@/services/story-bible-service'

interface EquipmentTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
}

export function EquipmentTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName
}: EquipmentTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)

  const equipmentData = (preProductionData as any).equipment || {
    items: [],
    lastUpdated: Date.now()
  }

  const breakdownData = preProductionData.scriptBreakdown
  const scriptsData = (preProductionData as any).scripts

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
    const item = (equipmentData.items as EquipmentItem[]).find((i: any) => i.id === itemId)
    if (!item) return
    const inv = loadInventory()
    const exists = inv.some(i => i.name.toLowerCase() === String(item.name).toLowerCase() && i.category === (item as any).category)
    const next = exists ? inv : [...inv, { name: String(item.name), category: (item as any).category }]
    saveInventory(next)

    // Also reflect locally as owned
    const updatedItems = (equipmentData.items as EquipmentItem[]).map((i: any) => i.id === itemId ? { ...i, ownership: 'owned' as any } : i)
    await onUpdate('equipment', { ...equipmentData, items: updatedItems, lastUpdated: Date.now() })
  }

  const handleApplyInventoryToList = async () => {
    const updatedItems = applyInventoryToItems(equipmentData.items as EquipmentItem[])
    await onUpdate('equipment', { ...equipmentData, items: updatedItems, lastUpdated: Date.now() })
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
    const updated = applyInventoryToItems(equipmentData.items as EquipmentItem[])
    const changed = JSON.stringify(updated) !== JSON.stringify(equipmentData.items)
    if (changed) {
      autoAppliedRef.current = true
      onUpdate('equipment', { ...equipmentData, items: updated, lastUpdated: Date.now() })
    } else {
      autoAppliedRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Derive count of matches available in inventory
  const inventoryOwnedCount = useMemo(() => {
    const inv = loadInventory()
    if (!inv.length || !Array.isArray(equipmentData.items)) return 0
    const normalized = inv.map(i => ({ name: i.name.trim().toLowerCase(), category: i.category }))
    return (equipmentData.items as EquipmentItem[]).filter((it: any) => normalized.find(n => n.name === String(it.name||'').trim().toLowerCase() && n.category === it.category)).length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipmentData.items?.length])

  const handleItemUpdate = async (itemId: string, updates: Partial<EquipmentItem>) => {
    const updatedItems = equipmentData.items.map((item: EquipmentItem) =>
      item.id === itemId ? { ...item, ...updates } : item
    )
    
    await onUpdate('equipment', {
      ...equipmentData,
      items: updatedItems,
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
    
    await onUpdate('equipment', {
      ...equipmentData,
      items: [...equipmentData.items, newItem],
      lastUpdated: Date.now()
    })
  }

  const handleAddComment = async (itemId: string, content: string) => {
    const item = equipmentData.items.find((i: EquipmentItem) => i.id === itemId)
    if (!item) return

    const newComment = {
      id: `comment_${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content,
      timestamp: Date.now()
    }

    const updatedItems = equipmentData.items.map((i: EquipmentItem) =>
      i.id === itemId
        ? { ...i, comments: [...(i.comments || []), newComment] }
        : i
    )

    await onUpdate('equipment', {
      ...equipmentData,
      items: updatedItems,
      lastUpdated: Date.now()
    })
  }

  // Generate questionnaire
  const handleGenerateQuestionnaire = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
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
      if (!storyBible) throw new Error('Story bible not found')

      const response = await fetch('/api/generate/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preProductionId: (preProductionData as any).id,
          storyBibleId: preProductionData.storyBibleId,
          episodeNumber: preProductionData.episodeNumber,
          userId: currentUserId,
          scriptData: scriptsData.fullScript,
          breakdownData: breakdownData,
          storyBibleData: storyBible,
          castingData: preProductionData.casting,
          questionnaireType: 'equipment'
        })
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
      if (!storyBible) throw new Error('Story bible not found')

      const response = await fetch('/api/generate/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preProductionId: (preProductionData as any).id,
          storyBibleId: preProductionData.storyBibleId,
          episodeNumber: preProductionData.episodeNumber,
          userId: currentUserId,
          scriptData: scriptsData.fullScript,
          breakdownData: breakdownData,
          storyBibleData: storyBible,
          questionnaireAnswers: answers || {}
        })
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

      await onUpdate('equipment', {
        ...equipmentData,
        items,
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
    handleGenerateEquipment(answers)
  }

  // Filter items
  const filteredItems = selectedCategory === 'all'
    ? equipmentData.items
    : equipmentData.items.filter((item: EquipmentItem) => item.category === selectedCategory)

  // Stats
  const totalItems = (equipmentData.items || []).length
  const cameraCount = (equipmentData.items || []).filter((i: EquipmentItem) => i.category === 'camera').length
  const lightingCount = (equipmentData.items || []).filter((i: EquipmentItem) => i.category === 'lighting').length
  const soundCount = (equipmentData.items || []).filter((i: EquipmentItem) => (i as any).category === 'sound' || (i as any).category === 'audio').length
  const totalCost = (equipmentData.items || []).reduce((sum: number, item: any) => sum + (item.cost || 0) * (item.quantity || 1), 0)
  const ownedCount = (equipmentData.items || []).filter((i: any) => i.ownership === 'own' || i.ownership === 'owned').length

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
            className="text-[#00FF99] font-medium"
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
          <div className="text-2xl font-bold text-[#00FF99]">{totalItems}</div>
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
          <div className="text-2xl font-bold text-[#00FF99]">${totalCost.toLocaleString()}</div>
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
          {breakdownData && scriptsData?.fullScript && (
            <button
              onClick={handleGenerateQuestionnaire}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#00FF99]/10 text-[#00FF99] border border-[#00FF99]/30 rounded-lg hover:bg-[#00FF99]/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
      {(equipmentData.items || []).length === 0 ? (
        <div className="text-center py-16 bg-[#2a2a2a] rounded-lg border border-[#36393f]">
          <div className="text-6xl mb-4">🎥</div>
          <h3 className="text-xl font-bold text-[#e7e7e7] mb-2">No Equipment Added</h3>
          <p className="text-[#e7e7e7]/70 mb-6">
            Generate an equipment package based on your script, or add items manually
          </p>
          <div className="flex items-center justify-center gap-4">
            {!breakdownData || !scriptsData?.fullScript ? (
              <div className="text-center">
                <p className="text-sm text-[#e7e7e7]/50 mb-4">Please generate Script and Script Breakdown first</p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleGenerateQuestionnaire}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-[#00FF99] text-black rounded-lg font-medium hover:bg-[#00CC7A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        existingAnswers={{}}
      />
    </div>
  )
}
