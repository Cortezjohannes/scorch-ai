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
import ProductionDashboard from '@/components/investor/ProductionDashboard'
import CampaignPreview from '@/components/investor/CampaignPreview'
import GreenlitCTA from '@/components/investor/GreenlitCTA'

export default function InvestorMaterialsPage() {
  const params = useParams()
  const linkId = params?.linkId as string
  const [materials, setMaterials] = useState<SharedInvestorMaterials | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

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
      title: 'The Story',
      description: '8-episode arc breakdown',
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
      title: 'Pilot Script',
      description: 'Full Episode 1 script with navigation',
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
      title: 'Visual Proof',
      description: 'Storyboard frames organized by scene',
      stats: `${pitchPackage.visuals.totalFrames} frames`,
      component: <SceneBreakdownGallery visuals={pitchPackage.visuals} />
    },
    {
      id: 'characters',
      icon: '👥',
      title: 'Characters',
      description: 'Interactive character relationship web',
      stats: `${pitchPackage.characters.mainCharacters.length} characters`,
      component: <CharacterWeb characters={pitchPackage.characters} />
    },
    {
      id: 'depth',
      icon: '🧠',
      title: 'The Depth',
      description: 'World Building',
      stats: `${pitchPackage.depth.world.locations.length} locations`,
      component: <DepthTabs depth={pitchPackage.depth} />
    },
    {
      id: 'production',
      icon: '🎥',
      title: 'Production',
      description: 'Budget, locations, props, and casting',
      stats: '6 categories',
      component: <ProductionDashboard production={pitchPackage.production} characters={pitchPackage.characters.mainCharacters} />
    },
    {
      id: 'marketing',
      icon: '📊',
      title: 'Marketing',
      description: 'Strategy and campaign preview',
      stats: 'Complete',
      component: <CampaignPreview marketing={pitchPackage.marketing} />
    },
    {
      id: 'cta',
      icon: '🚀',
      title: 'Get Involved',
      description: 'Contact and next steps',
      stats: 'Let\'s talk',
      component: <GreenlitCTA callToAction={pitchPackage.callToAction} ownerName={materials.ownerName} />
    }
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#10B981]/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#059669]">
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
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
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
            <InvestorCard
              key={section.id}
              icon={section.icon}
              title={section.title}
              description={section.description}
              stats={section.stats}
              onClick={() => setActiveSection(section.id)}
            />
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
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/50 text-sm">
            {materials.ownerName && `Shared by ${materials.ownerName} • `}
            Powered by Greenlit
          </p>
        </div>
      </footer>
    </div>
  )
}
