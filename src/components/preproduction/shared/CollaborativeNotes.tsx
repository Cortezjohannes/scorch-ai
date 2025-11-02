'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Comment } from '@/types/preproduction'

interface CollaborativeNotesProps {
  comments: Comment[]
  onAddComment: (content: string, mentions?: string[]) => Promise<void>
  onResolve?: (commentId: string) => Promise<void>
  currentUserId: string
  currentUserName: string
  showResolved?: boolean
}

export function CollaborativeNotes({
  comments = [],
  onAddComment,
  onResolve,
  currentUserId,
  currentUserName,
  showResolved = false
}: CollaborativeNotesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const visibleComments = showResolved 
    ? comments 
    : comments.filter(c => !c.resolved)

  const unresolvedCount = comments.filter(c => !c.resolved).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      // Extract mentions from comment (e.g., @username)
      const mentions = newComment.match(/@(\w+)/g)?.map(m => m.slice(1)) || []
      
      await onAddComment(newComment.trim(), mentions)
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResolve = async (commentId: string) => {
    if (onResolve) {
      try {
        await onResolve(commentId)
      } catch (error) {
        console.error('Error resolving comment:', error)
      }
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = Date.now()
    const diff = now - timestamp
    
    // Less than 1 minute
    if (diff < 60000) return 'just now'
    // Less than 1 hour
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    // Less than 24 hours
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    // Less than 7 days
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors"
      >
        <span>💬</span>
        <span className="text-sm font-medium">
          {unresolvedCount > 0 ? `${unresolvedCount} Notes` : 'Add Note'}
        </span>
        {unresolvedCount > 0 && (
          <span className="px-2 py-0.5 bg-[#00FF99] text-black text-xs font-bold rounded-full">
            {unresolvedCount}
          </span>
        )}
      </button>

      {/* Comments Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-50 mt-2 right-0 w-96 max-h-96 bg-[#1a1a1a] border border-[#36393f] rounded-lg shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#36393f] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#e7e7e7] font-medium">Notes & Comments</span>
                {unresolvedCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#00FF99] text-black text-xs font-bold rounded-full">
                    {unresolvedCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#e7e7e7]/50 hover:text-[#e7e7e7] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {visibleComments.length === 0 ? (
                <div className="text-center text-[#e7e7e7]/50 py-8">
                  No comments yet. Be the first to add one!
                </div>
              ) : (
                visibleComments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg ${
                      comment.resolved 
                        ? 'bg-[#1a1a1a] border border-[#36393f] opacity-60' 
                        : 'bg-[#2a2a2a]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#00FF99]">
                          {comment.userName}
                        </div>
                        <div className="text-xs text-[#e7e7e7]/50">
                          {formatTimestamp(comment.timestamp)}
                        </div>
                      </div>
                      {!comment.resolved && onResolve && (
                        <button
                          onClick={() => handleResolve(comment.id)}
                          className="text-xs text-[#e7e7e7]/50 hover:text-[#00FF99] transition-colors"
                          title="Mark as resolved"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-[#e7e7e7] whitespace-pre-wrap">
                      {comment.content}
                    </div>
                    {comment.resolved && (
                      <div className="mt-2 text-xs text-[#e7e7e7]/40">
                        ✓ Resolved
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-[#36393f]">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a note or comment... (use @name to mention)"
                rows={2}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#36393f] rounded text-[#e7e7e7] text-sm placeholder-[#e7e7e7]/40 focus:outline-none focus:border-[#00FF99] resize-none"
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-[#e7e7e7]/40">
                  Tip: Use @name to mention someone
                </div>
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="px-4 py-1.5 bg-[#00FF99] text-black text-sm font-medium rounded hover:bg-[#00CC7A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


