'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { RefreshCw, Sparkles, ImageIcon } from 'lucide-react'
import { dataUrlToBlobUrl, revokeBlobUrl, isDataUrl } from '@/utils/image-utils'
import type { ImageAsset } from '@/services/story-bible-service'

interface StoryBibleImageProps {
  imageAsset?: ImageAsset
  placeholderIcon: string
  placeholderText: string
  onRegenerate?: () => void
  isGenerating?: boolean
  aspectRatio?: '1:1' | '16:9' | '9:16'
  className?: string
}

// Component to handle image display with blob URL conversion
function GeneratedImageDisplay({ src, alt }: { src: string; alt: string }) {
  const [displayUrl, setDisplayUrl] = useState<string>(src)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false) // Reset error when src changes
    
    // Convert base64 data URL to blob URL for better performance
    if (isDataUrl(src)) {
      try {
        const blobUrl = dataUrlToBlobUrl(src)
        setDisplayUrl(blobUrl)
        
        // Cleanup blob URL on unmount
        return () => {
          revokeBlobUrl(blobUrl)
        }
      } catch (error) {
        console.error('Failed to convert data URL to blob URL:', error)
        setDisplayUrl(src) // Fallback to data URL
      }
    } else {
      // For Firebase Storage URLs or external URLs, use as-is
      setDisplayUrl(src)
    }
  }, [src])

  // Handle image load errors
  const handleImageError = () => {
    console.error('Failed to load image:', src)
    setImageError(true)
  }

  if (imageError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400 text-sm">
        Failed to load image
      </div>
    )
  }

  // Check if it's a Firebase Storage URL
  const isFirebaseStorage = displayUrl.includes('firebasestorage.googleapis.com') || 
                           displayUrl.includes('storage.googleapis.com') ||
                           displayUrl.includes('.firebasestorage.app')
  
  return (
    <Image
      src={displayUrl}
      alt={alt}
      width={1024}
      height={1024}
      className="w-full h-full object-cover"
      unoptimized={displayUrl.startsWith('blob:') || displayUrl.startsWith('data:') || isFirebaseStorage}
      onError={handleImageError}
    />
  )
}

export default function StoryBibleImage({
  imageAsset,
  placeholderIcon,
  placeholderText,
  onRegenerate,
  isGenerating = false,
  aspectRatio = '1:1',
  className = ''
}: StoryBibleImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const imgRef = React.useRef<HTMLDivElement>(null)
  
  // Debug logging
  useEffect(() => {
    if (imageAsset?.imageUrl) {
      console.log(`🖼️ [StoryBibleImage] Image asset:`, {
        hasUrl: !!imageAsset.imageUrl,
        urlPreview: imageAsset.imageUrl.substring(0, 60),
        isDataUrl: imageAsset.imageUrl.startsWith('data:'),
        isStorageUrl: imageAsset.imageUrl.includes('firebasestorage') || imageAsset.imageUrl.includes('storage.googleapis')
      })
    } else {
      console.log(`🖼️ [StoryBibleImage] No image asset or URL`)
    }
  }, [imageAsset])
  
  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!imgRef.current || !imageAsset?.imageUrl) {
      setIsVisible(true) // Show immediately if no image or already loaded
      return
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' } // Start loading 100px before entering viewport
    )
    
    observer.observe(imgRef.current)
    
    return () => {
      observer.disconnect()
    }
  }, [imageAsset?.imageUrl])
  
  // Calculate aspect ratio classes
  const aspectRatioClasses = {
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16]'
  }
  
  const aspectClass = aspectRatioClasses[aspectRatio] || 'aspect-square'
  
  return (
    <div 
      ref={imgRef}
      className={`relative ${aspectClass} rounded-lg overflow-hidden border border-gray-700 bg-gray-800 ${className}`}
    >
      {imageAsset?.imageUrl && !imageError && isVisible ? (
        <>
          <GeneratedImageDisplay 
            src={imageAsset.imageUrl} 
            alt={placeholderText}
          />
          
          {/* Overlay with regenerate button */}
          {onRegenerate && (
            <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100 group">
              <button
                onClick={onRegenerate}
                disabled={isGenerating}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                title="Regenerate image"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
          {isGenerating ? (
            <>
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400 text-sm">Generating image...</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">{placeholderIcon}</div>
              <p className="text-gray-400 text-sm mb-4">{placeholderText}</p>
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Image
                </button>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Error state */}
      {imageError && imageAsset?.imageUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-red-900/20">
          <p className="text-red-400 text-sm mb-2">Failed to load image</p>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  )
}

