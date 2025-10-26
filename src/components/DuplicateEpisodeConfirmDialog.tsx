'use client'

interface DuplicateEpisodeConfirmDialogProps {
  isOpen: boolean
  episodeNumber: number
  onConfirm: () => void
  onCancel: () => void
}

export default function DuplicateEpisodeConfirmDialog({ 
  isOpen, 
  episodeNumber, 
  onConfirm, 
  onCancel 
}: DuplicateEpisodeConfirmDialogProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-[#D62828]/50 rounded-xl p-6 max-w-md mx-4 shadow-2xl">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#D62828]/20 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#D62828] mb-2">
              Episode {episodeNumber} Already Exists
            </h2>
            <p className="text-[#e7e7e7]/80 text-sm leading-relaxed">
              This episode has already been generated. Regenerating will <strong>permanently replace</strong> the existing episode with a new version.
            </p>
          </div>
        </div>
        
        <div className="bg-[#2a2a2a]/50 border border-[#36393f] rounded-lg p-3 mb-6">
          <p className="text-xs text-[#e7e7e7]/60">
            <strong className="text-[#D62828]">Warning:</strong> This action cannot be undone. The previous episode content will be lost.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#e7e7e7] rounded-lg font-semibold transition-colors border border-[#36393f]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-[#D62828] hover:bg-[#ff3030] text-white rounded-lg font-bold transition-colors shadow-lg"
          >
            Replace Episode
          </button>
        </div>
      </div>
    </div>
  )
}


