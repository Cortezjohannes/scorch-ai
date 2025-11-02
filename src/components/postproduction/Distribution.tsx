'use client'

import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ExportPreset {
  id: string
  name: string
  resolution: string
  format: string
  bitrate: string
}

interface VideoMetadata {
  title: string
  description: string
  tags: string[]
  thumbnail: string | null
}

interface Dialogue {
  character: string
  lines: string
  emotion: string
}

interface Scene {
  number: number
  location: string
  description: string
  dialogues: Dialogue[]
}

interface Episode {
  number: number
  title: string
  synopsis: string
  scenes: Scene[]
}

export function Distribution() {
  const router = useRouter()
  const [selectedExport, setSelectedExport] = useState<string>('preset1')
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [exportProgress, setExportProgress] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [processingStage, setProcessingStage] = useState<string>('')
  const [isPublishing, setIsPublishing] = useState<boolean>(false)
  const [publishProgress, setPublishProgress] = useState<number>(0)
  const thumbnailRef = useRef<HTMLInputElement>(null)
  
  const [episodeContent, setEpisodeContent] = useState<Episode>({
    number: 9,
    title: "The Price of Truth",
    synopsis: "Lia's exposé on the S4's wrongdoings goes viral, causing chaos at Westbridge and forcing Damon to choose between his loyalty to his friends and his growing feelings for Lia.",
    scenes: [
      {
        number: 1,
        location: "Westbridge Academy - Courtyard",
        description: "Students gather around their phones, buzzing with gossip. The atmosphere is tense and chaotic.",
        dialogues: [
          {
            character: "Sofia Mendoza",
            lines: "Lia, you did it! Everyone's talking about it!",
            emotion: "Excited, but also worried"
          },
          {
            character: "Lia Reyes",
            lines: "I just hope it was worth it. I don't want anyone to get hurt.",
            emotion: "Determined, but apprehensive"
          }
        ]
      },
      {
        number: 2,
        location: "Velasco Mansion - Damon's Room",
        description: "Damon paces angrily, phone clutched in his hand. He's bombarded with calls and messages.",
        dialogues: [
          {
            character: "Damon Velasco",
            lines: "This is insane! How could she do this?",
            emotion: "Angry, betrayed"
          }
        ]
      }
    ]
  });
  
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata>({
    title: "",
    description: "",
    tags: [],
    thumbnail: null
  })
  
  // Load pre-production data from localStorage
  useEffect(() => {
    const content = localStorage.getItem('preproduction-content')
    if (content) {
      try {
        const parsedContent = JSON.parse(content)
        
        // Find episode 9 (The Price of Truth) or use the first one
        if (parsedContent.script && parsedContent.script.episodes && parsedContent.script.episodes.length > 0) {
          const episode9 = parsedContent.script.episodes.find((ep: any) => ep.number === 9)
          const targetEpisode = episode9 || parsedContent.script.episodes[0]
          
          if (targetEpisode) {
            setEpisodeContent({
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
  
  useEffect(() => {
    const title = `${episodeContent.title} - Westbridge S1E${episodeContent.number}`;
    
    const description = episodeContent.synopsis;
    
    // Extract character names from scenes
    const characterTags = episodeContent.scenes
      .flatMap(scene => scene.dialogues.map(d => d.character))
      .filter((character, index, self) => self.indexOf(character) === index);
    
    // Extract location names from scenes
    const locationTags = episodeContent.scenes
      .map(scene => scene.location.split(' - ')[0])
      .filter((location, index, self) => self.indexOf(location) === index);
    
    // Extract emotion tags from dialogues
    const emotionTags = episodeContent.scenes
      .flatMap(scene => scene.dialogues.map(d => d.emotion.split(', ')[0]))
      .filter((emotion, index, self) => self.indexOf(emotion) === index);
    
    const baseTags = ["westbridge", "drama", "teen", "scorched original"];
    const allTags = [...baseTags, ...characterTags, ...locationTags, ...emotionTags.slice(0, 3)];
    
    setVideoMetadata({
      title,
      description,
      tags: allTags,
      thumbnail: null
    });
  }, [episodeContent]);
  
  const exportPresets: ExportPreset[] = [
    { id: 'preset1', name: 'High Quality (4K)', resolution: '3840x2160', format: 'MP4 (H.265)', bitrate: '45 Mbps' },
    { id: 'preset2', name: 'Standard (1080p)', resolution: '1920x1080', format: 'MP4 (H.264)', bitrate: '20 Mbps' },
    { id: 'preset3', name: 'Web Optimized (720p)', resolution: '1280x720', format: 'MP4 (H.264)', bitrate: '10 Mbps' },
    { id: 'preset4', name: 'Mobile (480p)', resolution: '854x480', format: 'MP4 (H.264)', bitrate: '5 Mbps' },
    { id: 'preset5', name: 'Reeled App Optimized', resolution: '1080x1920', format: 'MP4 (H.264)', bitrate: '15 Mbps' }
  ]
  
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setVideoMetadata({...videoMetadata, thumbnail: url})
    }
  }
  
  const triggerThumbnailUpload = () => {
    if (thumbnailRef.current) {
      thumbnailRef.current.click()
    }
  }
  
  const handleInputChange = (field: keyof VideoMetadata, value: string) => {
    if (field === 'tags') {
      setVideoMetadata({...videoMetadata, tags: value.split(',').map(tag => tag.trim())})
    } else {
      setVideoMetadata({...videoMetadata, [field]: value})
    }
  }
  
  const startExport = () => {
    setIsExporting(true)
    setProcessingStage('Preparing video files')
    setExportProgress(0)
    
    let progress = 0
    const interval = setInterval(() => {
      progress += 4
      setExportProgress(progress)
      
      if (progress === 20) {
        setProcessingStage('AI optimizing color grading')
      } else if (progress === 40) {
        setProcessingStage('AI enhancing audio quality')
      } else if (progress === 60) {
        setProcessingStage('Applying smart compression')
      } else if (progress === 80) {
        setProcessingStage('Optimizing for Reeled platform')
      }
      
      if (progress >= 100) {
        clearInterval(interval)
        setProcessingStage('Export complete')
        setTimeout(() => {
          setIsExporting(false)
          setExportProgress(0)
          setIsProcessing(true)
          simulateAIProcessing()
        }, 1000)
      }
    }, 300)
  }
  
  const simulateAIProcessing = () => {
    setProcessingStage('AI analyzing content')
    
    setTimeout(() => {
      setProcessingStage('AI generating tags')
      setTimeout(() => {
        setProcessingStage('AI optimizing metadata')
        setTimeout(() => {
          setProcessingStage('AI creating thumbnail options')
          setTimeout(() => {
            setIsProcessing(false)
            setProcessingStage('')
          }, 2000)
        }, 1500)
      }, 1500)
    }, 1500)
  }
  
  const publishToReeled = () => {
    setIsPublishing(true)
    setPublishProgress(0)
    
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setPublishProgress(progress)
      
      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsPublishing(false)
          // Redirect to analytics page
          const queryParams = new URLSearchParams({
            title: videoMetadata.title,
            synopsis: videoMetadata.description
          }).toString()
          
          router.push(`/analytics?${queryParams}`)
        }, 1000)
      }
    }, 200)
  }
  
  const generateAIThumbnail = () => {
    setIsProcessing(true);
    setProcessingStage('AI generating thumbnail based on script');
    
    setTimeout(() => {
      setVideoMetadata({
        ...videoMetadata,
        thumbnail: '/episode-thumbnail.jpg'
      });
      setIsProcessing(false);
      setProcessingStage('');
    }, 3000);
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-[#e2c376]">Distribution</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <motion.button
            className="btn-secondary text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isExporting || isProcessing || isPublishing}
          >
            Save Draft
          </motion.button>
          <motion.button
            className="btn-primary text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startExport}
            disabled={isExporting || isProcessing || isPublishing}
          >
            {isExporting ? 'Exporting...' : 'Export for Reeled'}
          </motion.button>
        </div>
      </div>
      
      <div className="bg-[#2a2a2a] border border-[#e2c376]/30 rounded-lg p-3 sm:p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 bg-[#e2c376]/20 rounded-md flex items-center justify-center mr-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#e2c376]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-sm sm:text-base text-[#e7e7e7] font-medium flex items-center flex-wrap">
              Episode {episodeContent.number}: {episodeContent.title}
              <span className="ml-2 text-xs bg-[#e2c376]/20 text-[#e2c376] px-1.5 py-0.5 rounded-sm">
                SOURCE
              </span>
            </h3>
            <p className="text-xs text-[#e7e7e7]/70">
              {episodeContent.scenes.length} scenes • {episodeContent.scenes.reduce((count, scene) => count + scene.dialogues.length, 0)} dialogues
            </p>
          </div>
        </div>
      </div>
      
      {(isExporting || isProcessing) && (
        <div className="bg-[#2a2a2a] border border-[#e2c376]/30 rounded-lg p-3 sm:p-4 flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 mr-3 sm:mr-4 relative">
            <div className="absolute inset-0 border-4 border-[#e2c376] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-[#e2c376] rounded-full flex items-center justify-center text-black font-bold text-xs sm:text-sm">
              AI
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm sm:text-base text-[#e7e7e7] font-medium">AI Processing</h3>
            <p className="text-xs sm:text-sm text-[#e7e7e7]/70">{processingStage}</p>
            {isExporting && (
              <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden mt-2">
                <motion.div 
                  className="h-full bg-[#e2c376]"
                  initial={{ width: 0 }}
                  animate={{ width: `${exportProgress}%` }}
                  transition={{ duration: 0.3 }}
                ></motion.div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4">
          <h3 className="text-sm sm:text-base text-[#e7e7e7] font-medium mb-3 sm:mb-4">Reeled Export Settings</h3>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-xs sm:text-sm text-[#e7e7e7]/70 block mb-2">Quality Preset</label>
              <div className="grid grid-cols-1 gap-2">
                {exportPresets.map(preset => (
                  <motion.div
                    key={preset.id}
                    className={`p-2 sm:p-3 rounded border ${
                      selectedExport === preset.id 
                        ? 'border-[#e2c376] bg-[#2a2a2a]' 
                        : 'border-[#2a2a2a] hover:bg-[#2a2a2a]/50'
                    } ${preset.id === 'preset5' ? 'ring-1 ring-[#e2c376]/30' : ''}`}
                    whileHover={{ y: -2 }}
                    onClick={() => setSelectedExport(preset.id)}
                  >
                    <div className="flex justify-between">
                      <h4 className="text-xs sm:text-sm text-[#e7e7e7] font-medium">
                        {preset.name}
                        {preset.id === 'preset5' && (
                          <span className="ml-2 text-[10px] sm:text-xs bg-[#e2c376] text-black px-1 sm:px-1.5 py-0.5 rounded-sm">
                            RECOMMENDED
                          </span>
                        )}
                      </h4>
                      {selectedExport === preset.id && (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#e2c376]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-xs text-[#e7e7e7]/70 mt-1">
                      {preset.resolution} • {preset.format} • {preset.bitrate}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs sm:text-sm text-[#e7e7e7]/70 flex items-center">
                    AI Audio Enhancement
                    <span className="ml-2 text-[10px] sm:text-xs bg-[#e2c376]/20 text-[#e2c376] px-1 sm:px-1.5 py-0.5 rounded-sm">
                      AI
                    </span>
                  </label>
                  <p className="text-[10px] sm:text-xs text-[#e7e7e7]/50">Improves vocal clarity and reduces noise</p>
                </div>
                <div className="relative inline-block w-8 h-4 sm:w-10 sm:h-5 rounded-full bg-[#e2c376]">
                  <input type="checkbox" className="sr-only" checked readOnly />
                  <span className="absolute right-1 top-1 bg-black w-2 h-2 sm:w-3 sm:h-3 rounded-full"></span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs sm:text-sm text-[#e7e7e7]/70 flex items-center">
                    Smart Compression
                    <span className="ml-2 text-[10px] sm:text-xs bg-[#e2c376]/20 text-[#e2c376] px-1 sm:px-1.5 py-0.5 rounded-sm">
                      AI
                    </span>
                  </label>
                  <p className="text-[10px] sm:text-xs text-[#e7e7e7]/50">Optimizes file size without quality loss</p>
                </div>
                <div className="relative inline-block w-8 h-4 sm:w-10 sm:h-5 rounded-full bg-[#e2c376]">
                  <input type="checkbox" className="sr-only" checked readOnly />
                  <span className="absolute right-1 top-1 bg-black w-2 h-2 sm:w-3 sm:h-3 rounded-full"></span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs sm:text-sm text-[#e7e7e7]/70 flex items-center">
                    Auto-Generate Subtitles
                    <span className="ml-2 text-[10px] sm:text-xs bg-[#e2c376]/20 text-[#e2c376] px-1 sm:px-1.5 py-0.5 rounded-sm">
                      AI
                    </span>
                  </label>
                  <p className="text-[10px] sm:text-xs text-[#e7e7e7]/50">Creates accurate captions automatically</p>
                </div>
                <div className="relative inline-block w-8 h-4 sm:w-10 sm:h-5 rounded-full bg-[#e2c376]">
                  <input type="checkbox" className="sr-only" checked readOnly />
                  <span className="absolute right-1 top-1 bg-black w-2 h-2 sm:w-3 sm:h-3 rounded-full"></span>
                </div>
              </div>
            </div>
          </div>
          
          {isExporting && (
            <div className="mt-4 sm:mt-6 space-y-2">
              <div className="flex justify-between text-xs text-[#e7e7e7]/70">
                <span>AI processing export...</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="w-full h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#e2c376]"
                  initial={{ width: 0 }}
                  animate={{ width: `${exportProgress}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
              <p className="text-xs text-[#e7e7e7]/70">
                {isExporting ? `${processingStage}` : 'Ready to export'}
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4">
          <h3 className="text-sm sm:text-base text-[#e7e7e7] font-medium mb-3 sm:mb-4">Reeled App Distribution</h3>
          
          <div className="mb-6">
            <div className="flex items-center bg-[#2a2a2a] p-3 rounded-lg mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 text-xl bg-[#e2c376]/20 text-[#e2c376]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-[#e7e7e7] font-medium">Reeled</h4>
                <p className="text-[#e7e7e7]/70 text-xs">
                  Exclusive distribution on the Reeled platform
                </p>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-[#e2c376] bg-[#e2c376]">
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
            
            <div className="bg-[#2a2a2a]/40 rounded-lg p-3 border border-[#2a2a2a]">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-[#e2c376] mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
                <p className="text-sm text-[#e7e7e7]/90">
                  Content will be exclusively distributed on Reeled's platform for maximum engagement and monetization opportunities.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-[#e7e7e7] text-sm font-medium mb-3 flex items-center">
              Content Details
              <span className="ml-2 text-xs bg-[#e2c376]/20 text-[#e2c376] px-1.5 py-0.5 rounded-sm">
                FROM EPISODE SCRIPT
              </span>
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="text-[#e7e7e7]/70 text-xs block mb-1 flex items-center">
                  Video Title
                  <button className="ml-1 text-[#e2c376]/70 hover:text-[#e2c376] text-xs">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
                    </svg>
                  </button>
                  <span className="ml-auto text-xs bg-[#e2c376]/20 text-[#e2c376] px-1.5 py-0.5 rounded-sm">
                    AI SUGGESTED
                  </span>
                </label>
                <input 
                  type="text" 
                  className="w-full bg-[#2a2a2a] border border-[#2a2a2a] rounded p-2 text-[#e7e7e7]"
                  placeholder="Enter video title"
                  value={videoMetadata.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-[#e7e7e7]/70 text-xs block mb-1 flex items-center">
                  Description
                  <span className="ml-auto text-xs bg-[#e2c376]/20 text-[#e2c376] px-1.5 py-0.5 rounded-sm">
                    AI ENHANCED
                  </span>
                </label>
                <textarea 
                  className="w-full bg-[#2a2a2a] border border-[#2a2a2a] rounded p-2 text-[#e7e7e7] h-20"
                  placeholder="Enter video description"
                  value={videoMetadata.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                ></textarea>
              </div>
              
              <div>
                <label className="text-[#e7e7e7]/70 text-xs block mb-1 flex items-center">
                  Tags (comma separated)
                  <span className="ml-auto text-xs bg-[#e2c376]/20 text-[#e2c376] px-1.5 py-0.5 rounded-sm">
                    AI GENERATED
                  </span>
                </label>
                <input 
                  type="text" 
                  className="w-full bg-[#2a2a2a] border border-[#2a2a2a] rounded p-2 text-[#e7e7e7]"
                  placeholder="Enter tags"
                  value={videoMetadata.tags.join(', ')}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-[#e7e7e7]/70 text-xs block mb-1 flex items-center">
                  Thumbnail
                  {!videoMetadata.thumbnail && (
                    <button 
                      className="ml-2 text-xs bg-[#e2c376] text-black px-1.5 py-0.5 rounded-sm flex items-center"
                      onClick={generateAIThumbnail}
                      disabled={isProcessing}
                    >
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"></path>
                      </svg>
                      GENERATE FROM SCRIPT
                    </button>
                  )}
                </label>
                {videoMetadata.thumbnail ? (
                  <div className="relative aspect-video rounded overflow-hidden">
                    <img src={videoMetadata.thumbnail} className="w-full h-full object-cover" alt="Thumbnail" />
                    <div className="absolute bottom-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                      <span className="text-[#e2c376] font-bold mr-1">AI</span> Generated from script
                    </div>
                    <button 
                      className="absolute top-2 right-2 bg-black/70 rounded-full p-1 hover:bg-black"
                      onClick={() => setVideoMetadata({...videoMetadata, thumbnail: null})}
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-[#2a2a2a] rounded p-6 text-center cursor-pointer hover:border-[#e2c376]/50 transition-colors"
                    onClick={triggerThumbnailUpload}
                  >
                    <div className="w-12 h-12 mx-auto bg-[#2a2a2a] rounded-full flex items-center justify-center mb-2">
                      <svg className="w-6 h-6 text-[#e7e7e7]/50" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <p className="text-[#e7e7e7]/70 text-sm">Click to upload thumbnail</p>
                    <p className="text-[#e7e7e7]/50 text-xs mt-1">or generate from script</p>
                    <input 
                      type="file" 
                      ref={thumbnailRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-[#e7e7e7]/70 text-xs block mb-2 flex items-center">
                  Key Frames
                  <span className="ml-2 text-xs bg-[#e2c376]/20 text-[#e2c376] px-1.5 py-0.5 rounded-sm">
                    FROM EDITED SCENES
                  </span>
                </label>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {episodeContent.scenes.slice(0, 3).map((scene, index) => (
                    <div key={index} className="w-24 h-16 flex-shrink-0 bg-[#2a2a2a] rounded overflow-hidden relative group">
                      <div className="absolute inset-0 flex items-center justify-center text-[#e7e7e7]/30 group-hover:text-[#e7e7e7]">
                        Scene {scene.number}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-[10px] text-white px-1 truncate">
                        {scene.location.split(' - ')[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <motion.button
          className={`btn-primary ${(isExporting || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
          whileHover={(isExporting || isProcessing) ? {} : { scale: 1.02 }}
          whileTap={(isExporting || isProcessing) ? {} : { scale: 0.98 }}
          onClick={publishToReeled}
          disabled={isExporting || isProcessing}
        >
          {isPublishing ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-transparent border-t-black rounded-full animate-spin mr-2"></div>
              <span>Publishing to Reeled ({publishProgress}%)</span>
            </div>
          ) : "Publish to Reeled"}
        </motion.button>
      </div>
    </div>
  )
} 