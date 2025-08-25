'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function PostProductionPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[60vh]"
    >
      <h1 className="text-2xl font-bold text-[#e2c376] mb-6">Post-Production Brief</h1>
      
      <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-8 text-center">
        <h2 className="text-xl mb-4">Post-Production Guidelines</h2>
        <p className="text-[#e7e7e7]/70">
          This tab will display editing guidelines, sound design notes, visual effects requirements, and other post-production details.
        </p>
      </div>
    </motion.div>
  )
} 