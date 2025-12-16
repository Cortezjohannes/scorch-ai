'use client'

import { useState, useCallback, useMemo, memo, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { dataUrlToBlobUrl, revokeBlobUrl, isDataUrl } from '@/utils/image-utils'

// Component to handle image display with blob URL conversion
function GeneratedImageDisplay({ src, alt }: { src: string; alt: string }) {
  const [displayUrl, setDisplayUrl] = useState<string>(src);

  useEffect(() => {
    // Convert base64 data URL to blob URL for better performance
    if (isDataUrl(src)) {
      try {
        const blobUrl = dataUrlToBlobUrl(src);
        setDisplayUrl(blobUrl);
        
        // Cleanup blob URL on unmount
        return () => {
          revokeBlobUrl(blobUrl);
        };
      } catch (error) {
        console.error('Failed to convert data URL to blob URL:', error);
        setDisplayUrl(src); // Fallback to data URL
      }
    } else {
      setDisplayUrl(src);
    }
  }, [src]);

  return (
    <Image
      src={displayUrl}
      alt={alt}
      width={1024}
      height={1024}
      className="w-full h-full object-cover"
      unoptimized={displayUrl.startsWith('blob:') || displayUrl.startsWith('data:')}
    />
  );
}

interface ImageGeneratorProps {
  initialPrompt?: string
  label?: string
  onImageGenerated?: (imageUrl: string, metadata?: any) => void
  previewSize?: 'small' | 'medium' | 'large'
  styleOptions?: string[]
  showPromptField?: boolean
  characterData?: {
    name: string
    physicalDescription?: string
    gender?: string
    age?: string
    importance?: string
  }[]
  scene?: {
    characters?: string[]
  }
  userId?: string  // Optional: for caching support
}

function ImageGeneratorComponent({
  initialPrompt = '',
  label = 'Generate Image',
  onImageGenerated,
  previewSize = 'medium',
  styleOptions = ['Realistic', 'Cinematic', 'Anime', 'Artistic', 'Fantasy'],
  showPromptField = false,
  characterData = [],
  scene = {},
  userId
}: ImageGeneratorProps) {
  // Use a default prompt if initialPrompt is empty
  const defaultPrompt = "cinematic scene with dramatic lighting"
  const [prompt, setPrompt] = useState(initialPrompt || defaultPrompt)
  const [style, setStyle] = useState<string>('Cinematic')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageSource, setImageSource] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Update prompt when initialPrompt changes and isn't empty
  useEffect(() => {
    if (initialPrompt) {
      // Enhance the prompt with character descriptions if characters are present
      const enhancedPrompt = enhancePromptWithCharacters(initialPrompt);
      setPrompt(enhancedPrompt);
    }
  }, [initialPrompt, characterData])

  // Function to enhance prompts with character details
  const enhancePromptWithCharacters = useCallback((basePrompt: string) => {
    // If no character data or no scene characters, return the original prompt
    if (!characterData.length || !scene.characters?.length) {
      return basePrompt;
    }
    
    // Find character references in the prompt and enhance with details
    const characterDetails = scene.characters
      .map(charName => {
        const character = characterData.find(c => 
          c.name.toLowerCase() === charName.toLowerCase() ||
          basePrompt.toLowerCase().includes(c.name.toLowerCase())
        );
        
        if (character) {
          return `${charName} (${character.gender || ''} ${character.age || ''} with ${character.physicalDescription || 'distinct features'})`;
        }
        return null;
      })
      .filter(Boolean)
      .join(', ');
    
    if (characterDetails) {
      // Add character details to the prompt in a natural way
      if (basePrompt.toLowerCase().includes("character") || basePrompt.toLowerCase().includes("person")) {
        return basePrompt.replace(/character|person/i, characterDetails);
      } else {
        return `${basePrompt}, featuring ${characterDetails}`;
      }
    }
    
    return basePrompt;
  }, [characterData, scene]);

  // Memoize size classes to prevent recalculation on re-renders
  const sizeClasses = useMemo(() => ({
    small: 'w-full max-w-xs',
    medium: 'w-full max-w-md', 
    large: 'w-full max-w-xl'
  }), [])

  // Memoize the generateImage function
  const generateImage = useCallback(async () => {
    // Use current prompt or default if empty
    const promptToUse = prompt || defaultPrompt;
    
    if (!promptToUse) {
      setError('Please enter a prompt');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGenerationProgress(0);
    setRetryCount(0);
    setImageUrl(null); // Clear any existing image

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        const newProgress = prev + (Math.random() * 3 + 1) // Randomize progress increment for realism
        if (newProgress >= 100) {
          clearInterval(progressInterval);
        }
        return newProgress < 100 ? newProgress : 99;
      });
    }, 200);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: promptToUse,
          style,
          userId: userId  // Pass userId for caching
        })
      });

      const data = await response.json();
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      // The API returns url, not imageUrl
      const imageUrlFromResponse = data.url || data.imageUrl;
      
      if (!imageUrlFromResponse) {
        throw new Error('No image URL in response');
      }

      // Store base64 data URL directly, convert to blob URL only for display
      setImageUrl(imageUrlFromResponse);
      setImageSource(data.source || 'unknown');
      setGenerationProgress(100);
      
      if (onImageGenerated) {
        onImageGenerated(imageUrlFromResponse, data);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || 'An error occurred');
      setGenerationProgress(0);
      setImageUrl(null);
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
      }, 500); // Keep the 100% state visible briefly
    }
  }, [prompt, style, onImageGenerated, defaultPrompt]);

  // Memoize the handleRetry function
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1)
    generateImage()
  }, [generateImage])

  // Memoize the resetImage function
  const resetImage = useCallback(() => {
    setImageUrl(null)
  }, [])

  // Memoize the getSourceLabel function
  const getSourceLabel = useCallback(() => {
    if (!imageSource) return null;
    
    switch(imageSource) {
      case 'gemini':
        return 'AI Generated with Gemini';
      case 'unsplash':
        return 'Unsplash Photo';
      case 'placeholder':
        return 'Placeholder Image';
      default:
        return 'Generated Image';
    }
  }, [imageSource]);

  const getSourceBadgeClass = useCallback(() => {
    if (!imageSource) return 'bg-gray-600';
    
    switch(imageSource) {
      case 'gemini':
        return 'bg-purple-600';
      case 'unsplash':
        return 'bg-green-600';
      case 'placeholder':
        return 'bg-orange-600';
      default:
        return 'bg-gray-600';
    }
  }, [imageSource]);

  // Memoize the style options rendering
  const styleOptionsButtons = useMemo(() => (
    <div className="flex flex-wrap gap-2">
      {styleOptions.map((styleOption) => (
        <motion.button
          key={styleOption}
          className={`py-1 px-3 rounded-full text-xs ${
            style === styleOption 
              ? 'bg-[#e2c376] text-black' 
              : 'bg-[#2a2a2a] text-[#e7e7e7]/70 hover:bg-[#36393f] transition-colors'
          }`}
          onClick={() => setStyle(styleOption)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          disabled={isGenerating}
        >
          {styleOption}
        </motion.button>
      ))}
    </div>
  ), [style, styleOptions, isGenerating])

  return (
    <div className={`relative ${sizeClasses[previewSize]} mx-auto`}>
      <div className="space-y-4 border border-[#2a2a2a] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[#e7e7e7]">{label}</h3>
          {!isGenerating && imageUrl && (
            <div className="flex space-x-2">
              <button 
                onClick={handleRetry}
                className="text-xs text-[#e2c376] hover:text-[#e2c376]/80 transition-colors"
              >
                Regenerate
              </button>
              <button 
                onClick={resetImage}
                className="text-xs text-[#e7e7e7]/70 hover:text-[#e7e7e7] transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {showPromptField && (
          <div>
            <label htmlFor="prompt" className="block text-sm text-[#e7e7e7]/70 mb-1">
              Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to generate..."
              className="w-full bg-[#2a2a2a] text-[#e7e7e7] text-sm p-2 rounded-md border border-[#36393f] focus:border-[#e2c376] focus:outline-none focus:ring-1 focus:ring-[#e2c376] transition-colors resize-none"
              rows={3}
              disabled={isGenerating}
            />
          </div>
        )}

        <div>
          <label htmlFor="style" className="block text-sm text-[#e7e7e7]/70 mb-1">
            Visual Style
          </label>
          {styleOptionsButtons}
        </div>

        {error && (
          <div className="text-red-400 text-xs p-2 bg-red-900/20 rounded-md border border-red-900/30">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-red-400 mt-0.5 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {isGenerating ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#e7e7e7]/70">
              <span>Generating image...</span>
              <span>{Math.min(Math.floor(generationProgress), 99)}%</span>
            </div>
            <div className="w-full h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#e2c376] transition-all duration-300 ease-out"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            {generationProgress > 50 && (
              <p className="text-xs text-[#e7e7e7]/50 italic">
                {generationProgress > 80 
                  ? "Finalizing details..." 
                  : "Processing your request..."}
              </p>
            )}
          </div>
        ) : (
          <motion.button
            onClick={generateImage}
            className="w-full py-2 bg-[#2a2a2a] hover:bg-[#36393f] transition-colors text-[#e7e7e7] rounded-md flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!prompt || isGenerating}
          >
            <span className="mr-2">✨</span>
            {retryCount > 0 ? 'Generate Another' : label}
          </motion.button>
        )}

        {imageUrl ? (
          <div className={`mt-4 rounded-md overflow-hidden border border-[#36393f] ${sizeClasses[previewSize]} aspect-video relative group`}>
            <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
              <GeneratedImageDisplay
                src={imageUrl}
                alt={prompt || "Generated image"}
              />
              {/* Source badge */}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs text-white ${getSourceBadgeClass()} transition-opacity opacity-80 group-hover:opacity-100`}>
                {getSourceLabel()}
              </div>
            </div>
          </div>
        ) : error ? (
          // Show empty image container with error state when generation fails
          <div className={`mt-4 border border-red-500/30 bg-red-900/10 ${sizeClasses[previewSize]} aspect-video rounded-md flex items-center justify-center`}>
            <div className="text-center p-4">
              <div className="text-red-400 mb-2">⚠️ Generation failed</div>
              <p className="text-sm text-[#e7e7e7]/70">{error}</p>
              <button 
                onClick={generateImage}
                className="mt-3 px-3 py-1 bg-[#2a2a2a] hover:bg-[#36393f] transition-colors text-[#e7e7e7] rounded-md text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// Export a memoized version of the component to prevent unnecessary re-renders
export default memo(ImageGeneratorComponent) 