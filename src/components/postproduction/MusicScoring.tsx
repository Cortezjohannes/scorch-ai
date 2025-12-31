'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface MusicTrack {
  id: string
  name: string
  artist: string
  duration: string
  thumbnail: string
  genre: string
  mood: string[]
  sceneReference?: string
  characterReference?: string
  aiGenerated?: boolean
}

interface MusicScoringProps {
  storyBibleId?: string
  episodeNumber?: number
  arcIndex?: number | null
  arcEpisodes?: number[]
}

export function MusicScoring({ storyBibleId, episodeNumber, arcIndex, arcEpisodes }: MusicScoringProps) {
  const searchParams = useSearchParams()
  const synopsis = searchParams.get('synopsis') || ''
  const theme = searchParams.get('theme') || ''
  
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [filterMood, setFilterMood] = useState<string>('all')
  const [playerProgress, setPlayerProgress] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [generationProgress, setGenerationProgress] = useState<number>(0)
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [episodeData, setEpisodeData] = useState<any>(null)
  
  // Attempt to load pre-production data from localStorage
  useEffect(() => {
    const content = localStorage.getItem('preproduction-content')
    if (content) {
      try {
        const parsedContent = JSON.parse(content)
        setEpisodeData(parsedContent)
      } catch (err) {
        console.error('Error parsing pre-production content:', err)
      }
    }
  }, [])
  
  // Moods based on the Westbridge teen drama themes
  const moods = ['All', 'Dramatic', 'Tension', 'Romance', 'Friendship', 'Betrayal', 'Revelation', 'Coming-of-age']
  
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([
    {
      id: '1',
      name: 'Westbridge Main Theme',
      artist: 'Reeled Audio',
      duration: '3:42',
      thumbnail: '/music1.jpg',
      genre: 'Orchestral',
      mood: ['Coming-of-age', 'Drama'],
      sceneReference: 'Opening titles, Character introductions'
    },
    {
      id: '2',
      name: 'Secrets Revealed',
      artist: 'Reeled Composers',
      duration: '2:56',
      thumbnail: '/music2.jpg',
      genre: 'Ambient',
      mood: ['Revelation', 'Tension'],
      sceneReference: 'Lia\'s article reveal, Confrontations'
    },
    {
      id: '3',
      name: 'Academy Hallways',
      artist: 'Westbridge Sound',
      duration: '4:20',
      thumbnail: '/music3.jpg',
      genre: 'Lo-fi',
      mood: ['Friendship', 'Coming-of-age'],
      sceneReference: 'School scenes, Light moments'
    },
    {
      id: '4',
      name: 'Damon\'s Conflict',
      artist: 'Character Themes',
      duration: '2:15',
      thumbnail: '/music4.jpg',
      genre: 'Tension',
      mood: ['Tension', 'Betrayal'],
      characterReference: 'Damon Velasco',
      sceneReference: 'Damon\'s internal struggle scenes'
    },
    {
      id: '5',
      name: 'Lia & Damon',
      artist: 'Relationship Themes',
      duration: '3:36',
      thumbnail: '/music5.jpg',
      genre: 'Classical',
      mood: ['Romance', 'Tension'],
      characterReference: 'Lia Reyes, Damon Velasco',
      sceneReference: 'Romantic development scenes'
    }
  ])
  
  // Start simulated playback
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isPlaying && selectedTrack) {
      interval = setInterval(() => {
        setPlayerProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 300) // faster for demo purposes
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, selectedTrack])
  
  // Generate AI music based on the scene and characters from pre-production
  const generateAIMusic = () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    
    const generationInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(generationInterval)
          setIsGenerating(false)
          
          // Add AI-generated music tracks based on the show's themes and synopsis
          setMusicTracks(prevTracks => [
            ...prevTracks,
            {
              id: `ai-1-${Date.now()}`,
              name: 'The Price of Truth',
              artist: 'AI Composer',
              duration: '2:48',
              thumbnail: '/ai-music1.jpg',
              genre: 'Cinematic',
              mood: ['Dramatic', 'Revelation'],
              sceneReference: 'Lia\'s exposé goes viral',
              characterReference: 'Lia Reyes',
              aiGenerated: true
            },
            {
              id: `ai-2-${Date.now()}`,
              name: 'Loyalty vs. Heart',
              artist: 'AI Composer',
              duration: '3:15',
              thumbnail: '/ai-music2.jpg',
              genre: 'Emotional',
              mood: ['Betrayal', 'Romance'],
              sceneReference: 'Damon chooses between loyalty and feelings',
              characterReference: 'Damon Velasco',
              aiGenerated: true
            },
            {
              id: `ai-3-${Date.now()}`,
              name: 'Sofia\'s Support',
              artist: 'AI Composer',
              duration: '2:36',
              thumbnail: '/ai-music3.jpg',
              genre: 'Acoustic',
              mood: ['Friendship', 'Coming-of-age'],
              sceneReference: 'Sofia supports Lia through chaos',
              characterReference: 'Sofia Mendoza, Lia Reyes',
              aiGenerated: true
            }
          ])
          
          setShowSuggestions(true)
          return 100
        }
        return prev + 0.5
      })
    }, 30)
  }
  
  // Filter tracks by mood
  const filteredTracks = musicTracks.filter(track => 
    filterMood === 'all' ? true : track.mood.includes(filterMood)
  )
  
  // Play selected track
  const playTrack = (trackId: string) => {
    setSelectedTrack(trackId)
    setPlayerProgress(0)
    setIsPlaying(true)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#e2c376]">Musical Scoring</h2>
        <div className="flex space-x-3">
          <motion.button
            className="btn-secondary text-sm px-3 py-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Upload Music
          </motion.button>
          <motion.button
            className="btn-primary text-sm px-3 py-1 flex items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateAIMusic}
            disabled={isGenerating}
          >
            <span className="mr-1">✨</span>
            {isGenerating ? 'Generating...' : 'Generate AI Score for Westbridge'}
          </motion.button>
        </div>
      </div>
      
      {isGenerating && (
        <motion.div 
          className="bg-[#2a2a2a] p-4 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between mb-2">
            <div className="text-[#e7e7e7]">Creating Westbridge Episode Score</div>
            <div className="text-[#e7e7e7]/70">{Math.round(generationProgress)}%</div>
          </div>
          <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#e2c376]"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
          <div className="text-xs text-[#e7e7e7]/70 mt-2">
            {generationProgress < 20 ? 'Analyzing teen drama themes and character dynamics...' : 
             generationProgress < 40 ? 'Identifying emotional moments in Lia & Damon\'s storyline...' : 
             generationProgress < 60 ? 'Composing melody for "The Price of Truth" theme...' : 
             generationProgress < 80 ? 'Creating emotional impact for betrayal moments...' : 
             'Finalizing audio mastering for Westbridge S1E9...'}
          </div>
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Music Library */}
        <div className="lg:col-span-2 space-y-4">
          {/* Mood Filter */}
          <div className="bg-[#1a1a1a] p-3 rounded-lg">
            <h3 className="text-[#e7e7e7] font-medium mb-2">Filter by Emotional Theme</h3>
            <div className="flex flex-wrap gap-2">
              {moods.map(mood => (
                <motion.button
                  key={mood}
                  className={`py-1 px-3 rounded-full text-xs ${
                    (filterMood === mood.toLowerCase() || (filterMood === 'all' && mood === 'All')) 
                      ? 'bg-[#e2c376] text-black' 
                      : 'bg-[#2a2a2a] text-[#e7e7e7]/70'
                  }`}
                  onClick={() => setFilterMood(mood === 'All' ? 'all' : mood)}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  {mood}
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Music Library */}
          <div className="bg-[#1a1a1a] p-3 rounded-lg">
            <h3 className="text-[#e7e7e7] font-medium mb-3">Westbridge Music Library</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredTracks.map(track => (
                <motion.div
                  key={track.id}
                  className={`p-2 rounded-lg cursor-pointer flex items-center ${
                    selectedTrack === track.id 
                      ? 'bg-[#2a2a2a]/80 ring-1 ring-[#e2c376]' 
                      : 'bg-[#2a2a2a] hover:bg-[#2a2a2a]/70'
                  } ${track.aiGenerated ? 'border-l-4 border-[#e2c376]' : ''}`}
                  onClick={() => playTrack(track.id)}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={track.aiGenerated ? { opacity: 0, x: -10 } : {}}
                  animate={track.aiGenerated ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-12 h-12 bg-[#1a1a1a] rounded flex items-center justify-center flex-shrink-0 mr-3 relative overflow-hidden">
                    {/* Album art would go here */}
                    <div className="w-full h-full flex items-center justify-center">
                      {track.mood[0] === 'Romance' ? '💖' :
                       track.mood[0] === 'Tension' ? '⚡' :
                       track.mood[0] === 'Dramatic' ? '🎭' :
                       track.mood[0] === 'Revelation' ? '✨' :
                       track.mood[0] === 'Betrayal' ? '💔' :
                       track.mood[0] === 'Friendship' ? '👫' :
                       track.mood[0] === 'Coming-of-age' ? '🌱' : '🎵'}
                    </div>
                    {track.aiGenerated && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#e2c376] text-[0.6rem] text-black text-center font-bold">
                        AI
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <div className="font-medium truncate">{track.name}</div>
                      <div className="text-xs text-[#e7e7e7]/70">{track.duration}</div>
                    </div>
                    <div className="flex justify-between text-xs text-[#e7e7e7]/70 mt-1">
                      <div className="truncate">{track.artist}</div>
                      <div>{track.genre}</div>
                    </div>
                    {track.characterReference && (
                      <div className="text-xs text-[#e2c376] mt-1 truncate">
                        {track.characterReference}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Panel - Audio Player and Scene Placement */}
        <div className="lg:col-span-3 space-y-4">
          {showSuggestions && (
            <motion.div 
              className="bg-[#1a1a1a] p-4 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-[#e2c376]/20 rounded-full flex items-center justify-center mr-2">
                  <span className="text-[#e2c376]">✨</span>
                </div>
                <h3 className="text-[#e7e7e7] font-medium">AI Music Suggestions for "The Price of Truth"</h3>
              </div>
              <div className="text-sm text-[#e7e7e7]/70 mb-3">
                Based on your episode's emotional arc and character development, our AI has composed these custom tracks:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#2a2a2a] p-3 rounded-lg border-l-4 border-[#e2c376] text-sm">
                  <div className="font-medium">Lia's Exposé Theme</div>
                  <div className="text-xs text-[#e7e7e7]/70 mt-1">Dramatic tension for the article reveal scenes</div>
                </div>
                <div className="bg-[#2a2a2a] p-3 rounded-lg border-l-4 border-[#e2c376] text-sm">
                  <div className="font-medium">Damon's Conflict</div>
                  <div className="text-xs text-[#e7e7e7]/70 mt-1">Internal struggle as Damon makes his choice</div>
                </div>
                <div className="bg-[#2a2a2a] p-3 rounded-lg border-l-4 border-[#e2c376] text-sm">
                  <div className="font-medium">Westbridge Chaos</div>
                  <div className="text-xs text-[#e7e7e7]/70 mt-1">Soundtrack for the school's reaction scenes</div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Audio Player */}
          {selectedTrack && (
            <div className="bg-[#1a1a1a] p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-[#2a2a2a] flex items-center justify-center rounded mr-4">
                  {/* Album art would go here */}
                  <div className="text-3xl">
                    {musicTracks.find(t => t.id === selectedTrack)?.mood[0] === 'Romance' ? '💖' :
                     musicTracks.find(t => t.id === selectedTrack)?.mood[0] === 'Tension' ? '⚡' :
                     musicTracks.find(t => t.id === selectedTrack)?.mood[0] === 'Dramatic' ? '🎭' :
                     musicTracks.find(t => t.id === selectedTrack)?.mood[0] === 'Revelation' ? '✨' :
                     musicTracks.find(t => t.id === selectedTrack)?.mood[0] === 'Betrayal' ? '💔' :
                     musicTracks.find(t => t.id === selectedTrack)?.mood[0] === 'Friendship' ? '👫' :
                     musicTracks.find(t => t.id === selectedTrack)?.mood[0] === 'Coming-of-age' ? '🌱' : '🎵'}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-medium">{musicTracks.find(t => t.id === selectedTrack)?.name}</div>
                  <div className="text-[#e7e7e7]/70">{musicTracks.find(t => t.id === selectedTrack)?.artist}</div>
                  {musicTracks.find(t => t.id === selectedTrack)?.sceneReference && (
                    <div className="text-xs text-[#e2c376] mt-1">
                      Perfect for: {musicTracks.find(t => t.id === selectedTrack)?.sceneReference}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#e7e7e7]/70" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"></path>
                    </svg>
                  </button>
                  <button 
                    className="w-10 h-10 rounded-full bg-[#e2c376] text-black flex items-center justify-center"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                      </svg>
                    )}
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#e7e7e7]/70" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z"></path>
                    </svg>
                  </button>
                  <div className="flex-1 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div className="h-full bg-[#e2c376]" style={{ width: `${playerProgress}%` }}></div>
                  </div>
                  <div className="text-xs text-[#e7e7e7]/70">
                    {`${Math.floor(playerProgress * 0.01 * parseInt(musicTracks.find(t => t.id === selectedTrack)?.duration?.split(':')[0] || '0') * 60 + parseInt(musicTracks.find(t => t.id === selectedTrack)?.duration?.split(':')[1] || '0')) / 60}`.substring(0, 1)}:
                    {`0${Math.floor(playerProgress * 0.01 * parseInt(musicTracks.find(t => t.id === selectedTrack)?.duration?.split(':')[0] || '0') * 60 + parseInt(musicTracks.find(t => t.id === selectedTrack)?.duration?.split(':')[1] || '0')) % 60}`.slice(-2)}
                    {' / '}
                    {musicTracks.find(t => t.id === selectedTrack)?.duration}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Scene and Character Assignment */}
          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <h3 className="text-[#e7e7e7] font-medium mb-3">Westbridge Scene Assignment</h3>
            <div className="space-y-3">
              <div className="border border-[#2a2a2a] p-3 rounded-lg">
                <div className="font-medium mb-2">Scene 1: Westbridge Academy - Courtyard</div>
                <p className="text-sm mb-2">Students gather around their phones, buzzing with gossip. The atmosphere is tense and chaotic.</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-[#e7e7e7]/70">Suggested music:</div>
                  <motion.button 
                    className="text-xs bg-[#2a2a2a] hover:bg-[#36393f] transition-colors px-2 py-1 rounded-full flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => playTrack('2')}
                  >
                    <span className="mr-1">🎵</span>Secrets Revealed
                  </motion.button>
                </div>
              </div>
              
              <div className="border border-[#2a2a2a] p-3 rounded-lg">
                <div className="font-medium mb-2">Scene 2: Velasco Mansion - Damon's Room</div>
                <p className="text-sm mb-2">Damon paces angrily, phone clutched in his hand. He's bombarded with calls and messages.</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-[#e7e7e7]/70">Suggested music:</div>
                  <motion.button 
                    className="text-xs bg-[#2a2a2a] hover:bg-[#36393f] transition-colors px-2 py-1 rounded-full flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => playTrack('4')}
                  >
                    <span className="mr-1">🎵</span>Damon's Conflict
                  </motion.button>
                </div>
              </div>
              
              <div className="border border-[#e2c376]/20 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">Scene 3: Lia & Damon's Confrontation</div>
                  <span className="text-xs bg-[#e2c376]/20 text-[#e2c376] px-2 py-0.5 rounded-full">Emotional Peak</span>
                </div>
                <p className="text-sm mb-2">Damon confronts Lia about the article, torn between anger and his growing feelings for her.</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-[#e7e7e7]/70">Suggested music:</div>
                  <motion.button 
                    className="text-xs bg-[#2a2a2a] hover:bg-[#36393f] transition-colors px-2 py-1 rounded-full flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => playTrack('5')}
                  >
                    <span className="mr-1">🎵</span>Lia & Damon
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 