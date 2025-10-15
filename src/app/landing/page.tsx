'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
            The New Hollywood
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-[#E7E7E7]/80 mb-8 max-w-4xl mx-auto"
          >
            Stop waiting for a role. Start owning the IP. We provide the AI Showrunner, the network, and the funding to turn professional talent into producers.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/uprising" className="bg-[#00FF99] text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#00CC7A] transition-colors">
              Join the Uprising →
            </Link>
            <Link href="/program" className="border border-[#00FF99] text-[#00FF99] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#00FF99] hover:text-black transition-colors">
              Learn More
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            The Infrastructure for the New Hollywood
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-[#121212] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-4">AI Showrunner</h3>
              <p className="text-[#E7E7E7]/80 leading-relaxed">
                30+ AI agents working 24/7 to bring your vision to life. Scripts, storyboards, casting - all automated.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#121212] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-4">The Network</h3>
              <p className="text-[#E7E7E7]/80 leading-relaxed">
                Connect with top-tier talent, crew, and collaborators. We build the teams that make the magic happen.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#121212] border border-[#00FF99]/20 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#00FF99] mb-4">The Funding</h3>
              <p className="text-[#E7E7E7]/80 leading-relaxed">
                Up to $20k in pilot grants. No equity, no creative control. Just the capital to make your vision real.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to Build Your Studio?
          </h2>
          <p className="text-xl text-[#E7E7E7]/80 mb-8">
            Join the uprising. Stop waiting for permission. Start creating.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/uprising" className="bg-[#00FF99] text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#00CC7A] transition-colors">
              Join the Uprising →
            </Link>
            <Link href="/program" className="border border-[#00FF99] text-[#00FF99] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#00FF99] hover:text-black transition-colors">
              Apply Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

