'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createInvestorLink, getUserInvestorLinks, revokeInvestorLink, updateInvestorLink, InvestorLink } from '@/services/investor-link-service'
import { generateInvestorPackage } from '@/services/investor-materials-service'
import type { InvestorMaterialsPackage } from '@/types/investor-materials'

interface ShareInvestorMaterialsModalProps {
  isOpen: boolean
  onClose: () => void
  storyBibleId: string
  arcIndex: number
  ownerId?: string
  ownerName?: string
}

export default function ShareInvestorMaterialsModal({
  isOpen,
  onClose,
  storyBibleId,
  arcIndex,
  ownerId,
  ownerName,
}: ShareInvestorMaterialsModalProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'manage'>('generate')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreatingLink, setIsCreatingLink] = useState(false)
  const [investorPackage, setInvestorPackage] = useState<InvestorMaterialsPackage | null>(null)
  const [shareUrl, setShareUrl] = useState<string>('')
  const [shareId, setShareId] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string>('')
  const [userLinks, setUserLinks] = useState<InvestorLink[]>([])
  const [loadingLinks, setLoadingLinks] = useState(false)

  // Load user links when manage tab is opened
  useEffect(() => {
    if (activeTab === 'manage' && ownerId && userLinks.length === 0) {
      loadUserLinks()
    }
  }, [activeTab, ownerId])

  const loadUserLinks = async () => {
    if (!ownerId) return
    setLoadingLinks(true)
    try {
      const links = await getUserInvestorLinks(ownerId, storyBibleId)
      setUserLinks(links)
    } catch (err: any) {
      console.error('Error loading user links:', err)
    } finally {
      setLoadingLinks(false)
    }
  }

  const handleGeneratePackage = async () => {
    if (!ownerId) {
      setError('User ID is required. Please sign in.')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      // Call the service directly from client-side (has proper Firebase auth context)
      const result = await generateInvestorPackage(
        ownerId,
        storyBibleId,
        arcIndex
      )

      if (result.errors && result.errors.length > 0) {
        setError(`Missing required materials: ${result.errors.join(', ')}`)
      }

      if (result.package) {
        setInvestorPackage(result.package)
      } else {
        throw new Error('No package generated')
      }
    } catch (err: any) {
      console.error('Error generating package:', err)
      setError(err.message || 'Failed to generate pitch package')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateLink = async () => {
    if (!investorPackage) return

    setIsCreatingLink(true)
    setError('')

    try {
      const { linkId, shareUrl: url } = await createInvestorLink(
        investorPackage,
        ownerId,
        ownerName
      )
      setShareId(linkId)
      setShareUrl(url)
      // Reload user links
      if (ownerId) {
        await loadUserLinks()
      }
    } catch (err: any) {
      console.error('Error creating share link:', err)
      setError(err.message || 'Failed to create share link')
    } finally {
      setIsCreatingLink(false)
    }
  }

  const handleRegeneratePackage = async () => {
    if (!ownerId) {
      setError('User ID is required. Please sign in.')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      // Regenerate the package with latest data
      const result = await generateInvestorPackage(
        ownerId,
        storyBibleId,
        arcIndex
      )

      if (result.errors && result.errors.length > 0) {
        setError(`Missing required materials: ${result.errors.join(', ')}`)
      }

      if (result.package) {
        setInvestorPackage(result.package)
        // If there's an existing link, offer to update it
        if (shareId && ownerId) {
          const shouldUpdate = confirm('Package regenerated! Would you like to update the existing link with the new data?')
          if (shouldUpdate) {
            await handleUpdateLink(shareId, result.package)
          }
        }
      } else {
        throw new Error('No package generated')
      }
    } catch (err: any) {
      console.error('Error regenerating package:', err)
      setError(err.message || 'Failed to regenerate pitch package')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUpdateLink = async (linkId: string, packageToUpdate?: InvestorMaterialsPackage) => {
    if (!ownerId) return

    const packageToUse = packageToUpdate || investorPackage
    if (!packageToUse) {
      setError('No package to update. Please generate a package first.')
      return
    }

    setIsCreatingLink(true)
    setError('')

    try {
      await updateInvestorLink(linkId, packageToUse, ownerId)
      setError('')
      alert('Link updated successfully! The shared link now reflects the latest data.')
      // Reload user links
      await loadUserLinks()
    } catch (err: any) {
      console.error('Error updating link:', err)
      setError(err.message || 'Failed to update link')
    } finally {
      setIsCreatingLink(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleRevoke = async (linkId: string) => {
    if (!ownerId) return

    if (!confirm('Are you sure you want to revoke this link? It will no longer be accessible.')) {
      return
    }

    try {
      await revokeInvestorLink(linkId, ownerId)
      await loadUserLinks()
      if (linkId === shareId) {
        setShareUrl('')
        setShareId('')
      }
    } catch (err: any) {
      console.error('Error revoking link:', err)
      alert(err.message || 'Failed to revoke link')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-[#1A1A1A] border border-[#10B981]/30 rounded-2xl shadow-2xl overflow-hidden my-8"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/10 to-transparent pointer-events-none" />

            <div className="relative p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#059669]">
                  Pitch Materials
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-white/10">
                <button
                  onClick={() => setActiveTab('generate')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'generate'
                      ? 'text-[#10B981] border-b-2 border-[#10B981]'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  Generate & Share
                </button>
                {ownerId && (
                  <button
                    onClick={() => setActiveTab('manage')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'manage'
                        ? 'text-[#10B981] border-b-2 border-[#10B981]'
                        : 'text-white/50 hover:text-white/70'
                    }`}
                  >
                    Manage Links
                  </button>
                )}
              </div>

              {/* Tab Content */}
              {activeTab === 'generate' ? (
                <div className="space-y-6">
                  {/* Story Bible Info */}
                  <div className="bg-[#121212] rounded-xl p-4 border border-[#10B981]/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">Arc {arcIndex + 1}</h3>
                        <p className="text-white/50 text-sm">
                          Story Bible: {storyBibleId.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Generate Package */}
                  {!investorPackage ? (
                    <div className="text-center py-8">
                      <p className="text-white/70 mb-6">
                        Generate a comprehensive pitch package from your Story Bible, Episodes, and Pre-Production materials
                      </p>
                      <button
                        onClick={handleGeneratePackage}
                        disabled={isGenerating}
                        className="px-6 py-3 bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#10B981]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span>
                            Generating Package...
                          </span>
                        ) : (
                          '🎯 Generate Pitch Package'
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Package Preview with Regenerate */}
                      <div className="bg-[#121212] rounded-xl p-4 border border-[#10B981]/10">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-white font-medium mb-1">Package Generated</h4>
                            <p className="text-white/50 text-xs">
                              Generated: {new Date(investorPackage.generatedAt).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={handleRegeneratePackage}
                            disabled={isGenerating}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            title="Regenerate package with latest data"
                          >
                            {isGenerating ? (
                              <>
                                <span className="animate-spin">⏳</span>
                                <span>Regenerating...</span>
                              </>
                            ) : (
                              <>
                                <span>🔄</span>
                                <span>Regenerate</span>
                              </>
                            )}
                          </button>
                        </div>
                        <ul className="text-white/70 text-sm space-y-1">
                          <li>✓ {investorPackage.hook.seriesTitle}</li>
                          <li>✓ {investorPackage.story.episodes.length} Episodes</li>
                          <li>✓ {investorPackage.visuals.totalFrames} Storyboard Frames</li>
                          <li>✓ {investorPackage.characters.mainCharacters.length} Characters</li>
                          <li>✓ Budget & Production Details</li>
                          <li>✓ Marketing Strategy</li>
                        </ul>
                      </div>

                      {/* Create Link */}
                      {!shareUrl ? (
                        <button
                          onClick={handleCreateLink}
                          disabled={isCreatingLink}
                          className="w-full px-6 py-3 bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#10B981]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCreatingLink ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="animate-spin">⏳</span>
                              Creating Link...
                            </span>
                          ) : (
                            '🔗 Create Share Link'
                          )}
                        </button>
                      ) : (
                        <div className="space-y-4">
                          {/* Share URL */}
                          <div>
                            <label className="text-white/70 text-sm mb-2 block">
                              Share URL
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className="flex-1 px-4 py-3 bg-[#121212] border border-[#10B981]/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#10B981]/50"
                              />
                              <button
                                onClick={handleCopyLink}
                                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                  copied
                                    ? 'bg-[#10B981] text-black'
                                    : 'bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/20'
                                }`}
                              >
                                {copied ? '✓ Copied!' : '📋 Copy'}
                              </button>
                            </div>
                          </div>

                          {/* Link Info */}
                          <div className="bg-[#121212] rounded-xl p-4 border border-[#10B981]/10">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">ℹ️</span>
                              <div className="flex-1">
                                <h4 className="text-white font-medium mb-1">Link Details</h4>
                                <ul className="text-white/70 text-sm space-y-1">
                                  <li>✓ Anyone with this link can view the pitch materials</li>
                                  <li>✓ Link will remain active until revoked</li>
                                  {ownerId && (
                                    <li>✓ View count and analytics available in Manage Links</li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {loadingLinks ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981] mx-auto mb-4"></div>
                      <p className="text-white/70">Loading links...</p>
                    </div>
                  ) : userLinks.length === 0 ? (
                    <div className="text-center py-8 text-white/50">
                      No investor links created yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userLinks.map((link) => (
                        <div
                          key={link.id}
                          className="bg-[#121212] rounded-xl p-4 border border-[#10B981]/10"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  link.isActive
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {link.isActive ? 'Active' : 'Revoked'}
                                </span>
                                <span className="text-white/50 text-xs">
                                  Arc {link.arcIndex + 1}
                                </span>
                                {link.storyBibleId === storyBibleId && link.arcIndex === arcIndex && link.isActive && (
                                  <button
                                    onClick={async () => {
                                      // Regenerate and update this link
                                      if (!ownerId) return
                                      setIsGenerating(true)
                                      try {
                                        const result = await generateInvestorPackage(
                                          ownerId,
                                          storyBibleId,
                                          arcIndex
                                        )
                                        if (result.package) {
                                          await handleUpdateLink(link.linkId, result.package)
                                          await loadUserLinks()
                                          alert('Link updated successfully with latest data!')
                                        }
                                      } catch (err: any) {
                                        alert(err.message || 'Failed to regenerate')
                                      } finally {
                                        setIsGenerating(false)
                                      }
                                    }}
                                    disabled={isGenerating}
                                    className="px-2 py-1 bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/30 rounded text-xs text-[#10B981] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Regenerate and update this link with latest data"
                                  >
                                    {isGenerating ? '⏳ Updating...' : '🔄 Update'}
                                  </button>
                                )}
                              </div>
                              <p className="text-white/70 text-sm font-mono mb-2">
                                {typeof window !== 'undefined' ? `${window.location.origin}/investor/${link.linkId}` : link.linkId}
                              </p>
                              <div className="flex items-center gap-4 text-white/50 text-xs">
                                <span>Views: {link.viewCount}</span>
                                <span>Created: {new Date(link.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const url = typeof window !== 'undefined' ? `${window.location.origin}/investor/${link.linkId}` : ''
                                  navigator.clipboard.writeText(url)
                                }}
                                className="px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] rounded text-sm hover:bg-[#10B981]/20 transition-colors"
                              >
                                Copy
                              </button>
                              {link.isActive && (
                                <button
                                  onClick={() => handleRevoke(link.linkId)}
                                  className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-sm hover:bg-red-500/20 transition-colors"
                                >
                                  Revoke
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 text-sm">❌ {error}</p>
                </div>
              )}

              {/* Actions */}
              {shareUrl && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] rounded-lg hover:bg-[#10B981]/20 transition-colors font-medium"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

