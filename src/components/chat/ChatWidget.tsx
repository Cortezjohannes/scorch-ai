'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from '@/components/ui/ClientMotion'
import { useChat } from '@/context/ChatContext'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { usePathname, useSearchParams } from 'next/navigation'
import MarkdownMessage from './MarkdownMessage'

export default function ChatWidget() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  const { user } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isMobile, setIsMobile] = useState(false)
  
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    isOpen,
    setIsOpen,
    hasSeenWelcome,
    markWelcomeSeen,
    addReaction,
    getReaction,
    saveInsight,
    isInsightSaved
  } = useChat()

  const [input, setInput] = useState('')
  const [storyBibleId, setStoryBibleId] = useState<string | null>(null)
  const [storyBible, setStoryBible] = useState<any>(null)
  const [episodes, setEpisodes] = useState<any[]>([])
  const [currentEpisode, setCurrentEpisode] = useState<any>(null)
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState<number | null>(null)
  const [preProductionData, setPreProductionData] = useState<any>(null)
  const [arcPreProductionData, setArcPreProductionData] = useState<Record<number, any>>({})
  const [actorMaterialsData, setActorMaterialsData] = useState<Record<number, any>>({})
  const [postProductionData, setPostProductionData] = useState<Record<number, any>>({})
  const [pageContent, setPageContent] = useState<string | null>(null)
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(false)
  const [hasSeenChat, setHasSeenChat] = useState(false)
  const [showEasterEggAnimation, setShowEasterEggAnimation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const welcomeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Smart storyBibleId detection
  const detectStoryBibleId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null
    
    // 1. Check if we're on an investor materials page
    if (pathname?.includes('/investor/')) {
      const linkIdMatch = pathname.match(/\/investor\/([^/]+)/)
      if (linkIdMatch) {
        const linkId = linkIdMatch[1]
        // Try to get storyBibleId from investor materials (stored in sessionStorage or fetch it)
        try {
          const investorData = sessionStorage.getItem(`investor-materials-${linkId}`)
          if (investorData) {
            const data = JSON.parse(investorData)
            if (data?.investorPackage?.storyBibleId) {
              return data.investorPackage.storyBibleId
            }
          }
        } catch (e) {
          console.error('Error parsing investor materials from sessionStorage:', e)
        }
      }
    }
    
    // 2. Check URL params
    const urlId = searchParams?.get('id') || searchParams?.get('storyBibleId')
    if (urlId) return urlId
    
    // 3. Check localStorage
    try {
      const stored = localStorage.getItem('greenlit-story-bible')
      if (stored) {
        const data = JSON.parse(stored)
        const bible = data.storyBible || data
        return bible?.id || null
      }
    } catch (e) {
      console.error('Error parsing story bible from localStorage:', e)
    }
    
    return null
  }, [searchParams, pathname])

  // Detect current episode number from URL
  const detectCurrentEpisodeNumber = useCallback((): number | null => {
    if (typeof window === 'undefined' || !pathname) return null
    
    // Check for episode number in URL patterns:
    // /episode/[id]
    // /preproduction/episode/[episodeNumber]
    // /workspace (check searchParams)
    
    const episodeMatch = pathname.match(/\/episode\/(\d+)/)
    if (episodeMatch) {
      return parseInt(episodeMatch[1])
    }
    
    const preprodMatch = pathname.match(/\/preproduction\/episode\/(\d+)/)
    if (preprodMatch) {
      return parseInt(preprodMatch[1])
    }
    
    // Check search params
    const episodeParam = searchParams?.get('episodeNumber')
    if (episodeParam) {
      const num = parseInt(episodeParam)
      if (!isNaN(num)) return num
    }
    
    return null
  }, [pathname, searchParams])

  // Helper function to extract page content
  const extractPageContent = useCallback((): string | null => {
    if (typeof window === 'undefined' || !pathname) return null
    
    try {
      // Get the main content area (varies by page type)
      const content: string[] = []
      
      // Extract text from common content areas
      const contentSelectors = [
        'main',
        '[role="main"]',
        '.content',
        '.main-content',
        'article',
        '.episode-content',
        '.preproduction-content',
        '.story-bible-content'
      ]
      
      for (const selector of contentSelectors) {
        const element = document.querySelector(selector)
        if (element) {
          const text = element.textContent?.trim()
          if (text && text.length > 50) {
            content.push(text.substring(0, 2000)) // Limit to 2000 chars
            break // Use first match
          }
        }
      }
      
      // Also try to get the page title
      const title = document.title || ''
      if (title) {
        content.unshift(`Page: ${title}`)
      }
      
      // Get URL path info
      if (pathname) {
        content.unshift(`Current Page: ${pathname}`)
      }
      
      return content.length > 0 ? content.join('\n\n') : null
    } catch (e) {
      return null
    }
  }, [pathname])

  // Function to load story bible and all related data
  const loadStoryBible = useCallback(async () => {
    if (typeof window === 'undefined') return
    
    // Check if we're on an investor materials page
    const isInvestorPage = pathname?.includes('/investor/')
    let investorMaterials: any = null
    
    if (isInvestorPage) {
      const linkIdMatch = pathname.match(/\/investor\/([^/]+)/)
      if (linkIdMatch) {
        const linkId = linkIdMatch[1]
        try {
          // Try to get from sessionStorage first (set by investor page)
          const cached = sessionStorage.getItem(`investor-materials-${linkId}`)
          if (cached) {
            investorMaterials = JSON.parse(cached)
          } else {
            // Fetch investor materials
            const response = await fetch(`/api/investor-shared/${linkId}`)
            if (response.ok) {
              const data = await response.json()
              if (data.success && data.materials) {
                investorMaterials = data.materials
                // Cache it for this session
                sessionStorage.setItem(`investor-materials-${linkId}`, JSON.stringify(investorMaterials))
              }
            }
          }
          
          // Extract storyBibleId and data from investor materials
          if (investorMaterials?.investorPackage) {
            const pkg = investorMaterials.investorPackage
            const storyBibleIdFromInvestor = pkg.storyBibleId
            if (storyBibleIdFromInvestor) {
              setStoryBibleId(storyBibleIdFromInvestor)
              
              // Build story bible from investor materials
              const storyBibleFromInvestor = {
                id: storyBibleIdFromInvestor,
                seriesTitle: pkg.hook?.seriesTitle || 'Untitled',
                seriesOverview: pkg.hook?.synopsis || pkg.hook?.logline || '',
                synopsis: pkg.hook?.synopsis || pkg.hook?.logline || '',
                theme: pkg.hook?.theme || '',
                genre: pkg.hook?.genre || '',
                mainCharacters: pkg.characters?.mainCharacters?.map((char: any) => ({
                  name: char.name,
                  description: char.background || char.motivation || '',
                  arc: char.arc || ''
                })) || [],
                narrativeArcs: pkg.story?.arcTitle ? [{
                  title: pkg.story.arcTitle,
                  description: pkg.story.arcDescription || ''
                }] : [],
                worldBuilding: {
                  setting: pkg.depth?.world?.setting || ''
                }
              }
              setStoryBible(storyBibleFromInvestor)
              
              // Build episodes from investor materials
              const episodesFromInvestor = (pkg.story?.episodes || []).map((ep: any) => ({
                episodeNumber: ep.episodeNumber,
                title: ep.title,
                synopsis: ep.summary || ep.episodeRundown || '',
                scenes: ep.scenes || [],
                rundown: ep.episodeRundown || '',
                branchingOptions: []
              }))
              setEpisodes(episodesFromInvestor)
              
              console.log('✅ Loaded story bible and episodes from investor materials:', storyBibleIdFromInvestor)
              return // Early return for investor materials
            }
          }
        } catch (e) {
          console.error('Error loading investor materials:', e)
        }
      }
    }
    
    const detectedId = detectStoryBibleId()
    setStoryBibleId(detectedId)
    
    const episodeNum = detectCurrentEpisodeNumber()
    setCurrentEpisodeNumber(episodeNum)
    
    try {
      // Try to fetch latest story bible from Firestore if authenticated
      if (detectedId && user?.id) {
        try {
          const { getStoryBible } = await import('@/services/story-bible-service')
          const latestBible = await getStoryBible(detectedId, user.id)
          if (latestBible) {
            setStoryBible(latestBible)
            console.log('✅ Loaded latest story bible from Firestore:', latestBible.seriesTitle)
          }
        } catch (e) {
          console.warn('⚠️ Could not fetch from Firestore, using localStorage:', e)
          // Fallback to localStorage
          const stored = localStorage.getItem('greenlit-story-bible')
          if (stored) {
            const data = JSON.parse(stored)
            const bible = data.storyBible || data
            if (bible?.id) {
              setStoryBible(bible)
            }
          }
        }
      } else {
        // Load story bible from localStorage (guest mode)
        const stored = localStorage.getItem('greenlit-story-bible')
        if (stored) {
          const data = JSON.parse(stored)
          const bible = data.storyBible || data
          if (bible?.id) {
            setStoryBible(bible)
          }
        }
      }
      
      // Load ALL episodes with FULL content (from Firestore if authenticated, otherwise localStorage)
      if (detectedId) {
        try {
          // Try Firestore first if authenticated
          if (user?.id) {
            const { getEpisodesForStoryBible } = await import('@/services/episode-service')
            const episodesRecord = await getEpisodesForStoryBible(detectedId, user.id)
            const episodesList = Object.values(episodesRecord).sort((a, b) => a.episodeNumber - b.episodeNumber)
            
            if (episodesList.length > 0) {
              setEpisodes(episodesList)
              console.log(`✅ Loaded ${episodesList.length} episodes from Firestore with full content`)
              
              // If we're on an episode page, set that as current
              if (episodeNum) {
                const episode = episodesRecord[episodeNum]
                if (episode) {
                  setCurrentEpisode(episode)
                  console.log('📺 Loaded current episode from Firestore:', episodeNum, episode.title || episode.episodeTitle)
                }
              }
            } else {
              // Fallback to localStorage if Firestore has no episodes
              console.log('⚠️ No episodes in Firestore, trying localStorage...')
              throw new Error('No episodes in Firestore')
            }
          } else {
            // Guest mode: load from localStorage
            throw new Error('Guest mode - use localStorage')
          }
        } catch (e) {
          // Fallback to localStorage
          const possibleKeys = [
            `episodes-${detectedId}`,
            'scorched-episodes',
            'greenlit-episodes',
            'reeled-episodes'
          ]
          
          for (const key of possibleKeys) {
            const storedEpisodes = localStorage.getItem(key)
            if (storedEpisodes) {
              try {
                const episodesData = JSON.parse(storedEpisodes)
                const episodesList = Array.isArray(episodesData) 
                  ? episodesData 
                  : Object.values(episodesData)
                if (episodesList.length > 0) {
                  setEpisodes(episodesList)
                  console.log(`✅ Loaded ${episodesList.length} episodes from localStorage`)
                  
                  // If we're on an episode page, load that specific episode
                  if (episodeNum) {
                    const episode = Array.isArray(episodesData) 
                      ? episodesData.find((ep: any) => ep.episodeNumber === episodeNum)
                      : episodesData[episodeNum]
                    if (episode) {
                      setCurrentEpisode(episode)
                      console.log('📺 Loaded current episode from localStorage:', episodeNum, episode.title || episode.episodeTitle)
                    }
                  }
                  break
                }
              } catch (parseError) {
                // Continue to next key
              }
            }
          }
        }
      }
      
      // Load pre-production data if on pre-production page
      if (episodeNum && detectedId && user?.id && pathname?.includes('/preproduction')) {
        try {
          const { getEpisodePreProduction } = await import('@/services/preproduction-firestore')
          const preProd = await getEpisodePreProduction(user.id, detectedId, episodeNum)
          if (preProd) {
            setPreProductionData(preProd)
            console.log('🎬 Loaded pre-production data for episode:', episodeNum)
          }
        } catch (e) {
          console.warn('Could not load pre-production data:', e)
        }
      }

      // Load ALL production materials (arc pre-production, actor materials, post-production)
      // Get the story bible we just loaded (or load it if needed)
      let loadedStoryBible = null
      if (detectedId && user?.id) {
        try {
          const { getStoryBible } = await import('@/services/story-bible-service')
          loadedStoryBible = await getStoryBible(detectedId, user.id)
        } catch (e) {
          // Use localStorage fallback
          const stored = localStorage.getItem('greenlit-story-bible')
          if (stored) {
            const data = JSON.parse(stored)
            loadedStoryBible = data.storyBible || data
          }
        }
      }
      
      if (detectedId && user?.id && loadedStoryBible) {
        try {
          const { getArcPreProduction, getEpisodePreProduction, getEpisodeRangeForArc } = await import('@/services/preproduction-firestore')
          const { getActorMaterials } = await import('@/services/actor-materials-firestore')
          
          const arcPreProdMap: Record<number, any> = {}
          const actorMaterialsMap: Record<number, any> = {}
          const postProdMap: Record<number, any> = {}
          
          // Load data for all arcs
          const arcs = loadedStoryBible.narrativeArcs || []
          for (let arcIndex = 0; arcIndex < arcs.length; arcIndex++) {
            try {
              // Load arc pre-production (production assistant)
              const arcPreProd = await getArcPreProduction(user.id, detectedId, arcIndex)
              if (arcPreProd) {
                arcPreProdMap[arcIndex] = arcPreProd
                console.log(`✅ Loaded arc pre-production for arc ${arcIndex}`)
              }
              
              // Load actor materials
              const actorMaterials = await getActorMaterials(user.id, detectedId, arcIndex)
              if (actorMaterials) {
                actorMaterialsMap[arcIndex] = actorMaterials
                console.log(`✅ Loaded actor materials for arc ${arcIndex}`)
              }
              
              // Load post-production data (from episode pre-production, stored in postProduction field)
              const episodeNumbers = getEpisodeRangeForArc(loadedStoryBible, arcIndex)
              for (const epNum of episodeNumbers) {
                try {
                  const epPreProd = await getEpisodePreProduction(user.id, detectedId, epNum)
                  if (epPreProd?.postProduction) {
                    postProdMap[epNum] = epPreProd.postProduction
                    console.log(`✅ Loaded post-production data for episode ${epNum}`)
                  }
                } catch (e) {
                  // Continue if episode doesn't have post-production
                }
              }
            } catch (e) {
              console.warn(`⚠️ Could not load materials for arc ${arcIndex}:`, e)
            }
          }
          
          setArcPreProductionData(arcPreProdMap)
          setActorMaterialsData(actorMaterialsMap)
          setPostProductionData(postProdMap)
          console.log(`✅ Loaded production materials: ${Object.keys(arcPreProdMap).length} arcs, ${Object.keys(actorMaterialsMap).length} actor materials, ${Object.keys(postProdMap).length} post-production entries`)
        } catch (e) {
          console.warn('⚠️ Could not load production materials:', e)
        }
      }

      // Detect page content (what the user is currently viewing)
      if (typeof window !== 'undefined') {
        try {
          const pageContentText = extractPageContent()
          if (pageContentText) {
            setPageContent(pageContentText)
            console.log('📄 Detected page content:', pageContentText.substring(0, 100) + '...')
          }
        } catch (e) {
          console.warn('⚠️ Could not extract page content:', e)
        }
      }
    } catch (e) {
      console.error('Error loading story bible:', e)
    }
  }, [detectStoryBibleId, detectCurrentEpisodeNumber, user?.id, pathname, extractPageContent])

  // Load story bible and check if user has seen chat
  useEffect(() => {
    loadStoryBible().catch(console.error)
    
    // Check if user has seen chat before
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('chat-button-seen')
      setHasSeenChat(seen === 'true')
    }
  }, [loadStoryBible, pathname, searchParams])

  // Load chat session when storyBibleId changes
  const { loadSession } = useChat()
  useEffect(() => {
    if (storyBibleId) {
      loadSession(storyBibleId)
    }
  }, [storyBibleId, loadSession])

  // Listen for localStorage changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'greenlit-story-bible' && e.newValue) {
        loadStoryBible()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    const handleCustomStorageChange = () => {
      loadStoryBible()
    }
    window.addEventListener('storyBibleUpdated', handleCustomStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('storyBibleUpdated', handleCustomStorageChange)
    }
  }, [loadStoryBible])

  // Detect page context for contextual prompts
  const getPageContext = useCallback(() => {
    if (!pathname) return null
    if (pathname.includes('/story-bible')) return 'story-bible'
    if (pathname.includes('/workspace')) return 'workspace'
    if (pathname.includes('/episode')) return 'episode'
    if (pathname.includes('/preproduction')) return 'preproduction'
    if (pathname.includes('/postproduction') || pathname.includes('/production')) return 'production'
    if (pathname.includes('/dashboard')) return 'dashboard'
    return null
  }, [pathname])

  // Get contextual welcome message with variations
  const getContextualWelcomeMessage = useCallback(() => {
    const context = getPageContext()
    
    const messages: Record<string, string[]> = {
      'story-bible': [
        'Want me to give my input about the characters?',
        'Need help refining your story world?',
        'Want feedback on your character arcs?',
        'Want me to analyze your story structure?',
        'Need help developing your characters?'
      ],
      'workspace': [
        'Want to brainstorm this episode with me?',
        'Stuck on what happens next? Let\'s talk it through.',
        'Need help developing this episode?',
        'Want to explore different plot directions?',
        'Want me to help you refine this episode?'
      ],
      'episode': [
        'Want me to review this episode?',
        'Want feedback on this episode?',
        'Want me to check this episode for issues?',
        'Need help improving this episode?',
        'Want me to analyze this episode?'
      ],
      'preproduction': [
        'Want me to cover any plotholes?',
        'Need help with pre-production planning?',
        'Want me to review your production plan?',
        'Want me to check for continuity issues?',
        'Need help optimizing your production setup?'
      ],
      'production': [
        'Need advice on how to make the production cheaper?',
        'Want tips to streamline production?',
        'Need help with production logistics?',
        'Want me to review your production workflow?',
        'Need advice on production efficiency?'
      ],
      'dashboard': [
        'Want to discuss your series?',
        'Need help with your project?',
        'Want to brainstorm ideas?',
        'Want me to review your work?'
      ]
    }
    
    const contextMessages = messages[context || ''] || messages['dashboard']
    // Randomly select a message from the array
    return contextMessages[Math.floor(Math.random() * contextMessages.length)]
  }, [getPageContext])

  // Show contextual welcome tooltip on page visit
  useEffect(() => {
    if (storyBibleId && !isOpen) {
      // Track if we've shown a tooltip for this page context in this session
      const context = getPageContext()
      const tooltipKey = `chat-tooltip-${context || 'default'}`
      
      // Check if we've shown tooltip for this page context in this session
      const hasShownForContext = sessionStorage.getItem(tooltipKey) === 'true'
      
      // Show tooltip if we haven't shown it for this context, or if it's been more than 5 minutes
      const lastShown = sessionStorage.getItem(`${tooltipKey}-time`)
      const shouldShow = !hasShownForContext || (lastShown && Date.now() - parseInt(lastShown) > 5 * 60 * 1000)
      
      if (shouldShow) {
        const timer = setTimeout(() => {
          setShowWelcomeTooltip(true)
          sessionStorage.setItem(tooltipKey, 'true')
          sessionStorage.setItem(`${tooltipKey}-time`, Date.now().toString())
          
          welcomeTimeoutRef.current = setTimeout(() => {
            setShowWelcomeTooltip(false)
          }, 12000) // Auto-dismiss after 12 seconds
        }, 2000) // Show after 2 seconds
        return () => {
          clearTimeout(timer)
          if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current)
        }
      }
    }
  }, [storyBibleId, isOpen, pathname, getPageContext])

  // Mark chat button as seen when clicked
  const handleOpenChat = () => {
    setIsOpen(true)
    setShowWelcomeTooltip(false)
    if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current)
    if (!hasSeenChat && typeof window !== 'undefined') {
      localStorage.setItem('chat-button-seen', 'true')
      setHasSeenChat(true)
    }
  }

  // Auto-scroll to bottom only if user is already near the bottom
  useEffect(() => {
    const messagesContainer = messagesEndRef.current?.parentElement
    if (!messagesContainer) return
    
    const isNearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 100
    
    // Only auto-scroll if user is already near the bottom (within 100px)
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Detect easter egg and trigger animation
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content) {
      const hasEasterEgg = lastMessage.content.includes('EASTER EGG FOUND') || 
                           lastMessage.content.includes('Yohan Cortez') ||
                           lastMessage.content.includes('glorious king')
      
      if (hasEasterEgg) {
        setShowEasterEggAnimation(true)
        // Hide animation after 3 seconds
        const timer = setTimeout(() => {
          setShowEasterEggAnimation(false)
        }, 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Keyboard shortcut (Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (storyBibleId) {
          handleOpenChat()
        }
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [storyBibleId])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading || !storyBibleId) return

    const message = input.trim()
    setInput('')
    
    // Reload all data before sending to ensure we have the latest
    await loadStoryBible()
    
    // Send message with all available context (EVERYTHING in the series)
    await sendMessage(
      message, 
      storyBibleId, 
      storyBible, 
      episodes, 
      user?.id,
      currentEpisode,
      currentEpisodeNumber,
      preProductionData,
      arcPreProductionData,
      actorMaterialsData,
      postProductionData,
      pageContent
    )
  }

  const handleExampleQuestion = (question: string) => {
    setInput(question)
    setTimeout(() => {
      handleSend()
    }, 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getContextualPrompt = () => {
    const context = getPageContext()
    const prompts: Record<string, string> = {
      dashboard: '💡 Need help? Ask Chief: the Co-Showrunner',
      'story-bible': '💬 Chat about your story world',
      workspace: '🤔 Stuck? Get AI suggestions',
      episode: '💬 Discuss this episode',
      preproduction: '💡 Get production insights'
    }
    return prompts[context || ''] || null
  }

  // Progressive disclosure hints
  const getProgressiveHint = () => {
    if (messages.length === 1) {
      return '💡 Tip: You can ask about specific episodes, characters, or arcs'
    }
    if (messages.length === 3) {
      return '💡 Tip: Try asking "What if..." questions to brainstorm plot ideas'
    }
    if (messages.length === 10) {
      return '💡 Power user tip: Save insights you find useful with the 💾 button'
    }
    return null
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Don't show widget on landing, login, or profile pages
  const shouldHideChatbot = () => {
    if (!pathname) return true
    
    // Hide on these pages
    const hidePages = [
      '/',
      '/landing',
      '/login',
      '/signup',
      '/profile',
      '/greenlit-landing.html'
    ]
    
    // Check if current path matches any hide pages
    if (hidePages.some(page => pathname === page || pathname.startsWith(page + '/'))) {
      return true
    }
    
    // Hide on demo page if user is not authenticated
    if (pathname.includes('/demo')) {
      return !user // Hide if not logged in
    }
    
    // For all other pages, require storyBibleId
    return !storyBibleId
  }
  
  if (shouldHideChatbot()) return null

  const exampleQuestions = [
    'Tell me about my main characters',
    'What happens in Episode 1?',
    'Explain the story arcs',
    'Brainstorm plot ideas',
    'Can you check for plotholes?',
    'Who built greenlit?'
  ]

  return (
    <>
      {/* Easter Egg Celebration Animation */}
      <AnimatePresence>
        {showEasterEggAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
          >
            {/* Confetti/Particle Effect */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-3 h-3 rounded-full ${
                    ['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-pink-400', 'bg-purple-400'][i % 5]
                  }`}
                  initial={{
                    x: '50vw',
                    y: '50vh',
                    scale: 0,
                    opacity: 1
                  }}
                  animate={{
                    x: `calc(50vw + ${(Math.random() - 0.5) * 1000}px)`,
                    y: `calc(50vh + ${(Math.random() - 0.5) * 1000}px)`,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: Math.random() * 0.5,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </div>
            {/* Celebration Message */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="relative z-10 bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-400 text-white px-8 py-6 rounded-2xl shadow-2xl text-center"
            >
              <div className="text-6xl mb-2">🎉</div>
              <div className="text-2xl font-bold">EASTER EGG FOUND!</div>
              <div className="text-sm mt-2 opacity-90">You discovered our glorious CEO!</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contextual Welcome Tooltip - Facebook Chat Bubble Style */}
      <AnimatePresence>
        {showWelcomeTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
            className="fixed bottom-24 right-6 z-[60] max-w-xs"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))' }}
          >
            {/* Chat Bubble */}
            <div className={`relative ${isDark ? 'bg-[#2A2A2A]' : 'bg-white'} rounded-2xl rounded-br-sm shadow-xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              {/* Chat bubble tail pointing to the button */}
              <div 
                className="absolute -bottom-2 right-6 w-0 h-0"
                style={{
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: `8px solid ${isDark ? '#2A2A2A' : '#ffffff'}`,
                  filter: isDark ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                }}
              />
              
              <div className="p-4">
                {/* Avatar and message */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <img 
                      src="/IMG_1361.jpg" 
                      alt="Chief" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#10B981]/30"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold mb-1" style={{ color: isDark ? '#10B981' : '#059669' }}>
                      Chief
                    </p>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {getContextualWelcomeMessage()}
                    </p>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                  <button
                    onClick={() => {
                      handleOpenChat()
                      setShowWelcomeTooltip(false)
                      if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current)
                    }}
                    className="flex-1 bg-[#10B981] text-black px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#059669] transition-colors"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      setShowWelcomeTooltip(false)
                      if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current)
                    }}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      isDark 
                        ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Floating Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open Chief: the Co-Showrunner"
        >
          {/* Pulsing ring animation */}
          {(!hasSeenChat || !hasSeenWelcome) && (
            <motion.div
              className="absolute inset-0 rounded-full bg-[#10B981] opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
          
          {/* Main button */}
          <div className={`relative w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${
            isDark 
              ? 'bg-[#10B981] text-black hover:bg-[#059669]' 
              : 'bg-black text-white hover:bg-gray-800'
          }`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            
            {/* NEW badge */}
            {!hasSeenChat && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                NEW
              </span>
            )}
            
            {/* Status indicator */}
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
              isDark ? 'border-[#1A1A1A]' : 'border-white'
            } ${
              isLoading ? 'bg-yellow-500' : storyBibleId ? 'bg-[#10B981]' : 'bg-gray-400'
            }`} />
          </div>
          
          {/* Hover tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            <div className={`bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg ${
              isDark ? '' : ''
            }`}>
              💬 Chief: the Co-Showrunner
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-black"></div>
            </div>
          </div>
        </motion.button>
      )}

      {/* Chat Widget - Desktop/Tablet */}
      <AnimatePresence>
        {isOpen && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 w-96 h-[600px] rounded-2xl shadow-2xl flex flex-col backdrop-blur-xl ${
              isDark 
                ? 'bg-[#1A1A1A]/95 border border-white/10' 
                : 'bg-white/95 border border-gray-200/50'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${
              isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src="/IMG_1361.jpg" 
                    alt="Chief: the Co-Showrunner" 
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#10B981]/30"
                  />
                  {isLoading && (
                    <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-pulse" />
                  )}
                  {!isLoading && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-white dark:border-[#1A1A1A]">
                      <div className="absolute inset-0 bg-[#10B981] rounded-full animate-ping opacity-75" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Chief: the Co-Showrunner
                  </h3>
                  {storyBibleId && (
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      {storyBible?.seriesTitle || 'Story'}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                  isDark ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Enhanced Empty State */}
              {messages.length === 0 && !isLoading && (
                <div className={`text-center py-12 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                  <div className="text-5xl mb-6">💬</div>
                  <p className="text-base mb-2 font-semibold">Hi! I'm Chief: the Co-Showrunner</p>
                  <p className="text-sm mb-8 opacity-70">Ask me anything about your story!</p>
                  
                  {/* Example Questions */}
                  <div className="space-y-3 px-2">
                    {exampleQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleExampleQuestion(question)}
                        className={`w-full text-left text-sm p-4 rounded-xl transition-all duration-200 ${
                          isDark 
                            ? 'bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10' 
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="mr-2">💡</span>
                        {question}
                      </button>
                    ))}
                  </div>
                  
                  {/* Contextual Prompt */}
                  {getContextualPrompt() && (
                    <p className="text-xs mt-6 opacity-60">{getContextualPrompt()}</p>
                  )}
                </div>
              )}

              {/* Messages */}
              {messages
                .filter((message) => {
                  // Filter out empty assistant messages (they're placeholders for streaming)
                  if (message.role === 'assistant' && !message.content.trim()) {
                    return false
                  }
                  return true
                })
                .map((message) => {
                const reaction = getReaction(message.id)
                const isSaved = isInsightSaved(message.id)
                
                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    {message.role === 'user' ? (
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        isDark
                          ? 'bg-[#10B981] text-black'
                          : 'bg-black text-white'
                      }`}>
                        You
                      </div>
                    ) : (
                      <img 
                        src="/IMG_1361.jpg" 
                        alt="Chief: the Co-Showrunner" 
                        className="flex-shrink-0 w-12 h-12 rounded-full object-cover border border-[#10B981]/30"
                      />
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          message.role === 'user'
                            ? isDark
                              ? 'bg-[#10B981] text-black rounded-br-sm'
                              : 'bg-black text-white rounded-br-sm'
                            : isDark
                            ? 'bg-white/5 text-white border border-white/10 rounded-bl-sm'
                            : 'bg-gray-50 text-gray-900 border border-gray-200 rounded-bl-sm'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <MarkdownMessage
                            content={message.content}
                            className={`text-sm leading-relaxed text-[15px]`}
                          />
                        ) : (
                          <p className={`text-sm leading-relaxed whitespace-pre-wrap`}>
                            {message.content}
                          </p>
                        )}
                        {message.references && (
                          <div className={`mt-3 pt-3 border-t ${
                            message.role === 'user'
                              ? 'border-black/20'
                              : isDark ? 'border-white/10' : 'border-gray-200'
                          }`}>
                            <p className={`text-xs ${
                              message.role === 'user' ? 'text-black/70' : isDark ? 'text-white/60' : 'text-gray-600'
                            }`}>
                              <span className="font-medium">References:</span> {message.references.characters?.join(', ') || 'None'}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Timestamp and Actions */}
                      <div className={`flex items-center gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} px-1`}>
                        <p className={`text-xs ${
                          isDark ? 'text-white/40' : 'text-gray-400'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </p>
                        
                        {/* Interactive Elements for Assistant Messages */}
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => addReaction(message.id, reaction === 'up' ? 'down' : 'up')}
                              className={`p-1.5 rounded-lg transition-all duration-200 ${
                                reaction === 'up' 
                                  ? isDark
                                    ? 'bg-[#10B981]/20 text-[#10B981]'
                                    : 'bg-[#10B981]/10 text-[#10B981]'
                                  : isDark
                                  ? 'hover:bg-white/10 text-white/50 hover:text-white/70'
                                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                              }`}
                              aria-label="Thumbs up"
                            >
                              <svg className="w-4 h-4" fill={reaction === 'up' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                            </button>
                            <button
                              onClick={() => saveInsight(message.id)}
                              className={`p-1.5 rounded-lg transition-all duration-200 ${
                                isSaved 
                                  ? isDark
                                    ? 'bg-[#10B981]/20 text-[#10B981]'
                                    : 'bg-[#10B981]/10 text-[#10B981]'
                                  : isDark
                                  ? 'hover:bg-white/10 text-white/50 hover:text-white/70'
                                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                              }`}
                              aria-label="Save insight"
                            >
                              <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Progressive Disclosure Hints */}
              {getProgressiveHint() && messages.length > 0 && (
                <div className={`text-center py-2 px-4 rounded-lg ${
                  isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700'
                }`}>
                  <p className="text-xs">{getProgressiveHint()}</p>
                </div>
              )}

              {/* Loading Indicator - Only show if no streaming message with content exists */}
              {isLoading && !messages.some(msg => msg.role === 'assistant' && msg.content.trim()) && (
                <div className="flex items-start gap-3">
                  <img 
                    src="/IMG_1361.jpg" 
                    alt="Chief: the Co-Showrunner" 
                    className="flex-shrink-0 w-12 h-12 rounded-full object-cover border border-[#10B981]/30 opacity-75"
                  />
                  <div className={`rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm ${
                    isDark 
                      ? 'bg-white/5 border border-white/10' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        isDark ? 'bg-[#10B981]' : 'bg-[#10B981]'
                      } animate-bounce`} style={{ animationDelay: '0ms' }} />
                      <div className={`w-2 h-2 rounded-full ${
                        isDark ? 'bg-[#10B981]' : 'bg-[#10B981]'
                      } animate-bounce`} style={{ animationDelay: '150ms' }} />
                      <div className={`w-2 h-2 rounded-full ${
                        isDark ? 'bg-[#10B981]' : 'bg-[#10B981]'
                      } animate-bounce`} style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className={`p-3 rounded-lg ${
                  isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                }`}>
                  <p className="text-sm">Error: {error}</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`px-5 py-4 border-t ${
              isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50/50'
            }`}>
              <form onSubmit={handleSend} className="flex gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    pathname?.includes('/demo') 
                      ? "Generate a story bible first to start chatting..." 
                      : storyBibleId 
                        ? "Ask about your story..." 
                        : "Open a story bible first..."
                  }
                  disabled={isLoading || !storyBibleId}
                  rows={2}
                  className={`flex-1 resize-none rounded-xl px-4 py-3 text-sm ${
                    isDark
                      ? 'bg-white/5 text-white placeholder-white/40 border border-white/10 focus:border-[#10B981]/50'
                      : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-[#10B981]'
                  } focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 transition-all disabled:opacity-50`}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || !storyBibleId}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
                    isDark
                      ? 'bg-[#10B981] text-black hover:bg-[#059669] shadow-lg shadow-[#10B981]/20'
                      : 'bg-[#10B981] text-white hover:bg-[#059669] shadow-lg shadow-[#10B981]/20'
                  }`}
                  aria-label="Send message"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
              
              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className={`mt-3 text-xs ${isDark ? 'text-white/50 hover:text-white/70' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                >
                  Clear history
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Modal - Full Screen */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              className={`absolute bottom-0 left-0 right-0 h-[90vh] rounded-t-xl flex flex-col ${
                isDark 
                  ? 'bg-[#1A1A1A] border-t border-white/10' 
                  : 'bg-white border-t border-gray-200'
              }`}
            >
              {/* Mobile Header */}
              <div className={`flex items-center justify-between p-4 border-b ${
                isDark ? 'border-white/10' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src="/IMG_1361.jpg" 
                      alt="Chief: the Co-Showrunner" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#10B981]/30"
                    />
                    {isLoading && (
                      <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-pulse" />
                    )}
                    {!isLoading && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-white dark:border-[#1A1A1A]">
                        <div className="absolute inset-0 bg-[#10B981] rounded-full animate-ping opacity-75" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                      Chief: the Co-Showrunner
                    </h3>
                    {storyBibleId && (
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        {storyBible?.seriesTitle || 'Story'}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded hover:bg-white/10 transition-colors ${
                    isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Messages - Same content as desktop */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.length === 0 && !isLoading && (
                  <div className={`text-center py-12 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                    <div className="text-5xl mb-6">💬</div>
                    <p className="text-base mb-2 font-semibold">Hi! I'm Chief: the Co-Showrunner</p>
                    <p className="text-sm mb-8 opacity-70">Ask me anything about your story!</p>
                    
                    <div className="space-y-3 px-2">
                      {exampleQuestions.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleExampleQuestion(question)}
                          className={`w-full text-left text-sm p-4 rounded-xl transition-all duration-200 ${
                            isDark 
                              ? 'bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10' 
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="mr-2">💡</span>
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages
                  .filter((message) => {
                    // Filter out empty assistant messages (they're placeholders for streaming)
                    if (message.role === 'assistant' && !message.content.trim()) {
                      return false
                    }
                    return true
                  })
                  .map((message) => {
                  const reaction = getReaction(message.id)
                  const isSaved = isInsightSaved(message.id)
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      {message.role === 'user' ? (
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          isDark
                            ? 'bg-[#10B981] text-black'
                            : 'bg-black text-white'
                        }`}>
                          You
                        </div>
                      ) : (
                        <img 
                          src="/IMG_1361.jpg" 
                          alt="Chief: the Co-Showrunner" 
                          className="flex-shrink-0 w-8 h-8 rounded-full object-cover border border-[#10B981]/30"
                        />
                      )}
                      
                      {/* Message Bubble */}
                      <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            message.role === 'user'
                              ? isDark
                                ? 'bg-[#10B981] text-black rounded-br-sm'
                                : 'bg-black text-white rounded-br-sm'
                              : isDark
                              ? 'bg-white/5 text-white border border-white/10 rounded-bl-sm'
                              : 'bg-gray-50 text-gray-900 border border-gray-200 rounded-bl-sm'
                          }`}
                        >
                          {message.role === 'assistant' ? (
                            <MarkdownMessage
                              content={message.content}
                              className={`text-sm leading-relaxed text-[15px]`}
                            />
                          ) : (
                            <p className={`text-sm leading-relaxed whitespace-pre-wrap`}>
                              {message.content}
                            </p>
                          )}
                        </div>
                        
                        {/* Timestamp and Actions */}
                        <div className={`flex items-center gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} px-1`}>
                          <p className={`text-xs ${
                            isDark ? 'text-white/40' : 'text-gray-400'
                          }`}>
                            {formatTimestamp(message.timestamp)}
                          </p>
                          
                          {message.role === 'assistant' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => addReaction(message.id, reaction === 'up' ? 'down' : 'up')}
                                className={`p-1.5 rounded-lg transition-all duration-200 ${
                                  reaction === 'up' 
                                    ? isDark
                                      ? 'bg-[#10B981]/20 text-[#10B981]'
                                      : 'bg-[#10B981]/10 text-[#10B981]'
                                    : isDark
                                    ? 'hover:bg-white/10 text-white/50 hover:text-white/70'
                                    : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                                }`}
                              >
                                <svg className="w-4 h-4" fill={reaction === 'up' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                              </button>
                              <button
                                onClick={() => saveInsight(message.id)}
                                className={`p-1.5 rounded-lg transition-all duration-200 ${
                                  isSaved 
                                    ? isDark
                                      ? 'bg-[#10B981]/20 text-[#10B981]'
                                      : 'bg-[#10B981]/10 text-[#10B981]'
                                    : isDark
                                    ? 'hover:bg-white/10 text-white/50 hover:text-white/70'
                                    : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                                }`}
                              >
                                <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {isLoading && !messages.some(msg => msg.role === 'assistant' && msg.content.trim()) && (
                  <div className="flex items-start gap-3">
                    <img 
                      src="/IMG_1361.jpg" 
                      alt="Chief: the Co-Showrunner" 
                      className="flex-shrink-0 w-8 h-8 rounded-full object-cover border border-[#10B981]/30 opacity-75"
                    />
                    <div className={`rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm ${
                      isDark 
                        ? 'bg-white/5 border border-white/10' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className="flex gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${
                          isDark ? 'bg-[#10B981]' : 'bg-[#10B981]'
                        } animate-bounce`} style={{ animationDelay: '0ms' }} />
                        <div className={`w-2 h-2 rounded-full ${
                          isDark ? 'bg-[#10B981]' : 'bg-[#10B981]'
                        } animate-bounce`} style={{ animationDelay: '150ms' }} />
                        <div className={`w-2 h-2 rounded-full ${
                          isDark ? 'bg-[#10B981]' : 'bg-[#10B981]'
                        } animate-bounce`} style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className={`p-3 rounded-lg ${
                    isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                  }`}>
                    <p className="text-sm">Error: {error}</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Mobile Input */}
              <div className={`p-4 border-t ${
                isDark ? 'border-white/10' : 'border-gray-200'
              }`}>
                <form onSubmit={handleSend} className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      pathname?.includes('/demo') 
                        ? "Generate a story bible first to start chatting..." 
                        : storyBibleId 
                          ? "Ask about your story..." 
                          : "Open a story bible first..."
                    }
                    disabled={isLoading || !storyBibleId}
                    rows={2}
                    className={`flex-1 resize-none rounded-lg px-4 py-2 text-sm ${
                      isDark
                        ? 'bg-white/5 text-white placeholder-white/40 border border-white/10'
                        : 'bg-gray-50 text-black placeholder-black/40 border border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-[#10B981] disabled:opacity-50`}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading || !storyBibleId}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? 'bg-[#10B981] text-black hover:bg-[#059669]'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}