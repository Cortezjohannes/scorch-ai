'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import AnimatedBackground from '@/components/AnimatedBackground'
import StoryBiblePlaybookModal from '@/components/StoryBiblePlaybookModal'
import ShareStoryBibleModal from '@/components/share/ShareStoryBibleModal'
import AuthStatusModal from '@/components/auth/AuthStatusModal'
import { useAuth } from '@/context/AuthContext'
import { saveStoryBible as saveStoryBibleToFirestore, getStoryBible as getStoryBibleFromFirestore, StoryBibleStatus } from '@/services/story-bible-service'
import { updateStoryBibleFields, updateLockStatus } from '@/services/story-bible-firestore'
import { versionControl } from '@/services/version-control'
import { storyBibleLock } from '@/services/story-bible-lock'
import { exportAsJSON, copyAsText, downloadMarkdown } from '@/utils/export-story-bible'
import CollapsibleSection, { isSectionEmpty } from '@/components/ui/CollapsibleSection'
import CharacterCreationWizard from '@/components/modals/CharacterCreationWizard'
import AIEditModal from '@/components/modals/AIEditModal'

export default function StoryBiblePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [storyBible, setStoryBible] = useState<any>(null)
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 Story Bible Page Debug:');
    console.log('  - User:', user ? `${user.displayName || user.email} (${user.id})` : 'null');
    console.log('  - Story Bible loaded:', !!storyBible);
    console.log('  - Share button should be:', (!user || !storyBible) ? 'DISABLED' : 'ENABLED');
  }, [user, storyBible])
  // Add premise tab to the active tab state
  const [activeTab, setActiveTab] = useState<'premise' | 'overview' | 'characters' | 'arcs' | 'world' | 'choices' | 'tension' | 'choice-arch' | 'living-world' | 'trope' | 'cohesion' | 'dialogue' | 'genre' | 'theme'>('premise')
  const [loading, setLoading] = useState(true)
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0)
  const [currentArcIndex, setCurrentArcIndex] = useState(0)
  const [showTechnicalTabs, setShowTechnicalTabs] = useState(false)
  const [showTechnicalModal, setShowTechnicalModal] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [showPlaybook, setShowPlaybook] = useState(false)
  const [regenerationsRemaining, setRegenerationsRemaining] = useState(5)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [editingField, setEditingField] = useState<{type: string, index?: number | string, field?: string, subfield?: string} | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showCharacterWizard, setShowCharacterWizard] = useState(false)
  const [showAIEditModal, setShowAIEditModal] = useState(false)
  const [aiEditConfig, setAIEditConfig] = useState<{
    title: string
    editType: 'worldBuilding' | 'storyArc' | 'dialogue' | 'rules'
    currentContent?: any
    onSave: (content: any) => void
  } | null>(null)
  const [showAddCharacterModal, setShowAddCharacterModal] = useState(false)
  const [showAddWorldModal, setShowAddWorldModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [hasSkippedLogin, setHasSkippedLogin] = useState(false)
  const [storyBibleStatus, setStoryBibleStatus] = useState<StoryBibleStatus>('draft')
  
  // Story Bible lock state (locked after first episode)
  const [isStoryBibleLocked, setIsStoryBibleLocked] = useState(false)

  // Helper function to save story bible to both localStorage and Firestore
  const saveStoryBibleData = async (updatedBible: any) => {
    try {
      // Use the service function to save (it ensures ID is generated and consistent)
      const savedBible = await saveStoryBibleToFirestore({
        ...updatedBible,
        status: storyBibleStatus,
        seriesTitle: updatedBible.seriesTitle || 'Untitled Story Bible'
      }, user?.id) // Service handles both Firestore and localStorage
      
      // If user is authenticated, also save with version control
      if (user && savedBible.id) {
        const storyBibleId = savedBible.id
        
        // Create version
        await versionControl.createVersion(
          storyBibleId,
          savedBible,
          [], // changes - could be tracked in future
          'Auto-save',
          true,
          user.id
        )
        
        // Update lock status based on episodes
        const episodeKeys = ['greenlit-episodes', 'scorched-episodes', 'reeled-episodes']
        let episodeCount = 0
        
        for (const key of episodeKeys) {
          const episodes = localStorage.getItem(key)
          if (episodes) {
            try {
              const parsedEpisodes = JSON.parse(episodes)
              episodeCount = Object.keys(parsedEpisodes || {}).length
              break
            } catch (error) {
              console.error('Error parsing episodes:', error)
            }
          }
        }
        
        const lockStatus = storyBibleLock.checkLockStatus(episodeCount)
        await updateLockStatus(user.id, storyBibleId, lockStatus.isLocked, episodeCount)
        
        console.log('✅ Story bible saved to Firestore with version control')
      }
      
      // Update local state with the saved bible (which now has an ID)
      setStoryBible(savedBible)
      
      console.log('✅ Story bible saved with ID:', savedBible.id)
      
      return savedBible // Return the saved bible so callers can access the ID
    } catch (error) {
      console.error('❌ Error saving story bible:', error)
      // Fall back to basic save
      const savedBible = await saveStoryBibleToFirestore({
        ...updatedBible,
        status: storyBibleStatus,
        seriesTitle: updatedBible.seriesTitle || 'Untitled Story Bible'
      }, user?.id)
      setStoryBible(savedBible)
      return savedBible
    }
  }
  
  // Effect to set client-side flag and load regeneration count
  useEffect(() => {
    setIsClient(true)
    // Load regeneration count from localStorage
    const savedCount = localStorage.getItem('greenlit-story-bible-regenerations')
    if (savedCount) {
      setRegenerationsRemaining(parseInt(savedCount))
    }
  }, [])
  
  // Effect to check if story bible should be locked (after first episode)
  useEffect(() => {
    if (!isClient) return
    
    // Check if any episodes exist in localStorage
    const checkForEpisodes = () => {
      const episodeKeys = ['greenlit-episodes', 'scorched-episodes', 'reeled-episodes']
      
      for (const key of episodeKeys) {
        const episodes = localStorage.getItem(key)
        if (episodes) {
          try {
            const parsedEpisodes = JSON.parse(episodes)
            if (parsedEpisodes && Object.keys(parsedEpisodes).length > 0) {
              setIsStoryBibleLocked(true)
              return
            }
          } catch (error) {
            console.error('Error parsing episodes:', error)
          }
        }
      }
      
      setIsStoryBibleLocked(false)
    }
    
    checkForEpisodes()
    
    // Listen for episode generation events
    const handleStorageChange = (e: StorageEvent) => {
      const episodeKeys = ['greenlit-episodes', 'scorched-episodes', 'reeled-episodes']
      if (e.key && episodeKeys.includes(e.key)) {
        checkForEpisodes()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also check when the component mounts
    checkForEpisodes()
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [isClient])
  
  // Helper function to safely get content with fallback to rawContent
  const getContentOrFallback = (obj: any, field: string) => {
    const value = obj?.[field] ?? obj?.rawContent
    if (!value) return 'Content not available'

    const tryParseJSON = (s: unknown) => {
      if (typeof s !== 'string') return null
      const t = s.trim()
      if (!(t.startsWith('{') || t.startsWith('['))) return null
      try { return JSON.parse(t) } catch { return null }
    }

    const stringifyItem = (item: any): string => {
      if (item == null) return ''
      if (typeof item === 'string') return item

      if (Array.isArray(item)) {
        const parts = item.map((it) => stringifyItem(it)).filter(Boolean)
        return parts.join(' • ')
      }

      if (typeof item === 'object') {
        // Special handling for genre tropes object
        if ('embrace' in item || 'subvert' in item || 'avoid' in item) {
          const fmt = (x: any) => Array.isArray(x) ? x.join(', ') : String(x ?? '')
          return `Embrace: ${fmt(item.embrace)} | Subvert: ${fmt(item.subvert)} | Avoid: ${fmt(item.avoid)}`
        }

        // Prefer common label/description fields if present
        const labelKeys = ['title', 'name', 'label', 'decisionID', 'id', 'character', 'choice', 'key', 'type', 'arc', 'role']
        const descKeys  = ['summary', 'description', 'text', 'details', 'value', 'impact']
        const labelKey = labelKeys.find(k => k in item)
        const descKey  = descKeys.find(k => k in item)

        if (labelKey || descKey) {
          const parts = []
          if (labelKey) parts.push(String(item[labelKey]))
          if (descKey) parts.push(String(item[descKey]))
          return parts.join(' — ')
        }

        // Flatten shallow key: value pairs where values are strings/arrays
        const pairs = Object.entries(item).map(([k, v]) => {
          if (typeof v === 'string') return `${k}: ${v}`
          if (Array.isArray(v)) {
            const s = v.map((it) => stringifyItem(it)).filter(Boolean).join(', ')
            return s ? `${k}: ${s}` : ''
          }
          return ''
        }).filter(Boolean)

        if (pairs.length) return pairs.join(' • ')

        // Fallback to compact JSON
        return JSON.stringify(item)
      }

      return String(item)
    }

    // If we got a JSON-like string, parse then format
    const parsed = tryParseJSON(value)
    return stringifyItem(parsed ?? value)
  }
  
  useEffect(() => {
    const loadStoryBible = async () => {
      try {
        // Check for ?shared= query parameter first (load from shared collection)
        const sharedLinkId = searchParams.get('shared')
        
        if (sharedLinkId) {
          console.log('🔗 Loading shared story bible with link ID:', sharedLinkId)
          try {
            const { getSharedStoryBible } = await import('@/services/share-link-service')
            const sharedData = await getSharedStoryBible(sharedLinkId)
            if (sharedData) {
              console.log('✅ Loaded shared story bible successfully!')
              setStoryBible(sharedData.storyBible)
              setIsStoryBibleLocked(true) // Lock editing for shared bibles
              return // Exit early
            } else {
              console.error('❌ Shared story bible not found')
              alert('This shared link is invalid or has been revoked.')
              return
            }
          } catch (error) {
            console.error('❌ Error loading shared story bible:', error)
            alert('Failed to load shared story bible.')
            return
          }
        }
        
        // Check for ?id= query parameter (load from user's Firestore)
        const storyBibleId = searchParams.get('id')
        
        if (storyBibleId && user) {
          console.log('🔍 Loading story bible from Firestore with ID:', storyBibleId)
          try {
            const firestoreBible = await getStoryBibleFromFirestore(storyBibleId, user.id)
            if (firestoreBible) {
              console.log('✅ Loaded from Firestore successfully!')
              setStoryBible(firestoreBible)
              return // Exit early, we found it in Firestore
            } else {
              console.warn('⚠️ Story bible not found in Firestore, falling back to localStorage')
            }
          } catch (error) {
            console.error('❌ Error loading from Firestore:', error)
            // Fall through to localStorage
          }
        }
        
        // Fall back to localStorage
        const savedBible = localStorage.getItem('greenlit-story-bible') || localStorage.getItem('scorched-story-bible') || localStorage.getItem('reeled-story-bible')
        const savedEpisodes = localStorage.getItem('greenlit-episodes') || localStorage.getItem('scorched-episodes') || localStorage.getItem('reeled-episodes')
        
        console.log('🔍 Loading story bible from localStorage:')
        console.log('- Raw localStorage data:', savedBible)
        console.log('- Data exists:', savedBible ? 'YES' : 'NO')
        console.log('- Data length:', savedBible ? savedBible.length : 0)
        
        // 🆕 ENHANCED DEBUGGING: Check all localStorage keys
        console.log('🔍 ALL localStorage keys:', Object.keys(localStorage))
        console.log('🔍 Greenlit keys:', Object.keys(localStorage).filter(k => k.includes('greenlit')))
        console.log('🔍 Story keys:', Object.keys(localStorage).filter(k => k.includes('story') || k.includes('bible')))
        
        // Check specific keys
        const greenlitKey = localStorage.getItem('greenlit-story-bible')
        const scorchedKey = localStorage.getItem('scorched-story-bible')
        const reeledKey = localStorage.getItem('reeled-story-bible')
        console.log('🔍 greenlit-story-bible exists:', !!greenlitKey)
        console.log('🔍 scorched-story-bible exists:', !!scorchedKey)
        console.log('🔍 reeled-story-bible exists:', !!reeledKey)
        
        if (scorchedKey) console.log('🔍 scorched-story-bible preview:', scorchedKey.substring(0, 200))
        if (reeledKey) console.log('🔍 reeled-story-bible preview:', reeledKey.substring(0, 200))
        
        if (savedBible) {
          try {
            const parsed = JSON.parse(savedBible)
            console.log('📖 Parsed story bible data structure:', {
              hasStoryBible: !!parsed.storyBible,
              hasSynopsis: !!parsed.synopsis,
              hasTheme: !!parsed.theme,
              keys: Object.keys(parsed)
            });
            
            // Validate that we have the required story bible data
            if (!parsed.storyBible) {
              console.error('❌ Missing storyBible property in saved data:', parsed)
              console.error('❌ Available properties in parsed data:', Object.keys(parsed))
              console.error('❌ Full parsed data structure:', parsed)
              throw new Error('Invalid story bible data structure - missing storyBible property')
            }
            
            // Additional validation - ensure storyBible has essential properties
            if (typeof parsed.storyBible !== 'object' || parsed.storyBible === null) {
              console.error('❌ storyBible is not a valid object:', typeof parsed.storyBible, parsed.storyBible)
              throw new Error('Invalid story bible data structure - storyBible is not an object')
            }
            
            let dynamicStoryBible = { ...parsed.storyBible }
            
            // Apply user choices to update the story bible dynamically
            if (savedEpisodes) {
              try {
                const episodes = JSON.parse(savedEpisodes)
                dynamicStoryBible = applyUserChoicesToStoryBible(dynamicStoryBible, episodes)
                console.log('✨ Applied user choices to story bible')
              } catch (episodeError) {
                console.warn('⚠️ Failed to parse episodes, using base story bible:', episodeError)
              }
            }
            
            console.log('✅ Setting story bible state with keys:', Object.keys(dynamicStoryBible));
            setStoryBible(dynamicStoryBible)
          } catch (parseError) {
            console.error('💥 Failed to parse story bible JSON:', parseError)
            console.error('💥 Raw data that failed to parse:', savedBible.substring(0, 200) + '...')
            
            // Try to recover by clearing corrupted data and redirecting
            localStorage.removeItem('scorched-story-bible')
            localStorage.removeItem('reeled-story-bible')
            alert('Story bible data was corrupted and has been cleared. Please generate a new story bible.')
            router.push('/')
          }
        } else {
          console.log('❌ No saved bible found in localStorage')
          console.log('📍 Current URL:', window.location.href)
          console.log('📍 Available localStorage keys:', Object.keys(localStorage))
          
          // Check for any localStorage data that might be related
          const allKeys = Object.keys(localStorage)
          const bibleKeys = allKeys.filter(key => key.includes('bible') || key.includes('story') || key.includes('scorched'))
          console.log('📍 Potential story bible related keys:', bibleKeys)
          bibleKeys.forEach(key => {
            const value = localStorage.getItem(key)
            console.log(`📍 ${key}:`, value ? value.substring(0, 100) + '...' : 'null')
          })
          
          // Don't auto-redirect - let the user see the page and choose what to do
          console.log('ℹ️ No story bible found, but allowing user to stay on page')
        }
      } catch (error) {
        console.error('💥 Unexpected error loading story bible:', error)
        console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    // Add a small delay to ensure localStorage is fully available
    const timeoutId = setTimeout(loadStoryBible, 100)
    return () => clearTimeout(timeoutId)
  }, [router])

  // 🛠️ DEBUG HELPER: Test localStorage functionality (for browser console)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).testStoryBibleLocalStorage = () => {
        console.log('🧪 TESTING localStorage functionality...')
        
        // Create test data
        const testData = {
          synopsis: 'Test synopsis for debugging',
          theme: 'Test theme', 
          storyBible: { 
            seriesTitle: 'Test Series',
            premise: {
              premiseStatement: 'Test premise statement',
              character: 'Test character',
              conflict: 'Test conflict',
              resolution: 'Test resolution',
              theme: 'Test theme',
              premiseType: 'Test type'
            },
            mainCharacters: [{ name: 'Test Character', archetype: 'Hero' }]
          },
          createdAt: new Date().toISOString(),
          platform: 'Greenlit - Production Platform'
        }
        
        // Save test data
        localStorage.setItem('greenlit-story-bible', JSON.stringify(testData))
        console.log('✅ Test data saved to localStorage')
        
        // Verify retrieval
        const retrieved = localStorage.getItem('greenlit-story-bible')
        console.log('✅ Test data retrieved:', !!retrieved)
        
        if (retrieved) {
          try {
            const parsed = JSON.parse(retrieved)
            console.log('✅ Test data parsed successfully')
            console.log('✅ Has storyBible:', !!parsed.storyBible)
            console.log('✅ Story bible structure:', Object.keys(parsed.storyBible))
            console.log('🔄 Reload the page to see the test data!')
          } catch (e) {
            console.error('❌ Failed to parse test data:', e)
          }
        }
      }
      
      (window as any).clearStoryBibleLocalStorage = () => {
        localStorage.removeItem('scorched-story-bible')
        localStorage.removeItem('reeled-story-bible')
        console.log('🧹 localStorage cleared')
      }
      
      console.log('🛠️ DEBUG: Test functions available:')
      console.log('- testStoryBibleLocalStorage() - creates test data')
      console.log('- clearStoryBibleLocalStorage() - clears all data')
    }
  }, [])

    // Function to apply user choices to dynamically update the story bible
  const applyUserChoicesToStoryBible = (originalBible: any, episodes: any[]) => {
    if (!episodes || episodes.length === 0) return originalBible
    
    const updatedBible = { ...originalBible }
    
    // Track fan choices and their impacts
    const fanChoices: any[] = []
    const newCharacters: any[] = []
    const newLocations: any[] = []
    const storyEvolution: any[] = []
    const characterDevelopments: any[] = []
    const plotThreads: any[] = []
    
    episodes.forEach((episode, index) => {
      // Track user choices
      if (episode.chosenPath) {
        fanChoices.push({
          episode: episode.episodeNumber,
          choice: episode.chosenPath,
          impact: `This choice shaped the direction of Episode ${episode.episodeNumber + 1}`
        })
      }
      
      // Track new characters introduced
      if (episode.newCharacters && episode.newCharacters.length > 0) {
        episode.newCharacters.forEach((char: string) => {
          if (!newCharacters.find(c => c.name === char)) {
            newCharacters.push({
              name: char,
              introducedInEpisode: episode.episodeNumber,
              description: "Character introduced through fan choices and story evolution",
              archetype: "Supporting Character",
              arc: `Introduced through user choice in Episode ${episode.episodeNumber}`
            })
          }
        })
      }
      
      // Track new locations introduced
      if (episode.newLocations && episode.newLocations.length > 0) {
        episode.newLocations.forEach((loc: string) => {
          if (!newLocations.find(l => l.name === loc)) {
            newLocations.push({
              name: loc,
              introducedInEpisode: episode.episodeNumber,
              description: "Location introduced through story progression"
            })
          }
        })
      }
      
      // Track story evolution through callbacks and foreshadowing
      if (episode.callbacks && episode.callbacks.length > 0) {
        storyEvolution.push({
          episode: episode.episodeNumber,
          type: 'callback',
          elements: episode.callbacks
        })
      }
      
      if (episode.foreshadowing && episode.foreshadowing.length > 0) {
        storyEvolution.push({
          episode: episode.episodeNumber,
          type: 'foreshadowing',
          elements: episode.foreshadowing
        })
      }

      // Track character developments from episode content
      if (episode.scenes && episode.scenes.length > 0) {
        episode.scenes.forEach((scene: any) => {
          // Extract character interactions and dialogue patterns
          if (scene.content) {
            // Look for character interactions in scene content
            const characterMentions = (updatedBible.mainCharacters || []).map((char: any) => char.name)
            characterMentions.forEach((charName: string) => {
              if (scene.content.toLowerCase().includes(charName.toLowerCase())) {
                characterDevelopments.push({
                  episode: episode.episodeNumber,
                  character: charName,
                  development: `Featured in Episode ${episode.episodeNumber}`,
                  sceneContext: scene.content.substring(0, 200) + "..."
                })
              }
            })
          }
          
          // Track explicit character development if present
          if (scene.characterDevelopment) {
            characterDevelopments.push({
              episode: episode.episodeNumber,
              character: scene.characterDevelopment.character,
              development: scene.characterDevelopment.development,
              sceneContext: scene.content?.substring(0, 200) || ""
            })
          }
        })
      }

      // Track plot threads and story arcs that emerge from choices
      if (episode.plotThreads && episode.plotThreads.length > 0) {
        plotThreads.push({
          episode: episode.episodeNumber,
          threads: episode.plotThreads
        })
      }

      // Track dialogue patterns and character voice consistency
      if (episode.scenes) {
        episode.scenes.forEach((scene: any) => {
          if (scene.dialogue && scene.dialogue.length > 0) {
            scene.dialogue.forEach((line: any) => {
              // Track character-specific dialogue for voice consistency
              const existingCharacterVoice = updatedBible.characterVoices?.find((cv: any) => cv.character === line.character)
              if (!existingCharacterVoice && updatedBible.characterVoices) {
                updatedBible.characterVoices.push({
                  character: line.character,
                  firstAppearance: episode.episodeNumber,
                  sampleDialogue: [line.line],
                  voiceNotes: line.direction || "Standard delivery"
                })
              } else if (existingCharacterVoice) {
                existingCharacterVoice.sampleDialogue.push(line.line)
              }
            })
          }
        })
      }
    })
    
    // Apply dynamic adaptations to the story bible
    updatedBible.fanChoices = fanChoices
    updatedBible.newCharacters = newCharacters
    updatedBible.newLocations = newLocations
    updatedBible.storyEvolution = storyEvolution
    updatedBible.characterDevelopments = characterDevelopments
    updatedBible.plotThreads = plotThreads
    updatedBible.episodesGenerated = episodes.length
    updatedBible.lastUpdated = new Date().toISOString()
    
    // Initialize character voices tracking
    if (!updatedBible.characterVoices) {
      updatedBible.characterVoices = []
    }
    
    // Update main characters list with new characters and development tracking
    if (newCharacters.length > 0) {
      updatedBible.mainCharacters = [
        ...(updatedBible.mainCharacters || []),
        ...newCharacters.map(char => ({
          name: char.name,
          archetype: char.archetype,
          arc: char.arc,
          description: `Introduced in Episode ${char.introducedInEpisode} through story evolution`,
          introducedThrough: 'user_choice'
        }))
      ]
    }

    // Update existing character arcs with developments from episodes
    if (characterDevelopments.length > 0 && updatedBible.mainCharacters) {
      updatedBible.mainCharacters = updatedBible.mainCharacters.map((char: any) => {
        const developments = characterDevelopments.filter(dev => 
          dev.character.toLowerCase().includes(char.name.toLowerCase()) ||
          char.name.toLowerCase().includes(dev.character.toLowerCase())
        )
        
        if (developments.length > 0) {
          const latestDevelopment = developments[developments.length - 1]
          return {
            ...char,
            arc: `${char.arc} | Recent development: ${latestDevelopment.development}`,
            lastUpdatedEpisode: latestDevelopment.episode
          }
        }
        return char
      })
    }
    
    // Update world building with new locations
    if (newLocations.length > 0) {
      if (!updatedBible.worldBuilding) {
        updatedBible.worldBuilding = { locations: [] }
      }
      if (!updatedBible.worldBuilding.locations) {
        updatedBible.worldBuilding.locations = []
      }
      
      updatedBible.worldBuilding.locations = [
        ...updatedBible.worldBuilding.locations,
        ...newLocations
      ]
    }

    // Update narrative arcs with actual episode content and choice consequences  
    if (updatedBible.narrativeArcs && episodes.length > 0) {
      updatedBible.narrativeArcs = updatedBible.narrativeArcs.map((arc: any, arcIndex: number) => {
        const arcStartEpisode = arcIndex * 10 + 1
        const arcEndEpisode = arcIndex * 10 + 10
        const arcEpisodes = episodes.filter(ep => 
          ep.episodeNumber >= arcStartEpisode && ep.episodeNumber <= arcEndEpisode
        )

        if (arcEpisodes.length > 0) {
          // Update arc summary based on actual episode content
          const choiceConsequences = arcEpisodes
            .filter(ep => ep.chosenPath)
            .map(ep => `Episode ${ep.episodeNumber}: ${ep.chosenPath}`)
            .join('; ')

          const enhancedSummary = arc.summary + 
            (choiceConsequences ? ` | Shaped by choices: ${choiceConsequences}` : '')

          // Update episodes with actual generated content
          const updatedEpisodes = arc.episodes ? arc.episodes.map((episodeInfo: any) => {
            const actualEpisode = arcEpisodes.find(ep => ep.episodeNumber === (arcIndex * 10 + episodeInfo.number))
            if (actualEpisode) {
              return {
                ...episodeInfo,
                title: actualEpisode.episodeTitle || episodeInfo.title,
                summary: actualEpisode.synopsis || episodeInfo.summary,
                actuallyGenerated: true,
                chosenPath: actualEpisode.chosenPath || null
              }
            }
            return episodeInfo
          }) : []

          return {
            ...arc,
            summary: enhancedSummary,
            episodes: updatedEpisodes,
            lastUpdated: new Date().toISOString(),
            episodesGenerated: arcEpisodes.length
          }
        }
        return arc
      })
    }

    // Add dynamic story adaptations section
    updatedBible.dynamicAdaptations = {
      totalEpisodesGenerated: episodes.length,
      totalChoicesMade: fanChoices.length,
      newElementsAdded: newCharacters.length + newLocations.length,
      lastEpisodeGenerated: episodes.length > 0 ? episodes[episodes.length - 1].episodeNumber : 0,
      adaptationLevel: episodes.length > 0 ? 'Active' : 'Static'
    }
    
    return updatedBible
  }

  // Edit field functions
  const startEditing = (type: string, field: string, currentValue: string, index?: number | string) => {
    // Check if story bible is locked and this edit is not allowed
    if (isStoryBibleLocked) {
      // Only allow adding characters when locked
      if (type !== 'addCharacter') {
        alert('🔒 Story Bible is locked! You can only add new characters to maintain continuity.')
        return
      }
    }
    
    setEditingField({ type, index, field })
    setEditValue(currentValue)
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditValue('')
  }

  const saveEdit = async () => {
    if (!editingField || !storyBible) return

    const updatedBible = { ...storyBible }

    // Handle different types of edits
    if (editingField.type === 'seriesTitle') {
      updatedBible.seriesTitle = editValue
    } else if (editingField.type === 'character' && editingField.index !== undefined) {
      // Handle nested field paths like "physiology.age" or "psychology.want"
      const fieldPath = editingField.field!
      if (fieldPath.includes('.')) {
        const [category, subfield] = fieldPath.split('.')
        updatedBible.mainCharacters[editingField.index][category][subfield] = editValue
      } else {
        updatedBible.mainCharacters[editingField.index][fieldPath] = editValue
      }
    } else if (editingField.type === 'arc' && editingField.index !== undefined) {
      updatedBible.narrativeArcs[editingField.index][editingField.field!] = editValue
    } else if (editingField.type === 'premise') {
      updatedBible.premise[editingField.field!] = editValue
    } else if (editingField.type === 'episode' && editingField.index !== undefined) {
      // Handle episode title editing in arc
      const [arcIndex, episodeIndex] = String(editingField.index).split('-').map(Number)
      updatedBible.narrativeArcs[arcIndex].episodes[episodeIndex][editingField.field!] = editValue
    }

    // Save to state and both storage locations
    setStoryBible(updatedBible)
    await saveStoryBibleData(updatedBible)

    // Clear editing state
    cancelEditing()
  }

  // Regeneration function
  const handleRegenerate = async () => {
    if (regenerationsRemaining <= 0) {
      alert('You have used all 5 regeneration attempts. Each regeneration costs us money, so we limit them to keep the service sustainable. Try editing specific fields instead!')
      return
    }

    const confirmed = confirm(
      `This will regenerate your entire story bible. You have ${regenerationsRemaining} regeneration${regenerationsRemaining > 1 ? 's' : ''} remaining.\n\n` +
      `💡 Tip: Consider editing specific fields instead to save your regenerations!\n\n` +
      `Continue with regeneration?`
    )

    if (!confirmed) return

    setIsRegenerating(true)

    try {
      // Get original prompt data
      const synopsis = searchParams.get('synopsis') || ''
      const theme = searchParams.get('theme') || ''

      if (!synopsis || !theme) {
        throw new Error('Original prompt data not found. Please create a new story bible.')
      }

      // Call the generate story bible API
      const response = await fetch('/api/generate/story-bible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ synopsis, theme })
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate story bible')
      }

      const data = await response.json()

      if (data.success && data.storyBible) {
        // Update regeneration count
        const newCount = regenerationsRemaining - 1
        setRegenerationsRemaining(newCount)
        localStorage.setItem('greenlit-story-bible-regenerations', String(newCount))

        // Save new story bible
        const savedData = {
          synopsis,
          theme,
          storyBible: data.storyBible,
          createdAt: new Date().toISOString(),
          platform: 'Greenlit - Production Platform'
        }
        localStorage.setItem('greenlit-story-bible', JSON.stringify(savedData))
        setStoryBible(data.storyBible)

        alert(`✅ Story bible regenerated successfully! ${newCount} regeneration${newCount !== 1 ? 's' : ''} remaining.`)
      } else {
        throw new Error(data.error || 'Failed to regenerate story bible')
      }
    } catch (error) {
      console.error('Regeneration error:', error)
      alert('Failed to regenerate story bible. Please try again or create a new one.')
    } finally {
      setIsRegenerating(false)
    }
  }

  // Status change function
  const handleStatusChange = async (newStatus: StoryBibleStatus) => {
    if (!storyBible || !user) return
    
    // Update local state
    const updatedBible = { ...storyBible, status: newStatus }
    setStoryBible(updatedBible)
    
    // Save to localStorage
    localStorage.setItem('greenlit-story-bible', JSON.stringify(updatedBible))
    
    // Save to Firestore
    try {
      await saveStoryBibleToFirestore(updatedBible, user.id)
      console.log('✅ Status updated to:', newStatus)
    } catch (error) {
      console.error('❌ Error updating status:', error)
    }
    
    setShowStatusDropdown(false)
  }

    // ========================================
  // CHARACTER CRUD FUNCTIONS
  // ========================================
  
  // Handler for completing character creation wizard
  const handleWizardComplete = async (character: any) => {
    if (!storyBible) return
    
    const updatedCharacters = [...(storyBible.mainCharacters || [])]
    updatedCharacters.push(character)
    
    const updatedBible = { ...storyBible, mainCharacters: updatedCharacters }
    setStoryBible(updatedBible)
    await saveStoryBibleData(updatedBible)
    
    setCurrentCharacterIndex(updatedCharacters.length - 1)
    setShowCharacterWizard(false)
  }

  const addNewCharacter = async () => {
    if (!storyBible) return
    
    // Open AI Character Creation Wizard instead of creating blank character
    setShowCharacterWizard(true)
    return
    
    // OLD CODE: Manual blank character creation
    const newCharacter = {
      name: 'New Character',
      archetype: 'Supporting Character',
      premiseFunction: 'To be defined',
      physiology: {
        age: 'TBD',
        gender: 'TBD',
        appearance: 'To be defined',
        build: 'Average',
        health: 'Good',
        physicalTraits: []
      },
      sociology: {
        class: 'Middle class',
        occupation: 'TBD',
        education: 'TBD',
        homeLife: 'To be defined',
        economicStatus: 'TBD',
        communityStanding: 'TBD'
      },
      psychology: {
        coreValue: 'To be defined',
        moralStandpoint: 'TBD',
        want: 'To be defined',
        need: 'To be defined',
        primaryFlaw: 'To be defined',
        temperament: ['TBD'],
        enneagramType: 'TBD',
        fears: ['To be defined'],
        strengths: ['To be defined']
      },
      backstory: 'Character backstory to be developed',
      arc: 'Character arc to be defined',
      voiceProfile: {
        speechPattern: 'TBD',
        vocabulary: 'Average',
        quirks: []
      }
    }
    
    const updatedCharacters = [...(storyBible.characters || []), newCharacter]
    const updatedBible = { ...storyBible, characters: updatedCharacters }
    setStoryBible(updatedBible)
    await saveStoryBibleData(updatedBible)
    
    setCurrentCharacterIndex(updatedCharacters.length - 1)
    setShowAddCharacterModal(false)
  }
  
  const deleteCharacter = async (index: number) => {
    if (isStoryBibleLocked) {
      alert('🔒 Story Bible is locked! You cannot delete characters after episodes have been generated.')
      return
    }
    
    if (!storyBible || !confirm(`Are you sure you want to delete "${storyBible.characters[index]?.name}"? This cannot be undone.`)) return
    
    const updatedCharacters = storyBible.characters.filter((_: any, i: number) => i !== index)
    const updatedBible = { ...storyBible, characters: updatedCharacters }
    setStoryBible(updatedBible)
    await saveStoryBibleData(updatedBible)
    
    // Adjust current index if needed
    if (currentCharacterIndex >= updatedCharacters.length) {
      setCurrentCharacterIndex(Math.max(0, updatedCharacters.length - 1))
    }
  }
  
  const updateCharacterField = (index: number, path: string, value: any) => {
    if (!storyBible) return
    
    const updatedCharacters = [...storyBible.characters]
    const character = { ...updatedCharacters[index] }
    
    // Handle nested paths like "physiology.age" or "psychology.want"
    const pathParts = path.split('.')
    if (pathParts.length === 1) {
      character[path] = value
    } else if (pathParts.length === 2) {
      character[pathParts[0]] = { ...character[pathParts[0]], [pathParts[1]]: value }
    }
    
    updatedCharacters[index] = character
    const updatedBible = { ...storyBible, characters: updatedCharacters }
    setStoryBible(updatedBible)
    
    // Save to localStorage
    const savedData = localStorage.getItem('greenlit-story-bible')
    if (savedData) {
      const data = JSON.parse(savedData)
      data.storyBible.characters = updatedCharacters
      localStorage.setItem('greenlit-story-bible', JSON.stringify(data))
    }
  }
  
  // ========================================
  // WORLD BUILDING CRUD FUNCTIONS
  // ========================================
  
  const addWorldElement = (category: string) => {
    if (!storyBible) return
    
    const newElement = {
      name: 'New Element',
      description: 'To be defined',
      significance: 'TBD'
    }
    
    const updatedWorld = { ...storyBible.worldBuilding }
    if (!updatedWorld[category]) {
      updatedWorld[category] = []
    }
    
    if (Array.isArray(updatedWorld[category])) {
      updatedWorld[category].push(newElement)
    } else if (typeof updatedWorld[category] === 'object') {
      // If it's an object, add to a "custom" array
      if (!updatedWorld[category].custom) {
        updatedWorld[category].custom = []
      }
      updatedWorld[category].custom.push(newElement)
    }
    
    const updatedBible = { ...storyBible, worldBuilding: updatedWorld }
    setStoryBible(updatedBible)
    
    // Save to localStorage
    const savedData = localStorage.getItem('greenlit-story-bible')
    if (savedData) {
      const data = JSON.parse(savedData)
      data.storyBible.worldBuilding = updatedWorld
      localStorage.setItem('greenlit-story-bible', JSON.stringify(data))
    }
  }
  
  const deleteWorldElement = (category: string, index: number) => {
    if (isStoryBibleLocked) {
      alert('🔒 Story Bible is locked! You cannot delete world elements after episodes have been generated.')
      return
    }
    
    if (!storyBible || !confirm('Are you sure you want to delete this element? This cannot be undone.')) return
    
    const updatedWorld = { ...storyBible.worldBuilding }
    
    if (Array.isArray(updatedWorld[category])) {
      updatedWorld[category] = updatedWorld[category].filter((_: any, i: number) => i !== index)
    } else if (updatedWorld[category]?.custom) {
      updatedWorld[category].custom = updatedWorld[category].custom.filter((_: any, i: number) => i !== index)
    }
    
    const updatedBible = { ...storyBible, worldBuilding: updatedWorld }
    setStoryBible(updatedBible)
    
    // Save to localStorage
    const savedData = localStorage.getItem('greenlit-story-bible')
    if (savedData) {
      const data = JSON.parse(savedData)
      data.storyBible.worldBuilding = updatedWorld
      localStorage.setItem('greenlit-story-bible', JSON.stringify(data))
    }
  }
  
  // ========================================
  // ARC CRUD FUNCTIONS
  // ========================================
  
  const addNewArc = () => {
    if (!storyBible) return
    
    const newArc = {
      title: 'New Arc',
      summary: 'Arc summary to be defined',
      episodes: [
        {
          number: (storyBible.narrativeArcs?.reduce((max: number, arc: any) => 
            Math.max(max, ...arc.episodes.map((ep: any) => ep.number)), 0) || 0) + 1,
          title: 'New Episode',
          summary: 'Episode summary to be defined'
        }
      ]
    }
    
    const updatedArcs = [...(storyBible.narrativeArcs || []), newArc]
    const updatedBible = { ...storyBible, narrativeArcs: updatedArcs }
    setStoryBible(updatedBible)
    
    // Save to localStorage
    const savedData = localStorage.getItem('greenlit-story-bible')
    if (savedData) {
      const data = JSON.parse(savedData)
      data.storyBible.narrativeArcs = updatedArcs
      localStorage.setItem('greenlit-story-bible', JSON.stringify(data))
    }
    
    setCurrentArcIndex(updatedArcs.length - 1)
  }
  
  const deleteArc = (index: number) => {
    if (isStoryBibleLocked) {
      alert('🔒 Story Bible is locked! You cannot delete arcs after episodes have been generated.')
      return
    }
    
    if (!storyBible || !confirm(`Are you sure you want to delete "${storyBible.narrativeArcs[index]?.title}"? This will delete all episodes in this arc. This cannot be undone.`)) return
    
    if (storyBible.narrativeArcs.length <= 1) {
      alert('Cannot delete the last arc. Every story needs at least one arc.')
      return
    }
    
    const updatedArcs = storyBible.narrativeArcs.filter((_: any, i: number) => i !== index)
    const updatedBible = { ...storyBible, narrativeArcs: updatedArcs }
    setStoryBible(updatedBible)
    
    // Save to localStorage
    const savedData = localStorage.getItem('greenlit-story-bible')
    if (savedData) {
      const data = JSON.parse(savedData)
      data.storyBible.narrativeArcs = updatedArcs
      localStorage.setItem('greenlit-story-bible', JSON.stringify(data))
    }
    
    // Adjust current index if needed
    if (currentArcIndex >= updatedArcs.length) {
      setCurrentArcIndex(Math.max(0, updatedArcs.length - 1))
    }
  }
  
  const addEpisodeToArc = (arcIndex: number) => {
    if (!storyBible) return
    
    const arc = storyBible.narrativeArcs[arcIndex]
    const lastEpisodeNum = arc.episodes[arc.episodes.length - 1]?.number || 0
    
    const newEpisode = {
      number: lastEpisodeNum + 1,
      title: `Episode ${lastEpisodeNum + 1}`,
      summary: 'Episode summary to be defined'
    }
    
    const updatedArcs = [...storyBible.narrativeArcs]
    updatedArcs[arcIndex] = {
      ...updatedArcs[arcIndex],
      episodes: [...updatedArcs[arcIndex].episodes, newEpisode]
    }
    
    const updatedBible = { ...storyBible, narrativeArcs: updatedArcs }
    setStoryBible(updatedBible)
    
    // Save to localStorage
    const savedData = localStorage.getItem('greenlit-story-bible')
    if (savedData) {
      const data = JSON.parse(savedData)
      data.storyBible.narrativeArcs = updatedArcs
      localStorage.setItem('greenlit-story-bible', JSON.stringify(data))
    }
  }
  
  const deleteEpisodeFromArc = (arcIndex: number, episodeIndex: number) => {
    if (isStoryBibleLocked) {
      alert('🔒 Story Bible is locked! You cannot delete episodes after they have been generated.')
      return
    }
    
    if (!storyBible) return
    
    const arc = storyBible.narrativeArcs[arcIndex]
    if (arc.episodes.length <= 1) {
      alert('Cannot delete the last episode in an arc. Each arc needs at least one episode.')
      return
    }
    
    if (!confirm(`Delete "${arc.episodes[episodeIndex]?.title}"? This cannot be undone.`)) return
    
    const updatedArcs = [...storyBible.narrativeArcs]
    updatedArcs[arcIndex] = {
      ...updatedArcs[arcIndex],
      episodes: updatedArcs[arcIndex].episodes.filter((_: any, i: number) => i !== episodeIndex)
    }
    
    const updatedBible = { ...storyBible, narrativeArcs: updatedArcs }
    setStoryBible(updatedBible)
    
    // Save to localStorage
    const savedData = localStorage.getItem('greenlit-story-bible')
    if (savedData) {
      const data = JSON.parse(savedData)
      data.storyBible.narrativeArcs = updatedArcs
      localStorage.setItem('greenlit-story-bible', JSON.stringify(data))
    }
  }

  // ========================================
  // EXPORT / IMPORT FUNCTIONS
  // ========================================
  
  const exportStoryBible = () => {
    if (!storyBible) return
    
    const savedData = localStorage.getItem('greenlit-story-bible')
    if (!savedData) {
      alert('No story bible data found to export.')
      return
    }
    
    // Create a downloadable JSON file
    const dataStr = JSON.stringify(JSON.parse(savedData), null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `story-bible-${storyBible.seriesTitle?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'export'}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log('✅ Story bible exported successfully!')
  }
  
  const importStoryBible = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        
        // Validate structure
        if (!imported.storyBible) {
          throw new Error('Invalid story bible format')
        }
        
        // Save to localStorage
        localStorage.setItem('greenlit-story-bible', JSON.stringify(imported))
        setStoryBible(imported.storyBible)
        
        alert(`✅ Story bible "${imported.storyBible.seriesTitle || 'Untitled'}" imported successfully!`)
        console.log('✅ Story bible imported:', imported)
      } catch (error) {
        console.error('Import error:', error)
        alert('❌ Failed to import story bible. Please check the file format.')
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    event.target.value = ''
  }

    const handleBeginEpisode = () => {
    const synopsis = searchParams.get('synopsis') || ''
    const theme = searchParams.get('theme') || ''
    router.push(`/episode-studio/1?synopsis=${encodeURIComponent(synopsis)}&theme=${encodeURIComponent(theme)}`)
  }

  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0a0a0a]" />
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-20 h-20 border-4 border-t-[#00FF99] border-r-[#00FF9950] border-b-[#00FF9930] border-l-[#00FF9920] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-[#e7e7e7]/70 mt-4">Loading your Story Bible...</p>
        </motion.div>
      </div>
    )
  }

  if (!storyBible) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div 
          className="text-center max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-[#00FF99] mb-4 font-medium cinematic-header">No Story Bible Found</h2>
          <p className="text-[#e7e7e7]/70 mb-6">
            You haven't created a story bible yet, or it couldn't be loaded from your browser's storage.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="px-6 py-3 bg-[#00FF99] text-black font-bold rounded-lg hover:bg-[#00CC7A] transition-colors"
              onClick={() => router.push('/')}
            >
              🔥 Create New Story
            </button>
            
            <button 
              className="px-6 py-3 border-2 border-[#00FF99] text-[#00FF99] font-bold rounded-lg hover:bg-[#00FF99]/10 transition-colors"
              onClick={async () => {
                if (!storyBible) {
                  console.error('No story bible to save')
                  return
                }
                
                // Save story bible before navigating
                console.log('💾 Saving story bible before navigating to workspace...')
                const savedBible = await saveStoryBibleData(storyBible)
                
                // Navigate to workspace with story bible ID
                const bibleId = savedBible?.id || storyBible.id
                console.log('✅ Navigating to workspace with ID:', bibleId)
                router.push(`/workspace?id=${bibleId}`)
              }}
            >
              ⚡ Go to Workspace
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div 
      className="min-h-screen p-4 sm:p-6 md:p-8 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ fontFamily: 'League Spartan, sans-serif', zIndex: 1 }}
    >
      <AnimatedBackground intensity="medium" />
      <div className="max-w-7xl mx-auto">
        {/* Professional Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Fire Icon */}
          <motion.div
            className="w-20 h-20 flex items-center justify-center mx-auto mb-6"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.6, 1, 0.6],
                filter: [
                  "brightness(1) drop-shadow(0 0 10px rgba(0, 255, 153, 0.3))",
                  "brightness(1.2) drop-shadow(0 0 20px rgba(0, 255, 153, 0.6))",
                  "brightness(1) drop-shadow(0 0 10px rgba(0, 255, 153, 0.3))"
                ]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-16 h-16"
            >
              <img 
                src="/greenlitailogo.png" 
                alt="Greenlit Logo" 
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>
          
          {/* Series Title with Edit Button */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {editingField?.type === 'seriesTitle' ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="text-4xl sm:text-5xl md:text-6xl font-bold bg-[#2a2a2a] border-2 border-[#00FF99] rounded-lg px-4 py-2 text-white"
                  autoFocus
                />
                <button
                  onClick={saveEdit}
                  className="bg-[#00FF99] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#00CC7A]"
                >
                  ✓
                </button>
                <button
                  onClick={cancelEditing}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <motion.h1 
                  className="text-5xl sm:text-6xl md:text-7xl font-bold font-medium"
                  initial={{ letterSpacing: "-0.1em", opacity: 0 }}
                  animate={{ letterSpacing: "0.02em", opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                >
                  {typeof storyBible.seriesTitle === 'string' ? storyBible.seriesTitle : getContentOrFallback(storyBible, 'seriesTitle') || "YOUR GREENLIT SERIES"}
                </motion.h1>
                <button
                  onClick={() => startEditing('seriesTitle', 'seriesTitle', storyBible.seriesTitle || '')}
                  className={`text-2xl transition-colors ${
                    isStoryBibleLocked 
                      ? 'text-gray-500 cursor-not-allowed' 
                      : 'text-white/70 hover:text-[#00FF99]'
                  }`}
                  title={isStoryBibleLocked ? "Series title locked after episode generation" : "Edit series title"}
                  disabled={isStoryBibleLocked}
                >
                  ✏️
                </button>
              </>
            )}
          </div>
          
          {/* Professional Subtitle */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="space-y-4"
          >
            
            <motion.div 
              className="flex flex-wrap justify-center gap-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <div className="px-4 py-2 bg-gradient-to-r from-[#00FF99]/20 to-[#00CC7A]/20 border border-[#00FF99]/30 rounded-xl">
                <span className="text-[#00FF99] font-bold text-sm font-medium">PREMISE ENGINE</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-[#00FF99]/20 to-[#00CC7A]/20 border border-[#00FF99]/30 rounded-xl">
                <span className="text-[#00FF99] font-bold text-sm font-medium">CHARACTER FORGE</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-[#00FF99]/20 to-[#00CC7A]/20 border border-[#00FF99]/30 rounded-xl">
                <span className="text-[#00FF99] font-bold text-sm font-medium">WORLD BUILDER</span>
              </div>
            </motion.div>

            {/* Login Status Indicator */}
            <motion.div
              className="flex flex-wrap justify-center gap-4 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                user 
                  ? 'bg-[#00FF99]/10 border border-[#00FF99]/30' 
                  : 'bg-orange-500/10 border border-orange-500/30'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  user ? 'bg-[#00FF99] animate-pulse' : 'bg-orange-500 animate-pulse'
                }`} />
                <span className={`text-sm font-medium ${
                  user ? 'text-[#00FF99]' : 'text-orange-300'
                }`}>
                  {user 
                    ? `✓ Logged in as ${user.displayName || user.email}` 
                    : '⚠️ Not logged in - Limited features'}
                </span>
                {!user && (
                  <button
                    onClick={() => setHasSkippedLogin(false)}
                    className="ml-2 px-3 py-1 bg-[#00FF99] text-black text-xs font-bold rounded hover:bg-[#00CC7A] transition-colors"
                  >
                    Login
                  </button>
                )}
              </div>
            </motion.div>

            {/* Story Bible Lock Notice */}
            {isStoryBibleLocked && (
              <motion.div
                className="flex flex-wrap justify-center gap-4 mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 max-w-2xl">
                  <p className="text-red-200 text-sm text-center">
                    🔒 <strong>Story Bible Locked!</strong> Episodes have been generated. Most editing is disabled to maintain continuity. 
                    You can still <strong>add new characters</strong> using the ➕ button.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Playbook Button */}
            <motion.div
              className="flex flex-wrap justify-center gap-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <button
                onClick={() => setShowPlaybook(true)}
                className="text-white/60 hover:text-white/90 text-sm px-3 py-2 rounded-md hover:bg-white/10 transition-all flex items-center gap-2"
                title="How to Use the Story Bible"
              >
                <span>📖</span>
                <span>How to Use the Story Bible</span>
              </button>
            </motion.div>

          </motion.div>
        </motion.div>

        {/* Playbook Modal */}
        <StoryBiblePlaybookModal 
          isOpen={showPlaybook} 
          onClose={() => setShowPlaybook(false)} 
        />

        {/* Clean Toolbar */}
        <motion.div
          className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {/* Left: Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              href="/profile"
              className="px-4 py-2 bg-[#1A1A1A] border border-[#00FF99]/20 rounded-lg text-white/80 hover:text-white hover:border-[#00FF99]/40 transition-all flex items-center gap-2 text-sm font-medium"
            >
              <span>←</span>
              <span>Dashboard</span>
            </Link>
            
            <motion.button
              onClick={async () => {
                if (!storyBible) return
                
                if (user) {
                  // Logged in user - save to both localStorage and Firestore
                  await saveStoryBibleData(storyBible)
                  alert('Story bible saved!')
                } else {
                  // Guest user - prompt to create account
                  const shouldLogin = confirm(
                    "Create an account to save your story bible and access it from any device.\n\nClick OK to create an account, or Cancel to save locally only."
                  )
                  
                  if (shouldLogin) {
                    // Save to localStorage first (preserve work)
                    await saveStoryBibleData(storyBible)
                    
                    // Redirect to login with return path
                    router.push('/login?redirect=/story-bible')
                  } else {
                    // Just save to localStorage
                    await saveStoryBibleData(storyBible)
                    alert('Story bible saved locally on this device.')
                  }
                }
              }}
              disabled={!storyBible}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                storyBible
                  ? 'bg-[#00FF99]/10 border border-[#00FF99]/30 text-[#00FF99] hover:bg-[#00FF99]/20'
                  : 'bg-gray-700/50 border border-gray-600 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={storyBible ? { scale: 1.05 } : {}}
              whileTap={storyBible ? { scale: 0.95 } : {}}
            >
              <span>💾</span>
              <span>Save</span>
            </motion.button>

            <motion.button
              onClick={() => setShowShareModal(true)}
              disabled={!user || !storyBible}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                user && storyBible
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
                  : 'bg-gray-700/50 border border-gray-600 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={user && storyBible ? { scale: 1.05 } : {}}
              whileTap={user && storyBible ? { scale: 0.95 } : {}}
              title={!user ? 'Sign in to share' : 'Share this story bible'}
            >
              <span>🔗</span>
              <span>Share</span>
            </motion.button>

            {/* More Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="px-3 py-2 bg-[#1A1A1A] border border-[#00FF99]/20 rounded-lg text-white/80 hover:text-white hover:border-[#00FF99]/40 transition-all"
                title="More actions"
              >
                <span className="text-lg">⋮</span>
              </button>
              
              {showActionsMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1A1A] border border-[#00FF99]/30 rounded-lg shadow-xl z-50">
                  <button
                    onClick={() => {
                      handleRegenerate()
                      setShowActionsMenu(false)
                    }}
                    disabled={isRegenerating || regenerationsRemaining <= 0}
                    className="w-full px-4 py-3 text-left text-white/80 hover:bg-[#00FF99]/10 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>🔄</span>
                    <span>Regenerate ({regenerationsRemaining}/5)</span>
                  </button>
                  
                  {/* Export with submenu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="w-full px-4 py-3 text-left text-white/80 hover:bg-[#00FF99]/10 hover:text-white transition-all flex items-center gap-2 justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span>📥</span>
                        <span>Export</span>
                      </div>
                      <span className="text-xs">{showExportMenu ? '▼' : '▶'}</span>
                    </button>
                    
                    {showExportMenu && (
                      <div className="pl-8 pr-4 py-2 bg-[#0A0A0A] border-l-2 border-[#00FF99]/20">
                        <button
                          onClick={() => {
                            exportAsJSON(storyBible)
                            setShowActionsMenu(false)
                            setShowExportMenu(false)
                          }}
                          className="w-full px-3 py-2 text-left text-white/70 hover:text-white text-sm flex items-center gap-2 rounded hover:bg-[#00FF99]/10 transition-all"
                        >
                          <span>📄</span>
                          <span>JSON (Backup)</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            downloadMarkdown(storyBible)
                            setShowActionsMenu(false)
                            setShowExportMenu(false)
                          }}
                          className="w-full px-3 py-2 text-left text-white/70 hover:text-white text-sm flex items-center gap-2 rounded hover:bg-[#00FF99]/10 transition-all"
                        >
                          <span>📝</span>
                          <span>Markdown</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            copyAsText(storyBible)
                            setShowActionsMenu(false)
                            setShowExportMenu(false)
                          }}
                          className="w-full px-3 py-2 text-left text-white/70 hover:text-white text-sm flex items-center gap-2 rounded hover:bg-[#00FF99]/10 transition-all"
                        >
                          <span>📋</span>
                          <span>Copy as Text</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this story bible? This cannot be undone.')) {
                        // Delete logic here
                      }
                      setShowActionsMenu(false)
                    }}
                    className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2 border-t border-[#00FF99]/10"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Status & Metadata */}
          <div className="flex items-center gap-2 sm:gap-3 text-sm flex-wrap justify-center sm:justify-end">
            {/* Status Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => user && setShowStatusDropdown(!showStatusDropdown)}
                disabled={!user}
                className={`px-3 py-1.5 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 ${
                  storyBible?.status === 'complete' 
                    ? 'bg-[#00FF99]/20 text-[#00FF99] border border-[#00FF99]/40'
                    : storyBible?.status === 'in-progress'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/40'
                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={user ? "Click to change status" : "Login to change status"}
              >
                <span>{storyBible?.status === 'complete' ? '✓ Complete' : storyBible?.status === 'in-progress' ? '⚡ In Progress' : '📝 Draft'}</span>
                {user && <span className="text-xs">▼</span>}
              </button>
              
              {showStatusDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#1A1A1A] border border-[#00FF99]/30 rounded-lg shadow-xl z-50">
                  <button
                    onClick={() => handleStatusChange('draft')}
                    className="w-full px-4 py-3 text-left text-gray-400 hover:bg-gray-500/10 hover:text-gray-300 transition-all flex items-center gap-2"
                  >
                    <span>📝</span>
                    <span>Draft</span>
                    {storyBible?.status === 'draft' && <span className="ml-auto text-[#00FF99]">✓</span>}
                  </button>
                  
                  <button
                    onClick={() => handleStatusChange('in-progress')}
                    className="w-full px-4 py-3 text-left text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-all flex items-center gap-2"
                  >
                    <span>⚡</span>
                    <span>In Progress</span>
                    {storyBible?.status === 'in-progress' && <span className="ml-auto text-[#00FF99]">✓</span>}
                  </button>
                  
                  <button
                    onClick={() => handleStatusChange('complete')}
                    className="w-full px-4 py-3 text-left text-[#00FF99] hover:bg-[#00FF99]/10 hover:text-[#00CC7A] transition-all flex items-center gap-2"
                  >
                    <span>✓</span>
                    <span>Complete</span>
                    {storyBible?.status === 'complete' && <span className="ml-auto text-[#00FF99]">✓</span>}
                  </button>
                </div>
              )}
            </div>
            
            {/* Counts */}
            <div className="text-white/60">
              {storyBible?.mainCharacters?.length || 0} Characters • {storyBible?.narrativeArcs?.length || 0} Arcs
            </div>
          </div>
        </motion.div>

        {/* Professional Navigation */}
        <motion.div 
          className="flex flex-col items-center mb-12 space-y-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {/* Main Tabs - Core Content */}
          <div className="space-y-4 w-full max-w-4xl">
            {/* Core Content Tabs - Primary */}
          <motion.div 
            className="rebellious-card p-2 flex flex-wrap justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
              {(['premise', 'overview', 'characters', 'arcs', 'world'] as const).map((tab, index) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-button ${activeTab === tab ? 'tab-button-active' : ''}`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
              >
                  <span className="relative z-10 font-medium">
                  {tab === 'premise' ? '🎯 Premise' : 
                   tab === 'overview' ? '📖 Overview' :
                   tab === 'characters' ? '👥 Characters' :
                   tab === 'arcs' ? '📚 Story Arcs' :
                   tab === 'world' ? '🌍 World' :
                   (tab as string).charAt(0).toUpperCase() + (tab as string).slice(1)}
                </span>
                
                {activeTab === tab && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#00FF99]/20 via-[#00CC7A]/20 to-[#00FF99]/20 rounded-xl"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

            {/* Your Choices Tab - Secondary (Metadata) */}
          <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9, duration: 0.5 }}
            >
              <button
                onClick={() => setActiveTab('choices')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  activeTab === 'choices'
                    ? 'bg-gray-500/20 text-gray-300 border-gray-500/40'
                    : 'bg-gray-700/10 text-gray-500 border-gray-600/20 hover:bg-gray-600/20 hover:text-gray-400 hover:border-gray-500/30'
                }`}
                title="View your initial creative choices"
              >
                <span className="opacity-70">⚡ Your Choices</span>
                <span className="ml-2 text-xs opacity-50">(Metadata)</span>
              </button>
            </motion.div>
          </div>

          {/* Advanced Analysis (Optional) */}
          <motion.div 
            className="flex flex-col items-center gap-3 mt-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-600"></div>
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Advanced Analysis (Optional)</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-600"></div>
            </div>
            
            <motion.button
              onClick={() => setShowTechnicalModal(true)}
              className="bg-gradient-to-r from-[#00FF99]/10 to-[#00CC7A]/10 border border-[#00FF99]/30 text-[#00FF99] py-2.5 px-5 text-sm font-medium rounded-lg hover:bg-[#00FF99]/20 hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                <span>🔬</span>
                <span>View Technical Analysis</span>
              </span>
            </motion.button>
            
            {showTechnicalTabs && (
              <motion.span 
                className="text-[#00FF99] text-xs font-medium flex items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="animate-pulse">✓</span>
                Technical tabs active
              </motion.span>
            )}
          </motion.div>
        </motion.div>

          {/* Technical Tabs (when enabled) */}
          {showTechnicalTabs && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1e1e1e]/60 border border-[#00FF99]/30 rounded-lg p-1 flex flex-wrap"
            >
              {(['tension', 'choice-arch', 'living-world', 'trope', 'cohesion', 'dialogue', 'genre', 'theme'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md transition-all text-sm ${
                    activeTab === tab 
                      ? 'bg-[#00FF99]/80 text-black font-medium' 
                      : 'text-[#00FF99]/80 hover:text-[#00FF99] hover:bg-[#2a2a2a]'
                  }`}
                >
                  {tab === 'tension' ? '⚡ Tension' :
                   tab === 'choice-arch' ? '🎯 Choice' :
                   tab === 'living-world' ? '🌍 Living World' :
                   tab === 'trope' ? '📖 Trope' :
                   tab === 'cohesion' ? '🔗 Cohesion' :
                   tab === 'dialogue' ? '🗣️ Dialogue' :
                   tab === 'genre' ? '🎭 Genre' :
                   tab === 'theme' ? '🎯 Theme' : tab}
                </button>
              ))}
            </motion.div>
          )}

        {/* Technical Tabs Modal */}
        <AnimatePresence>
          {showTechnicalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowTechnicalModal(false)
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 max-w-lg w-full"
              >
                <h3 className="text-2xl font-bold text-[#00FF99] mb-4 font-medium cinematic-subheader">
                  Advanced Analysis
                </h3>
                <p className="text-[#e7e7e7]/90 mb-6 leading-relaxed">
                  Would you like to see the technical analysis tabs? These contain detailed production analysis including 
                  tension escalation, choice architecture, trope analysis, and narrative cohesion that power 
                  your story generation behind the scenes.
                </p>
                <div className="bg-[#2a2a2a] rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-[#00FF99] mb-2">Technical Tabs Include:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-[#00FF99]">⚡</span>
                      <span>Tension Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#00FF99]">🎯</span>
                      <span>Choice Architecture</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#00FF99]">🌍</span>
                      <span>Living World</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#00FF99]">📖</span>
                      <span>Trope Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#00FF99]">🔗</span>
                      <span>Cohesion Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#00FF99]">🗣️</span>
                      <span>Dialogue Strategy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#00FF99]">🎭</span>
                      <span>Genre Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#00FF99]">🎯</span>
                      <span>Theme Integration</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowTechnicalModal(false)}
                    className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors"
                  >
                    Not Now
                  </button>
                  <button
                    onClick={() => {
                      setShowTechnicalTabs(true)
                      setShowTechnicalModal(false)
                    }}
                    className="px-6 py-2 bg-[#00FF99] text-black font-medium rounded-lg hover:bg-[#00CC7A] transition-colors"
                  >
                    Show Technical Tabs
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 shadow-lg mb-8"
          >
            {/* Premise Tab Content - NEW */}
            {activeTab === 'premise' && storyBible.premise && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-[#1a1a1a] border border-[#00FF99] rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-[#00FF99] mb-4 flex items-center font-medium cinematic-subheader">
                    Story Premise - The Foundation
                  </h3>
                  
                  <div className="bg-[#2a2a2a] rounded-lg p-6 border-l-4 border-[#00FF99] mb-6">
                    <h4 className="text-xl font-bold text-white mb-2">
                      "{getContentOrFallback(storyBible.premise, 'premiseStatement')}"
                    </h4>
                    <p className="text-[#e7e7e7]/70">
                      <strong>Egri's Equation:</strong> {getContentOrFallback(storyBible.premise, 'character')} + {getContentOrFallback(storyBible.premise, 'conflict')} → {getContentOrFallback(storyBible.premise, 'resolution')}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-[#00FF99]">Core Elements</h4>
                      <div className="space-y-3">
                        <div className="bg-[#2a2a2a] rounded-lg p-4">
                          <p className="text-sm text-[#e7e7e7]/70">Theme</p>
                          <p className="font-bold text-white">{getContentOrFallback(storyBible.premise, 'theme')}</p>
                        </div>
                        <div className="bg-[#2a2a2a] rounded-lg p-4">
                          <p className="text-sm text-[#e7e7e7]/70">Premise Type</p>
                          <p className="font-bold text-white">{getContentOrFallback(storyBible.premise, 'premiseType')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-[#00FF99]">Story Function</h4>
                      <p className="text-[#e7e7e7]/90 text-sm leading-relaxed">
                        Every character, scene, and user choice in this story serves to prove this central premise. 
                        This ensures narrative coherence and emotional satisfaction by building toward a logical conclusion.
                      </p>
                      
                      {storyBible.premiseValidation && (
                        <div className={`rounded-lg p-4 ${
                          storyBible.premiseValidation.strength === 'strong' ? 'bg-green-900/20 border border-green-500/30' :
                          storyBible.premiseValidation.strength === 'moderate' ? 'bg-yellow-900/20 border border-yellow-500/30' :
                          'bg-red-900/20 border border-red-500/30'
                        }`}>
                          <p className="text-sm font-bold">
Premise Strength: {typeof storyBible.premiseValidation.strength === 'string' ? storyBible.premiseValidation.strength.toUpperCase() : getContentOrFallback(storyBible.premiseValidation, 'strength')}
                          </p>
                          {storyBible.premiseValidation.issues.length > 0 && (
                            <p className="text-xs mt-1 opacity-70">
                              {storyBible.premiseValidation.issues.join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Professional Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div 
                className="space-y-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="rebellious-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <h2 className="text-3xl font-bold text-center mb-6 font-medium">
                    ✨ YOUR PROFESSIONAL SERIES
                  </h2>
                  <p className="text-xl text-white/90 leading-relaxed text-center font-medium">
{typeof storyBible.seriesOverview === 'string' ? storyBible.seriesOverview : getContentOrFallback(storyBible, 'seriesOverview') || "A compelling series spanning multiple episodes, crafted to engage audiences and tell meaningful stories."}
                  </p>
                </motion.div>
                
                {storyBible.potentialBranchingPaths && (
                  <motion.div 
                    className="rebellious-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <h3 className="text-xl font-semibold text-[#00FF99] mb-3 font-medium">Branching Paths</h3>
                    <p className="text-white/90 font-medium">{storyBible.potentialBranchingPaths}</p>
                  </motion.div>
                )}
                
                {/* Professional Stats Grid */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  {[
                    { value: storyBible.mainCharacters?.length || 0, label: "Rebel Characters", icon: "👥" },
                    { value: storyBible.narrativeArcs?.length || 0, label: "Story Arcs", icon: "📚" },
                    { value: storyBible.episodesGenerated || 0, label: "Episodes Forged", icon: "🔥" }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className="rebellious-card text-center p-6"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div className="text-5xl mb-3">
                        {stat.icon}
                    </div>
                      <div className="text-4xl font-bold text-[#00FF99] mb-2 font-medium">
                        {stat.value}
                  </div>
                      <div className="text-white/70 font-bold font-medium">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Characters Tab - Enhanced for 3D Characters */}
            {activeTab === 'characters' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Editing Hint */}
                <div className="bg-[#2a2a2a]/50 border-l-4 border-[#00FF99] p-4 rounded-lg">
                  <p className="text-[#e7e7e7]/90 text-sm">
                    💡 <strong>Tip:</strong> Hover over any field to see an edit button (✏️). Add or remove characters as needed - no hardcoded limits!
                  </p>
                      </div>
                  
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-[#00FF99] flex items-center">
                    👥 Character Profiles
                    {storyBible.characters3D && (
                      <span className="ml-3 text-sm bg-[#00FF99] text-black px-2 py-1 rounded-lg">
                        3D Psychology
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentCharacterIndex(Math.max(0, currentCharacterIndex - 1))}
                      className="p-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] disabled:opacity-50"
                      disabled={currentCharacterIndex === 0}
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setCurrentCharacterIndex(Math.min(storyBible.mainCharacters.length - 1, currentCharacterIndex + 1))}
                      className="p-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] disabled:opacity-50"
                      disabled={currentCharacterIndex === storyBible.mainCharacters.length - 1}
                    >
                      →
                    </button>
                  </div>
                </div>

                {storyBible.mainCharacters && storyBible.mainCharacters.length > 0 && (
                  <div className="grid gap-6">
                    {/* Character Navigation */}
                    <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {storyBible.mainCharacters.map((character: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentCharacterIndex(index)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentCharacterIndex === index
                              ? 'bg-[#00FF99] text-black font-bold'
                              : 'bg-[#2a2a2a] text-[#e7e7e7] hover:bg-[#36393f]'
                          }`}
                        >
                          {character.name}
                          {character.premiseRole && (
                            <span className="ml-2 text-xs opacity-70">
                              ({character.premiseRole})
                            </span>
                          )}
                        </button>
                      ))}
                      </div>
                      
                      {/* CRUD Action Buttons */}
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={addNewCharacter}
                          className="px-4 py-2 bg-[#00FF99] text-black font-bold rounded-lg hover:bg-[#00CC7A] transition-colors flex items-center gap-2"
                          title="Add new character"
                        >
                          ➕ Add Character
                        </button>
                        {storyBible.mainCharacters.length > 1 && !isStoryBibleLocked && (
                          <button
                            onClick={() => deleteCharacter(currentCharacterIndex)}
                            className="px-4 py-2 bg-red-500/80 text-white font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                            title="Delete current character"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Character Detail View */}
                    {(() => {
                      const character = storyBible.mainCharacters[currentCharacterIndex];
                      const is3D = character.physiology && character.sociology && character.psychology;
                      
                      return (
                      <motion.div
                        key={currentCharacterIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-[#2a2a2a] rounded-xl p-6"
                        >
                          {/* Character Header */}
                          <div className="mb-6">
                            <div className="flex items-center gap-3">
                              {editingField?.type === 'character' && editingField?.index === currentCharacterIndex && editingField?.field === 'name' ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="text-2xl font-bold bg-[#1a1a1a] border-2 border-[#00FF99] rounded-lg px-3 py-1 text-white flex-1"
                                    autoFocus
                                  />
                                  <button onClick={saveEdit} className="bg-[#00FF99] text-black px-3 py-1 rounded-lg font-bold">✓</button>
                                  <button onClick={cancelEditing} className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold">✕</button>
                                </div>
                              ) : (
                                <>
                                  <h4 className="text-2xl font-bold text-white">{character.name}</h4>
                                  <button
                                    onClick={() => startEditing('character', 'name', character.name, currentCharacterIndex)}
                                    className="text-white/50 hover:text-[#00FF99] transition-colors"
                                    title="Edit character name"
                                  >
                                    ✏️
                                  </button>
                                </>
                              )}
                            </div>
                            {character.premiseFunction ? (
                              <p className="text-[#00FF99] font-medium mt-2">{character.premiseFunction}</p>
                            ) : (
                              <p className="text-[#e7e7e7]/70 mt-2">{character.archetype || 'Character'}</p>
                            )}
                              </div>

                          {is3D ? (
                            /* 3D Character Display */
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Physiology */}
                              <CollapsibleSection
                                title="Physiology"
                                icon="🏃"
                                isEmptyDefault={isSectionEmpty(character.physiology || {}, ['physicalTraits'])}
                              >
                                <div className="space-y-2">
                                  {/* Editable Age */}
                                  <div className="flex items-center gap-2 group">
                                    <strong>Age:</strong>
                                    {editingField?.type === 'character' && editingField?.index === currentCharacterIndex && editingField?.field === 'physiology.age' ? (
                                      <div className="flex items-center gap-1 flex-1">
                                        <input
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          className="bg-[#2a2a2a] border border-[#00FF99] rounded px-2 py-1 text-white text-sm flex-1"
                                          autoFocus
                                        />
                                        <button onClick={saveEdit} className="bg-[#00FF99] text-black px-2 py-1 rounded text-xs">✓</button>
                                        <button onClick={cancelEditing} className="bg-red-500 text-white px-2 py-1 rounded text-xs">✕</button>
                                      </div>
                                    ) : (
                                      <>
                                        <span>{character.physiology.age}</span>
                                        <button
                                          onClick={() => startEditing('character', 'physiology.age', character.physiology.age, currentCharacterIndex)}
                                          className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-[#00FF99] transition-all text-xs ml-1"
                                        >
                                          ✏️
                                        </button>
                                      </>
                                    )}
                                  </div>
                                  
                                  {/* Editable Gender */}
                                  <div className="flex items-center gap-2 group">
                                    <strong>Gender:</strong>
                                    {editingField?.type === 'character' && editingField?.index === currentCharacterIndex && editingField?.field === 'physiology.gender' ? (
                                      <div className="flex items-center gap-1 flex-1">
                                        <input
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          className="bg-[#2a2a2a] border border-[#00FF99] rounded px-2 py-1 text-white text-sm flex-1"
                                          autoFocus
                                        />
                                        <button onClick={saveEdit} className="bg-[#00FF99] text-black px-2 py-1 rounded text-xs">✓</button>
                                        <button onClick={cancelEditing} className="bg-red-500 text-white px-2 py-1 rounded text-xs">✕</button>
                                      </div>
                                    ) : (
                                      <>
                                        <span>{character.physiology.gender}</span>
                                        <button
                                          onClick={() => startEditing('character', 'physiology.gender', character.physiology.gender, currentCharacterIndex)}
                                          className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-[#00FF99] transition-all text-xs ml-1"
                                        >
                                          ✏️
                                        </button>
                                      </>
                                    )}
                                  </div>
                                  
                                  {/* Editable Appearance */}
                                  <div className="flex items-start gap-2 group">
                                    <strong>Appearance:</strong>
                                    {editingField?.type === 'character' && editingField?.index === currentCharacterIndex && editingField?.field === 'physiology.appearance' ? (
                                      <div className="flex items-center gap-1 flex-1">
                                        <textarea
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          className="bg-[#2a2a2a] border border-[#00FF99] rounded px-2 py-1 text-white text-sm flex-1 min-h-[60px]"
                                          autoFocus
                                        />
                                        <div className="flex flex-col gap-1">
                                          <button onClick={saveEdit} className="bg-[#00FF99] text-black px-2 py-1 rounded text-xs">✓</button>
                                          <button onClick={cancelEditing} className="bg-red-500 text-white px-2 py-1 rounded text-xs">✕</button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <span className="flex-1">{character.physiology.appearance}</span>
                                        <button
                                          onClick={() => startEditing('character', 'physiology.appearance', character.physiology.appearance, currentCharacterIndex)}
                                          className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-[#00FF99] transition-all text-xs"
                                        >
                                          ✏️
                                        </button>
                                      </>
                                    )}
                                  </div>
                                  
                                  {/* Build, Health - similar pattern */}
                                  <p><strong>Build:</strong> {character.physiology.build}</p>
                                  <p><strong>Health:</strong> {character.physiology.health}</p>
                                  {character.physiology.physicalTraits?.length > 0 && (
                                    <p><strong>Traits:</strong> {character.physiology.physicalTraits.join(', ')}</p>
                                  )}
                            </div>
                          </CollapsibleSection>

                              {/* Sociology */}
                              <CollapsibleSection
                                title="Sociology"
                                icon="🏛️"
                                isEmptyDefault={isSectionEmpty(character.sociology || {})}
                              >
                                <div className="space-y-2 text-sm">
                                  <p><strong>Class:</strong> {character.sociology.class}</p>
                                  <p><strong>Occupation:</strong> {character.sociology.occupation}</p>
                                  <p><strong>Education:</strong> {character.sociology.education}</p>
                                  <p><strong>Home Life:</strong> {character.sociology.homeLife}</p>
                                  <p><strong>Economic Status:</strong> {character.sociology.economicStatus}</p>
                                  <p><strong>Community Standing:</strong> {character.sociology.communityStanding}</p>
                                </div>
                          </CollapsibleSection>
                            
                              {/* Psychology */}
                              <CollapsibleSection
                                title="Psychology"
                                icon="🧠"
                                isEmptyDefault={isSectionEmpty(character.psychology || {})}
                                className="md:col-span-2 lg:col-span-1"
                              >
                                <div className="space-y-3">
                                  <div className="bg-[#2a2a2a] rounded-lg p-3 border-l-4 border-green-400">
                                    <p><strong>Core Value:</strong> {character.psychology.coreValue}</p>
                                    <p><strong>Moral Standpoint:</strong> {character.psychology.moralStandpoint}</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 gap-2">
                                    <div className="bg-[#2a2a2a] rounded-lg p-3 border-l-4 border-blue-400">
                                      <p className="text-blue-400 font-bold text-xs mb-1">WANT (External Goal)</p>
                                      <p>{character.psychology.want}</p>
                                    </div>
                                    <div className="bg-[#2a2a2a] rounded-lg p-3 border-l-4 border-purple-400">
                                      <p className="text-purple-400 font-bold text-xs mb-1">NEED (Internal Lesson)</p>
                                      <p>{character.psychology.need}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-[#2a2a2a] rounded-lg p-3 border-l-4 border-red-400">
                                    <p className="text-red-400 font-bold text-xs mb-1">PRIMARY FLAW</p>
                                    <p>{character.psychology.primaryFlaw}</p>
                                    <p className="text-xs mt-1 text-[#e7e7e7]/60">*Creates obstacles until growth occurs</p>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <p><strong>Temperament:</strong> {character.psychology.temperament?.join(', ') || 'Not specified'}</p>
                                    <p><strong>Attitude:</strong> {character.psychology.attitude}</p>
                                    <p><strong>IQ:</strong> {character.psychology.iq}</p>
                                    <p><strong>Top Fear:</strong> {character.psychology.fears?.[0] || 'Unknown'}</p>
                                  </div>
                                </div>
                              </CollapsibleSection>
                            </div>
                          ) : (
                            /* Legacy Character Display */
                            <div className="space-y-4">
                              <div className="bg-[#1a1a1a] rounded-lg p-4">
                                <h5 className="text-[#00FF99] font-bold mb-2">Character Overview</h5>
                                <p className="text-[#e7e7e7]/90 mb-3">{character.description}</p>
                                <p className="text-sm"><strong>Archetype:</strong> {character.archetype}</p>
                                {character.arc && (
                                  <p className="text-sm"><strong>Character Arc:</strong> {character.arc}</p>
                                )}
                              </div>
                              </div>
                            )}
                            
                          {/* Speech Pattern (if available) */}
                          {character.speechPattern && (
                            <div className="mt-6 bg-[#1a1a1a] rounded-lg p-4">
                              <h5 className="text-[#00FF99] font-bold mb-3 flex items-center">
                                🗣️ Speech Pattern
                              </h5>
                              <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <p><strong>Vocabulary:</strong> {character.speechPattern.vocabulary}</p>
                                <p><strong>Rhythm:</strong> {character.speechPattern.rhythm}</p>
                                <p><strong>Voice Notes:</strong> {character.speechPattern.voiceNotes}</p>
                            </div>
                          </div>
                          )}

                          {/* Living Narrative Info */}
                          {character.arcIntroduction && (
                            <div className="mt-6 bg-[#1a1a1a] rounded-lg p-4">
                              <h5 className="text-[#00FF99] font-bold mb-3 flex items-center">
                                📖 Living Narrative
                              </h5>
                              <div className="text-sm space-y-1">
                                <p><strong>Introduces:</strong> Arc {character.arcIntroduction}</p>
                                {character.arcDeparture && (
                                  <p><strong>Departs:</strong> Arc {character.arcDeparture} ({character.departureReason})</p>
                                )}
                                <p className="text-[#e7e7e7]/70 mt-2">
                                  This character's role evolves based on story needs and user choices.
                                </p>
                        </div>
                            </div>
                          )}
                      </motion.div>
                      );
                    })()}
                  </div>
                )}

                {/* Character Relationships (if available) */}
                {storyBible.characterRelationships && storyBible.characterRelationships.length > 0 && (
                  <div className="mt-8 bg-[#1a1a1a] rounded-xl p-6">
                    <h4 className="text-[#00FF99] font-bold mb-4">🔗 Character Relationships</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {storyBible.characterRelationships.map((rel: any, index: number) => (
                        <div key={index} className="bg-[#2a2a2a] rounded-lg p-4">
                          <h5 className="font-bold text-white mb-2">
                            {rel.character1} & {rel.character2}
                          </h5>
                          <p className="text-sm text-[#e7e7e7]/90 mb-2">
                            <strong>Type:</strong> {rel.relationshipType}
                          </p>
                          <p className="text-sm text-[#e7e7e7]/90 mb-2">
                            <strong>Dynamic:</strong> {rel.dynamic}
                          </p>
                          <p className="text-xs text-[#00FF99]">
                            <strong>Premise Relevance:</strong> {rel.premiseRelevance}
                          </p>
                  </div>
                      ))}
                  </div>
              </div>
                )}
              </motion.div>
            )}

            {/* Arcs Tab */}
            {activeTab === 'arcs' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#00FF99]">Narrative Arcs</h2>
                  <button
                    onClick={() => {
                      setAIEditConfig({
                        title: 'AI-Assisted Arc Generation',
                        editType: 'storyArc',
                        currentContent: storyBible.narrativeArcs,
                        onSave: async (content) => {
                          const updatedBible = { ...storyBible, narrativeArcs: content }
                          setStoryBible(updatedBible)
                          await saveStoryBibleData(updatedBible)
                        }
                      })
                      setShowAIEditModal(true)
                    }}
                    className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    title="Get AI assistance for arc ideas"
                  >
                    <span className="text-lg">✨</span>
                    AI Assist
                  </button>
                </div>
                
                {/* Editing Hint */}
                <div className="mb-6 bg-[#2a2a2a]/50 border-l-4 border-[#00FF99] p-4 rounded-lg">
                  <p className="text-[#e7e7e7]/90 text-sm">
                    💡 <strong>Tip:</strong> You can add or remove arcs to match your story's structure. Each arc can have any number of episodes! Use <strong>AI Assist</strong> for suggestions.
                  </p>
                </div>
                
                {storyBible.narrativeArcs && storyBible.narrativeArcs.length > 0 ? (
                  <div className="space-y-8">
                    {/* Arc Navigation */}
                    <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                      {storyBible.narrativeArcs.map((arc: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentArcIndex(index)}
                          className={`px-3 py-1.5 rounded-full transition-all ${
                            currentArcIndex === index
                              ? 'bg-[#00FF99] text-black font-medium'
                              : 'bg-[#2a2a2a] text-[#e7e7e7]/80 hover:bg-[#36393f]'
                          }`}
                        >
                          Arc {index + 1}: {arc.title}
                        </button>
                      ))}
                      </div>
                      
                      {/* Arc CRUD Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={addNewArc}
                          className="px-4 py-2 bg-[#00FF99] text-black font-bold rounded-lg hover:bg-[#00CC7A] transition-colors flex items-center gap-2"
                          title="Add new arc"
                        >
                          ➕ Add Arc
                        </button>
                        {storyBible.narrativeArcs.length > 1 && !isStoryBibleLocked && (
                          <button
                            onClick={() => deleteArc(currentArcIndex)}
                            className="px-4 py-2 bg-red-500/80 text-white font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                            title="Delete current arc"
                          >
                            🗑️ Delete Arc
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Current Arc */}
                    {storyBible.narrativeArcs[currentArcIndex] && (
                      <motion.div
                        key={currentArcIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        {/* Arc Suggestion Notice */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3 mb-6">
                          <p className="text-blue-200 text-sm">
                            💡 <strong>Arc suggestions are starting points:</strong> These automated suggestions guide your story, 
                            but you control the actual episodes. Use them for inspiration, then create episodes your way in the Episode Studio!
                          </p>
                        </div>

                        <div className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            {editingField?.type === 'arc' && editingField?.index === currentArcIndex && editingField?.field === 'title' ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="text-2xl font-bold bg-[#1a1a1a] border-2 border-[#00FF99] rounded-lg px-3 py-2 text-[#00FF99] flex-1"
                                  autoFocus
                                />
                                <button onClick={saveEdit} className="bg-[#00FF99] text-black px-3 py-2 rounded-lg font-bold">✓</button>
                                <button onClick={cancelEditing} className="bg-red-500 text-white px-3 py-2 rounded-lg font-bold">✕</button>
                              </div>
                            ) : (
                              <>
                                <h3 className="text-2xl font-bold text-[#00FF99]">
                            {storyBible.narrativeArcs[currentArcIndex].title}
                          </h3>
                                <button
                                  onClick={() => startEditing('arc', 'title', storyBible.narrativeArcs[currentArcIndex].title, currentArcIndex)}
                                  className="text-white/50 hover:text-[#00FF99] transition-colors"
                                  title="Edit arc title"
                                >
                                  ✏️
                                </button>
                              </>
                            )}
                          </div>
                          <p className="text-[#e7e7e7]/90 mb-6">
                            {storyBible.narrativeArcs[currentArcIndex].summary}
                          </p>
                          
                          {/* Episodes in this arc */}
                          {storyBible.narrativeArcs[currentArcIndex].episodes && 
                           storyBible.narrativeArcs[currentArcIndex].episodes.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-[#00FF99]">Episodes</h4>
                                <button
                                  onClick={() => addEpisodeToArc(currentArcIndex)}
                                  className="px-3 py-1 bg-[#00FF99] text-black text-sm font-bold rounded-lg hover:bg-[#00CC7A] transition-colors"
                                  title="Add episode to this arc"
                                >
                                  ➕ Add Episode
                                </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {storyBible.narrativeArcs[currentArcIndex].episodes.map((episode: any, episodeIndex: number) => (
                                  <div 
                                    key={episodeIndex}
                                    className="bg-[#1e1e1e] border border-[#36393f] rounded-lg p-4 hover:border-[#00FF9940] transition-colors relative group"
                                  >
                                    <div className="flex justify-between items-center mb-2">
                                      <h5 className="font-medium text-[#00FF99]">Episode {episode.number}</h5>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-[#e7e7e7]/50">{`${currentArcIndex * 10 + episodeIndex + 1}/60`}</span>
                                        {storyBible.narrativeArcs[currentArcIndex].episodes.length > 1 && !isStoryBibleLocked && (
                                          <button
                                            onClick={() => deleteEpisodeFromArc(currentArcIndex, episodeIndex)}
                                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all text-xs px-1 py-0.5 bg-red-500/10 rounded"
                                            title="Delete episode"
                                          >
                                            🗑️
                                          </button>
                                      )}
                                    </div>
                                      </div>
                                    <div className="flex items-center gap-2 mb-2">
                                      {editingField?.type === 'episode' && editingField?.index === `${currentArcIndex}-${episodeIndex}` && editingField?.field === 'title' ? (
                                        <div className="flex items-center gap-2 flex-1">
                                          <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="text-sm font-medium bg-[#2a2a2a] border border-[#00FF99] rounded px-2 py-1 text-white flex-1"
                                            autoFocus
                                          />
                                          <button onClick={saveEdit} className="bg-[#00FF99] text-black px-2 py-1 rounded text-xs font-bold">✓</button>
                                          <button onClick={cancelEditing} className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">✕</button>
                                        </div>
                                      ) : (
                                        <>
                                          <h6 className="font-medium flex-1">{episode.title}</h6>
                                          <button
                                            onClick={() => startEditing('episode', 'title', episode.title, `${currentArcIndex}-${episodeIndex}` as string)}
                                            className="text-white/30 hover:text-[#00FF99] transition-colors text-xs"
                                            title="Edit episode title"
                                          >
                                            ✏️
                                          </button>
                                        </>
                                      )}
                                    </div>
                                    <p className="text-sm text-[#e7e7e7]/70">{episode.summary}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#e7e7e7]/50">
                    No narrative arc information available
                  </div>
                )}
              </div>
            )}

            {/* World Building Tab */}
            {activeTab === 'world' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#00FF99]">World Building</h2>
                  <button
                    onClick={() => {
                      setAIEditConfig({
                        title: 'AI-Assisted World Building',
                        editType: 'worldBuilding',
                        currentContent: storyBible.worldBuilding,
                        onSave: async (content) => {
                          const updatedBible = { ...storyBible, worldBuilding: content }
                          setStoryBible(updatedBible)
                          await saveStoryBibleData(updatedBible)
                        }
                      })
                      setShowAIEditModal(true)
                    }}
                    className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    title="Get AI assistance for world building"
                  >
                    <span className="text-lg">✨</span>
                    AI Assist
                  </button>
                </div>
                
                {/* Editing Hint */}
                <div className="mb-6 bg-[#2a2a2a]/50 border-l-4 border-[#00FF99] p-4 rounded-lg">
                  <p className="text-[#e7e7e7]/90 text-sm">
                    💡 <strong>Tip:</strong> You can add or remove world elements like locations, factions, and rules. Use <strong>AI Assist</strong> for creative suggestions!
                  </p>
                </div>
                
                {storyBible.worldBuilding ? (
                  <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-semibold text-[#00FF99] mb-3">Setting</h3>
                        <p className="text-[#e7e7e7]/90 bg-[#2a2a2a] p-4 rounded-lg border border-[#36393f]">
                        {getContentOrFallback(storyBible.worldBuilding, 'setting')}
                        </p>
                      </div>
                    
                      <div>
                        <h3 className="text-xl font-semibold text-[#00FF99] mb-3">Rules of the World</h3>
                        {Array.isArray(storyBible.worldBuilding.rules) ? (
                          <ul className="list-disc pl-6 text-[#e7e7e7]/90 bg-[#2a2a2a] p-4 rounded-lg border border-[#36393f] space-y-1">
                            {storyBible.worldBuilding.rules.map((r: string, i: number) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[#e7e7e7]/90 bg-[#2a2a2a] p-4 rounded-lg border border-[#36393f]">
                            {getContentOrFallback(storyBible.worldBuilding, 'rules')}
                          </p>
                        )}
                      </div>
                    
                    {storyBible.worldBuilding.locations && storyBible.worldBuilding.locations.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-semibold text-[#00FF99]">Key Locations</h3>
                          <button
                            onClick={() => addWorldElement('locations')}
                            className="px-3 py-1 bg-[#00FF99] text-black font-bold text-sm rounded-lg hover:bg-[#00CC7A] transition-colors"
                            title="Add new location"
                          >
                            ➕ Add Location
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {storyBible.worldBuilding.locations.map((location: any, index: number) => (
                            <div 
                              key={index}
                              className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4 space-y-2 relative group"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-[#00FF99]">{location.name}</h4>
                                {!isStoryBibleLocked && (
                                  <button
                                    onClick={() => deleteWorldElement('locations', index)}
                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all text-xs px-2 py-1 bg-red-500/10 rounded"
                                    title="Delete location"
                                  >
                                    🗑️
                                  </button>
                                )}
                                {location.type && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-[#1a1a1a] border border-[#36393f] text-[#e7e7e7]/70">
                                    {location.type}
                                  </span>
                                )}
                              </div>
                              {location.significance && (
                                <p className="text-xs text-[#e7e7e7]/60">{location.significance}</p>
                              )}
                              {location.description && (
                                <p className="text-sm text-[#e7e7e7]/80">{location.description}</p>
                              )}
                              {Array.isArray(location.recurringEvents) && location.recurringEvents.length > 0 && (
                                <div className="text-xs text-[#e7e7e7]/70">
                                  <span className="font-semibold text-[#00FF99]">Recurring Events:</span>
                                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                                    {location.recurringEvents.map((e: string, i: number) => <li key={i}>{e}</li>)}
                                  </ul>
                                </div>
                              )}
                              {Array.isArray(location.conflicts) && location.conflicts.length > 0 && (
                                <div className="text-xs text-[#e7e7e7]/70">
                                  <span className="font-semibold text-[#00FF99]">Conflicts:</span>
                                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                                    {location.conflicts.map((c: string, i: number) => <li key={i}>{c}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#e7e7e7]/50">
                    No world building information available
                  </div>
                )}
              </div>
            )}

            {/* Choices Tab */}
            {activeTab === 'choices' && (
              <div>
                <h2 className="text-2xl font-bold text-[#00FF99] mb-6">Your Story Journey</h2>
                
                {storyBible.episodesGenerated && storyBible.episodesGenerated > 0 ? (
                  <div className="space-y-8">
                    {/* Progress Overview */}
                    <div className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-[#00FF99] mb-4">Story Progress</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-[#1e1e1e] rounded-lg">
                          <div className="text-2xl font-bold text-[#00FF99] mb-1">
                            {storyBible.episodesGenerated}
                          </div>
                          <div className="text-sm text-[#e7e7e7]/70">Episodes Generated</div>
                        </div>
                        <div className="text-center p-4 bg-[#1e1e1e] rounded-lg">
                          <div className="text-2xl font-bold text-[#00FF99] mb-1">
                            {storyBible.fanChoices?.length || 0}
                          </div>
                          <div className="text-sm text-[#e7e7e7]/70">Choices Made</div>
                        </div>
                        <div className="text-center p-4 bg-[#1e1e1e] rounded-lg">
                          <div className="text-2xl font-bold text-[#00FF99] mb-1">
                            {(storyBible.newCharacters?.length || 0) + (storyBible.newLocations?.length || 0)}
                          </div>
                          <div className="text-sm text-[#e7e7e7]/70">New Elements Added</div>
                        </div>
                      </div>
                    </div>

                    {/* Fan Choices */}
                    {storyBible.fanChoices && storyBible.fanChoices.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-[#00FF99] mb-4">Your Decisions</h3>
                        <div className="space-y-4">
                          {storyBible.fanChoices.map((choice: any, index: number) => (
                            <div key={index} className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-[#00FF99]">Episode {choice.episode}</span>
                                <span className="text-xs text-[#e7e7e7]/50">Your Choice</span>
                              </div>
                              <p className="text-[#e7e7e7]/90 mb-2">{choice.choice}</p>
                              <p className="text-sm text-[#e7e7e7]/70 italic">{choice.impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Characters */}
                    {storyBible.newCharacters && storyBible.newCharacters.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-[#00FF99] mb-4">Characters Introduced Through Your Journey</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {storyBible.newCharacters.map((character: any, index: number) => (
                            <div key={index} className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-[#00FF99]">{character.name}</h4>
                                <span className="text-xs text-[#e7e7e7]/50">Episode {character.introducedInEpisode}</span>
                              </div>
                              <p className="text-sm text-[#e7e7e7]/80">{character.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Locations */}
                    {storyBible.newLocations && storyBible.newLocations.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-[#00FF99] mb-4">New Locations Discovered</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {storyBible.newLocations.map((location: any, index: number) => (
                            <div key={index} className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-[#00FF99]">{location.name}</h4>
                                <span className="text-xs text-[#e7e7e7]/50">Episode {location.introducedInEpisode}</span>
                              </div>
                              <p className="text-sm text-[#e7e7e7]/80">{location.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Story Evolution */}
                    {storyBible.storyEvolution && storyBible.storyEvolution.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-[#00FF99] mb-4">Story Evolution</h3>
                        <div className="space-y-4">
                          {storyBible.storyEvolution.map((evolution: any, index: number) => (
                            <div key={index} className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-[#00FF99]">Episode {evolution.episode}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  evolution.type === 'callback' 
                                    ? 'bg-blue-500/20 text-blue-300' 
                                    : 'bg-purple-500/20 text-purple-300'
                                }`}>
                                  {evolution.type === 'callback' ? 'Callback' : 'Foreshadowing'}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {evolution.elements.map((element: string, elemIndex: number) => (
                                  <p key={elemIndex} className="text-sm text-[#e7e7e7]/80">• {element}</p>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-[#e7e7e7]/50 mb-4">No episodes generated yet</div>
                    <p className="text-sm text-[#e7e7e7]/70">
                      Start generating episodes to see how your choices shape the story!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Technical Tabs Content */}
            {/* Tension Analysis Tab */}
            {activeTab === 'tension' && storyBible.tensionStrategy && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#00FF99] flex items-center">
                  ⚡ Tension Escalation Analysis
                  <span className="ml-3 text-sm bg-[#00FF99]/20 text-[#00FF99] px-2 py-1 rounded-lg border border-[#00FF99]/30">
                    Auto-Generated
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Tension Curve</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tensionStrategy, 'tensionCurve')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Climax Points</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tensionStrategy, 'climaxPoints')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Release Moments</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tensionStrategy, 'releaseMoments')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Escalation Techniques</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tensionStrategy, 'escalationTechniques')}</p>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] border border-[#00FF99]/30 rounded-lg p-4">
                  <h3 className="text-[#00FF99] font-bold mb-3">Emotional Beats</h3>
                  <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tensionStrategy, 'emotionalBeats')}</p>
                </div>
              </div>
            )}

            {/* Choice Architecture Tab */}
            {activeTab === 'choice-arch' && storyBible.choiceArchitecture && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#00FF99] flex items-center">
                  🎯 Choice Architecture Analysis
                  <span className="ml-3 text-sm bg-[#00FF99]/20 text-[#00FF99] px-2 py-1 rounded-lg border border-[#00FF99]/30">
                    Auto-Generated
                  </span>
                </h2>
                <div className="space-y-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Key Decisions</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.choiceArchitecture, 'keyDecisions')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Moral Choices</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.choiceArchitecture, 'moralChoices')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Consequence Mapping</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.choiceArchitecture, 'consequenceMapping')}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#1a1a1a] border border-[#00FF99]/30 rounded-lg p-4">
                      <h3 className="text-[#00FF99] font-bold mb-3">Character Growth</h3>
                      <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.choiceArchitecture, 'characterGrowth')}</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#00FF99]/30 rounded-lg p-4">
                      <h3 className="text-[#00FF99] font-bold mb-3">Thematic Choices</h3>
                      <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.choiceArchitecture, 'thematicChoices')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Living World Tab */}
            {activeTab === 'living-world' && storyBible.livingWorldDynamics && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#00FF99] flex items-center">
                  🌍 Living World Dynamics
                  <span className="ml-3 text-sm bg-[#00FF99]/20 text-[#00FF99] px-2 py-1 rounded-lg border border-[#00FF99]/30">
                    Auto-Generated
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Background Events</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.livingWorldDynamics, 'backgroundEvents')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Social Dynamics</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.livingWorldDynamics, 'socialDynamics')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Economic Factors</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.livingWorldDynamics, 'economicFactors')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Political Undercurrents</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.livingWorldDynamics, 'politicalUndercurrents')}</p>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] border border-[#00FF99]/30 rounded-lg p-4">
                  <h3 className="text-[#00FF99] font-bold mb-3">Cultural Shifts</h3>
                  <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.livingWorldDynamics, 'culturalShifts')}</p>
                </div>
              </div>
            )}

            {/* Trope Analysis Tab */}
            {activeTab === 'trope' && storyBible.tropeAnalysis && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#00FF99] flex items-center">
                  📖 Trope Analysis
                  <span className="ml-3 text-sm bg-[#00FF99]/20 text-[#00FF99] px-2 py-1 rounded-lg border border-[#00FF99]/30">
                    Auto-Generated
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Genre Tropes Used</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tropeAnalysis, 'genreTropes')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Subverted Tropes</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tropeAnalysis, 'subvertedTropes')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Original Elements</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tropeAnalysis, 'originalElements')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Audience Expectations</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tropeAnalysis, 'audienceExpectations')}</p>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] border border-[#00FF99]/30 rounded-lg p-4">
                  <h3 className="text-[#00FF99] font-bold mb-3">Innovative Twists</h3>
                  <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.tropeAnalysis, 'innovativeTwists')}</p>
                </div>
              </div>
            )}

            {/* Cohesion Analysis Tab */}
            {activeTab === 'cohesion' && storyBible.cohesionAnalysis && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#00FF99] flex items-center">
                  🔗 Cohesion Analysis
                  <span className="ml-3 text-sm bg-[#00FF99]/20 text-[#00FF99] px-2 py-1 rounded-lg border border-[#00FF99]/30">
                    Auto-Generated
                  </span>
                </h2>
                <div className="space-y-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Narrative Cohesion</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.cohesionAnalysis, 'narrativeCohesion')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Thematic Continuity</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.cohesionAnalysis, 'thematicContinuity')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Character Arcs</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.cohesionAnalysis, 'characterArcs')}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#1a1a1a] border border-[#00FF99]/30 rounded-lg p-4">
                      <h3 className="text-[#00FF99] font-bold mb-3">Plot Consistency</h3>
                      <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.cohesionAnalysis, 'plotConsistency')}</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#00FF99]/30 rounded-lg p-4">
                      <h3 className="text-[#00FF99] font-bold mb-3">Emotional Journey</h3>
                      <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.cohesionAnalysis, 'emotionalJourney')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dialogue Strategy Tab */}
            {activeTab === 'dialogue' && storyBible.dialogueStrategy && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#00FF99] flex items-center">
                  🗣️ Dialogue Strategy
                  <span className="ml-3 text-sm bg-[#00FF99]/20 text-[#00FF99] px-2 py-1 rounded-lg border border-[#00FF99]/30">
                    Auto-Generated
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Character Voice</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.dialogueStrategy, 'characterVoice')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Conflict Dialogue</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.dialogueStrategy, 'conflictDialogue')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Subtext</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.dialogueStrategy, 'subtext')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Speech Patterns</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.dialogueStrategy, 'speechPatterns')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Genre Enhancement Tab */}
            {activeTab === 'genre' && storyBible.genreEnhancement && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#00FF99] flex items-center">
                  🎭 Genre Enhancement
                  <span className="ml-3 text-sm bg-[#00FF99]/20 text-[#00FF99] px-2 py-1 rounded-lg border border-[#00FF99]/30">
                    Auto-Generated
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Visual Style</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.genreEnhancement, 'visualStyle')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Pacing</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.genreEnhancement, 'pacing')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Tropes</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.genreEnhancement, 'tropes')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Audience Expectations</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.genreEnhancement, 'audienceExpectations')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Integration Tab */}
            {activeTab === 'theme' && storyBible.themeIntegration && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#00FF99] flex items-center">
                  🎯 Theme Integration
                  <span className="ml-3 text-sm bg-[#00FF99]/20 text-[#00FF99] px-2 py-1 rounded-lg border border-[#00FF99]/30">
                    Auto-Generated
                  </span>
                </h2>
                <div className="space-y-6">
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Character Integration</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.themeIntegration, 'characterIntegration')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Plot Integration</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.themeIntegration, 'plotIntegration')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Symbolic Elements</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.themeIntegration, 'symbolicElements')}</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4">
                    <h3 className="text-[#00FF99] font-bold mb-3">Resolution Strategy</h3>
                    <p className="text-[#e7e7e7]/90">{getContentOrFallback(storyBible.themeIntegration, 'resolutionStrategy')}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Professional Call-to-Action */}
        <motion.div 
          className="text-center space-y-8 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {/* Motivational Text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="rebellious-card p-8 max-w-3xl mx-auto"
          >
            <h3 className="text-2xl md:text-3xl font-bold font-medium mb-4">
              ✨ YOUR SERIES AWAITS
            </h3>
            <p className="text-lg text-white/90 font-medium">
              The foundation is set. Now <span className="text-[#00FF99] font-bold">launch your series</span> and bring your creative vision to life.
            </p>
          </motion.div>
          
          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <motion.button
              onClick={async () => {
                if (!storyBible) {
                  console.error('No story bible to save')
                  return
                }
                
                // Save story bible before navigating
                console.log('💾 Saving story bible before navigating to workspace...')
                const savedBible = await saveStoryBibleData(storyBible)
                
                // Navigate to workspace with story bible ID
                const bibleId = savedBible?.id || storyBible.id
                console.log('✅ Navigating to workspace with ID:', bibleId)
                router.push(`/workspace?id=${bibleId}`)
              }}
              className="bg-gradient-to-r from-[#00FF99] to-[#00CC7A] text-black px-10 py-4 text-xl font-bold rounded-lg hover:shadow-lg transition-all"
              whileHover={{ 
                scale: 1.05, 
                y: -3,
                boxShadow: "0 15px 40px rgba(214, 40, 40, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 font-medium">LET'S WRITE THE STORY</span>
            </motion.button>
          </motion.div>
          
          {/* Auto-Generation Notice */}
          <motion.div 
            className="pt-8 pb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-3 max-w-2xl mx-auto">
              <p className="text-orange-200 text-sm text-center">
                ⚠️ <strong>Auto-generated content may not be perfect!</strong> Use the ✏️ buttons to edit names, titles, or descriptions. 
                Not happy with the results? You have <strong>{regenerationsRemaining} regeneration{regenerationsRemaining !== 1 ? 's' : ''}</strong> remaining.
              </p>
            </div>
          </motion.div>

          {/* Import/Export Section */}
          <motion.div 
            className="pt-4 pb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            <div className="bg-gradient-to-r from-black/40 via-black/60 to-black/40 backdrop-blur-sm border border-[#00FF99]/20 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-[#00FF99] to-[#00CC7A] bg-clip-text text-transparent">
                Story Bible Management
              </h3>
              
              <div className="flex justify-center gap-4 flex-wrap">
                <motion.button
                  onClick={exportStoryBible}
                  className="group relative bg-gradient-to-r from-[#00FF99] to-[#00CC7A] text-black px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-[#00FF99]/25 transition-all duration-300 flex items-center gap-3 overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Export as JSON backup"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="text-xl">💾</span>
                  <span className="relative z-10">Export Story Bible</span>
                </motion.button>
                
                <motion.label 
                  className="group relative bg-gradient-to-r from-[#00CC7A] to-[#00FF99] text-black px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-[#00CC7A]/25 transition-all duration-300 flex items-center gap-3 cursor-pointer overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="text-xl">📥</span>
                  <span className="relative z-10">Import Story Bible</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importStoryBible}
                    className="hidden"
                  />
                </motion.label>
              </div>
              
              <p className="text-center text-white/60 text-sm mt-4">
                Backup your story bible or import from previous sessions
              </p>
            </div>
          </motion.div>

          {/* Professional Footer */}
          <motion.div 
            className="pt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
          >
            <p className="text-white/50 text-sm font-medium">
              No gatekeepers • No committees • <span className="text-[#00FF99]">60% ownership guaranteed</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
      {/* Share Modal */}
      {user && storyBible && (
        <ShareStoryBibleModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          storyBible={storyBible}
          ownerId={user.id}
          ownerName={user.displayName || user.email || 'Unknown User'}
        />
      )}

      {/* Character Creation Wizard */}
      <CharacterCreationWizard
        isOpen={showCharacterWizard}
        onClose={() => setShowCharacterWizard(false)}
        onComplete={handleWizardComplete}
        storyBible={storyBible}
      />

      {/* AI Edit Modal */}
      {aiEditConfig && (
        <AIEditModal
          isOpen={showAIEditModal}
          onClose={() => {
            setShowAIEditModal(false)
            setAIEditConfig(null)
          }}
          title={aiEditConfig.title}
          editType={aiEditConfig.editType}
          currentContent={aiEditConfig.currentContent}
          context={storyBible}
          onSave={(content) => {
            aiEditConfig.onSave(content)
            setShowAIEditModal(false)
            setAIEditConfig(null)
          }}
        />
      )}
      
      {/* Auth Status Modal - Show when not logged in and hasn't skipped */}
      {!user && !hasSkippedLogin && (
        <AuthStatusModal
          onSkip={() => setHasSkippedLogin(true)}
        />
      )}
    </motion.div>
  )
} 