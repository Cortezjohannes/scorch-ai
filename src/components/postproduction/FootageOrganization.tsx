'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useContext, useEffect } from 'react'
import { useVideo } from '@/context/VideoContext'

export function FootageOrganization() {
  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const { uploadedVideos, addVideos: originalAddVideos, removeVideo, selectedVideo, setSelectedVideo } = useVideo()
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [uploadComplete, setUploadComplete] = useState<boolean>(false)
  const [mockSceneNames, setMockSceneNames] = useState<string[]>([
    'Scene 1 - Opening Shot',
    'Scene 2 - Character Introduction',
    'Scene 3 - Conversation', 
    'Scene 4 - Conflict',
    'Scene 5 - Resolution'
  ])
  
  // Add pre-production compliance check state
  const [showPreproductionCheck, setShowPreproductionCheck] = useState<boolean>(false)
  const [isCheckingPreproduction, setIsCheckingPreproduction] = useState<boolean>(false)
  const [preproductionCheckProgress, setPreproductionCheckProgress] = useState<number>(0)
  const [preproductionChecks, setPreproductionChecks] = useState([
    { id: 'narrative', name: 'Narrative Compliance', status: 'pending', confidence: 0, matchScore: 0 },
    { id: 'storyboard', name: 'Storyboard Adherence', status: 'pending', confidence: 0, matchScore: 0 },
    { id: 'visual-dev', name: 'Visual Development Match', status: 'pending', confidence: 0, matchScore: 0 },
    { id: 'script', name: 'Script Coverage', status: 'pending', confidence: 0, matchScore: 0 },
    { id: 'color-palette', name: 'Color Palette Adherence', status: 'pending', confidence: 0, matchScore: 0 },
    { id: 'shot-composition', name: 'Shot Composition', status: 'pending', confidence: 0, matchScore: 0 },
  ])
  
  // Images for reference from pre-production
  const [preproductionReferences] = useState([
    { type: 'storyboard', src: '/storyboard-1.jpg', frame: 1 },
    { type: 'storyboard', src: '/storyboard-2.jpg', frame: 2 },
    { type: 'visual-dev', src: '/visual-dev-1.jpg', name: 'Main Location' },
    { type: 'visual-dev', src: '/visual-dev-2.jpg', name: 'Character Design' },
  ])
  
  const folders = [
    { id: 'all', name: 'All Footage', count: uploadedVideos.length },
    { id: 'scenes', name: 'Scenes', count: uploadedVideos.filter(v => v.type === 'video').length },
    { id: 'audio', name: 'Audio', count: uploadedVideos.filter(v => v.type === 'audio').length },
    { id: 'other', name: 'Other', count: uploadedVideos.filter(v => v.type === 'image').length },
  ]
  
  // Override addVideos to work entirely client-side with real files
  const addVideos = (files: File[]) => {
    if (!files.length) return;
    
    console.log('Processing files locally:', files.length);
    
    // Mark upload as complete
    setUploadComplete(true);
    
    // Create simple mock files without waiting for metadata
    const mockFiles = Array.from(files).map(file => {
      return {
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2)}`,
        name: file.name,
        url: URL.createObjectURL(file),
        uploadDate: new Date().toISOString(),
        size: file.size,
        type: file.type.includes('video') ? 'video' : 
              file.type.includes('audio') ? 'audio' : 'image',
        status: 'ready' as const,
        duration: 60, // Mock duration
        metadata: {}
      };
    });
    
    // Force update the context
    mockFiles.forEach(mockFile => {
      // @ts-ignore - Type issues don't matter for demo
      originalAddVideos([new File([], mockFile.name)]);
    });
    
    // Always select the first mock file to ensure something is displayed
    if (mockFiles.length > 0) {
      // @ts-ignore - Type issues don't matter for demo
      setSelectedVideo(mockFiles[0]);
    }
    
    // Run pre-production check immediately after upload
    setTimeout(() => {
      runPreproductionCheck();
    }, 100);
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Show upload area only if there are no uploaded videos yet
  const shouldShowUploadArea = uploadedVideos.length === 0;
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log('Files selected via input:', e.target.files.length);
      
      // Create a proper Array from FileList
      const filesArray = Array.from(e.target.files);
      console.log('File types:', filesArray.map(f => f.type).join(', '));
      
      // Use the centralized upload handler
      addVideos(filesArray);
      
      // Reset the input to allow selecting the same file again
      e.target.value = '';
    }
  }
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      console.log('Files dropped:', e.dataTransfer.files.length);
      
      // Create a proper Array from FileList
      const filesArray = Array.from(e.dataTransfer.files);
      console.log('File types:', filesArray.map(f => f.type).join(', '));
      
      // Use the centralized upload handler
      addVideos(filesArray);
    }
  }
  
  // Match uploaded files with scene names for better organization
  useEffect(() => {
    // This is just a mock implementation that matches based on position
    const updatedVideos = uploadedVideos.map((video, index) => {
      if (video.type === 'video' && index < mockSceneNames.length) {
        return {
          ...video,
          matchedSceneName: mockSceneNames[index]
        }
      }
      return video
    })
    
    // We don't actually update the videos here since the context doesn't support this operation
    // This would update matchedSceneName in a real implementation
  }, [uploadedVideos, mockSceneNames])
  
  // Function to simulate pre-production compliance check
  const runPreproductionCheck = () => {
    setIsCheckingPreproduction(true)
    setPreproductionCheckProgress(0)
    setShowPreproductionCheck(true)
    
    // Reset all checks to pending
    setPreproductionChecks(checks => 
      checks.map(check => ({ ...check, status: 'pending', confidence: 0, matchScore: 0 }))
    )
    
    // Simulate progress - faster to complete quickly
    const progressInterval = setInterval(() => {
      setPreproductionCheckProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 4 // Faster progress
      })
    }, 25) // Faster interval
    
    // Simulate checking each item with delays
    preproductionChecks.forEach((check, index) => {
      setTimeout(() => {
        setPreproductionChecks(prev => {
          return prev.map((c, i) => {
            if (i === index) {
              // Generate random confidence and match scores for visual effect
              const confidence = Math.floor(Math.random() * 30) + 65 // 65-94%
              const matchScore = Math.floor(Math.random() * 36) + 60 // 60-95%
              
              return { 
                ...c, 
                status: 'checking',
                confidence: 0,
                matchScore: 0
              }
            }
            return c
          })
        })
        
        // Animate the confidence score going up for this check
        let confidenceCounter = 0
        let matchCounter = 0
        const confidenceInterval = setInterval(() => {
          confidenceCounter += 5 // Faster confidence increase
          matchCounter += 5 // Faster match score increase
          
          setPreproductionChecks(prev => {
            return prev.map((c, i) => {
              if (i === index) {
                // Generate random confidence and match scores
                const confidence = Math.floor(Math.random() * 30) + 65 // 65-94%
                const matchScore = Math.floor(Math.random() * 36) + 60 // 60-95%
                
                return { 
                  ...c, 
                  confidence: Math.min(confidenceCounter, confidence),
                  matchScore: Math.min(matchCounter, matchScore) 
                }
              }
              return c
            })
          })
          
          if (confidenceCounter >= 100) {
            clearInterval(confidenceInterval)
            
            // Mark as completed after confidence reaches target
            setPreproductionChecks(prev => {
              return prev.map((c, i) => {
                if (i === index) {
                  return { ...c, status: 'completed' }
                }
                return c
              })
            })
          }
        }, 10) // Faster interval
      }, index * 300) // Faster stagger time
    })
    
    // Finish checking after all items are processed - faster completion
    setTimeout(() => {
      setIsCheckingPreproduction(false)
    }, preproductionChecks.length * 300 + 500) // Faster completion time
  }
  
  // Add or update the thumbnail display for videos
  const renderVideoThumbnails = () => {
    // If no videos, show empty state or placeholders
    if (uploadedVideos.length === 0) return null;
    
    console.log('Displaying videos:', uploadedVideos.length);
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Video Preview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedVideos.map((video, index) => (
            <motion.div 
              key={video.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`relative rounded-lg overflow-hidden cursor-pointer border-2 ${
                selectedVideo?.id === video.id ? 'border-[#e2c376]' : 'border-transparent'
              }`}
              onClick={() => {
                // @ts-ignore - Ignore type errors for functionality
                setSelectedVideo(video);
              }}
            >
              <div className="aspect-video bg-black relative group">
                {/* Video thumbnail */}
                {video.type === 'video' ? (
                  <div className="w-full h-full bg-[#1e1e20] flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#e2c376]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                ) : video.type === 'image' ? (
                  <div className="w-full h-full bg-[#1e1e20] flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#e2c376]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#1e1e20] flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#e2c376]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.06-7.072m-1.06 7.072a9 9 0 001.06-12.728"></path>
                    </svg>
                  </div>
                )}
                
                {/* File type indicator */}
                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                  {video.type.toUpperCase()}
                </div>
                
                {/* File name */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-1 px-2">
                  <div className="text-xs font-medium truncate text-white">{video.name}</div>
                </div>
                
                {/* Selected indicator */}
                {selectedVideo?.id === video.id && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-[#e2c376] rounded-full p-1">
                      <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Add the formatDuration helper function
  const formatDuration = (seconds?: number): string => {
    if (seconds === undefined) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Auto-run pre-production check if not already shown
  useEffect(() => {
    // Always show pre-production check, even without uploads
    if (!showPreproductionCheck && !isCheckingPreproduction) {
      runPreproductionCheck();
    }
  }, [showPreproductionCheck, isCheckingPreproduction]);
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-[#e2c376]">Footage Organization</h2>
        
        <div className="flex space-x-2">
            <button 
              onClick={runPreproductionCheck}
              className="cursor-pointer px-3 py-2 rounded-md bg-[#36393f] text-white font-medium hover:bg-[#4f535a] transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Run Pre-Production Check
            </button>
          <label className="btn-primary cursor-pointer px-3 py-2 rounded-md bg-[#e2c376] text-black font-medium hover:bg-[#d4b46a] transition-colors">
            Upload Files
            <input 
              type="file" 
              multiple 
              accept="video/*,audio/*,image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>
      
      {/* Drag and drop area */}
      {shouldShowUploadArea && (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
            dragActive ? 'border-[#e2c376] bg-[#e2c376]/10' : 'border-gray-600'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p className="text-gray-300">
              Drag and drop your footage files here, or click <label className="text-[#e2c376] cursor-pointer">browse<input type="file" multiple accept="video/*,audio/*,image/*" className="hidden" onChange={handleFileChange} /></label>
            </p>
            <p className="text-gray-500 text-sm">Supports video, audio, and image files</p>
          </div>
        </div>
      )}
      
      {/* Pre-production compliance check panel */}
      <AnimatePresence>
        {showPreproductionCheck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-blue-500/30 bg-blue-500/5 rounded-lg p-4 space-y-4"
          >
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-blue-400 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                Pre-Production Compliance
                </h3>
                <div className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-xs font-medium">
                  AI
                </div>
              </div>
              
              {isCheckingPreproduction && (
              <div>
                  <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Checking against pre-production assets...</span>
                    <span className="text-sm">{preproductionCheckProgress}%</span>
                  </div>
                  <div className="h-2 bg-[#36393f] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300" 
                      style={{ width: `${preproductionCheckProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {preproductionChecks.map(check => (
                    <div 
                      key={check.id} 
                  className="border border-blue-500/20 bg-blue-500/10 rounded-md p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-blue-300">{check.name}</h4>
                    <div className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-xs">
                      {check.status === 'completed' ? 'COMPLETE' : 'CHECKING'}
                      </div>
                        </div>
                        
                        {check.status === 'checking' && (
                    <div className="w-full h-1 bg-[#36393f] rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-blue-500 animate-pulse"></div>
                          </div>
                        )}
                        
                        {check.status === 'completed' && (
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Confidence</span>
                          <span>{check.confidence}%</span>
                        </div>
                        <div className="w-full h-1 bg-[#36393f] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${check.confidence}%` }}
                          ></div>
                          </div>
                </div>
                
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Match Score</span>
                          <span>{check.matchScore}%</span>
                        </div>
                        <div className="w-full h-1 bg-[#36393f] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${check.matchScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                      </div>
                    ))}
                  </div>
                  
            {!isCheckingPreproduction && (
              <div className="flex justify-between items-center pt-2">
                <div className="text-blue-300 text-sm">
                  Pre-production assets analyzed successfully
                </div>
                    <button 
                      onClick={runPreproductionCheck}
                      className="text-xs px-3 py-1.5 bg-[#36393f] hover:bg-[#4f535a] rounded transition-colors"
                    >
                  Re-check
                    </button>
                  </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Folder navigation */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
            className={`px-3 py-1.5 rounded-md text-sm flex items-center space-x-1.5 whitespace-nowrap ${
                  selectedFolder === folder.id 
                ? 'bg-[#e2c376] text-black font-medium'
                : 'bg-[#36393f] text-white hover:bg-[#4f535a]'
                }`}
              >
            <span>{folder.name}</span>
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-black/20">{folder.count}</span>
              </button>
            ))}
          </div>
      
      {/* Video thumbnails */}
      {renderVideoThumbnails()}
    </div>
  )
} 