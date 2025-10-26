'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface DeleteConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}: DeleteConfirmModalProps) {
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
            className="relative w-full max-w-md bg-[#1A1A1A] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden my-8"
          >
          {/* Danger glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
          
          <div className="relative p-8">
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 border-2 border-red-500/40 rounded-full flex items-center justify-center">
                <span className="text-4xl">⚠️</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-3">
              {title}
            </h2>

            {/* Message */}
            <p className="text-white/70 text-center mb-2">
              {message}
            </p>
            
            <p className="text-red-400 text-center text-sm mb-6">
              This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3 bg-[#00FF99]/10 border border-[#00FF99]/30 text-[#00FF99] font-medium rounded-lg hover:bg-[#00FF99]/20 transition-all"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-6 py-3 bg-red-500/20 border border-red-500/40 text-red-400 font-bold rounded-lg hover:bg-red-500/30 transition-all"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

