import React, { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Export Toolbar Component
 * 
 * Provides export, print, copy, and share functionality for pre-production content.
 */

interface ExportToolbarProps {
  onExportPDF?: () => void
  onPrint?: () => void
  onCopy?: () => void
  onShare?: () => void
  onDownloadJSON?: () => void
  disabled?: boolean
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  onExportPDF,
  onPrint,
  onCopy,
  onShare,
  onDownloadJSON,
  disabled = false
}) => {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  
  const handleCopy = () => {
    if (onCopy) {
      onCopy()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  const handleShare = () => {
    if (onShare) {
      onShare()
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }
  
  const actions = [
    {
      icon: '📥',
      label: 'Export PDF',
      onClick: onExportPDF,
      enabled: !!onExportPDF
    },
    {
      icon: '🖨️',
      label: 'Print',
      onClick: onPrint,
      enabled: !!onPrint
    },
    {
      icon: copied ? '✓' : '📋',
      label: copied ? 'Copied!' : 'Copy',
      onClick: handleCopy,
      enabled: !!onCopy
    },
    {
      icon: shared ? '✓' : '📧',
      label: shared ? 'Shared!' : 'Share',
      onClick: handleShare,
      enabled: !!onShare
    },
    {
      icon: '💾',
      label: 'Download JSON',
      onClick: onDownloadJSON,
      enabled: !!onDownloadJSON
    }
  ].filter(action => action.enabled)
  
  if (actions.length === 0) {
    return null
  }
  
  return (
    <div className="flex flex-wrap gap-2 justify-center md:justify-end mb-6">
      {actions.map((action, index) => (
        <motion.button
          key={index}
          onClick={action.onClick}
          disabled={disabled}
          className={`
            px-4 py-2 rounded-lg border font-medium text-sm
            transition-all flex items-center gap-2
            ${disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:border-[#00FF99] hover:bg-[#00FF99]/10'
            }
          `}
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-color)'
          }}
          whileHover={disabled ? {} : { scale: 1.05 }}
          whileTap={disabled ? {} : { scale: 0.95 }}
        >
          <span>{action.icon}</span>
          <span className="hidden sm:inline">{action.label}</span>
        </motion.button>
      ))}
    </div>
  )
}

export default ExportToolbar

