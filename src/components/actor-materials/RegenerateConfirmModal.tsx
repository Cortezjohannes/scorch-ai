'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import type { ActingTechnique } from '@/types/actor-materials'

interface RegenerateConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  technique?: ActingTechnique
  currentTechnique?: ActingTechnique
  characterCount?: number
  characterName?: string // If provided, only regenerating one character
}

const TECHNIQUE_NAMES: Record<string, string> = {
  'stanislavski': 'Stanislavski',
  'meisner': 'Meisner',
  'method-acting': 'Method Acting',
  'adler': 'Adler',
  'hagen': 'Hagen',
  'chekhov': 'Chekhov',
  'laban': 'Laban',
  'viewpoints': 'Viewpoints',
  'practical-aesthetics': 'Practical Aesthetics',
  'spolin': 'Spolin'
}

export default function RegenerateConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  technique,
  currentTechnique,
  characterCount = 0,
  characterName
}: RegenerateConfirmModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'

  if (!isOpen) return null

  const isTechniqueChange = technique !== undefined && technique !== currentTechnique
  const techniqueName = technique ? TECHNIQUE_NAMES[technique] || technique : 'General'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className={`relative w-full max-w-md ${prefix}-card rounded-xl overflow-hidden shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`${prefix}-card border-b ${prefix}-border p-6`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'
              }`}>
                ⚠️
              </div>
              <h2 className={`text-2xl font-bold ${prefix}-text-primary`}>
                Regenerate Materials?
              </h2>
            </div>
            {isTechniqueChange && (
              <p className={`text-sm ${prefix}-text-secondary mt-2`}>
                Changing from <span className="font-semibold">{currentTechnique ? TECHNIQUE_NAMES[currentTechnique] || currentTechnique : 'General'}</span> to <span className="font-semibold">{techniqueName}</span>
              </p>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className={`${prefix}-text-primary font-medium mb-2`}>
                {characterName 
                  ? `This will replace existing materials for ${characterName}.`
                  : 'This will replace all existing actor materials.'}
              </p>
              <ul className={`text-sm ${prefix}-text-secondary space-y-1 list-disc list-inside`}>
                {characterName ? (
                  <>
                    <li>{characterName} will be regenerated</li>
                    <li>This process may take a few minutes</li>
                    {isTechniqueChange && (
                      <li>Materials will be tailored to {techniqueName} technique</li>
                    )}
                    <li>Existing materials for this character will be permanently replaced</li>
                  </>
                ) : (
                  <>
                    <li>All {characterCount} character{characterCount !== 1 ? 's' : ''} will be regenerated</li>
                    <li>This process may take several minutes</li>
                    {isTechniqueChange && (
                      <li>Materials will be tailored to {techniqueName} technique</li>
                    )}
                    <li>Existing materials will be permanently replaced</li>
                  </>
                )}
              </ul>
            </div>

            <p className={`text-sm ${prefix}-text-secondary`}>
              Are you sure you want to continue?
            </p>
          </div>

          {/* Actions */}
          <div className={`${prefix}-card border-t ${prefix}-border p-6 flex gap-3`}>
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                isDark
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                isDark
                  ? 'bg-[#10B981] text-black hover:bg-[#10B981]/90'
                  : 'bg-[#C9A961] text-white hover:bg-[#C9A961]/90'
              }`}
            >
              Regenerate All
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

