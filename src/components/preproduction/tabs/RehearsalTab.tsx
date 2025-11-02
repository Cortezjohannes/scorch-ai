'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PreProductionData, RehearsalSession } from '@/types/preproduction'
import { EditableField } from '../shared/EditableField'
import { CollaborativeNotes } from '../shared/CollaborativeNotes'

interface RehearsalTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
}

export function RehearsalTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName
}: RehearsalTabProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list')
  
  const rehearsalData = preProductionData.rehearsal || {
    sessions: [],
    lastUpdated: Date.now()
  }

  const handleSessionUpdate = async (sessionId: string, updates: Partial<RehearsalSession>) => {
    const updatedSessions = rehearsalData.sessions.map(session =>
      session.id === sessionId ? { ...session, ...updates } : session
    )
    
    await onUpdate('rehearsal', {
      ...rehearsalData,
      sessions: updatedSessions,
      lastUpdated: Date.now()
    })
  }

  const handleAddSession = async () => {
    const newSession: RehearsalSession = {
      id: `rehearsal_${Date.now()}`,
      date: '',
      time: '',
      duration: '2 hours',
      location: '',
      scenes: [],
      attendees: [],
      focus: '',
      notes: '',
      status: 'scheduled',
      comments: []
    }
    
    await onUpdate('rehearsal', {
      ...rehearsalData,
      sessions: [...rehearsalData.sessions, newSession],
      lastUpdated: Date.now()
    })
  }

  const handleAddComment = async (sessionId: string, content: string) => {
    const session = rehearsalData.sessions.find(s => s.id === sessionId)
    if (!session) return

    const newComment = {
      id: `comment_${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content,
      timestamp: Date.now()
    }

    const updatedSessions = rehearsalData.sessions.map(s =>
      s.id === sessionId
        ? { ...s, comments: [...(s.comments || []), newComment] }
        : s
    )

    await onUpdate('rehearsal', {
      ...rehearsalData,
      sessions: updatedSessions,
      lastUpdated: Date.now()
    })
  }

  // Stats
  const totalSessions = rehearsalData.sessions.length
  const completedCount = rehearsalData.sessions.filter(s => s.status === 'completed').length
  const upcomingCount = rehearsalData.sessions.filter(s => s.status === 'scheduled').length

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Sessions</div>
          <div className="text-2xl font-bold text-[#00FF99]">{totalSessions}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Upcoming</div>
          <div className="text-2xl font-bold text-yellow-400">{upcomingCount}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-400">{completedCount}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list' ? 'bg-[#00FF99] text-black' : 'bg-[#2a2a2a] text-[#e7e7e7]/70'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'calendar' ? 'bg-[#00FF99] text-black' : 'bg-[#2a2a2a] text-[#e7e7e7]/70'
            }`}
          >
            Calendar View
          </button>
        </div>

        <button
          onClick={handleAddSession}
          className="px-4 py-2 bg-[#00FF99] text-black rounded-lg font-medium hover:bg-[#00CC7A] transition-colors"
        >
          + Add Session
        </button>
      </div>

      {/* Empty State */}
      {rehearsalData.sessions.length === 0 ? (
        <div className="text-center py-16 bg-[#2a2a2a] rounded-lg border border-[#36393f]">
          <div className="text-6xl mb-4">🎪</div>
          <h3 className="text-xl font-bold text-[#e7e7e7] mb-2">No Rehearsal Sessions Scheduled</h3>
          <p className="text-[#e7e7e7]/70 mb-6">
            Plan rehearsal sessions to prepare your cast
          </p>
          <button
            onClick={handleAddSession}
            className="px-6 py-3 bg-[#00FF99] text-black rounded-lg font-medium hover:bg-[#00CC7A] transition-colors"
          >
            + Schedule First Session
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {rehearsalData.sessions.map((session) => (
                <RehearsalSessionCard
                  key={session.id}
                  session={session}
                  onUpdate={(updates) => handleSessionUpdate(session.id, updates)}
                  onAddComment={(content) => handleAddComment(session.id, content)}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#2a2a2a] rounded-lg border border-[#36393f] p-6"
            >
              <p className="text-center text-[#e7e7e7]/70">Calendar view coming soon...</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

// Rehearsal Session Card
function RehearsalSessionCard({
  session,
  onUpdate,
  onAddComment,
  currentUserId,
  currentUserName
}: {
  session: RehearsalSession
  onUpdate: (updates: Partial<RehearsalSession>) => void
  onAddComment: (content: string) => void
  currentUserId: string
  currentUserName: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const statusColors = {
    scheduled: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    completed: 'bg-green-500/20 text-green-400 border-green-500/40',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/40'
  }

  return (
    <div className="bg-[#2a2a2a] rounded-lg border border-[#36393f] overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        {/* Icon */}
        <div className="w-12 h-12 bg-[#1a1a1a] rounded flex items-center justify-center text-2xl flex-shrink-0">
          🎪
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <EditableField
              value={session.date}
              onSave={(value) => onUpdate({ date: value })}
              placeholder="Date..."
              className="font-bold text-[#00FF99]"
            />
            <EditableField
              value={session.time}
              onSave={(value) => onUpdate({ time: value })}
              placeholder="Time..."
              className="text-[#e7e7e7]"
            />
          </div>
          
          <div className="flex items-center gap-3 text-sm text-[#e7e7e7]/70">
            <EditableField
              value={session.location}
              onSave={(value) => onUpdate({ location: value })}
              placeholder="Location..."
              className="text-sm text-[#e7e7e7]/70"
            />
            <span>•</span>
            <EditableField
              value={session.duration}
              onSave={(value) => onUpdate({ duration: value })}
              placeholder="Duration..."
              className="text-sm text-[#e7e7e7]/70"
            />
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-3">
          <select
            value={session.status}
            onChange={(e) => onUpdate({ status: e.target.value as any })}
            className={`px-3 py-1 rounded text-sm font-medium border ${statusColors[session.status]}`}
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 bg-[#1a1a1a] rounded text-sm text-[#e7e7e7] hover:bg-[#36393f] transition-colors"
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#36393f] p-4 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Focus */}
              <div>
                <div className="text-xs text-[#e7e7e7]/50 mb-1">Focus</div>
                <EditableField
                  value={session.focus}
                  onSave={(value) => onUpdate({ focus: value })}
                  placeholder="What to rehearse..."
                  className="text-sm text-[#e7e7e7]"
                />
              </div>

              {/* Attendees */}
              <div>
                <div className="text-xs text-[#e7e7e7]/50 mb-1">Attendees</div>
                <div className="text-sm text-[#e7e7e7]">
                  {session.attendees && session.attendees.length > 0 
                    ? session.attendees.join(', ')
                    : 'None specified'}
                </div>
              </div>
            </div>

            {/* Scenes */}
            {session.scenes && session.scenes.length > 0 && (
              <div>
                <div className="text-xs text-[#e7e7e7]/50 mb-1">Scenes to Rehearse</div>
                <div className="flex flex-wrap gap-1">
                  {session.scenes.map((scene, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-[#1a1a1a] rounded text-xs text-[#e7e7e7]/70"
                    >
                      Scene {scene}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <div className="text-xs text-[#e7e7e7]/50 mb-1">Notes</div>
              <EditableField
                value={session.notes}
                onSave={(value) => onUpdate({ notes: value })}
                placeholder="Add session notes..."
                multiline
                className="text-sm text-[#e7e7e7]"
              />
            </div>

            {/* Comments */}
            <CollaborativeNotes
              comments={session.comments || []}
              onAddComment={onAddComment}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
