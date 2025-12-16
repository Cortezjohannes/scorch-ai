'use client'

import { useState, useEffect } from 'react'
import { motion } from '@/components/ui/ClientMotion'

export default function GreenlitOption2() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700;800;900&display=swap');
        
        .fire-gradient {
          background: linear-gradient(135deg, #ffffff 0%, #10B981 50%, #ffffff 100%);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: fireGlow 4s ease-in-out infinite;
        }
        
        @keyframes fireGlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .ember-shadow {
          box-shadow: 0 0 20px rgba(0, 255, 153, 0.2), 0 0 40px rgba(0, 255, 153, 0.1);
        }
        
        .burn-button {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .burn-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 255, 153, 0.3);
        }
        
        .burn-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        .burn-button:hover::before {
          left: 100%;
        }
        

        
        .text-fire {
          background: linear-gradient(135deg, #ffffff 0%, #10B981 50%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .rebellious-card {
          background: rgba(18, 18, 18, 0.8);
          border: 1px solid rgba(0, 255, 153, 0.2);
          transition: all 0.4s ease;
          backdrop-filter: blur(10px);
        }
        
        .rebellious-card:hover {
          border-color: #10B981;
          box-shadow: 0 8px 25px rgba(0, 255, 153, 0.15);
          transform: translateY(-3px);
        }
        
        .flame-text {
          text-shadow: 0 0 12px rgba(0, 255, 153, 0.4), 0 0 24px rgba(0, 255, 153, 0.2);
        }
        
        .elegant-fire {
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        
        .fire-video-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          object-fit: cover;
          z-index: -10;
          opacity: 0.5;
        }
      `}</style>

      <div className="min-h-screen text-white overflow-hidden" style={{ fontFamily: 'League Spartan, sans-serif' }}>
        {/* Fire Video Background */}
        <video 
          className="fire-video-bg"
          autoPlay 
          muted 
          loop 
          playsInline
          preload="auto"
        >
          <source src="/fire_background.mp4" type="video/mp4" />
        </video>
        
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-xl border-b border-[#FF6B00]/30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 ember-shadow rounded-lg flex items-center justify-center">
                  <span className="text-3xl">🔥</span>
                </div>
                <h1 className="text-3xl font-black elegant-fire fire-gradient">Greenlit</h1>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#burn" className="text-gray-300 hover:text-[#10B981] transition-colors font-semibold">Platform</a>
                <a href="#launch" className="text-gray-300 hover:text-[#10B981] transition-colors font-semibold">Platform</a>
                <a href="#rebels" className="text-gray-300 hover:text-[#10B981] transition-colors font-semibold">Founders</a>
                <button className="burn-button text-black font-bold px-6 py-2 rounded-lg">
                  Join the Platform
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20">
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
              transition={{ duration: 1 }}
            >
              <div className="elegant-fire text-7xl md:text-8xl font-black mb-6 fire-gradient flame-text">
                GREENLIT
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                BUILD YOUR OWN.<br />
                <span className="text-[#10B981] flame-text">LAUNCH YOUR SERIES.</span>
              </h2>
              
              <p className="text-2xl md:text-3xl text-gray-300 mb-6 max-w-4xl mx-auto leading-relaxed">
                The AI showrunner platform where actors <span className="text-fire font-bold">take control</span>.
              </p>
              
              <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
                No gatekeepers. No bureaucracy. Just pure creative freedom and 60% ownership of your content.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-16">
                <button className="burn-button text-black text-xl font-bold px-12 py-4 rounded-lg">
                  Launch Your Series
                </button>
                <button className="border-2 border-[#10B981] text-[#10B981] text-xl font-semibold px-12 py-4 rounded-lg hover:bg-[#10B981] hover:text-black transition-all duration-300">
                  Watch the Demo
                </button>
              </div>
              
              {/* Platformary Stats */}
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="text-center">
                  <div className="text-5xl font-bold fire-gradient mb-2">$60B</div>
                  <div className="text-gray-300 font-medium">Market Disruption</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold fire-gradient mb-2">2M</div>
                  <div className="text-gray-300 font-medium">Actors Worldwide</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold fire-gradient mb-2">60%</div>
                  <div className="text-gray-300 font-medium">Actor Ownership</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* The Problem - Dramatic */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h3 className="elegant-fire text-6xl md:text-7xl font-black mb-8 fire-gradient">
                THE STUDIO SYSTEM IS BROKEN
              </h3>
              <p className="text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                The system <span className="text-fire font-bold">blocks talent</span> before it can launch.
              </p>
            </motion.div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Gatekeepers",
                  stat: "90%",
                  problem: "Actors unemployed regardless of talent",
                  description: "Studios control what stories get told. Your vision dies in development hell.",
                  icon: "🚪",
                  color: "#D62828"
                },
                {
                  title: "Bureaucracy",
                  stat: "$10B", 
                  problem: "Creative value wasted annually",
                  description: "Years of pitching, waiting, compromise. Your fire gets smothered by committees.",
                  icon: "📋",
                  color: "#FF6B00"
                },
                {
                  title: "Exploitation",
                  stat: "0%",
                  problem: "Ownership for most actors",
                  description: "They own your story. You become a hired hand on your own creation.",
                  icon: "⛓️",
                  color: "#10B981"
                }
              ].map((problem, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="rebellious-card rounded-xl p-8 text-center"
                >
                  <div className="text-5xl mb-6" style={{ filter: `drop-shadow(0 0 8px ${problem.color})` }}>
                    {problem.icon}
                  </div>
                  <h4 className="elegant-fire text-2xl font-bold mb-4 fire-gradient">{problem.title}</h4>
                  <div className="text-4xl font-bold mb-2" style={{ color: problem.color }}>{problem.stat}</div>
                  <div className="text-base font-semibold text-gray-300 mb-4">{problem.problem}</div>
                  <p className="text-gray-400 leading-relaxed">{problem.description}</p>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-16">
              <div className="elegant-fire text-2xl font-bold text-gray-300 max-w-4xl mx-auto">
                Great talents have to ask for permission. <span className="text-fire">That's a broken system.</span>
              </div>
            </div>
          </div>
        </section>

        {/* The Solution - Platformary */}
        <section id="burn" className="relative py-24 px-6">
          
          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="elegant-fire text-6xl md:text-7xl font-black mb-12 fire-gradient flame-text">
                WE GIVE YOU THE TOOLS
              </h3>
              <p className="text-3xl text-white mb-16 max-w-5xl mx-auto leading-relaxed font-semibold">
                <span className="text-[#10B981]">Greenlit</span> is your solution. 
                Create, control, and distribute <span className="text-fire">without permission</span>.
              </p>
            </motion.div>
            
            <div className="grid lg:grid-cols-2 gap-12 mt-20 text-left">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="rebellious-card rounded-xl p-8"
              >
                <h4 className="elegant-fire text-3xl font-bold mb-6 fire-gradient">🎬 Create Your Vision</h4>
                <ul className="space-y-4 text-lg text-gray-300">
                  <li>• <span className="text-[#10B981] font-semibold">AI showrunner</span> generates episodes in minutes</li>
                  <li>• <span className="text-[#10B981] font-semibold">Full creative control</span> over every story beat</li>
                  <li>• <span className="text-[#10B981] font-semibold">Professional scripts</span>, storyboards, production guides</li>
                  <li>• <span className="text-[#10B981] font-semibold">No committees</span>, no compromise, no gatekeepers</li>
                </ul>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="rebellious-card rounded-xl p-8"
              >
                <h4 className="elegant-fire text-3xl font-bold mb-6 fire-gradient">⚡ Build Your Series</h4>
                <ul className="space-y-4 text-lg text-gray-300">
                  <li>• <span className="text-[#10B981] font-semibold">60% ownership</span> of all your content</li>
                  <li>• <span className="text-[#10B981] font-semibold">Direct-to-audience</span> distribution</li>
                  <li>• <span className="text-[#10B981] font-semibold">Fan monetization</span> from day 1</li>
                  <li>• <span className="text-[#10B981] font-semibold">From idea to screen</span> in hours, not years</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Production Pipeline - Aggressive */}
        <section id="launch" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h3 className="elegant-fire text-6xl md:text-7xl font-black mb-8 fire-gradient">
                START YOUR SERIES
              </h3>
              <p className="text-2xl text-gray-300">Four steps from idea to series</p>
            </motion.div>
            
            <div className="grid lg:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Spark", desc: "Drop your idea into the platform", time: "45 min", icon: "💡", color: "#10B981" },
                { step: "02", title: "Ignite", desc: "AI generates your series bible", time: "Real-time", icon: "🔥", color: "#FF6B00" },
                { step: "03", title: "Blaze", desc: "Produce episodes with AI", time: "1-2 hours", icon: "🎬", color: "#D62828" },
                { step: "04", title: "Launch", desc: "Distribute to your audience", time: "Instant", icon: "🚀", color: "#10B981" }
              ].map((step, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="text-center relative"
                >
                  <div className="rebellious-card rounded-xl p-8 h-full">
                    <div className="text-6xl mb-6" style={{ filter: `drop-shadow(0 0 10px ${step.color})` }}>
                      {step.icon}
                    </div>
                    <div className="elegant-fire text-lg font-bold mb-2" style={{ color: step.color }}>{step.step}</div>
                    <h4 className="elegant-fire text-2xl font-bold mb-4 text-white">{step.title}</h4>
                    <div className="text-[#10B981] font-semibold mb-4">({step.time})</div>
                    <p className="text-gray-300 leading-relaxed">{step.desc}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 text-[#10B981] text-3xl transform -translate-y-1/2">
                      →
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Platformary Team */}
        <section id="rebels" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h3 className="elegant-fire text-6xl md:text-7xl font-bold mb-8 fire-gradient">
                The Founders
              </h3>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Built by an actress who lived the pain and a builder on a mission to <span className="text-fire font-semibold">disrupt the studio system</span>
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="rebellious-card rounded-xl p-8"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 ember-shadow rounded-xl flex items-center justify-center">
                    <span className="text-4xl">🎭</span>
                  </div>
                  <div>
                    <h4 className="elegant-fire text-2xl font-bold fire-gradient">Maty Luarca</h4>
                    <div className="text-[#10B981] font-semibold">Co-Founder & Actress</div>
                  </div>
                </div>
                <div className="space-y-3 text-gray-300">
                  <div>• <span className="text-[#10B981] font-semibold">Star Magic Meisner</span> Program Graduate</div>
                  <div>• <span className="text-[#10B981] font-semibold">Multiple Theatre</span> Organizations</div>
                  <div>• <span className="text-[#10B981] font-semibold">Content Creator</span> & Brand Model</div>
                  <div>• <span className="text-[#10B981] font-semibold">Experienced</span> industry challenges firsthand</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="rebellious-card rounded-xl p-8"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 ember-shadow rounded-xl flex items-center justify-center">
                    <span className="text-4xl">🚀</span>
                  </div>
                  <div>
                    <h4 className="elegant-fire text-2xl font-bold fire-gradient">Johannes Cortez</h4>
                    <div className="text-[#10B981] font-semibold">CEO & Technical Co-Founder</div>
                  </div>
                </div>
                <div className="space-y-3 text-gray-300">
                  <div>• <span className="text-[#10B981] font-semibold">6 years building</span> tech startups</div>
                  <div>• <span className="text-[#10B981] font-semibold">2 venture-backed</span> startups</div>
                  <div>• <span className="text-[#10B981] font-semibold">Helped 80k+ gamers</span> earn globally</div>
                  <div>• <span className="text-[#10B981] font-semibold">On a mission</span> to redistribute power</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final Platformary CTA */}
        <section className="relative py-32 px-6 overflow-hidden">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center max-w-5xl mx-auto"
          >
            <h3 className="elegant-fire text-6xl md:text-7xl font-bold mb-8 fire-gradient flame-text">
              Ready to Launch?
            </h3>
            <p className="text-3xl text-white mb-8 leading-relaxed font-semibold">
              Stop waiting for permission. 
            </p>
            <p className="text-4xl mb-16 leading-relaxed font-bold">
              <span className="text-[#10B981] flame-text">Start your series today.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-10 justify-center items-center">
              <button className="burn-button text-black text-2xl font-bold px-16 py-6 rounded-xl transform hover:scale-105 transition-all duration-300">
                Start Your Series
              </button>
            </div>
            
            <div className="mt-12 text-gray-400 text-lg">
              No permission required • 60% ownership • Join the platform
            </div>
          </motion.div>
        </section>

        {/* Platformary Footer */}
        <footer className="bg-black border-t border-[#FF6B00]/30 py-12 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 ember-shadow rounded-lg flex items-center justify-center">
                <span className="text-4xl">🔥</span>
              </div>
              <h3 className="elegant-fire text-3xl font-bold fire-gradient">Greenlit</h3>
            </div>
            <p className="text-gray-500 mb-8 text-lg">Build Your Own. Launch Your Series.</p>
            <div className="flex justify-center space-x-8 text-gray-400">
              <a href="#" className="hover:text-[#10B981] transition-colors font-medium">Platform</a>
              <a href="#" className="hover:text-[#10B981] transition-colors font-medium">Platform</a>
              <a href="#" className="hover:text-[#10B981] transition-colors font-medium">Founders</a>
              <a href="#" className="hover:text-[#10B981] transition-colors font-medium">Contact</a>
            </div>
            <div className="border-t border-[#10B981]/30 mt-8 pt-8 text-gray-500">
              <p>&copy; 2024 Greenlit. Empowering actors to create their own content.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
