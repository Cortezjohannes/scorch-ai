'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { savePreProduction } from '@/services/preproduction-service'
import PreProductionV2LoadingScreen from '@/components/PreProductionV2LoadingScreen'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import RawDataDisplay from '@/components/RawDataDisplay'
import AnimatedBackground from '@/components/AnimatedBackground'

// =====================================
// COMPREHENSIVE DESIGN SYSTEM V2
// =====================================

// 🎨 ENHANCED COLOR PALETTE
const designSystem = {
  colors: {
    // Primary Palette - Action Green & Professional Tones
    primary: {
      50: '#f0fff4',   // Lightest green tint
      100: '#dcfce7',  // Light green
      200: '#bbf7d0',  // Soft green
      300: '#86efac',  // Medium green
      400: '#4ade80',  // Warm green
      500: '#00FF99',  // Main Action Green
      600: '#00CC7A',  // Deep Action Green
      700: '#00a366',  // Darker green
      800: '#8f724a',  // Bronze
      900: '#6b4f3a'   // Deep bronze
    },
    
    // Neutral Palette - Enhanced Grays
    neutral: {
      50: '#fafafa',   // Pure light
      100: '#f5f5f5',  // Light gray
      200: '#e5e5e5',  // Soft gray
      300: '#d4d4d4',  // Medium gray
      400: '#a3a3a3',  // Gray
      500: '#737373',  // Deep gray
      600: '#525252',  // Dark gray
      700: '#404040',  // Darker gray
      800: '#262626',  // Very dark
      900: '#171717'   // Almost black
    },
    
    // Dark Theme Palette - Enhanced Current Colors
    dark: {
      surface: {
        primary: '#1a1a1a',      // Main background
        secondary: '#2a2a2a',    // Current bg (enhanced)
        tertiary: '#252628',     // Current variant
        elevated: '#36393f',     // Current border color
        overlay: '#1f2023'       // Modal/overlay background
      },
      text: {
        primary: '#ffffff',      // Pure white for headers
        secondary: '#e7e7e7',    // Current main text
        tertiary: '#b8b8b8',     // Muted text
        quaternary: '#8a8a8a',   // Subtle text
        disabled: '#6b6b6b'      // Disabled state
      }
    },
    
    // Semantic Colors
    semantic: {
      success: '#10b981',    // Green
      warning: '#f59e0b',    // Amber
      error: '#ef4444',      // Red
      info: '#3b82f6'        // Blue
    }
  },
  
  // 📐 TYPOGRAPHY SCALE (8-point grid system)
  typography: {
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px (body)
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px (h3)
      '3xl': '1.875rem', // 30px (h2)
      '4xl': '2.25rem',  // 36px (h1)
      '5xl': '3rem',     // 48px (hero)
      '6xl': '3.75rem'   // 60px (display)
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    },
    
    lineHeight: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    }
  },
  
  // 📏 SPACING SCALE (8-point grid)
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem'     // 96px
  },
  
  // 🔲 BORDER RADIUS SCALE
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    full: '9999px'
  },
  
  // 🌊 ELEVATION SYSTEM (shadows)
  elevation: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    
    // Special shadows for dark theme
    glow: {
      primary: '0 0 20px rgba(226, 195, 118, 0.3)',
      soft: '0 0 40px rgba(226, 195, 118, 0.15)',
      intense: '0 0 60px rgba(226, 195, 118, 0.4)'
    }
  }
}

// =====================================
// DESIGN SYSTEM UTILITIES
// =====================================

// 🎨 Design Token Helpers
const ds = designSystem // Shorthand for easy access

// 🖌️ Component Style Generators
const createCardStyle = (variant: 'primary' | 'secondary' | 'elevated' = 'primary') => {
  const baseStyle = `
    relative overflow-hidden rounded-2xl border transition-all duration-300
    backdrop-blur-sm transform-gpu will-change-transform
  `
  
  const variants = {
    primary: `
      bg-gradient-to-br from-[${ds.colors.dark.surface.secondary}]/95 to-[${ds.colors.dark.surface.tertiary}]/95
      border-[${ds.colors.dark.surface.elevated}]/30 shadow-xl
      hover:shadow-2xl hover:border-[${ds.colors.primary[500]}]/20 hover:scale-[1.01]
    `,
    secondary: `
      bg-[${ds.colors.dark.surface.elevated}]/20 border-[${ds.colors.dark.surface.elevated}]/40
      hover:bg-[${ds.colors.dark.surface.elevated}]/30 hover:border-[${ds.colors.primary[500]}]/30
    `,
    elevated: `
      bg-gradient-to-br from-[${ds.colors.dark.surface.secondary}]/98 to-[${ds.colors.dark.surface.tertiary}]/98
      border-[${ds.colors.primary[500]}]/20 shadow-2xl
      hover:shadow-[${ds.elevation.glow.soft}] hover:border-[${ds.colors.primary[500]}]/40
    `
  }
  
  return `${baseStyle} ${variants[variant]}`.replace(/\s+/g, ' ').trim()
}

const createTextStyle = (
  size: keyof typeof ds.typography.fontSize,
  weight: keyof typeof ds.typography.fontWeight = 'normal',
  color: 'primary' | 'secondary' | 'tertiary' | 'accent' = 'secondary'
) => {
  const colors = {
    primary: ds.colors.dark.text.primary,
    secondary: ds.colors.dark.text.secondary,
    tertiary: ds.colors.dark.text.tertiary,
    accent: ds.colors.primary[500]
  }
  
  return `text-[${colors[color]}] text-[${ds.typography.fontSize[size]}] font-[${ds.typography.fontWeight[weight]}] leading-relaxed`
}

const createButtonStyle = (variant: 'primary' | 'secondary' | 'ghost' = 'primary') => {
  const baseStyle = `
    inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium
    transition-all duration-200 transform-gpu will-change-transform
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
  `
  
  const variants = {
    primary: `
      bg-gradient-to-r from-[${ds.colors.primary[500]}] to-[${ds.colors.primary[600]}]
      text-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
      focus:ring-[${ds.colors.primary[500]}]/50
    `,
    secondary: `
      bg-[${ds.colors.dark.surface.elevated}]/40 text-[${ds.colors.dark.text.secondary}]
      border border-[${ds.colors.dark.surface.elevated}]/60 hover:bg-[${ds.colors.dark.surface.elevated}]/60
      hover:border-[${ds.colors.primary[500]}]/30 hover:text-[${ds.colors.dark.text.primary}]
      focus:ring-[${ds.colors.primary[500]}]/30
    `,
    ghost: `
      text-[${ds.colors.dark.text.tertiary}] hover:text-[${ds.colors.primary[500]}]
      hover:bg-[${ds.colors.primary[500]}]/10 focus:ring-[${ds.colors.primary[500]}]/30
    `
  }
  
  return `${baseStyle} ${variants[variant]}`.replace(/\s+/g, ' ').trim()
}

// Component definitions moved inside main component to avoid JSX at module level

// =====================================
// ADVANCED ANIMATION & INTERACTION SYSTEM
// =====================================

// 🎭 Animation Presets
const animations = {
  // Card entrance animations
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  
  fadeScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  },
  
  // Hover interactions
  floatUp: {
    whileHover: { y: -4, transition: { duration: 0.2 } },
    whileTap: { scale: 0.98, transition: { duration: 0.1 } }
  },
  
  glow: {
    whileHover: { 
      boxShadow: `0 0 20px ${ds.colors.primary[500]}33`,
      transition: { duration: 0.3 }
    }
  },
  
  // Stagger animations for lists
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  
  // Loading animations
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Success feedback
  success: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 20 
    }
  }
}

// 🎯 Interaction States Manager
const useInteractionState = () => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  return {
    isHovered,
    isPressed,
    isFocused,
    handlers: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      onMouseDown: () => setIsPressed(true),
      onMouseUp: () => setIsPressed(false),
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false)
    }
  }
}

// Old loading components definition removed - moved inside main component

// Old component definitions removed - moved inside main component

// V2 Tab Types - New narrative tab added, ordered by generation flow
type V2TabType = 'narrative' | 'script' | 'storyboard' | 'props' | 'location' | 'casting' | 'marketing' | 'postProduction'

const V2_TABS = [
  { id: 'narrative', label: 'Narrative', icon: '', description: 'Episode content overview' },
  { id: 'script', label: 'Scripts', icon: '', description: 'Scene-by-scene scripts' },
  { id: 'storyboard', label: 'Storyboards', icon: '', description: 'Visual planning per scene' },
  { id: 'props', label: 'Props & Wardrobe', icon: '', description: 'Production design per episode' },
  { id: 'location', label: 'Locations', icon: '', description: 'Filming locations per episode' },
  { id: 'casting', label: 'Casting', icon: '', description: 'Character casting for arc' },
  { id: 'marketing', label: 'Marketing', icon: '', description: 'Marketing strategy per episode' },
  { id: 'postProduction', label: 'Post-Production', icon: '', description: 'Post-production per scene' }
] as const

export default function PreProductionV2() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<V2TabType>('narrative')
  const [v2Content, setV2Content] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [showResults, setShowResults] = useState<boolean>(false)
  const [hasExistingContent, setHasExistingContent] = useState<boolean>(false)
  
  // Episode tab states for each section
  const [activeScriptEpisode, setActiveScriptEpisode] = useState(1)
  const [activeStoryboardEpisode, setActiveStoryboardEpisode] = useState(1)
  const [activePropsEpisode, setActivePropsEpisode] = useState(1)
  const [activeLocationEpisode, setActiveLocationEpisode] = useState(1)
  const [activeMarketingEpisode, setActiveMarketingEpisode] = useState(1)
  
  // Post-production lightbox state
  const [showPostProdInfo, setShowPostProdInfo] = useState(false)
  
  // =====================================
  // ENHANCED FEEDBACK & INTERACTION STATES
  // =====================================
  
  // Feedback states for enhanced UX
  const [showSuccessCheck, setShowSuccessCheck] = useState(false)
  const [toastState, setToastState] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error' | 'info'
  }>({
    show: false,
    message: '',
    type: 'success'
  })
  
  // Enhanced loading states
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  
  // Animation trigger helpers
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastState({ show: true, message, type })
    setTimeout(() => setToastState(prev => ({ ...prev, show: false })), 4000)
  }
  
  const triggerSuccessAnimation = () => {
    setShowSuccessCheck(true)
    setTimeout(() => setShowSuccessCheck(false), 2000)
  }

  // =====================================
  // COMPONENT DEFINITIONS (Moved inside to avoid JSX at module level)
  // =====================================
  
  // Create all component definitions here to avoid JSX at module level
  const createDesignComponents = (ds: any, createCardStyle: any, createTextStyle: any, createButtonStyle: any) => {
    return {
      SectionHeader: ({ icon, title, description, actions }: any) => {
        const cardStyle = createCardStyle('elevated')
        const titleStyle = createTextStyle('4xl', 'bold', 'primary')
        const descStyle = createTextStyle('lg', 'normal', 'tertiary')
        
        return (
          <motion.div 
            className={cardStyle}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center
                    bg-gradient-to-br from-[${ds.colors.primary[500]}]/20 to-[${ds.colors.primary[600]}]/20
                    border border-[${ds.colors.primary[500]}]/30
                  `}>
                    <span className="text-3xl">{icon}</span>
                  </div>
                  <div>
                    <h2 className={titleStyle}>{title}</h2>
                    {description && (
                      <p className={`${descStyle} mt-2 max-w-2xl`}>{description}</p>
                    )}
                  </div>
                </div>
                {actions && (
                  <div className="flex items-center gap-3">{actions}</div>
                )}
              </div>
            </div>
          </motion.div>
        )
      },

      ContentCard: ({ children, variant = 'primary', className = '', ...props }: any) => {
        const cardStyle = createCardStyle(variant)
        return (
          <motion.div 
            className={`${cardStyle} ${className}`}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            {...props}
          >
            {children}
          </motion.div>
        )
      },

      Button: ({ children, variant = 'primary', size = 'md', className = '', ...props }: any) => {
        const sizeClasses = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-base', lg: 'px-8 py-4 text-lg' }
        const buttonStyle = createButtonStyle(variant)
        
        return (
          <motion.button
            type={props.type || "button"}
            className={`${buttonStyle} ${sizeClasses[size as keyof typeof sizeClasses]} ${className}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            {...props}
          >
            {children}
          </motion.button>
        )
      },

      Typography: {
        H1: ({ children, className = '' }: any) => {
          const textStyle = createTextStyle('4xl', 'bold', 'primary')
          return <h1 className={`${textStyle} ${className}`}>{children}</h1>
        },
        H2: ({ children, className = '' }: any) => {
          const textStyle = createTextStyle('3xl', 'semibold', 'primary')
          return <h2 className={`${textStyle} ${className}`}>{children}</h2>
        },
        H3: ({ children, className = '' }: any) => {
          const textStyle = createTextStyle('2xl', 'semibold', 'secondary')
          return <h3 className={`${textStyle} ${className}`}>{children}</h3>
        },
        Body: ({ children, className = '' }: any) => {
          const textStyle = createTextStyle('base', 'normal', 'secondary')
          return <p className={`${textStyle} ${className}`}>{children}</p>
        },
        Caption: ({ children, className = '' }: any) => {
          const textStyle = createTextStyle('sm', 'normal', 'tertiary')
          return <span className={`${textStyle} ${className}`}>{children}</span>
        }
      }
    }
  }

  const createLoadingComponents = (ds: any, createCardStyle: any) => {
    return {
      CardSkeleton: ({ className = '' }: any) => {
        const cardStyle = createCardStyle('secondary')
        return (
          <div className={`${cardStyle} ${className}`}>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`
                  w-12 h-12 rounded-lg animate-pulse
                  bg-gradient-to-br from-[${ds.colors.primary[500]}]/20 to-[${ds.colors.primary[600]}]/20
                `} />
                <div className="flex-1 space-y-2">
                  <div className={`h-4 bg-[${ds.colors.dark.surface.elevated}]/60 rounded animate-pulse`} />
                  <div className={`h-3 bg-[${ds.colors.dark.surface.elevated}]/40 rounded w-2/3 animate-pulse`} />
                </div>
              </div>
              <div className="space-y-2">
                <div className={`h-3 bg-[${ds.colors.dark.surface.elevated}]/40 rounded animate-pulse`} />
                <div className={`h-3 bg-[${ds.colors.dark.surface.elevated}]/40 rounded w-4/5 animate-pulse`} />
                <div className={`h-3 bg-[${ds.colors.dark.surface.elevated}]/40 rounded w-3/5 animate-pulse`} />
              </div>
            </div>
          </div>
        )
      },
      
      PulsingDots: ({ className = '' }: any) => (
        <div className={`flex items-center gap-2 ${className}`}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full bg-[${ds.colors.primary[500]}]`}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      ),
      
      ProgressBar: ({ progress = 0, className = '' }: any) => (
        <div className={`w-full bg-[${ds.colors.dark.surface.elevated}]/30 rounded-full h-2 ${className}`}>
          <motion.div
            className={`bg-gradient-to-r from-[${ds.colors.primary[500]}] to-[${ds.colors.primary[600]}] h-2 rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      )
    }
  }

  const createFeedbackComponents = (ds: any, createTextStyle: any, animations: any) => {
    return {
      SuccessCheck: ({ show, onComplete }: any) => (
        <AnimatePresence>
          {show && (
            <motion.div
              className={`
                fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                w-20 h-20 rounded-full bg-[${ds.colors.semantic.success}]
                flex items-center justify-center shadow-2xl z-50
              `}
              {...animations.success}
              onAnimationComplete={onComplete}
            >
              <motion.svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>
          )}
        </AnimatePresence>
      ),
      
      Toast: ({ message, type = 'success', show, onClose }: { message: string; type?: 'success' | 'error' | 'info'; show: boolean; onClose: () => void }) => {
        const colors = { success: ds.colors.semantic.success, error: ds.colors.semantic.error, info: ds.colors.semantic.info }
        
        return (
          <AnimatePresence>
            {show && (
              <motion.div
                className={`
                  fixed top-6 right-6 z-50 max-w-md
                  bg-[${ds.colors.dark.surface.elevated}]/95 backdrop-blur-md
                  border border-[${colors[type]}]/30 rounded-xl shadow-2xl
                  p-4 flex items-center gap-3
                `}
                initial={{ opacity: 0, x: 100, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`
                  w-8 h-8 rounded-full bg-[${colors[type]}]/20 
                  flex items-center justify-center flex-shrink-0
                `}>
                  <span className="text-sm">{type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
                </div>
                <p className={`${createTextStyle('sm', 'medium', 'secondary')} flex-1`}>{message}</p>
                <button
                  onClick={onClose}
                  className={`
                    w-6 h-6 rounded-full bg-[${ds.colors.dark.surface.elevated}]/40
                    hover:bg-[${ds.colors.dark.surface.elevated}]/60 transition-colors
                    flex items-center justify-center text-xs
                  `}
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )
      }
    }
  }

  // =====================================
  // DESIGN SYSTEM COMPONENT INITIALIZATION
  // =====================================
  
  // Initialize design system components after function definitions
  const DesignComponents = createDesignComponents(ds, createCardStyle, createTextStyle, createButtonStyle)
  const LoadingComponents = createLoadingComponents(ds, createCardStyle)
  const FeedbackComponents = createFeedbackComponents(ds, createTextStyle, animations)

  // =====================================
  // KEYBOARD SHORTCUTS SYSTEM
  // =====================================
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if not typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }
      
      // Tab navigation shortcuts (1-8)
      const tabShortcuts: { [key: string]: V2TabType } = {
        '1': 'narrative',
        '2': 'script', 
        '3': 'storyboard',
        '4': 'props',
        '5': 'location',
        '6': 'casting',
        '7': 'marketing',
        '8': 'postProduction'
      }
      
      if (tabShortcuts[event.key]) {
        event.preventDefault()
        setActiveTab(tabShortcuts[event.key])
      }
      
      // Escape key to close modals
      if (event.key === 'Escape') {
        if (showPostProdInfo) {
          setShowPostProdInfo(false)
        }
      }
      
      // Arrow keys for episode navigation
      if (event.key === 'ArrowLeft' && event.ctrlKey) {
        event.preventDefault()
        // Navigate to previous episode (implement based on current tab)
        handleEpisodeNavigation('previous')
      }
      
      if (event.key === 'ArrowRight' && event.ctrlKey) {
        event.preventDefault()
        // Navigate to next episode
        handleEpisodeNavigation('next')
      }
      
      // Export shortcuts
      if (event.key === 'e' && event.ctrlKey && event.shiftKey) {
        event.preventDefault()
        exportAsJSON()
      }
      
      if (event.key === 'e' && event.ctrlKey && !event.shiftKey) {
        event.preventDefault()
        exportTabAsJSON(activeTab, v2Content?.[activeTab])
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showPostProdInfo, activeTab])
  
  const handleEpisodeNavigation = (direction: 'previous' | 'next') => {
    const getCurrentEpisode = () => {
      switch (activeTab) {
        case 'script': return activeScriptEpisode
        case 'storyboard': return activeStoryboardEpisode
        case 'props': return activePropsEpisode
        case 'location': return activeLocationEpisode
        case 'marketing': return activeMarketingEpisode
        default: return 1
      }
    }
    
    const setCurrentEpisode = (episode: number) => {
      switch (activeTab) {
        case 'script': setActiveScriptEpisode(episode); break
        case 'storyboard': setActiveStoryboardEpisode(episode); break
        case 'props': setActivePropsEpisode(episode); break
        case 'location': setActiveLocationEpisode(episode); break
        case 'marketing': setActiveMarketingEpisode(episode); break
      }
    }
    
    const currentEpisode = getCurrentEpisode()
    const maxEpisodes = arcEpisodes.length || 1
    
    if (direction === 'previous' && currentEpisode > 1) {
      setCurrentEpisode(currentEpisode - 1)
    } else if (direction === 'next' && currentEpisode < maxEpisodes) {
      setCurrentEpisode(currentEpisode + 1)
    }
  }
  
  // Arc data
  const [arcIndex, setArcIndex] = useState<number>(0)
  const [arcTitle, setArcTitle] = useState<string>('')
  const [arcEpisodes, setArcEpisodes] = useState<any[]>([])
  const [storyBible, setStoryBible] = useState<any>(null)
  const [workspaceEpisodes, setWorkspaceEpisodes] = useState<any>({})
  
  // Episode-level mode (for single episode pre-production)
  const [isSingleEpisodeMode, setIsSingleEpisodeMode] = useState<boolean>(false)
  const [singleEpisodeNumber, setSingleEpisodeNumber] = useState<number | null>(null)

  // =====================================
  // EXPORT FUNCTIONALITY
  // =====================================
  
  const exportAsJSON = useCallback(async () => {
    try {
      setIsExporting(true)
      setExportProgress(20)
      
      const exportData = {
        metadata: {
          title: storyBible?.seriesTitle || 'Series Title',
          arc: `Arc ${arcIndex + 1}: ${arcTitle}`,
          exportedAt: new Date().toISOString(),
          version: 'V2',
          totalEpisodes: arcEpisodes.length
        },
        content: v2Content
      }
      
      setExportProgress(60)
      
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${storyBible?.seriesTitle || 'series'}-arc-${arcIndex + 1}-preproduction.json`
      
      setExportProgress(90)
      
      a.click()
      URL.revokeObjectURL(url)
      
      setExportProgress(100)
      
      // Success feedback
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
        triggerSuccessAnimation()
        showToast('Successfully exported complete pre-production package!', 'success')
      }, 500)
      
    } catch (error) {
      setIsExporting(false)
      setExportProgress(0)
      showToast('Export failed. Please try again.', 'error')
    }
  }, [v2Content, storyBible, arcIndex, arcTitle, arcEpisodes])
  
  const exportTabAsJSON = useCallback(async (tabName: string, tabData: any) => {
    try {
      const exportData = {
        metadata: {
          title: storyBible?.seriesTitle || 'Series Title',
          arc: `Arc ${arcIndex + 1}: ${arcTitle}`,
          tab: tabName,
          exportedAt: new Date().toISOString()
        },
        content: tabData
      }
      
      // Quick export animation
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${storyBible?.seriesTitle || 'series'}-${tabName}-arc-${arcIndex + 1}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      // Success feedback
      showToast(`${V2_TABS.find(tab => tab.id === tabName)?.label || 'Tab'} exported successfully!`, 'success')
      
    } catch (error) {
      showToast('Export failed. Please try again.', 'error')
    }
  }, [storyBible, arcIndex, arcTitle])
  
  // Get URL parameters
  const projectId = searchParams.get('projectId')
  const mode = searchParams.get('mode') || 'v2'
  
  // Auth context
  const { user } = useAuth()

  // Parse arc from URL
  useEffect(() => {
    const arcParam = searchParams.get('arc')
    if (arcParam) {
      try {
        const parsedArc = parseInt(arcParam, 10) - 1
        if (!isNaN(parsedArc) && parsedArc >= 0) {
          setArcIndex(parsedArc)
        }
      } catch (e) {
        console.error('Error parsing arc parameter:', e)
      }
    }
  }, [searchParams])

  // Load project data
  useEffect(() => {
    if (projectId && user) {
      loadProjectData()
    } else {
      // Load from localStorage when no projectId (coming from workspace)
      loadFromLocalStorage()
    }
  }, [projectId, user, arcIndex])

  // Auto-start generation if flagged
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const autoGenerate = localStorage.getItem('greenlit-auto-generate') || localStorage.getItem('scorched-auto-generate') || localStorage.getItem('reeled-auto-generate')
      if (autoGenerate === 'true' && storyBible && arcEpisodes.length > 0 && !isGenerating && !showResults) {
        localStorage.removeItem('greenlit-auto-generate')
        localStorage.removeItem('scorched-auto-generate')
        localStorage.removeItem('reeled-auto-generate')
        startV2Generation()
      }
    }
  }, [storyBible, arcEpisodes, isGenerating, showResults])

  const loadProjectData = async () => {
    try {
      if (!projectId || !user) return

      console.log('🔍 Loading project data for V2...')
      // For now, we'll use localStorage since getProject is not available
      loadFromLocalStorage()
    } catch (error) {
      console.error('❌ Error loading project:', error)
    }
  }

  const tryManualDataReconstruction = () => {
    console.log('🔧 Attempting manual data reconstruction...')
    
    // Try to get story bible from any available key
    const storyBibleKeys = ['greenlit-story-bible', 'scorched-story-bible', 'reeled-story-bible']
    let foundStoryBible = null
    
    for (const key of storyBibleKeys) {
      const value = localStorage.getItem(key)
      if (value) {
        try {
          const parsed = JSON.parse(value)
          if (parsed.storyBible) {
            foundStoryBible = parsed.storyBible
            console.log(`✅ Found story bible in ${key}`)
            setStoryBible(foundStoryBible)
            break
          }
        } catch (e) {
          console.log(`❌ Error parsing ${key}:`, e)
        }
      }
    }
    
    // Try to get episodes from workspace episodes
    const workspaceKeys = ['greenlit-workspace-episodes', 'scorched-workspace-episodes', 'reeled-workspace-episodes']
    let foundEpisodes = []
    
    for (const key of workspaceKeys) {
      const value = localStorage.getItem(key)
      if (value) {
        try {
          const parsed = JSON.parse(value)
          if (parsed && typeof parsed === 'object') {
            const episodes = Object.values(parsed)
            if (episodes.length > 0) {
              foundEpisodes = episodes as any[]
              console.log(`✅ Found ${episodes.length} episodes in ${key}`)
              setWorkspaceEpisodes(parsed)
              break
            }
          }
        } catch (e) {
          console.log(`❌ Error parsing ${key}:`, e)
        }
      }
    }
    
    // Filter episodes for current arc (assuming arc 0 for now)
    if (foundEpisodes.length > 0) {
      const arcEpisodes = foundEpisodes.filter((ep: any) => {
        const epNum = ep.episodeNumber || 0
        return epNum >= 1 && epNum <= 10 // Arc 0 episodes 1-10
      }).sort((a: any, b: any) => (a.episodeNumber || 0) - (b.episodeNumber || 0))
      
      if (arcEpisodes.length > 0) {
        console.log(`✅ Reconstructed ${arcEpisodes.length} episodes for arc 0`)
        setArcEpisodes(arcEpisodes)
        setArcIndex(0)
      }
    }
    
    console.log('🔧 Manual reconstruction result:', {
      hasStoryBible: !!foundStoryBible,
      episodeCount: foundEpisodes.length,
      arcEpisodesCount: foundEpisodes.filter((ep: any) => (ep.episodeNumber || 0) >= 1 && (ep.episodeNumber || 0) <= 10).length
    })
  }

  const loadFromLocalStorage = () => {
    try {
      console.log('🔍 Loading pre-production data from localStorage...')
      
      // Check for episode-level data first (new single-episode mode)
      const savedEpisodeData = localStorage.getItem('greenlit-preproduction-episode-data') || 
                               localStorage.getItem('scorched-preproduction-episode-data') || 
                               localStorage.getItem('reeled-preproduction-episode-data')
      
      if (savedEpisodeData) {
        const data = JSON.parse(savedEpisodeData)
        console.log('📦 Single episode pre-production data found:', data)
        
        setIsSingleEpisodeMode(true)
        setSingleEpisodeNumber(data.episodeNumber)
        setStoryBible(data.storyBible)
        
        // Create arc episodes array with single episode
        setArcEpisodes([data.episode])
        setWorkspaceEpisodes({ [data.episodeNumber]: data.episode })
        
        // Determine arc info for this episode
        let runningCount = 0
        let foundArcIndex = 0
        if (data.storyBible && data.storyBible.narrativeArcs) {
          for (let i = 0; i < data.storyBible.narrativeArcs.length; i++) {
            const arc = data.storyBible.narrativeArcs[i]
            const arcEpisodeCount = arc.episodes?.length || 10
            if (data.episodeNumber <= runningCount + arcEpisodeCount) {
              foundArcIndex = i
              setArcTitle(arc.title || `Arc ${i + 1}`)
              break
            }
            runningCount += arcEpisodeCount
          }
        }
        setArcIndex(foundArcIndex)
        
        console.log(`📖 Single episode mode: Episode ${data.episodeNumber} from ${data.storyBible?.narrativeArcs?.[foundArcIndex]?.title || `Arc ${foundArcIndex + 1}`}`)
        return
      }
      
      // Fall back to arc-level data (existing functionality)
      const savedPreProdData = localStorage.getItem('greenlit-preproduction-data') || localStorage.getItem('scorched-preproduction-data') || localStorage.getItem('reeled-preproduction-data')
      console.log('🔍 Checking localStorage for preproduction data:', !!savedPreProdData)
      console.log('🔍 ALL localStorage keys:', Object.keys(localStorage))
      console.log('🔍 Raw savedPreProdData:', savedPreProdData)
      
      if (savedPreProdData) {
        const data = JSON.parse(savedPreProdData)
        console.log('📦 Pre-production data found:', data)
        console.log('📊 Data structure check:', {
          hasStoryBible: !!data.storyBible,
          hasArcEpisodes: !!data.arcEpisodes,
          arcEpisodesLength: data.arcEpisodes?.length,
          hasWorkspaceEpisodes: !!data.workspaceEpisodes,
          workspaceEpisodesCount: data.workspaceEpisodes ? Object.keys(data.workspaceEpisodes).length : 0,
          arcIndex: data.arcIndex
        })
        
        setIsSingleEpisodeMode(false)
        setSingleEpisodeNumber(null)
        setStoryBible(data.storyBible)
        setArcIndex(data.arcIndex || 0)
        setWorkspaceEpisodes(data.workspaceEpisodes || {})
        
        // Always use the actual workspace episodes that were saved by workspace
        // These are the generated episodes with scenes and content
        if (data.arcEpisodes && data.arcEpisodes.length > 0) {
          // workspace already filtered the episodes for this arc
          setArcEpisodes(data.arcEpisodes)
          console.log(`📖 Using arc episodes from workspace: ${data.arcEpisodes.length} episodes`)
          console.log(`📝 Episode structure check:`, data.arcEpisodes[0] ? {
            hasScenes: !!data.arcEpisodes[0].scenes,
            hasContent: !!data.arcEpisodes[0].content,
            scenesCount: data.arcEpisodes[0].scenes?.length || 0
          } : 'No episodes')
        } else if (data.workspaceEpisodes) {
          // Fallback: Filter workspace episodes for this arc
          const episodes = Object.values(data.workspaceEpisodes)
            .filter((ep: any) => {
              const arcStart = data.arcIndex * 10 + 1
              const arcEnd = data.arcIndex * 10 + 10
              return ep.episodeNumber >= arcStart && ep.episodeNumber <= arcEnd
            })
            .sort((a: any, b: any) => a.episodeNumber - b.episodeNumber)
          setArcEpisodes(episodes)
          console.log(`📖 Fallback: Using workspace episodes: ${episodes.length} episodes`)
        } else {
          console.error('❌ No episodes found in localStorage data')
        }
        
        // Set arc title
        const currentArc = data.storyBible?.narrativeArcs?.[data.arcIndex]
        setArcTitle(currentArc?.title || `Arc ${data.arcIndex + 1}`)
        
        // Check for existing V2 content
        const existingV2Content = localStorage.getItem(`greenlit-preproduction-${data.arcIndex || 0}`) || localStorage.getItem(`scorched-preproduction-${data.arcIndex || 0}`) || localStorage.getItem(`reeled-preproduction-${data.arcIndex || 0}`)
        if (existingV2Content) {
          try {
            const parsedV2Content = JSON.parse(existingV2Content)
            console.log('🎉 Found existing V2 pre-production content!', parsedV2Content)
            setV2Content(parsedV2Content)
            setHasExistingContent(true)
            setShowResults(true)
            console.log('✅ Loaded existing V2 content - skipping regeneration')
          } catch (e) {
            console.error('❌ Error parsing existing V2 content:', e)
            setHasExistingContent(false)
          }
        } else {
          console.log('📭 No existing V2 content found')
          setHasExistingContent(false)
        }
        
        console.log(`✅ LocalStorage data loaded: ${data.storyBible?.seriesTitle}`)
        console.log(`📖 Arc ${data.arcIndex + 1}: ${currentArc?.title}`)
        console.log(`📊 Final data state:`, {
          storyBible: !!data.storyBible,
          arcEpisodes: arcEpisodes.length,
          workspaceEpisodes: Object.keys(workspaceEpisodes).length,
          arcIndex: data.arcIndex,
          hasExistingV2Content: hasExistingContent
        })
      } else {
        console.error('❌ No pre-production data found in localStorage')
        console.log('🔍 Available localStorage keys:', Object.keys(localStorage))
        
        // Try alternative keys that might contain the data
        const alternativeKeys = [
          'scorched-story-bible',
          'reeled-story-bible', 
          'scorched-preproduction-data',
          'reeled-preproduction-data',
          'scorched-workspace-episodes',
          'reeled-workspace-episodes'
        ]
        
        console.log('🔍 Checking alternative localStorage keys...')
        alternativeKeys.forEach(key => {
          const value = localStorage.getItem(key)
          if (value) {
            console.log(`✅ Found data in ${key}:`, JSON.parse(value))
          }
        })
        
        console.log('💡 Make sure you have gone through the workspace and generated story bible + episodes first!')
        
        // Try to manually reconstruct data from available localStorage
        tryManualDataReconstruction()
        
        // Try to show helpful error to user - but only if we actually don't have data
        setTimeout(() => {
          // Check if we have any story data in localStorage instead of relying on state
          const hasStoryBibleData = localStorage.getItem('greenlit-story-bible') || localStorage.getItem('scorched-story-bible') || localStorage.getItem('reeled-story-bible')
          const hasEpisodeData = localStorage.getItem('greenlit-episodes') || localStorage.getItem('scorched-episodes') || localStorage.getItem('reeled-episodes') || localStorage.getItem('greenlit-workspace-episodes') || localStorage.getItem('scorched-workspace-episodes') || localStorage.getItem('reeled-workspace-episodes')
          const hasPreproductionData = localStorage.getItem('greenlit-preproduction-data') || localStorage.getItem('scorched-preproduction-data') || localStorage.getItem('reeled-preproduction-data')
          
          // Only show error if we truly have no data at all
          if (!hasStoryBibleData && !hasEpisodeData && !hasPreproductionData) {
            console.log('🚨 Showing error alert - truly no data found')
            console.log('📊 Current state:', { 
              hasStoryBibleData: !!hasStoryBibleData,
              hasEpisodeData: !!hasEpisodeData,
              hasPreproductionData: !!hasPreproductionData,
              localStorageKeys: Object.keys(localStorage)
            })
            alert('❌ Missing story data! Please go back to workspace and:\n1. Generate your story bible\n2. Generate episodes\n3. Then come back to start pre-production')
          } else {
            console.log('✅ Data found in localStorage, skipping error alert')
            console.log('📊 Data availability:', {
              hasStoryBibleData: !!hasStoryBibleData,
              hasEpisodeData: !!hasEpisodeData,
              hasPreproductionData: !!hasPreproductionData
            })
          }
        }, 1000)
      }
    } catch (error) {
      console.error('❌ Error loading from localStorage:', error)
    }
  }

  const startV2Generation = () => {
    // Check localStorage directly instead of relying on state variables
    const hasStoryBibleData = localStorage.getItem('greenlit-story-bible') || localStorage.getItem('scorched-story-bible') || localStorage.getItem('reeled-story-bible')
    const hasEpisodeData = localStorage.getItem('greenlit-episodes') || localStorage.getItem('scorched-episodes') || localStorage.getItem('reeled-episodes') || localStorage.getItem('greenlit-workspace-episodes') || localStorage.getItem('scorched-workspace-episodes') || localStorage.getItem('reeled-workspace-episodes')
    const hasPreproductionData = localStorage.getItem('greenlit-preproduction-data') || localStorage.getItem('scorched-preproduction-data') || localStorage.getItem('reeled-preproduction-data')
    
    if (!hasStoryBibleData && !hasEpisodeData && !hasPreproductionData) {
      console.error('❌ Missing required data for V2 generation:', {
        hasStoryBibleData: !!hasStoryBibleData,
        hasEpisodeData: !!hasEpisodeData,
        hasPreproductionData: !!hasPreproductionData,
        storyBibleState: !!storyBible,
        episodeCountState: arcEpisodes.length,
        storyBibleTitle: storyBible?.seriesTitle,
        arcIndex,
        arcTitle
      })
      return
    }
    
    console.log('🎬 Starting V2 Pre-Production Generation...')
    setIsGenerating(true)
    setShowResults(false)
  }

  const onV2Complete = async (preProductionData: any) => {
    console.log('✅ V2 Pre-Production Complete!', preProductionData)
    setV2Content(preProductionData)
    setIsGenerating(false)
    setShowResults(true)
    setHasExistingContent(true)
    
    // Save V2 content with story bible ID
    if (typeof window !== 'undefined') {
      try {
        // Get story bible ID
        // Use existing ID or create a deterministic one (NO Date.now()!)
        const storyBibleId = storyBible?.id || `bible_${storyBible?.seriesTitle?.replace(/\s+/g, '_').toLowerCase()}`
        if (!storyBible?.id) {
          console.warn('⚠️ Story bible missing ID! Using deterministic fallback:', storyBibleId)
        }
        
        // Prepare pre-production data with required fields
        const preProductionRecord = {
          id: `preprod_${storyBibleId}_ep${singleEpisodeNumber || currentEpisodeNumber}`,
          episodeNumber: singleEpisodeNumber || currentEpisodeNumber,
          episodeId: `ep_${singleEpisodeNumber || currentEpisodeNumber}`,
          storyBibleId, // REQUIRED - tie to story bible
          script: preProductionData.script || {},
          storyboard: preProductionData.storyboard || [],
          castingBrief: preProductionData.castingBrief || {},
          propsList: preProductionData.propsList || [],
          locationsList: preProductionData.locationsList || [],
          wardrobe: preProductionData.wardrobe || [],
          productionNotes: preProductionData.notes,
          status: 'complete' as const,
          generatedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        // Save to Firestore (if user logged in) and localStorage
        await savePreProduction(preProductionRecord, storyBibleId, user?.id)
        console.log(`💾 Pre-production for episode ${singleEpisodeNumber || currentEpisodeNumber} saved with story bible ID: ${storyBibleId}`)
        
        // Keep legacy localStorage format for backward compatibility
        localStorage.setItem(`scorched-preproduction-${arcIndex}`, JSON.stringify(preProductionData))
      } catch (e) {
        console.error('❌ Error saving V2 content:', e)
      }
      localStorage.removeItem('reeled-auto-generate')
    }
  }

  const onV2Error = (error: string) => {
    console.error('❌ V2 Generation Error:', error)
    setIsGenerating(false)
    // Could show error modal here
  }

  // Tab content renderers
  const renderTabContent = () => {
    if (!v2Content) {
      return (
        <div className="text-center py-12">
          <p className="text-[#e7e7e7]/60">No content generated yet</p>
        </div>
      )
    }

    switch (activeTab) {
      case 'narrative':
        return renderNarrative()
      case 'script':
        return renderV2Scripts()
      case 'storyboard':
        return renderV2Storyboards()
      case 'props':
        return renderV2Props()
      case 'location':
        return renderV2Locations()
      case 'casting':
        return renderV2Casting()
      case 'marketing':
        return renderV2Marketing()
      case 'postProduction':
        return renderV2PostProduction()
      default:
        return <div>Tab not implemented yet</div>
    }
  }

  const renderNarrative = () => {
    const narrativeData = v2Content?.narrative
    if (!narrativeData) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00FF99] to-[#00CC7A] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📖</span>
          </div>
          <p className="text-[#e7e7e7]/70 text-lg">No narrative data available</p>
        </div>
      )
    }

    return (
      <div className="space-y-12">
        {/* Enhanced Narrative Overview with Design System */}
        <DesignComponents.ContentCard
          variant="elevated"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="p-8">
          <div className="text-center mb-8">
              <DesignComponents.Typography.H2 className="mb-4">
                Narrative Overview
              </DesignComponents.Typography.H2>
              <DesignComponents.Typography.Body className="text-lg max-w-2xl mx-auto">
                Episode content overview with scene breakdowns and production statistics
              </DesignComponents.Typography.Body>
            </div>
          
            {/* Enhanced Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Episodes Stats Card */}
              <DesignComponents.ContentCard variant="secondary" className="p-6 text-center">
                <div className={`
                  w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center
                  bg-gradient-to-br from-[${ds.colors.primary[500]}]/20 to-[${ds.colors.primary[600]}]/20
                  border border-[${ds.colors.primary[500]}]/30
                `}>
                <span className="text-2xl">📺</span>
              </div>
                <div className={`
                  ${createTextStyle('3xl', 'bold', 'accent')} mb-2
                `}>
                  {narrativeData.totalEpisodes}
            </div>
                <DesignComponents.Typography.Body className="font-medium">
                  Episodes
                </DesignComponents.Typography.Body>
              </DesignComponents.ContentCard>
              
              {/* Scenes Stats Card */}
              <DesignComponents.ContentCard variant="secondary" className="p-6 text-center">
                <div className={`
                  w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center
                  bg-gradient-to-br from-[${ds.colors.primary[500]}]/20 to-[${ds.colors.primary[600]}]/20
                  border border-[${ds.colors.primary[500]}]/30
                `}>
                <span className="text-2xl">🎬</span>
              </div>
                <div className={`
                  ${createTextStyle('3xl', 'bold', 'accent')} mb-2
                `}>
                  {narrativeData.totalScenes}
            </div>
                <DesignComponents.Typography.Body className="font-medium">
                  Total Scenes
                </DesignComponents.Typography.Body>
              </DesignComponents.ContentCard>
              
              {/* Format Stats Card */}
              <DesignComponents.ContentCard variant="secondary" className="p-6 text-center">
                <div className={`
                  w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center
                  bg-gradient-to-br from-[${ds.colors.primary[500]}]/20 to-[${ds.colors.primary[600]}]/20
                  border border-[${ds.colors.primary[500]}]/30
                `}>
                <span className="text-2xl">📝</span>
              </div>
                <div className={`
                  ${createTextStyle('3xl', 'bold', 'accent')} mb-2
                `}>
                  {narrativeData.format || 'V2'}
            </div>
                <DesignComponents.Typography.Body className="font-medium">
                  Format
                </DesignComponents.Typography.Body>
              </DesignComponents.ContentCard>
          </div>
          </div>
        </DesignComponents.ContentCard>

        {/* Enhanced Episode Cards with Stagger Animation */}
            <motion.div 
          className="space-y-8"
          {...animations.stagger}
        >
          {narrativeData.episodes?.map((episode: any, index: number) => (
            <DesignComponents.ContentCard
              key={episode.episodeNumber} 
              variant="primary"
              {...animations.slideUp}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              {...animations.floatUp}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
            >
              {/* Episode Header */}
              <div className="bg-gradient-to-r from-[#2a2a2a]/95 to-[#252628]/95 border-b border-[#36393f]/40 p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00FF99] to-[#00CC7A] rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">{episode.episodeNumber}</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-[#e7e7e7] mb-1 font-medium cinematic-subheader">
                      {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                    </h3>
                    <p className="text-[#e7e7e7]/70 text-lg">
                      Episode {episode.episodeNumber} • {episode.scenes?.length || 0} scenes
                    </p>
                  </div>
                </div>
                <p className="text-[#e7e7e7]/80 text-lg leading-relaxed">
                  {episode.synopsis || 'No synopsis available'}
                </p>
              </div>

              {/* Episode Content */}
              <div className="p-8 space-y-6">
                {/* Scenes */}
                {episode.scenes?.length > 0 && (
                  <div>
                    <h4 className="text-xl font-bold text-[#00FF99] mb-6">Scenes</h4>
                    <div className="grid gap-4">
                      {episode.scenes.map((scene: any, sceneIndex: number) => (
                        <div key={sceneIndex} className="bg-[#36393f]/20 rounded-2xl p-6 border border-[#36393f]/30">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-[#00FF99]/20 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-[#00FF99]">{scene.sceneNumber || sceneIndex + 1}</span>
                            </div>
                            <h5 className="font-semibold text-[#00FF99]">Scene {scene.sceneNumber || sceneIndex + 1}</h5>
                          </div>
                          <p className="text-[#e7e7e7]/85 leading-relaxed">
                            {scene.content
                              ?.replace(/^.*?Certainly!?.*?Here.*?:/gi, '') // Remove AI artifacts
                              ?.replace(/^.*?I'll.*?create.*?:/gi, '')
                              ?.replace(/^.*?Below.*?is.*?:/gi, '')
                              ?.replace(/```[\w]*\n?/g, '')
                              ?.trim() || 'No content available'}
                          </p>
                </div>
              ))}
                    </div>
                  </div>
                )}
              
                {/* Episode Rundown */}
              {episode.rundown && (
                  <div className="bg-[#36393f]/20 rounded-2xl p-6 border border-[#36393f]/30">
                    <h4 className="text-lg font-semibold text-[#00FF99] mb-3 flex items-center gap-2">
                      <span>📋</span>
                      Episode Rundown
                    </h4>
                    <p className="text-[#e7e7e7]/85 leading-relaxed">{episode.rundown}</p>
                </div>
              )}
              
                {/* Branching Options */}
              {episode.branchingOptions?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-[#00FF99] mb-4 flex items-center gap-2">
                      <span>🔀</span>
                      Branching Options
                    </h4>
                    <div className="grid gap-3">
                    {episode.branchingOptions.map((option: any, optIndex: number) => (
                        <div key={optIndex} className="bg-gradient-to-r from-[#00FF99]/10 to-[#00CC7A]/10 border border-[#00FF99]/20 rounded-xl p-4">
                          <span className="text-[#e7e7e7]/90 font-medium">{option.text || option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </DesignComponents.ContentCard>
          ))}
            </motion.div>
      </div>
    )
  }

  // =====================================
  // UNIFIED CONTENT PARSER SYSTEM
  // =====================================
  
  // Universal content cleaner - removes all AI artifacts consistently
  const cleanAIContent = (content: string): string => {
    if (!content) return ''
    
    return content
      // Remove AI response artifacts
      .replace(/^.*?Certainly!?.*?Here.*?:/gi, '')
      .replace(/^.*?I'll.*?create.*?:/gi, '')
      .replace(/^.*?Below.*?is.*?:/gi, '')
      .replace(/^.*?Let me.*?create.*?:/gi, '')
      .replace(/^.*?I can.*?help.*?:/gi, '')
      // Remove code block markers
      .replace(/```[\w]*\n?/g, '')
      .replace(/```/g, '')
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_{2,}(.*?)_{2,}/g, '$1')
      // Remove extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  // Enhanced content structure detector
  const detectContentStructure = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim())
    const structure = {
      hasJSON: content.includes('{') && content.includes('}'),
      hasMarkdown: content.includes('**') || content.includes('##'),
      hasNumberedItems: lines.some(line => /^\d+\./.test(line.trim())),
      hasBulletItems: lines.some(line => /^[-*]/.test(line.trim())),
      hasHeaders: lines.some(line => /^(#+|[A-Z\s]{3,}:)/.test(line.trim())),
      hasSceneFormat: lines.some(line => /^(INT\.|EXT\.)/.test(line.trim())),
      hasCharacterNames: lines.some(line => /^[A-Z][A-Z\s]+$/.test(line.trim()) && line.length < 50)
    }
    return structure
  }

  // =====================================
  // REUSABLE EPISODE NAVIGATION COMPONENT
  // =====================================
  
  interface EpisodeNavProps {
    episodes: any[]
    activeEpisode: number
    onEpisodeChange: (episodeNumber: number) => void
    className?: string
  }

  // Mobile-optimized Episode Navigation with touch gestures
  const EpisodeNavigation = memo(({ episodes, activeEpisode, onEpisodeChange, className = '' }: EpisodeNavProps) => (
    <div className={`border-b border-[#36393f]/40 ${className}`}>
      <div className="flex overflow-x-auto scrollbar-hide touch-pan-x">
        {episodes?.map((episode: any) => (
          <button
            key={episode.episodeNumber}
            onClick={() => onEpisodeChange(episode.episodeNumber)}
            className={`flex-shrink-0 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium transition-colors border-b-2 touch-manipulation ${
              activeEpisode === episode.episodeNumber
                ? 'text-[#00FF99] border-[#00FF99] bg-[#36393f]/20'
                : 'text-[#e7e7e7]/70 border-transparent hover:text-[#e7e7e7] hover:bg-[#36393f]/10 active:bg-[#36393f]/20'
            }`}
          >
            <span className="hidden sm:inline">Episode </span>
            {episode.episodeNumber}
          </button>
        ))}
        </div>
    </div>
  ))

  // =====================================
  // ENHANCED ERROR HANDLING COMPONENTS
  // =====================================
  
  const ContentErrorBoundary = ({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) => {
    try {
      return <>{children}</>
    } catch (error) {
      console.error('Content rendering error:', error)
      return fallback || (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-400 text-lg font-medium">Content parsing error</p>
          <p className="text-[#e7e7e7]/70 text-sm mt-2">Please try regenerating this content</p>
      </div>
    )
    }
  }

  const EmptyContentFallback = ({ title, description, icon }: { title: string, description: string, icon: string }) => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-gradient-to-br from-[#00FF99] to-[#00CC7A] rounded-3xl flex items-center justify-center mx-auto mb-6">
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-[#e7e7e7]/70 text-lg">{title}</p>
      <p className="text-[#e7e7e7]/50 text-sm mt-2">{description}</p>
    </div>
  )

  // =====================================
  // PERFORMANCE OPTIMIZATIONS
  // =====================================
  
  // Memoized parsing functions for better performance
  const parseScreenplay = useCallback((screenplay: string) => {
    if (!screenplay) return { elements: [] }
    
    console.log('🎬 PARSING SCREENPLAY:', screenplay.substring(0, 200) + '...')
    
    const cleanScreenplay = cleanAIContent(screenplay)
    const structure = detectContentStructure(cleanScreenplay)
    
    // Try JSON parsing first if it looks like structured data
    if (structure.hasJSON) {
      try {
        const parsed = JSON.parse(cleanScreenplay)
        if (parsed.elements || parsed.scenes || parsed.screenplay) {
          return {
            elements: parsed.elements || parsed.scenes || parsed.screenplay || []
          }
        }
      } catch (e) {
        console.log('📝 JSON parsing failed, falling back to text parsing')
      }
    }
    
    const lines = cleanScreenplay.split('\n').filter(line => line.trim())
    const elements: any[] = []
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim()
      if (!line) continue
      
      // Skip narrative prose indicators
      if (line.includes('Enhanced screenplay with') || 
          line.includes('Scene content:') || 
          line.includes('Engine guidance:') ||
          line.includes('[SCENE START]') ||
          line.includes('[SCENE END]')) {
        continue
      }
      
      // Clean HTML tags from character names
      if (line.includes('<center>') && line.includes('</center>')) {
        line = line.replace(/<center>|<\/center>/g, '').trim()
      }
      
      // Scene heading (INT./EXT.)
      if (line.match(/^(INT\.|EXT\.)/)) {
               elements.push({
          type: 'scene_heading',
          content: line
        })
      }
      // Character name (ALL CAPS, may include age in parentheses)
      else if (line.match(/^[A-Z][A-Z\s]+(\([0-9]+\))?$/) && line.length < 50 && !line.includes('.') && !line.includes('>')) {
           elements.push({
          type: 'character',
          content: line
        })
      }
      // Parenthetical (in parentheses)
      else if (line.match(/^\(.*\)$/)) {
        elements.push({
          type: 'parenthetical',
          content: line
        })
      }
      // Dialogue (everything else that's not action)
      else if (line.length > 0 && !line.match(/^(INT\.|EXT\.)/)) {
        // Check if this is dialogue by looking at context
        const isDialogue = elements.length > 0 && 
          (elements[elements.length - 1].type === 'character' || 
           elements[elements.length - 1].type === 'parenthetical' ||
           elements[elements.length - 1].type === 'dialogue')
        
        if (isDialogue) {
        elements.push({
            type: 'dialogue',
            content: line
          })
        } else {
          elements.push({
            type: 'action',
            content: line
          })
        }
      }
    }
    
    console.log('📝 Parsed screenplay elements:', elements.length)
    console.log('📝 Elements:', elements.map(e => `${e.type}: ${e.content.substring(0, 50)}...`))
    return { elements }
  }, [])

  const renderV2Scripts = () => {
    const scriptData = v2Content?.script
    if (!scriptData) {
      return (
        <EmptyContentFallback 
          title="No script data available"
          description="Generate scripts from the narrative content to see scene-by-scene breakdowns"
          icon="📝"
        />
      )
    }

    return (
      <div className="space-y-12">
        {/* Enhanced Scripts Overview */}
        <motion.div 
          className="bg-gradient-to-br from-[#2a2a2a]/90 to-[#232427]/90 backdrop-blur-sm rounded-3xl p-8 border border-[#36393f]/40 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-[#e7e7e7] mb-2 font-medium cinematic-subheader">Scene Scripts</h3>
            <p className="text-[#e7e7e7]/70 text-lg">Professional screenplay format with visual dialogue separation</p>
            </div>
          
          {/* Script Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">{scriptData.totalScenes}</div>
              <div className="text-[#e7e7e7]/80 font-medium">Total Scenes</div>
            </div>
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">{scriptData.episodes?.length}</div>
              <div className="text-[#e7e7e7]/80 font-medium">Episodes</div>
            </div>
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">{scriptData.format}</div>
              <div className="text-[#e7e7e7]/80 font-medium">Format</div>
            </div>
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">{scriptData.temperature}</div>
              <div className="text-[#e7e7e7]/80 font-medium">Temperature</div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Episode Navigation */}
        <div className="bg-gradient-to-br from-[#2a2a2a]/90 to-[#232427]/90 backdrop-blur-sm rounded-3xl border border-[#36393f]/40 shadow-2xl overflow-hidden">
          <ContentErrorBoundary>
              <EpisodeNavigation 
                episodes={scriptData.episodes || []}
                activeEpisode={activeScriptEpisode}
                onEpisodeChange={setActiveScriptEpisode}
            />
          </ContentErrorBoundary>

          {/* Selected Episode Content */}
          {scriptData.episodes?.map((episode: any) => {
            if (episode.episodeNumber !== activeScriptEpisode) return null
            
            return (
              <div key={episode.episodeNumber} className="p-8">
                {/* Episode Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00FF99] to-[#00CC7A] rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">{episode.episodeNumber}</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-[#e7e7e7] mb-1 font-medium cinematic-subheader">
                      {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                    </h3>
                    <p className="text-[#e7e7e7]/70 text-lg">
                      {episode.totalScenes} scenes • Professional screenplay format
                    </p>
                  </div>
                </div>

                {/* Complete Episode Script */}
                      <motion.div 
                        className="bg-gradient-to-br from-[#36393f]/20 to-[#2a2a2a]/30 rounded-2xl border border-[#36393f]/30 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                      >
                  {/* Script Header */}
                        <div className="bg-gradient-to-r from-[#00FF99]/10 to-[#00CC7A]/10 border-b border-[#36393f]/30 p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#00FF99]/20 rounded-xl flex items-center justify-center">
                        <span className="text-lg">📝</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-[#00FF99] text-xl">
                          Complete Episode Script
                                </h4>
                        <p className="text-[#e7e7e7]/70">
                          {episode.totalScenes} scenes • Professional screenplay format
                        </p>
                              </div>
                            </div>
                  </div>
                  
                  {/* Professional Screenplay Display */}
                  <div className="p-6">
                    <div className="bg-white text-black font-mono text-xs leading-relaxed rounded-lg shadow-lg overflow-hidden">
                      <div className="p-8" style={{ fontSize: '12px', fontFamily: 'Courier, monospace', lineHeight: 1.6 }}>
                        {/* Title Page */}
                        <div className="text-center mb-12 page-break">
                          <h1 className="text-2xl font-bold mb-4 uppercase">{episode.episodeTitle || `Episode ${episode.episodeNumber}`}</h1>
                          <h2 className="text-lg mb-8 uppercase">{storyBible?.seriesTitle || 'WESTBRIDGE ACADEMY'}</h2>
                          <div className="mt-16">
                            <p className="mb-2">Written by</p>
                            <p className="font-bold">AI Story Engine</p>
                            <div className="mt-8 text-sm">
                              <p>Genre: {storyBible?.genre || 'Teen Drama'}</p>
                              <p>Format: Professional Screenplay</p>
                            </div>
                          </div>
                  </div>
                  
                        {/* All Scenes Combined */}
                        {episode.scenes?.map((scene: any, sceneIndex: number) => {
                          const parsedScript = parseScreenplay(scene.screenplay)
                          
                          return (
                            <div key={scene.sceneNumber}>
                              {/* Scene Number Header */}
                              <div className="text-center my-8">
                                <div className="inline-block bg-gray-200 text-black px-4 py-2 rounded font-bold">
                                  SCENE {scene.sceneNumber}
                                </div>
                              </div>
                              
                              {/* Scene Content */}
                              {parsedScript.elements.map((element: any, elementIndex: number) => {
                                switch (element.type) {
                                  case 'scene_heading':
                                    return (
                                      <div
                                        key={elementIndex}
                                        className="font-bold text-black mb-4 mt-8 first:mt-4"
                                        style={{ marginLeft: '0px' }}
                                      >
                                        {element.content}
                                      </div>
                                    )
                                  
                                  case 'action':
                                    return (
                                      <div
                                        key={elementIndex}
                                        className="text-black mb-4 leading-relaxed max-w-none"
                                        style={{ 
                                          marginLeft: '0px',
                                          marginRight: '0px',
                                          textAlign: 'left'
                                        }}
                                      >
                                        {element.content}
                                      </div>
                                    )
                                  
                                  case 'character':
                                    return (
                                      <div
                                        key={elementIndex}
                                        className="font-bold text-black mt-6 mb-1"
                                        style={{ 
                                          marginLeft: '192px', // ~3.7 inches from left in 12pt
                                          textAlign: 'left',
                                          fontSize: '12px',
                                          letterSpacing: '0.5px'
                                        }}
                                      >
                                        {element.content}
                                                    </div>
                                    )
                                  
                                  case 'parenthetical':
                                    return (
                                      <div
                                        key={elementIndex}
                                        className="text-black mb-1 italic"
                                        style={{ 
                                          marginLeft: '240px', // ~4.5 inches from left in 12pt
                                          textAlign: 'left'
                                        }}
                                      >
                                        {element.content}
                                  </div>
                                  )
                                  
                                  case 'dialogue':
                                    return (
                                      <div
                                        key={elementIndex}
                                        className="text-black mb-4 leading-relaxed"
                                        style={{ 
                                          marginLeft: '120px', // ~2.2 inches from left in 12pt
                                          marginRight: '120px', // ~2.2 inches from right in 12pt
                                          textAlign: 'left',
                                          fontSize: '12px',
                                          lineHeight: '1.4'
                                        }}
                                      >
                                        {element.content}
                            </div>
                                    )
                                  
                                  default:
                                    return null
                                }
                              })}
                          </div>
                    )
                  })}
                </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Parse storyboard text into individual shots with descriptions - FIXED VERSION
  const parseStoryboard = useCallback((storyboardText: string) => {
    if (!storyboardText) return { shots: [] }
    
    console.log('🎬 PARSING STORYBOARD:', storyboardText.substring(0, 200) + '...')
    
    // Use unified content cleaner
    const cleanText = cleanAIContent(storyboardText)
    const structure = detectContentStructure(cleanText)
    
    // Try JSON parsing first if it looks like structured data
    if (structure.hasJSON) {
      try {
        const parsed = JSON.parse(cleanText)
        if (parsed.shots || parsed.storyboard || parsed.scenes) {
          return {
            shots: parsed.shots || parsed.storyboard || parsed.scenes || []
          }
        }
      } catch (e) {
        console.log('🎬 JSON parsing failed, falling back to text parsing')
      }
    }
    
    console.log('🧹 CLEANED TEXT:', cleanText.substring(0, 200) + '...')
    
    const shots: any[] = []
    
    // Method 1: Try to find structured shot patterns
    const shotPatterns = [
      /^(?:Shot\s*\d+|SHOT\s*\d+|\d+\.)([^]*?)(?=^(?:Shot\s*\d+|SHOT\s*\d+|\d+\.)|$)/gim,
      /^(?:ESTABLISHING|WIDE|CLOSE|MEDIUM|ECU|CU|MS|WS|LS)([^]*?)(?=^(?:ESTABLISHING|WIDE|CLOSE|MEDIUM|ECU|CU|MS|WS|LS)|$)/gim,
      /\*\*SHOT\s*\d+([^]*?)(?=\*\*SHOT\s*\d+|$)/gi
    ]
    
    let found = false
    for (const pattern of shotPatterns) {
      const matches = [...cleanText.matchAll(pattern)]
      if (matches.length > 0) {
        console.log(`📸 Found ${matches.length} shots with pattern`)
        matches.forEach((match, index) => {
          const fullMatch = match[0].trim()
          const content = match[1] ? match[1].trim() : fullMatch
          
          shots.push({
            number: index + 1,
            title: `Shot ${index + 1}`,
            description: content || fullMatch,
            visualStyle: ['Cinematic'],
            movement: '',
            composition: '',
            lighting: '',
            camera: ''
          })
        })
        found = true
        break
      }
    }
    
    // Method 2: If no structured shots found, split by logical breaks
    if (!found) {
      console.log('🔄 No structured shots found, splitting by breaks')
      
      // Split by various separators
      let chunks = cleanText.split(/\n\s*\n+/).filter(chunk => chunk.trim().length > 30)
      
      if (chunks.length < 2) {
        // Try splitting by sentences
        chunks = cleanText.split(/(?<=[.!?])\s+/).filter(chunk => chunk.trim().length > 30)
      }
      
      if (chunks.length < 2) {
        // Try splitting by dash separators
        chunks = cleanText.split(/\s*[-—–]+\s*/).filter(chunk => chunk.trim().length > 30)
      }
      
      if (chunks.length > 0) {
        chunks.forEach((chunk, index) => {
          shots.push({
            number: index + 1,
            title: `Shot ${index + 1}`,
            description: chunk.trim(),
            visualStyle: ['Cinematic'],
            movement: '',
            composition: '',
            lighting: '',
            camera: ''
          })
        })
      } else {
        // Last resort: single shot
        shots.push({
          number: 1,
          title: 'Scene Overview',
          description: cleanText,
          visualStyle: ['Cinematic'],
          movement: '',
          composition: '',
          lighting: '',
          camera: ''
        })
      }
    }
    
    console.log(`✅ FINAL SHOTS COUNT: ${shots.length}`)
    shots.forEach((shot, i) => {
      console.log(`${i + 1}. ${shot.title}: ${shot.description.substring(0, 50)}...`)
    })
    
    return { shots }
  }, [])

  // =====================================
  // OPTIMIZED PROMPT TEMPLATES
  // =====================================
  
  // These optimized prompts will generate more structured, parse-friendly content
  const IMPROVED_PROMPTS = {
    script: `Create a professional screenplay scene in STRICT JSON format:

{
  "elements": [
    {
      "type": "scene_heading",
      "text": "INT./EXT. LOCATION - TIME OF DAY"
    },
    {
      "type": "action", 
      "text": "Brief action description in present tense"
    },
    {
      "type": "dialogue",
      "character": "CHARACTER NAME",
      "dialogue": "Spoken dialogue only"
    }
  ]
}

REQUIREMENTS:
- Return ONLY valid JSON, no markdown formatting
- Use only these element types: scene_heading, action, dialogue
- Keep actions brief and in present tense
- Character names in ALL CAPS
- Each element is a separate object in the elements array`,

    storyboard: `Create a detailed storyboard in STRICT JSON format:

{
  "shots": [
    {
      "number": 1,
      "title": "Shot 1 - Establishing",
      "description": "Detailed visual description",
      "camera": "Wide Shot/Close-up/Medium Shot",
      "movement": "Static/Pan/Tilt/Zoom",
      "composition": "Rule of thirds/Centered/Leading lines",
      "lighting": "Natural/Dramatic/Soft/Hard"
    }
  ]
}

REQUIREMENTS:
- Return ONLY valid JSON, no markdown formatting
- Each shot must have all specified properties
- Be descriptive but concise
- Focus on visual storytelling elements`,

    props: `Create props and wardrobe inventory in STRICT JSON format:

{
  "props": [
    {
      "name": "Prop Name",
      "description": "Purpose and appearance",
      "category": "Set Decoration/Hand Props/Vehicles"
    }
  ],
  "wardrobe": [
    {
      "character": "Character Name", 
      "item": "Costume piece",
      "description": "Style and appearance",
      "notes": "Special requirements"
    }
  ]
}

REQUIREMENTS:
- Return ONLY valid JSON, no markdown formatting
- Organize by props and wardrobe categories
- Include character-specific costume details`,

    locations: `Create location guide in STRICT JSON format:

{
  "locations": [
    {
      "name": "Location Name",
      "type": "Interior/Exterior",
      "description": "Visual and practical details",
      "requirements": "Filming needs and logistics",
      "atmosphere": "Mood and aesthetic"
    }
  ]
}

REQUIREMENTS:
- Return ONLY valid JSON, no markdown formatting
- Include both visual and practical filming considerations
- Focus on production requirements`
  }

  const renderV2Storyboards = () => {
    const storyboardData = v2Content?.storyboard
    if (!storyboardData) {
      return (
        <EmptyContentFallback 
          title="No storyboard data available"
          description="Generate storyboards to see visual shot planning and cinematography"
          icon="🎬"
        />
      )
    }

    return (
      <div className="space-y-12">
        {/* Enhanced Storyboards Overview */}
        <motion.div 
          className="bg-gradient-to-br from-[#2a2a2a]/90 to-[#232427]/90 backdrop-blur-sm rounded-3xl p-8 border border-[#36393f]/40 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-[#e7e7e7] mb-2 font-medium cinematic-subheader">Visual Storyboards</h3>
            <p className="text-[#e7e7e7]/70 text-lg">Shot-by-shot visual planning with AI generation frames</p>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">{storyboardData.totalScenes}</div>
              <div className="text-[#e7e7e7]/80 font-medium">Total Scenes</div>
            </div>
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">{storyboardData.visualStyle?.genre || 'Cinematic'}</div>
              <div className="text-[#e7e7e7]/80 font-medium">Visual Style</div>
            </div>
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">HD</div>
              <div className="text-[#e7e7e7]/80 font-medium">Quality</div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Episode Navigation */}
        <div className="bg-gradient-to-br from-[#2a2a2a]/90 to-[#232427]/90 backdrop-blur-sm rounded-3xl border border-[#36393f]/40 shadow-2xl overflow-hidden">
          <ContentErrorBoundary>
            <EpisodeNavigation 
              episodes={storyboardData.episodes || []}
              activeEpisode={activeStoryboardEpisode}
              onEpisodeChange={setActiveStoryboardEpisode}
            />
          </ContentErrorBoundary>

          {/* Selected Episode Content */}
          {storyboardData.episodes?.map((episode: any) => {
            if (episode.episodeNumber !== activeStoryboardEpisode) return null
            
            return (
              <div key={episode.episodeNumber} className="p-8">
                {/* Episode Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00FF99] to-[#00CC7A] rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-[#e7e7e7] mb-1 font-medium cinematic-subheader">
                      {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                    </h3>
                    <p className="text-[#e7e7e7]/70 text-lg">
                      {episode.totalScenes} scenes • Visual storyboard breakdown
                    </p>
                </div>
                </div>

                {/* Scene Cards */}
                <div className="space-y-8">
                  {episode.scenes?.map((scene: any, sceneIndex: number) => {
                    const parsedStoryboard = parseStoryboard(scene.storyboard)
                    
                    return (
                      <motion.div 
                        key={scene.sceneNumber}
                        className="bg-gradient-to-br from-[#36393f]/20 to-[#2a2a2a]/30 rounded-2xl border border-[#36393f]/30 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: sceneIndex * 0.1 }}
                      >
                        {/* Scene Header */}
                        <div className="bg-gradient-to-r from-[#00FF99]/10 to-[#00CC7A]/10 border-b border-[#36393f]/30 p-6">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#00FF99]/20 rounded-xl flex items-center justify-center">
                                <span className="text-sm font-bold text-[#00FF99]">{scene.sceneNumber}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-[#00FF99] text-xl">
                                  Scene {scene.sceneNumber}
                                </h4>
                                <p className="text-[#e7e7e7]/70">{parsedStoryboard.shots.length} shots planned</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-[#e7e7e7]/60 bg-[#36393f]/40 px-3 py-1 rounded-full">
                                Storyboard
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Shot Cards */}
                        <div className="p-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            {parsedStoryboard.shots.map((shot: any, shotIndex: number) => (
                              <motion.div
                                key={shotIndex}
                                className="bg-gradient-to-br from-[#36393f]/10 to-[#2a2a2a]/20 rounded-xl border border-[#36393f]/20 overflow-hidden"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: shotIndex * 0.1 }}
                                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                              >
                                {/* AI Image Generation Frame */}
                                <div className="aspect-video bg-gradient-to-br from-[#36393f]/20 to-[#2a2a2a]/40 border-2 border-dashed border-[#00FF99]/30 m-4 rounded-lg flex flex-col items-center justify-center group hover:border-[#00FF99]/60 transition-colors">
                                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🎬</div>
                                  <p className="text-sm text-[#00FF99] font-medium">Shot {shot.number}</p>
                                  <p className="text-xs text-[#e7e7e7]/60 text-center max-w-32">AI Image Frame</p>
                                  <button className="mt-2 text-xs bg-[#00FF99]/10 hover:bg-[#00FF99]/20 text-[#00FF99] px-3 py-1 rounded-full transition-colors">
                                    Generate
                                  </button>
                                </div>

                                {/* Enhanced Shot Details */}
                                <div className="p-5">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-[#00FF99] font-bold text-lg">{shot.title}</h5>
                                    <span className="text-xs bg-[#00FF99]/10 text-[#00FF99] px-2 py-1 rounded-full">
                                      Shot {shot.number}
                                    </span>
                                  </div>
                                  
                                  <p className="text-[#e7e7e7]/80 text-sm mb-4 leading-relaxed line-clamp-3">
                                    {shot.description}
                                  </p>
                                  
                                  {/* Enhanced Technical Grid */}
                                  <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-[#36393f]/20 rounded-lg p-3">
                                      <div className="text-xs text-[#e7e7e7]/60 mb-1">📹 Camera</div>
                                      <div className="text-sm text-[#00FF99] font-medium">{shot.camera || 'Medium Shot'}</div>
                                    </div>
                                    <div className="bg-[#36393f]/20 rounded-lg p-3">
                                      <div className="text-xs text-[#e7e7e7]/60 mb-1">🎬 Movement</div>
                                      <div className="text-sm text-[#00CC7A] font-medium">{shot.movement || 'Static'}</div>
                                    </div>
                                    <div className="bg-[#36393f]/20 rounded-lg p-3">
                                      <div className="text-xs text-[#e7e7e7]/60 mb-1">🖼️ Composition</div>
                                      <div className="text-sm text-[#e7e7e7] font-medium">{shot.composition || 'Standard'}</div>
                                    </div>
                                    <div className="bg-[#36393f]/20 rounded-lg p-3">
                                      <div className="text-xs text-[#e7e7e7]/60 mb-1">💡 Lighting</div>
                                      <div className="text-sm text-[#e7e7e7] font-medium">{shot.lighting || 'Natural'}</div>
                                    </div>
                                  </div>
                                  
                                  {/* Visual Style Tags */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                    {shot.visualStyle?.length > 0 ? (
                                      shot.visualStyle.map((style: string, styleIndex: number) => (
                                        <span 
                                          key={styleIndex}
                                          className="text-xs bg-[#00FF99]/10 text-[#00FF99] px-3 py-1.5 rounded-full font-medium"
                                        >
                                          {style}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-xs bg-[#00FF99]/10 text-[#00FF99] px-3 py-1.5 rounded-full font-medium">
                                        Cinematic
                                      </span>
                                    )}
                                  </div>

                                  {/* Production Notes */}
                                  <div className="border-t border-[#36393f]/30 pt-3 space-y-2 text-xs">
                                    {shot.movement && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-[#00CC7A]">🎥</span>
                                        <span className="text-[#e7e7e7]/70">{shot.movement}</span>
                                      </div>
                                    )}
                                    {shot.composition && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-[#00CC7A]">📐</span>
                                        <span className="text-[#e7e7e7]/70">{shot.composition}</span>
                                      </div>
                                    )}
                                    {shot.lighting && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-[#00CC7A]">💡</span>
                                        <span className="text-[#e7e7e7]/70">{shot.lighting}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Enhanced props and wardrobe parser using unified system
  const parsePropsAndWardrobe = (propsText: string) => {
    if (!propsText) return { props: [], wardrobe: [], characters: [] }
    
    const cleanText = cleanAIContent(propsText)
    const structure = detectContentStructure(cleanText)
    
    // Try JSON parsing first if it looks like structured data
    if (structure.hasJSON) {
      try {
        const parsed = JSON.parse(cleanText)
        return {
          props: parsed.props || [],
          wardrobe: parsed.wardrobe || parsed.costumes || [],
          characters: parsed.characters || [],
          metadata: parsed.metadata || {}
        }
      } catch (e) {
        console.log('👗 JSON parsing failed, falling back to text parsing')
      }
    }
    
    const lines = cleanText.split('\n').filter(line => line.trim())
    const props: any[] = []
    const wardrobe: any[] = []
    const characters: any[] = []
    
    let currentSection = ''
    let currentCharacter = ''
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue
      
      // Section headers
      if (trimmedLine.toLowerCase().includes('props:') || trimmedLine.toLowerCase().includes('property')) {
        currentSection = 'props'
        continue
      }
      if (trimmedLine.toLowerCase().includes('wardrobe:') || trimmedLine.toLowerCase().includes('costume')) {
        currentSection = 'wardrobe'
        continue
      }
      if (trimmedLine.toLowerCase().includes('character:') || trimmedLine.match(/^[A-Z][a-z]+:/)) {
        currentCharacter = trimmedLine.replace(':', '').replace(/character/i, '').trim()
        currentSection = 'character'
        continue
      }
      
      // Parse individual items
      if (trimmedLine.match(/^[-•*]\s*/) || trimmedLine.match(/^\d+\.\s*/)) {
        let itemText = trimmedLine
          .replace(/^[-•*]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove remaining ** formatting
          .replace(/\*(.*?)\*/g, '$1') // Remove remaining * formatting
        
        // Determine item type and details
        const item = {
          name: itemText.split('-')[0].split(':')[0].trim(),
          description: itemText,
          category: '',
          character: currentCharacter,
          size: '',
          color: '',
          style: '',
          quantity: 1,
          importance: 'normal',
          purpose: '' // Add purpose description
        }
        
        // Extract purpose from description
        const purposeMatch = itemText.match(/(?:for|used|purpose|needed)[\s:]*(.+?)(?:\.|$)/i)
        if (purposeMatch) {
          item.purpose = purposeMatch[1].trim()
        }
        
        // Extract details from description
        if (itemText.toLowerCase().includes('large') || itemText.toLowerCase().includes('big')) item.size = 'Large'
        if (itemText.toLowerCase().includes('small') || itemText.toLowerCase().includes('mini')) item.size = 'Small'
        if (itemText.toLowerCase().includes('medium')) item.size = 'Medium'
        
        // Extract colors
        const colorMatch = itemText.match(/(black|white|red|blue|green|yellow|brown|gray|grey|silver|gold|dark|light|bright|navy|beige|tan|pink|purple|orange)/i)
        if (colorMatch) item.color = colorMatch[1]
        
        // Extract style keywords
        if (itemText.toLowerCase().includes('vintage')) item.style = 'Vintage'
        if (itemText.toLowerCase().includes('modern')) item.style = 'Modern'
        if (itemText.toLowerCase().includes('casual')) item.style = 'Casual'
        if (itemText.toLowerCase().includes('formal')) item.style = 'Formal'
        if (itemText.toLowerCase().includes('elegant')) item.style = 'Elegant'
        if (itemText.toLowerCase().includes('rustic')) item.style = 'Rustic'
        if (itemText.toLowerCase().includes('professional')) item.style = 'Professional'
        
        // Determine importance
        if (itemText.toLowerCase().includes('important') || itemText.toLowerCase().includes('key') || itemText.toLowerCase().includes('main') || itemText.toLowerCase().includes('essential')) {
          item.importance = 'high'
        } else if (itemText.toLowerCase().includes('minor') || itemText.toLowerCase().includes('background') || itemText.toLowerCase().includes('optional')) {
          item.importance = 'low'
        }
        
        // Categorize item
        if (currentSection === 'props' || itemText.toLowerCase().includes('prop')) {
          item.category = 'Props'
          props.push(item)
        } else if (currentSection === 'wardrobe' || itemText.toLowerCase().includes('costume') || itemText.toLowerCase().includes('outfit') || itemText.toLowerCase().includes('clothing')) {
          item.category = 'Wardrobe'
          wardrobe.push(item)
        } else if (currentCharacter) {
          item.category = 'Character'
          characters.push(item)
        } else {
          // Default categorization based on keywords
          if (itemText.toLowerCase().includes('shirt') || itemText.toLowerCase().includes('dress') || itemText.toLowerCase().includes('pants') || itemText.toLowerCase().includes('jacket') || itemText.toLowerCase().includes('shoes') || itemText.toLowerCase().includes('hat')) {
            item.category = 'Wardrobe'
            wardrobe.push(item)
          } else {
            item.category = 'Props'
            props.push(item)
          }
        }
      }
    }
    
    return { props, wardrobe, characters }
  }

  const renderV2Props = () => {
    const propsData = v2Content?.props
    if (!propsData) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00FF99] to-[#00CC7A] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🎪</span>
          </div>
          <p className="text-[#e7e7e7]/70 text-lg">No props data available</p>
        </div>
      )
    }

    return (
      <div className="space-y-12">
        {/* Enhanced Props Overview */}
        <motion.div 
          className="bg-gradient-to-br from-[#2a2a2a]/90 to-[#232427]/90 backdrop-blur-sm rounded-3xl p-8 border border-[#36393f]/40 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-[#e7e7e7] mb-2">Props & Wardrobe</h3>
            <p className="text-[#e7e7e7]/70 text-lg">Individual item inventory with visual reference cards</p>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">{propsData.episodes?.length || 0}</div>
              <div className="text-[#e7e7e7]/80 font-medium">Episodes</div>
              </div>
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">Ready</div>
              <div className="text-[#e7e7e7]/80 font-medium">Status</div>
            </div>
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">Pro</div>
              <div className="text-[#e7e7e7]/80 font-medium">Quality</div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Episode Navigation */}
        <div className="bg-gradient-to-br from-[#2a2a2a]/90 to-[#232427]/90 backdrop-blur-sm rounded-3xl border border-[#36393f]/40 shadow-2xl overflow-hidden">
          <ContentErrorBoundary>
            <EpisodeNavigation 
              episodes={propsData.episodes || []}
              activeEpisode={activePropsEpisode}
              onEpisodeChange={setActivePropsEpisode}
            />
          </ContentErrorBoundary>

          {/* Selected Episode Content */}
          {propsData.episodes?.map((episode: any) => {
            if (episode.episodeNumber !== activePropsEpisode) return null
            
            const parsedItems = parsePropsAndWardrobe(episode.props)
            const allItems = [...parsedItems.props, ...parsedItems.wardrobe, ...parsedItems.characters]
            
            return (
              <div key={episode.episodeNumber} className="p-8">
                {/* Episode Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00FF99] to-[#00CC7A] rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🎪</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-[#e7e7e7] mb-1 font-medium cinematic-subheader">
                      {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                    </h3>
                    <p className="text-[#e7e7e7]/70 text-lg">
                      {allItems.length} items • Production inventory
                    </p>
                  </div>
                </div>

                {/* Category Sections */}
                {['Props', 'Wardrobe', 'Character'].map((category) => {
                  const categoryItems = allItems.filter(item => item.category === category)
                  if (categoryItems.length === 0) return null
                  
                  return (
                    <div key={category} className="mb-12">
                      <h4 className="text-2xl font-bold text-[#00FF99] mb-6 flex items-center gap-3">
                        <span>{category === 'Props' ? '🎬' : category === 'Wardrobe' ? '👗' : '🎭'}</span>
                        {category}
                      </h4>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryItems.map((item: any, itemIndex: number) => (
                          <motion.div
                            key={itemIndex}
                            className="bg-gradient-to-br from-[#36393f]/20 to-[#2a2a2a]/30 rounded-xl border border-[#36393f]/30 overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: itemIndex * 0.1 }}
                            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                          >
                            {/* Item Image Placeholder */}
                            <div className="aspect-square bg-gradient-to-br from-[#36393f]/20 to-[#2a2a2a]/40 border-2 border-dashed border-[#00FF99]/30 m-4 rounded-lg flex flex-col items-center justify-center group hover:border-[#00FF99]/60 transition-colors">
                              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                                {category === 'Props' ? '🎬' : category === 'Wardrobe' ? '👗' : '🎭'}
                              </div>
                              <p className="text-sm text-[#00FF99] font-medium text-center">{item.name}</p>
                              <p className="text-xs text-[#e7e7e7]/60 text-center">Visual Reference</p>
                              <button className="mt-2 text-xs bg-[#00FF99]/10 hover:bg-[#00FF99]/20 text-[#00FF99] px-3 py-1 rounded-full transition-colors">
                                Generate
                              </button>
                            </div>

                            {/* Item Details */}
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-[#00FF99] font-semibold">{item.name}</h5>
                                {item.importance === 'high' && (
                                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">Key Item</span>
                                )}
                              </div>
                              
                              <p className="text-[#e7e7e7]/80 text-sm mb-4 leading-relaxed">{item.description}</p>
                              
                              {/* Purpose/Usage */}
                              {item.purpose && (
                                <div className="mb-3 p-3 bg-[#36393f]/20 rounded-lg border-l-4 border-[#00FF99]/50">
                                  <div className="flex items-center gap-2 text-xs mb-1">
                                    <span className="text-[#00FF99]">💡</span>
                                    <span className="text-[#00FF99] font-medium">Purpose</span>
                                  </div>
                                  <p className="text-[#e7e7e7]/80 text-xs">{item.purpose}</p>
                                </div>
                              )}
                              
                              {/* Item Properties */}
                              <div className="space-y-2">
                                {item.character && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-[#00CC7A]">👤</span>
                                    <span className="text-[#e7e7e7]/70">For: {item.character}</span>
                                  </div>
                                )}
                                {item.size && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-[#00CC7A]">📏</span>
                                    <span className="text-[#e7e7e7]/70">Size: {item.size}</span>
                                  </div>
                                )}
                                {item.color && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-[#00CC7A]">🎨</span>
                                    <span className="text-[#e7e7e7]/70">Color: {item.color}</span>
                                  </div>
                                )}
                                {item.style && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-[#00CC7A]">✨</span>
                                    <span className="text-[#e7e7e7]/70">Style: {item.style}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Production Status */}
                              <div className="mt-4 pt-4 border-t border-[#36393f]/30">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-[#e7e7e7]/60">Production Status</span>
                                  <span className="text-xs bg-[#00FF99]/10 text-[#00FF99] px-2 py-1 rounded-full">
                                    Needed
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }



  // Parse location content into individual location cards
  const parseLocations = (locationText: string) => {
    if (!locationText) return { locations: [] }
    
    // Use unified content cleaner
    const cleanText = cleanAIContent(locationText)
    const structure = detectContentStructure(cleanText)
    
    // Try JSON parsing first if it looks like structured data
    if (structure.hasJSON) {
      try {
        const parsed = JSON.parse(cleanText)
        return {
          locations: parsed.locations || parsed.sets || [],
          metadata: parsed.metadata || {}
        }
      } catch (e) {
        console.log('🏗️ JSON parsing failed, falling back to text parsing')
      }
    }
    
    const lines = cleanText.split('\n').filter(line => line.trim())
    const locations: any[] = []
    let currentLocation: any = null
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      // Enhanced location name patterns
      if (line.match(/^Location \d+:/i) || 
          line.match(/^\d+\.\s*[A-Z]/) || 
          line.match(/^[A-Z][A-Za-z\s]+:$/) ||
          line.match(/^[A-Z][A-Z\s]+(OFFICE|BUILDING|HOUSE|PARK|STUDIO|LOCATION)/i) ||
          line.match(/^(INT\.|EXT\.)/i) ||
          (line.length < 50 && line.match(/^[A-Z][A-Za-z\s]+(Building|Office|House|Studio|Park|Location|Room|Space)/i))) {
        
        // Save previous location
        if (currentLocation) {
          locations.push(currentLocation)
        }
        
        // Start new location
        let locationName = line
          .replace(/^Location \d+:/i, '')
          .replace(/^\d+\.\s*/, '')
          .replace(/:$/, '')
          .replace(/^(INT\.|EXT\.)/i, '')
          .trim()
        
        // If location name is too generic, try to extract a better name
        if (locationName.length < 3) {
          locationName = `Location ${locations.length + 1}`
        }
        
        currentLocation = {
          name: locationName,
          description: '',
          type: '',
          requirements: [],
          logistics: '',
          accessibility: '',
          permits: '',
          scenes: '',
          weather: '',
          timeOfDay: [],
          budget: ''
        }
      }
      // Extract specific details
      else if (line.toLowerCase().includes('type:') || line.toLowerCase().includes('category:')) {
        if (currentLocation) currentLocation.type = line.replace(/.*type:\s*/i, '').replace(/.*category:\s*/i, '')
      }
      else if (line.toLowerCase().includes('requirement')) {
        if (currentLocation) currentLocation.requirements.push(line.replace(/.*requirement[s]*:\s*/i, ''))
      }
      else if (line.toLowerCase().includes('logistic') || line.toLowerCase().includes('transport')) {
        if (currentLocation) currentLocation.logistics = line.replace(/.*logistic[s]*:\s*/i, '').replace(/.*transport:\s*/i, '')
      }
      else if (line.toLowerCase().includes('access') || line.toLowerCase().includes('permission')) {
        if (currentLocation) currentLocation.accessibility = line.replace(/.*access[ibility]*:\s*/i, '').replace(/.*permission:\s*/i, '')
      }
      else if (line.toLowerCase().includes('permit') || line.toLowerCase().includes('license')) {
        if (currentLocation) currentLocation.permits = line.replace(/.*permit[s]*:\s*/i, '').replace(/.*license:\s*/i, '')
      }
      else if (line.toLowerCase().includes('scene') || line.toLowerCase().includes('shot')) {
        if (currentLocation) currentLocation.scenes = line.replace(/.*scene[s]*:\s*/i, '').replace(/.*shot[s]*:\s*/i, '')
      }
      else if (line.toLowerCase().includes('weather') || line.toLowerCase().includes('climate')) {
        if (currentLocation) currentLocation.weather = line.replace(/.*weather:\s*/i, '').replace(/.*climate:\s*/i, '')
      }
      else if (line.toLowerCase().includes('time') || line.toLowerCase().includes('hour')) {
        const timeMatch = line.match(/(morning|afternoon|evening|night|dawn|dusk|day|indoor)/gi)
        if (currentLocation && timeMatch) currentLocation.timeOfDay = timeMatch
      }
      else if (line.toLowerCase().includes('budget') || line.toLowerCase().includes('cost')) {
        if (currentLocation) currentLocation.budget = line.replace(/.*budget:\s*/i, '').replace(/.*cost:\s*/i, '')
      }
      else {
        // General description
        if (currentLocation) {
          currentLocation.description += (currentLocation.description ? ' ' : '') + line
        }
      }
    }
    
    // Don't forget the last location
    if (currentLocation) {
      locations.push(currentLocation)
    }
    
    // If no locations were parsed, try to extract multiple locations from the content
    if (locations.length === 0 && cleanText.trim()) {
      // Try to split by common location separators
      const chunks = cleanText.split(/(?:\n\s*\n+|---+|\*\*Location|\*\*LOCATION|Location \d+:|### |## )/i)
        .filter(chunk => chunk.trim().length > 30)
      
      if (chunks.length > 1) {
        chunks.forEach((chunk, index) => {
          const trimmedChunk = chunk.trim()
          // Try to extract a name from the first line
          const firstLine = trimmedChunk.split('\n')[0].trim()
          const locationName = firstLine.length < 100 ? firstLine : `Location ${index + 1}`
          
          locations.push({
            name: locationName.replace(/^\d+\.\s*/, '').replace(/:$/, '').trim(),
            description: trimmedChunk,
            type: 'Filming Location',
            requirements: [],
            logistics: '',
            accessibility: '',
            permits: '',
            scenes: '',
            weather: '',
            timeOfDay: [],
            budget: ''
          })
        })
      } else {
        // Single location
        locations.push({
          name: 'Primary Location',
          description: cleanText,
          type: 'Filming Location',
          requirements: [],
          logistics: '',
          accessibility: '',
          permits: '',
          scenes: '',
          weather: '',
          timeOfDay: [],
          budget: ''
        })
      }
    }
    
    return { locations }
  }

  const renderV2Locations = () => {
    const locationsData = v2Content?.location
    if (!locationsData || !locationsData.episodes) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00FF99] to-[#00CC7A] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📍</span>
          </div>
          <p className="text-[#e7e7e7]/70 text-lg">No location data available</p>
          <p className="text-[#e7e7e7]/50 text-sm mt-2">
            v2Content.location is {locationsData === undefined ? 'undefined' : locationsData === null ? 'null' : 'exists but no episodes'}
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-12">
        {/* Enhanced Locations Overview */}
        <motion.div 
          className="bg-gradient-to-br from-[#2a2a2a]/90 to-[#232427]/90 backdrop-blur-sm rounded-3xl p-8 border border-[#36393f]/40 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-[#e7e7e7] mb-2">Filming Locations</h3>
            <p className="text-[#e7e7e7]/70 text-lg">Location scouting with detailed requirements and logistics</p>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">{locationsData.episodes?.length || 0}</div>
              <div className="text-[#e7e7e7]/80 font-medium">Episodes</div>
              </div>
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">Scouted</div>
              <div className="text-[#e7e7e7]/80 font-medium">Status</div>
            </div>
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">Pro</div>
              <div className="text-[#e7e7e7]/80 font-medium">Quality</div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Episode Navigation */}
        <div className="bg-gradient-to-br from-[#2a2a2a]/90 to-[#232427]/90 backdrop-blur-sm rounded-3xl border border-[#36393f]/40 shadow-2xl overflow-hidden">
          <ContentErrorBoundary>
            <EpisodeNavigation 
              episodes={locationsData.episodes || []}
              activeEpisode={activeLocationEpisode}
              onEpisodeChange={setActiveLocationEpisode}
            />
          </ContentErrorBoundary>

          {/* Selected Episode Content */}
          {locationsData.episodes?.map((episode: any) => {
            if (episode.episodeNumber !== activeLocationEpisode) return null
            
            const parsedLocations = parseLocations(episode.locations)
            
            return (
              <div key={episode.episodeNumber} className="p-8">
                {/* Episode Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00FF99] to-[#00CC7A] rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-[#e7e7e7] mb-1 font-medium cinematic-subheader">
                      {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                    </h3>
                    <p className="text-[#e7e7e7]/70 text-lg">
                      {parsedLocations.locations.length} locations • Filming requirements
                    </p>
                  </div>
                </div>

                {/* Location Cards */}
                <div className="grid md:grid-cols-2 gap-8">
                  {parsedLocations.locations.map((location: any, locationIndex: number) => (
                    <motion.div
                      key={locationIndex}
                      className="bg-gradient-to-br from-[#36393f]/20 to-[#2a2a2a]/30 rounded-xl border border-[#36393f]/30 overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: locationIndex * 0.1 }}
                      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    >
                      {/* Location Image Placeholder */}
                      <div className="aspect-video bg-gradient-to-br from-[#36393f]/20 to-[#2a2a2a]/40 border-2 border-dashed border-[#00FF99]/30 m-4 rounded-lg flex flex-col items-center justify-center group hover:border-[#00FF99]/60 transition-colors">
                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🏢</div>
                        <p className="text-sm text-[#00FF99] font-medium text-center">{location.name}</p>
                        <p className="text-xs text-[#e7e7e7]/60 text-center">Location Reference</p>
                        <button className="mt-2 text-xs bg-[#00FF99]/10 hover:bg-[#00FF99]/20 text-[#00FF99] px-3 py-1 rounded-full transition-colors">
                          Scout
                        </button>
                      </div>

                      {/* Location Details */}
                      <div className="p-6">
                        <h5 className="text-[#00FF99] font-semibold text-lg mb-3">{location.name}</h5>
                        <p className="text-[#e7e7e7]/80 text-sm mb-4 leading-relaxed">{location.description}</p>
                        
                        {/* Location Properties */}
                        <div className="space-y-3">
                          {location.type && (
                            <div className="flex items-center gap-2">
                              <span className="text-[#00CC7A]">🏗️</span>
                              <span className="text-xs text-[#e7e7e7]/70">Type: {location.type}</span>
                            </div>
                          )}
                          {location.scenes && (
                            <div className="flex items-center gap-2">
                              <span className="text-[#00CC7A]">🎬</span>
                              <span className="text-xs text-[#e7e7e7]/70">Scenes: {location.scenes}</span>
                            </div>
                          )}
                          {location.timeOfDay?.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-[#00CC7A]">🕐</span>
                              <div className="flex flex-wrap gap-1">
                                {location.timeOfDay.map((time: string, timeIndex: number) => (
                                  <span 
                                    key={timeIndex}
                                    className="text-xs bg-[#00FF99]/10 text-[#00FF99] px-2 py-1 rounded-full"
                                  >
                                    {time}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {location.weather && (
                            <div className="flex items-center gap-2">
                              <span className="text-[#00CC7A]">🌤️</span>
                              <span className="text-xs text-[#e7e7e7]/70">Weather: {location.weather}</span>
                            </div>
                          )}
                          {location.accessibility && (
                            <div className="flex items-center gap-2">
                              <span className="text-[#00CC7A]">🚗</span>
                              <span className="text-xs text-[#e7e7e7]/70">Access: {location.accessibility}</span>
                            </div>
                          )}
                          {location.permits && (
                            <div className="flex items-center gap-2">
                              <span className="text-[#00CC7A]">📋</span>
                              <span className="text-xs text-[#e7e7e7]/70">Permits: {location.permits}</span>
                            </div>
                          )}
                          {location.budget && (
                            <div className="flex items-center gap-2">
                              <span className="text-[#00CC7A]">💰</span>
                              <span className="text-xs text-[#e7e7e7]/70">Budget: {location.budget}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Requirements */}
                        {location.requirements?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-[#36393f]/30">
                            <h6 className="text-sm font-medium text-[#00FF99] mb-2">Requirements</h6>
                            <div className="space-y-1">
                              {location.requirements.map((req: string, reqIndex: number) => (
                                <div key={reqIndex} className="text-xs text-[#e7e7e7]/70 flex items-center gap-2">
                                  <span className="text-[#00CC7A]">•</span>
                                  {req}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Production Status */}
                        <div className="mt-4 pt-4 border-t border-[#36393f]/30">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-[#e7e7e7]/60">Production Status</span>
                            <span className="text-xs bg-[#00FF99]/10 text-[#00FF99] px-2 py-1 rounded-full">
                              Ready to Film
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Enhanced character casting parser using unified system  
  const parseCastingCharacters = (castingData: any) => {
    if (!castingData) return { characters: [] }
    
    // Handle both object and string input
    let cleanData = castingData
    if (typeof castingData === 'string') {
      const cleanText = cleanAIContent(castingData)
      const structure = detectContentStructure(cleanText)
      
      // Try JSON parsing first
      if (structure.hasJSON) {
        try {
          cleanData = JSON.parse(cleanText)
        } catch (e) {
          console.log('🎭 JSON parsing failed for casting data')
          return { characters: [] }
        }
      } else {
        // If it's text, return empty for now (could add text parsing later)
        return { characters: [] }
      }
    }
    
    if (!cleanData || !cleanData.characters) return { characters: [] }
    
    const characters = cleanData.characters.map((character: any, index: number) => {
      const description = character.description || character.notes || ''
      
      // Extract character details from description
      const ageMatch = description.match(/(\d+)[-\s]*(?:to|-)?\s*(\d+)?\s*years?\s*old/i)
      const genderMatch = description.match(/(male|female|non-binary|man|woman)/i)
      const ethnicityMatch = description.match(/(caucasian|asian|hispanic|african|black|white|latino|latina|mixed)/i)
      const physicalMatch = description.match(/(tall|short|athletic|slim|muscular|average|petite|stocky)/i)
      
      // Extract personality traits
      const personalityMatches = description.match(/(confident|shy|outgoing|reserved|charismatic|intelligent|funny|serious|kind|tough|vulnerable|strong|weak|ambitious|loyal|rebellious|caring|mysterious|charming)/gi) || []
      
      // Extract skills or requirements
      const skillMatches = description.match(/(actor|actress|dancer|singer|martial arts|stunt|accent|language|comedy|drama|action)/gi) || []
      
      return {
        ...character,
        name: character.name || character.characterName || `Character ${index + 1}`,
        age: ageMatch ? `${ageMatch[1]}${ageMatch[2] ? `-${ageMatch[2]}` : ''}` : '',
        gender: genderMatch ? genderMatch[1] : '',
        ethnicity: ethnicityMatch ? ethnicityMatch[1] : '',
        physicalType: physicalMatch ? physicalMatch[1] : '',
        personality: personalityMatches.slice(0, 3), // Limit to 3 traits
        skills: skillMatches.slice(0, 3), // Limit to 3 skills
        importance: description.toLowerCase().includes('lead') || description.toLowerCase().includes('main') ? 'lead' : 
                   description.toLowerCase().includes('supporting') ? 'supporting' : 'ensemble'
      }
    })
    
    return { characters }
  }

  const renderV2Casting = () => {
    const castingData = v2Content?.casting
    if (!castingData) {
      return (
        <EmptyContentFallback 
          title="No casting data available"
          description="Generate character casting profiles and requirements for the entire arc"
          icon="🎭"
        />
      )
    }

    const parsedCasting = parseCastingCharacters(castingData)

    return (
      <ContentErrorBoundary>
      <div className="space-y-12">
        {/* Enhanced Casting Overview */}
        <motion.div 
          className="bg-gradient-to-br from-[#2a2a2a]/90 to-[#232427]/90 backdrop-blur-sm rounded-3xl p-8 border border-[#36393f]/40 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-[#e7e7e7] mb-2">Character Casting</h3>
            <p className="text-[#e7e7e7]/70 text-lg">Professional casting profiles with AI generation frames</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00FF99] to-[#00CC7A] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎭</span>
              </div>
              <div className="text-3xl font-bold text-[#00FF99] mb-2">{parsedCasting.characters?.length || 0}</div>
              <div className="text-[#e7e7e7]/80 font-medium">Characters</div>
            </div>
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00FF99] to-[#00CC7A] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📖</span>
              </div>
              <div className="text-3xl font-bold text-[#00FF99] mb-2">{(castingData.arcIndex || 0) + 1}</div>
              <div className="text-[#e7e7e7]/80 font-medium">Arc</div>
            </div>
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00FF99] to-[#00CC7A] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-3xl font-bold text-[#00FF99] mb-2">Ready</div>
              <div className="text-[#e7e7e7]/80 font-medium">Status</div>
            </div>
          </div>
        </motion.div>

        {/* Character Profiles */}
        {parsedCasting.characters?.length > 0 && (
      <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#00FF99] mb-6">Character Profiles</h3>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {parsedCasting.characters.map((character: any, index: number) => (
                <motion.div 
                  key={index} 
                  className="bg-gradient-to-br from-[#36393f]/20 to-[#2a2a2a]/30 rounded-xl border border-[#36393f]/30 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  {/* Character AI Image Frame */}
                  <div className="aspect-square bg-gradient-to-br from-[#36393f]/20 to-[#2a2a2a]/40 border-2 border-dashed border-[#00FF99]/30 m-4 rounded-lg flex flex-col items-center justify-center group hover:border-[#00FF99]/60 transition-colors">
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🎭</div>
                    <p className="text-sm text-[#00FF99] font-medium text-center">{character.name}</p>
                    <p className="text-xs text-[#e7e7e7]/60 text-center">Actor Reference</p>
                    <button className="mt-2 text-xs bg-[#00FF99]/10 hover:bg-[#00FF99]/20 text-[#00FF99] px-3 py-1 rounded-full transition-colors">
                      Generate
                    </button>
            </div>

                  {/* Character Details */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[#00FF99] font-semibold text-lg">{character.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        character.importance === 'lead' ? 'bg-yellow-500/20 text-yellow-400' :
                        character.importance === 'supporting' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {character.importance || 'Character'}
                      </span>
                    </div>
                    
                    <p className="text-[#e7e7e7]/80 text-sm mb-4 leading-relaxed line-clamp-3">
                      {character.description || character.notes}
                    </p>
                    
                    {/* Character Specs */}
                    <div className="space-y-2 mb-4">
                      {character.age && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[#00CC7A]">📅</span>
                          <span className="text-[#e7e7e7]/70">Age: {character.age}</span>
                </div>
                      )}
                      {character.gender && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[#00CC7A]">👤</span>
                          <span className="text-[#e7e7e7]/70">Gender: {character.gender}</span>
                        </div>
                      )}
                      {character.ethnicity && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[#00CC7A]">🌍</span>
                          <span className="text-[#e7e7e7]/70">Ethnicity: {character.ethnicity}</span>
                        </div>
                      )}
                      {character.physicalType && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[#00CC7A]">💪</span>
                          <span className="text-[#e7e7e7]/70">Build: {character.physicalType}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Personality Traits */}
                    {character.personality?.length > 0 && (
                      <div className="mb-4">
                        <h6 className="text-xs font-medium text-[#00FF99] mb-2">Personality</h6>
                        <div className="flex flex-wrap gap-1">
                          {character.personality.map((trait: string, traitIndex: number) => (
                            <span 
                              key={traitIndex}
                              className="text-xs bg-[#00FF99]/10 text-[#00FF99] px-2 py-1 rounded-full"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Required Skills */}
                    {character.skills?.length > 0 && (
                      <div className="mb-4">
                        <h6 className="text-xs font-medium text-[#00FF99] mb-2">Skills Required</h6>
                        <div className="flex flex-wrap gap-1">
                          {character.skills.map((skill: string, skillIndex: number) => (
                            <span 
                              key={skillIndex}
                              className="text-xs bg-[#00CC7A]/10 text-[#00CC7A] px-2 py-1 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Casting Status */}
                    <div className="pt-4 border-t border-[#36393f]/30">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#e7e7e7]/60">Casting Status</span>
                        <span className="text-xs bg-[#00FF99]/10 text-[#00FF99] px-2 py-1 rounded-full">
                          Open Casting
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
      </ContentErrorBoundary>
    )
  }

  const renderV2Marketing = () => {
    const marketingData = v2Content?.marketing
    if (!marketingData) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00FF99] to-[#00CC7A] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📢</span>
          </div>
          <p className="text-[#e7e7e7]/70 text-lg">No marketing data available</p>
          <p className="text-[#e7e7e7]/50 text-sm mt-2">v2Content.marketing is {marketingData === undefined ? 'undefined' : 'null'}</p>
        </div>
      )
    }

    return (
      <ContentErrorBoundary>
      <div className="space-y-12">
        {/* Enhanced Marketing Overview */}
        <motion.div 
          className="bg-gradient-to-br from-[#2a2a2a]/90 to-[#232427]/90 backdrop-blur-sm rounded-3xl p-8 border border-[#36393f]/40 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-[#e7e7e7] mb-2">Marketing Strategy</h3>
            <p className="text-[#e7e7e7]/70 text-lg">Episode-specific campaigns with visual assets and social media strategies</p>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">{marketingData.episodes?.length || 0}</div>
              <div className="text-[#e7e7e7]/80 font-medium">Episodes</div>
            </div>
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">Pro</div>
              <div className="text-[#e7e7e7]/80 font-medium">Campaign</div>
            </div>
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">Multi-Platform</div>
              <div className="text-[#e7e7e7]/80 font-medium">Strategy</div>
            </div>
          </div>
        </motion.div>

                {/* Enhanced Episode Navigation */}
        <div className="bg-gradient-to-br from-[#2a2a2a]/90 to-[#232427]/90 backdrop-blur-sm rounded-3xl border border-[#36393f]/40 shadow-2xl overflow-hidden">
          <ContentErrorBoundary>
            <EpisodeNavigation 
              episodes={marketingData.episodes || []}
              activeEpisode={activeMarketingEpisode}
              onEpisodeChange={setActiveMarketingEpisode}
            />
          </ContentErrorBoundary>

          {/* Selected Episode Content */}
          {marketingData.episodes?.map((episode: any) => {
            if (episode.episodeNumber !== activeMarketingEpisode) return null
            
            return (
              <div key={episode.episodeNumber} className="p-8">
                {/* Episode Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00FF99] to-[#00CC7A] rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">📢</span>
                  </div>
                <div>
                    <h3 className="text-3xl font-bold text-[#e7e7e7] mb-1 font-medium cinematic-subheader">
                      {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                    </h3>
                    <p className="text-[#e7e7e7]/70 text-lg">
                      Marketing campaign • Multi-platform strategy
                    </p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Marketing Poster Generation */}
                  <motion.div
                    className="bg-gradient-to-br from-[#36393f]/20 to-[#2a2a2a]/30 rounded-xl border border-[#36393f]/30 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Poster AI Frame */}
                    <div className="aspect-[3/4] bg-gradient-to-br from-[#36393f]/20 to-[#2a2a2a]/40 border-2 border-dashed border-[#00FF99]/30 m-4 rounded-lg flex flex-col items-center justify-center group hover:border-[#00FF99]/60 transition-colors">
                      <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🎬</div>
                      <p className="text-lg text-[#00FF99] font-medium text-center">Episode Poster</p>
                      <p className="text-sm text-[#e7e7e7]/60 text-center">Marketing Visual</p>
                      <button className="mt-4 text-sm bg-[#00FF99]/10 hover:bg-[#00FF99]/20 text-[#00FF99] px-4 py-2 rounded-full transition-colors">
                        Generate Poster
                      </button>
                    </div>

                    <div className="p-4">
                      <h4 className="text-[#00FF99] font-semibold text-lg mb-2">Marketing Poster</h4>
                      <p className="text-[#e7e7e7]/70 text-sm">AI-generated episode poster for social media and promotional materials</p>
                    </div>
                  </motion.div>

                  {/* Marketing Content */}
                  <div className="space-y-6">
                    {/* Marketing Hooks */}
                    {episode.marketingHooks?.length > 0 && (
                      <motion.div
                        className="bg-gradient-to-br from-[#36393f]/20 to-[#2a2a2a]/30 rounded-xl border border-[#36393f]/30 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      >
                        <h4 className="text-lg font-semibold text-[#00FF99] mb-4 flex items-center gap-2">
                          <span>🎣</span>
                          Marketing Hooks
                        </h4>
                        <div className="space-y-3">
                          {episode.marketingHooks.map((hook: any, hookIndex: number) => (
                            <motion.div 
                              key={hookIndex} 
                              className="bg-[#1a1a1a]/60 rounded-lg p-4 border border-[#36393f]/20"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: hookIndex * 0.1 }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-[#00FF99]/20 rounded-full flex items-center justify-center mt-1">
                                  <span className="text-xs text-[#00FF99]">💡</span>
                                </div>
                                <p className="text-[#e7e7e7]/85 leading-relaxed">
                        {typeof hook === 'string' ? hook : hook.text || 'Marketing hook'}
                                </p>
                      </div>
                            </motion.div>
                    ))}
                  </div>
                      </motion.div>
              )}

                    {/* Hashtag Strategy */}
              {episode.hashtags?.length > 0 && (
                      <motion.div
                        className="bg-gradient-to-br from-[#36393f]/20 to-[#2a2a2a]/30 rounded-xl border border-[#36393f]/30 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <h4 className="text-lg font-semibold text-[#00FF99] mb-4 flex items-center gap-2">
                          <span>#️⃣</span>
                          Hashtag Strategy
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {episode.hashtags.map((hashtag: string, hashIndex: number) => (
                            <motion.span 
                              key={hashIndex} 
                              className="bg-gradient-to-r from-[#00FF99] to-[#00CC7A] text-black px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform cursor-pointer"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: hashIndex * 0.05 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              #{hashtag.replace('#', '')}
                            </motion.span>
                    ))}
                  </div>
                      </motion.div>
                    )}

                    {/* Target Audience */}
                    <motion.div
                      className="bg-gradient-to-br from-[#36393f]/20 to-[#2a2a2a]/30 rounded-xl border border-[#36393f]/30 p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <h4 className="text-lg font-semibold text-[#00FF99] mb-4 flex items-center gap-2">
                        <span>🎯</span>
                        Target Audience
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#00FF99] mb-1">18-34</div>
                          <div className="text-xs text-[#e7e7e7]/70">Primary Age</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#00FF99] mb-1">Global</div>
                          <div className="text-xs text-[#e7e7e7]/70">Reach</div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Platform Strategy */}
                    <motion.div
                      className="bg-gradient-to-br from-[#36393f]/20 to-[#2a2a2a]/30 rounded-xl border border-[#36393f]/30 p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <h4 className="text-lg font-semibold text-[#00FF99] mb-4 flex items-center gap-2">
                        <span>📱</span>
                        Platform Strategy
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook'].map((platform, index) => (
                          <div key={index} className="bg-[#1a1a1a]/60 rounded-lg px-3 py-2 border border-[#36393f]/20">
                            <span className="text-[#e7e7e7]/80 text-sm">{platform}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                  </div>
              </div>
            )
          })}
        </div>
      </div>
      </ContentErrorBoundary>
    )
  }

  // Enhanced post-production notes parser using unified system
  const parsePostProductionNotes = (notes: string) => {
    if (!notes) return { editingStyle: '', colorGrading: '', audio: '', effects: '', transitions: '', pacing: '' }
    
    const cleanText = cleanAIContent(notes)
    const structure = detectContentStructure(cleanText)
    
    // Try JSON parsing first if it looks like structured data
    if (structure.hasJSON) {
      try {
        const parsed = JSON.parse(cleanText)
        return {
          editingStyle: parsed.editingStyle || '',
          colorGrading: parsed.colorGrading || '',
          audio: parsed.audio || '',
          effects: parsed.effects || '',
          transitions: parsed.transitions || '',
          pacing: parsed.pacing || ''
        }
      } catch (e) {
        console.log('🎞️ JSON parsing failed, falling back to text parsing')
      }
    }
    
    const lowerNotes = cleanText.toLowerCase()
    
    return {
      editingStyle: lowerNotes.includes('fast') ? 'Fast-paced' : 
                   lowerNotes.includes('slow') ? 'Slow-paced' : 
                   lowerNotes.includes('dramatic') ? 'Dramatic' : 'Standard',
      colorGrading: lowerNotes.includes('warm') ? 'Warm tones' :
                   lowerNotes.includes('cool') ? 'Cool tones' :
                   lowerNotes.includes('dark') ? 'Dark/moody' :
                   lowerNotes.includes('bright') ? 'Bright/vibrant' : 'Natural',
      audio: lowerNotes.includes('music') || lowerNotes.includes('score') ? 'Musical score' :
             lowerNotes.includes('ambient') ? 'Ambient sound' :
             lowerNotes.includes('dialogue') ? 'Dialogue focus' : 'Standard audio',
      effects: lowerNotes.includes('vfx') || lowerNotes.includes('effects') ? 'Visual effects' :
               lowerNotes.includes('practical') ? 'Practical effects' : 'Minimal effects',
      transitions: lowerNotes.includes('cut') ? 'Quick cuts' :
                  lowerNotes.includes('fade') ? 'Fade transitions' :
                  lowerNotes.includes('smooth') ? 'Smooth transitions' : 'Standard cuts',
      pacing: lowerNotes.includes('tension') ? 'Build tension' :
              lowerNotes.includes('calm') ? 'Calm pacing' :
              lowerNotes.includes('action') ? 'Action pacing' : 'Narrative pacing'
    }
  }

  const renderV2PostProduction = () => {
    const postProdData = v2Content?.postProduction
    if (!postProdData) {
      return (
        <EmptyContentFallback 
          title="No post-production data available"
          description="Generate AI-ready editing prompts and post-production workflows"
          icon="🎞️"
        />
      )
    }

    return (
      <ContentErrorBoundary>
      <div className="space-y-12">
        {/* Enhanced Post-Production Overview */}
        <motion.div 
          className="bg-gradient-to-br from-[#2a2a2a]/90 to-[#232427]/90 backdrop-blur-sm rounded-3xl p-8 border border-[#36393f]/40 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h3 className="text-3xl font-bold text-[#e7e7e7]">Post-Production Workflow</h3>
              <button
                onClick={() => setShowPostProdInfo(true)}
                className="w-8 h-8 bg-[#00FF99]/20 hover:bg-[#00FF99]/30 rounded-full flex items-center justify-center transition-colors"
                title="About this tab"
              >
                <span className="text-[#00FF99] text-sm">ℹ️</span>
              </button>
            </div>
            <p className="text-[#e7e7e7]/70 text-lg">AI-ready editing prompts and structured post-production guidelines</p>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">{postProdData.totalScenes || 0}</div>
              <div className="text-[#e7e7e7]/80 font-medium">Total Scenes</div>
                </div>
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">AI-Ready</div>
              <div className="text-[#e7e7e7]/80 font-medium">Format</div>
            </div>
            <div className="text-center p-6 bg-[#36393f]/30 rounded-2xl border border-[#36393f]/40">
              <div className="text-2xl font-bold text-[#00FF99] mb-2">Pro</div>
              <div className="text-[#e7e7e7]/80 font-medium">Quality</div>
            </div>
          </div>
        </motion.div>

        {/* Episode Processing Workflow */}
        <div className="space-y-8">
          {postProdData.episodes?.map((episode: any, index: number) => (
            <motion.div 
              key={episode.episodeNumber} 
              className="bg-gradient-to-br from-[#2a2a2a]/90 to-[#252628]/90 backdrop-blur-sm rounded-3xl border border-[#36393f]/40 shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-gradient-to-r from-[#2a2a2a]/95 to-[#252628]/95 border-b border-[#36393f]/40 p-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00FF99] to-[#00CC7A] rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🎞️</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-[#e7e7e7] mb-1 font-medium cinematic-subheader">
                      {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                    </h3>
                    <p className="text-[#e7e7e7]/70 text-lg">
                      {episode.totalScenes || episode.scenes?.length || 0} scene editing instructions
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {episode.scenes?.map((scene: any, sceneIndex: number) => {
                    const parsedNotes = parsePostProductionNotes(scene.notes || '')
                    
                    return (
                      <motion.div
                        key={scene.sceneNumber || sceneIndex}
                        className="bg-gradient-to-br from-[#36393f]/20 to-[#2a2a2a]/30 rounded-xl border border-[#36393f]/30 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: sceneIndex * 0.1 }}
                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                      >
                        {/* Scene Header */}
                        <div className="bg-gradient-to-r from-[#00FF99]/10 to-[#00CC7A]/10 border-b border-[#36393f]/30 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#00FF99]/20 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-[#00FF99]">{scene.sceneNumber || sceneIndex + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#00FF99]">
                                Scene {scene.sceneNumber || sceneIndex + 1}
                              </h4>
                              <p className="text-xs text-[#e7e7e7]/70">{scene.sceneTitle || 'Post-Production Guide'}</p>
                            </div>
                          </div>
                        </div>

                        {/* AI Processing Instructions */}
                        <div className="p-4">
                          <div className="space-y-4">
                            {/* Primary Notes */}
                            <div className="bg-[#1a1a1a]/60 rounded-lg p-3 border border-[#36393f]/20">
                              <h6 className="text-xs font-medium text-[#00FF99] mb-2">AI Processing Notes</h6>
                              <p className="text-[#e7e7e7]/85 text-sm leading-relaxed">
                                {scene.notes || 'Standard post-production processing with professional editing standards.'}
                              </p>
                            </div>

                            {/* Structured AI Parameters */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-[#e7e7e7]/60">Editing Style:</span>
                                <span className="text-xs bg-[#00FF99]/10 text-[#00FF99] px-2 py-1 rounded-full">
                                  {parsedNotes.editingStyle}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-[#e7e7e7]/60">Color Grading:</span>
                                <span className="text-xs bg-[#00CC7A]/10 text-[#00CC7A] px-2 py-1 rounded-full">
                                  {parsedNotes.colorGrading}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-[#e7e7e7]/60">Audio Focus:</span>
                                <span className="text-xs bg-[#36393f]/30 text-[#e7e7e7] px-2 py-1 rounded-full">
                                  {parsedNotes.audio}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-[#e7e7e7]/60">Effects:</span>
                                <span className="text-xs bg-[#36393f]/30 text-[#e7e7e7] px-2 py-1 rounded-full">
                                  {parsedNotes.effects}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-[#e7e7e7]/60">Transitions:</span>
                                <span className="text-xs bg-[#36393f]/30 text-[#e7e7e7] px-2 py-1 rounded-full">
                                  {parsedNotes.transitions}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-[#e7e7e7]/60">Pacing:</span>
                                <span className="text-xs bg-[#36393f]/30 text-[#e7e7e7] px-2 py-1 rounded-full">
                                  {parsedNotes.pacing}
                                </span>
                              </div>
                            </div>

                            {/* AI Model Ready Badge */}
                            <div className="pt-3 border-t border-[#36393f]/30">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-[#e7e7e7]/60">AI Processing</span>
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                                  <span>🤖</span>
                                  Ready
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      </ContentErrorBoundary>
    )
  }

  // AUTO-GENERATION LOGIC: Start generation when data is ready but no content exists (moved before conditional returns)
  useEffect(() => {
    // Only auto-generate if:
    // 1. No existing V2 content
    // 2. Not currently generating 
    // 3. Have required data (story bible and episodes)
    // 4. No existing pre-production content in localStorage
    if (!v2Content && !isGenerating && storyBible && arcEpisodes.length > 0 && !hasExistingContent) {
      console.log('🚀 AUTO-GENERATION TRIGGERED - All prerequisites met')
      console.log('📊 Generation prerequisites:', { 
        hasStoryBible: !!storyBible, 
        episodeCount: arcEpisodes.length,
        arcIndex,
        arcTitle,
        hasExistingContent
      })
      
      // Small delay to ensure UI is ready
      setTimeout(() => {
        startV2Generation()
      }, 500)
    } else {
      console.log('⏸️ Auto-generation skipped:', {
        hasV2Content: !!v2Content,
        isGenerating,
        hasStoryBible: !!storyBible,
        episodeCount: arcEpisodes.length,
        hasExistingContent
      })
    }
  }, [v2Content, isGenerating, storyBible, arcEpisodes.length, hasExistingContent])

  // Force regeneration
  const forceRegenerate = () => {
    setV2Content(null)
    setHasExistingContent(false)
    setShowResults(false)
    
    // Clear any existing localStorage content
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`scorched-preproduction-${arcIndex}`)
      localStorage.removeItem(`reeled-preproduction-${arcIndex}`)
      console.log(`🗑️ Cleared existing V2 content for arc ${arcIndex}`)
    }
    
    startV2Generation()
  }


  // Show loading screen during generation
  if (isGenerating) {
    return (
      <PreProductionV2LoadingScreen
        isVisible={isGenerating}
        storyBible={storyBible}
        arcEpisodes={arcEpisodes}
        workspaceEpisodes={workspaceEpisodes}
        arcIndex={arcIndex}
        arcTitle={arcTitle}
        onComplete={onV2Complete}
        onError={onV2Error}
      />
    )
  }

  // This unnecessary start screen is now completely bypassed
  if (false) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: 'League Spartan, sans-serif' }}>
        {/* Fire Video Background */}

        <div className="text-center space-y-8 max-w-2xl relative z-10">
          <motion.div
            className="inline-flex items-center space-x-4 mb-8"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center">
              <span className="text-3xl">🎬</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold font-medium greenlit-gradient">
              REVOLUTIONARY PRE-PRODUCTION V2
            </h1>
          </motion.div>
          
          {hasExistingContent ? (
            <div className="space-y-6">
              <div className="bg-[#1e1e1e] border border-[#00FF99]/60 p-8 rounded-xl">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="text-3xl">✅</span>
                  <h2 className="text-2xl font-bold text-[#00FF99] font-medium">PROFESSIONAL CONTENT READY</h2>
                </div>
                <p className="text-white/90 font-medium text-lg">
                  Pre-production materials for this arc have already been forged and are ready to view.
                </p>
              </div>
              
              <div className="space-y-3 text-lg text-white/80 font-medium">
                <div>Series: {storyBible?.seriesTitle || 'Loading...'}</div>
                <div>Arc: {arcTitle || `Arc ${arcIndex + 1}`}</div>
                <div>Episodes: {arcEpisodes.length}</div>
              </div>
              
              <div className="flex gap-6 justify-center">
                <motion.button
                  onClick={() => setShowResults(true)}
                  className="burn-button px-8 py-4 text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  VIEW REVOLUTIONARY CONTENT
                </motion.button>
                <motion.button
                  onClick={forceRegenerate}
                  className="px-8 py-4 text-lg border-2 border-[#00FF99] text-[#00FF99] hover:bg-[#00FF99] hover:text-black rounded-xl font-bold transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  REGENERATE CONTENT
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <p className="text-white/90 font-medium text-xl">
                Ready to forge comprehensive pre-production materials using the revolutionary engineless V2 system with GPT-4.1 (Azure OpenAI).
              </p>
              <div className="space-y-3 text-lg text-white/80 font-medium">
                <div>Series: {storyBible?.seriesTitle || 'Loading...'}</div>
                {isSingleEpisodeMode ? (
                  <>
                    <div>Episode: {singleEpisodeNumber}</div>
                    <div>From: {arcTitle || `Arc ${arcIndex + 1}`}</div>
                  </>
                ) : (
                  <>
                    <div>Arc: {arcTitle || `Arc ${arcIndex + 1}`}</div>
                    <div>Episodes: {arcEpisodes.length}</div>
                  </>
                )}
              </div>
              <motion.button
                onClick={startV2Generation}
                disabled={!localStorage.getItem('greenlit-story-bible') && !localStorage.getItem('scorched-story-bible') && !localStorage.getItem('reeled-story-bible') && !localStorage.getItem('greenlit-preproduction-data') && !localStorage.getItem('scorched-preproduction-data') && !localStorage.getItem('reeled-preproduction-data')}
                className="burn-button px-12 py-6 text-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                START PROFESSIONAL GENERATION
              </motion.button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main results interface
  return (
    <div className="min-h-screen text-white relative" style={{ fontFamily: 'League Spartan, sans-serif' }}>
      <AnimatedBackground intensity="medium" />
      <div className="container mx-auto px-6 py-12 max-w-7xl relative z-10">
        {/* Professional Header */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Professional Main Title Section */}
          <div className="text-center mb-12">
            <motion.div 
              className="inline-flex items-center space-x-4 mb-8"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-16 h-16 rounded-xl flex items-center justify-center">
                <span className="text-3xl">🎬</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold font-medium greenlit-gradient">
                {storyBible?.seriesTitle || 'Your Series Title'}
              </h1>
            </motion.div>
            <p className="text-2xl text-white/90 font-medium mb-4">
              {isSingleEpisodeMode 
                ? `Episode ${singleEpisodeNumber} • Professional Pre-Production Complete`
                : `Arc ${arcIndex + 1}: {arcTitle} • Professional Pre-Production Complete`
              }
            </p>
            <p className="text-xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
              Professional production materials ready for your series. Everything you need to bring your vision to life.
            </p>
          </div>

          {/* Enhanced Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-8">
            <div className="bg-gradient-to-br from-[#2a2a2a]/80 to-[#1e1e1e]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#36393f]/30 hover:border-[#00FF99]/30 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#00FF99]/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📝</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#00FF99] mb-1">
                    {V2_TABS.length}
                  </div>
                  <div className="text-[#e7e7e7]/70 text-sm font-medium">Production Assets</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#2a2a2a]/80 to-[#1e1e1e]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#36393f]/30 hover:border-[#00FF99]/30 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#00FF99]/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎭</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#00FF99] mb-1">
                    {arcEpisodes.length}
                  </div>
                  <div className="text-[#e7e7e7]/70 text-sm font-medium">Episodes Ready</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#2a2a2a]/80 to-[#1e1e1e]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#36393f]/30 hover:border-[#00FF99]/30 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#00FF99]/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#00FF99] mb-1">100%</div>
                  <div className="text-[#e7e7e7]/70 text-sm font-medium">Production Ready</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#2a2a2a]/80 to-[#1e1e1e]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#36393f]/30 hover:border-[#00FF99]/30 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#00FF99]/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🎪</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#00FF99] mb-1">V2</div>
                  <div className="text-[#e7e7e7]/70 text-sm font-medium">Engine Version</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => router.back()}
              variant="outline"
              className="border-[#36393f]/40 text-[#e7e7e7]/80 hover:bg-[#36393f]/30 hover:text-[#e7e7e7] rounded-xl px-6 py-3"
            >
              <span className="mr-2">←</span>
              Back to Project
            </Button>
            {hasExistingContent && (
              <Button 
                onClick={forceRegenerate}
                variant="outline"
                className="border-[#00FF99]/40 text-[#00FF99]/80 hover:bg-[#00FF99]/20 hover:text-[#00FF99] rounded-xl px-6 py-3"
              >
                <span className="mr-2">🔄</span>
                Regenerate All
              </Button>
            )}
          </div>
        </motion.div>

        {/* Professional Tab Navigation */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
      {/* Enhanced Tab Navigation with New Design System */}
          <div className="flex justify-center mb-12">
            <DesignComponents.ContentCard 
              variant="elevated"
              className="w-full max-w-6xl overflow-x-auto"
            >
              <div className="p-4 md:p-6">
                <div className="flex flex-nowrap md:flex-wrap gap-2 md:gap-3 min-w-max md:min-w-0 justify-start md:justify-center">
                  {V2_TABS.map((tab, index) => {
                    const isActive = activeTab === tab.id
                    
                    return (
                  <motion.button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'postProduction') {
                    setShowPostProdInfo(true)
                  }
                  setActiveTab(tab.id)
                }}
                        className={`
                          relative group min-w-0 touch-manipulation
                          px-3 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl
                          transition-all duration-300 transform-gpu will-change-transform
                          flex items-center gap-2 md:gap-4
                          ${isActive 
                            ? `
                              bg-gradient-to-br from-[${ds.colors.primary[500]}] to-[${ds.colors.primary[600]}]
                              text-black shadow-xl shadow-[${ds.colors.primary[500]}]/30
                              border border-[${ds.colors.primary[400]}]/50
                            `
                            : `
                              bg-[${ds.colors.dark.surface.elevated}]/30 
                              text-[${ds.colors.dark.text.secondary}]
                              border border-[${ds.colors.dark.surface.elevated}]/40
                              hover:bg-[${ds.colors.dark.surface.elevated}]/50 
                              hover:border-[${ds.colors.primary[500]}]/30 
                              hover:text-[${ds.colors.dark.text.primary}]
                              active:bg-[${ds.colors.dark.surface.elevated}]/70
                            `
                          }
                        `}
                        whileHover={{ 
                          scale: 1.02, 
                          y: -2,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ 
                          scale: 0.98,
                          transition: { duration: 0.1 }
                        }}
                      >
                        {/* Icon with enhanced styling */}
                        <div className={`
                          w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center
                          ${isActive 
                            ? 'bg-black/10' 
                            : `bg-[${ds.colors.primary[500]}]/10 group-hover:bg-[${ds.colors.primary[500]}]/20`
                          }
                        `}>
                          <span className="text-lg md:text-xl">{tab.icon}</span>
                        </div>
                        
                        {/* Label with enhanced typography */}
                        <div className="hidden md:flex flex-col items-start">
                          <span className={`
                            font-semibold text-sm md:text-base
                            ${isActive ? 'text-black' : `text-[${ds.colors.dark.text.secondary}] group-hover:text-[${ds.colors.dark.text.primary}]`}
                          `}>
                            {tab.label}
                          </span>
                          <span className={`
                            text-xs leading-tight
                            ${isActive ? 'text-black/70' : `text-[${ds.colors.dark.text.tertiary}]`}
                          `}>
                            {tab.description.split(' ').slice(0, 2).join(' ')}
                          </span>
                        </div>
                        
                        {/* Enhanced keyboard shortcut indicator */}
                        <div className={`
                          hidden lg:flex items-center justify-center
                          w-6 h-6 rounded-md text-xs font-bold
                          ${isActive 
                            ? 'bg-black/20 text-black/80 border border-black/30' 
                            : `bg-[${ds.colors.primary[500]}]/10 text-[${ds.colors.primary[500]}] border border-[${ds.colors.primary[500]}]/30`
                          }
                        `}>
                          {index + 1}
                        </div>
                        
                        {/* Enhanced tooltip */}
                        <div className={`
                          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 
                          px-4 py-3 rounded-xl border backdrop-blur-md
                          bg-[${ds.colors.dark.surface.overlay}]/95 border-[${ds.colors.dark.surface.elevated}]/50
                          text-[${ds.colors.dark.text.secondary}] text-sm shadow-2xl
                          opacity-0 group-hover:opacity-100 transition-all duration-300
                          pointer-events-none whitespace-nowrap z-50
                        `}>
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold">{tab.label}</span>
                            <span className={`text-xs text-[${ds.colors.dark.text.tertiary}]`}>
                      {tab.description}
                            </span>
                            <span className={`text-xs text-[${ds.colors.primary[500]}] mt-1`}>
                              Press {index + 1} to switch
                            </span>
                          </div>
                          {/* Tooltip arrow */}
                          <div className={`
                            absolute top-full left-1/2 transform -translate-x-1/2 
                            w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent 
                            border-t-[${ds.colors.dark.surface.overlay}]/95
                          `}></div>
                    </div>
                  </motion.button>
                    )
                  })}
          </div>
        </div>
            </DesignComponents.ContentCard>
      </div>

          {/* Enhanced Section Header with New Design System */}
          <motion.div
            className="mb-12"
            key={activeTab}
              initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DesignComponents.SectionHeader
              icon={V2_TABS.find(tab => tab.id === activeTab)?.icon || '📝'}
              title={V2_TABS.find(tab => tab.id === activeTab)?.label || 'Content'}
              description={V2_TABS.find(tab => tab.id === activeTab)?.description || 'Content details'}
              actions={
                <div className="flex items-center gap-3">
                  <DesignComponents.Button
                    variant="secondary"
                    size="sm"
                    onClick={() => exportTabAsJSON(activeTab, v2Content?.[activeTab])}
                    title={`Export ${V2_TABS.find(tab => tab.id === activeTab)?.label} as JSON`}
                  >
                    <span>📥</span>
                    <span className="hidden sm:inline">Export Tab</span>
                  </DesignComponents.Button>
                  
                  <DesignComponents.Button
                    variant="primary"
                    size="sm"
                    onClick={exportAsJSON}
                    title="Export all pre-production content as JSON"
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <LoadingComponents.PulsingDots />
                        <span className="hidden sm:inline">Exporting...</span>
                      </>
                    ) : (
                      <>
                        <span>📦</span>
                        <span className="hidden sm:inline">Export All</span>
                      </>
                    )}
                  </DesignComponents.Button>
                  
                  {/* Advanced Actions Menu */}
                  <DesignComponents.Button
                    variant="ghost"
                    size="sm"
                    title="More actions"
                  >
                    <span>⚙️</span>
                  </DesignComponents.Button>
              </div>
              }
            />
            </motion.div>
        </motion.div>

        {/* Tab Content */}
        <motion.div 
          className="min-h-[60vh]"
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00FF99]/5 via-transparent to-[#00FF99]/5 rounded-2xl opacity-50"></div>
            
            {/* Content */}
            <div className="relative z-10">
            {renderTabContent()}
            </div>
          </div>
          </motion.div>
      </div>
      
      {/* Post-Production Info Lightbox */}
      {showPostProdInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <motion.div
            className="bg-gradient-to-br from-[#2a2a2a]/95 to-[#232427]/95 backdrop-blur-sm rounded-3xl p-8 border border-[#36393f]/40 shadow-2xl max-w-2xl w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00FF99] to-[#00CC7A] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎞️</span>
              </div>
              <h3 className="text-2xl font-bold text-[#e7e7e7] mb-2">Post-Production Reference</h3>
            </div>
            
            <div className="space-y-4 text-[#e7e7e7]/80">
              <p className="leading-relaxed">
                This tab contains <strong className="text-[#00FF99]">AI-ready post-production prompts</strong> and structured guidelines specifically designed for AI video editing models.
              </p>
              
              <div className="bg-[#36393f]/20 rounded-lg p-4 border-l-4 border-[#00FF99]">
                <h4 className="text-[#00FF99] font-semibold mb-2">🤖 For AI Models</h4>
                <p className="text-sm">
                  The content here is formatted as prompts that AI models can use to understand editing requirements, color grading specifications, audio mixing instructions, and post-production workflows.
                </p>
              </div>
              
              <div className="bg-[#36393f]/20 rounded-lg p-4">
                <h4 className="text-[#00FF99] font-semibold mb-2">📋 What's Included</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Editing style guidelines (pacing, transitions)</li>
                  <li>Color grading specifications</li>
                  <li>Audio mixing instructions</li>
                  <li>Visual effects requirements</li>
                  <li>Scene-specific editing notes</li>
                </ul>
              </div>
              
              <p className="text-sm text-[#e7e7e7]/60">
                You can continue viewing this content or disregard it if you're not working with AI editing tools.
              </p>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowPostProdInfo(false)}
                className="flex-1 bg-[#00FF99] text-black hover:bg-[#f0d995] px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Continue Viewing
              </button>
              <button
                onClick={() => {
                  setShowPostProdInfo(false)
                  setActiveTab('marketing')
                }}
                className="flex-1 bg-[#36393f]/30 hover:bg-[#36393f]/50 text-[#e7e7e7] px-6 py-3 rounded-xl font-medium transition-colors border border-[#36393f]/40"
              >
                Go to Marketing
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Enhanced Export Progress Overlay */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DesignComponents.ContentCard variant="elevated" className="p-8 max-w-md w-full mx-4">
              <div className="text-center space-y-6">
                <div className={`
                  w-16 h-16 mx-auto rounded-2xl flex items-center justify-center
                  bg-gradient-to-br from-[${ds.colors.primary[500]}]/20 to-[${ds.colors.primary[600]}]/20
                  border border-[${ds.colors.primary[500]}]/30
                `}>
                  <motion.span 
                    className="text-2xl"
                    {...animations.pulse}
                  >
                    📦
                  </motion.span>
                </div>
                
                <div>
                  <DesignComponents.Typography.H3 className="mb-2">
                    Exporting Content
                  </DesignComponents.Typography.H3>
                  <DesignComponents.Typography.Body>
                    Preparing your pre-production package...
                  </DesignComponents.Typography.Body>
                </div>
                
                <LoadingComponents.ProgressBar 
                  progress={exportProgress} 
                  className="w-full"
                />
                
                <DesignComponents.Typography.Caption>
                  {exportProgress}% Complete
                </DesignComponents.Typography.Caption>
              </div>
            </DesignComponents.ContentCard>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Global Feedback Components */}
      <FeedbackComponents.SuccessCheck 
        show={showSuccessCheck}
        onComplete={() => setShowSuccessCheck(false)}
      />
      
      <FeedbackComponents.Toast
        message={toastState.message}
        type={toastState.type}
        show={toastState.show}
        onClose={() => setToastState(prev => ({ ...prev, show: false }))}
      />
    </div>
  )
}