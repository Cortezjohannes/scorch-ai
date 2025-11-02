import React from 'react'
import { motion } from 'framer-motion'

/**
 * Empty State Component
 * 
 * Displays when no content is available for a tab.
 */

interface EmptyStateProps {
  title: string
  description: string
  icon: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 bg-gradient-to-br from-[#00FF99]/20 to-[#00CC7A]/20 border border-[#00FF99]/30">
        <span className="text-4xl">{icon}</span>
      </div>
      
      <h3 className="text-xl font-semibold mb-2 text-center">
        {title}
      </h3>
      
      <p className="text-sm text-center max-w-md opacity-70 mb-6">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 rounded-lg bg-[#00FF99] text-black font-medium hover:bg-[#00CC7A] transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
}

export default EmptyState

