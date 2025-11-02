'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { PreProductionData, CastMember } from '@/types/preproduction'
import { EditableField } from '../shared/EditableField'
import { StatusBadge } from '../shared/StatusBadge'
import { CollaborativeNotes } from '../shared/CollaborativeNotes'
import { getStoryBible } from '@/services/story-bible-service'

interface CastingTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
}

export function CastingTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName
}: CastingTabProps) {
  const router = useRouter()
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  
  const castingData = preProductionData.casting || {
    cast: [],
    lastUpdated: Date.now()
  }

  const breakdownData = preProductionData.scriptBreakdown
  const scriptsData = (preProductionData as any).scripts

  const handleMemberUpdate = async (memberId: string, updates: Partial<CastMember>) => {
    const updatedCast = castingData.cast.map(member =>
      member.id === memberId ? { ...member, ...updates } : member
    )
    
    await onUpdate('casting', {
      ...castingData,
      cast: updatedCast,
      lastUpdated: Date.now()
    })
  }

  const handleAddMember = async () => {
    const newMember: CastMember = {
      id: `cast_${Date.now()}`,
      characterName: 'Character Name',
      actorName: '',
      role: 'lead',
      scenes: [],
      totalShootDays: 0,
      payment: 'deferred',
      paymentAmount: 0,
      payRate: 0,
      specialNeeds: [],
      rehersalNotes: '',
      actorNotes: '',
      availability: [],
      status: 'casting',
      confirmed: false,
      notes: '',
      headshot: '',
      comments: []
    }
    
    await onUpdate('casting', {
      ...castingData,
      cast: [...castingData.cast, newMember],
      lastUpdated: Date.now()
    })
  }

  const handleAddComment = async (memberId: string, content: string) => {
    const member = castingData.cast.find(m => m.id === memberId)
    if (!member) return

    const newComment = {
      id: `comment_${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content,
      timestamp: Date.now()
    }

    const updatedCast = castingData.cast.map(m =>
      m.id === memberId
        ? { ...m, comments: [...(m.comments || []), newComment] }
        : m
    )

    await onUpdate('casting', {
      ...castingData,
      cast: updatedCast,
      lastUpdated: Date.now()
    })
  }

  // Generate casting profiles
  const handleGenerateCasting = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      console.log('🎭 Generating casting profiles...')

      // 1. Check prerequisites
      if (!breakdownData) {
        setGenerationError('Please generate script breakdown first')
        setIsGenerating(false)
        return
      }

      console.log('✅ Script breakdown found')

      if (!scriptsData?.fullScript) {
        setGenerationError('Please generate a script first')
        setIsGenerating(false)
        return
      }

      console.log('✅ Script data found')

      // 2. Fetch story bible
      console.log('📖 Fetching story bible...')
      const storyBible = await getStoryBible(preProductionData.storyBibleId, currentUserId)

      if (!storyBible) {
        throw new Error('Story bible not found')
      }

      console.log('✅ Story bible loaded:', storyBible.seriesTitle || storyBible.title)

      // 3. Call generation API
      console.log('🤖 Calling casting generation API...')
      const response = await fetch('/api/generate/casting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preProductionId: preProductionData.id,
          storyBibleId: preProductionData.storyBibleId,
          episodeNumber: preProductionData.episodeNumber,
          userId: currentUserId,
          breakdownData,
          scriptData: scriptsData.fullScript,
          storyBibleData: storyBible
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Generation failed')
      }

      const result = await response.json()
      console.log('✅ Casting profiles generated:', result.casting.cast.length, 'characters')

      // 4. Save to Firestore
      await onUpdate('casting', {
        ...result.casting,
        lastUpdated: Date.now(),
        updatedBy: currentUserId
      })

      console.log('✅ Casting profiles saved to Firestore')
    } catch (error: any) {
      console.error('❌ Error generating casting profiles:', error)
      setGenerationError(error.message || 'Failed to generate casting profiles')
      
      // Redirect to Scripts tab if breakdown not found
      if (error.message?.includes('breakdown') || error.message?.includes('script')) {
        router.push('/preproduction?storyBibleId=' + preProductionData.storyBibleId + '&episodeNumber=' + preProductionData.episodeNumber + '&episodeTitle=' + encodeURIComponent(preProductionData.episodeTitle || '') + '&tab=scripts')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Stats
  const totalCast = castingData.cast.length
  const confirmedCount = castingData.cast.filter(m => m.confirmed).length
  const leadCount = castingData.cast.filter(m => m.role === 'lead').length
  const supportingCount = castingData.cast.filter(m => m.role === 'supporting').length
  const totalPayroll = castingData.cast.reduce((sum, m) => sum + (m.payRate || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Cast</div>
          <div className="text-2xl font-bold text-[#00FF99]">{totalCast}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Confirmed</div>
          <div className="text-2xl font-bold text-green-400">{confirmedCount}/{totalCast}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Lead Roles</div>
          <div className="text-2xl font-bold text-[#e7e7e7]">{leadCount}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Supporting</div>
          <div className="text-2xl font-bold text-[#e7e7e7]">{supportingCount}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Payroll</div>
          <div className="text-2xl font-bold text-[#00FF99]">${totalPayroll.toLocaleString()}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div>
          {castingData.cast.length > 0 && (
            <button
              onClick={handleGenerateCasting}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#36393f] text-[#00FF99] rounded-lg font-medium hover:bg-[#40444b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? '🔄 Generating...' : '🔄 Regenerate Profiles'}
            </button>
          )}
        </div>
        <button
          onClick={handleAddMember}
          className="px-4 py-2 bg-[#00FF99] text-black rounded-lg font-medium hover:bg-[#00CC7A] transition-colors"
        >
          + Add Cast Member
        </button>
      </div>

      {/* Generation Error */}
      {generationError && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400">
          <div className="font-bold mb-1">Generation Error</div>
          <div className="text-sm">{generationError}</div>
        </div>
      )}

      {/* Cast List */}
      {castingData.cast.length === 0 ? (
        <div className="text-center py-16 bg-[#2a2a2a] rounded-lg border border-[#36393f]">
          <div className="text-6xl mb-4">🎭</div>
          <h3 className="text-xl font-bold text-[#e7e7e7] mb-2">No Cast Members Added</h3>
          <p className="text-[#e7e7e7]/70 mb-6">
            Generate casting profiles based on your script breakdown, or add cast members manually
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleGenerateCasting}
              disabled={isGenerating || !breakdownData || !scriptsData?.fullScript}
              className="px-6 py-3 bg-[#00FF99] text-black rounded-lg font-medium hover:bg-[#00CC7A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? '🔄 Generating...' : '✨ Generate Casting Profiles'}
            </button>
            <span className="text-[#e7e7e7]/50 self-center">or</span>
            <button
              onClick={handleAddMember}
              className="px-6 py-3 bg-[#36393f] text-[#00FF99] rounded-lg font-medium hover:bg-[#40444b] transition-colors"
            >
              + Add Manually
            </button>
          </div>
          {(!breakdownData || !scriptsData?.fullScript) && (
            <p className="text-sm text-[#e7e7e7]/50 mt-4">
              {!breakdownData && '⚠️ Please generate script breakdown first'}
              {!breakdownData && !scriptsData?.fullScript && ' and '}
              {!scriptsData?.fullScript && 'script'}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {castingData.cast.map((member) => (
            <CastMemberCard
              key={member.id}
              member={member}
              onUpdate={(updates) => handleMemberUpdate(member.id, updates)}
              onAddComment={(content) => handleAddComment(member.id, content)}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              isSelected={selectedMember === member.id}
              onSelect={() => setSelectedMember(member.id === selectedMember ? null : member.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Cast Member Card Component
function CastMemberCard({
  member,
  onUpdate,
  onAddComment,
  currentUserId,
  currentUserName,
  isSelected,
  onSelect
}: {
  member: CastMember
  onUpdate: (updates: Partial<CastMember>) => void
  onAddComment: (content: string) => void
  currentUserId: string
  currentUserName: string
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <motion.div
      layout
      className={`bg-[#2a2a2a] rounded-lg border transition-colors ${
        isSelected ? 'border-[#00FF99]' : 'border-[#36393f]'
      }`}
    >
      {/* Headshot */}
      <div className="aspect-[3/4] bg-[#1a1a1a] rounded-t-lg flex items-center justify-center relative overflow-hidden">
        {member.headshot ? (
          <img src={member.headshot} alt={member.actorName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl">👤</span>
        )}
        {member.confirmed && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white rounded text-xs font-bold">
            ✓ CONFIRMED
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Character Name & Archetype */}
        <div>
          <EditableField
            value={member.characterName}
            onSave={(value) => onUpdate({ characterName: value })}
            className="text-base font-bold text-[#00FF99] mb-1.5"
          />
          {member.characterProfile?.archetype && (
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className="px-2 py-0.5 bg-[#1a1a1a] rounded text-xs text-[#00FF99] font-medium border border-[#00FF99]/30">
                {member.characterProfile.archetype}
              </span>
              {member.characterProfile.ageRange && (
                <span className="text-xs text-[#e7e7e7]/50">
                  {member.characterProfile.ageRange.min}-{member.characterProfile.ageRange.max}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actor Name - Only show field label if no actor */}
        <div>
          {!member.actorName || !member.actorName.trim() ? (
            <>
              <div className="text-xs text-[#e7e7e7]/50 mb-1">Actor</div>
              <EditableField
                value={member.actorName || ''}
                onSave={(value) => onUpdate({ actorName: value })}
                placeholder="Actor name..."
                className="text-sm text-[#e7e7e7]/70 italic"
              />
            </>
          ) : (
            <EditableField
              value={member.actorName}
              onSave={(value) => onUpdate({ actorName: value })}
              placeholder="Actor name..."
              className="text-sm text-[#e7e7e7] font-medium"
            />
          )}
        </div>

        {/* Role & Status */}
        <div className="flex items-center gap-2">
          <select
            value={member.role}
            onChange={(e) => onUpdate({ role: e.target.value as any })}
            className="flex-1 bg-[#1a1a1a] border border-[#36393f] rounded px-2 py-1 text-[#e7e7e7] text-sm"
          >
            <option value="lead">Lead</option>
            <option value="supporting">Supporting</option>
            <option value="extra">Extra</option>
          </select>
          
          <StatusBadge status={member.status} />
        </div>

        {/* Pay Rate - Only show if actor assigned */}
        {member.actorName && member.actorName.trim() && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#e7e7e7]/50">Pay:</span>
            <span className="text-[#e7e7e7]/50 text-xs">$</span>
            <EditableField
              value={member.payRate?.toString() || '0'}
              onSave={(value) => onUpdate({ payRate: parseFloat(value) || 0 })}
              type="number"
              className="text-xs text-[#00FF99] font-medium w-20"
            />
          </div>
        )}

        {/* Scenes */}
        {member.scenes && member.scenes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {member.scenes.map((scene, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-[#1a1a1a] rounded text-xs text-[#e7e7e7]/70"
              >
                Scene {scene}
              </span>
            ))}
          </div>
        )}

        {/* Expand/Collapse */}
        <button
          onClick={onSelect}
          className="w-full py-2 text-sm text-[#00FF99] hover:text-[#00CC7A] transition-colors"
        >
          {isSelected ? '▲ Show Less' : '▼ Show More'}
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 pt-3 border-t border-[#36393f]"
            >
              {/* Contact - Only show if actor is assigned */}
              {member.actorName && member.actorName.trim() && (
                <div className="space-y-2 pt-3 border-t border-[#36393f]">
                  <div className="text-xs text-[#e7e7e7]/50 font-medium">Contact</div>
                  <EditableField
                    value={member.contact?.email || ''}
                    onSave={(value) => onUpdate({ contact: { ...member.contact, email: value } })}
                    placeholder="Email..."
                    className="text-xs text-[#e7e7e7]"
                  />
                  <EditableField
                    value={member.contact?.phone || ''}
                    onSave={(value) => onUpdate({ contact: { ...member.contact, phone: value } })}
                    placeholder="Phone..."
                    className="text-xs text-[#e7e7e7]"
                  />
                  <EditableField
                    value={member.contact?.agent || ''}
                    onSave={(value) => onUpdate({ contact: { ...member.contact, agent: value } })}
                    placeholder="Agent..."
                    className="text-xs text-[#e7e7e7]"
                  />
                </div>
              )}

              {/* Character Profile - Archetype & Requirements */}
              {member.characterProfile && (
                <div className="space-y-3 pt-3 border-t border-[#36393f]">
                  {/* Archetype & Age */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {member.characterProfile.archetype && (
                      <div className="px-2 py-1 bg-[#1a1a1a] rounded text-xs text-[#00FF99] font-medium border border-[#00FF99]/30">
                        {member.characterProfile.archetype}
                      </div>
                    )}
                    {member.characterProfile.ageRange && (
                      <div className="text-xs text-[#e7e7e7]/60">
                        Age {member.characterProfile.ageRange.min}-{member.characterProfile.ageRange.max}
                      </div>
                    )}
                  </div>

                  {/* Physical Requirements - Only show if any are present */}
                  {Object.values(member.characterProfile.physicalRequirements).some(v => v) && (
                    <div>
                      <div className="text-xs text-[#e7e7e7]/50 mb-1.5 font-medium">Physical</div>
                      <div className="text-xs text-[#e7e7e7]/80 space-y-0.5">
                        {member.characterProfile.physicalRequirements.height && (
                          <div>• Height: {member.characterProfile.physicalRequirements.height}</div>
                        )}
                        {member.characterProfile.physicalRequirements.build && (
                          <div>• Build: {member.characterProfile.physicalRequirements.build}</div>
                        )}
                        {member.characterProfile.physicalRequirements.ethnicity && (
                          <div>• Ethnicity: {member.characterProfile.physicalRequirements.ethnicity}</div>
                        )}
                        {member.characterProfile.physicalRequirements.distinctiveFeatures && (
                          <div>• {member.characterProfile.physicalRequirements.distinctiveFeatures}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Performance Requirements */}
                  <div>
                    <div className="text-xs text-[#e7e7e7]/50 mb-1.5 font-medium">Performance</div>
                    <div className="text-xs text-[#e7e7e7]/80 space-y-0.5">
                      {member.characterProfile.performanceRequirements.actingStyle && (
                        <div>• Style: {member.characterProfile.performanceRequirements.actingStyle}</div>
                      )}
                      {member.characterProfile.performanceRequirements.emotionalRange && (
                        <div>• Range: {member.characterProfile.performanceRequirements.emotionalRange}</div>
                      )}
                      {member.characterProfile.performanceRequirements.specialSkills.length > 0 && (
                        <div>• Skills: {member.characterProfile.performanceRequirements.specialSkills.join(', ')}</div>
                      )}
                    </div>
                  </div>

                  {/* Actor Templates */}
                  {member.characterProfile.actorTemplates.length > 0 && (
                    <div>
                      <div className="text-xs text-[#e7e7e7]/50 mb-2 font-medium">Actor References</div>
                      <div className="space-y-1.5">
                        {member.characterProfile.actorTemplates.map((template, idx) => (
                          <div key={idx} className="bg-[#1a1a1a] rounded p-2 border border-[#36393f]">
                            <div className="text-xs font-medium text-[#00FF99] mb-0.5">{template.name}</div>
                            <div className="text-xs text-[#e7e7e7]/70 leading-relaxed">{template.whyMatch}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Casting Notes */}
                  {member.characterProfile.castingNotes && member.characterProfile.castingNotes.trim() && (
                    <div>
                      <div className="text-xs text-[#e7e7e7]/50 mb-1.5 font-medium">Notes</div>
                      <div className="text-xs text-[#e7e7e7]/80 leading-relaxed">{member.characterProfile.castingNotes}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={member.confirmed || false}
                  onChange={(e) => onUpdate({ confirmed: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-[#e7e7e7]">Confirmed for role</span>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <div className="text-xs text-[#e7e7e7]/50">Notes</div>
                <EditableField
                  value={member.notes || ''}
                  onSave={(value) => onUpdate({ notes: value })}
                  placeholder="Add notes..."
                  multiline
                  className="text-sm text-[#e7e7e7]"
                />
              </div>

              {/* Comments */}
              <CollaborativeNotes
                comments={member.comments || []}
                onAddComment={onAddComment}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
