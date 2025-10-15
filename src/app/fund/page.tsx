'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import FAQ from '@/components/FAQ'
import Navigation from '@/components/Navigation'

export default function FundPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  const fundFAQ = [
    {
      question: "Do all producers receive funding?",
      answer: "Yes. All Studio Partners and Accelerator Producers receive automatic funding allocation upon acceptance, tailored to their tier and production needs."
    },
    {
      question: "How do I apply for the grant?",
      answer: "There is no separate application. Funding is automatically determined based on your tier placement and the production plan discussed during your Phase 3 Pitch Session."
    },
    {
      question: "What can the funding be used for?",
      answer: "Approved production expenses, including hiring a DP or crew, paying co-stars (sourced from the Greenlit Network), securing locations, or specialized equipment rentals. It cannot be used for personal expenses."
    },
    {
      question: "Does accepting the grant change the 70/30 revenue split?",
      answer: "No. The terms remain the same for all producers: 70% to the creators, 30% to the platform."
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
            The Greenlit Fund: We Back Bold Ideas.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-[#E7E7E7]/80 mb-8 max-w-4xl mx-auto"
          >
            We don't just provide the tools; we invest in the talent. Up to $20,000 in Pilot Grants to level up your production.
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

      {/* The Funding Levels Section */}
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8">
            Our Investment Thesis: Automatic Funding
          </h2>
          <p className="text-xl text-[#E7E7E7]/80 text-center mb-16 max-w-3xl mx-auto">
            We invest directly in our talent. Funding is automatically allocated upon acceptance into the Studio Partner or Accelerator Producer levels.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-[#121212] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-4">Studio Partners: Pilot Grants (Up to $20,000)</h3>
              <p className="text-[#E7E7E7]/80 mb-4">
                <strong>Eligibility:</strong> Studio Partners (Score 18+)
              </p>
              <p className="text-[#E7E7E7]/80 mb-4">
                <strong>Allocation:</strong> Automatically allocated based on the proposed production budget finalized during the Pitch Session.
              </p>
              <p className="text-[#E7E7E7]/80">
                <strong>Purpose:</strong> Significant capital injection for ambitious concepts (crews, locations, talent).
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#121212] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-4">Accelerator Producers: Strategic Micro-Grants</h3>
              <p className="text-[#E7E7E7]/80 mb-4">
                <strong>Eligibility:</strong> Accelerator Producers (Score 15-17)
              </p>
              <p className="text-[#E7E7E7]/80 mb-4">
                <strong>Allocation:</strong> Automatically allocated upon acceptance.
              </p>
              <p className="text-[#E7E7E7]/80">
                <strong>Purpose:</strong> Targeted funds designed to remove specific bottlenecks—e.g., securing a location, hiring a specific co-star, or enhancing production quality.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Who Qualifies
          </h2>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#1a1a1a] border border-[#00FF99]/20 rounded-xl p-12 text-center"
          >
            <h3 className="text-2xl font-bold text-[#00FF99] mb-6">Eligibility Requirements</h3>
            <p className="text-xl text-[#E7E7E7]/80 leading-relaxed max-w-3xl mx-auto">
              Must be accepted into the Tier 1 (Funded Producer) level. Selection is based on the strength of the pitch, the execution plan, and the clear need for funding to achieve the vision.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Terms Section */}
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-[#00FF99] mb-8">
              Creator-First Terms
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-[#121212] border border-[#00FF99]/20 rounded-xl p-8 text-center"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-4">The Grant</h3>
              <p className="text-[#E7E7E7]/80">
                This is a grant, not a loan.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#121212] border border-[#00FF99]/20 rounded-xl p-8 text-center"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-4">The Equity</h3>
              <p className="text-[#E7E7E7]/80">
                We do not take extra equity beyond the standard 70/30 revenue share.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#121212] border border-[#00FF99]/20 rounded-xl p-8 text-center"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-4">The Control</h3>
              <p className="text-[#E7E7E7]/80">
                We do not impose creative control.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <FAQ items={fundFAQ} title="Greenlit Fund FAQ" />
      </section>
    </div>
  )
}
