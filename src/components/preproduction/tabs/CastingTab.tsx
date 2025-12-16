'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { PreProductionData, CastMember } from '@/types/preproduction'
import { EditableField } from '../shared/EditableField'
import { StatusBadge } from '../shared/StatusBadge'
import { CollaborativeNotes } from '../shared/CollaborativeNotes'
import { getStoryBible } from '@/services/story-bible-service'
import { aggregateCastingFromEpisodes } from '@/services/arc-preproduction-aggregator'
import StoryBibleImage from '@/components/story-bible/StoryBibleImage'
import { AuditionSidesViewer } from './casting/AuditionSidesViewer'
import { CharacterArcTimeline } from './casting/CharacterArcTimeline'
import type { ImageAsset } from '@/services/story-bible-service'

interface CastingTabProps {
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

export function CastingTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName,
  arcPreProdData,
  episodePreProdData,
  storyBible,
  arcIndex
}: CastingTabProps) {
  const router = useRouter()
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  
  // Detect arc context
  const isArcContext = preProductionData.type === 'arc' || !!arcPreProdData
  
  // Hybrid data source: Use arc document first, fall back to aggregation
  const arcCastingData = preProductionData.casting
  const aggregatedCastingData = useMemo(() => {
    if (isArcContext && episodePreProdData && Object.keys(episodePreProdData).length > 0) {
      return aggregateCastingFromEpisodes(episodePreProdData)
    }
    return null
  }, [isArcContext, episodePreProdData])
  
  // Priority: Arc document > Aggregated from episodes > Empty
  const castingData = arcCastingData && arcCastingData.cast && arcCastingData.cast.length > 0
    ? arcCastingData
    : aggregatedCastingData || {
        cast: [],
        lastUpdated: Date.now()
      }

  const breakdownData = preProductionData.type === 'episode' ? preProductionData.scriptBreakdown : undefined
  const scriptsData = preProductionData.type === 'episode' ? (preProductionData as any).scripts : undefined

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

  const handleAddComment = async (memberId: string, content: string, mentions?: string[]) => {
    const member = castingData.cast.find(m => m.id === memberId)
    if (!member) return

    const newComment = {
      id: `comment_${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content,
      timestamp: Date.now(),
      mentions
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

      // 1. Check prerequisites (only for episode context)
      if (!isArcContext && !breakdownData) {
        setGenerationError('Please generate script breakdown first')
        setIsGenerating(false)
        return
      }
      
      // For arc context, check if any episode has breakdown
      if (isArcContext && episodePreProdData) {
        const hasAnyBreakdown = Object.values(episodePreProdData).some((epPreProd: any) => 
          epPreProd?.scriptBreakdown?.scenes && epPreProd.scriptBreakdown.scenes.length > 0
        )
        if (!hasAnyBreakdown) {
          setGenerationError('Please generate script breakdown for at least one episode first')
          setIsGenerating(false)
          return
        }
      }

      console.log('✅ Script breakdown found')

      // Only check for script in episode context
      if (!isArcContext && !scriptsData?.fullScript) {
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
      const requestBody: any = {
        preProductionId: preProductionData.id,
        storyBibleId: preProductionData.storyBibleId,
        userId: currentUserId,
        storyBibleData: storyBible
      }

      // For arc context, aggregate breakdown and scripts from episodes
      if (isArcContext && arcPreProdData && episodePreProdData) {
        // Aggregate breakdown and script data from episodes
        const aggregatedBreakdown: any = {
          scenes: [],
          totalScenes: 0
        }
        const aggregatedScripts: any[] = []
        
        console.log('📊 Aggregating breakdown and script data from episodes for casting...')
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
        requestBody.breakdownData = breakdownData
        requestBody.scriptData = scriptsData?.fullScript
      }

      const response = await fetch('/api/generate/casting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
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
      
      // Redirect to Scripts tab if breakdown not found (only for episode context)
      if (!isArcContext && preProductionData.type === 'episode' && (error.message?.includes('breakdown') || error.message?.includes('script'))) {
        router.push('/preproduction?storyBibleId=' + preProductionData.storyBibleId + '&episodeNumber=' + preProductionData.episodeNumber + '&episodeTitle=' + encodeURIComponent(preProductionData.episodeTitle || '') + '&tab=scripts')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Filter cast into main cast and background characters/extras
  // Main cast: lead and supporting roles
  // Background: extras and any other non-main roles
  const mainCast = useMemo(() => 
    castingData.cast.filter(m => m.role === 'lead' || m.role === 'supporting'),
    [castingData.cast]
  )
  // We only surface main cast in the UI now
  const backgroundCharacters: CastMember[] = []

  // Stats
  const totalCast = mainCast.length
  const confirmedCount = mainCast.filter(m => m.confirmed).length
  const leadCount = mainCast.filter(m => m.role === 'lead').length
  const supportingCount = mainCast.filter(m => m.role === 'supporting').length
  const totalPayroll = mainCast.reduce((sum, m) => sum + (m.payRate || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Cast</div>
          <div className="text-2xl font-bold text-[#10B981]">{totalCast}</div>
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
          <div className="text-2xl font-bold text-[#10B981]">${totalPayroll.toLocaleString()}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={handleGenerateCasting}
            disabled={isGenerating || (!isArcContext && (!breakdownData || !scriptsData?.fullScript)) || (isArcContext && (!episodePreProdData || Object.keys(episodePreProdData).length === 0))}
            className="px-4 py-2 bg-[#10B981] text-black rounded-lg font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Regenerate casting profiles for all characters"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">🔄</span>
                <span>Regenerating...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Regenerate Casting</span>
              </>
            )}
          </button>
        </div>
        <button
          onClick={handleAddMember}
          className="px-4 py-2 bg-[#10B981] text-black rounded-lg font-medium hover:bg-[#059669] transition-colors"
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
              disabled={isGenerating || (!isArcContext && (!breakdownData || !scriptsData?.fullScript)) || (isArcContext && (!episodePreProdData || Object.keys(episodePreProdData).length === 0))}
              className="px-6 py-3 bg-[#10B981] text-black rounded-lg font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? '🔄 Generating...' : '✨ Generate Casting Profiles'}
            </button>
            <span className="text-[#e7e7e7]/50 self-center">or</span>
            <button
              onClick={handleAddMember}
              className="px-6 py-3 bg-[#36393f] text-[#10B981] rounded-lg font-medium hover:bg-[#40444b] transition-colors"
            >
              + Add Manually
            </button>
          </div>
          {(!isArcContext && (!breakdownData || !scriptsData?.fullScript)) && (
            <p className="text-sm text-[#e7e7e7]/50 mt-4">
              {!breakdownData && '⚠️ Please generate script breakdown first'}
              {!breakdownData && !scriptsData?.fullScript && ' and '}
              {!scriptsData?.fullScript && 'script'}
            </p>
          )}
          {isArcContext && (!episodePreProdData || Object.keys(episodePreProdData).length === 0) && (
            <p className="text-sm text-[#e7e7e7]/50 mt-4">
              ⚠️ No episode pre-production data available. Please generate pre-production for episodes first.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Cast Section - Concept 3: Character-Centric View */}
          {mainCast.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-[#e7e7e7] mb-4 flex items-center gap-2">
                <span>⭐</span>
                Main Cast ({mainCast.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mainCast.map((member) => (
                  <CastMemberCardConcept3
                    key={member.id}
                    member={member}
                    onUpdate={(updates) => handleMemberUpdate(member.id, updates)}
                    onAddComment={async (content, mentions) => await handleAddComment(member.id, content, mentions)}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    isSelected={selectedMember === member.id}
                    onSelect={() => setSelectedMember(member.id === selectedMember ? null : member.id)}
                    storyBible={storyBible}
                    episodeNumbers={isArcContext && arcPreProdData ? arcPreProdData.episodeNumbers : []}
                  />
                ))}
              </div>
            </div>
          )}

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
  onSelect,
  storyBible
}: {
  member: CastMember
  onUpdate: (updates: Partial<CastMember>) => void
  onAddComment: (content: string, mentions?: string[]) => Promise<void>
  currentUserId: string
  currentUserName: string
  isSelected: boolean
  onSelect: () => void
  storyBible?: any
}) {
  const findStoryBibleCharacter = (characterName: string) => {
    const norm = characterName.toLowerCase().trim()
    const candidates = [
      ...(storyBible?.characters || []),
      ...(storyBible?.mainCharacters || [])
    ]
    return candidates.find((char: any) => {
      const charName = (char.name || char.characterName || '').toLowerCase().trim()
      return charName === norm || charName.includes(norm) || norm.includes(charName)
    })
  }

  // Find matching character in story bible
  const storyBibleCharacter = findStoryBibleCharacter(member.characterName)
  return (
    <motion.div
      layout
      className={`bg-[#2a2a2a] rounded-lg border transition-colors ${
        isSelected ? 'border-[#10B981]' : 'border-[#36393f]'
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
            onSave={(value) => onUpdate({ characterName: String(value) })}
            className="text-base font-bold text-[#10B981] mb-1.5"
          />
          {member.characterProfile?.archetype && (
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className="px-2 py-0.5 bg-[#1a1a1a] rounded text-xs text-[#10B981] font-medium border border-[#10B981]/30">
                {member.characterProfile.archetype}
              </span>
              {member.characterProfile.ageRange && (
                <span className="text-xs text-[#e7e7e7]/50">
                  {member.characterProfile.ageRange.min}-{member.characterProfile.ageRange.max}
                </span>
              )}
            </div>
          )}
          {/* Story Bible Character Info */}
          {storyBibleCharacter && (
            <div className="mt-2 p-2 bg-[#1a1a1a]/50 rounded border border-[#36393f]">
              <div className="text-xs text-[#e7e7e7]/50 mb-1">From Story Bible:</div>
              {storyBibleCharacter.description && (
                <div className="text-xs text-[#e7e7e7]/70">{storyBibleCharacter.description}</div>
              )}
              {storyBibleCharacter.role && !storyBibleCharacter.description && (
                <div className="text-xs text-[#e7e7e7]/70">{storyBibleCharacter.role}</div>
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
                onSave={(value) => onUpdate({ actorName: String(value) })}
                placeholder="Actor name..."
                className="text-sm text-[#e7e7e7]/70 italic"
              />
            </>
          ) : (
            <EditableField
              value={member.actorName}
              onSave={(value) => onUpdate({ actorName: String(value) })}
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
          className="w-full py-2 text-sm text-[#10B981] hover:text-[#059669] transition-colors"
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
                    onSave={(value) => onUpdate({ contact: { ...member.contact, email: String(value) } })}
                    placeholder="Email..."
                    className="text-xs text-[#e7e7e7]"
                  />
                  <EditableField
                    value={member.contact?.phone || ''}
                    onSave={(value) => onUpdate({ contact: { ...member.contact, phone: String(value) } })}
                    placeholder="Phone..."
                    className="text-xs text-[#e7e7e7]"
                  />
                  <EditableField
                    value={member.contact?.agent || ''}
                    onSave={(value) => onUpdate({ contact: { ...member.contact, agent: String(value) } })}
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
                      <div className="px-2 py-1 bg-[#1a1a1a] rounded text-xs text-[#10B981] font-medium border border-[#10B981]/30">
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
                            <div className="text-xs font-medium text-[#10B981] mb-0.5">{template.name}</div>
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

              {/* Availability - Only show if actor is assigned */}
              {member.actorName && member.actorName.trim() && (
                <div className="space-y-2 pt-3 border-t border-[#36393f]">
                  <div className="text-xs text-[#e7e7e7]/50 font-medium mb-2">Availability (for scheduling)</div>
                  
                  {/* Availability Notes - Natural language input */}
                  <div>
                    <textarea
                      value={member.availabilityNotes || ''}
                      onChange={(e) => onUpdate({ availabilityNotes: e.target.value })}
                      placeholder="E.g., Available Mon-Fri, not available July 15-20, prefers morning shoots..."
                      className="w-full bg-[#1a1a1a] border border-[#36393f] rounded px-3 py-2 text-[#e7e7e7] text-xs resize-none focus:outline-none focus:border-[#10B981]"
                      rows={2}
                    />
                    <p className="text-xs text-[#e7e7e7]/40 mt-1">
                      💡 Tip: Provide availability info to help AI optimize shooting schedule
                    </p>
                  </div>

                  {/* Preferred Days */}
                  <div>
                    <div className="text-xs text-[#e7e7e7]/50 mb-1.5">Preferred Shooting Days</div>
                    <div className="flex flex-wrap gap-1">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                        const isSelected = member.preferredShootingDays?.includes(day)
                        return (
                          <button
                            key={day}
                            onClick={() => {
                              const current = member.preferredShootingDays || []
                              const updated = isSelected
                                ? current.filter(d => d !== day)
                                : [...current, day]
                              onUpdate({ preferredShootingDays: updated })
                            }}
                            className={`px-2 py-1 rounded text-xs transition-all ${
                              isSelected
                                ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]'
                                : 'bg-[#1a1a1a] text-[#e7e7e7]/60 border border-[#36393f] hover:border-[#36393f]/50'
                            }`}
                          >
                            {day.substring(0, 3)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Toggle */}
              <div className="flex items-center gap-2 pt-3 border-t border-[#36393f]">
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
                  onSave={async (value) => await onUpdate({ notes: String(value) })}
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

// Cast Member Card Component - Concept 3: Character-Centric View
function CastMemberCardConcept3({
  member,
  onUpdate,
  onAddComment,
  currentUserId,
  currentUserName,
  isSelected,
  onSelect,
  storyBible,
  episodeNumbers
}: {
  member: CastMember
  onUpdate: (updates: Partial<CastMember>) => void
  onAddComment: (content: string, mentions?: string[]) => Promise<void>
  currentUserId: string
  currentUserName: string
  isSelected: boolean
  onSelect: () => void
  storyBible?: any
  episodeNumbers?: number[]
}) {
  const [showInviteModal, setShowInviteModal] = useState(false)

  const findStoryBibleCharacter = (characterName: string) => {
    const norm = characterName.toLowerCase().trim()
    const candidates = [
      ...(storyBible?.characters || []),
      ...(storyBible?.mainCharacters || [])
    ]
    return candidates.find((char: any) => {
      const charName = (char.name || char.characterName || '').toLowerCase().trim()
      return charName === norm || charName.includes(norm) || norm.includes(charName)
    })
  }
  // Match the character to the story bible entry so we can pull the portrait
  const storyBibleCharacter = findStoryBibleCharacter(member.characterName)

  const storyBibleImage = (storyBibleCharacter?.visualReference as ImageAsset | undefined) || undefined
  const headshotImage: ImageAsset | undefined = member.headshot
    ? { imageUrl: member.headshot } as ImageAsset
    : undefined
  const displayImage = storyBibleImage || headshotImage
  const actorTemplates = member.characterProfile?.actorTemplates || []

  // Get episodes this character appears in
  const characterEpisodes = member.scenes && episodeNumbers
    ? [...new Set(member.scenes.map((scene: any) => {
        // If scene is a number, we need to determine which episode it belongs to
        // For now, if we have episode numbers, we'll show all episodes the character is in
        // This is a simplified approach - in a real implementation, scenes would have episode numbers
        return episodeNumbers[0] // Default to first episode for now
      }))]
    : episodeNumbers || []
  const episodeTags = characterEpisodes

  return (
    <motion.div
      layout
      className={`bg-[#2a2a2a] rounded-lg border transition-colors p-6 ${
        isSelected ? 'border-[#10B981]' : 'border-[#36393f]'
      }`}
    >
      {/* Visual reference from Story Bible (or fallback to headshot) */}
      <div className="mb-4">
        <StoryBibleImage
          imageAsset={displayImage}
          placeholderIcon="🎭"
          placeholderText={member.characterName}
          aspectRatio="3:4"
          className="w-full"
        />
        {storyBibleImage && (
          <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 rounded bg-[#1a1a1a] border border-[#36393f] text-xs text-[#e7e7e7]/70">
            <span className="text-[#10B981] font-semibold">Story Bible</span>
            <span>Auto-synced visual reference</span>
          </div>
        )}
      </div>

      {/* Actor inspirations directly under the portrait */}
      {actorTemplates.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-[#e7e7e7]/50 font-medium mb-2">Actor inspirations</div>
          <div className="space-y-1.5">
            {actorTemplates.map((template, idx) => (
              <div key={idx} className="bg-[#1a1a1a] rounded p-2 border border-[#36393f]">
                <div className="text-xs font-semibold text-[#10B981] mb-0.5">{template.name}</div>
                <div className="text-xs text-[#e7e7e7]/70 leading-relaxed">{template.whyMatch}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="mt-3 w-full px-3 py-2 bg-[#10B981] text-black rounded-md text-sm font-semibold hover:bg-[#0ea271] transition-colors"
          >
            Invite Cast
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <EditableField
            value={member.characterName}
            onSave={(value) => onUpdate({ characterName: String(value) })}
            className="text-xl font-bold text-[#e7e7e7] mb-1"
          />
          <div className="text-sm text-[#e7e7e7]/70">
            {member.actorName && member.actorName.trim() ? (
              <EditableField
                value={member.actorName}
                onSave={(value) => onUpdate({ actorName: String(value) })}
                className="text-sm text-[#e7e7e7]/70"
              />
            ) : (
              <span className="text-sm text-[#e7e7e7]/50 italic">Needs Casting</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={member.status} />
          {member.characterProfile?.castingPriority?.level && (
            <span className="text-[11px] px-2 py-1 rounded bg-[#1a1a1a] border border-[#36393f] text-[#e7e7e7]/80">
              Priority: {member.characterProfile.castingPriority.level}
              {member.characterProfile.castingPriority.deadline ? ` • Due ${member.characterProfile.castingPriority.deadline}` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Details Grid - Concept 3 Style */}
      <div className="space-y-2 text-sm text-[#e7e7e7]/70 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-[#e7e7e7]">Role Type:</span>
          <select
            value={member.role}
            onChange={(e) => onUpdate({ role: e.target.value as any })}
            className="bg-[#1a1a1a] border border-[#36393f] rounded px-2 py-1 text-[#e7e7e7] text-sm"
          >
            <option value="lead">Lead</option>
            <option value="supporting">Supporting</option>
            <option value="extra">Extra</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-medium text-[#e7e7e7]">Episodes:</span>
          <div className="flex flex-wrap gap-1 justify-end">
            {episodeTags && episodeTags.length > 0 ? (
              episodeTags.slice(0, 5).map((epNum) => (
                <span
                  key={epNum}
                  className="px-2 py-0.5 bg-[#1a1a1a] rounded text-xs text-[#10B981] border border-[#10B981]/30"
                >
                  Ep {epNum}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#e7e7e7]/50">N/A</span>
            )}
            {episodeTags && episodeTags.length > 5 && (
              <span className="text-xs text-[#e7e7e7]/50">+{episodeTags.length - 5} more</span>
            )}
          </div>
        </div>
        
      </div>

      {/* Expand/Collapse */}
      <button
        onClick={onSelect}
        className="w-full py-2 text-sm text-[#10B981] hover:text-[#059669] transition-colors border-t border-[#36393f] mt-4 pt-4"
      >
        {isSelected ? '▲ Show Less' : '▼ Show More Details'}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3 pt-4 border-t border-[#36393f] mt-4"
          >
            {/* Character Profile Details */}
            {member.characterProfile && (
              <div className="space-y-2 text-xs text-[#e7e7e7]/70">
                {member.characterProfile.archetype && (
                  <div>
                    <span className="font-medium text-[#e7e7e7]">Archetype:</span> {member.characterProfile.archetype}
                  </div>
                )}
                {member.characterProfile.ageRange && (
                  <div>
                    <span className="font-medium text-[#e7e7e7]">Age Range:</span> {member.characterProfile.ageRange.min}-{member.characterProfile.ageRange.max}
                  </div>
                )}
              </div>
            )}

            {/* Screen time metrics */}
            {member.characterProfile?.screenTimeMetrics && (
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-[#e7e7e7] bg-[#111] border border-[#36393f] rounded-lg p-2">
                <div>
                  <div className="text-[#e7e7e7]/60">Scenes</div>
                  <div className="font-semibold">{member.characterProfile.screenTimeMetrics.totalScenes ?? 0}</div>
                </div>
                <div>
                  <div className="text-[#e7e7e7]/60">Lines</div>
                  <div className="font-semibold">{member.characterProfile.screenTimeMetrics.totalLines ?? 0}</div>
                </div>
                <div>
                  <div className="text-[#e7e7e7]/60">Est. Minutes</div>
                  <div className="font-semibold">{member.characterProfile.screenTimeMetrics.estimatedMinutes ?? 0}</div>
                </div>
              </div>
            )}

            {/* Character arc timeline */}
            <CharacterArcTimeline
              characterArc={member.characterProfile?.characterArc}
              fallbackTitle="Character Arc"
            />

            {/* Audition sides (key scenes) */}
            <div className="space-y-2">
              <div className="text-xs text-[#e7e7e7]/50 font-medium">Audition Sides</div>
              <AuditionSidesViewer
                keyScenes={member.characterProfile?.keyScenes}
                characterName={member.characterName}
              />
            </div>

            {/* Relationships */}
            {member.characterProfile?.relationships && member.characterProfile.relationships.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-[#e7e7e7]/50 font-medium">Relationships</div>
                <div className="flex flex-wrap gap-1.5">
                  {member.characterProfile.relationships.map((rel, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded bg-[#1a1a1a] border border-[#36393f] text-[11px] text-[#e7e7e7]/80"
                    >
                      {rel.relationshipType}: {rel.characterName}
                      {rel.chemistryRequired ? ' • chemistry' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Backstory */}
            {member.characterProfile?.backstory && (
              <div className="space-y-1">
                <div className="text-xs text-[#e7e7e7]/50 font-medium">Backstory</div>
                <div className="text-xs text-[#e7e7e7]/70 leading-relaxed">
                  {member.characterProfile.backstory}
                </div>
              </div>
            )}

            {/* Objectives */}
            {member.characterProfile?.objectives && (
              <div className="space-y-1">
                <div className="text-xs text-[#e7e7e7]/50 font-medium">Objectives</div>
                <div className="text-xs text-[#e7e7e7]/80">
                  <span className="font-semibold text-[#e7e7e7]">Super-objective:</span> {member.characterProfile.objectives.superObjective}
                </div>
                {member.characterProfile.objectives.sceneObjectives?.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-[#e7e7e7]/70 space-y-0.5">
                    {member.characterProfile.objectives.sceneObjectives.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Voice requirements */}
            {member.characterProfile?.voiceRequirements && (
              <div className="space-y-1">
                <div className="text-xs text-[#e7e7e7]/50 font-medium">Voice & Tone</div>
                <div className="text-xs text-[#e7e7e7]/70 leading-relaxed">
                  {member.characterProfile.voiceRequirements.style}
                  {member.characterProfile.voiceRequirements.accent ? ` • Accent: ${member.characterProfile.voiceRequirements.accent}` : ''}
                  {member.characterProfile.voiceRequirements.vocalQuality ? ` • Quality: ${member.characterProfile.voiceRequirements.vocalQuality}` : ''}
                </div>
              </div>
            )}

            {/* Contact Info */}
            {member.actorName && member.actorName.trim() && member.contact && (
              <div className="space-y-2 pt-3 border-t border-[#36393f]">
                <div className="text-xs text-[#e7e7e7]/50 font-medium mb-2">Contact Information</div>
                <EditableField
                  value={member.contact?.email || ''}
                  onSave={(value) => onUpdate({ contact: { ...member.contact, email: String(value) } })}
                  placeholder="Email..."
                  className="text-xs text-[#e7e7e7]"
                />
                <EditableField
                  value={member.contact?.phone || ''}
                  onSave={(value) => onUpdate({ contact: { ...member.contact, phone: String(value) } })}
                  placeholder="Phone..."
                  className="text-xs text-[#e7e7e7]"
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1 pt-3 border-t border-[#36393f]">
              <div className="text-xs text-[#e7e7e7]/50">Notes</div>
              <EditableField
                value={member.notes || ''}
                onSave={async (value) => await onUpdate({ notes: String(value) })}
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

      {/* Placeholder modal for invite feature */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6 max-w-sm w-full shadow-xl"
            >
              <div className="text-lg font-semibold text-[#e7e7e7] mb-2">Invite cast</div>
              <p className="text-sm text-[#e7e7e7]/70 mb-4">
                This feature is under works. Please be patient while we finish it.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-[#10B981] text-black rounded-md font-semibold hover:bg-[#0ea271] transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
