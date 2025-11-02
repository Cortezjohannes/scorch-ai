'use client'

import { X, Lock, CheckCircle, XCircle, Info, Lightbulb } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface LockInfoModalProps {
  isOpen: boolean
  onClose: () => void
  episodeCount: number
}

// ============================================================================
// LOCK INFO MODAL
// ============================================================================

export default function LockInfoModal({
  isOpen,
  onClose,
  episodeCount
}: LockInfoModalProps) {
  if (!isOpen) return null

  const isLocked = episodeCount > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/30 max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Story Bible Lock System</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-160px)] space-y-6">
          {/* Why Locking? */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Why Lock the Story Bible?</h3>
            </div>
            <p className="text-gray-300">
              Once you generate episodes, characters appear with specific traits, the world operates under certain rules,
              and plot events unfold based on the established story bible. If you could freely edit the story bible after
              this point, you could create continuity errors and contradictions with your generated content.
            </p>
          </div>

          {/* Current Status */}
          <div className={`p-4 rounded-lg border-2 ${
            isLocked 
              ? 'bg-yellow-900/20 border-yellow-500/50' 
              : 'bg-blue-900/20 border-blue-500/50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {isLocked ? (
                <Lock className="w-5 h-5 text-yellow-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-blue-400" />
              )}
              <h4 className="font-semibold text-white">
                Current Status: {isLocked ? 'Locked' : 'Unlocked'}
              </h4>
            </div>
            <p className="text-sm text-gray-300">
              {isLocked
                ? `Your story bible is locked because you've generated ${episodeCount} episode${episodeCount !== 1 ? 's' : ''}.`
                : 'Your story bible is unlocked. You can freely edit all content until you generate your first episode.'}
            </p>
          </div>

          {/* What You Can Do */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              {isLocked ? 'What You Can Still Do' : 'What Happens When Locked'}
            </h3>
            <div className="space-y-3">
              <PermissionItem
                allowed={true}
                text="Add new characters using the Character Creation Wizard"
                description="New characters can be introduced at any time and will appear in future episodes"
              />
              <PermissionItem
                allowed={true}
                text="Use Episode Reflection to update the story bible"
                description="After generating episodes, you can analyze them and add new locations, character developments, and world-building details"
              />
              <PermissionItem
                allowed={false}
                text="Edit existing character traits or backstories"
                description="This prevents contradictions with how characters have already appeared in episodes"
              />
              <PermissionItem
                allowed={false}
                text="Modify world building rules or settings"
                description="World rules must remain consistent with how they've been established in episodes"
              />
              <PermissionItem
                allowed={false}
                text="Delete characters, locations, or arcs"
                description="Removing content could create broken references in existing episodes"
              />
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-purple-400" />
              <h4 className="font-semibold text-white">Best Practices</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>
                  <strong>Before generating episodes:</strong> Make sure your core world building, character foundations,
                  and story arcs are well-defined
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>
                  <strong>After locking:</strong> Use Episode Reflection after each episode to update the story bible
                  with new information revealed in the episode
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>
                  <strong>Adding characters:</strong> You can always add new characters even when locked. They'll appear
                  in future episodes
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>
                  <strong>Major changes:</strong> If you need to make major changes to the story bible, consider creating
                  a new branch or starting a fresh story bible
                </span>
              </li>
            </ul>
          </div>

          {/* Advanced: Unlocking */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Need to Unlock?
            </h4>
            <p className="text-sm text-gray-300 mb-3">
              Currently, there's no way to unlock the story bible once episodes are generated. This is by design to
              maintain story integrity.
            </p>
            <p className="text-sm text-gray-300">
              If you absolutely need to make changes, you can create a new story bible and copy over the elements you
              want to keep, or use Version Control to restore a pre-episode state (though this will require regenerating
              episodes).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-purple-500/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PERMISSION ITEM
// ============================================================================

function PermissionItem({
  allowed,
  text,
  description
}: {
  allowed: boolean
  text: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
        allowed ? 'bg-green-500/20' : 'bg-red-500/20'
      }`}>
        {allowed ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <XCircle className="w-4 h-4 text-red-400" />
        )}
      </div>
      <div className="flex-1">
        <p className={`font-medium ${allowed ? 'text-white' : 'text-gray-400'}`}>
          {text}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

