import { NextResponse } from 'next/server';
import { generateImageWithGemini, type GeminiImageResponse, type ImageModel } from '@/services/gemini-image-generator';
import { applyArtStyleToPrompt, type StoryboardArtStyle } from '@/services/storyboard-art-style';
import { applyStoryBibleStyleToPrompt, type StoryBibleImageType } from '@/services/story-bible-art-style';
import { getCachedImage, saveCachedImage, hashPrompt } from '@/services/image-cache-service';

// Function to sanitize prompts to avoid content filter triggers
function sanitizePrompt(prompt: string): string {
  // Replace potentially problematic words or phrases with safer alternatives
  const sanitized = prompt
    // Avoid terms that might trigger violence or darkness filters
    .replace(/amnesia/gi, "forgotten memories")
    .replace(/murder/gi, "mystery")
    .replace(/detective/gi, "researcher")
    .replace(/crime/gi, "mystery")
    .replace(/case board/gi, "information board")
    .replace(/noir/gi, "classic film style")
    .replace(/moody/gi, "atmospheric")
    .replace(/rain/gi, "gentle weather")
    .replace(/dark/gi, "low light")
    .replace(/case file/gi, "document folder")
    .replace(/bloody/gi, "colorful")
    .replace(/gun|weapon/gi, "tool")
    .replace(/knife/gi, "utensil")
    .replace(/death|dead|dying/gi, "transformation")
    
    // Add positive or neutral qualifiers
    + ", professional quality, highly detailed, pleasant atmosphere";
  
  return sanitized;
}

// Function to generate image using OpenAI DALL-E API directly
async function generateImageWithOpenAI(prompt: string) {
  try {
    // Use direct OpenAI API (not Azure)
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key is missing');
    }
    
    // Sanitize the prompt to reduce chance of content filter triggers
    const sanitizedPrompt = sanitizePrompt(prompt);
    console.log(`Original prompt: "${prompt.substring(0, 50)}..."`);
    console.log(`Sanitized prompt: "${sanitizedPrompt.substring(0, 50)}..."`);
    
    console.log('Generating image with OpenAI DALL-E');
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: sanitizedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('OpenAI DALL-E API error:', errorData || response.statusText);
      throw new Error(`Image generation failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No image data returned from OpenAI DALL-E');
    }
    
    return {
      url: data.data[0].url || '',
      revisedPrompt: data.data[0].revised_prompt || sanitizedPrompt,
      originalPrompt: prompt
    };
  } catch (error) {
    console.error('Error generating image with OpenAI DALL-E:', error);
    throw error;
  }
}

// Azure DALL-E is deprecated - use Gemini instead
// @deprecated Use generateImageWithGeminiAPI instead
async function generateImageWithAzure(prompt: string) {
  console.warn('⚠️ DEPRECATED: Azure DALL-E is deprecated. Using Gemini instead.')
  // Redirect to Gemini
  return generateImageWithGeminiAPI(prompt);
}

// Function to generate image using Gemini API
// Model selection: 'nano-banana' (default, fast) or 'nano-banana-pro' (high quality)
async function generateImageWithGeminiAPI(
  prompt: string, 
  referenceImages?: string[], 
  characterDescriptions?: Array<{ name: string; description: string }>, 
  characterImageMap?: Record<string, string>, 
  artStyleDescription?: string,
  model?: ImageModel,
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
) {
  try {
    // ⚠️ IMPORTANT: Log the model parameter to debug
    console.log(`🔍 [generateImageWithGeminiAPI] Model parameter received:`, {
      model: model,
      modelType: typeof model,
      isUndefined: model === undefined
    });
    
    const modelLabel = model === 'nano-banana-pro' ? 'NANO BANANA PRO' : 'NANO BANANA';
    // Default to square (1:1) for storyboards
    const finalAspectRatio = aspectRatio || '1:1';
    console.log(`🎯 [generateImageWithGeminiAPI] Generating image with Gemini (${modelLabel})`, {
      model: model || 'nano-banana (default)',
      selectedModel: model,
      aspectRatio: finalAspectRatio,
      hasReferenceImages: !!referenceImages,
      referenceImageCount: referenceImages?.length || 0,
      hasCharacterDescriptions: !!characterDescriptions,
      characterDescriptionCount: characterDescriptions?.length || 0,
      hasArtStyleDescription: !!artStyleDescription,
      artStyleDescription: artStyleDescription || 'none'
    });
    
    const result: GeminiImageResponse = await generateImageWithGemini(prompt, {
      aspectRatio: finalAspectRatio, // Use provided aspect ratio or default to square (1:1)
      quality: 'standard',
      style: 'natural',
      referenceImages: referenceImages, // Pass reference images for style consistency
      characterDescriptions: characterDescriptions, // Pass character descriptions to reinforce appearance
      characterImageMap: characterImageMap, // Pass character-to-image mapping for explicit matching
      artStyleDescription: artStyleDescription, // Pass art style description for explicit style matching
      model: model // Pass model selection (nano-banana or nano-banana-pro)
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Gemini image generation failed');
    }
    
    // Gemini returns data URLs, we need to handle them appropriately
    // For API responses, we'll return the data URL directly
    // The client can use it as-is or convert to blob URL if needed
    
    return {
      url: result.imageUrl,
      revisedPrompt: prompt, // Gemini doesn't revise prompts like DALL-E
      originalPrompt: prompt,
      source: result.metadata?.model || 'gemini'
    };
  } catch (error: any) {
    console.error('Error generating image with Gemini:', error);
    throw error;
  }
}

// Add a mock implementation for development only when specifically enabled
async function generateMockImage(prompt: string) {
  // Apply the same sanitization for consistency in logs
  const sanitizedPrompt = sanitizePrompt(prompt);
  console.log('Using mock image generation for original prompt:', prompt);
  console.log('Sanitized mock prompt:', sanitizedPrompt);
  
  // Create a deterministic but varying URL based on the prompt
  const promptHash = Array.from(prompt)
    .reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
    .toString()
    .replace('-', '');
  
  // List of placeholder image URLs for development
  const placeholderUrls = [
    'https://placehold.co/1024x1024/222/e2c376?text=Storyboard+Image',
    'https://placekitten.com/1024/1024',
    'https://picsum.photos/seed/1/1024/1024',
    'https://picsum.photos/seed/2/1024/1024',
    'https://picsum.photos/seed/3/1024/1024',
    'https://picsum.photos/seed/4/1024/1024',
    'https://picsum.photos/seed/5/1024/1024'
  ];
  
  // Select a URL based on the prompt hash
  const index = Math.abs(parseInt(promptHash.substring(0, 5), 16)) % placeholderUrls.length;
  const url = placeholderUrls[index];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    url,
    revisedPrompt: `MOCK: ${prompt}`
  };
}

export async function POST(request: Request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`
  console.log(`\n🖼️  [${requestId}] Image generation request started`)
  
  try {
    const { prompt, scriptContext, artStyle, userId, context, imageType, genre, tone, referenceImages, characterDescriptions, characterImageMap, artStyleDescription, model, aspectRatio } = await request.json();
    
    // Model selection: 'nano-banana' (default, fast) or 'nano-banana-pro' (high quality)
    // ⚠️ IMPORTANT: Log the raw model parameter to debug why it might be missing
    console.log(`🔍 [${requestId}] Raw model parameter from request:`, {
      model: model,
      modelType: typeof model,
      isUndefined: model === undefined,
      isNull: model === null,
      isEmptyString: model === ''
    });
    
    const selectedModel: ImageModel = model || 'nano-banana'; // Default to fast model
    const modelLabel = selectedModel === 'nano-banana-pro' ? 'NANO BANANA PRO' : 'NANO BANANA';
    
    console.log(`📝 [${requestId}] Request details:`, {
      hasPrompt: !!prompt,
      promptLength: prompt?.length || 0,
      hasScriptContext: !!scriptContext,
      scriptContext: scriptContext ? `"${scriptContext.substring(0, 50)}${scriptContext.length > 50 ? '...' : ''}"` : 'none',
      hasArtStyle: !!artStyle,
      artStyleName: artStyle?.name || 'none',
      context: context || 'storyboard',
      imageType: imageType || 'none',
      hasUserId: !!userId,
      userId: userId ? `${userId.substring(0, 8)}...` : 'none (guest mode)',
      hasReferenceImages: !!referenceImages,
      referenceImageCount: referenceImages?.length || 0,
      hasCharacterDescriptions: !!characterDescriptions,
      characterDescriptionCount: characterDescriptions?.length || 0,
      hasArtStyleDescription: !!artStyleDescription,
      artStyleDescription: artStyleDescription || 'none',
      model: selectedModel,
      modelLabel
    })
    
    if (!prompt) {
      console.error(`❌ [${requestId}] Missing prompt in request`)
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Validate prompt relevance when scriptContext is provided
    if (scriptContext && prompt) {
      const promptLower = prompt.toLowerCase()
      const scriptContextLower = scriptContext.toLowerCase()

      // Check if prompt contains the script action or is too generic
      const genericTerms = ['two characters', 'characters in', 'people in', 'person in', 'shot of', 'medium shot', 'wide shot', 'close up', 'interior', 'exterior', 'room', 'space', 'area']
      const hasGenericTerm = genericTerms.some(term => promptLower.includes(term))
      const hasScriptAction = scriptContextLower.split(' ').some((word: string) =>
        word.length > 3 && promptLower.includes(word)
      )

      if (hasGenericTerm && !hasScriptAction) {
        console.warn(`⚠️ [${requestId}] Prompt may be too generic for scriptContext "${scriptContext}". Prompt: "${prompt.substring(0, 100)}..."`)
        console.warn(`⚠️ [${requestId}] Consider using scriptContext as primary action in prompt`)
      } else {
        console.log(`✅ [${requestId}] Prompt appears relevant to scriptContext`)
      }
    }
    
    // Apply art style to prompt based on context
    // CRITICAL: If reference images are provided, SKIP hard-coded art style
    // The reference images should be the style guide, not hard-coded prompts
    let finalPrompt = prompt
    const hasReferenceImages = referenceImages && referenceImages.length > 0
    
    if (hasReferenceImages) {
      // Skip art style application - reference images define the style
      console.log(`🎨 [${requestId}] Reference images provided (${referenceImages.length}), skipping hard-coded art style - reference images will define style`)
    } else if (context === 'story-bible') {
      // Apply story-bible semi-realistic style
      try {
        finalPrompt = applyStoryBibleStyleToPrompt(
          prompt,
          genre || 'drama',
          tone || 'realistic',
          (imageType as StoryBibleImageType) || 'character-portrait'
        )
        console.log(`🎨 [${requestId}] Applied story-bible style:`, {
          genre: genre || 'drama',
          tone: tone || 'realistic',
          imageType: imageType || 'character-portrait',
          originalPromptLength: prompt.length,
          finalPromptLength: finalPrompt.length,
          promptChanged: prompt !== finalPrompt
        })
      } catch (error: any) {
        console.warn(`⚠️  [${requestId}] Failed to apply story-bible style, using original prompt:`, {
          error: error.message,
          stack: error.stack
        })
        // Continue with original prompt if style application fails
      }
    } else if (artStyle && typeof artStyle === 'object') {
      // Apply storyboard art style (existing behavior)
      try {
        finalPrompt = applyArtStyleToPrompt(prompt, artStyle as StoryboardArtStyle)
        console.log(`🎨 [${requestId}] Applied art style:`, {
          styleName: artStyle.name || 'Custom Style',
          originalPromptLength: prompt.length,
          finalPromptLength: finalPrompt.length,
          promptChanged: prompt !== finalPrompt
        })
      } catch (error: any) {
        console.warn(`⚠️  [${requestId}] Failed to apply art style, using original prompt:`, {
          error: error.message,
          stack: error.stack
        })
        // Continue with original prompt if art style application fails
      }
    } else {
      console.log(`📝 [${requestId}] No art style provided, using original prompt`)
    }
    
    // ========================================
    // CACHE CHECK: Check if image already exists
    // ========================================
    if (userId) {
      console.log(`🔍 [${requestId}] Checking cache for userId: ${userId.substring(0, 8)}...`)
      try {
        const cacheStartTime = Date.now()
        const cached = await getCachedImage(userId, prompt, artStyle, context);
        const cacheDuration = Date.now() - cacheStartTime
        
        if (cached) {
          console.log(`✅ [${requestId}] CACHE HIT!`, {
            cacheDuration: `${cacheDuration}ms`,
            imageUrl: cached.imageUrl.substring(0, 60) + '...',
            imageType: cached.imageUrl.startsWith('data:') ? 'base64' : 'Storage URL',
            source: cached.source,
            usageCount: cached.usageCount,
            createdAt: cached.createdAt.toISOString()
          })
          return NextResponse.json({
            success: true,
            imageUrl: cached.imageUrl,
            url: cached.imageUrl, // Also include 'url' for compatibility
            revisedPrompt: cached.finalPrompt,
            originalPrompt: cached.prompt,
            source: cached.source,
            cached: true, // Indicate this is from cache
            requestId // Include for debugging
          });
        } else {
          console.log(`❌ [${requestId}] Cache miss (no cached image found)`, {
            cacheDuration: `${cacheDuration}ms`
          })
        }
      } catch (cacheError: any) {
        console.error(`❌ [${requestId}] Cache check failed:`, {
          error: cacheError.message,
          stack: cacheError.stack,
          userId: userId.substring(0, 8) + '...'
        })
        console.warn(`⚠️  [${requestId}] Continuing with generation despite cache error`)
        // Continue with generation if cache check fails
      }
    } else {
      console.log(`⚠️  [${requestId}] No userId provided, skipping cache check (guest mode)`)
    }
    
    // ========================================
    // IMAGE GENERATION: Generate new image
    // ========================================
    
    // Use mock only if explicitly configured to do so
    const useMock = process.env.USE_MOCK_IMAGES === 'true';
    
    if (useMock) {
      console.log(`🎭 [${requestId}] Using mock image generation (USE_MOCK_IMAGES=true)`)
      const mockStartTime = Date.now()
      const mockResult = await generateMockImage(finalPrompt);
      const mockDuration = Date.now() - mockStartTime
      
      console.log(`✅ [${requestId}] Mock image generated`, {
        duration: `${mockDuration}ms`,
        url: mockResult.url
      })
      
      const responseData = {
        success: true,
        imageUrl: mockResult.url,
        url: mockResult.url, // Also include 'url' for compatibility
        revisedPrompt: mockResult.revisedPrompt,
        isMock: true,
        source: 'mock',
        requestId
      };
      
      // Save to cache (async, don't wait)
      if (userId) {
        console.log(`💾 [${requestId}] Saving mock image to cache (async)`)
        saveCachedImage(userId, prompt, artStyle, mockResult.url, 'mock', finalPrompt, context)
          .then(() => console.log(`✅ [${requestId}] Mock image cached successfully`))
          .catch(err => console.error(`❌ [${requestId}] Failed to cache mock image:`, err));
      }
      
      return NextResponse.json(responseData);
    }
    
    // Determine which provider to use based on environment variable
    const provider = process.env.IMAGE_GENERATION_PROVIDER || 'gemini';
    console.log(`🚀 [${requestId}] Starting image generation`, {
      provider,
      finalPromptLength: finalPrompt.length,
      promptPreview: finalPrompt.substring(0, 100) + '...'
    })
    
    let generatedImageUrl: string;
    let generatedSource: string;
    let generatedRevisedPrompt: string;
    let generatedOriginalPrompt: string;
    const generationStartTime = Date.now()
    
    try {
      // Always use Gemini for image generation
      // Azure DALL-E is deprecated
      console.log(`🤖 [${requestId}] Using Gemini (${modelLabel}) provider`)
        const result = await generateImageWithGeminiAPI(finalPrompt, referenceImages, characterDescriptions, characterImageMap, artStyleDescription, selectedModel, aspectRatio);
        generatedImageUrl = result.url;
        generatedSource = result.source || 'gemini';
        generatedRevisedPrompt = result.revisedPrompt;
        generatedOriginalPrompt = result.originalPrompt || prompt;
        console.log(`✅ [${requestId}] Gemini generation successful`, {
          duration: `${Date.now() - generationStartTime}ms`,
          imageType: generatedImageUrl.startsWith('data:') ? 'base64' : 'external URL',
          imageLength: generatedImageUrl.length,
          usedReferenceImages: !!referenceImages && referenceImages.length > 0
        })
      
      // ========================================
      // RETURN IMAGE: Let client handle ALL Storage uploads
      // ========================================
      // NO SERVER-SIDE UPLOADS - client always handles Storage uploads
      const finalImageUrl = generatedImageUrl
      
      console.log(`📤 [${requestId}] Returning image to client - client will handle Storage upload`, {
        imageType: generatedImageUrl.startsWith('data:') ? 'base64' : 'external URL',
        imageUrl: generatedImageUrl.substring(0, 60) + '...'
      })
      // Log FULL URL separately so it's not truncated (if it's an external URL)
      if (!generatedImageUrl.startsWith('data:')) {
        console.log(`🔗 [${requestId}] FULL Image URL being returned:`, generatedImageUrl)
      }
      
      // ========================================
      // CACHE SAVE: Save Storage URL to cache
      // ========================================
      // Save to cache (async, don't wait - but handle errors)
      if (userId && generatedImageUrl) {
        console.log(`💾 [${requestId}] Saving generated image to cache (async)`, {
          userId: userId.substring(0, 8) + '...',
          source: generatedSource,
          imageType: generatedImageUrl.startsWith('data:') ? 'base64' : 'external URL'
        })
        // Note: Cache save will be skipped on server (no auth context)
        // Client will handle upload to Storage and cache the Storage URL
        saveCachedImage(
          userId, 
          prompt, 
          artStyle, 
          finalImageUrl, // Raw image - client will upload to Storage
          generatedSource, 
          finalPrompt,
          context
        ).then(() => {
          console.log(`✅ [${requestId}] Image cached successfully`)
        }).catch(err => {
          console.error(`❌ [${requestId}] Failed to save image to cache:`, {
            error: err.message,
            stack: err.stack
          })
          // Don't fail the request if cache save fails
        });
      } else {
        if (!userId) {
          console.log(`⚠️  [${requestId}] Skipping cache save (no userId - guest mode)`)
        }
        if (!generatedImageUrl) {
          console.error(`❌ [${requestId}] Skipping cache save (no imageUrl generated)`)
        }
      }
      
      const totalDuration = Date.now() - generationStartTime
      console.log(`✅ [${requestId}] Image generation complete`, {
        totalDuration: `${totalDuration}ms`,
        source: generatedSource,
        imageUrl: finalImageUrl.substring(0, 60) + '...',
        imageType: finalImageUrl.startsWith('https://storage.googleapis.com/') ? 'Firebase Storage URL ✅' : 'other'
      })
      
      // Client will handle all Storage uploads - server just returns the generated image
      return NextResponse.json({
        success: true,
        imageUrl: finalImageUrl, // Raw image from API (base64 or external URL)
        url: finalImageUrl, // Also include 'url' for compatibility
        isStorageUrl: false, // Always false - client uploads to Storage
        revisedPrompt: generatedRevisedPrompt,
        originalPrompt: generatedOriginalPrompt,
        source: generatedSource,
        artStyleApplied: !!artStyle,
        requestId
      });
    } catch (error: any) {
      const errorDuration = Date.now() - generationStartTime
      console.error(`❌ [${requestId}] Image generation error:`, {
        error: error.message,
        stack: error.stack,
        duration: `${errorDuration}ms`,
        provider
      });
      
      // Fall back to mock only if configured to do so
      if (process.env.FALLBACK_TO_MOCK === 'true') {
        console.log(`🎭 [${requestId}] Falling back to mock image generation (FALLBACK_TO_MOCK=true)`)
        const mockResult = await generateMockImage(finalPrompt);
        
        const responseData = {
          success: true,
          imageUrl: mockResult.url,
          url: mockResult.url,
          revisedPrompt: mockResult.revisedPrompt,
          originalPrompt: prompt,
          isMock: true,
          source: 'mock',
          requestId
        };
        
        // Save to cache (async, don't wait)
        if (userId) {
          saveCachedImage(userId, prompt, artStyle, mockResult.url, 'mock', finalPrompt, context)
            .then(() => console.log(`✅ [${requestId}] Mock fallback image cached`))
            .catch(err => console.error(`❌ [${requestId}] Failed to cache mock fallback image:`, err));
        }
        
        return NextResponse.json(responseData);
      }
      
      console.error(`❌ [${requestId}] No fallback available, returning error`)
      return NextResponse.json(
        { 
          error: 'Failed to generate image',
          message: error.message,
          requestId
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error(`❌ [${requestId}] API route error:`, {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: error.message || 'Unknown error',
        requestId
      },
      { status: 500 }
    );
  }
}