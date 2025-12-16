'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface PitchPlaybookModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PitchPlaybookModal({ isOpen, onClose }: PitchPlaybookModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#333] p-6 z-10">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-inter)]">
                  The Pitch Playbook: Defining Your Show's DNA
                </h1>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#2a2a2a]"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-8">
              {/* Intro */}
              <div className="space-y-4">
                <p className="text-lg text-gray-300 font-[family-name:var(--font-poppins)]">
                  What's up, Superstar. This is where it starts. Greenlit AI is ready to build your world, but it needs the blueprint. The quality of your Story Bible depends entirely on the quality of your pitch.
                </p>
                <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4">
                  <p className="text-[#10B981] font-semibold text-lg">
                    🎯 The Golden Rule: Specificity = Soul.
                  </p>
                </div>
              </div>

              {/* The 5 Essential Questions */}
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-[#10B981] font-[family-name:var(--font-inter)]">
                  The 5 Essential Questions: A Deep Dive
                </h2>

                {/* Question 1: The Logline */}
                <div className="bg-[#2a2a2a] rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white">1. The Logline (The Hook)</h3>
                  <div className="space-y-3">
                    <p className="text-gray-300"><strong>The Goal:</strong> Communicate the concept, conflict, and hook in one punchy sentence.</p>
                    <p className="text-gray-300"><strong>The Formula:</strong> (Protagonist) + (Inciting Incident) + (Goal) + (Central Conflict).</p>
                    <p className="text-[#10B981]"><strong>Pro Tip:</strong> Focus on the irony or the inherent conflict.</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-[#1a1a1a] border border-red-500/30 rounded-lg p-4">
                      <h4 className="text-red-400 font-semibold mb-2">❌ Mid Input</h4>
                      <p className="text-gray-400 italic">"A story about high school kids and their drama."</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#10B981]/30 rounded-lg p-4">
                      <h4 className="text-[#10B981] font-semibold mb-2">✨ S-Tier Input</h4>
                      <p className="text-white">"When the quietest girl in school starts an anonymous gossip account to expose the popular clique's hypocrisy, she must decide how far she'll go when the account turns toxic."</p>
                    </div>
                  </div>
                </div>

                {/* Question 2: The Protagonist */}
                <div className="bg-[#2a2a2a] rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white">2. The Protagonist (The Heart)</h3>
                  <div className="space-y-3">
                    <p className="text-gray-300"><strong>The Goal:</strong> Define who we follow and their core desire.</p>
                    <p className="text-[#10B981]"><strong>Pro Tip:</strong> Define their internal need vs. their external want. What is their biggest flaw that the story will exploit?</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-[#1a1a1a] border border-red-500/30 rounded-lg p-4">
                      <h4 className="text-red-400 font-semibold mb-2">❌ Mid Input</h4>
                      <p className="text-gray-400 italic">"A guy who works in an office and hates his job."</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#10B981]/30 rounded-lg p-4">
                      <h4 className="text-[#10B981] font-semibold mb-2">✨ S-Tier Input</h4>
                      <p className="text-white">"A cynical customer service rep who secretly craves connection (The Need) but actively sabotages every relationship (The Flaw), desperately wants a promotion to escape his misery (The Want)."</p>
                    </div>
                  </div>
                </div>

                {/* Question 3: The Stakes */}
                <div className="bg-[#2a2a2a] rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white">3. The Stakes (The Urgency)</h3>
                  <div className="space-y-3">
                    <p className="text-gray-300"><strong>The Goal:</strong> Why does this story have to happen now? What happens if they fail?</p>
                    <p className="text-[#10B981]"><strong>Pro Tip:</strong> Define the ticking clock. Stakes must be personal and immediate.</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-[#1a1a1a] border border-red-500/30 rounded-lg p-4">
                      <h4 className="text-red-400 font-semibold mb-2">❌ Mid Input</h4>
                      <p className="text-gray-400 italic">"They need to win the competition or they will be sad."</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#10B981]/30 rounded-lg p-4">
                      <h4 className="text-[#10B981] font-semibold mb-2">✨ S-Tier Input</h4>
                      <p className="text-white">"If they don't win the $50k prize money by Friday, the protagonist's family home will be foreclosed. The clock is ticking."</p>
                    </div>
                  </div>
                </div>

                {/* Question 4: The Vibe */}
                <div className="bg-[#2a2a2a] rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white">4. The Vibe (The Aesthetic)</h3>
                  <div className="space-y-3">
                    <p className="text-gray-300"><strong>The Goal:</strong> Define the look, feel, tone, and dialogue style. This heavily influences the AI's writing voice.</p>
                    <p className="text-[#10B981]"><strong>Pro Tip:</strong> Use the "X meets Y" format and specific tonal keywords (e.g., Gritty, Witty, Claustrophobic, Stylized).</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-[#1a1a1a] border border-red-500/30 rounded-lg p-4">
                      <h4 className="text-red-400 font-semibold mb-2">❌ Mid Input</h4>
                      <p className="text-gray-400 italic">"A funny office show."</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#10B981]/30 rounded-lg p-4">
                      <h4 className="text-[#10B981] font-semibold mb-2">✨ S-Tier Input</h4>
                      <p className="text-white">"Awkward, witty, fast-paced. 'The Office' meets the intimacy and fourth-wall breaks of 'Fleabag'."</p>
                    </div>
                  </div>
                </div>

                {/* Question 5: The Theme */}
                <div className="bg-[#2a2a2a] rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white">5. The Theme (The Soul)</h3>
                  <div className="space-y-3">
                    <p className="text-gray-300"><strong>The Goal:</strong> What is the underlying message or universal truth the story explores?</p>
                    <p className="text-[#10B981]"><strong>Pro Tip:</strong> Keep it simple and universal. (e.g., "The illusion of control," "Found family," "The cost of ambition.")</p>
                  </div>
                </div>
              </section>

              {/* Case Studies */}
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-[#10B981] font-[family-name:var(--font-inter)]">
                  Case Studies: The Pitch in Action
                </h2>

                {/* Case 1 */}
                <div className="bg-[#2a2a2a] rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white">Case 1: High School Drama ("The Burn List")</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-[#10B981] font-semibold">Logline:</h4>
                      <p className="text-white">"When the quietest girl in school starts an anonymous gossip account to expose the popular clique's hypocrisy, she must decide how far she'll go when the account turns toxic."</p>
                    </div>
                    <div>
                      <h4 className="text-[#10B981] font-semibold">Protagonist:</h4>
                      <p className="text-gray-300">Maya Chen, an overlooked honor student who craves recognition but fears confrontation. She needs to find her voice but her flaw is that she hides behind anonymity.</p>
                    </div>
                    <div>
                      <h4 className="text-[#10B981] font-semibold">Stakes:</h4>
                      <p className="text-gray-300">If Maya's identity is exposed, she'll lose her scholarship recommendation and face social destruction. The account has already driven one student to self-harm.</p>
                    </div>
                    <div>
                      <h4 className="text-[#10B981] font-semibold">Vibe:</h4>
                      <p className="text-gray-300">Gritty, stylized, secrets. "Euphoria" meets "Mean Girls."</p>
                    </div>
                    <div>
                      <h4 className="text-[#10B981] font-semibold">Theme:</h4>
                      <p className="text-gray-300">The price of justice. The corruption of power. Finding courage.</p>
                    </div>
                  </div>
                </div>

                {/* Case 2 */}
                <div className="bg-[#2a2a2a] rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white">Case 2: Office Rom-Com ("Terms of Service")</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-[#10B981] font-semibold">Logline:</h4>
                      <p className="text-white">"A cynical customer service rep at a dysfunctional tech startup falls for the relentlessly optimistic new HR manager, forcing him to choose between his comfortable misery and genuine connection."</p>
                    </div>
                    <div>
                      <h4 className="text-[#10B981] font-semibold">Protagonist:</h4>
                      <p className="text-gray-300">Jake Morrison, 29, who desperately wants a promotion (external) but secretly craves connection (internal). His flaw: he sabotages relationships before they can hurt him.</p>
                    </div>
                    <div>
                      <h4 className="text-[#10B981] font-semibold">Stakes:</h4>
                      <p className="text-gray-300">The startup is failing and layoffs are coming. Jake must choose: pursue the promotion that requires betraying the HR manager, or risk unemployment for love.</p>
                    </div>
                    <div>
                      <h4 className="text-[#10B981] font-semibold">Vibe:</h4>
                      <p className="text-gray-300">Awkward, witty, fast-paced. "The Office" meets the intimacy and fourth-wall breaks of "Fleabag."</p>
                    </div>
                    <div>
                      <h4 className="text-[#10B981] font-semibold">Theme:</h4>
                      <p className="text-gray-300">Vulnerability as strength. The cost of cynicism. Modern work-life balance.</p>
                    </div>
                  </div>
                </div>

                {/* Case 3 */}
                <div className="bg-[#2a2a2a] rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white">Case 3: Grounded Thriller ("Echo Chamber")</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-[#10B981] font-semibold">Logline:</h4>
                      <p className="text-white">"A grieving podcaster discovers a way to communicate with an alternate version of her deceased partner, but soon realizes the alternate version is trying to replace her."</p>
                    </div>
                    <div>
                      <h4 className="text-[#10B981] font-semibold">Protagonist:</h4>
                      <p className="text-gray-300">Dr. Elena Vasquez, a trauma therapist turned podcaster who needs to let go of grief but is desperate to hold onto her partner's memory. Her flaw: she can't accept loss.</p>
                    </div>
                    <div>
                      <h4 className="text-[#10B981] font-semibold">Stakes:</h4>
                      <p className="text-gray-300">The alternate version is slowly taking over Elena's life and relationships. If she doesn't sever the connection, she'll lose her identity entirely.</p>
                    </div>
                    <div>
                      <h4 className="text-[#10B981] font-semibold">Vibe:</h4>
                      <p className="text-gray-300">Psychological thriller, claustrophobic, single location. "Black Mirror" meets A24.</p>
                    </div>
                    <div>
                      <h4 className="text-[#10B981] font-semibold">Theme:</h4>
                      <p className="text-gray-300">The necessity of grief. The danger of living in the past. Identity and authenticity.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-6 text-center">
                <p className="text-[#10B981] font-semibold">
                  🎬 Ready to craft your S-Tier pitch? Use these examples as your guide and watch Greenlit AI build your world.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

