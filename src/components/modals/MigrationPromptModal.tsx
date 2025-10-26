'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoryBible } from '@/services/story-bible-service'

interface MigrationPromptModalProps {
  isOpen: boolean
  localBibles: StoryBible[]
  onMigrate: (options: { skipDuplicates: boolean; clearLocal: boolean }) => Promise<void>
  onClose: () => void
  isLoading?: boolean
}

export default function MigrationPromptModal({
  isOpen,
  localBibles,
  onMigrate,
  onClose,
  isLoading
}: MigrationPromptModalProps) {
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [clearLocal, setClearLocal] = useState(false)
  
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 overflow-y-auto z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLoading) {
            onClose()
          }
        }}
      >
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#1A1A1A] border border-[#00FF99]/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl my-8"
            style={{ fontFamily: 'League Spartan, sans-serif' }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00FF99]/20 to-[#00CC7A]/20 border-2 border-[#00FF99]/40 rounded-full flex items-center justify-center shadow-lg shadow-[#00FF99]/20">
                <span className="text-5xl">💾</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00FF99] to-[#00CC7A] mb-4 text-center">
              Save Your Work to Your Account
            </h3>
            
            {/* Description */}
            <p className="text-white/80 mb-4 text-sm text-center">
              We found {localBibles.length} story {localBibles.length === 1 ? 'bible' : 'bibles'} on this device:
            </p>
            
            {/* List of bibles */}
            <div className="mb-6 space-y-2 max-h-48 overflow-y-auto">
              {localBibles.map(bible => (
                <div key={bible.id} className="bg-[#121212] rounded-lg p-3 border border-[#00FF99]/10">
                  <p className="font-semibold text-white text-sm">{bible.seriesTitle}</p>
                  <p className="text-xs text-white/50">
                    Last updated: {new Date(bible.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Options */}
            <div className="space-y-3 mb-6">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  disabled={isLoading}
                  className="mt-1 w-4 h-4 text-[#00FF99] bg-[#121212] border-[#00FF99]/30 rounded focus:ring-[#00FF99] focus:ring-2"
                />
                <span className="text-sm text-white/80">
                  Skip if already saved to account
                </span>
              </label>
              
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={clearLocal}
                  onChange={(e) => setClearLocal(e.target.checked)}
                  disabled={isLoading}
                  className="mt-1 w-4 h-4 text-[#00FF99] bg-[#121212] border-[#00FF99]/30 rounded focus:ring-[#00FF99] focus:ring-2"
                />
                <span className="text-sm text-white/80">
                  Clear local storage after saving
                </span>
              </label>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => onMigrate({ skipDuplicates, clearLocal })}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#00FF99] to-[#00CC7A] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#00FF99]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save to Account'}
              </button>
              
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-3 bg-[#1A1A1A] border border-[#00FF99]/30 text-white rounded-lg hover:bg-[#121212] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Later
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

