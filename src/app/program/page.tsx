'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import FAQ from '@/components/FAQ'
import Navigation from '@/components/Navigation'

export default function ProgramPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  const producerProgramFAQ = [
    {
      question: "What is the time commitment for the Producer Program?",
      answer: "This is your studio; you set the pace. The Accelerator includes an intensive onboarding Bootcamp (1-2 weeks) to get you production-ready. After that, we expect serious producers to be actively creating, leveraging the platform for maximum velocity."
    },
    {
      question: "Can I move between Tiers?",
      answer: "Absolutely. Tier 2 producers can move to Tier 1 based on series performance metrics. Dev Slate members can reapply to the Accelerator every 90 days."
    },
    {
      question: "What if I get placed in the Development Slate?",
      answer: "That's not a rejection; it's an invitation to grow. We provide specific feedback on what needs improvement (based on the 3 C's) and the resources to get you Accelerator-ready."
    },
    {
      question: "How is this different from just making content on YouTube or TikTok?",
      answer: "Greenlit is built for premium, serialized narrative drama. We provide professional-grade production tools and a business model focused on sustainable IP ownership and direct monetization (subscriptions/PPV), not just ad revenue."
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
            The Accelerator: Build Your Own Studio.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-[#E7E7E7]/80 mb-8 max-w-4xl mx-auto"
          >
            This isn't an audition. It's the infrastructure for the New Hollywood. We provide the production platform, the network, and the funding to turn professional talent into producers.
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

      {/* The Transformation Section */}
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Stop Waiting for a Role. Start Owning the IP.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-[#121212] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-4">Velocity (100x Faster)</h3>
              <p className="text-[#E7E7E7]/80 leading-relaxed">
                The Murphy Engine (30+ Production Engines) collapses months of work into days. Our platform handles the grind.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#121212] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-4">Ownership (Your IP. Period)</h3>
              <p className="text-[#E7E7E7]/80 leading-relaxed">
                The era of giving away your leverage is over. You own the content you create.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#121212] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-4">Monetization (The 70/30 Split)</h3>
              <p className="text-[#E7E7E7]/80 leading-relaxed">
                We radically align incentives. You keep 70% of the revenue via subscriptions, PPV, and interactive fan voting.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Ecosystem Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8">
            The Ecosystem: Where You Fit
          </h2>
          <p className="text-xl text-[#E7E7E7]/80 text-center mb-16 max-w-3xl mx-auto">
            Placement is determined by the 20-point Greenlit Scorecard. We provide immediate value and opportunity for every level of talent.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-[#1a1a1a] border border-[#00FF99]/30 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-[#00FF99] mb-3">The Studio Partners (Score 18-20)</h3>
              <p className="text-sm text-[#E7E7E7]/60 mb-4">The Vanguard</p>
              <p className="text-[#E7E7E7]/80 text-sm mb-4">Aced the pitch across all pillars. Ready NOW.</p>
              <ul className="text-sm text-[#E7E7E7]/70 space-y-2">
                <li>• Full Platform Access</li>
                <li>• Automatic allocation of <strong>Pilot Grants</strong> (up to $20k)</li>
                <li>• Featured Distribution</li>
                <li>• Dedicated Support</li>
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#1a1a1a] border border-[#00FF99]/20 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-[#00FF99] mb-3">The Accelerator Producers (Score 15-17)</h3>
              <p className="text-sm text-[#E7E7E7]/60 mb-4">The Hustlers</p>
              <p className="text-[#E7E7E7]/80 text-sm mb-4">High potential, strong vision, ready to build.</p>
              <ul className="text-sm text-[#E7E7E7]/70 space-y-2">
                <li>• Full Platform Access</li>
                <li>• Automatic allocation of <strong>Strategic Micro-Grants</strong></li>
                <li>• Immediate monetization</li>
                <li>• Clear pathway to Studio Partner status</li>
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#1a1a1a] border border-[#00FF99]/20 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-[#00FF99] mb-3">The Talent Roster (Score 11-14)</h3>
              <p className="text-sm text-[#E7E7E7]/60 mb-4">The Vetted Talent Pool</p>
              <p className="text-[#E7E7E7]/80 text-sm mb-4">Strong Chops, but perhaps lacking Clout or the immediate desire to produce.</p>
              <ul className="text-sm text-[#E7E7E7]/70 space-y-2">
                <li>• <strong>Guaranteed Casting:</strong> We actively matchmake Roster members with Studio Partners and Accelerator Producers. We guarantee at least one casting opportunity within the first 90 days.</li>
                <li>• <strong>Story Tool Access:</strong> Access to the Writers' Room tools (Story Maker) to develop your own IP.</li>
                <li>• <strong>Priority Placement:</strong> Front-of-the-line access in the internal casting database.</li>
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[#1a1a1a] border border-[#00FF99]/20 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-[#00FF99] mb-3">The Development Slate (Score &lt;11)</h3>
              <p className="text-sm text-[#E7E7E7]/60 mb-4">The Incubator</p>
              <p className="text-[#E7E7E7]/80 text-sm mb-4">Does not meet the benchmarks yet.</p>
              <ul className="text-sm text-[#E7E7E7]/70 space-y-2">
                <li>• Community access ("The Writers' Room")</li>
                <li>• Educational resources</li>
                <li>• Pathway to reapply</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Internal Casting Database Section */}
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              The Power of the Network
            </h2>
            <p className="text-xl text-[#E7E7E7]/80 mb-12 max-w-4xl mx-auto">
              All accepted members (Studio Partners, Accelerator Producers, and The Talent Roster) are automatically included in our internal casting database, facilitating collaboration and networking across the ecosystem.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Process Section */}
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            How We Vet Talent (Fast & Transparent)
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="bg-[#00FF99] text-black w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Application</h3>
              <p className="text-[#E7E7E7]/80">72hr response</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-[#00FF99] text-black w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Vetting</h3>
              <p className="text-[#E7E7E7]/80">The 3 C's assessment</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-[#00FF99] text-black w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Pitch Session</h3>
              <p className="text-[#E7E7E7]/80">Show us your vision</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="bg-[#00FF99] text-black w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-bold mb-2">Onboarding Bootcamp</h3>
              <p className="text-[#E7E7E7]/80">Get production-ready</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <FAQ items={producerProgramFAQ} title="Producer Program FAQ" />
      </section>
    </div>
  )
}
