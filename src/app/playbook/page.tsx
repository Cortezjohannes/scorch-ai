'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import FAQ from '@/components/FAQ'
import Navigation from '@/components/Navigation'

export default function PlaybookPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  const playbookFAQ = [
    {
      question: "What do I do if the script the AI generates feels generic or \"mid\"?",
      answer: "That means your direction in the Episode Studio wasn't specific enough. Go back and refine the Beat Sheet and, crucially, use the Director's Notes to add subtext, sensory details, and specific emotional intent."
    },
    {
      question: "How much control do I really have?",
      answer: "100%. You can edit the Beat Sheet, direct the tone, rewrite the script manually, or use the AI Co-Pilot (Chatbot) to punch up specific scenes."
    },
    {
      question: "Is the AI going to replace human writers?",
      answer: "Hell no. The AI accelerates the process, handles structure, and generates drafts. The vision, the voice, and the soul come from the human Showrunner."
    }
  ]

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: 0 }}
        animate={{ y: isScrolled ? -100 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/90 backdrop-blur-md border-b border-[#00FF99]/20"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/greenlitailogo.png" alt="Greenlit" className="h-10 w-auto" />
              <span className="text-[#00FF99] font-bold text-2xl">Greenlit</span>
            </div>
            <Navigation />
          </div>
        </div>
      </motion.nav>
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            The Showrunner's Playbook
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-[#E7E7E7]/80 mb-8 max-w-4xl mx-auto"
          >
            Your definitive guide to thinking like a Showrunner and mastering the AI Murphy Engine (30+ AI Agents).
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button className="bg-[#00FF99] text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#00CC7A] transition-colors">
              Apply Now →
            </button>
          </motion.div>
        </div>
      </section>

      {/* The Philosophy Section */}
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-[#00FF99] mb-8">
              You Direct the AI
            </h2>
            <p className="text-xl text-[#E7E7E7]/80 mb-8 max-w-3xl mx-auto">
              The AI is your crew, not the artist. The Golden Rule: <span className="text-[#00FF99] font-bold">Specificity = Soul</span>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Module 1: Pitching Your Vision */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Module 1: Pitching Your Vision (The 5 Questions)
          </h2>
          
          <div className="space-y-12">
            {/* Question 1: Logline */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-[#1a1a1a] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-6">1. The Logline</h3>
              <p className="text-[#E7E7E7]/80 mb-6">One sentence that captures the essence of your series.</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#121212] border border-red-500/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-400 mb-3">Mid Input</h4>
                  <p className="text-[#E7E7E7]/60 italic">"A group of friends navigate high school drama."</p>
                </div>
                <div className="bg-[#121212] border border-[#00FF99]/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-[#00FF99] mb-3">S-Tier Input</h4>
                  <p className="text-[#E7E7E7]/90">"When a viral video exposes the school's secret underground fight club, a shy transfer student must choose between protecting her new friends or exposing the truth that could destroy them all."</p>
                </div>
              </div>
            </motion.div>

            {/* Question 2: Protagonist */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#1a1a1a] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-6">2. The Protagonist</h3>
              <p className="text-[#E7E7E7]/80 mb-6">Who is your main character and what makes them compelling?</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#121212] border border-red-500/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-400 mb-3">Mid Input</h4>
                  <p className="text-[#E7E7E7]/60 italic">"Sarah is a typical teenager who wants to fit in."</p>
                </div>
                <div className="bg-[#121212] border border-[#00FF99]/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-[#00FF99] mb-3">S-Tier Input</h4>
                  <p className="text-[#E7E7E7]/90">"Maya Chen, a 17-year-old former competitive gymnast with a photographic memory, moves to a new school after her family's restaurant burns down. She's desperate to stay invisible, but her ability to remember every detail makes her the perfect witness to crimes others miss."</p>
                </div>
              </div>
            </motion.div>

            {/* Question 3: Stakes */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#1a1a1a] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-6">3. The Stakes</h3>
              <p className="text-[#E7E7E7]/80 mb-6">What happens if your protagonist fails?</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#121212] border border-red-500/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-400 mb-3">Mid Input</h4>
                  <p className="text-[#E7E7E7]/60 italic">"She might not get the guy she likes."</p>
                </div>
                <div className="bg-[#121212] border border-[#00FF99]/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-[#00FF99] mb-3">S-Tier Input</h4>
                  <p className="text-[#E7E7E7]/90">"If Maya speaks up, her family loses their new home and her little brother gets expelled. If she stays silent, the underground ring continues to recruit and potentially harm other students, including her only friend."</p>
                </div>
              </div>
            </motion.div>

            {/* Question 4: Vibe */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[#1a1a1a] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-6">4. The Vibe</h3>
              <p className="text-[#E7E7E7]/80 mb-6">What's the emotional tone and visual style?</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#121212] border border-red-500/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-400 mb-3">Mid Input</h4>
                  <p className="text-[#E7E7E7]/60 italic">"It's a teen drama like Riverdale."</p>
                </div>
                <div className="bg-[#121212] border border-[#00FF99]/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-[#00FF99] mb-3">S-Tier Input</h4>
                  <p className="text-[#E7E7E7]/90">"Think 'Euphoria' meets 'The Social Network' - neon-lit hallways, social media as a weapon, the constant hum of notifications creating anxiety. Every frame feels like it's being watched, recorded, judged."</p>
                </div>
              </div>
            </motion.div>

            {/* Question 5: Theme */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-[#1a1a1a] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-6">5. The Theme</h3>
              <p className="text-[#E7E7E7]/80 mb-6">What's the deeper message or question you're exploring?</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#121212] border border-red-500/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-400 mb-3">Mid Input</h4>
                  <p className="text-[#E7E7E7]/60 italic">"Friendship is important."</p>
                </div>
                <div className="bg-[#121212] border border-[#00FF99]/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-[#00FF99] mb-3">S-Tier Input</h4>
                  <p className="text-[#E7E7E7]/90">"In a world where every moment is recorded and judged, what does it mean to be truly authentic? Can you maintain your integrity when the cost of truth is everything you've built?"</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Module 2: Running Your Episode */}
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Module 2: Running Your Episode (The Episode Studio)
          </h2>
          
          <div className="space-y-12">
            {/* Episode Goal */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-[#121212] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-6">Episode Goal</h3>
              <p className="text-[#E7E7E7]/80 mb-6">What must happen in this episode to advance your story?</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1a] border border-red-500/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-400 mb-3">Mid Input</h4>
                  <p className="text-[#E7E7E7]/60 italic">"Maya goes to school and meets new people."</p>
                </div>
                <div className="bg-[#1a1a1a] border border-[#00FF99]/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-[#00FF99] mb-3">S-Tier Input</h4>
                  <p className="text-[#E7E7E7]/90">"Maya must choose between protecting her new friend's secret (that he's been forced to fight) or exposing the underground ring, knowing that speaking up will destroy her family's fresh start and potentially get her friend killed."</p>
                </div>
              </div>
            </motion.div>

            {/* Beat Sheet */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#121212] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-6">Editing the Beat Sheet (The Blueprint)</h3>
              <p className="text-[#E7E7E7]/80 mb-6">The AI generates a structure, but you refine it with specific emotional beats.</p>
              
              <div className="bg-[#1a1a1a] border border-[#00FF99]/20 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-[#00FF99] mb-4">Example Beat Sheet Refinement:</h4>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="bg-[#00FF99] text-black px-3 py-1 rounded text-sm font-bold mr-4">1</span>
                    <div>
                      <p className="text-[#E7E7E7]/90 font-medium">Opening: Maya arrives at school</p>
                      <p className="text-[#E7E7E7]/60 text-sm">Refined: Maya arrives with her camera, documenting everything as a coping mechanism for her anxiety about being the new kid.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-[#00FF99] text-black px-3 py-1 rounded text-sm font-bold mr-4">2</span>
                    <div>
                      <p className="text-[#E7E7E7]/90 font-medium">Inciting Incident: She witnesses a fight</p>
                      <p className="text-[#E7E7E7]/60 text-sm">Refined: Maya's camera accidentally records a brutal fight in the locker room, but when she tries to help, she's threatened by the ringleader who recognizes her from her gymnastics videos.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Vibe Sliders */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#121212] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-6">Vibe Sliders</h3>
              <p className="text-[#E7E7E7]/80 mb-6">Fine-tune the emotional tone of each scene.</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#E7E7E7]/80 mb-2">Tension Level</label>
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <div className="flex justify-between text-sm text-[#E7E7E7]/60 mb-2">
                        <span>Calm</span>
                        <span>Intense</span>
                      </div>
                      <div className="w-full bg-[#121212] rounded-full h-2">
                        <div className="bg-[#00FF99] h-2 rounded-full" style={{width: '80%'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[#E7E7E7]/80 mb-2">Emotional Weight</label>
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <div className="flex justify-between text-sm text-[#E7E7E7]/60 mb-2">
                        <span>Light</span>
                        <span>Heavy</span>
                      </div>
                      <div className="w-full bg-[#121212] rounded-full h-2">
                        <div className="bg-[#00FF99] h-2 rounded-full" style={{width: '90%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#E7E7E7]/80 mb-2">Pacing</label>
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <div className="flex justify-between text-sm text-[#E7E7E7]/60 mb-2">
                        <span>Slow</span>
                        <span>Fast</span>
                      </div>
                      <div className="w-full bg-[#121212] rounded-full h-2">
                        <div className="bg-[#00FF99] h-2 rounded-full" style={{width: '70%'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[#E7E7E7]/80 mb-2">Visual Style</label>
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <div className="flex justify-between text-sm text-[#E7E7E7]/60 mb-2">
                        <span>Natural</span>
                        <span>Stylized</span>
                      </div>
                      <div className="w-full bg-[#121212] rounded-full h-2">
                        <div className="bg-[#00FF99] h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Director's Notes */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[#121212] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-6">Director's Notes (Subtext/Sensory Details)</h3>
              <p className="text-[#E7E7E7]/80 mb-6">This is where you add the soul. Specific emotional beats and sensory details.</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1a] border border-red-500/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-400 mb-3">Mid Input</h4>
                  <p className="text-[#E7E7E7]/60 italic">"Maya feels nervous about the fight."</p>
                </div>
                <div className="bg-[#1a1a1a] border border-[#00FF99]/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-[#00FF99] mb-3">S-Tier Input</h4>
                  <p className="text-[#E7E7E7]/90">"Maya's hands shake as she holds the camera, the same tremor she had before her final gymnastics routine when she knew one wrong move could end her career. The metallic taste of blood fills her mouth as she bites her lip, trying to stay invisible while her photographic memory captures every detail of the violence she's witnessing."</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Module 3: Case Studies */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Module 3: Case Studies
          </h2>
          
          <div className="space-y-12">
            {/* High School Drama Case Study */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-[#1a1a1a] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-6">Case Study: High School Drama</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-[#E7E7E7] mb-4">The Vision</h4>
                  <p className="text-[#E7E7E7]/80 mb-4">
                    "Euphoria meets The Social Network" - A series about the intersection of social media, identity, and the pressure to perform in high school.
                  </p>
                  <h4 className="text-lg font-semibold text-[#E7E7E7] mb-4">Key Elements</h4>
                  <ul className="text-[#E7E7E7]/80 space-y-2">
                    <li>• Protagonist with photographic memory</li>
                    <li>• Underground fight club subplot</li>
                    <li>• Social media as both weapon and shield</li>
                    <li>• Family pressure vs. personal integrity</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[#E7E7E7] mb-4">AI Implementation</h4>
                  <p className="text-[#E7E7E7]/80 mb-4">
                    Used specific vibe sliders for tension (high), emotional weight (heavy), and visual style (stylized). Director's notes focused on sensory details and subtext around performance anxiety.
                  </p>
                  <h4 className="text-lg font-semibold text-[#E7E7E7] mb-4">Result</h4>
                  <p className="text-[#E7E7E7]/80">
                    Generated scripts that captured the claustrophobic atmosphere of high school while maintaining the protagonist's unique perspective and internal conflict.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Office Rom-Com Case Study */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#1a1a1a] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-6">Case Study: Office Rom-Com</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-[#E7E7E7] mb-4">The Vision</h4>
                  <p className="text-[#E7E7E7]/80 mb-4">
                    "The Office meets Succession" - A workplace comedy about a tech startup where the founder's daughter must navigate corporate politics while falling for her rival.
                  </p>
                  <h4 className="text-lg font-semibold text-[#E7E7E7] mb-4">Key Elements</h4>
                  <ul className="text-[#E7E7E7]/80 space-y-2">
                    <li>• Corporate power dynamics</li>
                    <li>• Tech industry satire</li>
                    <li>• Enemies-to-lovers romance</li>
                    <li>• Family business complications</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[#E7E7E7] mb-4">AI Implementation</h4>
                  <p className="text-[#E7E7E7]/80 mb-4">
                    Balanced tension (medium) with pacing (fast) for comedic timing. Director's notes emphasized the awkwardness of corporate interactions and the underlying sexual tension.
                  </p>
                  <h4 className="text-lg font-semibold text-[#E7E7E7] mb-4">Result</h4>
                  <p className="text-[#E7E7E7]/80">
                    Generated dialogue that felt authentic to tech culture while maintaining romantic comedy beats and corporate satire elements.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Grounded Thriller Case Study */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#1a1a1a] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-6">Case Study: Grounded Thriller</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-[#E7E7E7] mb-4">The Vision</h4>
                  <p className="text-[#E7E7E7]/80 mb-4">
                    "Gone Girl meets Sharp Objects" - A psychological thriller about a woman who returns to her hometown to investigate her sister's disappearance, uncovering dark family secrets.
                  </p>
                  <h4 className="text-lg font-semibold text-[#E7E7E7] mb-4">Key Elements</h4>
                  <ul className="text-[#E7E7E7]/80 space-y-2">
                    <li>• Unreliable narrator</li>
                    <li>• Small town secrets</li>
                    <li>• Family trauma exploration</li>
                    <li>• Psychological manipulation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[#E7E7E7] mb-4">AI Implementation</h4>
                  <p className="text-[#E7E7E7]/80 mb-4">
                    High tension, slow pacing for psychological build-up. Director's notes focused on the protagonist's internal monologue and the oppressive atmosphere of returning home.
                  </p>
                  <h4 className="text-lg font-semibold text-[#E7E7E7] mb-4">Result</h4>
                  <p className="text-[#E7E7E7]/80">
                    Generated scripts that maintained psychological tension while building toward revelations about the family's dark past and the protagonist's own complicity.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <FAQ items={playbookFAQ} title="Playbook FAQ" />
      </section>
    </div>
  )
}
