'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PreProductionData, ShootingScheduleData, ShootingDay } from '@/types/preproduction'
import { StatusBadge } from '../shared/StatusBadge'
import { CollaborativeNotes } from '../shared/CollaborativeNotes'
import { EditableField } from '../shared/EditableField'

interface ShootingScheduleTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
}

export function ShootingScheduleTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName
}: ShootingScheduleTabProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [selectedWeek, setSelectedWeek] = useState(0)
  const scheduleData = preProductionData.shootingSchedule

  // If no data, show initialize prompt
  if (!scheduleData) {
    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <span className="text-6xl">📅</span>
        </div>
        <h2 className="text-2xl font-bold text-[#e7e7e7] mb-4">
          Shooting Schedule Not Created
        </h2>
        <p className="text-[#e7e7e7]/70 mb-6 max-w-md mx-auto">
          Create a shooting schedule to plan your 3-week production timeline and organize scenes efficiently.
        </p>
        <button className="px-6 py-3 bg-[#00FF99] text-black font-medium rounded-lg hover:bg-[#00CC7A] transition-colors">
          Create Schedule
        </button>
      </div>
    )
  }

  const handleDayUpdate = async (dayIndex: number, field: string, value: any) => {
    const updatedDays = [...scheduleData.days]
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      [field]: value
    }

    await onUpdate('shootingSchedule', {
      ...scheduleData,
      days: updatedDays,
      lastUpdated: Date.now(),
      updatedBy: currentUserId
    })
  }

  const handleAddComment = async (dayIndex: number, commentContent: string) => {
    const day = scheduleData.days[dayIndex]
    const newComment = {
      id: `comment-${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content: commentContent,
      timestamp: Date.now()
    }

    const updatedDays = [...scheduleData.days]
    updatedDays[dayIndex] = {
      ...day,
      comments: [...(day.comments || []), newComment]
    }

    await onUpdate('shootingSchedule', {
      ...scheduleData,
      days: updatedDays,
      lastUpdated: Date.now(),
      updatedBy: currentUserId
    })
  }

  // Group days by week
  const weeks = []
  for (let i = 0; i < scheduleData.days.length; i += 7) {
    weeks.push(scheduleData.days.slice(i, i + 7))
  }

  const totalShootDays = scheduleData.days.filter(d => !scheduleData.restDays.includes(d.dayNumber)).length
  const completedDays = scheduleData.days.filter(d => d.status === 'shot').length
  const upcomingDays = scheduleData.days.filter(d => d.status === 'scheduled' || d.status === 'confirmed').length

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ScheduleStatCard
          icon="📅"
          label="Total Shoot Days"
          value={totalShootDays}
          subtitle={`${scheduleData.restDays.length} rest days`}
        />
        <ScheduleStatCard
          icon="✓"
          label="Completed"
          value={completedDays}
          subtitle={`${((completedDays / totalShootDays) * 100).toFixed(0)}% done`}
          color="#00FF99"
        />
        <ScheduleStatCard
          icon="📋"
          label="Upcoming"
          value={upcomingDays}
          subtitle="Days scheduled"
          color="#60A5FA"
        />
        <ScheduleStatCard
          icon="🎬"
          label="Total Scenes"
          value={scheduleData.days.reduce((sum, day) => sum + day.scenes.length, 0)}
          subtitle="Across all days"
        />
      </div>

      {/* Date Range Display */}
      {scheduleData.startDate && scheduleData.endDate && (
        <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-4">
          <div className="flex items-center justify-center gap-4 text-[#e7e7e7]">
            <div className="text-center">
              <div className="text-sm text-[#e7e7e7]/50">Start Date</div>
              <div className="text-lg font-bold">{formatDate(scheduleData.startDate)}</div>
            </div>
            <div className="text-2xl text-[#e7e7e7]/30">→</div>
            <div className="text-center">
              <div className="text-sm text-[#e7e7e7]/50">End Date</div>
              <div className="text-lg font-bold">{formatDate(scheduleData.endDate)}</div>
            </div>
            <div className="ml-8 text-center">
              <div className="text-sm text-[#e7e7e7]/50">Duration</div>
              <div className="text-lg font-bold">{scheduleData.totalShootDays} days</div>
            </div>
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#e7e7e7]">Schedule</h2>
        
        <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg p-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'calendar' 
                ? 'bg-[#00FF99] text-black' 
                : 'text-[#e7e7e7] hover:bg-[#36393f]'
            }`}
          >
            📅 Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'list' 
                ? 'bg-[#00FF99] text-black' 
                : 'text-[#e7e7e7] hover:bg-[#36393f]'
            }`}
          >
            📋 List
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'calendar' ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Week Navigator */}
            {weeks.length > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
                  disabled={selectedWeek === 0}
                  className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous Week
                </button>
                <span className="text-[#e7e7e7] font-medium">
                  Week {selectedWeek + 1} of {weeks.length}
                </span>
                <button
                  onClick={() => setSelectedWeek(Math.min(weeks.length - 1, selectedWeek + 1))}
                  disabled={selectedWeek === weeks.length - 1}
                  className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Week →
                </button>
              </div>
            )}

            {/* Calendar View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {weeks[selectedWeek]?.map((day, idx) => {
                const isRestDay = scheduleData.restDays.includes(day.dayNumber)
                const dayIndex = scheduleData.days.findIndex(d => d.dayNumber === day.dayNumber)
                
                return (
                  <DayCard
                    key={day.dayNumber}
                    day={day}
                    isRestDay={isRestDay}
                    onUpdate={(field, value) => handleDayUpdate(dayIndex, field, value)}
                    onAddComment={(comment) => handleAddComment(dayIndex, comment)}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                  />
                )
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {scheduleData.days.map((day, idx) => {
              const isRestDay = scheduleData.restDays.includes(day.dayNumber)
              
              return (
                <DayListItem
                  key={day.dayNumber}
                  day={day}
                  isRestDay={isRestDay}
                  onUpdate={(field, value) => handleDayUpdate(idx, field, value)}
                  onAddComment={(comment) => handleAddComment(idx, comment)}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                />
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper Functions
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Schedule Stat Card
function ScheduleStatCard({ 
  icon, 
  label, 
  value, 
  subtitle,
  color = '#e7e7e7'
}: { 
  icon: string
  label: string
  value: number
  subtitle?: string
  color?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
          <div className="text-sm text-[#e7e7e7]/50">{label}</div>
        </div>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-[#e7e7e7]/50 mt-1">
          {subtitle}
        </div>
      )}
    </motion.div>
  )
}

// Day Card (Calendar View)
function DayCard({
  day,
  isRestDay,
  onUpdate,
  onAddComment,
  currentUserId,
  currentUserName
}: {
  day: ShootingDay
  isRestDay: boolean
  onUpdate: (field: string, value: any) => void
  onAddComment: (comment: string) => void
  currentUserId: string
  currentUserName: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isRestDay) {
    return (
      <div className="bg-[#1a1a1a] border-2 border-dashed border-[#36393f] rounded-lg p-4 opacity-60">
        <div className="text-center">
          <div className="text-2xl mb-2">🛌</div>
          <div className="text-lg font-bold text-[#e7e7e7]">Day {day.dayNumber}</div>
          <div className="text-sm text-[#e7e7e7]/50">Rest Day</div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-[#1a1a1a] border-2 rounded-lg p-4 cursor-pointer transition-all ${
        isExpanded ? 'border-[#00FF99]' : 'border-[#36393f] hover:border-[#00FF99]/50'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Day Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-lg font-bold text-[#00FF99]">Day {day.dayNumber}</div>
          {day.date && (
            <div className="text-xs text-[#e7e7e7]/50">{formatDate(day.date)}</div>
          )}
        </div>
        <StatusBadge status={day.status} size="sm" />
      </div>

      {/* Location */}
      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm text-[#e7e7e7]">
          <span>📍</span>
          <span className="font-medium">{day.location}</span>
        </div>
      </div>

      {/* Quick Info */}
      <div className="space-y-1 text-sm text-[#e7e7e7]/70">
        <div>🎬 {day.scenes.length} scene{day.scenes.length !== 1 ? 's' : ''}</div>
        <div>⏰ Call: {day.callTime}</div>
        <div>🌅 Wrap: {day.estimatedWrapTime}</div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-[#36393f] space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scenes */}
            <div>
              <div className="text-xs text-[#e7e7e7]/50 mb-2">Scenes:</div>
              <div className="flex flex-wrap gap-2">
                {day.scenes.map((sceneNum) => (
                  <span
                    key={sceneNum}
                    className="px-2 py-1 bg-[#2a2a2a] text-[#00FF99] text-xs rounded font-medium"
                  >
                    #{sceneNum}
                  </span>
                ))}
              </div>
            </div>

            {/* Cast */}
            {day.castRequired.length > 0 && (
              <div>
                <div className="text-xs text-[#e7e7e7]/50 mb-2">Cast:</div>
                <div className="text-xs text-[#e7e7e7]">
                  {day.castRequired.join(', ')}
                </div>
              </div>
            )}

            {/* Notes */}
            {day.specialNotes && (
              <div>
                <div className="text-xs text-[#e7e7e7]/50 mb-1">Notes:</div>
                <div className="text-xs text-[#e7e7e7]/70">{day.specialNotes}</div>
              </div>
            )}

            {/* Comments */}
            <div className="flex justify-end">
              <CollaborativeNotes
                comments={day.comments || []}
                onAddComment={onAddComment}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Day List Item (List View)
function DayListItem({
  day,
  isRestDay,
  onUpdate,
  onAddComment,
  currentUserId,
  currentUserName
}: {
  day: ShootingDay
  isRestDay: boolean
  onUpdate: (field: string, value: any) => void
  onAddComment: (comment: string) => void
  currentUserId: string
  currentUserName: string
}) {
  if (isRestDay) {
    return (
      <div className="bg-[#1a1a1a] border-2 border-dashed border-[#36393f] rounded-lg p-4 opacity-60">
        <div className="flex items-center gap-4">
          <div className="text-2xl">🛌</div>
          <div>
            <div className="text-lg font-bold text-[#e7e7e7]">Day {day.dayNumber}</div>
            <div className="text-sm text-[#e7e7e7]/50">Rest Day</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-4 hover:border-[#00FF99]/50 transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Day Info */}
        <div className="lg:col-span-2">
          <div className="text-2xl font-bold text-[#00FF99]">Day {day.dayNumber}</div>
          {day.date && (
            <div className="text-sm text-[#e7e7e7]/50">{formatDate(day.date)}</div>
          )}
          <div className="mt-2">
            <StatusBadge status={day.status} size="sm" />
          </div>
        </div>

        {/* Location & Times */}
        <div className="lg:col-span-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span>📍</span>
              <span className="text-[#e7e7e7] font-medium">{day.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#e7e7e7]/70">
              <span>⏰</span>
              <span>Call: {day.callTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#e7e7e7]/70">
              <span>🌅</span>
              <span>Wrap: {day.estimatedWrapTime}</span>
            </div>
          </div>
        </div>

        {/* Scenes */}
        <div className="lg:col-span-3">
          <div className="text-xs text-[#e7e7e7]/50 mb-2">Scenes ({day.scenes.length}):</div>
          <div className="flex flex-wrap gap-1">
            {day.scenes.map((sceneNum) => (
              <span
                key={sceneNum}
                className="px-2 py-0.5 bg-[#2a2a2a] text-[#00FF99] text-xs rounded font-medium"
              >
                #{sceneNum}
              </span>
            ))}
          </div>
        </div>

        {/* Cast */}
        <div className="lg:col-span-3">
          <div className="text-xs text-[#e7e7e7]/50 mb-2">Cast:</div>
          <div className="text-sm text-[#e7e7e7]/70">
            {day.castRequired.length > 0 ? day.castRequired.join(', ') : 'None specified'}
          </div>
        </div>

        {/* Actions */}
        <div className="lg:col-span-1 flex items-start justify-end">
          <CollaborativeNotes
            comments={day.comments || []}
            onAddComment={onAddComment}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
          />
        </div>
      </div>

      {/* Notes */}
      {day.specialNotes && (
        <div className="mt-3 pt-3 border-t border-[#36393f]">
          <div className="text-xs text-[#e7e7e7]/50 mb-1">Notes:</div>
          <div className="text-sm text-[#e7e7e7]/70">{day.specialNotes}</div>
        </div>
      )}
    </div>
  )
}

