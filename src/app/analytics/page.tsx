'use client'

import { useRouter } from 'next/navigation'
import { motion } from '@/components/ui/ClientMotion'
import { useState, useEffect, Suspense } from 'react'

interface Metric {
  title: string;
  value: string | number;
  change: number;
  icon: string;
  color: string;
}

interface AIContribution {
  stage: string;
  features: {
    name: string;
    description: string;
    confidence: number;
  }[];
}

interface ViewerDemographic {
  age: string;
  percentage: number;
}

interface ViewerEngagement {
  time: string;
  viewCount: number;
}

interface Episode {
  number: number;
  title: string;
  synopsis: string;
  scenes: {
    number: number;
    location: string;
    description: string;
    dialogues: {
      character: string;
      lines: string;
      emotion: string;
    }[];
  }[];
}

function AnalyticsContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [preproductionData, setPreproductionData] = useState<any>(null)
  const [episodeData, setEpisodeData] = useState<Episode | null>(null)
  
  // Load pre-production data from localStorage
  useEffect(() => {
    const content = localStorage.getItem('preproduction-content')
    if (content) {
      try {
        const parsedContent = JSON.parse(content)
        setPreproductionData(parsedContent)
        
        // If we have script data with episodes, extract the first episode
        if (parsedContent.script && parsedContent.script.episodes && parsedContent.script.episodes.length > 0) {
          // Find episode 9 (The Price of Truth) or use the first one
          const episode9 = parsedContent.script.episodes.find((ep: any) => ep.number === 9)
          const targetEpisode = episode9 || parsedContent.script.episodes[0]
          
          if (targetEpisode) {
            setEpisodeData({
              number: targetEpisode.number || 9,
              title: targetEpisode.title || "The Price of Truth",
              synopsis: targetEpisode.synopsis || "Lia's exposé on the S4's wrongdoings goes viral, causing chaos at Westbridge and forcing Damon to choose between his loyalty to his friends and his growing feelings for Lia.",
              scenes: targetEpisode.scenes || []
            })
          }
        }
      } catch (err) {
        console.error('Error parsing pre-production content:', err)
      }
    }
  }, [])
  
  // Sample data for the dashboard
  const [metrics, setMetrics] = useState<Metric[]>([
    { 
      title: 'Total Views', 
      value: '0', 
      change: 0, 
      icon: '👁️', 
      color: 'bg-blue-500'
    },
    { 
      title: 'Watch Time', 
      value: '0 mins', 
      change: 0, 
      icon: '⏱️', 
      color: 'bg-purple-500'
    },
    { 
      title: 'Completion Rate', 
      value: '0%', 
      change: 0, 
      icon: '✓', 
      color: 'bg-green-500'
    },
    { 
      title: 'Audience Score', 
      value: '0', 
      change: 0, 
      icon: '⭐', 
      color: 'bg-yellow-500'
    },
  ])
  
  const [aiContributions, setAiContributions] = useState<AIContribution[]>([
    {
      stage: 'Pre-production',
      features: [
        {
          name: 'Script Generation',
          description: 'AI generated full episode script based on your synopsis',
          confidence: 92
        },
        {
          name: 'Character Development',
          description: 'AI crafted detailed character profiles and arcs',
          confidence: 88
        },
        {
          name: 'Scene Visualization',
          description: 'AI created visual storyboards for key scenes',
          confidence: 85
        }
      ]
    },
    {
      stage: 'Post-production',
      features: [
        {
          name: 'Scene Detection',
          description: 'AI identified and indexed scenes for easier editing',
          confidence: 94
        },
        {
          name: 'Color Grading',
          description: 'AI applied consistent color treatment across scenes',
          confidence: 89
        },
        {
          name: 'Audio Enhancement',
          description: 'AI improved audio clarity and reduced background noise',
          confidence: 91
        }
      ]
    },
    {
      stage: 'Distribution',
      features: [
        {
          name: 'Metadata Generation',
          description: 'AI created optimized titles, descriptions and tags',
          confidence: 95
        },
        {
          name: 'Thumbnail Creation',
          description: 'AI generated high-engagement thumbnails',
          confidence: 87
        },
        {
          name: 'Audience Targeting',
          description: 'AI identified ideal audience segments',
          confidence: 90
        }
      ]
    }
  ])
  
  const [viewerDemographics, setViewerDemographics] = useState<ViewerDemographic[]>([
    { age: '13-17', percentage: 15 },
    { age: '18-24', percentage: 35 },
    { age: '25-34', percentage: 28 },
    { age: '35-44', percentage: 12 },
    { age: '45+', percentage: 10 }
  ])
  
  const [engagementData, setEngagementData] = useState<ViewerEngagement[]>([
    { time: '00:00', viewCount: 1000 },
    { time: '01:00', viewCount: 950 },
    { time: '02:00', viewCount: 920 },
    { time: '03:00', viewCount: 850 },
    { time: '04:00', viewCount: 800 },
    { time: '05:00', viewCount: 780 },
    { time: '06:00', viewCount: 760 },
    { time: '07:00', viewCount: 730 },
    { time: '08:00', viewCount: 700 },
    { time: '09:00', viewCount: 690 },
  ])
  
  const episodeTitle = episodeData ? `${episodeData.title} - Westbridge S1E${episodeData.number}` : 'The Price of Truth - Westbridge S1E9'
  const episodeSynopsis = episodeData ? episodeData.synopsis : "Lia's exposé on the S4's wrongdoings goes viral, causing chaos at Westbridge and forcing Damon to choose between his loyalty to his friends and his growing feelings for Lia."

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
      
      // Update metrics with random data
      setMetrics([
        { 
          title: 'Total Views', 
          value: '1,204', 
          change: 14.2, 
          icon: '👁️', 
          color: 'bg-blue-500' 
        },
        { 
          title: 'Watch Time', 
          value: '6.8 mins', 
          change: 8.7, 
          icon: '⏱️', 
          color: 'bg-purple-500' 
        },
        { 
          title: 'Completion Rate', 
          value: '68%', 
          change: 12.3, 
          icon: '✓', 
          color: 'bg-green-500' 
        },
        { 
          title: 'Audience Score', 
          value: '4.2/5', 
          change: 6.8, 
          icon: '⭐', 
          color: 'bg-yellow-500' 
        },
      ])
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  const handleBack = () => {
    router.back()
  }
  
  // Extract keywords from episode data or use defaults
  const getKeywords = () => {
    const defaultKeywords = ['teen drama', 'high school', 'journalism', 'romance', 'friendship', 'betrayal', 'social issues']
    
    if (!preproductionData || !preproductionData.narrative) return defaultKeywords
    
    const extractedKeywords = []
    
    // Extract themes from narrative
    if (preproductionData.narrative.themes) {
      extractedKeywords.push(...preproductionData.narrative.themes)
    }
    
    // Extract character names
    if (preproductionData.casting && preproductionData.casting.characters) {
      const mainCharacters = preproductionData.casting.characters
        .filter((char: any) => char && char.importance === 'Main' || char.importance === 'Supporting')
        .map((char: any) => char.name)
      
      extractedKeywords.push(...mainCharacters.slice(0, 3))
    }
    
    // Extract settings
    if (preproductionData.narrative && preproductionData.narrative.setting) {
      extractedKeywords.push(preproductionData.narrative.setting.location)
      extractedKeywords.push(preproductionData.narrative.setting.period)
    }
    
    // Return a mix of extracted and default keywords
    return [...new Set([...extractedKeywords, ...defaultKeywords])].slice(0, 8)
  }

  // Render the retention graph
  const renderRetentionGraph = () => {
    const maxViews = Math.max(...engagementData.map(item => item.viewCount))
    
    return (
      <div className="h-60 flex items-end space-x-2">
        {engagementData.map((item, index) => {
          const height = (item.viewCount / maxViews) * 100
          
          return (
            <div key={index} className="relative flex-1 flex flex-col items-center group">
              <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-[#36393f] px-2 py-1 rounded pointer-events-none z-10">
                {item.viewCount} viewers
              </div>
              <div 
                className="w-full bg-[#e2c376] hover:bg-[#d4b46a] transition-colors rounded-t"
                style={{ height: `${height}%` }}
              ></div>
              <div className="text-xs text-[#e7e7e7]/60 mt-1">{item.time}</div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white" style={{ fontFamily: 'League Spartan, sans-serif' }}>
      {/* Fire Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-20 -z-10"
      >
        <source src="/fire_background.mp4" type="video/mp4" />
      </video>

      <div className="container mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Revolutionary Header */}
        <div className="flex items-center justify-between">
          <div>
            <motion.div
              className="inline-flex items-center space-x-4 mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-16 h-16 ember-shadow rounded-xl flex items-center justify-center animate-emberFloat">
                <span className="text-3xl">📊</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black elegant-fire fire-gradient animate-flameFlicker">
                REVOLUTIONARY ANALYTICS
              </h1>
            </motion.div>
            <p className="text-white/90 mt-2 text-lg elegant-fire">
              {episodeTitle}
            </p>
          </div>
          
          <motion.button
            onClick={handleBack}
            className="px-6 py-3 rounded-xl border-2 border-[#e2c376] text-[#e2c376] hover:bg-[#e2c376] hover:text-black transition-all duration-300 font-black"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← RETURN TO EMPIRE
          </motion.button>
        </div>
        
        {/* Revolutionary Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <motion.div 
              className="w-20 h-20 border-4 border-[#e2c376] border-t-[#D62828] rounded-full animate-spin mb-6"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <p className="text-white/90 text-lg elegant-fire">Generating revolutionary analytics for {episodeTitle.split(' - ')[0]}...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Revolutionary Success Banner */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rebellious-card border-[#e2c376]/60 p-6 flex items-center gap-6"
            >
              <div className="bg-[#e2c376]/20 rounded-full p-4">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h3 className="font-black text-[#e2c376] text-xl elegant-fire">REVOLUTIONARY PUBLISHING SUCCESS!</h3>
                <p className="text-white/90 text-lg elegant-fire">Your Westbridge episode is now available on Reeled. Track its revolutionary performance below.</p>
              </div>
            </motion.div>
            
            {/* Revolutionary Metrics Overview */}
            <section>
              <h2 className="text-2xl font-black mb-6 elegant-fire">REVOLUTIONARY PERFORMANCE METRICS</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="rebellious-card p-6"
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`${metric.color} bg-opacity-20 rounded-md p-2 text-xl`}>
                        {metric.icon}
                      </div>
                      <span className="text-sm text-[#e7e7e7]/70">{metric.title}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <div className={`text-sm ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
            
            {/* AI Contributions */}
            <section>
              <h2 className="text-xl font-semibold mb-4">AI Contributions</h2>
              <div className="bg-[#2a2b30] rounded-lg border border-[#36393f] overflow-hidden">
                <div className="p-4 border-b border-[#36393f] flex items-center justify-between">
                  <h3 className="font-medium">AI-Assisted Creation</h3>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                    Powered by Reeled AI
                  </span>
                </div>
                
                <div className="divide-y divide-[#36393f]">
                  {aiContributions.map((contribution, index) => (
                    <div key={index} className="p-4">
                      <h4 className="font-medium text-[#e2c376] mb-2">{contribution.stage}</h4>
                      <div className="space-y-3">
                        {contribution.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="h-4 w-4 rounded-full bg-blue-500/30 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium">{feature.name}</h5>
                                <span className="text-xs bg-[#36393f] px-2 py-0.5 rounded">
                                  {feature.confidence}% confidence
                                </span>
                              </div>
                              <p className="text-sm text-[#e7e7e7]/70 mt-0.5">{feature.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            
            {/* Script and Synopsis */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Content Details</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#2a2b30] rounded-lg border border-[#36393f] p-4">
                  <h3 className="font-medium mb-3">Synopsis</h3>
                  <p className="text-[#e7e7e7]/80 text-sm">
                    {episodeSynopsis}
                  </p>
                  
                  <h3 className="font-medium mt-4 mb-3">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {getKeywords().map((tag, index) => (
                      <span key={index} className="text-xs bg-[#36393f] px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[#2a2b30] rounded-lg border border-[#36393f] overflow-hidden">
                  <div className="p-4 border-b border-[#36393f] flex items-center justify-between">
                    <h3 className="font-medium">Script Scenes</h3>
                    <button className="text-xs bg-[#36393f] hover:bg-[#4f535a] transition-colors px-2 py-1 rounded">
                      View Full Script
                    </button>
                  </div>
                  
                  <div className="divide-y divide-[#36393f] max-h-60 overflow-y-auto">
                    {episodeData && episodeData.scenes && episodeData.scenes.length > 0 ? (
                      episodeData.scenes.slice(0, 3).map((scene, index) => (
                        <div key={index} className="p-3">
                          <div className="text-xs text-[#e7e7e7]/50 mb-1">Scene {scene.number} - {scene.location}</div>
                          <p className="text-sm">{scene.description}</p>
                          {scene.dialogues && scene.dialogues.length > 0 && (
                            <div className="mt-2 pl-3 border-l-2 border-[#e2c376] space-y-2">
                              {scene.dialogues.slice(0, 2).map((dialogue, dialogueIndex) => (
                                <div key={dialogueIndex} className="text-sm">
                                  <span className="text-[#e2c376]">{dialogue.character}:</span> {dialogue.lines}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="p-3">
                          <div className="text-xs text-[#e7e7e7]/50 mb-1">Scene 1 - Westbridge Academy - Courtyard</div>
                          <p className="text-sm">Students gather around their phones, buzzing with gossip. The atmosphere is tense and chaotic.</p>
                          <div className="mt-2 pl-3 border-l-2 border-[#e2c376] space-y-2">
                            <div className="text-sm">
                              <span className="text-[#e2c376]">Sofia Mendoza:</span> Lia, you did it! Everyone's talking about it!
                            </div>
                            <div className="text-sm">
                              <span className="text-[#e2c376]">Lia Reyes:</span> I just hope it was worth it. I don't want anyone to get hurt.
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3">
                          <div className="text-xs text-[#e7e7e7]/50 mb-1">Scene 2 - Velasco Mansion - Damon's Room</div>
                          <p className="text-sm">Damon paces angrily, phone clutched in his hand. He's bombarded with calls and messages.</p>
                          <div className="mt-2 pl-3 border-l-2 border-[#e2c376] space-y-2">
                            <div className="text-sm">
                              <span className="text-[#e2c376]">Damon Velasco:</span> This is insane! How could she do this?
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>
            
            {/* Audience Insights */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Audience Insights</h2>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Demographics */}
                <div className="lg:col-span-2 bg-[#2a2b30] rounded-lg border border-[#36393f] p-4">
                  <h3 className="font-medium mb-4">Viewer Demographics</h3>
                  <div className="space-y-3">
                    {viewerDemographics.map((demographic, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{demographic.age}</span>
                          <span>{demographic.percentage}%</span>
                        </div>
                        <div className="h-2 bg-[#36393f] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#e2c376]" 
                            style={{ width: `${demographic.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-[#36393f]">
                    <h4 className="text-sm font-medium mb-3">Top Locations</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>United States</span>
                        <span>42%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Philippines</span>
                        <span>18%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Canada</span>
                        <span>12%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>United Kingdom</span>
                        <span>8%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Engagement */}
                <div className="lg:col-span-3 bg-[#2a2b30] rounded-lg border border-[#36393f] p-4">
                  <h3 className="font-medium mb-4">Viewer Retention</h3>
                  {renderRetentionGraph()}
                  
                  <div className="mt-6 pt-4 border-t border-[#36393f] grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-3">Key Moments</h4>
                      <div className="space-y-2">
                        <div className="p-2 bg-[#36393f] rounded text-xs">
                          <div className="text-[#e2c376] mb-1">02:14 - Engagement Spike</div>
                          <div>Confrontation between Lia and Damon</div>
                        </div>
                        <div className="p-2 bg-[#36393f] rounded text-xs">
                          <div className="text-[#e2c376] mb-1">05:32 - Peak Viewership</div>
                          <div>Emotional reveal of Sofia's secret</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-3">Engagement Actions</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Likes</span>
                          <div className="text-sm font-medium flex items-center gap-1.5">
                            <span>487</span>
                            <span className="text-xs text-green-500">+12%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Comments</span>
                          <div className="text-sm font-medium flex items-center gap-1.5">
                            <span>86</span>
                            <span className="text-xs text-green-500">+8%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Shares</span>
                          <div className="text-sm font-medium flex items-center gap-1.5">
                            <span>124</span>
                            <span className="text-xs text-green-500">+24%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Saves</span>
                          <div className="text-sm font-medium flex items-center gap-1.5">
                            <span>152</span>
                            <span className="text-xs text-green-500">+18%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Recommendations */}
            <section>
              <h2 className="text-xl font-semibold mb-4">AI Recommendations</h2>
              <div className="bg-[#2a2b30] rounded-lg border border-[#36393f] p-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/20 rounded-full p-2 flex-shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-400">Content Optimization Suggestions</h3>
                    <p className="text-sm text-[#e7e7e7]/70 mt-1 mb-3">
                      Based on audience engagement and similar content performance, our AI has the following recommendations:
                    </p>
                    <div className="space-y-3">
                      <div className="bg-[#36393f] rounded-md p-3">
                        <h4 className="font-medium text-sm">Consider shorter scene transitions</h4>
                        <p className="text-xs text-[#e7e7e7]/70 mt-1">
                          Viewer retention drops during longer scene transitions. Consider more dynamic cuts between scenes to maintain engagement.
                        </p>
                      </div>
                      <div className="bg-[#36393f] rounded-md p-3">
                        <h4 className="font-medium text-sm">Expand emotional moments</h4>
                        <p className="text-xs text-[#e7e7e7]/70 mt-1">
                          Scenes with emotional dialogue between Lia and Damon saw 24% higher engagement. Consider developing more of these interactions.
                        </p>
                      </div>
                      <div className="bg-[#36393f] rounded-md p-3">
                        <h4 className="font-medium text-sm">Target younger demographics</h4>
                        <p className="text-xs text-[#e7e7e7]/70 mt-1">
                          Your content performs exceptionally well with 18-24 age group. Consider promotion strategies that target this demographic for future episodes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: 'League Spartan, sans-serif' }}>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 ember-shadow rounded-xl flex items-center justify-center mx-auto mb-6 animate-emberFloat"
          >
            <span className="text-4xl">🔥</span>
          </motion.div>
          <p className="text-white/90 text-lg elegant-fire">Loading analytics...</p>
        </motion.div>
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  )
} 