'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { SharedInvestorMaterials } from '@/types/investor-materials'
import InvestorCard from '@/components/investor/shared/InvestorCard'
import InvestorLightbox from '@/components/investor/shared/InvestorLightbox'
import EpisodesList from '@/components/investor/EpisodesList'
import ScreenplayViewer from '@/components/investor/ScreenplayViewer'
import SceneBreakdownGallery from '@/components/investor/SceneBreakdownGallery'
import CharacterWeb from '@/components/investor/CharacterWeb'
import DepthTabs from '@/components/investor/DepthTabs'
import NarrativeTechnicalities from '@/components/investor/NarrativeTechnicalities'
import ProductionDashboard from '@/components/investor/ProductionDashboard'
import CampaignPreview from '@/components/investor/CampaignPreview'
import GreenlitCTA from '@/components/investor/GreenlitCTA'
import BehindTheScenes from '@/components/investor/BehindTheScenes'
import ChatWidget from '@/components/chat/ChatWidget'

export default function InvestorMaterialsPage() {
  const params = useParams()
  const linkId = params?.linkId as string
  const [materials, setMaterials] = useState<SharedInvestorMaterials | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!linkId) return

    async function fetchMaterials() {
      try {
        const response = await fetch(`/api/investor-shared/${linkId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Link not found')
          } else if (response.status === 410) {
            setError('This link is no longer active')
          } else {
            setError('Failed to load pitch materials')
          }
          return
        }

        const data = await response.json()
        if (data.success && data.materials) {
          setMaterials(data.materials)
          setHeroImageUrl(data.heroImageUrl || null)
          // Store in sessionStorage for ChatWidget to access
          try {
            sessionStorage.setItem(`investor-materials-${linkId}`, JSON.stringify(data.materials))
          } catch (e) {
            console.warn('Could not store investor materials in sessionStorage:', e)
          }
        } else {
          setError('Invalid response format')
        }
      } catch (err: any) {
        console.error('Error fetching materials:', err)
        setError(err.message || 'Failed to load pitch materials')
      } finally {
        setLoading(false)
      }
    }

    fetchMaterials()
  }, [linkId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
          <p className="text-white/70">Loading pitch materials...</p>
        </div>
      </div>
    )
  }

  if (error || !materials) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Unable to Load Materials</h1>
          <p className="text-white/70 mb-6">{error || 'Pitch materials not found'}</p>
          <p className="text-white/50 text-sm">
            This link may have been revoked or expired. Please contact the creator for a new link.
          </p>
        </div>
      </div>
    )
  }

  const pitchPackage = materials.investorPackage

  // Share link handler
  const handleShareLink = async () => {
    const currentUrl = window.location.href

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: pitchPackage.hook.seriesTitle,
          text: pitchPackage.hook.logline,
          url: currentUrl
        })
        return
      } catch (err) {
        // User cancelled or error occurred, fall back to clipboard
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    }

    // Fall back to clipboard
    try {
      await navigator.clipboard.writeText(currentUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = currentUrl
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }

  // Section definitions for dashboard cards
  const sections = [
    {
      id: 'story',
      icon: '📖',
      title: 'Narrative foundation',
      description: 'Raw unenhanced narrative used to write the script',
      stats: `${pitchPackage.story.episodes.length} episodes`,
      component: (
        <EpisodesList
          episodes={pitchPackage.story.episodes}
          arcTitle={pitchPackage.story.arcTitle}
          arcDescription={pitchPackage.story.arcDescription}
        />
      )
    },
    {
      id: 'pilot',
      icon: '🎬',
      title: 'Screenplay',
      description: 'Complete screenplay collection spanning all episodes',
      stats: `${pitchPackage.pilot.sceneStructure.totalPages} pages`,
      component: (
        <ScreenplayViewer
          pilot={pitchPackage.pilot}
          story={pitchPackage.story}
          storyBibleId={pitchPackage.storyBibleId}
          linkId={linkId}
          episodeScripts={pitchPackage.episodeScripts}
        />
      )
    },
    {
      id: 'visuals',
      icon: '🎨',
      title: 'Visual Narrative',
      description: 'Storyboard frames organized by scene',
      stats: `${pitchPackage.visuals.totalFrames} frames`,
      component: <SceneBreakdownGallery visuals={pitchPackage.visuals} />
    },
    {
      id: 'characters',
      icon: '👥',
      title: 'Character study',
      description: 'Get to know the characters and how to prepare for the role',
      stats: `${pitchPackage.characters.mainCharacters.length} characters`,
      component: <CharacterWeb characters={pitchPackage.characters} linkId={linkId} visuals={pitchPackage.visuals} />
    },
    {
      id: 'depth',
      icon: '🧠',
      title: 'Worldbuilding',
      description: 'Learn more about the world the series is set in',
      stats: `${pitchPackage.depth.world.locations.length} locations`,
      component: <DepthTabs depth={pitchPackage.depth} />
    },
    {
      id: 'narrative-technicalities',
      icon: '📐',
      title: 'Narrative Technicalities',
      description: 'Technical aspects of the story used as reference by the AI in writing episodes',
      stats: 'AI Reference',
      component: <NarrativeTechnicalities pitchPackage={pitchPackage} linkId={linkId} />
    },
    {
      id: 'production',
      icon: '🎥',
      title: 'Production Assistant',
      description: 'Everything you need to start filming (AI as your 1st, 2nd, and 3rd AD)',
      stats: '6 categories',
      component: <ProductionDashboard production={pitchPackage.production} characters={pitchPackage.characters.mainCharacters} />
    },
    {
      id: 'marketing',
      icon: '📊',
      title: 'Promotional Guide',
      description: 'Everything you\'ll need to promote and make this series go viral',
      stats: 'Complete',
      component: <CampaignPreview marketing={pitchPackage.marketing} />
    },
    {
      id: 'behind-the-scenes',
      icon: '🎥',
      title: 'Greenlit Demo',
      description: 'Watch our demo of how we produce shows using Greenlit',
      stats: 'Watch Demo',
      component: <BehindTheScenes videoUrl="https://www.youtube.com/watch?v=97_oXWwxYvI&si=Hbm3UiFHWVR7lsm3&themeRefresh=1" />
    },
    {
      id: 'cta',
      icon: '🚀',
      title: 'Greenlit Pitch Deck',
      description: 'We\'re raising Pre-seed, click me for a surprise!',
      stats: 'Let\'s talk',
      component: <GreenlitCTA callToAction={pitchPackage.callToAction} ownerName={materials.ownerName} />
    }
  ]

  return (
    <>
      {/* CRT Aesthetic & Particle Effects Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        /* CRT Screen Container */
        .crt-screen {
          position: fixed;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          overflow: hidden;
        }
        
        /* CRT Scanlines */
        .crt-scanlines {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            transparent 50%,
            rgba(0, 0, 0, 0.03) 50%
          );
          background-size: 100% 4px;
          animation: scanline-move 0.1s linear infinite;
          pointer-events: none;
        }
        
        @keyframes scanline-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        
        /* CRT Screen Curvature */
        .crt-curvature {
          position: absolute;
          inset: 0;
          border-radius: 0;
          box-shadow: 
            inset 0 0 60px rgba(0, 0, 0, 0.5),
            inset 0 0 100px rgba(0, 0, 0, 0.3);
          pointer-events: none;
        }
        
        /* CRT Flicker Effect */
        .crt-flicker {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0);
          animation: crt-flicker 0.15s infinite;
          pointer-events: none;
        }
        
        @keyframes crt-flicker {
          0% { opacity: 1; }
          50% { opacity: 0.98; }
          100% { opacity: 1; }
        }
        
        /* CRT Glow Effect */
        .crt-glow {
          position: absolute;
          inset: -2px;
          background: 
            radial-gradient(ellipse at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%),
            radial-gradient(ellipse at top, rgba(16, 185, 129, 0.05) 0%, transparent 50%);
          filter: blur(1px);
          pointer-events: none;
          z-index: -1;
        }
        
        /* CRT Vignette */
        .crt-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 40%,
            rgba(0, 0, 0, 0.3) 100%
          );
          pointer-events: none;
        }
        
        /* CRT Screen Border/Frame */
        .crt-frame {
          position: fixed;
          inset: 0;
          z-index: 100;
          pointer-events: none;
          border: 8px solid #0a0a0a;
          box-shadow: 
            inset 0 0 20px rgba(0, 0, 0, 0.8),
            inset 0 0 40px rgba(0, 0, 0, 0.4),
            0 0 0 2px rgba(16, 185, 129, 0.1),
            0 0 20px rgba(16, 185, 129, 0.05);
        }
        
        /* CRT Color Shift (Phosphor Glow) */
        .crt-content-wrapper {
          filter: contrast(1.05) brightness(0.98);
          position: relative;
        }
        
        /* CRT Noise Texture */
        .crt-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.15;
          mix-blend-mode: overlay;
        }
        
        /* Enhanced CRT Glow for Cards */
        .crt-card-glow {
          box-shadow: 
            0 0 10px rgba(16, 185, 129, 0.1),
            0 0 20px rgba(16, 185, 129, 0.05),
            inset 0 0 20px rgba(16, 185, 129, 0.02);
        }
        
        /* CRT Text Glow */
        .crt-text-glow {
          text-shadow: 
            0 0 5px rgba(16, 185, 129, 0.3),
            0 0 10px rgba(16, 185, 129, 0.1);
        }
        
        /* Card Hover Animation */
        @keyframes card-pulse {
          0%, 100% {
            box-shadow: 
              0 4px 6px rgba(0, 0, 0, 0.3),
              0 0 20px rgba(16, 185, 129, 0.08);
          }
          50% {
            box-shadow: 
              0 8px 12px rgba(0, 0, 0, 0.4),
              0 0 30px rgba(16, 185, 129, 0.15),
              0 0 50px rgba(16, 185, 129, 0.08);
          }
        }
        
        /* Particle Effects */
        .investor-particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }
        .investor-particle {
          position: absolute;
          background: rgba(16, 185, 129, 0.3);
          border-radius: 50%;
          animation: float-particle-investor 6s linear infinite;
        }
        .investor-particle:nth-child(1) {
          width: 4px;
          height: 4px;
          left: 10%;
          animation-delay: 0s;
          animation-duration: 8s;
        }
        .investor-particle:nth-child(2) {
          width: 6px;
          height: 6px;
          left: 20%;
          animation-delay: -2s;
          animation-duration: 10s;
        }
        .investor-particle:nth-child(3) {
          width: 3px;
          height: 3px;
          left: 30%;
          animation-delay: -4s;
          animation-duration: 12s;
        }
        .investor-particle:nth-child(4) {
          width: 5px;
          height: 5px;
          left: 40%;
          animation-delay: -1s;
          animation-duration: 9s;
        }
        .investor-particle:nth-child(5) {
          width: 4px;
          height: 4px;
          left: 50%;
          animation-delay: -3s;
          animation-duration: 11s;
        }
        .investor-particle:nth-child(6) {
          width: 7px;
          height: 7px;
          left: 60%;
          animation-delay: -5s;
          animation-duration: 13s;
        }
        .investor-particle:nth-child(7) {
          width: 3px;
          height: 3px;
          left: 70%;
          animation-delay: -2.5s;
          animation-duration: 7s;
        }
        .investor-particle:nth-child(8) {
          width: 5px;
          height: 5px;
          left: 80%;
          animation-delay: -1.5s;
          animation-duration: 10s;
        }
        .investor-particle:nth-child(9) {
          width: 4px;
          height: 4px;
          left: 90%;
          animation-delay: -3.5s;
          animation-duration: 8s;
        }
        @keyframes float-particle-investor {
          from {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          to {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        
        /* Behind the Scenes Card Animations */
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 
              0 0 20px rgba(16, 185, 129, 0.3),
              0 0 40px rgba(16, 185, 129, 0.1),
              0 0 60px rgba(16, 185, 129, 0.05);
          }
          50% {
            box-shadow: 
              0 0 30px rgba(16, 185, 129, 0.5),
              0 0 60px rgba(16, 185, 129, 0.2),
              0 0 90px rgba(16, 185, 129, 0.1);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes scan-line {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(400%);
            opacity: 0;
          }
        }
        
        /* Behind the Scenes Card Special Animations */
        .behind-scenes-card-wrapper {
          position: relative;
        }
        
        /* Animated particles leading to the card */
        .behind-scenes-card-wrapper::before {
          content: '';
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 20px;
          pointer-events: none;
          z-index: 1;
          background: radial-gradient(ellipse at center, rgba(16, 185, 129, 0.4) 0%, transparent 70%);
          animation: particle-float-down 3s ease-in-out infinite;
        }
        
        @keyframes particle-float-down {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(10px) scale(0.8);
          }
        }
        
        /* Pulsing glow and border animation on the card itself */
        .behind-scenes-card-wrapper div.group {
          animation: behind-scenes-pulse 3s ease-in-out infinite, border-pulse 2s ease-in-out infinite;
          position: relative;
          border-color: rgba(16, 185, 129, 0.5) !important;
        }
        
        @keyframes behind-scenes-pulse {
          0%, 100% {
            box-shadow: 
              0 4px 6px rgba(0, 0, 0, 0.2),
              0 0 20px rgba(16, 185, 129, 0.15),
              0 0 40px rgba(16, 185, 129, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 0 30px rgba(16, 185, 129, 0.05);
          }
          50% {
            box-shadow: 
              0 4px 6px rgba(0, 0, 0, 0.2),
              0 0 30px rgba(16, 185, 129, 0.3),
              0 0 60px rgba(16, 185, 129, 0.2),
              0 0 90px rgba(16, 185, 129, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 0 30px rgba(16, 185, 129, 0.1);
          }
        }
        
        @keyframes border-pulse {
          0%, 100% {
            border-color: rgba(16, 185, 129, 0.5) !important;
          }
          50% {
            border-color: rgba(16, 185, 129, 0.9) !important;
          }
        }
        
        /* Animated border sweep */
        .behind-scenes-card-wrapper div.group::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 1rem;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(16, 185, 129, 0.5) 50%,
            transparent 70%
          );
          background-size: 200% 200%;
          opacity: 0;
          animation: border-sweep 4s linear infinite;
          pointer-events: none;
          z-index: -1;
        }
        
        @keyframes border-sweep {
          0% {
            background-position: 200% 0;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          40% {
            opacity: 1;
          }
          50% {
            background-position: -200% 0;
            opacity: 0;
          }
          100% {
            background-position: -200% 0;
            opacity: 0;
          }
        }
        
        /* Icon animation */
        .behind-scenes-card-wrapper .text-5xl {
          animation: icon-float 4s ease-in-out infinite;
        }
        
        @keyframes icon-float {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
            filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.3));
          }
          25% {
            transform: translateY(-5px) rotate(2deg) scale(1.05);
            filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.5));
          }
          50% {
            transform: translateY(-8px) rotate(0deg) scale(1.1);
            filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.6));
          }
          75% {
            transform: translateY(-5px) rotate(-2deg) scale(1.05);
            filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.5));
          }
        }
        
        /* Title glow pulse */
        .behind-scenes-card-wrapper h3 {
          animation: title-glow 2s ease-in-out infinite;
        }
        
        @keyframes title-glow {
          0%, 100% {
            text-shadow: 
              0 0 8px rgba(16, 185, 129, 0.4),
              0 0 16px rgba(16, 185, 129, 0.2),
              0 2px 8px rgba(0, 0, 0, 0.8),
              0 4px 12px rgba(0, 0, 0, 0.6);
          }
          50% {
            text-shadow: 
              0 0 12px rgba(16, 185, 129, 0.6),
              0 0 24px rgba(16, 185, 129, 0.4),
              0 0 36px rgba(16, 185, 129, 0.2),
              0 2px 8px rgba(0, 0, 0, 0.8),
              0 4px 12px rgba(0, 0, 0, 0.6);
          }
        }
        
        /* Scanning line effect */
        .behind-scenes-card-wrapper div.group::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(16, 185, 129, 0.8),
            transparent
          );
          border-radius: 1rem;
          animation: scan-sweep 3s linear infinite;
          pointer-events: none;
          z-index: 1;
        }
        
        @keyframes scan-sweep {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100% + 4px));
            opacity: 0;
          }
        }
        
        /* Enhanced corner glow */
        .behind-scenes-card-wrapper .absolute.top-0.right-0 {
          opacity: 0.6 !important;
          animation: corner-glow-pulse 2s ease-in-out infinite;
        }
        
        @keyframes corner-glow-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }
      `}} />
      
      <div className="min-h-screen bg-[#0A0A0A] text-white relative">
        {/* Hero Image Background with Dark Overlay */}
        {heroImageUrl && (
          <div className="fixed inset-0 z-0">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${heroImageUrl})`,
                filter: 'brightness(0.25)',
              }}
            />
            <div className="absolute inset-0 bg-[#0A0A0A]/45" />
          </div>
        )}
        
        {/* Floating Particles */}
        <div className="investor-particles">
          <div className="investor-particle"></div>
          <div className="investor-particle"></div>
          <div className="investor-particle"></div>
          <div className="investor-particle"></div>
          <div className="investor-particle"></div>
          <div className="investor-particle"></div>
          <div className="investor-particle"></div>
          <div className="investor-particle"></div>
          <div className="investor-particle"></div>
        </div>

        {/* CRT Screen Effects */}
        <div className="crt-screen">
          <div className="crt-scanlines"></div>
          <div className="crt-curvature"></div>
          <div className="crt-flicker"></div>
          <div className="crt-glow"></div>
          <div className="crt-vignette"></div>
          <div className="crt-noise"></div>
        </div>
        
        {/* CRT Frame Border */}
        <div className="crt-frame"></div>

      {/* Content */}
      <div className="relative z-10 crt-content-wrapper">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#10B981]/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#059669] crt-text-glow"
                style={{
                  textShadow: '0 0 10px rgba(16, 185, 129, 0.4), 0 0 20px rgba(16, 185, 129, 0.2)',
                  filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.3))'
                }}
              >
                {pitchPackage.hook.seriesTitle}
              </h1>
              <p className="text-sm text-white/70 mt-1">Pitch Materials Package</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShareLink}
                className="px-4 py-2 bg-[#121212] border border-[#10B981]/30 text-[#10B981] font-semibold rounded-lg hover:bg-[#10B981]/10 hover:border-[#10B981]/50 transition-all flex items-center gap-2"
              >
                {linkCopied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Share Link</span>
                  </>
                )}
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#10B981]/20 transition-all">
                Download Full Package
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Dashboard Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6 text-white crt-text-glow"
            style={{
              textShadow: '0 0 15px rgba(16, 185, 129, 0.5), 0 0 30px rgba(16, 185, 129, 0.3), 0 0 45px rgba(16, 185, 129, 0.1)',
              filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.4))'
            }}
          >
            {pitchPackage.hook.seriesTitle}
          </h2>
          
          {/* Overview Info */}
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Synopsis */}
            {pitchPackage.hook.synopsis && (
              <div>
                <p className="text-base md:text-lg text-white/80 leading-relaxed">
                  {pitchPackage.hook.synopsis}
                </p>
              </div>
            )}
            
            {/* Metadata */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-[#10B981]/20">
              {pitchPackage.hook.genre && (
                <div>
                  <p className="text-xs font-semibold mb-1 text-white/50 uppercase tracking-wider">Genre</p>
                  <p className="text-sm font-medium text-white">{pitchPackage.hook.genre}</p>
                </div>
              )}
              {pitchPackage.hook.theme && (
                <div>
                  <p className="text-xs font-semibold mb-1 text-white/50 uppercase tracking-wider">Theme</p>
                  <p className="text-sm font-medium text-white">{pitchPackage.hook.theme}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div 
              key={section.id}
              className={section.id === 'behind-the-scenes' ? 'behind-scenes-card-wrapper' : ''}
            >
              <InvestorCard
                icon={section.icon}
                title={section.title}
                description={section.description}
                stats={section.stats}
                onClick={() => setActiveSection(section.id)}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Section Modals */}
      {sections.map((section) => (
        <InvestorLightbox
          key={section.id}
          isOpen={activeSection === section.id}
          onClose={() => setActiveSection(null)}
          title={section.title}
          maxWidth="full"
        >
          {section.component}
        </InvestorLightbox>
      ))}

      {/* Footer */}
      <footer className="border-t border-[#10B981]/20 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          {/* Disclaimer */}
          <div className="text-center pb-4 border-b border-[#10B981]/10">
            <p className="text-white/60 text-xs leading-relaxed max-w-3xl mx-auto">
              <strong className="text-white/80">Disclaimer:</strong> The events in this series are 100% fictional. Any references to real people are purely for narrative and satirical purposes.
            </p>
          </div>
          
          {/* Footer Info */}
          <div className="text-center">
            <p className="text-white/50 text-sm">
              {materials.ownerName && `Shared by ${materials.ownerName} • `}
              Powered by Greenlit
            </p>
          </div>
        </div>
      </footer>
    </div>
      </div>
      
      {/* Chat Widget for Investor Materials */}
      <ChatWidget />
    </>
  )
}
