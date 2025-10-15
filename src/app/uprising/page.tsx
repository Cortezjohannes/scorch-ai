'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'

export default function UprisingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentBackground, setCurrentBackground] = useState(1)

  // Background images array
  const backgrounds = [
    'uprisingbg1.png',
    'uprisingbg3.png',
    'uprisingbg4.png',
    'uprisingbg5.png',
    'uprisingbg6.png',
    'uprisingbg7.png',
    'uprisingbg8.png',
    'uprisingbg9.png',
    'uprisingbg10.png',
    'uprisingbg11.png'
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Intersection Observer for background changes
  useEffect(() => {
    const sections = document.querySelectorAll('section')
    console.log(`Found ${sections.length} sections`)
    
    if (sections.length === 0) {
      console.log('No sections found, using scroll-based fallback')
      const handleScroll = () => {
        const scrollY = window.scrollY
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight
        const scrollPercent = scrollY / maxScroll
        const newBackground = Math.min(Math.floor(scrollPercent * backgrounds.length), backgrounds.length)
        
        console.log(`Scroll fallback: ${scrollY}, Max: ${maxScroll}, Percent: ${scrollPercent.toFixed(2)}, BG: ${newBackground}`)
        setCurrentBackground(newBackground)
      }
      
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionIndex = Array.from(sections).indexOf(entry.target as HTMLElement)
            const newBackground = Math.min(sectionIndex, backgrounds.length)
            
            console.log(`Section ${sectionIndex + 1} is visible, setting background to ${newBackground}`)
            
            // Smooth transition with slight delay
            setTimeout(() => {
              setCurrentBackground(newBackground)
            }, 200)
          }
        })
      },
      { 
        threshold: 0.3, // Trigger when 30% of section is visible
        rootMargin: '-10% 0px -10% 0px' // Add some margin for better timing
      }
    )
    
    sections.forEach((section, index) => {
      console.log(`Observing section ${index + 1}`)
      observer.observe(section)
    })
    
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: 0 }}
        animate={{ y: isScrolled ? -100 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#00FF99]/20"
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
      
      {/* Scroll-Based Background System */}
      <div className="fixed inset-0 z-0">
        {/* Section 1: Dark background with landing page animations */}
        {currentBackground === 0 && (
          <div className="absolute inset-0 bg-[#0A0A0A]">
            {/* Bright animated particles */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Large bright particles */}
              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-[#00FF99] rounded-full animate-ping opacity-80"></div>
              <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-[#00FF99] rounded-full animate-bounce opacity-70"></div>
              <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-[#00FF99] rounded-full animate-pulse opacity-90"></div>
              <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-[#00FF99] rounded-full animate-ping opacity-75"></div>
              
              {/* Medium particles */}
              <div className="absolute top-1/2 left-1/5 w-1.5 h-1.5 bg-[#00FF99] rounded-full animate-pulse opacity-85"></div>
              <div className="absolute top-2/3 right-1/5 w-1 h-1 bg-[#00FF99] rounded-full animate-bounce opacity-80"></div>
              <div className="absolute bottom-1/2 right-1/3 w-1.5 h-1.5 bg-[#00FF99] rounded-full animate-ping opacity-70"></div>
              <div className="absolute top-1/5 left-2/3 w-1 h-1 bg-[#00FF99] rounded-full animate-pulse opacity-90"></div>
              
              {/* Small bright particles */}
              <div className="absolute top-3/4 left-1/2 w-1 h-1 bg-[#00FF99] rounded-full animate-bounce opacity-95"></div>
              <div className="absolute bottom-1/5 left-1/4 w-0.5 h-0.5 bg-[#00FF99] rounded-full animate-ping opacity-85"></div>
              <div className="absolute top-1/6 right-1/2 w-0.5 h-0.5 bg-[#00FF99] rounded-full animate-pulse opacity-90"></div>
              <div className="absolute bottom-2/3 right-1/6 w-1 h-1 bg-[#00FF99] rounded-full animate-bounce opacity-80"></div>
            </div>
          </div>
        )}
        
        {/* Sections 2+: Uprising backgrounds */}
        {currentBackground > 0 && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1500 ease-in-out"
            style={{
              backgroundImage: `url('/${backgrounds[currentBackground - 1]}')`,
              opacity: 0.45
            }}
          />
        )}
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Debug indicator (completely hidden) */}
      <div className="fixed top-4 right-4 z-50 bg-red-600 text-white p-2 rounded text-xs" style={{ display: 'none' }}>
        BG: {currentBackground}/10
      </div>



      {/* Main Content */}
      <div className="relative z-10">
        {/* Section 1 */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="min-h-screen flex items-center justify-center px-4 py-32"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none mb-8">
              DO YOU HEAR THE PEOPLE SING?
            </h1>
          </div>
        </motion.section>

        {/* Section 2 */}
        <section className="py-60 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-2xl md:text-3xl leading-relaxed mb-8"
            >
              It starts with a silence.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              The silence of the waiting room.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              The silence after the audition where you poured out your soul, and heard nothing back.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="text-xl md:text-2xl leading-relaxed"
            >
              The silence of the 90%.
            </motion.p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="py-60 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-xl md:text-2xl leading-relaxed mb-8"
            >
              Hollywood isn't broken.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl md:text-2xl leading-relaxed mb-8"
            >
              It's working exactly as designed.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              A machine built to keep you waiting.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              A machine built to make you ask for permission.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="text-xl md:text-2xl leading-relaxed"
            >
              A machine built to commodify your talent and strip-mine your passion.
            </motion.p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="py-60 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-2xl md:text-3xl font-bold leading-relaxed mb-8"
            >
              We know the open secrets.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              The leverage they hold over you.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              The compromises they demand.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              The coercion. The indecent proposals whispered in dimly lit rooms.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="text-xl md:text-2xl leading-relaxed mb-8"
            >
              The casting couch is not a myth; it's a cornerstone of their empire.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              They want you desperate.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.8 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              They want you powerless.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2.1 }}
              className="text-xl md:text-2xl leading-relaxed"
            >
              They want you grateful for the scraps they let fall from the table.
            </motion.p>
          </div>
        </section>

        {/* Section 5 - Action Green */}
        <section className="py-60 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black text-[#00FF99] leading-none mb-8"
            >
              WE SING THE SONG OF ANGRY TALENT.
            </motion.h2>
          </div>
        </section>

        {/* Section 6 */}
        <section className="py-60 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-xl md:text-2xl leading-relaxed mb-8"
            >
              Do you feel it?
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              The beating of your heart echoing the beating of the drums.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              The fire that burns when you see mediocrity elevated while brilliance is sidelined.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="text-xl md:text-2xl leading-relaxed mb-8"
            >
              The realization that the gatekeepers don't love the art. They only love the control.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="text-2xl md:text-3xl font-bold leading-relaxed"
            >
              We are the music of a people who will not be slaves again.
            </motion.p>
          </div>
        </section>

        {/* Section 7 */}
        <section className="py-60 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              We are done waiting for the call.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              We are done asking for permission.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-xl md:text-2xl leading-relaxed"
            >
              We are done letting them decide our worth.
            </motion.p>
          </div>
        </section>

        {/* Section 8 */}
        <section className="py-60 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black leading-none mb-8"
            >
              SO WE ARE BURNING IT DOWN.
            </motion.h2>
          </div>
        </section>

        {/* Section 9 */}
        <section className="py-60 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-xl md:text-2xl leading-relaxed mb-8"
            >
              Greenlit AI is not a software company.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-2xl md:text-3xl font-bold leading-relaxed mb-8"
            >
              It is the barricade.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              It is the infrastructure for the uprising.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="text-xl md:text-2xl leading-relaxed mb-8"
            >
              We have seized the means of production.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              We built the AI Showrunner to dismantle their leverage.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              We automated the pipeline to break their bottleneck.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.8 }}
              className="text-xl md:text-2xl leading-relaxed"
            >
              We decentralized the studio to destroy their control.
            </motion.p>
          </div>
        </section>

        {/* Section 10 */}
        <section className="py-60 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-2xl md:text-3xl leading-relaxed"
            >
              We are flipping the power dynamic. Forever.
            </motion.p>
          </div>
        </section>

        {/* Section 11 - Action Green Stack */}
        <section className="py-60 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-3xl md:text-5xl font-black text-[#00FF99] leading-none mb-8"
            >
              YOU OWN THE IP.
            </motion.h3>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-3xl md:text-5xl font-black text-[#00FF99] leading-none mb-8"
            >
              YOU CONTROL THE NARRATIVE.
            </motion.h3>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-3xl md:text-5xl font-black text-[#00FF99] leading-none"
            >
              YOU KEEP THE REVENUE.
            </motion.h3>
          </div>
        </section>

        {/* Section 12 */}
        <section className="py-60 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              This is the New Hollywood.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              Built on talent, not tyranny.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-xl md:text-2xl leading-relaxed mb-8"
            >
              Powered by creators, not compliance.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              The old way is fading.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="text-xl md:text-2xl leading-relaxed mb-4"
            >
              The fire is spreading.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="text-xl md:text-2xl leading-relaxed"
            >
              There is a life about to start when tomorrow comes.
            </motion.p>
          </div>
        </section>

        {/* Final Section */}
        <section className="py-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-6xl md:text-8xl lg:text-9xl font-black leading-none mb-16"
            >
              YOU ARE NOW THE STUDIO.
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <button className="bg-[#00FF99] text-black px-12 py-6 rounded-lg text-2xl font-black hover:bg-[#00CC7A] transition-all duration-300 shadow-2xl shadow-[#00FF99]/50 hover:shadow-[#00FF99]/70 hover:scale-105">
                Join the Uprising →
              </button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-[#E7E7E7]/60">
              Greenlit AI. Stop Waiting. Start Creating.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
