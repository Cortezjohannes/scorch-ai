'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ContentSectionProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  variant?: 'default' | 'featured' | 'compact'
}

export function ContentSection({
  title,
  subtitle,
  children,
  className = '',
  variant = 'default'
}: ContentSectionProps) {
  const sectionVariants = {
    default: 'py-12',
    featured: 'py-16 bg-gradient-to-b from-ember-gold/5 to-transparent rounded-xl',
    compact: 'py-8'
  }

  return (
    <motion.section
      className={`${sectionVariants[variant]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {(title || subtitle) && (
        <div className="mb-8">
          {title && (
            <h2 className="text-h2 font-bold text-high-contrast mb-3 elegant-fire">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-body-large text-medium-contrast max-w-2xl elegant-fire">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      {children}
    </motion.section>
  )
}
