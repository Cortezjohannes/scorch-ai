'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { uploadImageToStorage } from '@/services/image-storage-service'
import { hashPrompt } from '@/services/image-cache-service'
import { updatePreProduction } from '@/services/preproduction-firestore'
import type { StoryboardsData } from '@/types/preproduction'

interface TestResult {
  success: boolean
  step: string
  message: string
  data?: any
  error?: any
}

export default function StoryboardTestPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [storageUrl, setStorageUrl] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('A cinematic storyboard frame showing a person standing by a window overlooking a city at night')
  const [savedToFirestore, setSavedToFirestore] = useState(false)
  const [loadedFromFirestore, setLoadedFromFirestore] = useState<string | null>(null)

  // Test IDs - will be created on first save
  const TEST_STORY_BIBLE_ID = 'storyboard-test-bible'
  const TEST_PREPRODUCTION_ID = 'storyboard-test-preproduction'
  const TEST_EPISODE_NUMBER = 999 // Use episode 999 for testing

  // Helper function to add test results
  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result])
    console.log(`📊 [${result.step}] ${result.success ? '✅' : '❌'} ${result.message}`, result.data || result.error)
  }

  // Clear results when auth state changes
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setResults([])
      setError(null)
    } else if (isAuthenticated) {
      setError(null)
    }
  }, [authLoading, isAuthenticated])

  // Check for persisted image from Firestore on mount
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const loadFromFirestore = async () => {
      try {
        addResult({
          success: true,
          step: '🔍 Firestore Load',
          message: 'Checking Firestore for saved image...'
        })

        // Import here to avoid SSR issues
        const { getEpisodePreProduction, subscribeToPreProduction } = await import('@/services/preproduction-firestore')
        
        // Query by episode number to find the document (more reliable than document ID)
        addResult({
          success: true,
          step: '🔍 Firestore Load',
          message: `Querying Firestore for episode ${TEST_EPISODE_NUMBER}...`
        })

        const existingPreProduction = await getEpisodePreProduction(
          user.id,
          TEST_STORY_BIBLE_ID,
          TEST_EPISODE_NUMBER
        )

        if (!existingPreProduction || !existingPreProduction.id) {
          addResult({
            success: true,
            step: 'ℹ️ Firestore Load',
            message: 'No preproduction document found. Run the test first to create and save an image.'
          })
          return
        }

        const preProductionDocId = existingPreProduction.id
        
        addResult({
          success: true,
          step: '🔍 Firestore Load',
          message: `Found preproduction document (ID: ${preProductionDocId.substring(0, 20)}...)`
        })

        // Save the ID to localStorage for future reference
        const storageKey = `storyboard-test-preproduction-id-${user.id}`
        localStorage.setItem(storageKey, preProductionDocId)
        
        // Subscribe to pre-production data using the found document ID
        const unsubscribe = subscribeToPreProduction(
          user.id,
          TEST_STORY_BIBLE_ID,
          preProductionDocId,
          (data) => {
            if (data && data.type === 'episode' && data.storyboards) {
              const storyboards = data.storyboards
              const framesWithImages = storyboards.scenes?.flatMap(scene => 
                scene.frames?.filter(frame => frame.frameImage) || []
              ) || []

              if (framesWithImages.length > 0) {
                const frame = framesWithImages[0]
                const imageUrl = frame.frameImage
                
                if (imageUrl && 
                    (imageUrl.startsWith('https://firebasestorage.googleapis.com/') || 
                     imageUrl.startsWith('https://storage.googleapis.com/'))) {
                  setLoadedFromFirestore(imageUrl)
                  addResult({
                    success: true,
                    step: '✅ Firestore Load Success',
                    message: 'Image loaded from Firestore after refresh!',
                    data: {
                      frameId: frame.id,
                      scene: frame.sceneNumber,
                      shot: frame.shotNumber,
                      url: imageUrl.substring(0, 60) + '...'
                    }
                  })
                  
                  // Log full URL
                  console.log('🔗 FULL Storage URL loaded from Firestore:', imageUrl)
                  
                  // Verify image loads
                  verifyImageLoad(imageUrl, 'Firestore')
                } else {
                  addResult({
                    success: false,
                    step: '⚠️ Firestore Load',
                    message: 'Found image in Firestore but not a Storage URL',
                    data: { imageType: imageUrl?.substring(0, 50) || 'none' }
                  })
                }
              } else {
                addResult({
                  success: true,
                  step: 'ℹ️ Firestore Load',
                  message: 'No images found in Firestore yet (this is normal for first run)'
                })
              }
              
              // Unsubscribe after first load
              unsubscribe()
            }
          }
        )
        
        // Timeout after 5 seconds
        setTimeout(() => {
          unsubscribe()
        }, 5000)
        
      } catch (err: any) {
        addResult({
          success: false,
          step: '❌ Firestore Load Error',
          message: `Failed to load from Firestore: ${err.message}`,
          error: err
        })
      }
    }

    loadFromFirestore()
  }, [isAuthenticated, user])

  const verifyImageLoad = async (url: string, source: string) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        addResult({
          success: true,
          step: `✅ Image Verification (${source})`,
          message: `Image verified! Dimensions: ${img.width}x${img.height}`,
          data: { width: img.width, height: img.height }
        })
        resolve(true)
      }
      img.onerror = () => {
        addResult({
          success: false,
          step: `❌ Image Verification Failed (${source})`,
          message: 'Image failed to load from Storage URL',
          error: { url: url.substring(0, 60) + '...' }
        })
        resolve(false)
      }
      img.src = url
    })
  }

  const runTest = async () => {
    if (!isAuthenticated || !user) {
      setError('You must be signed in to test storyboard image flow')
      return
    }

    setTesting(true)
    setError(null)
    setResults([])
    setGeneratedImageUrl(null)
    setStorageUrl(null)
    setSavedToFirestore(false)
    setLoadedFromFirestore(null)

    try {
      // Step 1: Check authentication
      addResult({
        success: true,
        step: '1. Authentication',
        message: `Authenticated as ${user.displayName || user.email || user.id}`,
        data: { userId: user.id }
      })

      // Step 2: Generate image via API (same as storyboard)
      addResult({
        success: true,
        step: '2. Image Generation',
        message: `Generating image with prompt: "${prompt.substring(0, 50)}..."`
      })

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          userId: user.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      const imageUrl = result.imageUrl || result.url

      if (!imageUrl) {
        throw new Error('No image URL in API response')
      }

      addResult({
        success: true,
        step: '2. Image Generation',
        message: 'Image generated successfully!',
        data: {
          imageType: imageUrl.startsWith('data:') ? 'base64' : 'external URL',
          imageLength: imageUrl.length,
          source: result.source || 'unknown'
        }
      })

      // Log full URL if it's external
      if (!imageUrl.startsWith('data:')) {
        console.log('🔗 FULL Image URL from API:', imageUrl)
      }

      setGeneratedImageUrl(imageUrl)

      // Step 3: Upload to Firebase Storage (same as storyboard)
      let finalStorageUrl: string

      // Check if API already returned a Storage URL
      const isAlreadyStorageUrl = imageUrl.includes('firebasestorage.googleapis.com') || 
                                   imageUrl.startsWith('https://storage.googleapis.com/')
      
      if (isAlreadyStorageUrl) {
        addResult({
          success: true,
          step: '3. Storage Upload',
          message: 'API returned Storage URL - skipping upload'
        })
        console.log('🔗 FULL Storage URL from API:', imageUrl)
        finalStorageUrl = imageUrl
      } else {
        // Upload to Storage client-side
        addResult({
          success: true,
          step: '3. Storage Upload',
          message: 'Uploading to Firebase Storage (client-side)...'
        })

        // Prepare image data - convert external URLs to base64 if needed
        let imageDataToUpload = imageUrl
        if (!imageUrl.startsWith('data:')) {
          addResult({
            success: true,
            step: '3.1. Download External Image',
            message: 'Downloading external image to convert for Storage upload...'
          })
          const imageResponse = await fetch(imageUrl)
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch external image: ${imageResponse.statusText}`)
          }
          const imageBlob = await imageResponse.blob()
          imageDataToUpload = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(imageBlob)
          })
        }
        
        // Generate hash for Storage path
        const promptHash = await hashPrompt(prompt)
        console.log(`🔑 Hash generated: ${promptHash.substring(0, 16)}...`)
        
        // Upload to Storage
        finalStorageUrl = await uploadImageToStorage(user.id, imageDataToUpload, promptHash)
        
        addResult({
          success: true,
          step: '3. Storage Upload',
          message: 'Image uploaded successfully to Firebase Storage!',
          data: { storageUrl: finalStorageUrl.substring(0, 60) + '...' }
        })
        
        // Log full Storage URL
        console.log('🔗 FULL Storage URL:', finalStorageUrl)
      }

      setStorageUrl(finalStorageUrl)

      // Validate Storage URL
      if (!finalStorageUrl.startsWith('https://firebasestorage.googleapis.com/') && 
          !finalStorageUrl.startsWith('https://storage.googleapis.com/')) {
        throw new Error(`Invalid Storage URL format: ${finalStorageUrl.substring(0, 50)}`)
      }

      // Verify image loads from Storage
      await verifyImageLoad(finalStorageUrl, 'Storage')

      // Step 4: Save to Firestore (same as storyboard)
      addResult({
        success: true,
        step: '4. Save to Firestore',
        message: 'Preparing to save Storage URL to Firestore...'
      })

      // Create a test frame with the Storage URL (all required fields)
      const testFrame = {
        id: `test-frame-${Date.now()}`,
        sceneNumber: 1,
        shotNumber: '1',
        frameImage: finalStorageUrl, // Storage URL only!
        imagePrompt: prompt,
        notes: 'Test frame created by storyboard-test page',
        cameraAngle: 'Medium',
        cameraMovement: 'Static',
        dialogueSnippet: '',
        lightingNotes: '',
        propsInFrame: [],
        referenceImages: [],
        status: 'draft' as const,
        comments: []
      }

      const storyboardsData: StoryboardsData = {
        episodeNumber: TEST_EPISODE_NUMBER,
        episodeTitle: 'Storyboard Test Episode',
        totalFrames: 1,
        finalizedFrames: 0,
        scenes: [{
          sceneNumber: 1,
          sceneTitle: 'Test Scene',
          frames: [testFrame]
        }],
        lastUpdated: Date.now(),
        updatedBy: user.id
      }

      // Step 4.1: Create preproduction document if it doesn't exist
      addResult({
        success: true,
        step: '4.1. Create Preproduction Document',
        message: 'Creating preproduction document if needed...'
      })

      const { createEpisodePreProduction, getEpisodePreProduction } = await import('@/services/preproduction-firestore')
      
      let preProductionDocId: string
      try {
        // Query by episode number to find existing document
        const existing = await getEpisodePreProduction(
          user.id,
          TEST_STORY_BIBLE_ID,
          TEST_EPISODE_NUMBER
        )
        
        if (!existing || !existing.id) {
          // Create new document
          preProductionDocId = await createEpisodePreProduction(
            user.id,
            TEST_STORY_BIBLE_ID,
            TEST_EPISODE_NUMBER,
            'Storyboard Test Episode'
          )
          addResult({
            success: true,
            step: '4.1. Create Preproduction Document',
            message: 'Created new preproduction document',
            data: { preProductionId: preProductionDocId }
          })
        } else {
          preProductionDocId = existing.id
          addResult({
            success: true,
            step: '4.1. Create Preproduction Document',
            message: 'Preproduction document already exists',
            data: { preProductionId: preProductionDocId }
          })
        }
      } catch (createError: any) {
        // If get fails, try to create
        try {
          preProductionDocId = await createEpisodePreProduction(
            user.id,
            TEST_STORY_BIBLE_ID,
            TEST_EPISODE_NUMBER,
            'Storyboard Test Episode'
          )
          addResult({
            success: true,
            step: '4.1. Create Preproduction Document',
            message: 'Created new preproduction document (after get failed)',
            data: { preProductionId: preProductionDocId }
          })
        } catch (err: any) {
          throw new Error(`Failed to create/get preproduction document: ${err.message}`)
        }
      }

      // Step 4.2: Save using updatePreProduction (same as storyboard)
      // Correct signature: updatePreProduction(docId, updates, userId, storyBibleId)
      await updatePreProduction(
        preProductionDocId,
        { storyboards: storyboardsData },
        user.id,
        TEST_STORY_BIBLE_ID
      )

      addResult({
        success: true,
        step: '4.2. Save to Firestore',
        message: 'Storage URL saved successfully to Firestore!',
        data: {
          preProductionId: preProductionDocId,
          storyBibleId: TEST_STORY_BIBLE_ID,
          frameId: testFrame.id,
          storageUrl: finalStorageUrl.substring(0, 60) + '...'
        }
      })

      // Log full Storage URL being saved
      console.log('🔗 FULL Storage URL saved to Firestore:', finalStorageUrl)

      // Save the preproduction ID to localStorage so we can load it after refresh
      const storageKey = `storyboard-test-preproduction-id-${user.id}`
      localStorage.setItem(storageKey, preProductionDocId)
      console.log('💾 Saved preproduction ID to localStorage:', {
        key: storageKey,
        id: preProductionDocId
      })

      setSavedToFirestore(true)

      // Step 5: Test complete
      addResult({
        success: true,
        step: '✅ Test Complete',
        message: 'Storyboard image flow completed successfully! Refresh the page to verify persistence.',
        data: {
          preProductionId: preProductionDocId,
          note: 'ID saved to localStorage for persistence check'
        }
      })

    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred'
      setError(errorMessage)
      addResult({
        success: false,
        step: '❌ Test Failed',
        message: errorMessage,
        error: err
      })
      console.error('Test error:', err)
    } finally {
      setTesting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[rgb(18,18,18)] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
          <p className="text-[#e7e7e7]/70">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[rgb(18,18,18)] text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-red-400 text-xl mb-4">🔒</div>
          <h1 className="text-xl font-bold mb-2">Authentication Required</h1>
          <p className="text-[#e7e7e7]/70 mb-6">
            You must be signed in to test the storyboard image flow.
          </p>
        </div>
      </div>
    )
  }

  const displayedImageUrl = loadedFromFirestore || storageUrl || generatedImageUrl

  return (
    <div className="min-h-screen bg-[rgb(18,18,18)] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Storyboard Image Flow Test</h1>
          <p className="text-[#e7e7e7]/70">
            This page tests the complete storyboard image flow: Generate → Upload to Storage → Save to Firestore → Load after refresh
          </p>
        </div>

        {/* Image Display */}
        {displayedImageUrl && (
          <div className="mb-8 bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {loadedFromFirestore ? '✅ Image Loaded from Firestore (After Refresh)' : 
               savedToFirestore ? '✅ Image Saved to Firestore' :
               storageUrl ? '✅ Image Uploaded to Storage' :
               '📸 Generated Image'}
            </h2>
            <div className="relative w-full max-w-2xl mx-auto">
              <img
                src={displayedImageUrl}
                alt="Test storyboard image"
                className="w-full h-auto rounded border border-[#36393f]"
                onError={(e) => {
                  console.error('Image failed to load:', displayedImageUrl)
                  addResult({
                    success: false,
                    step: '❌ Image Display Error',
                    message: 'Image failed to load in display',
                    error: { url: displayedImageUrl.substring(0, 60) + '...' }
                  })
                }}
                onLoad={() => {
                  console.log('✅ Image displayed successfully')
                }}
              />
              <div className="mt-4 text-sm text-[#e7e7e7]/60">
                <p className="break-all">URL: {displayedImageUrl.substring(0, 100)}...</p>
                {loadedFromFirestore && (
                  <p className="mt-2 text-[#10B981]">
                    ✅ This image was loaded from Firestore after a page refresh!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mb-8 bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Image Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-[#36393f] rounded px-4 py-2 text-white"
              rows={3}
              disabled={testing}
            />
          </div>

          <button
            onClick={runTest}
            disabled={testing || !prompt.trim()}
            className="px-6 py-3 bg-[#10B981] text-white rounded font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? 'Running Test...' : '🚀 Run Complete Test'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded text-red-400">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Test Results */}
        <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          {results.length === 0 && (
            <p className="text-[#e7e7e7]/50 italic">No test results yet. Click "Run Complete Test" to start.</p>
          )}

          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${
                  result.success
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                <div className="font-medium">{result.step}: {result.message}</div>
                {result.data && (
                  <div className="mt-1 text-sm opacity-75">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(result.data, null, 2)}</pre>
                  </div>
                )}
                {result.error && (
                  <div className="mt-1 text-sm opacity-75">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(result.error, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How to Test</h2>
          <ol className="list-decimal list-inside space-y-2 text-[#e7e7e7]/70">
            <li>Click "Run Complete Test" to generate and save an image</li>
            <li>Wait for all steps to complete (you'll see green checkmarks)</li>
            <li>Refresh the page (F5 or Cmd+R)</li>
            <li>The image should automatically load from Firestore</li>
            <li>Check the console logs for detailed Storage URLs</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

