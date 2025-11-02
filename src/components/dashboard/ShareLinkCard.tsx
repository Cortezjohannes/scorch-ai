'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShareLink } from '@/services/share-link-service'

interface ShareLinkCardProps {
  link: ShareLink
  storyBibleTitle?: string
  onRevoke: (shareId: string) => void
}

export default function ShareLinkCard({ link, storyBibleTitle, onRevoke }: ShareLinkCardProps) {
  const [copied, setCopied] = useState(false)
  
  const shareUrl = `${window.location.origin}/story-bible?shared=${link.shareId}`
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy link')
    }
  }

  const handleRevoke = () => {
    if (confirm('Are you sure you want to revoke this share link? Anyone with the link will lose access.')) {
      onRevoke(link.shareId)
    }
  }

  const formatDate = (dateString: string, short = false) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (short) {
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return '1d ago'
      if (diffDays < 7) return `${diffDays}d ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#121212] rounded-lg p-4 border border-[#00FF99]/20 hover:border-[#00FF99]/40 transition-all"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xl flex-shrink-0">📖</span>
            <h4 className="font-bold text-white text-sm line-clamp-1 flex-1 min-w-0">
              {storyBibleTitle || link.storyBibleId}
            </h4>
            {/* Status Badge - Mobile inline */}
            <div className={`sm:hidden px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
              link.isActive
                ? 'bg-[#00FF99]/20 text-[#00FF99] border border-[#00FF99]/40'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/40'
            }`}>
              {link.isActive ? '✓' : '✕'}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-white/60 flex-wrap">
            <div className="flex items-center gap-1">
              <span>👁</span>
              <span className="hidden sm:inline">{link.viewCount} {link.viewCount === 1 ? 'view' : 'views'}</span>
              <span className="sm:hidden">{link.viewCount}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Created {formatDate(link.createdAt)}</span>
            <span className="sm:hidden">{formatDate(link.createdAt, true)}</span>
          </div>
        </div>

        {/* Status Badge - Desktop */}
        <div className={`hidden sm:block px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
          link.isActive
            ? 'bg-[#00FF99]/20 text-[#00FF99] border border-[#00FF99]/40'
            : 'bg-gray-500/20 text-gray-400 border border-gray-500/40'
        }`}>
          {link.isActive ? '✓ Active' : '✕ Revoked'}
        </div>
      </div>

      {/* Actions */}
      {link.isActive && (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 px-3 py-2.5 min-h-[44px] bg-[#00FF99]/10 text-[#00FF99] rounded-lg hover:bg-[#00FF99]/20 transition-all text-center text-xs font-medium border border-[#00FF99]/20 hover:border-[#00FF99]/40 flex items-center justify-center gap-1"
          >
            <span>{copied ? '✓' : '📋'}</span>
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
          
          <button
            onClick={handleRevoke}
            className="px-3 py-2.5 min-h-[44px] bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-xs font-medium border border-red-500/20 hover:border-red-500/40 whitespace-nowrap"
          >
            Revoke
          </button>
        </div>
      )}

      {/* Revoked message */}
      {!link.isActive && (
        <div className="text-xs text-gray-500 text-center py-2">
          This link has been revoked and is no longer accessible
        </div>
      )}
    </motion.div>
  )
}

