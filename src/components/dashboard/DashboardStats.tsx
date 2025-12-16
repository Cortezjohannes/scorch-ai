'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface DashboardStatsProps {
  stats: {
    totalEpisodes: number
    generatedEpisodes: number
    preProductionCompleted: number
    arcsReadyForProduction: number
  }
  theme: 'light' | 'dark'
}

export default function DashboardStats({ stats, theme }: DashboardStatsProps) {
  const prefix = theme === 'dark' ? 'dark' : 'light'

  const statCards = [
    { label: 'Total Episodes', value: stats.totalEpisodes, color: 'accent' },
    { label: 'Episodes Generated', value: stats.generatedEpisodes, color: 'accent' },
    { label: 'Pre-Production Completed', value: stats.preProductionCompleted, color: 'accent' },
    { label: 'Arcs Ready for Production', value: stats.arcsReadyForProduction, color: 'accent' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
    >
      {statCards.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
          whileHover={{ scale: 1.05, y: -2 }}
          className={`p-5 rounded-lg ${prefix}-card-secondary ${prefix}-border text-center cursor-default relative overflow-hidden`}
        >
          {/* Subtle gradient background */}
          <div className={`absolute inset-0 opacity-5 ${prefix}-bg-accent`}></div>
          <div className="relative">
            <div className={`text-4xl font-bold mb-2 ${prefix}-text-accent`}>
              {stat.value}
            </div>
            <div className={`text-xs font-medium ${prefix}-text-secondary`}>
              {stat.label}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

