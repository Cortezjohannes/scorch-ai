'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { StatusType } from '@/types/preproduction'

interface StatusBadgeProps {
  status: StatusType | string
  onClick?: () => void
  editable?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const STATUS_CONFIGS: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  'not-started': {
    color: '#9CA3AF',
    bg: '#374151',
    icon: '○',
    label: 'Not Started'
  },
  'in-progress': {
    color: '#60A5FA',
    bg: '#1E40AF',
    icon: '◐',
    label: 'In Progress'
  },
  'completed': {
    color: '#00FF99',
    bg: '#064E3B',
    icon: '●',
    label: 'Completed'
  },
  'blocked': {
    color: '#EF4444',
    bg: '#7F1D1D',
    icon: '✕',
    label: 'Blocked'
  },
  'cancelled': {
    color: '#6B7280',
    bg: '#1F2937',
    icon: '⊘',
    label: 'Cancelled'
  },
  // Budget statuses
  'estimated': {
    color: '#FCD34D',
    bg: '#78350F',
    icon: '~',
    label: 'Estimated'
  },
  'confirmed': {
    color: '#60A5FA',
    bg: '#1E40AF',
    icon: '✓',
    label: 'Confirmed'
  },
  'paid': {
    color: '#00FF99',
    bg: '#064E3B',
    icon: '✓',
    label: 'Paid'
  },
  // Procurement statuses
  'needed': {
    color: '#F59E0B',
    bg: '#78350F',
    icon: '!',
    label: 'Needed'
  },
  'sourced': {
    color: '#60A5FA',
    bg: '#1E40AF',
    icon: '↗',
    label: 'Sourced'
  },
  'obtained': {
    color: '#00FF99',
    bg: '#064E3B',
    icon: '✓',
    label: 'Obtained'
  },
  'packed': {
    color: '#10B981',
    bg: '#065F46',
    icon: '📦',
    label: 'Packed'
  },
  // Shooting schedule statuses
  'scheduled': {
    color: '#FCD34D',
    bg: '#78350F',
    icon: '📅',
    label: 'Scheduled'
  },
  'shot': {
    color: '#00FF99',
    bg: '#064E3B',
    icon: '🎬',
    label: 'Shot'
  },
  'postponed': {
    color: '#F59E0B',
    bg: '#78350F',
    icon: '⏸',
    label: 'Postponed'
  },
  // Casting statuses
  'casting': {
    color: '#FCD34D',
    bg: '#78350F',
    icon: '🎭',
    label: 'Casting'
  },
  'offered': {
    color: '#60A5FA',
    bg: '#1E40AF',
    icon: '📨',
    label: 'Offered'
  },
  'declined': {
    color: '#EF4444',
    bg: '#7F1D1D',
    icon: '✕',
    label: 'Declined'
  },
  // Location statuses
  'scouted': {
    color: '#60A5FA',
    bg: '#1E40AF',
    icon: '👁',
    label: 'Scouted'
  },
  'booked': {
    color: '#00FF99',
    bg: '#064E3B',
    icon: '✓',
    label: 'Booked'
  },
  // Shot list statuses
  'planned': {
    color: '#9CA3AF',
    bg: '#374151',
    icon: '○',
    label: 'Planned'
  },
  'got-it': {
    color: '#00FF99',
    bg: '#064E3B',
    icon: '✓',
    label: 'Got It'
  },
  'need-pickup': {
    color: '#F59E0B',
    bg: '#78350F',
    icon: '↻',
    label: 'Need Pickup'
  },
  'cut': {
    color: '#6B7280',
    bg: '#1F2937',
    icon: '✂',
    label: 'Cut'
  },
  // Permit statuses
  'not-needed': {
    color: '#6B7280',
    bg: '#1F2937',
    icon: '—',
    label: 'Not Needed'
  },
  'pending': {
    color: '#FCD34D',
    bg: '#78350F',
    icon: '⏳',
    label: 'Pending'
  },
  // Storyboard statuses
  'draft': {
    color: '#9CA3AF',
    bg: '#374151',
    icon: '✏',
    label: 'Draft'
  },
  'revised': {
    color: '#60A5FA',
    bg: '#1E40AF',
    icon: '↻',
    label: 'Revised'
  },
  'final': {
    color: '#00FF99',
    bg: '#064E3B',
    icon: '✓',
    label: 'Final'
  }
}

const SIZE_CONFIGS = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2'
}

export function StatusBadge({ status, onClick, editable = false, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIGS[status] || {
    color: '#9CA3AF',
    bg: '#374151',
    icon: '?',
    label: status
  }

  const Component = onClick || editable ? motion.button : 'div'

  return (
    <Component
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full font-medium ${SIZE_CONFIGS[size]} ${
        (onClick || editable) ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
      }`}
      style={{
        backgroundColor: config.bg,
        color: config.color
      }}
      {...((onClick || editable) && {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 }
      })}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </Component>
  )
}

// Status selector component for changing status
interface StatusSelectorProps {
  currentStatus: StatusType | string
  availableStatuses: Array<StatusType | string>
  onSelect: (status: StatusType | string) => void
  onClose: () => void
}

export function StatusSelector({ currentStatus, availableStatuses, onSelect, onClose }: StatusSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute z-50 mt-2 bg-[#1a1a1a] border border-[#36393f] rounded-lg shadow-xl p-2 min-w-[200px]"
    >
      <div className="text-xs text-[#e7e7e7]/50 px-2 py-1 mb-1">Select Status</div>
      {availableStatuses.map((status) => (
        <button
          key={status}
          onClick={() => {
            onSelect(status)
            onClose()
          }}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-[#2a2a2a] transition-colors text-left ${
            status === currentStatus ? 'bg-[#2a2a2a]' : ''
          }`}
        >
          <StatusBadge status={status} size="sm" />
        </button>
      ))}
    </motion.div>
  )
}


