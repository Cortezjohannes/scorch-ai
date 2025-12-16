'use client'

import { motion } from '@/components/ui/ClientMotion'
import { useState, useEffect } from 'react'
import FAQ from '@/components/FAQ'
import Navigation from '@/components/Navigation'

export default function CriteriaPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  const criteriaFAQ = [
    {
      question: "I'm a great actor (High Chops) but I have almost no followers (Low Clout). Should I apply?",
      answer: "Hell yes. If your vision (Creativity) is strong, you might qualify under the \"2 out of 3\" rule. If not, we will likely place you in the Co-Star Network (getting cast by producers) or help match you via the Greenlit Network."
    },
    {
      question: "I'm an influencer with 500k followers (High Clout) but limited acting experience (Low Chops). Should I apply?",
      answer: "Absolutely. If you have a strong vision (Creativity), you are a prime candidate. We will prioritize your onboarding and help you cast experienced actors via the Greenlit Network to elevate the production."
    },
    {
      question: "Why do you require an application? Isn't this just new gatekeeping?",
      answer: "Old gatekeeping is opaque and based on who you know. Our criteria are transparent and based on your potential (The 3 C's). We require applications because we are building a premium streaming platform, not just a UGC tool. Quality matters."
    },
    {
      question: "How fast is the application review process?",
      answer: "We respect the hustle. We guarantee an initial response within 72 hours of submission."
    }
  ]

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: 0 }}
        animate={{ y: isScrolled ? -100 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/90 backdrop-blur-md border-b border-[#10B981]/20"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/greenlitailogo.png" alt="Greenlit" className="h-10 w-auto" />
              <span className="text-[#10B981] font-bold text-2xl">Greenlit</span>
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
            What It Takes to Get In.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-[#E7E7E7]/80 mb-8 max-w-4xl mx-auto"
          >
            Hollywood gatekeeping is arbitrary and opaque. We are transparent. We look for potential, not just polish.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button className="bg-[#10B981] text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#059669] transition-colors">
              Apply Now →
            </button>
          </motion.div>
        </div>
      </section>

      {/* The Three C's Section */}
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            The Pillars of a Modern Producer
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-[#121212] border border-[#10B981]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#10B981] mb-4">Chops (The Talent)</h3>
              <p className="text-[#E7E7E7]/80 leading-relaxed mb-4">
                Demonstrated acting ability. We look at reels, IMDb/Backstage credits, training, and raw talent.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#121212] border border-[#10B981]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#10B981] mb-4">Clout (The Audience)</h3>
              <p className="text-[#E7E7E7]/80 leading-relaxed mb-4">
                An existing, mobilized fanbase. Crucially: We prioritize engagement rate over raw follower count. A mobilized niche audience is powerful.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#121212] border border-[#10B981]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#10B981] mb-4">Creativity (The Vision)</h3>
              <p className="text-[#E7E7E7]/80 leading-relaxed mb-4">
                A clear, compelling vision for your series. Are you ready to think like a Showrunner?
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Rule of Two Section - CRITICAL */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-[#10B981]/10 to-[#10B981]/5 border-2 border-[#10B981] rounded-2xl p-12 text-center"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-[#10B981] mb-8">
              The Rule of Two
            </h2>
            <p className="text-xl md:text-2xl text-[#E7E7E7]/90 max-w-4xl mx-auto">
              To qualify for the Accelerator (Tiers 1 & 2), you need a strong foundation in at least <span className="text-[#10B981] font-bold">TWO</span> of the Three C's. We don't expect everyone to have it all on Day 1.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Pipeline Section */}
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8">
            The Pipeline: Our Universal Vetting Process
          </h2>
          <p className="text-xl text-[#E7E7E7]/80 text-center mb-16 max-w-3xl mx-auto">
            Everyone accepted into the Greenlit ecosystem goes through this rigorous process. We move fast and respect the hustle.
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="bg-[#10B981] text-black w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">The Digital Filter</h3>
              <p className="text-[#E7E7E7]/80 mb-2">The Application</p>
              <p className="text-sm text-[#E7E7E7]/60">VideoAsk, Clout analytics, Reel. SLA: 72-hour response.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-[#10B981] text-black w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">The Vetting</h3>
              <p className="text-[#E7E7E7]/80 mb-2">The Rubric</p>
              <p className="text-sm text-[#E7E7E7]/60">Internal scoring using the Greenlit Scorecard.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-[#10B981] text-black w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">The Pitch Session</h3>
              <p className="text-[#E7E7E7]/80 mb-2">The Vibe Check</p>
              <p className="text-sm text-[#E7E7E7]/60"><strong>All applicants</strong> moving forward are invited to a 15-minute virtual session. This is where we assess your producer mindset and execution plan.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="bg-[#10B981] text-black w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-bold mb-2">The Decision & Onboarding</h3>
              <p className="text-[#E7E7E7]/80 mb-2">Final placement</p>
              <p className="text-sm text-[#E7E7E7]/60">Final placement into the ecosystem. SLA: 48 hours post-pitch.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Greenlit Scorecard Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8">
            The Greenlit Scorecard
          </h2>
          <p className="text-xl text-[#E7E7E7]/80 text-center mb-16 max-w-3xl mx-auto">
            We score applicants 1-5 across the Four Pillars. This score determines your placement in the ecosystem (The Studio Partners, Accelerator Producers, Talent Roster, or Development Slate).
          </p>
          
          <div className="bg-[#1a1a1a] border border-[#10B981]/20 rounded-xl p-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#10B981] mb-4">Chops</h3>
                <p className="text-[#E7E7E7]/80">Demonstrated acting ability through reels, credits, and professional experience.</p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#10B981] mb-4">Clout</h3>
                <p className="text-[#E7E7E7]/80">An existing fanbase and proven audience engagement across platforms.</p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#10B981] mb-4">Creativity</h3>
                <p className="text-[#E7E7E7]/80">A clear, compelling vision for the series you want to produce.</p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#10B981] mb-4">Chemistry</h3>
                <p className="text-[#E7E7E7]/80">The ability to collaborate and work effectively with others.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Greenlit Network Section */}
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Missing a 'C'? We've Got You Covered.
            </h2>
            <p className="text-xl text-[#E7E7E7]/80 mb-12 max-w-4xl mx-auto">
              This is our moat. Greenlit actively connects creators with massive audiences (High Clout) to top-tier actors (High Chops) to launch projects together as Co-Producers. We don't just provide tools; we build teams.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-[#121212] border border-[#10B981]/20 rounded-xl p-8">
                <h3 className="text-xl font-bold text-[#10B981] mb-4">High Clout + High Chops</h3>
                <p className="text-[#E7E7E7]/80">Perfect match for immediate production</p>
              </div>
              
              <div className="bg-[#121212] border border-[#10B981]/20 rounded-xl p-8">
                <h3 className="text-xl font-bold text-[#10B981] mb-4">High Clout + High Creativity</h3>
                <p className="text-[#E7E7E7]/80">We'll help you cast the perfect actors</p>
              </div>
              
              <div className="bg-[#121212] border border-[#10B981]/20 rounded-xl p-8">
                <h3 className="text-xl font-bold text-[#10B981] mb-4">High Chops + High Creativity</h3>
                <p className="text-[#E7E7E7]/80">We'll connect you with engaged audiences</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <FAQ items={criteriaFAQ} title="Criteria FAQ" />
      </section>
    </div>
  )
}
