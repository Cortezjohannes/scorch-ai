'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PremiseEngine } from '@/services/premise-engine'
import { Character3DEngine, Character3D } from '@/services/character-engine'

export function Character3DDemo() {
  const [characters, setCharacters] = useState<Character3D[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<Character3D | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateCharactersDemo = async () => {
    setIsGenerating(true)
    
    // Use premise from demo
    const premise = PremiseEngine.generatePremise(
      'truth',
      'A journalist discovers corruption in their hometown and must decide whether to expose the truth despite personal consequences.'
    )
    const premiseEquation = PremiseEngine.expandToEquation(premise, 'journalist corruption story')
    
    // Generate 3D characters
    const protagonist = Character3DEngine.generateProtagonist(premise, premiseEquation, 'journalist corruption story')
    const antagonist = Character3DEngine.generateAntagonist(premise, premiseEquation, protagonist)
    const catalyst = Character3DEngine.generateSupportingCharacter('catalyst', premise, [protagonist, antagonist], ['truth catalyst'])
    
    setCharacters([protagonist, antagonist, catalyst])
    setSelectedCharacter(protagonist)
    setIsGenerating(false)
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 mb-8">
      <h3 className="text-xl font-bold text-[#e2c376] mb-4">👥 3D Character Engine Demo</h3>
      <p className="text-[#e7e7e7]/70 mb-6">
        Experience how the new 3D character system creates psychologically complex characters with full personalities, wants vs needs, and premise-driven roles.
      </p>
      
      <button
        onClick={generateCharactersDemo}
        disabled={isGenerating}
        className="bg-[#e2c376] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#d4b46a] transition-colors mb-6 disabled:opacity-50"
      >
        {isGenerating ? 'Generating 3D Characters...' : 'Generate 3D Characters'}
      </button>

      {characters.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Character List */}
          <div>
            <h4 className="text-[#e2c376] font-bold mb-4">Generated Characters</h4>
            <div className="space-y-3">
              {characters.map((character, index) => (
                <motion.div
                  key={index}
                  onClick={() => setSelectedCharacter(character)}
                  className={`bg-[#2a2a2a] rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedCharacter?.name === character.name ? 'border-2 border-[#e2c376]' : 'hover:bg-[#36393f]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h5 className="font-bold text-white mb-2">{character.name}</h5>
                  <p className="text-sm text-[#e7e7e7]/70 mb-1">
                    <strong>Role:</strong> {character.premiseRole}
                  </p>
                  <p className="text-sm text-[#e7e7e7]/70">
                    <strong>Core Value:</strong> {character.psychology.coreValue}
                  </p>
                  <p className="text-xs text-[#e2c376] mt-2">{character.premiseFunction}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Character Detail */}
          {selectedCharacter && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h4 className="text-[#e2c376] font-bold mb-3">👤 {selectedCharacter.name}</h4>
                
                {/* Physiology */}
                <div className="mb-4">
                  <h5 className="text-white font-semibold mb-2">🏃 Physiology</h5>
                  <div className="text-sm text-[#e7e7e7]/90 space-y-1">
                    <p><strong>Age:</strong> {selectedCharacter.physiology.age}</p>
                    <p><strong>Appearance:</strong> {selectedCharacter.physiology.appearance}</p>
                    <p><strong>Build:</strong> {selectedCharacter.physiology.build}</p>
                    <p><strong>Health:</strong> {selectedCharacter.physiology.health}</p>
                  </div>
                </div>

                {/* Sociology */}
                <div className="mb-4">
                  <h5 className="text-white font-semibold mb-2">🏛️ Sociology</h5>
                  <div className="text-sm text-[#e7e7e7]/90 space-y-1">
                    <p><strong>Class:</strong> {selectedCharacter.sociology.class}</p>
                    <p><strong>Occupation:</strong> {selectedCharacter.sociology.occupation}</p>
                    <p><strong>Education:</strong> {selectedCharacter.sociology.education}</p>
                    <p><strong>Economic Status:</strong> {selectedCharacter.sociology.economicStatus}</p>
                  </div>
                </div>

                {/* Psychology */}
                <div className="mb-4">
                  <h5 className="text-white font-semibold mb-2">🧠 Psychology</h5>
                  <div className="text-sm text-[#e7e7e7]/90 space-y-2">
                    <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-green-400">
                      <p><strong>Core Value:</strong> {selectedCharacter.psychology.coreValue}</p>
                      <p><strong>Moral Standpoint:</strong> {selectedCharacter.psychology.moralStandpoint}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#1a1a1a] rounded-lg p-3">
                        <p className="text-xs text-blue-400 font-bold">WANT (External Goal)</p>
                        <p className="text-sm">{selectedCharacter.psychology.want}</p>
                      </div>
                      <div className="bg-[#1a1a1a] rounded-lg p-3">
                        <p className="text-xs text-purple-400 font-bold">NEED (Internal Lesson)</p>
                        <p className="text-sm">{selectedCharacter.psychology.need}</p>
                      </div>
                    </div>
                    
                    <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-red-400">
                      <p><strong>Primary Flaw:</strong> {selectedCharacter.psychology.primaryFlaw}</p>
                      <p className="text-xs mt-1 text-[#e7e7e7]/60">*This flaw creates obstacles until they learn their need</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <p><strong>Temperament:</strong> {selectedCharacter.psychology.temperament.join(', ')}</p>
                      <p><strong>Attitude:</strong> {selectedCharacter.psychology.attitude}</p>
                      <p><strong>Top Fear:</strong> {selectedCharacter.psychology.fears[0]}</p>
                      <p><strong>IQ:</strong> {selectedCharacter.psychology.iq}</p>
                    </div>
                  </div>
                </div>

                {/* Speech Pattern */}
                <div className="mb-4">
                  <h5 className="text-white font-semibold mb-2">🗣️ Speech Pattern</h5>
                  <div className="text-sm text-[#e7e7e7]/90">
                    <p><strong>Vocabulary:</strong> {selectedCharacter.speechPattern.vocabulary}</p>
                    <p><strong>Rhythm:</strong> {selectedCharacter.speechPattern.rhythm}</p>
                    <p><strong>Voice Notes:</strong> {selectedCharacter.speechPattern.voiceNotes}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {characters.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-[#e2c376]/20 to-[#c4a75f]/20 rounded-lg p-4 border border-[#e2c376]/50">
          <h4 className="text-[#e2c376] font-bold mb-3">🚀 3D Character Revolution</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-white font-semibold mb-2">Before (Old System):</h5>
              <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                <li>❌ Basic archetype labels</li>
                <li>❌ Simple personality traits</li>
                <li>❌ No psychological depth</li>
                <li>❌ Generic motivations</li>
                <li>❌ Random character goals</li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-2">After (3D System):</h5>
              <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                <li>✅ Full 3D psychological profiles</li>
                <li>✅ Want vs Need character arcs</li>
                <li>✅ Premise-driven design</li>
                <li>✅ Flaw-based obstacles</li>
                <li>✅ Complex character relationships</li>
                <li>✅ Distinctive speech patterns</li>
                <li>✅ Living narrative evolution</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-[#1a1a1a] rounded-lg">
            <p className="text-sm text-[#e7e7e7]/90">
              <strong>Character Arc Engine:</strong> Each character pursues their WANT (external goal) but the story forces them 
              to confront their NEED (internal lesson). Their PRIMARY FLAW creates obstacles until they grow, proving the premise.
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 