import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PropsData, Prop, WardrobeItem } from '@/types/preproduction'
import { parsePropsAndWardrobe } from '../parsers/propsParser'
import { ContentHeader } from '../shared/ContentHeader'
import { EpisodeNavigator } from '../shared/EpisodeNavigator'
import { EmptyState } from '../shared/EmptyState'

/**
 * Props & Wardrobe Tab Component
 * 
 * Professional inventory card layout inspired by production management systems.
 * Features:
 * - Separate Props and Wardrobe sections
 * - Importance badges (Hero, Supporting, Background)
 * - Character and scene assignments
 * - Procurement information
 * - Visual reference placeholders
 */

interface PropsTabProps {
  data: PropsData | null
}

export const PropsTab: React.FC<PropsTabProps> = ({ data }) => {
  const [activeEpisode, setActiveEpisode] = useState(1)
  const [filter, setFilter] = useState<'all' | 'props' | 'wardrobe'>('all')
  
  if (!data || !data.episodes || data.episodes.length === 0) {
    return (
      <EmptyState
        title="No props & wardrobe data available"
        description="Generate props and wardrobe inventory to see production design requirements."
        icon="🎪"
      />
    )
  }
  
  const currentEpisode = data.episodes.find(ep => ep.episodeNumber === activeEpisode) || data.episodes[0]
  
  if (!currentEpisode) {
    return <EmptyState title="Episode not found" description="The selected episode data could not be loaded." icon="⚠️" />
  }
  
  // Parse the content if it's still in text format
  let props: Prop[] = currentEpisode.props || []
  let wardrobe: WardrobeItem[] = currentEpisode.wardrobe || []
  
  // If we have a props string instead of array, parse it
  if (typeof (currentEpisode as any).props === 'string') {
    const parsed = parsePropsAndWardrobe((currentEpisode as any).props)
    props = parsed.props
    wardrobe = parsed.wardrobe
  }
  
  const totalItems = props.length + wardrobe.length
  
  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <ContentHeader
        title="Props & Wardrobe"
        description="Production inventory with visual references and procurement details"
        icon="🎪"
        stats={[
          { label: 'Episodes', value: data.episodes.length, icon: '📺' },
          { label: 'Total Items', value: totalItems, icon: '📦' },
          { label: 'Status', value: 'Ready', icon: '✓' }
        ]}
      />
      
      {/* Episode Navigator & Filters */}
      <div className="rounded-2xl overflow-hidden border shadow-sm" style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)'
      }}>
        <EpisodeNavigator
          episodes={data.episodes.map(ep => ({ episodeNumber: ep.episodeNumber, episodeTitle: ep.episodeTitle }))}
          activeEpisode={activeEpisode}
          onEpisodeChange={setActiveEpisode}
        />
        
        <div className="p-6 md:p-8">
          {/* Episode Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/30">
                <span className="text-2xl">🎪</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {currentEpisode.episodeTitle || `Episode ${currentEpisode.episodeNumber}`}
                </h3>
                <p className="opacity-70">{totalItems} items • Production inventory</p>
              </div>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2">
              {['all', 'props', 'wardrobe'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as typeof filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-[#10B981] text-black'
                      : 'border hover:border-[#10B981]'
                  }`}
                  style={filter !== f ? { borderColor: 'var(--border-color)' } : {}}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Props Section */}
          {(filter === 'all' || filter === 'props') && props.length > 0 && (
            <div className="mb-12">
              <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span>🎬</span> Props
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {props.map((prop, index) => (
                  <PropCard key={index} prop={prop} />
                ))}
              </div>
            </div>
          )}
          
          {/* Wardrobe Section */}
          {(filter === 'all' || filter === 'wardrobe') && wardrobe.length > 0 && (
            <div>
              <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span>👗</span> Wardrobe
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wardrobe.map((item, index) => (
                  <WardrobeCard key={index} item={item} />
                ))}
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {totalItems === 0 && (
            <EmptyState
              title="No items found"
              description="This episode has no props or wardrobe items listed."
              icon="📦"
            />
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Individual Prop Card
 */
const PropCard: React.FC<{ prop: Prop }> = ({ prop }) => {
  const importanceColors = {
    hero: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
    supporting: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
    background: 'bg-gray-500/20 text-gray-600 border-gray-500/30'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0, 255, 153, 0.1)' }}
      className="rounded-xl border overflow-hidden transition-all"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)'
      }}
    >
      {/* Image Placeholder */}
      <div className="aspect-square bg-gradient-to-br from-[#10B981]/5 to-[#059669]/5 border-b border-dashed flex flex-col items-center justify-center group cursor-pointer"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {prop.imageUrl ? (
          <img src={prop.imageUrl} alt={prop.name} className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🎬</div>
            <p className="text-sm font-medium text-[#10B981] text-center px-2">{prop.name}</p>
            <p className="text-xs opacity-60">Visual Reference</p>
            <button className="mt-2 text-xs px-3 py-1 rounded-full bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] transition-colors">
              Generate
            </button>
          </>
        )}
      </div>
      
      {/* Prop Details */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h5 className="font-semibold text-[#10B981] truncate">{prop.name}</h5>
          {prop.importance && (
            <span className={`text-xs px-2 py-1 rounded-full border ${importanceColors[prop.importance]}`}>
              {prop.importance}
            </span>
          )}
        </div>
        
        <p className="text-sm mb-3 leading-relaxed line-clamp-2 opacity-80">{prop.description}</p>
        
        {/* Item Properties */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="opacity-60">📦</span>
            <span className="opacity-70">Category: {prop.category}</span>
          </div>
          {prop.scenes.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="opacity-60">🎬</span>
              <span className="opacity-70">Scenes: {prop.scenes.join(', ')}</span>
            </div>
          )}
          {prop.quantity > 1 && (
            <div className="flex items-center gap-2">
              <span className="opacity-60">🔢</span>
              <span className="opacity-70">Quantity: {prop.quantity}</span>
            </div>
          )}
          {prop.procurement.estimatedCost && (
            <div className="flex items-center gap-2">
              <span className="opacity-60">💰</span>
              <span className="opacity-70">Cost: {prop.procurement.estimatedCost}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="opacity-60">📋</span>
            <span className="opacity-70">Source: {prop.procurement.source}</span>
          </div>
        </div>
        
        {/* Production Status */}
        <div className="mt-4 pt-4 border-t flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-xs opacity-60">Status</span>
          <span className="text-xs px-2 py-1 rounded-full bg-[#10B981]/10 text-[#10B981]">
            Needed
          </span>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Individual Wardrobe Card
 */
const WardrobeCard: React.FC<{ item: WardrobeItem }> = ({ item }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0, 255, 153, 0.1)' }}
      className="rounded-xl border overflow-hidden transition-all"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)'
      }}
    >
      {/* Image Placeholder */}
      <div className="aspect-square bg-gradient-to-br from-[#10B981]/5 to-[#059669]/5 border-b border-dashed flex flex-col items-center justify-center group cursor-pointer"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.outfit} className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">👗</div>
            <p className="text-sm font-medium text-[#10B981] text-center px-2">{item.outfit}</p>
            <p className="text-xs opacity-60">Fashion Reference</p>
            <button className="mt-2 text-xs px-3 py-1 rounded-full bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] transition-colors">
              Generate
            </button>
          </>
        )}
      </div>
      
      {/* Wardrobe Details */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h5 className="font-semibold text-[#10B981] truncate">{item.outfit}</h5>
          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-600 border border-purple-500/30">
            👤 {item.character}
          </span>
        </div>
        
        {/* Pieces */}
        <div className="flex flex-wrap gap-1 mb-3">
          {item.pieces.map((piece, idx) => (
            <span key={idx} className="text-xs px-2 py-1 rounded-full" style={{
              backgroundColor: 'var(--background-secondary)'
            }}>
              {piece}
            </span>
          ))}
        </div>
        
        {/* Item Properties */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="opacity-60">🎨</span>
            <span className="opacity-70">Color: {item.color}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-60">✨</span>
            <span className="opacity-70">Style: {item.style}</span>
          </div>
          {item.scenes.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="opacity-60">🎬</span>
              <span className="opacity-70">Scenes: {item.scenes.join(', ')}</span>
            </div>
          )}
          {item.notes && (
            <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--background-secondary)' }}>
              <div className="opacity-60 mb-1">📝 Notes</div>
              <div className="opacity-80">{item.notes}</div>
            </div>
          )}
        </div>
        
        {/* Production Status */}
        <div className="mt-4 pt-4 border-t flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-xs opacity-60">Status</span>
          <span className="text-xs px-2 py-1 rounded-full bg-[#10B981]/10 text-[#10B981]">
            Needed
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default PropsTab

