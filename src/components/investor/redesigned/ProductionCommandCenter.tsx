'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import type { ProductionSection, CharacterProfile } from '@/types/investor-materials'

interface ProductionCommandCenterProps {
  production: ProductionSection
  characters?: CharacterProfile[]
}

type ViewMode = 'dashboard' | 'whiteboard'

export default function ProductionCommandCenter({ production, characters = [] }: ProductionCommandCenterProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [selectedTab, setSelectedTab] = useState<string>('budget')
  const [budgetScenario, setBudgetScenario] = useState<'base' | 'recommended' | 'full'>('recommended')
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  // Animated counters
  const [animatedValues, setAnimatedValues] = useState({
    totalBudget: 0,
    locationsCount: 0,
    equipmentCount: 0,
    castingCount: 0
  })

  useEffect(() => {
    // Animate counters on mount
    const targetValues = {
      totalBudget: production.budget?.arcTotal?.total ?? 0,
      locationsCount: production.locations?.length ?? 0,
      equipmentCount: production.equipment?.totalItems ?? 0,
      castingCount: production.casting?.characters?.length ?? 0
    }

    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps

      setAnimatedValues({
        totalBudget: Math.round(targetValues.totalBudget * progress),
        locationsCount: Math.round(targetValues.locationsCount * progress),
        equipmentCount: Math.round(targetValues.equipmentCount * progress),
        castingCount: Math.round(targetValues.castingCount * progress)
      })

      if (step >= steps) {
        clearInterval(timer)
        setAnimatedValues(targetValues)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [production])

  const getBudgetForScenario = (scenario: 'base' | 'recommended' | 'full') => {
    if (!production.budget) return { total: 0, breakdown: {} }

    switch (scenario) {
      case 'base':
        return {
          total: production.budget.baseBudget?.total ?? 0,
          breakdown: production.budget.baseBudget ?? {}
        }
      case 'recommended':
        return {
          total: (production.budget.baseBudget?.total ?? 0) + (production.budget.optionalBudget?.reduce((sum, item) =>
            item.necessity === 'Highly Recommended' && item.included ? sum + item.suggestedCost : sum, 0) ?? 0),
          breakdown: production.budget.optionalBudget?.filter(item => item.necessity === 'Highly Recommended' && item.included) ?? []
        }
      case 'full':
        return {
          total: production.budget.arcTotal?.total ?? 0,
          breakdown: production.budget.optionalBudget ?? []
        }
      default:
        return { total: 0, breakdown: {} }
    }
  }

  const renderDashboardView = () => {
    const currentBudget = getBudgetForScenario(budgetScenario)

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#121212] to-[#0A0A0A] text-white p-8">
        {/* HUD-style header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#10B981]/10 to-transparent blur-xl" />
          <div className="relative text-center py-6">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-wider">
              MISSION CONTROL
            </h1>
            <p className="text-[#10B981] text-lg font-mono">
              PRODUCTION STATUS // REAL-TIME DATA
            </p>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'TOTAL BUDGET', value: `$${animatedValues.totalBudget.toLocaleString()}`, icon: '💰', color: 'text-green-400' },
            { label: 'LOCATIONS', value: animatedValues.locationsCount.toString(), icon: '📍', color: 'text-blue-400' },
            { label: 'EQUIPMENT', value: animatedValues.equipmentCount.toString(), icon: '🎥', color: 'text-purple-400' },
            { label: 'CASTING', value: animatedValues.castingCount.toString(), icon: '🎭', color: 'text-orange-400' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, type: 'spring' }}
              className="bg-[#1A1A1A] border border-[#10B981]/20 rounded-lg p-6 text-center relative overflow-hidden"
            >
              {/* Glowing border */}
              <div className="absolute inset-0 border border-[#10B981]/10 rounded-lg animate-pulse" />

              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className={`text-2xl font-mono font-bold mb-1 ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-white/60 uppercase tracking-wider">
                {stat.label}
              </div>

              {/* Animated background particles */}
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-[#10B981]/30 rounded-full"
                    initial={{
                      x: Math.random() * 100 + '%',
                      y: '100%',
                      opacity: 0
                    }}
                    animate={{
                      y: '-10%',
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 3,
                      delay: Math.random() * 2,
                      repeat: Infinity,
                      ease: 'easeOut'
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Control Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Budget Control Panel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#1A1A1A] border border-[#10B981]/20 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-[#10B981] mb-4 flex items-center">
              <span className="mr-2">💰</span> BUDGET CONTROL
            </h3>

            {/* Scenario selector */}
            <div className="space-y-3 mb-6">
              {[
                { id: 'base', label: 'Base Budget', color: 'bg-gray-600' },
                { id: 'recommended', label: 'Recommended', color: 'bg-[#10B981]' },
                { id: 'full', label: 'Full Production', color: 'bg-orange-500' }
              ].map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setBudgetScenario(scenario.id as any)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    budgetScenario === scenario.id
                      ? `${scenario.color} text-white`
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{scenario.label}</span>
                    <span className="text-sm">
                      ${getBudgetForScenario(scenario.id as any).total.toLocaleString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Budget breakdown visualization */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                Breakdown
              </h4>
              <div className="space-y-2">
                {Object.entries(currentBudget.breakdown).map(([key, value]: [string, any]) => {
                  if (typeof value !== 'number' || value === 0) return null
                  return (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-white/60 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-[#10B981] font-mono">${value.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Locations Map */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-[#1A1A1A] border border-[#10B981]/20 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-[#10B981] mb-4 flex items-center">
              <span className="mr-2">📍</span> LOCATIONS
            </h3>

            <div className="aspect-square bg-[#0A0A0A] rounded-lg mb-4 relative overflow-hidden">
              {/* Mock map background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-green-900/20">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
                                  radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)`,
                }} />
              </div>

              {/* Location pins */}
              {production.locations?.slice(0, 5).map((location, idx) => (
                <motion.div
                  key={location.name}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 + 0.5 }}
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${20 + (idx * 15)}%`,
                    top: `${20 + (idx * 12)}%`
                  }}
                >
                  <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg group-hover:scale-125 transition-transform" />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {location.name} - ${location.cost.toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center text-sm text-white/60">
              {production.locations?.length || 0} locations mapped
            </div>
          </motion.div>

          {/* Casting Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-[#1A1A1A] border border-[#10B981]/20 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-[#10B981] mb-4 flex items-center">
              <span className="mr-2">🎭</span> CASTING
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {production.casting?.characters?.slice(0, 6).map((castMember, idx) => (
                <motion.div
                  key={castMember.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 + 0.5 }}
                  className="bg-[#121212] rounded-lg p-3 text-center cursor-pointer hover:bg-[#10B981]/10 transition-colors group"
                >
                  <div className="w-8 h-8 bg-[#10B981]/20 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2 group-hover:bg-[#10B981]/40 transition-colors">
                    {castMember.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-xs text-white/80 font-semibold truncate">
                    {castMember.name}
                  </div>
                  <div className="text-xs text-[#10B981] truncate">
                    {castMember.ageRange}
                  </div>
                </motion.div>
              ))}
            </div>

            {production.casting?.characters && production.casting.characters.length > 6 && (
              <div className="text-center mt-4 text-sm text-white/60">
                +{production.casting.characters.length - 6} more
              </div>
            )}
          </motion.div>
        </div>

        {/* Equipment Status */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-8 bg-[#1A1A1A] border border-[#10B981]/20 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-[#10B981] mb-6 flex items-center">
            <span className="mr-2">🎥</span> EQUIPMENT STATUS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {production.equipment?.items?.slice(0, 8).map((item, idx) => (
              <motion.div
                key={item.item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 + 0.5 }}
                className="flex items-center space-x-3 bg-[#121212] p-3 rounded-lg"
              >
                <div className={`w-3 h-3 rounded-full ${item.included ? 'bg-green-500' : 'bg-gray-500'}`} />
                <div className="flex-1">
                  <div className="text-sm text-white font-semibold truncate">{item.item}</div>
                  <div className="text-xs text-white/60">${item.suggestedCost.toLocaleString()}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  const renderWhiteboardView = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-8">
        {/* Cork board background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D2691E' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-black text-amber-900 mb-2 tracking-wider">
              PRODUCTION BOARD
            </h1>
            <p className="text-amber-700 text-lg">
              📌 Pinned Notes • 📝 Schedules • 📷 Photos
            </p>
          </div>

          {/* Pinned Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Budget Note */}
            <motion.div
              initial={{ opacity: 0, rotate: -5, y: 20 }}
              animate={{ opacity: 1, rotate: 0, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative bg-yellow-200 border-2 border-yellow-400 rounded-lg p-6 shadow-lg transform rotate-1 hover:rotate-0 transition-transform cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                boxShadow: '5px 5px 15px rgba(0,0,0,0.2)'
              }}
            >
              {/* Pin */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full border-2 border-red-600 shadow-lg" />

              <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                💰 BUDGET BREAKDOWN
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-amber-800">Base:</span>
                  <span className="font-bold text-amber-900">
                    ${production.budget?.baseBudget?.total?.toLocaleString() ?? '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-800">Optional:</span>
                  <span className="font-bold text-amber-900">
                    ${production.budget?.optionalBudget?.reduce((sum, item) => sum + item.suggestedCost, 0)?.toLocaleString() ?? '0'}
                  </span>
                </div>
                <div className="border-t border-amber-400 pt-2 flex justify-between font-bold">
                  <span className="text-amber-900">TOTAL:</span>
                  <span className="text-amber-900">
                    ${production.budget?.arcTotal?.total?.toLocaleString() ?? '0'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Locations Note */}
            <motion.div
              initial={{ opacity: 0, rotate: 3, y: 20 }}
              animate={{ opacity: 1, rotate: 0, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative bg-blue-200 border-2 border-blue-400 rounded-lg p-6 shadow-lg transform -rotate-1 hover:rotate-0 transition-transform cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%)',
                boxShadow: '5px 5px 15px rgba(0,0,0,0.2)'
              }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full border-2 border-red-600 shadow-lg" />

              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                📍 SHOOT LOCATIONS
              </h3>
              <div className="space-y-2">
                {production.locations?.slice(0, 4).map((location, idx) => (
                  <div key={location.name} className="flex items-center justify-between text-sm">
                    <span className="text-blue-800 truncate mr-2">{location.name}</span>
                    <span className="text-blue-900 font-semibold">
                      ${location.cost.toLocaleString()}
                    </span>
                  </div>
                ))}
                {production.locations && production.locations.length > 4 && (
                  <div className="text-blue-700 text-sm font-semibold">
                    +{production.locations.length - 4} more...
                  </div>
                )}
              </div>
            </motion.div>

            {/* Casting Note */}
            <motion.div
              initial={{ opacity: 0, rotate: -3, y: 20 }}
              animate={{ opacity: 1, rotate: 0, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative bg-pink-200 border-2 border-pink-400 rounded-lg p-6 shadow-lg transform rotate-2 hover:rotate-0 transition-transform cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)',
                boxShadow: '5px 5px 15px rgba(0,0,0,0.2)'
              }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full border-2 border-red-600 shadow-lg" />

              <h3 className="text-lg font-bold text-pink-900 mb-3 flex items-center">
                🎭 CASTING CALL
              </h3>
              <div className="space-y-2">
                {production.casting?.characters?.slice(0, 3).map((cast, idx) => (
                  <div key={cast.name} className="text-sm">
                    <div className="text-pink-900 font-semibold">{cast.name}</div>
                    <div className="text-pink-700 text-xs">{cast.ageRange} • {cast.actorType}</div>
                  </div>
                ))}
                {production.casting?.characters && production.casting.characters.length > 3 && (
                  <div className="text-pink-700 text-sm font-semibold">
                    +{production.casting.characters.length - 3} more roles...
                  </div>
                )}
              </div>
            </motion.div>

            {/* Equipment Checklist */}
            <motion.div
              initial={{ opacity: 0, rotate: 2, y: 20 }}
              animate={{ opacity: 1, rotate: 0, y: 0 }}
              transition={{ delay: 0.8 }}
              className="relative bg-green-200 border-2 border-green-400 rounded-lg p-6 shadow-lg transform -rotate-1 hover:rotate-0 transition-transform cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
                boxShadow: '5px 5px 15px rgba(0,0,0,0.2)'
              }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full border-2 border-red-600 shadow-lg" />

              <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center">
                ✅ EQUIPMENT CHECKLIST
              </h3>
              <div className="space-y-2">
                {production.equipment?.items?.slice(0, 5).map((item, idx) => (
                  <div key={item.item} className="flex items-center space-x-2 text-sm">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center text-xs ${
                      item.included ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400'
                    }`}>
                      {item.included ? '✓' : ''}
                    </div>
                    <span className={item.included ? 'text-green-900 line-through' : 'text-green-800'}>
                      {item.item}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Schedule Photo */}
            <motion.div
              initial={{ opacity: 0, rotate: -2, y: 20 }}
              animate={{ opacity: 1, rotate: 0, y: 0 }}
              transition={{ delay: 1.0 }}
              className="relative bg-white border-2 border-gray-400 rounded-lg p-4 shadow-lg transform rotate-1 hover:rotate-0 transition-transform cursor-pointer"
              style={{
                boxShadow: '5px 5px 15px rgba(0,0,0,0.2)'
              }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full border-2 border-red-600 shadow-lg" />

              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl mx-auto mb-3">
                  📅
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">SHOOT SCHEDULE</h3>
                <p className="text-gray-700 text-sm">
                  8 episodes • 12 weeks • Pre-production ready
                </p>
              </div>
            </motion.div>

            {/* Call Sheet */}
            <motion.div
              initial={{ opacity: 0, rotate: 1, y: 20 }}
              animate={{ opacity: 1, rotate: 0, y: 0 }}
              transition={{ delay: 1.2 }}
              className="relative bg-red-200 border-2 border-red-400 rounded-lg p-6 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%)',
                boxShadow: '5px 5px 15px rgba(0,0,0,0.2)'
              }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full border-2 border-red-600 shadow-lg" />

              <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center">
                🚨 CALL SHEET
              </h3>
              <div className="space-y-2 text-sm">
                <div className="bg-white/50 rounded p-2">
                  <div className="text-red-900 font-semibold">Day 1: Pilot Shoot</div>
                  <div className="text-red-700">Location: Downtown • 6:00 AM Call</div>
                </div>
                <div className="text-red-700">
                  Cast: {production.casting?.characters?.slice(0, 3).map(c => c.name.split(' ')[0]).join(', ')}
                  {production.casting?.characters && production.casting.characters.length > 3 && '...'}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Export Button */}
          <div className="text-center mt-12">
            <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-colors">
              📄 Export Production Package
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* View Mode Toggle */}
      <div className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-sm border-b border-[#10B981]/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                viewMode === 'dashboard' ? 'bg-[#10B981] text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🚀 Mission Control
            </button>
            <button
              onClick={() => setViewMode('whiteboard')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                viewMode === 'whiteboard' ? 'bg-[#10B981] text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📌 Production Board
            </button>
          </div>

          <div className="text-sm text-white/70">
            Real-time production data • Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderDashboardView()}
          </motion.div>
        ) : (
          <motion.div
            key="whiteboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderWhiteboardView()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}