'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface StoryBiblePlaybookModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function StoryBiblePlaybookModal({ isOpen, onClose }: StoryBiblePlaybookModalProps) {
  const [activeSection, setActiveSection] = useState<'essential' | 'recommended' | 'optional' | 'tips'>('essential')

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#1a1a1a] border border-[#00FF99] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,255,153,0.3)]"
          >
            {/* Header */}
          <div className="bg-gradient-to-r from-[#00FF99]/20 to-transparent p-6 border-b border-[#00FF99]/30">
              <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[#00FF99] mb-2">
                  📖 The Story Bible Playbook
                </h2>
                <p className="text-white/70">
                  Your guide to understanding and using your AI-generated story bible
                </p>
                </div>
                <button
                  onClick={onClose}
                className="text-white/70 hover:text-white text-3xl transition-colors"
                >
                ×
                </button>
              </div>
            </div>

          {/* Navigation */}
          <div className="flex border-b border-[#00FF99]/20 bg-black/30">
            {[
              { id: 'essential', label: '⭐ Essential Reading', color: 'text-red-400' },
              { id: 'recommended', label: '✨ Strongly Recommended', color: 'text-yellow-400' },
              { id: 'optional', label: '📚 Optional (Advanced)', color: 'text-blue-400' },
              { id: 'tips', label: '💡 Pro Tips', color: 'text-[#00FF99]' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                  activeSection === section.id
                    ? `${section.color} border-b-2 border-current bg-white/5`
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

            {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeSection === 'essential' && (
              <div className="space-y-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                  <h3 className="text-2xl font-bold text-red-400 mb-3">
                    ⭐ MUST READ - Learn By Heart
                  </h3>
                  <p className="text-white/80 mb-4">
                    These sections form the foundation of your story. You should know them intimately before creating episodes.
                  </p>
                </div>

                {/* Section 1: Story Overview */}
                <div className="bg-[#2a2a2a] border border-[#00FF99]/20 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-[#00FF99] mb-3 flex items-center">
                    <span className="text-2xl mr-2">1️⃣</span>
                    Story Overview Tab
                  </h4>
                  <div className="space-y-3 text-white/90">
                    <p><strong className="text-[#00FF99]">Why Essential:</strong> This is your story's DNA. Everything flows from here.</p>
                    <p><strong className="text-[#00FF99]">What to Learn:</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                      <li><strong>Series Title</strong> - Know it by heart. This is your show's identity.</li>
                      <li><strong>Premise</strong> - The core argument your story makes. Every episode should test this.</li>
                      <li><strong>Theme</strong> - The emotional through-line. Reference this in every episode.</li>
                      <li><strong>Genre & Tone</strong> - Determines the vibe of every scene you write.</li>
                    </ul>
                    <div className="bg-black/50 p-4 rounded border border-[#00FF99]/10 mt-3">
                      <p className="text-sm text-white/70 italic">
                        💡 <strong>Action Item:</strong> Before creating Episode 1, write the premise from memory. 
                        If you can't, read it again until you can.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Main Characters */}
                <div className="bg-[#2a2a2a] border border-[#00FF99]/20 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-[#00FF99] mb-3 flex items-center">
                    <span className="text-2xl mr-2">2️⃣</span>
                    Main Characters Tab
                  </h4>
                  <div className="space-y-3 text-white/90">
                    <p><strong className="text-[#00FF99]">Why Essential:</strong> Characters drive your story. Know them like real people.</p>
                    <p><strong className="text-[#00FF99]">What to Learn:</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                      <li><strong>Names & Roles</strong> - Memorize the main cast (at least top 5)</li>
                      <li><strong>Core Motivations</strong> - What drives each character? This determines their choices.</li>
                      <li><strong>Character Arcs</strong> - How do they change across the series?</li>
                      <li><strong>Relationships</strong> - Who loves/hates/needs whom? This creates conflict.</li>
                      <li><strong>Voice & Mannerisms</strong> - How does each character speak/act uniquely?</li>
                    </ul>
                    <div className="bg-black/50 p-4 rounded border border-[#00FF99]/10 mt-3">
                      <p className="text-sm text-white/70 italic">
                        💡 <strong>Action Item:</strong> Create a cheat sheet with the top 5 characters' names, 
                        roles, and one-sentence motivations. Keep it visible while writing.
                      </p>
                  </div>
                </div>
              </div>

                {/* Section 3: Narrative Arcs */}
                <div className="bg-[#2a2a2a] border border-[#00FF99]/20 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-[#00FF99] mb-3 flex items-center">
                    <span className="text-2xl mr-2">3️⃣</span>
                    Narrative Arcs Tab
                  </h4>
                  <div className="space-y-3 text-white/90">
                    <p><strong className="text-[#00FF99]">Why Essential:</strong> Your roadmap. Know where you're going.</p>
                    <p><strong className="text-[#00FF99]">What to Learn:</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                      <li><strong>Arc Structure</strong> - How many arcs? What's the purpose of each?</li>
                      <li><strong>Episode Distribution</strong> - Which episodes belong to which arc?</li>
                      <li><strong>Arc Progression</strong> - How does tension build across arcs?</li>
                      <li><strong>Key Milestones</strong> - What major events define each arc?</li>
                    </ul>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded mt-3">
                      <p className="text-sm text-yellow-200">
                        📝 <strong>Note:</strong> Arc suggestions are AI-generated starting points. You can modify them 
                        as you create episodes. They're meant to guide, not restrict you.
                      </p>
                    </div>
                  </div>
                  </div>
                  
                {/* AI Imperfection Warning */}
                <div className="bg-orange-500/10 border-2 border-orange-500/50 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-orange-400 mb-3 flex items-center">
                    <span className="text-2xl mr-2">⚠️</span>
                    Important: AI Is Not Perfect!
                  </h4>
                  <div className="space-y-3 text-white/90">
                    <p>
                      The AI generated this story bible based on your prompt, but <strong>it's not infallible</strong>. 
                      You might notice:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                      <li>Character names that feel generic or don't fit</li>
                      <li>Episode titles that could be more compelling</li>
                      <li>A series title that doesn't capture your vision</li>
                      <li>Character descriptions that need tweaking</li>
                      <li>Story directions that don't quite match what you imagined</li>
                    </ul>
                    <div className="bg-black/50 p-4 rounded border border-orange-500/30 mt-4">
                      <p className="text-[#00FF99] font-bold mb-2">✏️ You Can Edit Everything!</p>
                      <p className="text-sm text-white/80">
                        Click the <span className="text-[#00FF99]">✏️ Edit</span> button next to any name, title, 
                        or description. Change it to match your vision. The AI gave you a starting point - 
                        <strong> make it yours!</strong>
                            </p>
                          </div>
                    <div className="bg-black/50 p-4 rounded border border-orange-500/30 mt-3">
                      <p className="text-red-400 font-bold mb-2">🔄 Not Happy? Regenerate!</p>
                      <p className="text-sm text-white/80">
                        See the regeneration tips in the <strong>Pro Tips</strong> tab for how to get better results.
                      </p>
                          </div>
                        </div>
                      </div>
                    </div>
            )}

            {activeSection === 'recommended' && (
              <div className="space-y-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                  <h3 className="text-2xl font-bold text-yellow-400 mb-3">
                    ✨ Strongly Recommended Reading
                  </h3>
                  <p className="text-white/80 mb-4">
                    These sections add depth and richness. Read them before creating your first few episodes.
                  </p>
                        </div>

                {/* World Building */}
                <div className="bg-[#2a2a2a] border border-[#00FF99]/20 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-[#00FF99] mb-3">
                    🌍 World Building Tab
                  </h4>
                  <div className="space-y-3 text-white/90">
                    <p><strong>Why Important:</strong> Makes your world feel real and consistent.</p>
                    <p><strong>What to Focus On:</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                      <li><strong>Primary Settings</strong> - Where do scenes take place?</li>
                      <li><strong>World Rules</strong> - What's possible/impossible in this world?</li>
                      <li><strong>Cultural Context</strong> - Social norms, power structures</li>
                    </ul>
                    <p className="text-sm text-white/70 italic mt-3">
                      💡 Reference this when describing new locations or when characters interact with the environment.
                    </p>
                      </div>
                    </div>

                {/* Branching Paths */}
                <div className="bg-[#2a2a2a] border border-[#00FF99]/20 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-[#00FF99] mb-3">
                    🔀 Branching Paths Tab
                  </h4>
                  <div className="space-y-3 text-white/90">
                    <p><strong>Why Important:</strong> Your story is interactive. Understanding potential branches helps you create meaningful choices.</p>
                    <p><strong>What to Focus On:</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                      <li><strong>Major Decision Points</strong> - Where can viewers shape the story?</li>
                      <li><strong>Consequences</strong> - How do choices ripple through future episodes?</li>
                      <li><strong>Alternative Paths</strong> - What different directions could the story take?</li>
                    </ul>
                    <p className="text-sm text-white/70 italic mt-3">
                      💡 Review this when creating branching options at the end of each episode.
                    </p>
                  </div>
                </div>

                {/* Genre Elements */}
                <div className="bg-[#2a2a2a] border border-[#00FF99]/20 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-[#00FF99] mb-3">
                    🎭 Genre Elements Tab
                  </h4>
                  <div className="space-y-3 text-white/90">
                    <p><strong>Why Important:</strong> Ensures your story delivers on genre expectations while being unique.</p>
                    <p><strong>What to Focus On:</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                      <li><strong>Genre Conventions</strong> - What do viewers expect?</li>
                      <li><strong>Subversions</strong> - How do you surprise within the genre?</li>
                      <li><strong>Tone Consistency</strong> - Maintaining the right vibe</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'optional' && (
              <div className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                  <h3 className="text-2xl font-bold text-blue-400 mb-3">
                    📚 Optional Reading (Advanced Users)
                  </h3>
                  <p className="text-white/80 mb-4">
                    These technical tabs provide deeper insights. Useful for refining your craft.
                      </p>
                    </div>

                {/* Tension System */}
                <div className="bg-[#2a2a2a] border border-[#00FF99]/20 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-[#00FF99] mb-3">
                    ⚡ Tension System Tab
                      </h4>
                  <p className="text-white/80">
                    Technical breakdown of how tension builds across your series. Useful for understanding pacing, 
                    but not necessary for day-to-day writing.
                      </p>
                    </div>

                {/* Character Dynamics */}
                <div className="bg-[#2a2a2a] border border-[#00FF99]/20 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-[#00FF99] mb-3">
                    💫 Character Dynamics Tab
                      </h4>
                  <p className="text-white/80">
                    Deep dive into relationship networks and power dynamics. Great for understanding subtext, 
                    but the main Characters tab covers the essentials.
                      </p>
                    </div>

                {/* Tropes & Conventions */}
                <div className="bg-[#2a2a2a] border border-[#00FF99]/20 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-[#00FF99] mb-3">
                    🎪 Tropes & Conventions Tab
                      </h4>
                  <p className="text-white/80">
                    Analysis of narrative tropes in your story. Interesting for craft development, 
                    but not critical for episode creation.
                      </p>
                    </div>

                {/* Cohesion Analysis */}
                <div className="bg-[#2a2a2a] border border-[#00FF99]/20 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-[#00FF99] mb-3">
                    🔗 Cohesion Analysis Tab
                      </h4>
                  <p className="text-white/80">
                    Technical analysis of how story elements connect. Useful for troubleshooting consistency issues.
                      </p>
                    </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-200">
                    💡 <strong>When to Read These:</strong> After you've created 3-5 episodes and want to deepen 
                    your understanding of the story's structure.
                      </p>
                    </div>
                  </div>
            )}

            {activeSection === 'tips' && (
              <div className="space-y-6">
                <div className="bg-[#00FF99]/10 border border-[#00FF99] rounded-lg p-6">
                  <h3 className="text-2xl font-bold text-[#00FF99] mb-3">
                    💡 Pro Tips for Story Bible Success
                  </h3>
                </div>

                {/* Tip 1: Regeneration */}
                <div className="bg-[#2a2a2a] border-l-4 border-[#00FF99] rounded-lg p-6">
                  <h4 className="text-xl font-bold text-[#00FF99] mb-3">
                    🔄 Not Feeling It? Regenerate! (But Be Strategic)
                  </h4>
                  <div className="space-y-3 text-white/90">
                    <p>
                      If your story bible feels generic, uninspired, or just doesn't match your vision, 
                      you can regenerate it.
                    </p>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded">
                      <p className="font-bold text-yellow-400 mb-2">⚠️ Regeneration Limit: 5 Attempts</p>
                      <p className="text-sm text-white/80">
                        We limit regenerations to 5 attempts because AI generation is expensive. 
                        Use them wisely! Each regeneration costs us money, so make each attempt count.
                      </p>
                    </div>
                    <p className="font-bold text-[#00FF99] mt-4">How to Get Better Results:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                      <li><strong>Improve Your Prompt:</strong> Be more specific about tone, setting, character types</li>
                      <li><strong>Add Details:</strong> Instead of "a detective story," try "a noir detective story set in 1940s Chicago with supernatural elements"</li>
                      <li><strong>Specify What You Don't Want:</strong> "Avoid clichés like chosen one narratives"</li>
                      <li><strong>Use Better Keywords:</strong> "Character-driven" vs "plot-driven," "dark comedy" vs "slapstick"</li>
                    </ul>
                    <div className="bg-[#00FF99]/10 border border-[#00FF99]/30 p-4 rounded mt-4">
                      <p className="font-bold text-[#00FF99] mb-2">💎 Pro Move: Edit Instead of Regenerate</p>
                      <p className="text-sm text-white/80">
                        Often it's faster to <strong>edit specific parts</strong> rather than regenerate everything. 
                        Use the edit buttons to tweak names, descriptions, or directions. Save your regenerations 
                        for when the whole thing needs to be rethought.
                      </p>
                    </div>
                  </div>
                    </div>

                {/* Tip 2: Editing */}
                <div className="bg-[#2a2a2a] border-l-4 border-[#00FF99] rounded-lg p-6">
                  <h4 className="text-xl font-bold text-[#00FF99] mb-3">
                    ✏️ Edit Liberally - Make It Yours!
                  </h4>
                  <div className="space-y-3 text-white/90">
                    <p>
                      The AI is a starting point, not gospel. <strong>Change anything that doesn't feel right.</strong>
                    </p>
                    <p className="font-bold text-[#00FF99]">Common Edits:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                      <li><strong>Character Names:</strong> Generic "John Smith"? Change it to something memorable.</li>
                      <li><strong>Series Title:</strong> Doesn't grab you? Brainstorm alternatives.</li>
                      <li><strong>Episode Titles:</strong> Too vague? Make them more specific and intriguing.</li>
                      <li><strong>Character Descriptions:</strong> Add personality, quirks, specific details.</li>
                      <li><strong>Arc Directions:</strong> The AI suggests a path, but you choose the actual story.</li>
                      </ul>
                    <div className="bg-black/50 p-4 rounded border border-[#00FF99]/10 mt-3">
                      <p className="text-sm text-white/80">
                        <strong>Remember:</strong> You're the creator. The AI is your assistant, not your boss. 
                        Trust your instincts - if something feels off, it probably is. Change it!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tip 3: Arc Flexibility */}
                <div className="bg-[#2a2a2a] border-l-4 border-[#00FF99] rounded-lg p-6">
                  <h4 className="text-xl font-bold text-[#00FF99] mb-3">
                    🎯 Arc Suggestions Are Guidelines, Not Rules
                  </h4>
                  <div className="space-y-3 text-white/90">
                    <p>
                      The narrative arcs tab shows AI-suggested story directions for each arc. 
                      These are <strong>starting points</strong>, not mandatory paths.
                    </p>
                    <p className="font-bold text-[#00FF99]">How to Use Arc Suggestions:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                      <li><strong>First Episode:</strong> Follow the suggested direction to see where it goes</li>
                      <li><strong>As You Write:</strong> Let the story evolve naturally based on character choices</li>
                      <li><strong>Viewer Choices:</strong> Branching paths will take you off the suggested route - that's good!</li>
                      <li><strong>Course Correct:</strong> If you drift too far, reference the suggestions to get back on track</li>
                    </ul>
                    <p className="text-sm text-white/70 italic mt-3">
                      💡 Think of arc suggestions like a GPS: helpful for navigation, but you can take detours 
                      when something interesting appears.
                    </p>
                  </div>
                </div>

                {/* Tip 4: Reference Workflow */}
                <div className="bg-[#2a2a2a] border-l-4 border-[#00FF99] rounded-lg p-6">
                  <h4 className="text-xl font-bold text-[#00FF99] mb-3">
                    📋 Suggested Reference Workflow
                  </h4>
                  <div className="space-y-3 text-white/90">
                    <p className="font-bold text-[#00FF99]">Before Creating Episode 1:</p>
                    <ol className="list-decimal list-inside space-y-2 ml-4 text-white/80">
                      <li>Read <strong>Story Overview</strong> tab thoroughly</li>
                      <li>Review all <strong>Main Characters</strong></li>
                      <li>Check which arc Episode 1 belongs to in <strong>Narrative Arcs</strong></li>
                      <li>Skim <strong>World Building</strong> for setting details</li>
                      <li>Keep the story bible open while writing</li>
                    </ol>
                    <p className="font-bold text-[#00FF99] mt-4">While Creating Episodes:</p>
                    <ol className="list-decimal list-inside space-y-2 ml-4 text-white/80">
                      <li>Reference <strong>Character</strong> tab for motivations and voice</li>
                      <li>Check <strong>Narrative Arcs</strong> for current arc's direction</li>
                      <li>Review <strong>Branching Paths</strong> when creating choices</li>
                      <li>Quick reference <strong>World Building</strong> for location details</li>
                    </ol>
                    <p className="font-bold text-[#00FF99] mt-4">After 5-10 Episodes:</p>
                    <ol className="list-decimal list-inside space-y-2 ml-4 text-white/80">
                      <li>Review technical tabs (<strong>Tension, Dynamics, Tropes</strong>) for deeper insights</li>
                      <li>Check <strong>Cohesion Analysis</strong> if something feels off</li>
                      <li>Consider editing character arcs based on how the story has evolved</li>
                    </ol>
                  </div>
                </div>

                {/* Tip 5: Save Your Work */}
                <div className="bg-[#2a2a2a] border-l-4 border-red-500 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-red-400 mb-3">
                    💾 Always Save Your Edits!
                  </h4>
                  <div className="space-y-3 text-white/90">
                    <p>
                      After making edits to names, titles, or descriptions, make sure to save your changes. 
                      Your edits are automatically saved to your browser, but:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                      <li>Don't clear your browser data without backing up</li>
                      <li>Consider taking notes of major changes</li>
                      <li>If you regenerate the entire story bible, your edits will be lost</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#00FF99]/20 p-4 bg-black/30 flex justify-between items-center">
            <div className="text-sm text-white/60">
              💡 Tip: Keep this playbook handy while creating your first few episodes
            </div>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-[#00FF99] to-[#00CC7A] text-black px-6 py-2 rounded-lg font-semibold hover:shadow-[0_0_20px_rgba(0,255,153,0.5)] transition-all"
            >
              Got It!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}








