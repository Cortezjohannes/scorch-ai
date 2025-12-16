import React from 'react'
import { motion } from 'framer-motion'

/**
 * Content Header Component
 * 
 * Displays tab headers with title, description, and statistics.
 */

interface Stat {
  label: string
  value: string | number
  icon?: string
}

interface ContentHeaderProps {
  title: string
  description: string
  stats?: Stat[]
  icon?: string
}

export const ContentHeader: React.FC<ContentHeaderProps> = ({
  title,
  description,
  stats,
  icon
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      {/* Title Section */}
      <div className="text-center mb-6">
        {icon && (
          <div className="inline-block mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/30">
              <span className="text-3xl">{icon}</span>
            </div>
          </div>
        )}
        
        <h2 className="text-3xl font-bold mb-2">
          {title}
        </h2>
        
        <p className="text-lg opacity-70 max-w-2xl mx-auto">
          {description}
        </p>
      </div>
      
      {/* Statistics Grid */}
      {stats && stats.length > 0 && (
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(stats.length, 4)} gap-4`}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 rounded-xl border transition-all hover:border-[#10B981]/50"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              {stat.icon && (
                <div className="text-2xl mb-2">{stat.icon}</div>
              )}
              <div className="text-2xl font-bold text-[#10B981] mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-medium opacity-80">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default ContentHeader

