 'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from '@/components/ui/ClientMotion'
import Image from 'next/image'
import AnimatedBackground from '@/components/AnimatedBackground'
import StoryBiblePlaybookModal from '@/components/StoryBiblePlaybookModal'
import ShareStoryBibleModal from '@/components/share/ShareStoryBibleModal'
import ShareInvestorMaterialsModal from '@/components/share/ShareInvestorMaterialsModal'
import AuthStatusModal from '@/components/auth/AuthStatusModal'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { saveStoryBible as saveStoryBibleToFirestore, getStoryBible as getStoryBibleFromFirestore, StoryBibleStatus, extendSeriesWithArc } from '@/services/story-bible-service'
import { updateStoryBibleFields, updateLockStatus } from '@/services/story-bible-firestore'
import { versionControl } from '@/services/version-control'
import { storyBibleLock } from '@/services/story-bible-lock'
import { exportAsJSON, copyAsText, downloadMarkdown } from '@/utils/export-story-bible'
import CollapsibleSection, { isSectionEmpty } from '@/components/ui/CollapsibleSection'
import CharacterCreatorModal from '@/components/modals/CharacterCreatorModal'
import CharacterUpgradeModal from '@/components/character-creator/CharacterUpgradeModal'
import AIEditModal from '@/components/modals/AIEditModal'
import StoryBibleSidebar, { StoryBibleSection } from '@/components/story-bible/StoryBibleSidebar'
import CharacterDetailModal from '@/components/story-bible/CharacterDetailModal'
import GlobalThemeToggle from '@/components/navigation/GlobalThemeToggle'
import StoryBibleImage from '@/components/story-bible/StoryBibleImage'
import GenerateImagesModal from '@/components/story-bible/GenerateImagesModal'
import MarketingSection from '@/components/story-bible/MarketingSection'
import { EditableField } from '@/components/preproduction/shared/EditableField'

export default function StoryBiblePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const [storyBible, setStoryBible] = useState<any>(null)
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 Story Bible Page Debug:');
    console.log('  - User:', user ? `${user.displayName || user.email} (${user.id})` : 'null');
    console.log('  - Story Bible loaded:', !!storyBible);
    console.log('  - Share button should be:', (!user || !storyBible) ? 'DISABLED' : 'ENABLED');
  }, [user, storyBible])
  // Use StoryBibleSection type for active section
  const [activeSection, setActiveSection] = useState<StoryBibleSection>('overview')
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0)
  const [currentArcIndex, setCurrentArcIndex] = useState(0)
  const [showCharacterModal, setShowCharacterModal] = useState(false)
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState<number | null>(null)
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
  const [showInvestorShareModal, setShowInvestorShareModal] = useState(false)
  const [selectedArcIndex, setSelectedArcIndex] = useState(0)
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [hasSkippedLogin, setHasSkippedLogin] = useState(false)
  const [storyBibleStatus, setStoryBibleStatus] = useState<StoryBibleStatus>('draft')
  const [showCharacterUpgradeModal, setShowCharacterUpgradeModal] = useState(false)
  const [characterToUpgrade, setCharacterToUpgrade] = useState<any>(null)
  
  // Story Bible lock state (locked after first episode)
  const [isStoryBibleLocked, setIsStoryBibleLocked] = useState(false)
  
  // Image generation state
  const [showGenerateImagesModal, setShowGenerateImagesModal] = useState(false)
  const [generatingImageFor, setGeneratingImageFor] = useState<{type: string, index?: number} | null>(null)

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
      
      // Dispatch custom event to notify ChatWidget to reload
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('storyBibleUpdated'))
      }
      
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
              // Debug: Log character images
              if (firestoreBible.mainCharacters) {
                console.log(`📸 [Load] Found ${firestoreBible.mainCharacters.length} characters`)
                firestoreBible.mainCharacters.forEach((char: any, idx: number) => {
                  if (char.visualReference?.imageUrl) {
                    console.log(`  Character ${idx} (${char.name}): ${char.visualReference.imageUrl.substring(0, 60)}...`)
                  } else {
                    console.log(`  Character ${idx} (${char.name}): NO IMAGE`)
                  }
                })
              }
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
            
            // Ensure storyBible has an ID (required for image generation and other features)
            if (!dynamicStoryBible.id) {
              // Generate a simple ID: sb_timestamp_random
              const timestamp = Date.now()
              const random = Math.random().toString(36).substring(2, 9)
              dynamicStoryBible.id = `sb_${timestamp}_${random}`
              console.log('🆔 Generated ID for story bible:', dynamicStoryBible.id)
            }
            
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
  }, [router, searchParams, user])

  // Auto-open image generation modal for newly generated story bibles with no images
  useEffect(() => {
    if (!storyBible || !storyBible.id || showGenerateImagesModal || !user) return
    
    // Check if story bible has no images
    const hasHeroImage = storyBible.visualAssets?.heroImage?.imageUrl
    const hasCharacterImages = storyBible.mainCharacters?.some((char: any) => char.visualReference?.imageUrl)
    const hasArcImages = storyBible.narrativeArcs?.some((arc: any) => arc.keyArt?.imageUrl)
    const hasLocationImages = storyBible.worldBuilding?.locations?.some((loc: any) => loc.conceptArt?.imageUrl)
    
    const hasNoImages = !hasHeroImage && !hasCharacterImages && !hasArcImages && !hasLocationImages
    
    if (!hasNoImages) return // Has images, don't auto-open
    
    // Check if this story bible was just generated (via sessionStorage flag)
    const wasJustGenerated = sessionStorage.getItem(`story-bible-just-generated-${storyBible.id}`)
    
    if (wasJustGenerated) {
      console.log('🎨 Newly generated story bible detected with no images - opening image generation modal')
      // Clear the flag so it doesn't trigger again
      sessionStorage.removeItem(`story-bible-just-generated-${storyBible.id}`)
      // Small delay to ensure page is fully loaded
      const timeoutId = setTimeout(() => {
        setShowGenerateImagesModal(true)
      }, 1500)
      
      return () => clearTimeout(timeoutId)
    }
  }, [storyBible?.id, user, showGenerateImagesModal]) // Only depend on ID to avoid re-triggering

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
      // Calculate episode ranges dynamically based on actual arc episode counts
      let runningEpisodeCount = 0
      updatedBible.narrativeArcs = updatedBible.narrativeArcs.map((arc: any, arcIndex: number) => {
        const arcEpisodeCount = arc.episodes?.length || 8
        const arcStartEpisode = runningEpisodeCount + 1
        const arcEndEpisode = runningEpisodeCount + arcEpisodeCount
        const arcEpisodes = episodes.filter(ep => 
          ep.episodeNumber >= arcStartEpisode && ep.episodeNumber <= arcEndEpisode
        )
        
        // Update running count for next arc
        runningEpisodeCount += arcEpisodeCount

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
            // Calculate the actual episode number based on arc start and episode index
            const episodeNumberInSeries = arcStartEpisode + (episodeInfo.number - 1)
            const actualEpisode = arcEpisodes.find(ep => ep.episodeNumber === episodeNumberInSeries)
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
        body: JSON.stringify({ 
          synopsis, 
          theme,
          // Do NOT auto-generate images; user triggers manually
          generateImages: false,
          userId: user?.id
        })
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

        // Set flag to indicate story bible was just regenerated (for auto-opening image modal)
        if (data.storyBible.id) {
          sessionStorage.setItem(`story-bible-just-generated-${data.storyBible.id}`, 'true')
          console.log('🎨 Set flag for auto-opening image generation modal after regeneration')
        }

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
  
  // Handler for completing character creator
  const handleWizardComplete = async (character: any) => {
    if (!storyBible) return

    console.log('🎭 [WIZARD COMPLETE] Received character from creator:', {
      name: character.name,
      hasDetailed: !!character.detailed,
      hasBalanced: !!character.balanced,
      detailedKeys: character.detailed ? Object.keys(character.detailed) : [],
      balancedKeys: character.balanced ? Object.keys(character.balanced) : [],
      physiologyPreview: character.detailed?.fullPhysiology ? {
        age: character.detailed.fullPhysiology.age,
        gender: character.detailed.fullPhysiology.gender,
        appearance: character.detailed.fullPhysiology.appearance?.substring(0, 50)
      } : character.balanced?.physiology ? {
        age: character.balanced.physiology.age,
        gender: character.balanced.physiology.gender,
        appearance: character.balanced.physiology.appearance?.substring(0, 50)
      } : null
    })

    // Convert unified character to old format for backward compatibility
    const oldFormatCharacter = convertUnifiedToOldFormat(character)

    console.log('🎭 [WIZARD COMPLETE] Converted character structure:', {
      name: oldFormatCharacter.name,
      hasPhysiology: !!oldFormatCharacter.physiology,
      hasSociology: !!oldFormatCharacter.sociology,
      hasPsychology: !!oldFormatCharacter.psychology,
      physiologyKeys: oldFormatCharacter.physiology ? Object.keys(oldFormatCharacter.physiology) : [],
      sociologyKeys: oldFormatCharacter.sociology ? Object.keys(oldFormatCharacter.sociology) : [],
      psychologyKeys: oldFormatCharacter.psychology ? Object.keys(oldFormatCharacter.psychology) : [],
      physiologyAge: oldFormatCharacter.physiology?.age,
      physiologyGender: oldFormatCharacter.physiology?.gender,
      physiologyAppearance: oldFormatCharacter.physiology?.appearance?.substring(0, 50),
      sociologyOccupation: oldFormatCharacter.sociology?.occupation || oldFormatCharacter.sociology?.profession?.occupation,
      psychologyWant: typeof oldFormatCharacter.psychology?.want === 'string' 
        ? oldFormatCharacter.psychology.want.substring(0, 50)
        : oldFormatCharacter.psychology?.want?.consciousGoal?.substring(0, 50)
    })

    const updatedCharacters = [...(storyBible.mainCharacters || [])]
    updatedCharacters.push(oldFormatCharacter)

    const updatedBible = { ...storyBible, mainCharacters: updatedCharacters }
    
    console.log('💾 [WIZARD COMPLETE] Saving to Firestore, character count:', updatedCharacters.length)
    
    setStoryBible(updatedBible)
    await saveStoryBibleData(updatedBible)

    console.log('✅ [WIZARD COMPLETE] Character saved successfully')

    setCurrentCharacterIndex(updatedCharacters.length - 1)
    setShowCharacterWizard(false)
  }

  // Handler for character upgrade
  const handleCharacterUpgrade = async (upgradedCharacter: any) => {
    if (!storyBible || !characterToUpgrade) return

    // Convert upgraded unified character to old format
    const oldFormatCharacter = convertUnifiedToOldFormat(upgradedCharacter)

    const updatedCharacters = [...(storyBible.mainCharacters || [])]
    const characterIndex = updatedCharacters.findIndex(c => c.id === characterToUpgrade.id)
    if (characterIndex !== -1) {
      updatedCharacters[characterIndex] = oldFormatCharacter
    }

    const updatedBible = { ...storyBible, mainCharacters: updatedCharacters }
    setStoryBible(updatedBible)
    await saveStoryBibleData(updatedBible)

    setCharacterToUpgrade(null)
    setShowCharacterUpgradeModal(false)
  }

  // Handler to open upgrade modal
  const handleOpenUpgradeModal = (character: any) => {
    setCharacterToUpgrade(character)
    setShowCharacterUpgradeModal(true)
  }

  // Convert unified character format to old format
  const convertUnifiedToOldFormat = (unified: any) => {
    console.log('🔄 [CONVERT] Converting UnifiedCharacter to old format:', {
      hasDetailed: !!unified.detailed,
      hasBalanced: !!unified.balanced,
      hasDetailedPhysiology: !!unified.detailed?.fullPhysiology,
      hasDetailedSociology: !!unified.detailed?.fullSociology,
      hasDetailedPsychology: !!unified.detailed?.fullPsychology,
      hasBalancedPhysiology: !!unified.balanced?.physiology,
      hasBalancedPsychology: !!unified.balanced?.psychology
    })

    const oldCharacter: any = {
      id: unified.id,
      name: unified.name,
      archetype: unified.basic?.archetype,
      premiseFunction: unified.basic?.premiseFunction,
      premiseRole: unified.role,
      role: unified.role,
      description: unified.basic?.description
    }

    // PRIORITIZE detailed data (most complete), but merge with balanced if detailed doesn't exist
    if (unified.detailed) {
      // Use detailed data (most complete)
      // Flatten nested structures to match UI expectations
      const fullPhysiology = unified.detailed.fullPhysiology || unified.balanced?.physiology || {}
      oldCharacter.physiology = {
        ...fullPhysiology,
        // Ensure age is a string if it's a number (UI expects string)
        age: fullPhysiology.age !== undefined ? String(fullPhysiology.age) : undefined
      }

      // Flatten sociology structure - UI expects flat fields, not nested
      const fullSociology = unified.detailed.fullSociology || {}
      // Extract occupation - check multiple possible locations
      const occupation = fullSociology.occupation || 
                        fullSociology.profession?.occupation || 
                        (typeof fullSociology.profession === 'string' ? fullSociology.profession : '') ||
                        ''
      // Extract class - check multiple possible locations
      const classValue = fullSociology.class || 
                        fullSociology.socialClass?.economic || 
                        (typeof fullSociology.socialClass === 'string' ? fullSociology.socialClass : '') ||
                        ''
      
      oldCharacter.sociology = {
        ...fullSociology,
        // CRITICAL: Explicitly set occupation and class to ensure they're present
        occupation: occupation,
        class: classValue,
        // Keep education as-is (can be string or object)
        education: fullSociology.education || {},
        // Flatten other nested fields
        homeLife: fullSociology.homeLife || '',
        economicStatus: fullSociology.economicStatus || fullSociology.socialClass?.economic || '',
        communityStanding: fullSociology.communityStanding || ''
      }
      
      // Log for debugging
      console.log('🔍 [CONVERT] Sociology extraction:', {
        hasFullSociology: !!fullSociology,
        occupation: occupation,
        class: classValue,
        professionObject: fullSociology.profession,
        socialClassObject: fullSociology.socialClass
      })

      // Psychology structure - ensure all required fields are mapped
      const fullPsychology = unified.detailed.fullPsychology || unified.balanced?.psychology || {}
      const balancedPsychology = unified.balanced?.psychology || {}
      
      // Log want/need extraction for debugging
      console.log('🔍 [CONVERT] Extracting want/need:', {
        fullPsychologyWant: fullPsychology.want,
        fullPsychologyNeed: fullPsychology.need,
        balancedPsychologyWant: balancedPsychology.want,
        balancedPsychologyNeed: balancedPsychology.need,
        wantType: typeof (fullPsychology.want || balancedPsychology.want),
        needType: typeof (fullPsychology.need || balancedPsychology.need)
      })
      
      oldCharacter.psychology = {
        ...fullPsychology,
        // Ensure coreValue, moralStandpoint, primaryFlaw, temperament, attitude, iq are present
        coreValue: fullPsychology.coreValue,
        moralStandpoint: fullPsychology.moralStandpoint,
        // CRITICAL: Explicitly include want and need - prioritize fullPsychology, fallback to balancedPsychology
        want: fullPsychology.want || balancedPsychology.want,
        need: fullPsychology.need || balancedPsychology.need,
        primaryFlaw: fullPsychology.primaryFlaw,
        temperament: Array.isArray(fullPsychology.temperament) ? fullPsychology.temperament : [],
        attitude: fullPsychology.attitude,
        iq: fullPsychology.iq,
        // Ensure fears is an array (UI uses fears[0] for "Top Fear")
        // Check multiple possible locations: fears, keyFears, vulnerabilities.fears
        fears: Array.isArray(fullPsychology.fears) ? fullPsychology.fears : 
               (Array.isArray(fullPsychology.keyFears) ? fullPsychology.keyFears : 
               (Array.isArray(fullPsychology.vulnerabilities?.fears) ? fullPsychology.vulnerabilities.fears : []))
      }
      oldCharacter.characterEvolution = unified.detailed.characterEvolution || []
      oldCharacter.relationships = unified.detailed.relationships || []
    } else if (unified.balanced) {
      // Use balanced data if detailed doesn't exist
      oldCharacter.physiology = {
        ...(unified.balanced.physiology || {}),
        age: unified.balanced.physiology?.age !== undefined ? String(unified.balanced.physiology.age) : undefined
      }
      // Psychology - ensure all required fields are mapped
      const balancedPsychology = unified.balanced.psychology || {}
      oldCharacter.psychology = {
        ...balancedPsychology,
        // Ensure coreValue, moralStandpoint, primaryFlaw, temperament, attitude, iq are present
        coreValue: balancedPsychology.coreValue,
        moralStandpoint: balancedPsychology.moralStandpoint,
        // CRITICAL: Explicitly include want and need - handle both string and object formats
        want: balancedPsychology.want || (typeof balancedPsychology.want === 'object' ? balancedPsychology.want : undefined),
        need: balancedPsychology.need || (typeof balancedPsychology.need === 'object' ? balancedPsychology.need : undefined),
        primaryFlaw: balancedPsychology.primaryFlaw,
        temperament: Array.isArray(balancedPsychology.temperament) ? balancedPsychology.temperament : [],
        attitude: balancedPsychology.attitude,
        iq: balancedPsychology.iq,
        // Ensure fears is an array (UI uses fears[0] for "Top Fear")
        // Check multiple possible locations: fears, keyFears, vulnerabilities.fears
        fears: Array.isArray(balancedPsychology.fears) ? balancedPsychology.fears : 
               (Array.isArray(balancedPsychology.keyFears) ? balancedPsychology.keyFears : 
               (Array.isArray(balancedPsychology.vulnerabilities?.fears) ? balancedPsychology.vulnerabilities.fears : []))
      }
      // NOTE: Balanced mode doesn't have sociology in balanced object, but we generate full 3D characters
      // So detailed.fullSociology should exist. If not, create empty object so UI knows it exists
      const fullSociology = unified.detailed?.fullSociology || {}
      // Extract occupation - check multiple possible locations
      const occupation = fullSociology.occupation || 
                        fullSociology.profession?.occupation || 
                        (typeof fullSociology.profession === 'string' ? fullSociology.profession : '') ||
                        ''
      // Extract class - check multiple possible locations
      const classValue = fullSociology.class || 
                        fullSociology.socialClass?.economic || 
                        (typeof fullSociology.socialClass === 'string' ? fullSociology.socialClass : '') ||
                        ''
      
      oldCharacter.sociology = {
        ...fullSociology,
        // CRITICAL: Explicitly set occupation and class to ensure they're present
        occupation: occupation,
        class: classValue,
        education: fullSociology.education || {},
        homeLife: fullSociology.homeLife || '',
        economicStatus: fullSociology.economicStatus || fullSociology.socialClass?.economic || '',
        communityStanding: fullSociology.communityStanding || ''
      }
    } else {
      // Fallback: create empty objects for all three dimensions
      oldCharacter.physiology = {}
      oldCharacter.sociology = {}
      oldCharacter.psychology = {}
    }

    // Always include backstory and voice from balanced if available
    if (unified.balanced?.backstory) {
      oldCharacter.backstory = unified.balanced.backstory
      oldCharacter.arc = unified.balanced.backstory
    }
    if (unified.balanced?.voiceProfile) {
      oldCharacter.voiceProfile = unified.balanced.voiceProfile
      oldCharacter.speechPattern = unified.balanced.voiceProfile
    }

    // CRITICAL: Ensure all three dimensions exist for 3D character display
    if (!oldCharacter.physiology) {
      console.warn('⚠️ [CONVERT] No physiology found, creating empty object')
      oldCharacter.physiology = {}
    }
    if (!oldCharacter.sociology) {
      console.warn('⚠️ [CONVERT] No sociology found, creating empty object')
      oldCharacter.sociology = {}
    }
    if (!oldCharacter.psychology) {
      console.warn('⚠️ [CONVERT] No psychology found, creating empty object')
      oldCharacter.psychology = {}
    }

    console.log('✅ [CONVERT] Converted character:', {
      name: oldCharacter.name,
      hasPhysiology: !!oldCharacter.physiology,
      hasSociology: !!oldCharacter.sociology,
      hasPsychology: !!oldCharacter.psychology,
      physiologyKeys: oldCharacter.physiology ? Object.keys(oldCharacter.physiology) : [],
      sociologyKeys: oldCharacter.sociology ? Object.keys(oldCharacter.sociology) : [],
      psychologyKeys: oldCharacter.psychology ? Object.keys(oldCharacter.psychology) : [],
      // Show actual data values to verify they're not placeholders
      physiologyData: oldCharacter.physiology ? {
        age: oldCharacter.physiology.age,
        gender: oldCharacter.physiology.gender,
        appearance: oldCharacter.physiology.appearance?.substring(0, 100)
      } : null,
      sociologyData: oldCharacter.sociology ? {
        occupation: oldCharacter.sociology.occupation || oldCharacter.sociology.profession?.occupation,
        education: oldCharacter.sociology.education ? (typeof oldCharacter.sociology.education === 'string' 
          ? oldCharacter.sociology.education.substring(0, 50)
          : oldCharacter.sociology.education.level) : null
      } : null,
      psychologyData: oldCharacter.psychology ? {
        want: typeof oldCharacter.psychology.want === 'string'
          ? oldCharacter.psychology.want.substring(0, 50)
          : oldCharacter.psychology.want?.consciousGoal?.substring(0, 50)
      } : null
    })

    return oldCharacter
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
    
    if (!storyBible || !storyBible.mainCharacters || storyBible.mainCharacters.length <= 1) {
      alert('You must have at least one character.')
      return
    }
    
    const characterName = storyBible.mainCharacters[index]?.name || 'this character'
    if (!confirm(`Are you sure you want to delete "${characterName}"? This cannot be undone.`)) return
    
    const updatedCharacters = storyBible.mainCharacters.filter((_: any, i: number) => i !== index)
    const updatedBible = { ...storyBible, mainCharacters: updatedCharacters }
    setStoryBible(updatedBible)
    await saveStoryBibleData(updatedBible)
    
    // Close modal if deleting the selected character
    if (selectedCharacterIndex === index) {
      setShowCharacterModal(false)
      setSelectedCharacterIndex(null)
    }
    
    // Adjust current index if needed
    if (currentCharacterIndex >= updatedCharacters.length) {
      setCurrentCharacterIndex(Math.max(0, updatedCharacters.length - 1))
    }
  }

  const openCharacterModal = (index: number) => {
    setSelectedCharacterIndex(index)
    setCurrentCharacterIndex(index)
    setShowCharacterModal(true)
  }

  const handleCharacterSave = async (updatedCharacter: any) => {
    if (!storyBible || selectedCharacterIndex === null) return
    
    const updatedCharacters = [...storyBible.mainCharacters]
    updatedCharacters[selectedCharacterIndex] = updatedCharacter
    const updatedBible = { ...storyBible, mainCharacters: updatedCharacters }
    await saveStoryBibleData(updatedBible)
    setStoryBible(updatedBible)
  }

  const getInitials = (name: string) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getCharacterBriefDescription = (character: any) => {
    if (character.description) {
      return character.description.length > 120 
        ? character.description.substring(0, 120) + '...'
        : character.description
    }
    if (character.physiology?.appearance) {
      return character.physiology.appearance.length > 120
        ? character.physiology.appearance.substring(0, 120) + '...'
        : character.physiology.appearance
    }
    if (character.premiseFunction) {
      return character.premiseFunction
    }
    return 'A complex character with hidden motivations and a mysterious past that drives the narrative forward...'
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
  
  // Image generation handlers
  const handleRegenerateImage = async (type: 'hero' | 'character' | 'arc' | 'location', index?: number) => {
    if (!storyBible || !user?.id) return
    
    setGeneratingImageFor({ type, index })
    
    try {
      // Delete old image from Storage before generating new one
      let oldImageUrl: string | null = null
      
      if (type === 'hero' && storyBible.visualAssets?.heroImage?.imageUrl) {
        oldImageUrl = storyBible.visualAssets.heroImage.imageUrl
      } else if (type === 'character' && index !== undefined && storyBible.mainCharacters?.[index]?.visualReference?.imageUrl) {
        oldImageUrl = storyBible.mainCharacters[index].visualReference.imageUrl
      } else if (type === 'arc' && index !== undefined && storyBible.narrativeArcs?.[index]?.keyArt?.imageUrl) {
        oldImageUrl = storyBible.narrativeArcs[index].keyArt.imageUrl
      } else if (type === 'location' && index !== undefined && storyBible.worldBuilding?.locations?.[index]?.conceptArt?.imageUrl) {
        oldImageUrl = storyBible.worldBuilding.locations[index].conceptArt.imageUrl
      }
      
      // Delete old image from Storage if it exists
      if (oldImageUrl) {
        try {
          const { deleteImageFromStorage } = await import('@/services/image-storage-service')
          await deleteImageFromStorage(oldImageUrl)
          console.log(`✅ Old ${type} image deleted from Storage before regeneration`)
        } catch (deleteError: any) {
          console.warn(`⚠️  Failed to delete old image (continuing anyway):`, deleteError.message)
          // Continue with generation even if deletion fails
        }
      }
      
      const sections: ('hero' | 'characters' | 'arcs' | 'world')[] = []
      if (type === 'hero') sections.push('hero')
      else if (type === 'character') sections.push('characters')
      else if (type === 'arc') sections.push('arcs')
      else if (type === 'location') sections.push('world')
      
      const response = await fetch('/api/generate/story-bible-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBibleId: storyBible.id,
          userId: user.id,
          sections,
          regenerate: true,
          // CRITICAL: Always set specificIndex for single image regeneration
          // For hero image, index is undefined but we still want to generate only that specific image
          specificIndex: type === 'hero' 
            ? { type: 'hero', index: 0 }  // Hero image is always index 0
            : index !== undefined 
              ? { type, index } 
              : undefined,
          // Send story bible data as fallback if not in Firestore
          storyBible: storyBible || undefined
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate image')
      }
      
      // Handle SSE stream - update state as images come in
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) throw new Error('No response body')
      
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.substring(6))
            
            // Handle individual image generation - upload to Storage and update state
            if (data.type === 'image-generated' && data.imageData) {
              // Upload to Storage and update state with Storage URL
              const handleImageUpload = async () => {
                try {
                  const { uploadImageToStorage } = await import('@/services/image-storage-service')
                  const { hashPrompt } = await import('@/services/image-cache-service')
                  
                  let imageData = { ...data.imageData }
                  
                  // Upload base64 to Storage if needed
                  if (imageData.imageUrl?.startsWith('data:')) {
                    const context = data.imageType === 'hero' ? 'hero' : 
                                   data.imageType === 'character' ? 'character' : 
                                   data.imageType === 'arc' ? 'arc' : 'location'
                    const promptText = imageData.prompt || `${data.imageType}-${data.itemIndex || 0}`
                    const hash = await hashPrompt(promptText, undefined, context)
                    
                    const storageUrl = await uploadImageToStorage(user.id, imageData.imageUrl, hash)
                    imageData.imageUrl = storageUrl
                    
                    // Save to Firestore
                    const { getStoryBible } = await import('@/services/story-bible-service')
                    const { saveStoryBible } = await import('@/services/story-bible-service')
                    const currentBible = await getStoryBible(storyBible.id, user.id)
                    
                    if (currentBible) {
                      // Determine the path being updated for better error messages
                      let updatingPath: string | undefined
                      
                      if (data.imageType === 'hero') {
                        currentBible.visualAssets = currentBible.visualAssets || {}
                        currentBible.visualAssets.heroImage = imageData
                        updatingPath = 'visualAssets.heroImage'
                      } else if (data.imageType === 'character' && data.itemIndex !== undefined) {
                        // CRITICAL: Ensure mainCharacters array exists and has the character at this index
                        currentBible.mainCharacters = currentBible.mainCharacters || []
                        if (!currentBible.mainCharacters[data.itemIndex]) {
                          console.error(`❌ [Page] Character at index ${data.itemIndex} doesn't exist! Array length: ${currentBible.mainCharacters.length}`)
                          // Create a placeholder if missing
                          currentBible.mainCharacters[data.itemIndex] = { name: `Character ${data.itemIndex + 1}` }
                        }
                        currentBible.mainCharacters[data.itemIndex].visualReference = imageData
                        updatingPath = `mainCharacters[${data.itemIndex}].visualReference`
                        console.log(`✅ [Page] Saved character ${data.itemIndex} visualReference to Firestore:`, imageData.imageUrl?.substring(0, 60))
                      } else if (data.imageType === 'arc' && data.itemIndex !== undefined && currentBible.narrativeArcs) {
                        if (currentBible.narrativeArcs[data.itemIndex]) {
                          currentBible.narrativeArcs[data.itemIndex].keyArt = imageData
                          updatingPath = `narrativeArcs[${data.itemIndex}].keyArt`
                        }
                      } else if (data.imageType === 'location' && data.itemIndex !== undefined && currentBible.worldBuilding?.locations) {
                        if (currentBible.worldBuilding.locations[data.itemIndex]) {
                          currentBible.worldBuilding.locations[data.itemIndex].conceptArt = imageData
                          updatingPath = `worldBuilding.locations[${data.itemIndex}].conceptArt`
                        }
                      }
                      
                      await saveStoryBible(currentBible, user.id, updatingPath)
                      console.log(`✅ [Page] Story bible saved to Firestore with ${data.imageType} image`)
                    } else {
                      console.error(`❌ [Page] Could not load story bible for saving ${data.imageType} image`)
                    }
                  }
                  
                  // Update state with Storage URL
                  setStoryBible((prev: any) => {
                    if (!prev) return prev
                    const updated = { ...prev }
                    
                    if (data.imageType === 'hero') {
                      updated.visualAssets = updated.visualAssets || {}
                      updated.visualAssets.heroImage = imageData
                    } else if (data.imageType === 'character' && data.itemIndex !== undefined && updated.mainCharacters) {
                      if (updated.mainCharacters[data.itemIndex]) {
                        updated.mainCharacters[data.itemIndex].visualReference = imageData
                        console.log(`✅ [Page] Updated character ${data.itemIndex} visualReference:`, imageData.imageUrl?.substring(0, 50))
                      } else {
                        console.error(`❌ [Page] Character ${data.itemIndex} not found in mainCharacters array`)
                      }
                    } else if (data.imageType === 'arc' && data.itemIndex !== undefined && updated.narrativeArcs) {
                      if (updated.narrativeArcs[data.itemIndex]) {
                        updated.narrativeArcs[data.itemIndex].keyArt = imageData
                      }
                    } else if (data.imageType === 'location' && data.itemIndex !== undefined && updated.worldBuilding?.locations) {
                      if (updated.worldBuilding.locations[data.itemIndex]) {
                        updated.worldBuilding.locations[data.itemIndex].conceptArt = imageData
                      }
                    }
                    
                    return updated
                  })
                  
                  // Reload from Firestore immediately to ensure image is displayed
                  if (user && storyBible?.id) {
                    setTimeout(async () => {
                      try {
                        const reloaded = await getStoryBibleFromFirestore(storyBible.id, user.id)
                        if (reloaded) {
                          console.log(`✅ [Page] Reloaded story bible after ${data.imageType} image upload`)
                          setStoryBible(reloaded)
                        }
                      } catch (error) {
                        console.error(`❌ [Page] Error reloading story bible:`, error)
                      }
                    }, 500) // Small delay to ensure Firestore write is complete
                  }
                } catch (error: any) {
                  console.error(`❌ Failed to upload and save ${data.imageType} image:`, error)
                }
              }
              
              // Upload and update state
              handleImageUpload()
            }
            
            if (data.type === 'complete' && data.storyBible) {
              setStoryBible(data.storyBible)
              await saveStoryBibleData(data.storyBible)
              
              // Reload from Firestore to ensure all images are loaded with Storage URLs
              if (user && storyBible?.id) {
                try {
                  const reloaded = await getStoryBibleFromFirestore(storyBible.id, user.id)
                  if (reloaded) {
                    setStoryBible(reloaded)
                    console.log('✅ Story bible reloaded with all images')
                  }
                } catch (error) {
                  console.error('❌ Error reloading story bible:', error)
                }
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Image generation error:', error)
      alert(`Failed to generate image: ${error.message}`)
    } finally {
      setGeneratingImageFor(null)
    }
  }
  
  const handleGenerateImagesComplete = async (updatedBible: any) => {
    // Upload base64 images to Storage (client-side, like storyboards)
    if (user && updatedBible) {
      try {
        const { processImageForStorage } = await import('@/services/image-storage-service')
        const { hashPrompt } = await import('@/services/image-cache-service')
        
        console.log('📤 [Story Bible] Uploading images to Storage client-side...')
        
        // Upload hero image
        if (updatedBible.visualAssets?.heroImage?.imageUrl?.startsWith('data:')) {
          try {
            const hash = await hashPrompt(updatedBible.visualAssets.heroImage.prompt || 'hero', undefined, 'hero')
            updatedBible.visualAssets.heroImage.imageUrl = await processImageForStorage(
              user.id,
              updatedBible.visualAssets.heroImage.imageUrl,
              hash,
              0 // Upload all base64
            )
            console.log('✅ [Story Bible] Hero image uploaded to Storage')
          } catch (error) {
            console.error('❌ [Story Bible] Failed to upload hero image:', error)
          }
        }
        
        // Upload character images
        if (updatedBible.mainCharacters) {
          for (let i = 0; i < updatedBible.mainCharacters.length; i++) {
            const char = updatedBible.mainCharacters[i]
            if (char.visualReference?.imageUrl?.startsWith('data:')) {
              try {
                const hash = await hashPrompt(char.visualReference.prompt || `char-${i}`, undefined, 'character')
                char.visualReference.imageUrl = await processImageForStorage(
                  user.id,
                  char.visualReference.imageUrl,
                  hash,
                  0
                )
                console.log(`✅ [Story Bible] Character ${i} image uploaded to Storage`)
              } catch (error) {
                console.error(`❌ [Story Bible] Failed to upload character ${i} image:`, error)
              }
            }
          }
        }
        
        // Upload arc key art
        if (updatedBible.narrativeArcs) {
          for (let i = 0; i < updatedBible.narrativeArcs.length; i++) {
            const arc = updatedBible.narrativeArcs[i]
            if (arc.keyArt?.imageUrl?.startsWith('data:')) {
              try {
                const hash = await hashPrompt(arc.keyArt.prompt || `arc-${i}`, undefined, 'arc')
                arc.keyArt.imageUrl = await processImageForStorage(
                  user.id,
                  arc.keyArt.imageUrl,
                  hash,
                  0
                )
                console.log(`✅ [Story Bible] Arc ${i} key art uploaded to Storage`)
              } catch (error) {
                console.error(`❌ [Story Bible] Failed to upload arc ${i} key art:`, error)
              }
            }
          }
        }
        
        // Upload location concept art
        if (updatedBible.worldBuilding?.locations) {
          for (let i = 0; i < updatedBible.worldBuilding.locations.length; i++) {
            const location = updatedBible.worldBuilding.locations[i]
            if (location.conceptArt?.imageUrl?.startsWith('data:')) {
              try {
                const hash = await hashPrompt(location.conceptArt.prompt || `location-${i}`, undefined, 'location')
                location.conceptArt.imageUrl = await processImageForStorage(
                  user.id,
                  location.conceptArt.imageUrl,
                  hash,
                  0
                )
                console.log(`✅ [Story Bible] Location ${i} concept art uploaded to Storage`)
              } catch (error) {
                console.error(`❌ [Story Bible] Failed to upload location ${i} concept art:`, error)
              }
            }
          }
        }
        
        console.log('✅ [Story Bible] All images uploaded to Storage')
      } catch (uploadError) {
        console.error('❌ [Story Bible] Error uploading images to Storage:', uploadError)
        // Continue anyway - base64 will be saved and migrated later
      }
    }
    
    setStoryBible(updatedBible)
    await saveStoryBibleData(updatedBible)
    
    // Reload story bible to ensure images are displayed
    if (user && updatedBible.id) {
      try {
        const reloaded = await getStoryBibleFromFirestore(updatedBible.id, user.id)
        if (reloaded) {
          setStoryBible(reloaded)
        }
      } catch (error) {
        console.error('Error reloading story bible:', error)
      }
    }
  }
  
  const addNewArc = async () => {
    if (!storyBible) return
    
    try {
      // Use the service function to extend the series
      const updatedBible = await extendSeriesWithArc(storyBible, user?.id)
      setStoryBible(updatedBible)
      
      // Save to both Firestore and localStorage (service already handles this, but ensure local state is updated)
      await saveStoryBibleData(updatedBible)
      
      // Navigate to the new arc
      setCurrentArcIndex((updatedBible.narrativeArcs?.length || 1) - 1)
    } catch (error: any) {
      console.error('Error adding new arc:', error)
      alert(`Failed to add arc: ${error.message}`)
    }
  }
  
  const deleteArc = async (index: number) => {
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
    
    // Save to both Firestore and localStorage
    await saveStoryBibleData(updatedBible)
    
    // Adjust current index if needed
    if (currentArcIndex >= updatedArcs.length) {
      setCurrentArcIndex(Math.max(0, updatedArcs.length - 1))
    }
  }
  
  const addEpisodeToArc = async (arcIndex: number) => {
    if (!storyBible) return
    
    const arc = storyBible.narrativeArcs[arcIndex]
    // Calculate next episode number across all arcs to ensure uniqueness
    const maxEpisodeNumber = storyBible.narrativeArcs?.reduce((max: number, a: any) => {
      const arcMax = a.episodes?.reduce((epMax: number, ep: any) => 
        Math.max(epMax, ep.number || 0), 0) || 0
      return Math.max(max, arcMax)
    }, 0) || 0
    
    const newEpisode = {
      number: maxEpisodeNumber + 1,
      title: `Episode ${maxEpisodeNumber + 1}`,
      summary: 'Episode summary to be defined'
    }
    
    const updatedArcs = [...storyBible.narrativeArcs]
    updatedArcs[arcIndex] = {
      ...updatedArcs[arcIndex],
      episodes: [...updatedArcs[arcIndex].episodes, newEpisode]
    }
    
    const updatedBible = { ...storyBible, narrativeArcs: updatedArcs }
    setStoryBible(updatedBible)
    
    // Save to both Firestore and localStorage
    await saveStoryBibleData(updatedBible)
  }
  
  const deleteEpisodeFromArc = async (arcIndex: number, episodeIndex: number) => {
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
    
    // Save to both Firestore and localStorage
    await saveStoryBibleData(updatedBible)
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
      <div className={`min-h-screen ${prefix}-bg-primary flex items-center justify-center relative`}>
        <AnimatedBackground variant="particles" intensity="low" page="story-bible" />
        <div className="fixed top-4 right-4 z-50">
          <GlobalThemeToggle />
        </div>
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className={`w-20 h-20 border-4 ${prefix}-border-accent border-t-transparent rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p className={`${prefix}-text-secondary mt-4`}>Loading your Story Bible...</p>
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
          <h2 className={`text-2xl font-bold ${prefix}-text-accent mb-4`}>No Story Bible Found</h2>
          <p className={`${prefix}-text-secondary mb-6`}>
            You haven't created a story bible yet, or it couldn't be loaded from your browser's storage.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className={`px-6 py-3 ${prefix}-btn-primary font-bold rounded-lg transition-colors`}
              onClick={() => router.push('/')}
            >
              🔥 Create New Story
            </button>
            
            <button 
              className={`px-6 py-3 border-2 ${prefix}-border-accent ${prefix}-text-accent font-bold rounded-lg hover:${prefix}-bg-accent transition-colors`}
              onClick={() => {
                // Get story bible ID from URL params or try to get from storyBible if it exists
                const bibleId = searchParams.get('id') || storyBible?.id
                if (bibleId) {
                  router.push(`/dashboard?id=${bibleId}`)
                } else {
                  router.push('/profile')
                }
              }}
            >
              ⚡ Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col ${prefix}-bg-primary relative`} style={{ fontFamily: 'League Spartan, sans-serif' }}>
      <AnimatedBackground variant="particles" intensity="low" page="story-bible" />
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <GlobalThemeToggle />
      </div>
      
      {/* Top Header Bar */}
      <div className={`h-16 border-b ${prefix}-border ${prefix}-bg-primary flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-10`}>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className={`md:hidden p-2 ${prefix}-text-secondary hover:${prefix}-text-primary`}
          >
            ☰
          </button>
          
          {/* Breadcrumb */}
          {storyBible?.id && (
            <div className="flex items-center gap-2 text-sm min-w-0">
              <button
                onClick={() => router.push(`/dashboard?id=${storyBible.id}`)}
                className={`${prefix}-text-secondary hover:${prefix}-text-primary transition-colors truncate`}
              >
                Dashboard
              </button>
              <span className={prefix + '-text-tertiary'}>/</span>
              <span className={prefix + '-text-primary truncate'}>Story Bible</span>
            </div>
          )}
          
          {/* Series Title */}
          <div className="flex-1 min-w-0 hidden md:flex items-center gap-3">
            {editingField?.type === 'seriesTitle' ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className={`flex-1 text-lg font-bold ${prefix}-bg-secondary border-2 ${prefix}-border-accent rounded-lg px-3 py-1 ${prefix}-text-primary`}
                  autoFocus
                />
                <button
                  onClick={saveEdit}
                  className={`${prefix}-btn-primary px-3 py-1 rounded-lg font-bold text-sm`}
                >
                  ✓
                </button>
                <button
                  onClick={cancelEditing}
                  className={`bg-red-500 ${prefix}-text-primary px-3 py-1 rounded-lg font-bold hover:bg-red-600 text-sm`}
                >
                  ✕
                </button>
              </div>
            ) : (
              <h1 className={`text-lg font-bold ${prefix}-text-primary truncate`}>
                {typeof storyBible?.seriesTitle === 'string' ? storyBible.seriesTitle : getContentOrFallback(storyBible, 'seriesTitle') || "Story Bible"}
              </h1>
            )}
          </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
            <motion.button
              onClick={async () => {
                if (!storyBible) return
                if (user) {
                  await saveStoryBibleData(storyBible)
                  alert('Story bible saved!')
                } else {
                const shouldLogin = confirm("Create an account to save your story bible and access it from any device.\n\nClick OK to create an account, or Cancel to save locally only.")
                  if (shouldLogin) {
                    await saveStoryBibleData(storyBible)
                    router.push('/login?redirect=/story-bible')
                  } else {
                    await saveStoryBibleData(storyBible)
                    alert('Story bible saved locally on this device.')
                  }
                }
              }}
              disabled={!storyBible}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                storyBible
                ? `${prefix}-bg-accent ${prefix}-text-accent hover:opacity-90`
                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>💾</span>
            <span className="hidden sm:inline">Save</span>
            </motion.button>

            {storyBible && storyBible.id && user && (
              <motion.button
                onClick={() => setShowGenerateImagesModal(true)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all bg-gradient-to-r from-[#10B981] to-[#059669] text-white hover:shadow-lg`}
                title="Generate images for Story Bible"
              >
                <span>🎨</span>
                <span className="hidden sm:inline">Generate Images</span>
              </motion.button>
            )}

            <motion.button
              onClick={() => setShowShareModal(true)}
              disabled={!user || !storyBible}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                user && storyBible
                  ? `bg-gradient-to-r from-blue-500 to-blue-600 ${prefix}-text-primary hover:shadow-lg`
                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
              }`}
              title={!user ? 'Sign in to share' : 'Share this story bible'}
            >
              <span>🔗</span>
            <span className="hidden sm:inline">Share</span>
            </motion.button>

            <motion.button
              onClick={() => {
                if (storyBible?.narrativeArcs && storyBible.narrativeArcs.length > 0) {
                  setSelectedArcIndex(0) // Default to first arc
                  setShowInvestorShareModal(true)
                }
              }}
              disabled={!user || !storyBible || !storyBible?.narrativeArcs || storyBible.narrativeArcs.length === 0}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                user && storyBible && storyBible?.narrativeArcs && storyBible.narrativeArcs.length > 0
                  ? `bg-gradient-to-r from-[#10B981] to-[#059669] text-black hover:shadow-lg`
                  : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
              }`}
              title={!user ? 'Sign in to share' : !storyBible?.narrativeArcs || storyBible.narrativeArcs.length === 0 ? 'Generate arcs first' : 'Share for investors'}
            >
              <span>📊</span>
              <span className="hidden sm:inline">Investors</span>
            </motion.button>

          {/* More Actions */}
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
              className={`px-3 py-1.5 ${prefix}-bg-secondary ${prefix}-border rounded-lg ${prefix}-text-secondary hover:${prefix}-text-primary transition-all`}
                title="More actions"
              >
              <span>⋮</span>
              </button>
              
              {showActionsMenu && (
              <div className={`absolute top-full right-0 mt-2 w-48 ${prefix}-bg-secondary ${prefix}-border-accent rounded-lg shadow-xl z-50`}>
                  <button
                    onClick={() => {
                      handleRegenerate()
                      setShowActionsMenu(false)
                    }}
                    disabled={isRegenerating || regenerationsRemaining <= 0}
                    className={`w-full px-4 py-3 text-left ${prefix}-text-secondary hover:${prefix}-bg-accent hover:${prefix}-text-primary transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span>🔄</span>
                    <span>Regenerate ({regenerationsRemaining}/5)</span>
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className={`w-full px-4 py-3 text-left ${prefix}-text-secondary hover:${prefix}-bg-accent hover:${prefix}-text-primary transition-all flex items-center gap-2 justify-between`}
                    >
                      <div className="flex items-center gap-2">
                        <span>📥</span>
                        <span>Export</span>
                      </div>
                      <span className="text-xs">{showExportMenu ? '▼' : '▶'}</span>
                    </button>
                    
                    {showExportMenu && (
                      <div className={`pl-8 pr-4 py-2 ${prefix}-bg-primary border-l-2 ${prefix}-border-accent`}>
                        <button
                          onClick={() => {
                            exportAsJSON(storyBible)
                            setShowActionsMenu(false)
                            setShowExportMenu(false)
                          }}
                          className={`w-full px-3 py-2 text-left ${prefix}-text-tertiary hover:${prefix}-text-primary text-sm flex items-center gap-2 rounded hover:${prefix}-bg-accent transition-all`}
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
                          className={`w-full px-3 py-2 text-left ${prefix}-text-tertiary hover:${prefix}-text-primary text-sm flex items-center gap-2 rounded hover:${prefix}-bg-accent transition-all`}
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
                          className={`w-full px-3 py-2 text-left ${prefix}-text-tertiary hover:${prefix}-text-primary text-sm flex items-center gap-2 rounded hover:${prefix}-bg-accent transition-all`}
                        >
                          <span>📋</span>
                          <span>Copy as Text</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Split Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop: always visible, Mobile: overlay */}
        <div className={`hidden md:block w-80 flex-shrink-0 ${showMobileSidebar ? 'block' : 'hidden'}`}>
          {storyBible && (
            <StoryBibleSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              storyBible={storyBible}
              theme={theme}
              onExport={exportStoryBible}
              onImport={importStoryBible}
              isLocked={isStoryBibleLocked}
            />
              )}
            </div>
            
        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="w-80 flex-shrink-0">
              {storyBible && (
                <StoryBibleSidebar
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                  storyBible={storyBible}
                  theme={theme}
                  isMobile={true}
                  onMobileClose={() => setShowMobileSidebar(false)}
                  onExport={exportStoryBible}
                  onImport={importStoryBible}
                  isLocked={isStoryBibleLocked}
                />
              )}
          </div>
            <div 
              className="flex-1 bg-black/50"
              onClick={() => setShowMobileSidebar(false)}
            />
            </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 md:p-8">
            {/* Breadcrumb for current section */}
            <div className={`flex items-center gap-2 text-sm mb-6 ${prefix}-text-secondary`}>
              <span>📖 Story Bible</span>
              <span>/</span>
              <span className={`${prefix}-text-primary`}>
                {activeSection === 'premise' ? '🎯 Premise' :
                 activeSection === 'overview' ? '📖 Overview' :
                 activeSection === 'characters' ? '👥 Characters' :
                 activeSection === 'arcs' ? '📚 Story Arcs' :
                 activeSection === 'world' ? '🌍 World' :
                 activeSection === 'choices' ? '🔀 Choices' :
                 activeSection === 'tension' ? '⚡ Tension' :
                 activeSection === 'choice-arch' ? '🎯 Choice Architecture' :
                 activeSection === 'living-world' ? '🌍 Living World' :
                 activeSection === 'trope' ? '📖 Trope Analysis' :
                 activeSection === 'cohesion' ? '🔗 Cohesion' :
                 activeSection === 'dialogue' ? '🗣️ Dialogue' :
                 activeSection === 'genre' ? '🎭 Genre' :
                 activeSection === 'theme' ? '🎯 Theme' :
                 activeSection === 'marketing' ? '📢 Marketing' : activeSection}
              </span>
                    </div>

            {/* Playbook Modal */}
            <StoryBiblePlaybookModal 
              isOpen={showPlaybook} 
              onClose={() => setShowPlaybook(false)} 
            />

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Premise Section */}
            {activeSection === 'premise' && storyBible.premise && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Premise</h2>
                  <p className={`text-base ${prefix}-text-secondary mb-8`}>
                    The foundational statement that drives your entire story forward.
                  </p>
                </div>
                
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-6 border-l-4 ${prefix}-border-accent`}>
                  <h3 className={`text-xl font-bold ${prefix}-text-primary mb-2`}>
                    <EditableField
                      value={storyBible.premise?.premiseStatement || ''}
                      onSave={async (newValue) => {
                        const updated = { ...storyBible }
                        if (!updated.premise) updated.premise = {}
                        updated.premise.premiseStatement = newValue as string
                        await saveStoryBibleData(updated)
                      }}
                      multiline
                      rows={2}
                      placeholder="Enter premise statement..."
                      className="font-bold"
                    />
                  </h3>
                    <p className={`${prefix}-text-tertiary`}>
                      <strong>Egri's Equation:</strong>{' '}
                      <EditableField
                        value={storyBible.premise?.character || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.premise) updated.premise = {}
                          updated.premise.character = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        placeholder="Character..."
                        className="inline-block min-w-[100px]"
                      />
                      {' + '}
                      <EditableField
                        value={storyBible.premise?.conflict || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.premise) updated.premise = {}
                          updated.premise.conflict = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        placeholder="Conflict..."
                        className="inline-block min-w-[100px]"
                      />
                      {' → '}
                      <EditableField
                        value={storyBible.premise?.resolution || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.premise) updated.premise = {}
                          updated.premise.resolution = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        placeholder="Resolution..."
                        className="inline-block min-w-[100px]"
                      />
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary`}>Core Elements</h3>
                      <div className="space-y-3">
                      <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                        <p className={`text-sm ${prefix}-text-tertiary mb-1`}>Theme</p>
                        <EditableField
                          value={storyBible.premise?.theme || ''}
                          onSave={async (newValue) => {
                            const updated = { ...storyBible }
                            if (!updated.premise) updated.premise = {}
                            updated.premise.theme = newValue as string
                            await saveStoryBibleData(updated)
                          }}
                          placeholder="Enter theme..."
                          className="font-semibold"
                        />
                        </div>
                      <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                        <p className={`text-sm ${prefix}-text-tertiary mb-1`}>Premise Type</p>
                        <EditableField
                          value={storyBible.premise?.premiseType || ''}
                          onSave={async (newValue) => {
                            const updated = { ...storyBible }
                            if (!updated.premise) updated.premise = {}
                            updated.premise.premiseType = newValue as string
                            await saveStoryBibleData(updated)
                          }}
                          placeholder="Enter premise type..."
                          className="font-semibold"
                        />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary`}>Story Function</h3>
                      <p className={`${prefix}-text-secondary text-sm leading-relaxed`}>
                        Every character, scene, and user choice in this story serves to prove this central premise. 
                        This ensures narrative coherence and emotional satisfaction by building toward a logical conclusion.
                      </p>
                      
                      {storyBible.premiseValidation && (
                      <div className={`${prefix}-card ${prefix}-border rounded-lg p-4 ${
                        storyBible.premiseValidation.strength === 'strong' ? `${prefix}-border-accent` : ''
                      }`}>
                        <p className={`text-sm font-semibold ${prefix}-text-primary`}>
Premise Strength: {typeof storyBible.premiseValidation.strength === 'string' ? storyBible.premiseValidation.strength.toUpperCase() : getContentOrFallback(storyBible.premiseValidation, 'strength')}
                          </p>
                          {storyBible.premiseValidation.issues.length > 0 && (
                          <p className={`text-xs mt-1 ${prefix}-text-tertiary`}>
                              {storyBible.premiseValidation.issues.join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Overview Section */}
            {activeSection === 'overview' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Overview</h2>
                  <p className={`text-base ${prefix}-text-secondary mb-8`}>
                    A high-level summary and key statistics of your story.
                  </p>
                </div>
                
                {/* Hero Image */}
                <StoryBibleImage
                  imageAsset={storyBible.visualAssets?.heroImage}
                  placeholderIcon="🎬"
                  placeholderText="Generate a hero image for your series"
                  onRegenerate={() => handleRegenerateImage('hero')}
                  isGenerating={generatingImageFor?.type === 'hero'}
                  aspectRatio="16:9"
                  className="mb-8"
                />
                
                <div>
                  <h3 className={`text-xl font-semibold ${prefix}-text-primary mb-4`}>Series Overview</h3>
                  <EditableField
                    value={storyBible.seriesOverview || ''}
                    onSave={async (newValue) => {
                      const updated = { ...storyBible }
                      updated.seriesOverview = newValue as string
                      await saveStoryBibleData(updated)
                    }}
                    multiline
                    rows={6}
                    placeholder="Enter series overview..."
                    className="text-lg leading-relaxed"
                  />
                </div>
                
                {storyBible.potentialBranchingPaths && (
                  <div>
                    <h3 className={`text-xl font-semibold ${prefix}-text-primary mb-4`}>Where the Story Could Go</h3>
                    <EditableField
                      value={storyBible.potentialBranchingPaths || ''}
                      onSave={async (newValue) => {
                        const updated = { ...storyBible }
                        updated.potentialBranchingPaths = newValue as string
                        await saveStoryBibleData(updated)
                      }}
                      multiline
                      rows={4}
                      placeholder="Enter potential branching paths..."
                    />
                  </div>
                )}
                
                {/* Stats Grid */}
                <div>
                  <h3 className={`text-xl font-semibold ${prefix}-text-primary mb-4`}>Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(() => {
                      // Calculate total episodes from all narrative arcs
                      const totalEpisodes = storyBible.narrativeArcs?.reduce((sum: number, arc: any) => {
                        return sum + (arc.episodes?.length || 8)
                      }, 0) || 0
                      
                      return [
                        { value: storyBible.mainCharacters?.length || 0, label: "Characters", icon: "👥" },
                        { value: storyBible.narrativeArcs?.length || 0, label: "Story Arcs", icon: "📚" },
                        { value: totalEpisodes, label: "Episodes", icon: "🎬" }
                      ]
                    })().map((stat, index) => (
                      <div
                      key={index}
                        className={`${prefix}-card ${prefix}-border text-center p-6 rounded-lg`}
                      >
                        <div className="text-4xl mb-3">
                        {stat.icon}
                    </div>
                        <div className={`text-3xl font-bold ${prefix}-text-accent mb-2`}>
                        {stat.value}
                  </div>
                        <div className={`${prefix}-text-secondary font-medium`}>{stat.label}</div>
                      </div>
                  ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Characters Section */}
            {activeSection === 'characters' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Characters</h2>
                    <p className={`text-base ${prefix}-text-secondary mb-8`}>
                      Detailed profiles and psychological breakdowns of your cast.
                  </p>
                      </div>
                        <button
                          onClick={addNewCharacter}
                    className={`px-4 py-2 ${prefix}-btn-primary font-semibold rounded-lg transition-colors flex items-center gap-2`}
                          title="Add new character"
                        >
                          ➕ Add Character
                        </button>
                    </div>
                    
                {storyBible.mainCharacters && storyBible.mainCharacters.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {storyBible.mainCharacters.map((character: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => openCharacterModal(index)}
                          className={`p-5 rounded-lg ${prefix}-card ${prefix}-border cursor-pointer hover:${prefix}-border-accent transition-all duration-200 hover:shadow-lg`}
                        >
                          {/* Character Image */}
                          <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                            {(() => {
                              // Debug logging
                              if (character.visualReference?.imageUrl) {
                                console.log(`🖼️ [Character ${index}] Rendering with image:`, character.visualReference.imageUrl.substring(0, 60))
                              } else {
                                console.log(`🖼️ [Character ${index}] No visualReference or imageUrl`)
                              }
                              return (
                                <StoryBibleImage
                                  imageAsset={character.visualReference}
                                  placeholderIcon="👤"
                                  placeholderText=""
                                  onRegenerate={() => handleRegenerateImage('character', index)}
                                  isGenerating={generatingImageFor?.type === 'character' && generatingImageFor?.index === index}
                                  aspectRatio="1:1"
                                  className="w-full"
                                />
                              )
                            })()}
                          </div>
                          
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/40 flex items-center justify-center text-xl font-bold text-[#10B981] flex-shrink-0">
                              {getInitials(character.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-lg font-bold ${prefix}-text-primary truncate`}>
                                {character.name}
                              </h3>
                              <p className={`text-xs ${prefix}-text-tertiary`}>
                                {character.premiseFunction || character.archetype || character.premiseRole || 'Character'}
                              </p>
                            </div>
                          </div>
                          <p className={`text-sm ${prefix}-text-secondary line-clamp-3`}>
                            {getCharacterBriefDescription(character)}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Character Relationships (if available) */}
                    {storyBible.characterRelationships && storyBible.characterRelationships.length > 0 && (
                      <div className="mt-8">
                        <h3 className={`text-xl font-semibold ${prefix}-text-primary mb-4`}>🔗 Character Relationships</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {storyBible.characterRelationships.map((rel: any, index: number) => (
                            <div key={index} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                              <h5 className={`font-semibold ${prefix}-text-primary mb-2`}>
                                {rel.character1} & {rel.character2}
                              </h5>
                              <p className={`text-sm ${prefix}-text-secondary mb-2`}>
                                <strong className={`${prefix}-text-primary`}>Type:</strong> {rel.relationshipType}
                              </p>
                              <p className={`text-sm ${prefix}-text-secondary mb-2`}>
                                <strong className={`${prefix}-text-primary`}>Dynamic:</strong> {rel.dynamic}
                              </p>
                              <p className={`text-xs ${prefix}-text-accent`}>
                                <strong>Premise Relevance:</strong> {rel.premiseRelevance}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-8 text-center`}>
                    <p className={`${prefix}-text-secondary`}>No characters yet. Add your first character to get started!</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Arcs Section */}
            {activeSection === 'arcs' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
              <div>
                    <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Story Arcs</h2>
                    <p className={`text-base ${prefix}-text-secondary`}>
                      The structural progression and major plot points of your narrative.
                    </p>
                  </div>
                  {!isStoryBibleLocked && (
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
                      className={`px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-semibold rounded-lg hover:from-[#059669] hover:to-[#047857] transition-all flex items-center gap-2 shadow-lg`}
                    title="Get AI assistance for arc ideas"
                  >
                    <span className="text-lg">✨</span>
                      <span className="hidden sm:inline">AI Assist</span>
                  </button>
                  )}
                </div>
                
                {/* Editing Hint */}
                <div className={`${prefix}-card-secondary ${prefix}-border border-l-4 ${prefix === 'dark' ? 'border-yellow-400' : 'border-yellow-500'} p-4 rounded-lg`}>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">💡</span>
                  <p className={`${prefix}-text-secondary text-sm`}>
                      <strong className={`${prefix}-text-primary`}>Tip:</strong> You can add or remove arcs to match your story's structure. Each arc can have any number of episodes! Use <strong className={`${prefix}-text-primary`}>AI Assist</strong> for suggestions.
                  </p>
                  </div>
                </div>
                
                {storyBible.narrativeArcs && storyBible.narrativeArcs.length > 0 ? (
                  <div className="space-y-8" key="arcs-content">
                    {/* Arc Navigation */}
                    <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                      {storyBible.narrativeArcs.map((arc: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentArcIndex(index)}
                            className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                            currentArcIndex === index
                                ? `${prefix}-bg-accent ${prefix}-text-accent font-semibold`
                              : `${prefix}-bg-secondary ${prefix}-text-secondary hover:${prefix}-bg-tertiary`
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
                          className={`px-4 py-2 ${prefix}-btn-primary font-semibold rounded-lg transition-colors flex items-center gap-2`}
                          title="Add new arc"
                        >
                          ➕ Add Arc
                        </button>
                        {storyBible.narrativeArcs.length > 1 && !isStoryBibleLocked && (
                          <button
                            onClick={() => deleteArc(currentArcIndex)}
                            className={`px-4 py-2 bg-red-500/80 ${prefix}-text-primary font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2`}
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
                        <div className={`${prefix}-card-secondary ${prefix}-border border-l-4 ${prefix === 'dark' ? 'border-blue-400' : 'border-blue-500'} rounded-lg p-4 mb-6`}>
                          <div className="flex items-start gap-2">
                            <span className="text-lg">💡</span>
                            <p className={`${prefix}-text-secondary text-sm`}>
                              <strong className={`${prefix}-text-primary`}>Arc suggestions are starting points:</strong> These automated suggestions guide your story, 
                            but you control the actual episodes. Use them for inspiration, then create episodes your way in the Episode Studio!
                          </p>
                          </div>
                        </div>

                        <div className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
                          {/* Arc Key Art */}
                          <div className="mb-6">
                            <StoryBibleImage
                              imageAsset={storyBible.narrativeArcs[currentArcIndex].keyArt}
                              placeholderIcon="📚"
                              placeholderText="Generate key art for this arc"
                              onRegenerate={() => handleRegenerateImage('arc', currentArcIndex)}
                              isGenerating={generatingImageFor?.type === 'arc' && generatingImageFor?.index === currentArcIndex}
                              aspectRatio="16:9"
                              className="w-full"
                            />
                          </div>
                          
                          <div className="flex items-center gap-3 mb-4">
                            {editingField?.type === 'arc' && editingField?.index === currentArcIndex && editingField?.field === 'title' ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit()
                                    if (e.key === 'Escape') cancelEditing()
                                  }}
                                  className={`text-2xl font-bold ${prefix}-bg-secondary border-2 ${prefix}-border-accent rounded-lg px-3 py-2 ${prefix}-text-primary flex-1`}
                                  autoFocus
                                />
                                <button onClick={saveEdit} className={`${prefix}-btn-primary px-3 py-2 rounded-lg font-bold text-sm`}>✓</button>
                                <button onClick={cancelEditing} className={`bg-red-500 ${prefix}-text-primary px-3 py-2 rounded-lg font-bold hover:bg-red-600 text-sm`}>✕</button>
                              </div>
                            ) : (
                              <h3 className={`text-2xl font-bold ${prefix}-text-primary`}>
                                {storyBible.narrativeArcs[currentArcIndex].title}
                              </h3>
                            )}
                          </div>
                          <div className="mb-6">
                            <EditableField
                              value={storyBible.narrativeArcs[currentArcIndex].summary || ''}
                              onSave={async (newValue) => {
                                const updated = { ...storyBible }
                                updated.narrativeArcs[currentArcIndex].summary = newValue as string
                                await saveStoryBibleData(updated)
                              }}
                              multiline
                              rows={4}
                              placeholder="Enter arc summary..."
                              className="text-sm leading-relaxed"
                            />
                          </div>
                          
                          {/* Episodes in this arc */}
                          {storyBible.narrativeArcs[currentArcIndex].episodes && 
                           storyBible.narrativeArcs[currentArcIndex].episodes.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h4 className={`text-lg font-semibold ${prefix}-text-primary`}>Episodes</h4>
                                {!isStoryBibleLocked && (
                                <button
                                  onClick={() => addEpisodeToArc(currentArcIndex)}
                                    className={`px-3 py-1.5 ${prefix}-btn-primary text-sm font-semibold rounded-lg transition-colors flex items-center gap-2`}
                                  title="Add episode to this arc"
                                >
                                  ➕ Add Episode
                                </button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {storyBible.narrativeArcs[currentArcIndex].episodes.map((episode: any, episodeIndex: number) => (
                                  <div 
                                    key={episodeIndex}
                                    className={`${prefix}-card ${prefix}-border rounded-lg p-4 hover:${prefix}-border-accent transition-all relative group`}
                                  >
                                    <div className="flex justify-between items-center mb-2">
                                      <h5 className={`font-semibold ${prefix}-text-primary`}>Episode {episode.number || episodeIndex + 1}</h5>
                                      <div className="flex items-center gap-2">
                                        {(() => {
                                          // Calculate total episodes across all arcs
                                          const totalEpisodes = storyBible.narrativeArcs?.reduce((sum: number, arc: any) => {
                                            return sum + (arc.episodes?.length || 8)
                                          }, 0) || 0
                                          // Calculate episode number in series
                                          let episodeNumberInSeries = 0
                                          for (let i = 0; i < currentArcIndex; i++) {
                                            episodeNumberInSeries += storyBible.narrativeArcs[i].episodes?.length || 8
                                          }
                                          episodeNumberInSeries += episodeIndex + 1
                                          return <span className={`text-xs ${prefix}-text-tertiary`}>{`${episodeNumberInSeries}/${totalEpisodes}`}</span>
                                        })()}
                                        {storyBible.narrativeArcs[currentArcIndex].episodes.length > 1 && !isStoryBibleLocked && (
                                          <button
                                            onClick={() => deleteEpisodeFromArc(currentArcIndex, episodeIndex)}
                                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all text-xs px-1.5 py-0.5 bg-red-500/10 rounded"
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
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') saveEdit()
                                              if (e.key === 'Escape') cancelEditing()
                                            }}
                                            className={`text-sm font-medium ${prefix}-bg-secondary border ${prefix}-border-accent rounded px-2 py-1 ${prefix}-text-primary flex-1`}
                                            autoFocus
                                          />
                                          <button onClick={saveEdit} className={`${prefix}-btn-primary px-2 py-1 rounded text-xs font-bold`}>✓</button>
                                          <button onClick={cancelEditing} className={`bg-red-500 ${prefix}-text-primary px-2 py-1 rounded text-xs font-bold hover:bg-red-600`}>✕</button>
                                        </div>
                                      ) : (
                                        <h4 className={`text-sm font-medium ${prefix}-text-primary`}>
                                          {episode.title}
                                        </h4>
                                      )}
                                    </div>
                                    <div className="mt-2">
                                      <EditableField
                                        value={episode.summary || ''}
                                        onSave={async (newValue) => {
                                          const updated = { ...storyBible }
                                          updated.narrativeArcs[currentArcIndex].episodes[episodeIndex].summary = newValue as string
                                          await saveStoryBibleData(updated)
                                        }}
                                        multiline
                                        rows={3}
                                        placeholder="Enter episode summary..."
                                        className="text-sm"
                                      />
                                    </div>
                                    {episode.keyEvents && Array.isArray(episode.keyEvents) && episode.keyEvents.length > 0 && (
                                      <div className="mt-2">
                                        <strong className={`text-xs ${prefix}-text-primary`}>Key Events:</strong>
                                        <ul className={`text-xs ${prefix}-text-secondary mt-1 list-disc list-inside`}>
                                          {episode.keyEvents.map((event: string, eventIndex: number) => (
                                            <li key={eventIndex}>{event}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {episode.characterDevelopment && (
                                      <div className="mt-2">
                                        <strong className={`text-xs ${prefix}-text-primary`}>Character Development:</strong>
                                          <EditableField
                                            value={episode.characterDevelopment || ''}
                                            onSave={async (newValue) => {
                                              const updated = { ...storyBible }
                                              updated.narrativeArcs[currentArcIndex].episodes[episodeIndex].characterDevelopment = newValue as string
                                              await saveStoryBibleData(updated)
                                            }}
                                            multiline
                                            rows={2}
                                            placeholder="Enter character development..."
                                            className="text-xs mt-1"
                                          />
                                      </div>
                                    )}
                                    {episode.thematicElements && (
                                      <div className="mt-2">
                                        <strong className={`text-xs ${prefix}-text-primary`}>Thematic Elements:</strong>
                                          <EditableField
                                            value={episode.thematicElements || ''}
                                            onSave={async (newValue) => {
                                              const updated = { ...storyBible }
                                              updated.narrativeArcs[currentArcIndex].episodes[episodeIndex].thematicElements = newValue as string
                                              await saveStoryBibleData(updated)
                                            }}
                                            multiline
                                            rows={2}
                                            placeholder="Enter thematic elements..."
                                            className="text-xs mt-1"
                                          />
                                      </div>
                                    )}
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
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-8 text-center`}>
                    <p className={`${prefix}-text-secondary`}>No arcs yet. Add your first arc to get started!</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* World Section */}
            {activeSection === 'world' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
              <div>
                    <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>World</h2>
                    <p className={`text-base ${prefix}-text-secondary`}>
                      The rules, history, and geography of your story universe.
                    </p>
                  </div>
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
                    className={`px-4 py-2 bg-[#10B981] text-white font-bold rounded-lg hover:bg-[#059669] transition-colors flex items-center gap-2`}
                    title="Get AI assistance for world building"
                  >
                    <span className="text-lg">✨</span>
                    AI Assist
                  </button>
                </div>
                
                {/* Editing Hint */}
                <div className={`${prefix}-card ${prefix}-border border-l-4 ${prefix}-border-accent p-4 rounded-lg`}>
                  <p className={`${prefix}-text-secondary text-sm`}>
                    💡 <strong>Tip:</strong> You can add or remove world elements like locations, factions, and rules. Use <strong>AI Assist</strong> for creative suggestions!
                  </p>
                </div>
                
                {storyBible.worldBuilding ? (
                  <div className="space-y-6">
                      <div>
                        <h3 className={`text-xl font-semibold ${prefix}-text-primary mb-3`}>Setting</h3>
                        <div className={`${prefix}-card ${prefix}-border p-4 rounded-lg`}>
                            <EditableField
                              value={storyBible.worldBuilding.setting || ''}
                              onSave={async (newValue) => {
                                const updated = { ...storyBible }
                                if (!updated.worldBuilding) updated.worldBuilding = {}
                                updated.worldBuilding.setting = newValue as string
                                await saveStoryBibleData(updated)
                              }}
                              multiline
                              rows={4}
                              placeholder="Enter setting description..."
                            />
                        </div>
                      </div>
                    
                      <div>
                        <h3 className={`text-xl font-semibold ${prefix}-text-primary mb-3`}>Rules of the World</h3>
                        <div className={`${prefix}-card ${prefix}-border p-4 rounded-lg`}>
                          <EditableField
                            value={Array.isArray(storyBible.worldBuilding.rules) 
                              ? storyBible.worldBuilding.rules.join('\n')
                              : (storyBible.worldBuilding.rules || '')}
                            onSave={async (newValue) => {
                              const updated = { ...storyBible }
                              if (!updated.worldBuilding) updated.worldBuilding = {}
                              // Convert newline-separated string to array
                              updated.worldBuilding.rules = (newValue as string).split('\n').filter(r => r.trim())
                              await saveStoryBibleData(updated)
                            }}
                            multiline
                            rows={6}
                            placeholder="Enter rules (one per line)..."
                          />
                        </div>
                      </div>
                    
                    {storyBible.worldBuilding.locations && storyBible.worldBuilding.locations.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className={`text-xl font-semibold ${prefix}-text-primary`}>Key Locations</h3>
                          <button
                            onClick={() => addWorldElement('locations')}
                            className={`px-3 py-1 ${prefix}-btn-primary font-semibold text-sm rounded-lg transition-colors`}
                            title="Add new location"
                          >
                            ➕ Add Location
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {storyBible.worldBuilding.locations.map((location: any, index: number) => (
                            <div 
                              key={index}
                              className={`${prefix}-card ${prefix}-border rounded-lg p-4 space-y-2 relative group`}
                            >
                              {/* Location Concept Art */}
                              <div className="mb-3">
                                <StoryBibleImage
                                  imageAsset={location.conceptArt}
                                  placeholderIcon="🌍"
                                  placeholderText="Generate concept art for this location"
                                  onRegenerate={() => handleRegenerateImage('location', index)}
                                  isGenerating={generatingImageFor?.type === 'location' && generatingImageFor?.index === index}
                                  aspectRatio="16:9"
                                  className="w-full"
                                />
                              </div>
                              
                              <div className="flex items-center justify-between mb-2">
                                  <EditableField
                                    value={location.name || ''}
                                    onSave={async (newValue) => {
                                      const updated = { ...storyBible }
                                      updated.worldBuilding.locations[index].name = newValue as string
                                      await saveStoryBibleData(updated)
                                    }}
                                    placeholder="Location name..."
                                    className="font-medium flex-1"
                                  />
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
                                  <span className={`text-xs px-2 py-0.5 rounded ${prefix}-bg-secondary border ${prefix}-border ${prefix}-text-tertiary`}>
                                    {location.type}
                                  </span>
                                )}
                              </div>
                              <div className="mb-2">
                                <strong className={`text-xs ${prefix}-text-primary`}>Significance:</strong>
                                  <EditableField
                                    value={location.significance || ''}
                                    onSave={async (newValue) => {
                                      const updated = { ...storyBible }
                                      updated.worldBuilding.locations[index].significance = newValue as string
                                      await saveStoryBibleData(updated)
                                    }}
                                    multiline
                                    rows={2}
                                    placeholder="Enter significance..."
                                    className="text-xs mt-1"
                                  />
                              </div>
                              <div>
                                <strong className={`text-xs ${prefix}-text-primary`}>Description:</strong>
                                  <EditableField
                                    value={location.description || ''}
                                    onSave={async (newValue) => {
                                      const updated = { ...storyBible }
                                      updated.worldBuilding.locations[index].description = newValue as string
                                      await saveStoryBibleData(updated)
                                    }}
                                    multiline
                                    rows={3}
                                    placeholder="Enter description..."
                                    className="text-sm mt-1"
                                  />
                              </div>
                              {location.atmosphere && (
                                <div className="mt-2">
                                  <strong className={`text-xs ${prefix}-text-primary`}>Atmosphere:</strong>
                                    <EditableField
                                      value={location.atmosphere || ''}
                                      onSave={async (newValue) => {
                                        const updated = { ...storyBible }
                                        updated.worldBuilding.locations[index].atmosphere = newValue as string
                                        await saveStoryBibleData(updated)
                                      }}
                                      multiline
                                      rows={2}
                                      placeholder="Enter atmosphere..."
                                      className="text-xs mt-1"
                                    />
                                </div>
                              )}
                              {Array.isArray(location.recurringEvents) && location.recurringEvents.length > 0 && (
                                <div className={`text-xs ${prefix}-text-tertiary`}>
                                  <span className={`font-semibold ${prefix}-text-accent`}>Recurring Events:</span>
                                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                                    {location.recurringEvents.map((e: string, i: number) => <li key={i}>{e}</li>)}
                                  </ul>
                                </div>
                              )}
                              {Array.isArray(location.conflicts) && location.conflicts.length > 0 && (
                                <div className={`text-xs ${prefix}-text-tertiary`}>
                                  <span className={`font-semibold ${prefix}-text-accent`}>Conflicts:</span>
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
                ) : null}
              </motion.div>
            )}

            {/* Marketing Section */}
            {activeSection === 'marketing' && (
              <MarketingSection 
                storyBible={storyBible} 
                theme={theme}
                onUpdate={async (updatedBible) => {
                  setStoryBible(updatedBible)
                  await saveStoryBibleData(updatedBible)
                }}
              />
            )}

            {/* Choices Section */}
            {activeSection === 'choices' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
              <div>
                  <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Choices</h2>
                  <p className={`text-base ${prefix}-text-secondary mb-8`}>
                    A chronological log of the choices made at the end of each episode, showing the branching path your story has taken.
                  </p>
                </div>
                
                {storyBible.episodesGenerated && storyBible.episodesGenerated > 0 ? (
                  <div className="space-y-6">
                    {/* Progress Overview */}
                    <div className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
                      <h3 className={`text-xl font-semibold ${prefix}-text-primary mb-4`}>Story Progress</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`text-center p-4 ${prefix}-card-secondary rounded-lg`}>
                          <div className={`text-2xl font-bold ${prefix}-text-accent mb-1`}>
                            {storyBible.episodesGenerated}
                          </div>
                          <div className={`text-sm ${prefix}-text-tertiary`}>Episodes Generated</div>
                        </div>
                        <div className={`text-center p-4 ${prefix}-card-secondary rounded-lg`}>
                          <div className={`text-2xl font-bold ${prefix}-text-accent mb-1`}>
                            {storyBible.fanChoices?.length || 0}
                          </div>
                          <div className={`text-sm ${prefix}-text-tertiary`}>Choices Made</div>
                        </div>
                        <div className={`text-center p-4 ${prefix}-card-secondary rounded-lg`}>
                          <div className={`text-2xl font-bold ${prefix}-text-accent mb-1`}>
                            {(storyBible.newCharacters?.length || 0) + (storyBible.newLocations?.length || 0)}
                          </div>
                          <div className={`text-sm ${prefix}-text-tertiary`}>New Elements Added</div>
                        </div>
                      </div>
                    </div>

                    {/* Fan Choices */}
                    {storyBible.fanChoices && storyBible.fanChoices.length > 0 && (
                      <div>
                        <h3 className={`text-xl font-semibold ${prefix}-text-primary mb-4`}>Your Decisions</h3>
                        <div className="space-y-4">
                          {storyBible.fanChoices.map((choice: any, index: number) => (
                            <div key={index} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-sm font-medium ${prefix}-text-accent`}>Episode {choice.episode}</span>
                                <span className={`text-xs ${prefix}-text-tertiary`}>Your Choice</span>
                              </div>
                              <p className={`${prefix}-text-secondary mb-2`}>{choice.choice}</p>
                              <p className={`text-sm ${prefix}-text-tertiary italic`}>{choice.impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Characters */}
                    {storyBible.newCharacters && storyBible.newCharacters.length > 0 && (
                      <div>
                        <h3 className={`text-xl font-semibold ${prefix}-text-primary mb-4`}>Characters Introduced Through Your Journey</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {storyBible.newCharacters.map((character: any, index: number) => (
                            <div key={index} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                              <div className="flex justify-between items-start mb-2">
                                <h4 className={`font-medium ${prefix}-text-primary`}>{character.name}</h4>
                                <span className={`text-xs ${prefix}-text-tertiary`}>Episode {character.introducedInEpisode}</span>
                              </div>
                              <p className={`text-sm ${prefix}-text-secondary`}>{character.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Locations */}
                    {storyBible.newLocations && storyBible.newLocations.length > 0 && (
                      <div>
                        <h3 className={`text-xl font-semibold ${prefix}-text-primary mb-4`}>New Locations Discovered</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {storyBible.newLocations.map((location: any, index: number) => (
                            <div key={index} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                              <div className="flex justify-between items-start mb-2">
                                <h4 className={`font-medium ${prefix}-text-primary`}>{location.name}</h4>
                                <span className={`text-xs ${prefix}-text-tertiary`}>Episode {location.introducedInEpisode}</span>
                              </div>
                              <p className={`text-sm ${prefix}-text-secondary`}>{location.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Story Evolution */}
                    {storyBible.storyEvolution && storyBible.storyEvolution.length > 0 && (
                      <div>
                        <h3 className={`text-xl font-semibold ${prefix}-text-primary mb-4`}>Story Evolution</h3>
                        <div className="space-y-4">
                          {storyBible.storyEvolution.map((evolution: any, index: number) => (
                            <div key={index} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-sm font-medium ${prefix}-text-accent`}>Episode {evolution.episode}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  evolution.type === 'callback' 
                                    ? 'bg-blue-500/20 text-blue-300' 
                                    : 'bg-[#10B981]/20 text-[#10B981]'
                                }`}>
                                  {evolution.type === 'callback' ? 'Callback' : 'Foreshadowing'}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {evolution.elements.map((element: string, elemIndex: number) => (
                                  <p key={elemIndex} className={`text-sm ${prefix}-text-secondary`}>• {element}</p>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-8 text-center`}>
                    <p className={`${prefix}-text-secondary`}>No choices yet. Generate episodes to see your story choices!</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Technical Sections */}
            {/* Tension Section */}
            {activeSection === 'tension' && storyBible.tensionStrategy && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Tension</h2>
                  <p className={`text-base ${prefix}-text-secondary mb-8`}>
                    Analysis of the story's tension strategy, including rising action, climax points, and character stakes.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Tension Curve</h3>
                      <EditableField
                        value={storyBible.tensionStrategy?.tensionCurve || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.tensionStrategy) updated.tensionStrategy = {}
                          updated.tensionStrategy.tensionCurve = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter tension curve..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Climax Points</h3>
                      <EditableField
                        value={storyBible.tensionStrategy?.climaxPoints || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.tensionStrategy) updated.tensionStrategy = {}
                          updated.tensionStrategy.climaxPoints = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter climax points..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Release Moments</h3>
                      <EditableField
                        value={storyBible.tensionStrategy?.releaseMoments || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.tensionStrategy) updated.tensionStrategy = {}
                          updated.tensionStrategy.releaseMoments = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter release moments..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Escalation Techniques</h3>
                      <EditableField
                        value={storyBible.tensionStrategy?.escalationTechniques || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.tensionStrategy) updated.tensionStrategy = {}
                          updated.tensionStrategy.escalationTechniques = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter escalation techniques..."
                      />
                  </div>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Emotional Beats</h3>
                    <EditableField
                      value={storyBible.tensionStrategy?.emotionalBeats || ''}
                      onSave={async (newValue) => {
                        const updated = { ...storyBible }
                        if (!updated.tensionStrategy) updated.tensionStrategy = {}
                        updated.tensionStrategy.emotionalBeats = newValue as string
                        await saveStoryBibleData(updated)
                      }}
                      multiline
                      rows={4}
                      placeholder="Enter emotional beats..."
                    />
                </div>
              </motion.div>
            )}

            {/* Choice Architecture Section */}
            {activeSection === 'choice-arch' && storyBible.choiceArchitecture && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Choice Architecture</h2>
                  <p className={`text-base ${prefix}-text-secondary mb-8`}>
                    Examines the design of user choices within the narrative, ensuring they are meaningful, impactful, and lead to distinct branching paths.
                  </p>
                </div>
              <div className="space-y-6">
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Key Decisions</h3>
                      <EditableField
                        value={storyBible.choiceArchitecture?.keyDecisions || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.choiceArchitecture) updated.choiceArchitecture = {}
                          updated.choiceArchitecture.keyDecisions = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={4}
                        placeholder="Enter key decisions..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Moral Choices</h3>
                      <EditableField
                        value={storyBible.choiceArchitecture?.moralChoices || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.choiceArchitecture) updated.choiceArchitecture = {}
                          updated.choiceArchitecture.moralChoices = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={4}
                        placeholder="Enter moral choices..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Consequence Mapping</h3>
                      <EditableField
                        value={storyBible.choiceArchitecture?.consequenceMapping || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.choiceArchitecture) updated.choiceArchitecture = {}
                          updated.choiceArchitecture.consequenceMapping = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={4}
                        placeholder="Enter consequence mapping..."
                      />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                      <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Character Growth</h3>
                        <EditableField
                          value={storyBible.choiceArchitecture?.characterGrowth || ''}
                          onSave={async (newValue) => {
                            const updated = { ...storyBible }
                            if (!updated.choiceArchitecture) updated.choiceArchitecture = {}
                            updated.choiceArchitecture.characterGrowth = newValue as string
                            await saveStoryBibleData(updated)
                          }}
                          multiline
                          rows={3}
                          placeholder="Enter character growth..."
                        />
                    </div>
                    <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                      <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Thematic Choices</h3>
                        <EditableField
                          value={storyBible.choiceArchitecture?.thematicChoices || ''}
                          onSave={async (newValue) => {
                            const updated = { ...storyBible }
                            if (!updated.choiceArchitecture) updated.choiceArchitecture = {}
                            updated.choiceArchitecture.thematicChoices = newValue as string
                            await saveStoryBibleData(updated)
                          }}
                          multiline
                          rows={3}
                          placeholder="Enter thematic choices..."
                        />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Living World Section */}
            {activeSection === 'living-world' && storyBible.livingWorldDynamics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Living World</h2>
                  <p className={`text-base ${prefix}-text-secondary mb-8`}>
                    Details how the world reacts to player choices and story events, ensuring a dynamic and evolving narrative environment.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Background Events</h3>
                      <EditableField
                        value={storyBible.livingWorldDynamics?.backgroundEvents || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.livingWorldDynamics) updated.livingWorldDynamics = {}
                          updated.livingWorldDynamics.backgroundEvents = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter background events..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Social Dynamics</h3>
                      <EditableField
                        value={storyBible.livingWorldDynamics?.socialDynamics || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.livingWorldDynamics) updated.livingWorldDynamics = {}
                          updated.livingWorldDynamics.socialDynamics = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter social dynamics..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Economic Factors</h3>
                      <EditableField
                        value={storyBible.livingWorldDynamics?.economicFactors || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.livingWorldDynamics) updated.livingWorldDynamics = {}
                          updated.livingWorldDynamics.economicFactors = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter economic factors..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Political Undercurrents</h3>
                      <EditableField
                        value={storyBible.livingWorldDynamics?.politicalUndercurrents || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.livingWorldDynamics) updated.livingWorldDynamics = {}
                          updated.livingWorldDynamics.politicalUndercurrents = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter political undercurrents..."
                      />
                  </div>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Cultural Shifts</h3>
                    <EditableField
                      value={storyBible.livingWorldDynamics?.culturalShifts || ''}
                      onSave={async (newValue) => {
                        const updated = { ...storyBible }
                        if (!updated.livingWorldDynamics) updated.livingWorldDynamics = {}
                        updated.livingWorldDynamics.culturalShifts = newValue as string
                        await saveStoryBibleData(updated)
                      }}
                      multiline
                      rows={4}
                      placeholder="Enter cultural shifts..."
                    />
                </div>
              </motion.div>
            )}

            {/* Trope Analysis Section */}
            {activeSection === 'trope' && storyBible.tropeAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Trope Analysis</h2>
                  <p className={`text-base ${prefix}-text-secondary mb-8`}>
                    Identifies and analyzes the use of common narrative tropes, ensuring they are either subverted, played straight, or deconstructed effectively.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Genre Tropes Used</h3>
                      <EditableField
                        value={storyBible.tropeAnalysis?.genreTropes || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.tropeAnalysis) updated.tropeAnalysis = {}
                          updated.tropeAnalysis.genreTropes = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter genre tropes..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Subverted Tropes</h3>
                      <EditableField
                        value={storyBible.tropeAnalysis?.subvertedTropes || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.tropeAnalysis) updated.tropeAnalysis = {}
                          updated.tropeAnalysis.subvertedTropes = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter subverted tropes..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Original Elements</h3>
                      <EditableField
                        value={storyBible.tropeAnalysis?.originalElements || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.tropeAnalysis) updated.tropeAnalysis = {}
                          updated.tropeAnalysis.originalElements = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter original elements..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Audience Expectations</h3>
                      <EditableField
                        value={storyBible.tropeAnalysis?.audienceExpectations || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.tropeAnalysis) updated.tropeAnalysis = {}
                          updated.tropeAnalysis.audienceExpectations = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter audience expectations..."
                      />
                  </div>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Innovative Twists</h3>
                    <EditableField
                      value={storyBible.tropeAnalysis?.innovativeTwists || ''}
                      onSave={async (newValue) => {
                        const updated = { ...storyBible }
                        if (!updated.tropeAnalysis) updated.tropeAnalysis = {}
                        updated.tropeAnalysis.innovativeTwists = newValue as string
                        await saveStoryBibleData(updated)
                      }}
                      multiline
                      rows={4}
                      placeholder="Enter innovative twists..."
                    />
                </div>
              </motion.div>
            )}

            {/* Cohesion Analysis Section */}
            {activeSection === 'cohesion' && storyBible.cohesionAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Cohesion</h2>
                  <p className={`text-base ${prefix}-text-secondary mb-8`}>
                    Evaluates the consistency and logical flow of the narrative, ensuring all plot threads, character motivations, and world rules remain coherent.
                  </p>
                </div>
              <div className="space-y-6">
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Narrative Cohesion</h3>
                      <EditableField
                        value={storyBible.cohesionAnalysis?.narrativeCohesion || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.cohesionAnalysis) updated.cohesionAnalysis = {}
                          updated.cohesionAnalysis.narrativeCohesion = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={4}
                        placeholder="Enter narrative cohesion..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Thematic Continuity</h3>
                      <EditableField
                        value={storyBible.cohesionAnalysis?.thematicContinuity || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.cohesionAnalysis) updated.cohesionAnalysis = {}
                          updated.cohesionAnalysis.thematicContinuity = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={4}
                        placeholder="Enter thematic continuity..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Character Arcs</h3>
                      <EditableField
                        value={storyBible.cohesionAnalysis?.characterArcs || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.cohesionAnalysis) updated.cohesionAnalysis = {}
                          updated.cohesionAnalysis.characterArcs = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={4}
                        placeholder="Enter character arcs..."
                      />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                      <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Plot Consistency</h3>
                        <EditableField
                          value={storyBible.cohesionAnalysis?.plotConsistency || ''}
                          onSave={async (newValue) => {
                            const updated = { ...storyBible }
                            if (!updated.cohesionAnalysis) updated.cohesionAnalysis = {}
                            updated.cohesionAnalysis.plotConsistency = newValue as string
                            await saveStoryBibleData(updated)
                          }}
                          multiline
                          rows={3}
                          placeholder="Enter plot consistency..."
                        />
                    </div>
                    <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                      <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Emotional Journey</h3>
                        <EditableField
                          value={storyBible.cohesionAnalysis?.emotionalJourney || ''}
                          onSave={async (newValue) => {
                            const updated = { ...storyBible }
                            if (!updated.cohesionAnalysis) updated.cohesionAnalysis = {}
                            updated.cohesionAnalysis.emotionalJourney = newValue as string
                            await saveStoryBibleData(updated)
                          }}
                          multiline
                          rows={3}
                          placeholder="Enter emotional journey..."
                        />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Dialogue Strategy Section */}
            {activeSection === 'dialogue' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Dialogue</h2>
                  <p className={`text-base ${prefix}-text-secondary mb-8`}>
                    Outlines the stylistic approach to dialogue, including character voices, pacing, language, and subtext.
                  </p>
                </div>
                
                {/* Dialogue Language Setting - Prominent Display */}
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-6 border-l-4 ${prefix}-border-accent mb-6`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-xl font-bold ${prefix}-text-primary flex items-center gap-2`}>
                      🗣️ Dialogue Language
                    </h3>
                    {!isStoryBibleLocked && (
                      <select
                        value={storyBible.dialogueLanguage || 'english'}
                        onChange={(e) => {
                          const updatedBible = { ...storyBible, dialogueLanguage: e.target.value }
                          setStoryBible(updatedBible)
                          saveStoryBibleData(updatedBible)
                        }}
                        className={`px-4 py-2 ${prefix}-bg-primary ${prefix}-text-primary ${prefix}-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]/40`}
                      >
                        <option value="english">English</option>
                        <option value="tagalog">Taglish (Tagalog-English)</option>
                        <option value="thai">Thai (ภาษาไทย)</option>
                        <option value="spanish">Spanish (Español)</option>
                        <option value="korean">Korean (한국어)</option>
                        <option value="japanese">Japanese (日本語)</option>
                        <option value="french">French (Français)</option>
                        <option value="chinese">Chinese (中文)</option>
                      </select>
                    )}
                  </div>
                  <p className={`${prefix}-text-secondary mb-2`}>
                    {storyBible.dialogueLanguage === 'tagalog' && 
                      '🇵🇭 All dialogue will be generated in authentic Taglish (Tagalog-English code-switching) with Filipino cultural expressions and values.'}
                    {storyBible.dialogueLanguage === 'thai' && 
                      '🇹🇭 All dialogue will be generated in Thai script with appropriate politeness particles and cultural context.'}
                    {storyBible.dialogueLanguage === 'spanish' && 
                      '🇪🇸 All dialogue will be generated in Spanish with natural conversational flow and cultural nuances.'}
                    {storyBible.dialogueLanguage === 'korean' && 
                      '🇰🇷 All dialogue will be generated in Korean script with appropriate speech levels and honorifics.'}
                    {storyBible.dialogueLanguage === 'japanese' && 
                      '🇯🇵 All dialogue will be generated in Japanese with appropriate politeness levels and cultural expressions.'}
                    {storyBible.dialogueLanguage === 'french' && 
                      '🇫🇷 All dialogue will be generated in French with appropriate formality and cultural nuances.'}
                    {storyBible.dialogueLanguage === 'chinese' && 
                      '🇨🇳 All dialogue will be generated in Mandarin Chinese characters with cultural context.'}
                    {(!storyBible.dialogueLanguage || storyBible.dialogueLanguage === 'english') && 
                      '🇺🇸 All dialogue will be generated in English (default).'}
                  </p>
                  <p className={`text-sm ${prefix}-text-tertiary italic`}>
                    Note: Narrative prose and scene descriptions remain in English for readability. Only character dialogue uses the selected language.
                  </p>
                </div>
                
                {storyBible.dialogueStrategy && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Character Voice</h3>
                      <EditableField
                        value={storyBible.dialogueStrategy?.characterVoice || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.dialogueStrategy) updated.dialogueStrategy = {}
                          updated.dialogueStrategy.characterVoice = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter character voice..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Conflict Dialogue</h3>
                      <EditableField
                        value={storyBible.dialogueStrategy?.conflictDialogue || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.dialogueStrategy) updated.dialogueStrategy = {}
                          updated.dialogueStrategy.conflictDialogue = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter conflict dialogue..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Subtext</h3>
                      <EditableField
                        value={storyBible.dialogueStrategy?.subtext || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.dialogueStrategy) updated.dialogueStrategy = {}
                          updated.dialogueStrategy.subtext = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter subtext..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Speech Patterns</h3>
                      <EditableField
                        value={storyBible.dialogueStrategy?.speechPatterns || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.dialogueStrategy) updated.dialogueStrategy = {}
                          updated.dialogueStrategy.speechPatterns = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter speech patterns..."
                      />
                  </div>
                </div>
                )}
              </motion.div>
            )}

            {/* Genre Enhancement Section */}
            {activeSection === 'genre' && storyBible.genreEnhancement && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Genre</h2>
                  <p className={`text-base ${prefix}-text-secondary mb-8`}>
                    Analyzes and suggests ways to enhance the story's adherence to or subversion of its primary genre conventions.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Visual Style</h3>
                      <EditableField
                        value={storyBible.genreEnhancement?.visualStyle || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.genreEnhancement) updated.genreEnhancement = {}
                          updated.genreEnhancement.visualStyle = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter visual style..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Pacing</h3>
                      <EditableField
                        value={storyBible.genreEnhancement?.pacing || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.genreEnhancement) updated.genreEnhancement = {}
                          updated.genreEnhancement.pacing = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter pacing..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Tropes</h3>
                      <EditableField
                        value={storyBible.genreEnhancement?.tropes || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.genreEnhancement) updated.genreEnhancement = {}
                          updated.genreEnhancement.tropes = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter tropes..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Audience Expectations</h3>
                      <EditableField
                        value={storyBible.genreEnhancement?.audienceExpectations || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.genreEnhancement) updated.genreEnhancement = {}
                          updated.genreEnhancement.audienceExpectations = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={3}
                        placeholder="Enter audience expectations..."
                      />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Theme Integration Section */}
            {activeSection === 'theme' && storyBible.themeIntegration && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Theme</h2>
                  <p className={`text-base ${prefix}-text-secondary mb-8`}>
                    Details how the central themes are woven into the narrative, characters, and choices, ensuring a consistent and impactful thematic message.
                  </p>
                </div>
              <div className="space-y-6">
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Character Integration</h3>
                      <EditableField
                        value={storyBible.themeIntegration?.characterIntegration || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.themeIntegration) updated.themeIntegration = {}
                          updated.themeIntegration.characterIntegration = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={4}
                        placeholder="Enter character integration..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Plot Integration</h3>
                      <EditableField
                        value={storyBible.themeIntegration?.plotIntegration || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.themeIntegration) updated.themeIntegration = {}
                          updated.themeIntegration.plotIntegration = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={4}
                        placeholder="Enter plot integration..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Symbolic Elements</h3>
                      <EditableField
                        value={storyBible.themeIntegration?.symbolicElements || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.themeIntegration) updated.themeIntegration = {}
                          updated.themeIntegration.symbolicElements = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={4}
                        placeholder="Enter symbolic elements..."
                      />
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-3`}>Resolution Strategy</h3>
                      <EditableField
                        value={storyBible.themeIntegration?.resolutionStrategy || ''}
                        onSave={async (newValue) => {
                          const updated = { ...storyBible }
                          if (!updated.themeIntegration) updated.themeIntegration = {}
                          updated.themeIntegration.resolutionStrategy = newValue as string
                          await saveStoryBibleData(updated)
                        }}
                        multiline
                        rows={4}
                        placeholder="Enter resolution strategy..."
                      />
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
          </div>
        </div>
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

      {/* Investor Share Modal */}
      {user && storyBible && storyBible.id && (
        <ShareInvestorMaterialsModal
          isOpen={showInvestorShareModal}
          onClose={() => setShowInvestorShareModal(false)}
          storyBibleId={storyBible.id}
          arcIndex={selectedArcIndex}
          ownerId={user.id}
          ownerName={user.displayName || user.email || 'Unknown User'}
        />
      )}

      {/* Character Creator Modal */}
      <CharacterCreatorModal
        isOpen={showCharacterWizard}
        onClose={() => setShowCharacterWizard(false)}
        onComplete={handleWizardComplete}
        storyBible={storyBible}
      />

      {/* Character Detail Modal */}
      {selectedCharacterIndex !== null && storyBible?.mainCharacters?.[selectedCharacterIndex] && (
        <CharacterDetailModal
          isOpen={showCharacterModal}
          onClose={() => {
            setShowCharacterModal(false)
            setSelectedCharacterIndex(null)
          }}
          character={(() => {
            const char = storyBible.mainCharacters[selectedCharacterIndex]
            console.log('🎭 [PAGE] Passing character to modal:', {
              index: selectedCharacterIndex,
              name: char?.name,
              hasPhysiology: !!char?.physiology,
              hasSociology: !!char?.sociology,
              hasPsychology: !!char?.psychology,
              physiologyData: char?.physiology ? {
                age: char.physiology.age,
                gender: char.physiology.gender,
                appearance: char.physiology.appearance?.substring(0, 50)
              } : null,
              sociologyData: char?.sociology ? {
                occupation: char.sociology.occupation,
                education: char.sociology.education
              } : null,
              psychologyData: char?.psychology ? {
                want: typeof char.psychology.want === 'string' 
                  ? char.psychology.want.substring(0, 50)
                  : char.psychology.want?.consciousGoal?.substring(0, 50)
              } : null,
              fullCharacter: JSON.stringify(char, null, 2).substring(0, 500)
            })
            return char
          })()}
          characterIndex={selectedCharacterIndex}
          onSave={handleCharacterSave}
          onDelete={() => {
            if (confirm(`Are you sure you want to delete "${storyBible.mainCharacters[selectedCharacterIndex].name}"? This cannot be undone.`)) {
              deleteCharacter(selectedCharacterIndex)
            }
          }}
          isLocked={isStoryBibleLocked}
          theme={theme}
          editingField={editingField}
          editValue={editValue}
          onStartEditing={startEditing}
          onSaveEdit={saveEdit}
          onCancelEditing={cancelEditing}
          onEditValueChange={setEditValue}
        />
      )}

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

      {/* Generate Images Modal */}
      {user && storyBible && storyBible.id && (
        <GenerateImagesModal
          isOpen={showGenerateImagesModal}
          onClose={() => setShowGenerateImagesModal(false)}
          storyBibleId={storyBible.id}
          userId={user.id}
          storyBible={storyBible}
          onComplete={handleGenerateImagesComplete}
        />
      )}
    </div>
  )
}