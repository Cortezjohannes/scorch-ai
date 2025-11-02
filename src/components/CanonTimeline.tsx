'use client'

import { useState, useMemo } from 'react'
import { Calendar, Plus, Search, Filter, Download, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { TimelineEvent, TimelineFilter } from '@/types/timeline'

// ============================================================================
// TYPES
// ============================================================================

interface CanonTimelineProps {
  timeline: {
    events: TimelineEvent[]
    chronologyType: 'episodic' | 'flashbacks' | 'non-linear'
  }
  onAddEvent?: (event: Partial<TimelineEvent>) => void
  onEditEvent?: (eventId: string, updates: Partial<TimelineEvent>) => void
  onDeleteEvent?: (eventId: string) => void
  readOnly?: boolean
}

// ============================================================================
// CANON TIMELINE COMPONENT
// ============================================================================

export default function CanonTimeline({
  timeline,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  readOnly = false
}: CanonTimelineProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<TimelineFilter>({})
  const [showFilters, setShowFilters] = useState(false)
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)

  // ============================================================================
  // FILTERING & SORTING
  // ============================================================================

  const filteredEvents = useMemo(() => {
    let events = [...timeline.events]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      events = events.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.relatedCharacters.some(char => char.toLowerCase().includes(query)) ||
        event.relatedLocations.some(loc => loc.toLowerCase().includes(query))
      )
    }

    // Type filter
    if (filter.type && filter.type.length > 0) {
      events = events.filter(event => filter.type!.includes(event.type))
    }

    // Character filter
    if (filter.character) {
      events = events.filter(event =>
        event.relatedCharacters.some(char =>
          char.toLowerCase().includes(filter.character!.toLowerCase())
        )
      )
    }

    // Episode filter
    if (filter.episode) {
      events = events.filter(event => event.episodeNumber === filter.episode)
    }

    // Significance filter
    if (filter.minSignificance) {
      events = events.filter(event => event.significance >= filter.minSignificance!)
    }

    // Sort by episode number
    events.sort((a, b) => a.episodeNumber - b.episodeNumber)

    return events
  }, [timeline.events, searchQuery, filter])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId)
    } else {
      newExpanded.add(eventId)
    }
    setExpandedEvents(newExpanded)
  }

  const exportTimeline = () => {
    const markdown = generateTimelineMarkdown(filteredEvents)
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'timeline.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setFilter({})
    setSearchQuery('')
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'character_intro':
        return '👤'
      case 'plot_event':
        return '⚡'
      case 'world_reveal':
        return '🌍'
      case 'relationship_change':
        return '💫'
      case 'major_decision':
        return '🎯'
      default:
        return '📌'
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'character_intro':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'plot_event':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'world_reveal':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'relationship_change':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/50'
      case 'major_decision':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Canon Timeline</h2>
            <p className="text-sm text-gray-400">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} • {timeline.chronologyType}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportTimeline}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          {!readOnly && onAddEvent && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search events, characters, locations..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-colors ${
              showFilters ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Event Type</label>
                <select
                  multiple
                  value={filter.type || []}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value) as any[]
                    setFilter(prev => ({ ...prev, type: selected }))
                  }}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  size={6}
                >
                  <option value="character_intro">Character Intro</option>
                  <option value="plot_event">Plot Event</option>
                  <option value="world_reveal">World Reveal</option>
                  <option value="relationship_change">Relationship Change</option>
                  <option value="major_decision">Major Decision</option>
                </select>
              </div>

              {/* Character Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Character</label>
                <input
                  type="text"
                  value={filter.character || ''}
                  onChange={e => setFilter(prev => ({ ...prev, character: e.target.value }))}
                  placeholder="Filter by character..."
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Episode Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Episode</label>
                <input
                  type="number"
                  value={filter.episode || ''}
                  onChange={e => setFilter(prev => ({ ...prev, episode: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="Filter by episode..."
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Significance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Min Significance ({filter.minSignificance || 1}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={filter.minSignificance || 1}
                  onChange={e => setFilter(prev => ({ ...prev, minSignificance: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-600 via-purple-500 to-purple-600"></div>

        {/* Events */}
        <div className="space-y-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No timeline events found</p>
            </div>
          ) : (
            filteredEvents.map((event, idx) => (
              <div key={event.id} className="relative pl-20">
                {/* Episode Marker */}
                <div className="absolute left-0 top-0 w-16 h-16 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-purple-600 border-4 border-gray-900 flex items-center justify-center text-white font-bold text-sm">
                    E{event.episodeNumber}
                  </div>
                </div>

                {/* Event Card */}
                <div
                  className={`bg-gray-800 rounded-lg border-2 transition-all ${
                    expandedEvents.has(event.id)
                      ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                      : 'border-gray-700 hover:border-purple-500/50'
                  }`}
                >
                  {/* Event Header */}
                  <div
                    onClick={() => toggleEventExpansion(event.id)}
                    className="p-4 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded border ${getEventTypeColor(event.type)}`}>
                                {event.type.replace(/_/g, ' ')}
                              </span>
                              <span className="text-xs text-gray-400">
                                Significance: {event.significance}/10
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-300 text-sm line-clamp-2">{event.description}</p>
                      </div>

                      <button className="text-gray-400 hover:text-white transition-colors ml-4">
                        {expandedEvents.has(event.id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedEvents.has(event.id) && (
                    <div className="border-t border-gray-700 p-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Full Description</h4>
                        <p className="text-gray-300 text-sm">{event.description}</p>
                      </div>

                      {event.relatedCharacters.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Related Characters</h4>
                          <div className="flex flex-wrap gap-2">
                            {event.relatedCharacters.map((char, idx) => (
                              <span key={idx} className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/50">
                                {char}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {event.relatedLocations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Related Locations</h4>
                          <div className="flex flex-wrap gap-2">
                            {event.relatedLocations.map((loc, idx) => (
                              <span key={idx} className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/50">
                                {loc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {event.sceneReference && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Scene Reference</h4>
                          <p className="text-gray-300 text-sm">{event.sceneReference}</p>
                        </div>
                      )}

                      {!readOnly && (
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => onEditEvent && onEditEvent(event.id, event)}
                            className="px-3 py-1.5 rounded bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteEvent && confirm('Delete this event?') && onDeleteEvent(event.id)}
                            className="px-3 py-1.5 rounded bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors flex items-center gap-2 text-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateTimelineMarkdown(events: TimelineEvent[]): string {
  let markdown = '# Canon Timeline\n\n'

  events.forEach(event => {
    markdown += `## Episode ${event.episodeNumber}: ${event.title}\n\n`
    markdown += `**Type:** ${event.type.replace(/_/g, ' ')}\n\n`
    markdown += `**Significance:** ${event.significance}/10\n\n`
    markdown += `**Description:**\n${event.description}\n\n`

    if (event.relatedCharacters.length > 0) {
      markdown += `**Related Characters:** ${event.relatedCharacters.join(', ')}\n\n`
    }

    if (event.relatedLocations.length > 0) {
      markdown += `**Related Locations:** ${event.relatedLocations.join(', ')}\n\n`
    }

    markdown += '---\n\n'
  })

  return markdown
}


