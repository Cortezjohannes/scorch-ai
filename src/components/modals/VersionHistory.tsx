'use client'

import { useState, useEffect } from 'react'
import { X, History, RotateCcw, Download, Search, Calendar } from 'lucide-react'
import { versionControl, Version } from '@/services/version-control'

// ============================================================================
// TYPES
// ============================================================================

interface VersionHistoryProps {
  isOpen: boolean
  onClose: () => void
  onRestore: (versionId: string) => void
  storyBibleId: string
}

// ============================================================================
// VERSION HISTORY MODAL
// ============================================================================

export default function VersionHistory({
  isOpen,
  onClose,
  onRestore,
  storyBibleId
}: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showComparison, setShowComparison] = useState(false)
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null)
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)

  // Load versions when modal opens
  useEffect(() => {
    if (!isOpen) return
    
    const loadVersions = async () => {
      try {
        setLoading(true)
        const versionHistory = await versionControl.getVersionHistory(storyBibleId)
        setVersions(versionHistory)
      } catch (error) {
        console.error('Failed to load version history:', error)
        setVersions([])
      } finally {
        setLoading(false)
      }
    }
    
    loadVersions()
  }, [isOpen, storyBibleId])

  if (!isOpen) return null

  // ============================================================================
  // FILTERING
  // ============================================================================

  const filteredVersions = versions.filter(version => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      version.description.toLowerCase().includes(query) ||
      version.changes.some(change =>
        change.changedSection.toLowerCase().includes(query) ||
        change.description.toLowerCase().includes(query)
      )
    )
  })

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRestore = (versionId: string) => {
    if (confirm('Are you sure you want to restore this version? Current changes will be saved as a new version.')) {
      onRestore(versionId)
      onClose()
    }
  }

  const handleExport = () => {
    const history = versionControl.exportVersionHistory(storyBibleId)
    const blob = new Blob([history], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `version-history-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCompare = async () => {
    if (!selectedVersion || !compareVersionId) return

    try {
      const comparison = await versionControl.compareVersions(
        storyBibleId,
        selectedVersion.id,
        compareVersionId
      )

      alert(`${comparison.summary}\n\nDifferences:\n${JSON.stringify(comparison.differences, null, 2)}`)
    } catch (error) {
      console.error('Failed to compare versions:', error)
      alert('Failed to compare versions. Please try again.')
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/30 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Version History</h2>
                <p className="text-sm text-gray-400">{versions.length} version{versions.length !== 1 ? 's' : ''} saved</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search versions..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading version history...</p>
              </div>
            </div>
          ) : versions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No versions saved yet</p>
              </div>
            </div>
          ) : (
            <>
          {/* Version List */}
          <div className="w-1/3 border-r border-purple-500/30 overflow-y-auto p-4 space-y-2">
            {filteredVersions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No versions found</p>
              </div>
            ) : (
              filteredVersions.map(version => (
                <button
                  key={version.id}
                  onClick={() => setSelectedVersion(version)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedVersion?.id === version.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      version.autoSave
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-purple-600/20 text-purple-400'
                    }`}>
                      {version.autoSave ? 'Auto' : 'Manual'}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(version.timestamp).toLocaleDateString()}
                    </div>
                  </div>

                  <h4 className="font-semibold text-white text-sm mb-1">{version.description}</h4>

                  <p className="text-xs text-gray-400">
                    {version.changes.length} change{version.changes.length !== 1 ? 's' : ''}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(version.timestamp).toLocaleTimeString()}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Version Details */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedVersion ? (
              <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-3">{selectedVersion.description}</h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Created:</span>
                      <span className="ml-2 text-white">
                        {new Date(selectedVersion.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400">Type:</span>
                      <span className="ml-2 text-white">
                        {selectedVersion.autoSave ? 'Auto-save' : 'Manual save'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400">Changes:</span>
                      <span className="ml-2 text-white">
                        {selectedVersion.changes.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Changes */}
                <div>
                  <h4 className="text-md font-semibold text-white mb-3">Changes in this version:</h4>
                  <div className="space-y-3">
                    {selectedVersion.changes.map((change, idx) => (
                      <div key={change.id || idx} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-white">{change.changedSection}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            change.changeType === 'add'
                              ? 'bg-green-500/20 text-green-400'
                              : change.changeType === 'delete'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {change.changeType}
                          </span>
                        </div>

                        <p className="text-sm text-gray-300 mb-2">{change.description}</p>

                        {change.beforeValue && (
                          <div className="text-xs text-gray-500">
                            <strong>Before:</strong> {JSON.stringify(change.beforeValue).substring(0, 100)}...
                          </div>
                        )}

                        {change.afterValue && (
                          <div className="text-xs text-gray-500">
                            <strong>After:</strong> {JSON.stringify(change.afterValue).substring(0, 100)}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleRestore(selectedVersion.id)}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore This Version
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <History className="w-16 h-16 mb-4 opacity-50" />
                <p>Select a version to view details</p>
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

