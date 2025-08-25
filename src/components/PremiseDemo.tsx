'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PremiseEngine, StoryPremise, PremiseEquation } from '@/services/premise-engine'

export function PremiseDemo() {
  const [theme, setTheme] = useState('truth')
  const [synopsis, setSynopsis] = useState('A group of teenagers discover that their town harbors dark secrets and must decide whether to expose the truth despite the dangerous consequences.')
  const [premise, setPremise] = useState<StoryPremise | null>(null)
  const [equation, setEquation] = useState<PremiseEquation | null>(null)

  const generatePremiseDemo = () => {
    const generatedPremise = PremiseEngine.generatePremise(theme, synopsis)
    const generatedEquation = PremiseEngine.expandToEquation(generatedPremise, synopsis)
    const validation = PremiseEngine.validatePremise(generatedPremise)
    
    setPremise(generatedPremise)
    setEquation(generatedEquation)
    
    console.log('Generated Premise:', generatedPremise)
    console.log('Premise Equation:', generatedEquation)
    console.log('Validation:', validation)
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 mb-8">
      <h3 className="text-xl font-bold text-[#e2c376] mb-4">🎬 Premise Engine Demo</h3>
      <p className="text-[#e7e7e7]/70 mb-6">
        Experience how the new premise-driven story generation works. Every story element will now serve to prove a central argument.
      </p>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-[#e7e7e7] font-medium mb-2">Theme:</label>
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            className="w-full p-3 bg-[#2a2a2a] border border-[#36393f] rounded-lg text-[#e7e7e7]"
          >
            <option value="truth">Truth</option>
            <option value="love">Love</option>
            <option value="power">Power</option>
            <option value="redemption">Redemption</option>
            <option value="courage">Courage</option>
            <option value="justice">Justice</option>
          </select>
        </div>
        
        <div>
          <label className="block text-[#e7e7e7] font-medium mb-2">Synopsis:</label>
          <textarea 
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            className="w-full p-3 bg-[#2a2a2a] border border-[#36393f] rounded-lg text-[#e7e7e7]"
            rows={3}
          />
        </div>
        
        <button
          onClick={generatePremiseDemo}
          className="bg-[#e2c376] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#d4b46a] transition-colors"
        >
          Generate Premise Foundation
        </button>
      </div>

      {premise && equation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Core Premise */}
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <h4 className="text-[#e2c376] font-bold mb-3">📖 Core Premise (Egri's Equation)</h4>
            <div className="bg-[#1a1a1a] rounded-lg p-4 border-l-4 border-[#e2c376]">
              <p className="text-xl font-bold text-white mb-2">"{premise.premiseStatement}"</p>
              <p className="text-[#e7e7e7]/70">
                <strong>Character:</strong> {premise.character} + <strong>Conflict:</strong> {premise.conflict} → <strong>Resolution:</strong> {premise.resolution}
              </p>
            </div>
          </div>

          {/* Character Design */}
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <h4 className="text-[#e2c376] font-bold mb-3">👥 Character Design (Based on Premise)</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#1a1a1a] rounded-lg p-4">
                <h5 className="text-green-400 font-bold mb-2">✅ PROTAGONIST</h5>
                <p><strong>Core Value:</strong> {equation.protagonist.coreValue}</p>
                <p><strong>Related Flaw:</strong> {equation.protagonist.relatedFlaw}</p>
                <p><strong>Motivation:</strong> {equation.protagonist.motivation}</p>
                <p className="text-xs text-[#e7e7e7]/50 mt-2">*This character embodies the "winning" value</p>
              </div>
              
              <div className="bg-[#1a1a1a] rounded-lg p-4">
                <h5 className="text-red-400 font-bold mb-2">❌ ANTAGONIST</h5>
                <p><strong>Core Value:</strong> {equation.antagonist.coreValue}</p>
                <p><strong>Method:</strong> {equation.antagonist.method}</p>
                <p><strong>Motivation:</strong> {equation.antagonist.motivation}</p>
                <p className="text-xs text-[#e7e7e7]/50 mt-2">*This character embodies the "losing" value</p>
              </div>
            </div>
          </div>

          {/* Testing Scenarios */}
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <h4 className="text-[#e2c376] font-bold mb-3">⚔️ Premise Testing Scenarios</h4>
            <p className="text-[#e7e7e7]/70 mb-3">These scenarios MUST occur to prove the premise:</p>
            <ul className="space-y-2">
              {equation.conflictArena.testScenarios.map((scenario, index) => (
                <li key={index} className="bg-[#1a1a1a] rounded-lg p-3">
                  <span className="text-[#e2c376] font-bold">#{index + 1}:</span> {scenario}
                </li>
              ))}
            </ul>
          </div>

          {/* Expected Outcome */}
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <h4 className="text-[#e2c376] font-bold mb-3">🎯 Expected Outcome (Premise Proof)</h4>
            <div className="space-y-2">
              <p><strong>Protagonist Fate:</strong> {equation.expectedOutcome.protagonistFate}</p>
              <p><strong>Antagonist Fate:</strong> {equation.expectedOutcome.antagonistFate}</p>
              <p><strong>World Change:</strong> {equation.expectedOutcome.worldChange}</p>
              <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-green-400 mt-3">
                <p><strong>Premise Proof:</strong> {equation.expectedOutcome.premiseProof}</p>
              </div>
            </div>
          </div>

          {/* Revolutionary Change */}
          <div className="bg-gradient-to-r from-[#e2c376]/20 to-[#c4a75f]/20 rounded-lg p-4 border border-[#e2c376]/50">
            <h4 className="text-[#e2c376] font-bold mb-3">🚀 What This Changes</h4>
            <ul className="space-y-2 text-[#e7e7e7]/90">
              <li>✅ Every character serves a specific function in proving the premise</li>
              <li>✅ Every scene advances the logical argument of the story</li>
              <li>✅ User choices affect HOW the premise is proven, not WHETHER</li>
              <li>✅ No more random plot developments - everything serves the central argument</li>
              <li>✅ Characters have deep psychological profiles with wants vs needs</li>
              <li>✅ Living narrative with characters entering/leaving based on story needs</li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  )
} 