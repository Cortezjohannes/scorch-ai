'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface ExtendSeriesWarningModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ExtendSeriesWarningModal({
  isOpen,
  onConfirm,
  onCancel,
}: ExtendSeriesWarningModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4"
        onClick={onCancel}
      >
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#1A1A1A] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-8"
          >
            {/* Warning glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
            
            <div className="relative p-8">
              {/* Warning Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-amber-500/10 border-2 border-amber-500/40 rounded-full flex items-center justify-center">
                  <span className="text-4xl">⚠️</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white text-center mb-3">
                Extend Series
              </h2>

              {/* Message */}
              <p className="text-white/70 text-center mb-4">
                This will add an entire arc containing <strong className="text-amber-400">8 episodes</strong> to your series.
              </p>
              
              <p className="text-amber-400 text-center text-sm mb-6 font-semibold">
                This action cannot be changed back.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 bg-[#2a2a2a] border border-[#36393f] text-white font-medium rounded-lg hover:bg-[#3a3a3a] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-6 py-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold rounded-lg hover:bg-amber-500/30 transition-all"
                >
                  Extend Series
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}



