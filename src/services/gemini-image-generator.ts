/**
 * Gemini Image Generation Service
 * 
 * Generates images using Google's Gemini API with image generation capabilities
 * 
 * 🎯 MODEL SELECTION STRATEGY:
 * - NANO BANANA (gemini-2.5-flash-image): Fast, efficient - use for Characters, Locations, Arcs, Casting, Props
 * - NANO BANANA PRO (gemini-3-pro-image-preview): High-quality - use for Storyboards, Marketing, Hero Images
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * NANO BANANA PRO - Google's Advanced Image Generation Model
 * Use for: Storyboards, Marketing Materials, Hero Images
 * 
 * Built on Gemini 3 Pro architecture with:
 * - Enhanced visual accuracy and character consistency
 * - Support for up to 14 reference images (6 objects + 5 humans)
 * - High-fidelity 2K/4K image generation
 * 
 * Model API Identifier: gemini-3-pro-image-preview
 */
export const NANO_BANANA_PRO_MODEL = 'gemini-3-pro-image-preview';

/**
 * NANO BANANA - Fast Image Generation Model
 * Use for: Characters, Locations, Arcs, Casting, Character Gallery, Props/Costumes
 * 
 * Fast and efficient image generation for high-volume use cases
 * 
 * Model API Identifier: gemini-2.5-flash-image
 */
export const NANO_BANANA_MODEL = 'gemini-2.5-flash-image';

// Alias for backward compatibility
const NANO_BANANA_FALLBACK_MODEL = NANO_BANANA_MODEL;

/** Image generation model types */
export type ImageModel = 'nano-banana' | 'nano-banana-pro';

/** Map friendly names to actual model identifiers */
export const IMAGE_MODELS = {
  'nano-banana': NANO_BANANA_MODEL,
  'nano-banana-pro': NANO_BANANA_PRO_MODEL,
} as const;

export interface GeminiImageOptions {
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  quality?: 'standard' | 'hd';
  style?: 'natural' | 'vivid';
  width?: number;
  height?: number;
  referenceImages?: string[]; // Array of image URLs or base64 data URLs for style consistency
  characterDescriptions?: Array<{ name: string; description: string }>; // Character appearance descriptions to reinforce in prompt
  characterImageMap?: Record<string, string>; // Map character names to their reference image URLs for explicit matching
  artStyleDescription?: string; // Explicit text description of the art style to match
  scriptContext?: string; // NEW: Actual script action/dialogue for this frame - for tighter prompt relevance
  /** 
   * Which model to use for image generation
   * - 'nano-banana': Fast, efficient (Characters, Locations, Arcs, Casting, Props)
   * - 'nano-banana-pro': High quality (Storyboards, Marketing, Hero Images)
   * Default: 'nano-banana' (fast model)
   */
  model?: ImageModel;
}

export interface GeminiImageResponse {
  imageUrl: string;
  success: boolean;
  error?: string;
  metadata?: {
    model: string;
    aspectRatio: string;
    generationTime: number;
  };
}

/**
 * Helper function to get Gemini API key
 */
function getGeminiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  
  if (apiKey.length < 10) {
    throw new Error('GEMINI_API_KEY is too short, please check the value');
  }
  
  return apiKey;
}

/**
 * Sanitize prompt to avoid content filter issues
 */
function sanitizePrompt(prompt: string): string {
  const sanitized = prompt
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
    + ", professional quality, highly detailed, pleasant atmosphere";
  
  return sanitized;
}

/**
 * Convert base64 image data to data URL
 */
function base64ToDataUrl(base64Data: string, mimeType: string = 'image/png'): string {
  return `data:${mimeType};base64,${base64Data}`;
}

/**
 * Fetch image as base64 from URL (Firebase Storage or other)
 * Note: This function runs server-side only (in API routes)
 */
async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  // CRITICAL: Reject SVG images - Gemini cannot process them
  if (imageUrl.startsWith('data:image/svg+xml')) {
    throw new Error('SVG images are not supported - Gemini cannot process SVG format')
  }
  
  // If already base64 data URL, extract the data (only PNG/JPEG)
  if (imageUrl.startsWith('data:image/')) {
    // Only allow PNG/JPEG base64 images
    if (!imageUrl.startsWith('data:image/png') && 
        !imageUrl.startsWith('data:image/jpeg') && 
        !imageUrl.startsWith('data:image/jpg')) {
      throw new Error(`Unsupported image format in data URL: ${imageUrl.substring(0, 30)}...`)
    }
    
    const base64Match = imageUrl.match(/^data:image\/[^;]+;base64,(.+)$/)
    if (base64Match) {
      return base64Match[1]
    }
    throw new Error('Invalid base64 data URL format')
  }
  
  // Fetch from URL (Firebase Storage or other)
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch reference image: ${response.statusText}`)
  }
  
  // Check content type
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('svg')) {
    throw new Error('SVG images are not supported - Gemini cannot process SVG format')
  }
  
  const arrayBuffer = await response.arrayBuffer()
  
  // Buffer is available globally in Node.js
  // @ts-ignore - Buffer is available in Node.js runtime
  const buffer = Buffer.from(arrayBuffer)
  return buffer.toString('base64')
}

/**
 * Generate image using Gemini API
 * 
 * @param prompt - The image generation prompt
 * @param options - Generation options including model selection
 * @returns GeminiImageResponse with image URL or error
 * 
 * Model Selection:
 * - 'nano-banana' (default): Fast, efficient - for Characters, Locations, Arcs, Casting, Props
 * - 'nano-banana-pro': High quality - for Storyboards, Marketing, Hero Images
 */
export async function generateImageWithGemini(
  prompt: string,
  options: GeminiImageOptions = {}
): Promise<GeminiImageResponse> {
  // Pass character descriptions through to options if provided in a different format
  const startTime = Date.now();
  
  try {
    const apiKey = getGeminiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Select model based on options - DEFAULT to Nano Banana (fast) unless explicitly set to Pro
    const selectedModel = options.model || 'nano-banana';
    const modelName = IMAGE_MODELS[selectedModel];
    const modelLabel = selectedModel === 'nano-banana-pro' ? 'NANO BANANA PRO' : 'NANO BANANA';
    
    console.log(`🎨 [${modelLabel}] Generating image with ${modelLabel} (${modelName})`);
    console.log(`📝 [${modelLabel}] Prompt: ${prompt.substring(0, 100)}...`);
    
    // Sanitize the prompt
    const sanitizedPrompt = sanitizePrompt(prompt);
    
    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });
    
    // Prepare parts for multimodal input (text + reference images)
    const parts: any[] = []
    
    if (options.referenceImages && options.referenceImages.length > 0) {
      // CRITICAL: Filter out invalid reference images BEFORE processing
      // Gemini cannot process SVG data URLs, empty strings, or invalid formats
      const validReferenceImages = options.referenceImages.filter(url => {
        // Skip empty strings
        if (!url || url.trim() === '') {
          return false
        }
        // Skip SVG data URLs (Gemini can't process SVG)
        if (url.startsWith('data:image/svg+xml')) {
          console.warn(`[${modelLabel}] ⚠️ Skipping invalid SVG reference image: ${url.substring(0, 60)}...`)
          return false
        }
        // Only allow: Storage URLs, PNG/JPEG base64, or external image URLs
        const isValid = 
          url.startsWith('https://firebasestorage.googleapis.com/') ||
          url.startsWith('https://storage.googleapis.com/') ||
          url.startsWith('https://') ||
          (url.startsWith('data:image/png') || url.startsWith('data:image/jpeg') || url.startsWith('data:image/jpg'))
        
        if (!isValid) {
          console.warn(`[${modelLabel}] ⚠️ Skipping invalid reference image format: ${url.substring(0, 60)}...`)
          return false
        }
        return true
      })
      
      if (validReferenceImages.length === 0) {
        console.warn(`[${modelLabel}] ⚠️ No valid reference images after filtering (${options.referenceImages.length} provided, all invalid)`)
      } else if (validReferenceImages.length < options.referenceImages.length) {
        console.log(`[${modelLabel}] ⚠️ Filtered ${options.referenceImages.length - validReferenceImages.length} invalid reference image(s), using ${validReferenceImages.length} valid image(s)`)
      }
      
      // Add reference images for style consistency
      // CRITICAL: These reference images define the art style - match them EXACTLY
      console.log(`[${modelLabel}] 📸 Using ${validReferenceImages.length} valid reference image(s) - these are CHARACTER IMAGES from story bible`)
      
      // Build character-to-image mapping text for explicit matching (HIGHEST PRIORITY)
      let characterMappingText = ''
      if (options.characterImageMap && Object.keys(options.characterImageMap).length > 0) {
        const imageOrder: Array<{ name: string; url: string; index: number }> = []
        
        // Map each character to their image index (only for valid images)
        for (const [charName, imageUrl] of Object.entries(options.characterImageMap)) {
          // Only include if the image URL is in the valid list
          if (validReferenceImages.includes(imageUrl)) {
            const imageIndex = validReferenceImages.indexOf(imageUrl) + 1
            if (imageIndex > 0) {
              imageOrder.push({ name: charName, url: imageUrl, index: imageIndex })
            }
          }
        }
        
        characterMappingText = '═══════════════════════════════════════════════════════════════\n'
        characterMappingText += '🚨 CRITICAL: CHARACTER IDENTITY MATCHING (HIGHEST PRIORITY) 🚨\n'
        characterMappingText += '═══════════════════════════════════════════════════════════════\n\n'
        characterMappingText += '⚠️ ABSOLUTE REQUIREMENT: The following reference images show the MANDATORY core identity of each character.\n'
        characterMappingText += '⚠️ CORE FEATURES (face, build, ethnicity, age) must match reference image exactly.\n'
        characterMappingText += '⚠️ ADAPTABLE FEATURES (clothing, hairstyle, accessories) can change for scene context.\n\n'

        // Add explicit per-character requirements
        for (const mapping of imageOrder) {
          characterMappingText += `━━━ CHARACTER: ${mapping.name} ━━━\n`
          characterMappingText += `📸 Reference Image ${mapping.index} shows the MANDATORY core identity for "${mapping.name}"\n`
          characterMappingText += `✓ MUST MATCH EXACTLY: Face, ethnicity, skin tone, age, body type, facial structure, core features\n`
          characterMappingText += `✓ CAN ADAPT FOR SCENE: Clothing (suit for ball, athletic wear for gym), hairstyle variations, accessories, expression\n`
          characterMappingText += `✗ NEVER CHANGE: Ethnicity, age, face shape, facial features, body build, core identifying characteristics\n`
          characterMappingText += `✗ FORBIDDEN: Creating a different person who looks "similar" - use THE SAME PERSON from the reference\n\n`
        }

        characterMappingText += 'IMPORTANT: These are the ONLY character designs to use. Core identity must match - scene adaptations allowed.\n'
        characterMappingText += '═══════════════════════════════════════════════════════════════\n'
        
        console.log(`[${modelLabel}] ✅ Character-image mappings created: ${imageOrder.length} character(s) mapped to reference images`)
        console.log(`[${modelLabel}] Character mappings: ${imageOrder.map(m => `${m.name} → Image ${m.index}`).join(', ')}`)
      } else {
        console.warn(`[${modelLabel}] ⚠️ No character-image map provided - character matching may be less accurate`)
      }
      
      // Section 1: Character Reference Mapping (HIGHEST PRIORITY)
      if (characterMappingText) {
        parts.push({ 
          text: characterMappingText
        })
      }
      
      let successfullyLoadedImages = 0
      const characterImageIndices = new Map<string, number>() // Track which image index corresponds to which character
      
      // Section 2: Load images with clear labels (only valid images)
      for (let i = 0; i < validReferenceImages.length; i++) {
        const refImageUrl = validReferenceImages[i]
        
        // Find which character this image belongs to
        let characterName = ''
        if (options.characterImageMap) {
          for (const [name, url] of Object.entries(options.characterImageMap)) {
            if (url === refImageUrl) {
              characterName = name
              characterImageIndices.set(name, i + 1)
              break
            }
          }
        }
        
        try {
          const imageLabel = isCharacterImage
            ? ` (🚨 CHARACTER REFERENCE: ${characterName} - MANDATORY APPEARANCE)`
            : ` (Style Reference)`
          console.log(`[${modelLabel}] Loading reference image ${i + 1}/${validReferenceImages.length}${imageLabel}: ${refImageUrl.substring(0, 60)}...`)

          // CRITICAL: Validate image format before processing
          if (refImageUrl.startsWith('data:image/svg+xml')) {
            throw new Error('SVG images are not supported as reference images')
          }

          const base64Data = await fetchImageAsBase64(refImageUrl)
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          })
          successfullyLoadedImages++
          if (isCharacterImage) {
            console.log(`[${modelLabel}] ✅ 🚨 CHARACTER IMAGE LOADED: ${characterName} - This is a MANDATORY appearance reference`)
          } else {
            console.log(`[${modelLabel}] ✅ Successfully loaded style reference image ${i + 1}`)
          }
        } catch (refError: any) {
          const errorLabel = isCharacterImage ? `🚨 CHARACTER REFERENCE FAILED: ${characterName}` : 'Style reference'
          console.error(`[${modelLabel}] ❌ Failed to load ${errorLabel} image ${i + 1} (${refImageUrl.substring(0, 60)}...): ${refError.message}`)
          // Continue without this reference image
        }
      }
      console.log(`[${modelLabel}] ✅ Loaded ${successfullyLoadedImages}/${validReferenceImages.length} reference images successfully`)
      
      // Section 3: Art Style + Character Appearance Requirements
      let artStyleText = ''
      if (options.artStyleDescription) {
        artStyleText = `\n${options.artStyleDescription}\n`
        console.log(`[${modelLabel}] ✅ Art style description included: ${options.artStyleDescription}`)
      } else {
        artStyleText = '\nArt Style: Match the EXACT visual style of the reference images (rendering technique, color palette, line work, shading, overall aesthetic).\n'
        console.log(`[${modelLabel}] ⚠️ No art style description provided, using generic style instruction`)
      }
      
      let characterAppearanceText = ''
      if (options.characterDescriptions && options.characterDescriptions.length > 0) {
        characterAppearanceText = '\nCharacter Appearances:\n'
        for (const charDesc of options.characterDescriptions) {
          characterAppearanceText += `• ${charDesc.name}: ${charDesc.description}\n`
        }
        console.log(`[${modelLabel}] ✅ Including ${options.characterDescriptions.length} character appearance description(s) in prompt`)
        console.log(`[${modelLabel}] Character descriptions: ${options.characterDescriptions.map(cd => `${cd.name} (${cd.description.substring(0, 40)}...)`).join(', ')}`)
      } else {
        console.warn(`[${modelLabel}] ⚠️ NO character descriptions provided - character appearance matching may be inaccurate`)
      }
      
      console.log(`[${modelLabel}] 📋 Final prompt structure: Character mapping → ${successfullyLoadedImages} reference images → Style/Character requirements → Scene prompt`)
      
      // Build enhanced character matching instructions
      let characterMatchingInstructions = ''
      if (characterMappingText && successfullyLoadedImages > 0) {
        characterMatchingInstructions = `

═══════════════════════════════════════════════════════════════
CRITICAL CHARACTER MATCHING REQUIREMENTS (HIGHEST PRIORITY):
═══════════════════════════════════════════════════════════════

1. CHARACTER IDENTITY MATCHING (MANDATORY):
   • Every character mentioned in the scene MUST look IDENTICALLY like their corresponding reference image
   • If a character name appears in the scene description, find their reference image above and replicate their appearance precisely
   • Do NOT create new character designs - ONLY use the exact appearances from the reference images provided

2. WHAT MUST STAY IDENTICAL (NEVER CHANGE):
   • Face: facial structure, features, skin tone, ethnicity
   • Build: height, body type, proportions, age
   • Hair color: base color must match reference image
   • Core identifying features from reference image

3. WHAT CAN ADAPT TO SCENE CONTEXT:
   • Clothing: can change for scene (formal wear for ball, athletic clothes for gym)
   • Hairstyle: can be styled differently (ponytail, loose, updo, etc.) while maintaining hair color
   • Accessories: can add/remove for scene context
   • Expression: must match scene emotion and action
   • Hair length: can vary slightly for scene context while maintaining overall appearance

4. ART STYLE CONSISTENCY (MANDATORY):
   • The rendering technique, color palette, line work, shading, and overall aesthetic must match the reference images exactly
   • Use the same art style as shown in the character reference images

5. SCENE COMPOSITION:
   • Place characters in the scene as described, maintaining their EXACT appearance from reference images
   • Lighting and camera angles can vary, but character appearance must remain consistent with references

═══════════════════════════════════════════════════════════════`
      }

      // Add character validation checklist AFTER the scene prompt
      let characterValidationText = ''
      if (characterMappingText && successfullyLoadedImages > 0) {
        characterValidationText = `

═══════════════════════════════════════════════════════════════
🔍 CHARACTER IDENTITY VALIDATION CHECKLIST (BEFORE GENERATING):
═══════════════════════════════════════════════════════════════

Before generating this image, VERIFY each character against their reference:

`
        // Add per-character checklist
        for (const mapping of imageOrder) {
          characterValidationText += `□ "${mapping.name}" → Check Reference Image ${mapping.index}:
   • Face EXACTLY matches reference? ✓ / ✗
   • Ethnicity EXACTLY matches reference? ✓ / ✗
   • Age EXACTLY matches reference? ✓ / ✗
   • Body type EXACTLY matches reference? ✓ / ✗

`
        }

        characterValidationText += `🚨 CORE IDENTITY CHECKS - Verify before generating:
• Face, ethnicity, age, body type MUST match reference
• Clothing, hairstyle, accessories SHOULD adapt to scene

═══════════════════════════════════════════════════════════════
`
      }

      // Build enhanced prompt with scriptContext priority
      let scenePrompt = ''
      if (options.scriptContext) {
        scenePrompt = `SCRIPT ACTION: ${options.scriptContext}

VISUAL DESCRIPTION: ${sanitizedPrompt}`
      } else {
        scenePrompt = sanitizedPrompt
      }
      
      parts.push({ 
        text: `STYLE & CHARACTER REQUIREMENTS:${artStyleText}${characterAppearanceText}

SCENE TO GENERATE:
${scenePrompt}
${characterMatchingInstructions}

${options.scriptContext ? `CRITICAL: The image MUST depict the script action "${options.scriptContext}" exactly as described. This is the primary action happening in this frame.` : ''}

VISUAL STORYTELLING REQUIREMENTS:
• Create a cinematic, narrative frame suitable for visual storytelling (like illustrated books or graphic novels)
• The image should be immersive and tell the story through visual composition alone
• **ABSOLUTELY NO dialog bubbles, speech bubbles, text overlays, or written words in the image**
• Focus on character expressions, body language, and environmental storytelling
• The frame should be consumable as pure visual narrative without text elements

${characterValidationText}

🚨🚨🚨 FINAL REMINDER BEFORE GENERATING 🚨🚨🚨
${characterImageMap && Object.keys(characterImageMap).length > 0 ? `
The reference images above show each character's CORE IDENTITY (face, ethnicity, age, build).
CORE FEATURES are MANDATORY and must match the reference exactly.
ADAPTABLE FEATURES (clothing, hairstyle, accessories) should adapt to scene context.
DO NOT change the character's core identity - maintain their face, ethnicity, age, and build.
Scene-appropriate costume and styling variations are expected and encouraged.
` : ''}

REMINDER: The reference images above show the EXACT appearance of each character. When generating this scene, every character must look IDENTICALLY like their reference image - no variations, no creative interpretations. Match them exactly.` 
      })
    } else {
      // No reference images - use standard prompt
      const imagePrompt = `Generate a high-quality image: ${sanitizedPrompt}`
      parts.push({ text: imagePrompt })
    }
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: parts
      }],
    });
    
    const response = result.response;
    
    // Check if response contains image data
    // Gemini may return images in different formats depending on the model
    let imageData: string | null = null;
    let mimeType: string = 'image/png';
    
    // Try to extract image from response
    // Method 1: Check for inline data in parts
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          // Check for inline data (base64 image)
          if ('inlineData' in part && part.inlineData) {
            imageData = part.inlineData.data;
            mimeType = part.inlineData.mimeType || 'image/png';
            break;
          }
          // Check for text that might contain image URL or base64
          if ('text' in part && part.text) {
            // Sometimes Gemini returns base64 in text format
            const text = part.text;
            if (text.startsWith('data:image/')) {
              // Already a data URL
              imageData = text;
              break;
            } else if (text.length > 100 && /^[A-Za-z0-9+/=]+$/.test(text)) {
              // Might be base64
              try {
                imageData = text;
                break;
              } catch (e) {
                // Not base64, continue
              }
            }
          }
        }
      }
    }
    
    // If no image data found, try alternative approach
    // Some Gemini models return images differently
    if (!imageData) {
      // For models that support image generation, we might need to use a different approach
      // This is a fallback - in practice, the model should return image data
      throw new Error('No image data found in Gemini response. The model may not support image generation or returned an unexpected format.');
    }
    
    // Convert to data URL if it's base64
    let imageUrl: string;
    if (imageData.startsWith('data:')) {
      imageUrl = imageData;
    } else {
      imageUrl = base64ToDataUrl(imageData, mimeType);
    }
    
    const generationTime = Date.now() - startTime;
    
    console.log(`✅ [${modelLabel}] Image generated successfully in ${generationTime}ms`);
    
    return {
      imageUrl,
      success: true,
      metadata: {
        model: modelName,
        aspectRatio: options.aspectRatio || '1:1',
        generationTime,
      },
    };
    
  } catch (error: any) {
    const errorModelLabel = options.model === 'nano-banana-pro' ? 'NANO BANANA PRO' : 'NANO BANANA';
    console.error(`❌ [${errorModelLabel}] Image generation failed:`, error);
    
    // Only retry with fallback if we were using Nano Banana Pro
    // If already using Nano Banana, don't retry
    if (options.model === 'nano-banana-pro') {
      // Handle 429 rate limit errors - fallback to Nano Banana (gemini-2.5-flash-image)
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('rate limit')) {
        console.log(`🔄 [${errorModelLabel}] Rate limit (429) hit, falling back to Nano Banana...`);
        
        try {
          // Fallback to Nano Banana for 429 errors
          return await generateImageWithNanoBanana(prompt, options);
        } catch (fallbackError: any) {
          console.error('❌ [NANO BANANA FALLBACK] Fallback to Nano Banana also failed:', fallbackError);
          return {
            imageUrl: '',
            success: false,
            error: `Rate limit on Nano Banana Pro, fallback to Nano Banana also failed: ${fallbackError.message}`,
          };
        }
      }
      
      // If the error is about model not supporting image generation, try Nano Banana fallback
      if (error.message?.includes('not support') || error.message?.includes('image generation') || error.message?.includes('not found')) {
        console.log('🔄 [GEMINI IMAGE] Model not available, falling back to Nano Banana...');
        
        try {
          return await generateImageWithNanoBanana(prompt, options);
        } catch (fallbackError: any) {
          return {
            imageUrl: '',
            success: false,
            error: `Both models failed: ${error.message}; ${fallbackError.message}`,
          };
        }
      }
    }
    
    return {
      imageUrl: '',
      success: false,
      error: error.message || 'Unknown error during image generation',
    };
  }
}

/**
 * 🔄 FALLBACK: Generate image using Nano Banana (gemini-2.5-flash-image)
 * Used when Nano Banana Pro hits rate limits (429 errors)
 * 
 * Based on Google's official documentation:
 * https://ai.google.dev/gemini-api/docs/image-generation
 */
async function generateImageWithNanoBanana(
  prompt: string,
  options: GeminiImageOptions = {}
): Promise<GeminiImageResponse> {
  const startTime = Date.now();
  
  try {
    const apiKey = getGeminiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const modelName = NANO_BANANA_FALLBACK_MODEL; // gemini-2.5-flash-image
    console.log(`🎨 [NANO BANANA FALLBACK] Generating image with Nano Banana (${modelName})`);
    console.log(`📝 [NANO BANANA FALLBACK] Prompt: ${prompt.substring(0, 100)}...`);
    
    const sanitizedPrompt = sanitizePrompt(prompt);
    
    // Configure model with responseModalities for image generation
    // As per Google's documentation: https://ai.google.dev/gemini-api/docs/image-generation
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        // @ts-ignore - responseModalities is a valid config for image models
        responseModalities: ['TEXT', 'IMAGE'],
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });
    
    const imagePrompt = `Generate a high-quality image: ${sanitizedPrompt}`;
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: imagePrompt }]
      }],
    });
    
    const response = result.response;
    
    // Extract image data - Nano Banana returns images in inlineData
    let imageData: string | null = null;
    let mimeType: string = 'image/png';
    
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if ('inlineData' in part && part.inlineData) {
            imageData = part.inlineData.data;
            mimeType = part.inlineData.mimeType || 'image/png';
            console.log(`✅ [NANO BANANA FALLBACK] Found image data, mimeType: ${mimeType}`);
            break;
          }
        }
      }
    }
    
    if (!imageData) {
      throw new Error('No image data found in Nano Banana response');
    }
    
    const imageUrl = imageData.startsWith('data:') 
      ? imageData 
      : base64ToDataUrl(imageData, mimeType);
    
    const generationTime = Date.now() - startTime;
    
    console.log(`✅ [NANO BANANA FALLBACK] Image generated successfully in ${generationTime}ms`);
    
    return {
      imageUrl,
      success: true,
      metadata: {
        model: modelName,
        aspectRatio: options.aspectRatio || '1:1',
        generationTime,
      },
    };
    
  } catch (error: any) {
    console.error(`❌ [NANO BANANA FALLBACK] Image generation failed:`, error);
    throw error;
  }
}

/**
 * @deprecated Use generateImageWithNanoBanana instead
 * Alternative implementation using gemini-3-pro-preview model (kept for compatibility)
 */
async function generateImageWithGeminiFlashImage(
  prompt: string,
  options: GeminiImageOptions = {}
): Promise<GeminiImageResponse> {
  // Redirect to Nano Banana fallback
  return generateImageWithNanoBanana(prompt, options);
}

/**
 * Generate image and return as URL (for compatibility with existing code)
 */
export async function generateGeminiImage(
  prompt: string,
  options: GeminiImageOptions = {}
): Promise<string> {
  const result = await generateImageWithGemini(prompt, options);
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to generate image');
  }
  
  return result.imageUrl;
}

