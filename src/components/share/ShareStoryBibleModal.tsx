'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createShareLink, revokeShareLink, getUserShareLinks, ShareLink } from '@/services/share-link-service'

interface ShareStoryBibleModalProps {
  isOpen: boolean
  onClose: () => void
  storyBible: any
  ownerId?: string
  ownerName?: string
}

export default function ShareStoryBibleModal({
  isOpen,
  onClose,
  storyBible,
  ownerId,
  ownerName,
}: ShareStoryBibleModalProps) {
  const [shareUrl, setShareUrl] = useState<string>('')
  const [shareId, setShareId] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string>('')

  const handleCreateShare = async () => {
    setIsGenerating(true)
    setError('')

    try {
      const { shareId: id, shareUrl: url } = await createShareLink(
        storyBible,
        ownerId,
        ownerName
      )
      setShareId(id)
      setShareUrl(url)
    } catch (err: any) {
      console.error('Error creating share link:', err)
      setError(err.message || 'Failed to create share link')
    } finally {
      setIsGenerating(false)
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

  const handleRevoke = async () => {
    if (!ownerId || !shareId) return
    
    if (!confirm('Are you sure you want to revoke this link? It will no longer be accessible.')) {
      return
    }

    try {
      await revokeShareLink(shareId, ownerId)
      setShareUrl('')
      setShareId('')
      alert('Share link revoked successfully')
      onClose()
    } catch (err: any) {
      console.error('Error revoking share link:', err)
      alert(err.message || 'Failed to revoke share link')
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
            className="relative w-full max-w-2xl bg-[#1A1A1A] border border-[#10B981]/30 rounded-2xl shadow-2xl overflow-hidden my-8"
          >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/10 to-transparent pointer-events-none" />
          
          <div className="relative p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#059669]">
                Share Story Bible
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Story Bible Info */}
              <div className="bg-[#121212] rounded-xl p-4 border border-[#10B981]/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                    <span className="text-2xl">📖</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold">
                      {storyBible.seriesTitle || 'Untitled Story Bible'}
                    </h3>
                    <p className="text-white/50 text-sm">
                      {storyBible.characters?.length || 0} Characters • {storyBible.narrativeArcs?.length || 0} Arcs
                    </p>
                  </div>
                </div>
              </div>

              {/* Generate Link Section */}
              {!shareUrl ? (
                <div className="text-center py-8">
                  <p className="text-white/70 mb-6">
                    Create a shareable link that anyone can access
                  </p>
                  <button
                    onClick={handleCreateShare}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#10B981]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Generating Link...
                      </span>
                    ) : (
                      '🔗 Generate Share Link'
                    )}
                  </button>
                </div>
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

                  {/* Share Info */}
                  <div className="bg-[#121212] rounded-xl p-4 border border-[#10B981]/10">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">ℹ️</span>
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">Link Details</h4>
                        <ul className="text-white/70 text-sm space-y-1">
                          <li>✓ Anyone with this link can view your story bible</li>
                          <li>✓ Link will remain active until revoked</li>
                          {ownerId && (
                            <li>✓ View count and analytics available in your dashboard</li>
                          )}
                          {!ownerId && (
                            <li>⚠️ Guest shares cannot be revoked or tracked</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {ownerId && (
                      <button
                        onClick={handleRevoke}
                        className="flex-1 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors font-medium"
                      >
                        Revoke Link
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-3 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] rounded-lg hover:bg-[#10B981]/20 transition-colors font-medium"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 text-sm">
                    ❌ {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
