'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { uploadImageToStorage } from '@/services/image-storage-service'
import { hashPrompt } from '@/services/image-cache-service'

interface TestResult {
  success: boolean
  step: string
  message: string
  data?: any
  error?: any
}

export default function StorageTestPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [persistedImageUrl, setPersistedImageUrl] = useState<string | null>(null)
  const [checkingPersistence, setCheckingPersistence] = useState(false)

  // Helper function to add test results
  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result])
    console.log(`📊 [${result.step}] ${result.success ? '✅' : '❌'} ${result.message}`, result.data || result.error)
  }

  // Clear results when auth state changes
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setResults([])
      setError(null) // Don't show error here, the login check handles it
    } else if (isAuthenticated) {
      setError(null) // Clear error when authenticated
    }
  }, [authLoading, isAuthenticated])

  // Check for persisted image on mount (after refresh)
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const checkPersistedImage = async () => {
      const storageKey = `storage-test-image-${user.id}`
      const savedUrl = localStorage.getItem(storageKey)

      if (savedUrl) {
        setCheckingPersistence(true)
        setPersistedImageUrl(savedUrl)

        // Verify the image still loads from Storage
        addResult({
          success: true,
          step: '🔍 Persistence Check',
          message: 'Found previously uploaded image. Verifying it still loads from Storage...',
          data: { savedUrl: savedUrl.substring(0, 60) + '...' }
        })

        try {
          await new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
              addResult({
                success: true,
                step: '✅ Persistence Verified',
                message: `Image persists after refresh! Dimensions: ${img.width}x${img.height}`,
                data: {
                  url: savedUrl.substring(0, 60) + '...',
                  width: img.width,
                  height: img.height
                }
              })
              resolve(true)
            }
            img.onerror = () => {
              addResult({
                success: false,
                step: '❌ Persistence Failed',
                message: 'Previously uploaded image failed to load from Storage',
                error: { url: savedUrl.substring(0, 60) + '...' }
              })
              // Clear invalid URL from localStorage
              localStorage.removeItem(storageKey)
              setPersistedImageUrl(null)
              reject(new Error('Image failed to load'))
            }
            img.src = savedUrl
          })
        } catch (err) {
          console.error('Persistence check failed:', err)
        } finally {
          setCheckingPersistence(false)
        }
      }
    }

    checkPersistedImage()
  }, [isAuthenticated, user])

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setSelectedFile(file)
    setError(null)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Generate a test image using Gemini API
  const generateTestImage = async (): Promise<string> => {
    if (!user) {
      throw new Error('User must be authenticated to generate images')
    }

    const testPrompt = `A beautiful test image for Firebase Storage: a green and black gradient background with the text "Firebase Storage Test" and timestamp ${new Date().toLocaleString()}. Professional quality, highly detailed.`
    
    addResult({
      success: true,
      step: '2. Image Generation',
      message: 'Generating test image using Gemini API...',
      data: { prompt: testPrompt.substring(0, 80) + '...' }
    })

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: testPrompt,
          userId: user.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.imageUrl && !data.url) {
        throw new Error('No image URL in response from Gemini')
      }

      const imageUrl = data.imageUrl || data.url
      
      addResult({
        success: true,
        step: '2. Image Generation',
        message: `Image generated successfully using ${data.source || 'Gemini'}!`,
        data: {
          source: data.source,
          url: imageUrl.substring(0, 60) + '...'
        }
      })

      return imageUrl
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate image with Gemini'
      addResult({
        success: false,
        step: '2. Image Generation',
        message: `Failed to generate image: ${errorMessage}`,
        error: {
          message: err.message,
          stack: err.stack
        }
      })
      throw err
    }
  }

  const runTest = async () => {
    if (!isAuthenticated || !user) {
      setError('You must be signed in to test Storage uploads')
      return
    }

    setTesting(true)
    setError(null)
    setResults([])
    setUploadedImageUrl(null)

    try {
      // Step 1: Check authentication
      addResult({
        success: true,
        step: '1. Authentication',
        message: `Authenticated as ${user.displayName || user.email || user.id}`,
        data: { userId: user.id }
      })

      // Step 2: Prepare image
      let imageData: string
      
      if (selectedFile && imagePreview) {
        addResult({
          success: true,
          step: '2. Image Preparation',
          message: `Using selected file: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`,
          data: { fileName: selectedFile.name, size: selectedFile.size }
        })
        imageData = imagePreview
      } else {
        addResult({
          success: true,
          step: '2. Image Preparation',
          message: 'Generating test image...'
        })
        imageData = await generateTestImage()
        addResult({
          success: true,
          step: '2. Image Preparation',
          message: 'Test image generated successfully',
          data: { sizeKB: (imageData.length / 1024).toFixed(2) }
        })
      }

      // Step 3: Generate hash
      const testPrompt = `test-image-${Date.now()}`
      addResult({
        success: true,
        step: '3. Hash Generation',
        message: 'Generating prompt hash for Storage path...'
      })
      
      const promptHash = await hashPrompt(testPrompt)
      addResult({
        success: true,
        step: '3. Hash Generation',
        message: `Hash generated: ${promptHash.substring(0, 16)}...`,
        data: { hash: promptHash.substring(0, 32) }
      })

      // Step 4: Upload to Storage
      addResult({
        success: true,
        step: '4. Storage Upload',
        message: 'Starting upload to Firebase Storage...',
        data: {
          path: `users/${user.id}/images/${promptHash}.png`,
          userId: user.id.substring(0, 8) + '...'
        }
      })

      const storageUrl = await uploadImageToStorage(user.id, imageData, promptHash)
      
      addResult({
        success: true,
        step: '4. Storage Upload',
        message: 'Image uploaded successfully to Firebase Storage!',
        data: { storageUrl: storageUrl.substring(0, 60) + '...' }
      })

      setUploadedImageUrl(storageUrl)

      // Save to localStorage for persistence check
      if (user) {
        const storageKey = `storage-test-image-${user.id}`
        localStorage.setItem(storageKey, storageUrl)
        addResult({
          success: true,
          step: '4.5. Save for Persistence',
          message: 'Storage URL saved to localStorage for refresh test',
          data: { storageKey }
        })
      }

      // Step 5: Verify image loads
      addResult({
        success: true,
        step: '5. Image Verification',
        message: 'Verifying image can be loaded from Storage URL...'
      })

      await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          addResult({
            success: true,
            step: '5. Image Verification',
            message: `Image verified! Dimensions: ${img.width}x${img.height}`,
            data: { width: img.width, height: img.height }
          })
          resolve(true)
        }
        img.onerror = (err) => {
          addResult({
            success: false,
            step: '5. Image Verification',
            message: 'Failed to load image from Storage URL',
            error: err
          })
          reject(new Error('Image failed to load'))
        }
        img.src = storageUrl
      })

      // Step 6: Test complete
      addResult({
        success: true,
        step: '6. Test Complete',
        message: '🎉 All tests passed! Storage upload is working correctly.',
        data: { finalUrl: storageUrl }
      })

    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error'
      addResult({
        success: false,
        step: 'Error',
        message: errorMessage,
        error: {
          message: err.message,
          code: err.code,
          stack: err.stack
        }
      })
      setError(errorMessage)
      console.error('❌ Test error:', err)
    } finally {
      setTesting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#e7e7e7]">Loading authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-[#10B981] mb-4">🔒 Sign In Required</h2>
          <p className="text-[#e7e7e7]/80 mb-6">You must be signed in to test Firebase Storage uploads.</p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-black font-semibold rounded-lg transition"
          >
            Go to Login →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#10B981] mb-2">🧪 Firebase Storage Upload Test</h1>
          <p className="text-white/70 text-lg">
            Test if Firebase Storage uploads work correctly with your authentication and rules
          </p>
          {user && (
            <p className="text-white/50 text-sm mt-2">
              Signed in as: <span className="text-[#10B981]">{user.displayName || user.email || user.id}</span>
            </p>
          )}
        </div>

        {/* Generated Image Section - ALWAYS VISIBLE */}
        <div className="bg-[#1a1a1a] border-2 border-[#10B981] rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#10B981] mb-2">
            {persistedImageUrl && !uploadedImageUrl 
              ? '🔄 Persisted Image (Loaded After Refresh)' 
              : uploadedImageUrl 
              ? '✅ Generated Image (Uploaded to Storage)'
              : '🖼️ Generated Image'}
          </h2>
          
          {!persistedImageUrl && !uploadedImageUrl ? (
            <div className="text-center py-12 border-2 border-dashed border-[#36393f] rounded-lg">
              <p className="text-white/60 mb-2">No image yet</p>
              <p className="text-white/40 text-sm">Generate an image below and it will appear here</p>
              <p className="text-white/40 text-sm mt-2">After refreshing, persisted images will load automatically</p>
            </div>
          ) : (
            <>
              {persistedImageUrl && !uploadedImageUrl ? (
                <p className="text-white/60 text-sm mb-4">
                  This image was uploaded previously and persists after page refresh!
                </p>
              ) : (
                <p className="text-white/60 text-sm mb-4">
                  Image generated with Gemini and uploaded to Firebase Storage
                </p>
              )}
              {checkingPersistence ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/70">Verifying image loads from Storage...</p>
              </div>
            ) : (
                <>
                  <div className="mb-4">
                    <img
                      src={uploadedImageUrl || persistedImageUrl || ''}
                      alt={uploadedImageUrl ? "Uploaded from Storage" : "Persisted from Storage"}
                      className="max-w-full rounded-lg border border-[#36393f]"
                      onError={(e) => {
                        console.error('Failed to load image:', uploadedImageUrl || persistedImageUrl)
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                  <div className="bg-black/30 p-3 rounded text-xs overflow-x-auto mb-4">
                    <p className="text-white/60 mb-1">Storage URL:</p>
                    <p className="text-[#10B981] break-all">{uploadedImageUrl || persistedImageUrl}</p>
                  </div>
                  {persistedImageUrl && !uploadedImageUrl && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
                      <p className="text-green-300 text-sm">
                        ✅ <strong>Success!</strong> This image persisted after refresh, proving Storage works correctly!
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (user) {
                        localStorage.removeItem(`storage-test-image-${user.id}`)
                        setPersistedImageUrl(null)
                        setUploadedImageUrl(null)
                        addResult({
                          success: true,
                          step: 'Clear',
                          message: 'Image cleared from localStorage'
                        })
                      }
                    }}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition"
                  >
                    Clear Image
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Image Selection */}
        <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-[#10B981] mb-4">Image Selection</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Option 1: Upload an image file
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={testing}
                className="block w-full text-sm text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#10B981] file:text-black hover:file:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {selectedFile && (
                <p className="text-sm text-white/60 mt-2">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
            <div className="text-center text-white/60">OR</div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Option 2: Generate a test image with Gemini (automatic)
              </label>
              <p className="text-sm text-white/60">
                If no file is selected, a test image will be generated automatically using Gemini AI
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        {imagePreview && (
          <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-[#10B981] mb-4">Image Preview</h2>
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-full max-h-64 rounded-lg border border-[#36393f]"
            />
          </div>
        )}

        {/* Test Button */}
        <div className="mb-8">
          <button
            onClick={runTest}
            disabled={testing}
            className="bg-gradient-to-r from-[#10B981] to-[#059669] text-black px-8 py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all"
          >
            {testing ? '🔄 Running Test...' : '▶️ Run Storage Upload Test'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-red-400 mb-2">❌ Error</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Test Results */}
        {results.length > 0 && (
          <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-[#10B981] mb-4">Test Results</h2>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{result.success ? '✅' : '❌'}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{result.step}</p>
                      <p className={`text-sm ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                        {result.message}
                      </p>
                      {result.data && (
                        <pre className="mt-2 text-xs bg-black/30 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      )}
                      {result.error && (
                        <pre className="mt-2 text-xs bg-red-900/30 p-2 rounded overflow-x-auto text-red-300">
                          {JSON.stringify(result.error, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-300 mb-2">📋 What This Test Checks</h3>
          <ul className="text-white/80 text-sm space-y-1 list-disc list-inside">
            <li>✅ User authentication is working</li>
            <li>✅ Firebase Storage rules allow authenticated uploads</li>
            <li>✅ Images can be uploaded to <code className="bg-black/30 px-1 rounded">users/&#123;userId&#125;/images/</code></li>
            <li>✅ Images can be retrieved via Storage URL</li>
            <li>✅ Images persist after page refresh</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

