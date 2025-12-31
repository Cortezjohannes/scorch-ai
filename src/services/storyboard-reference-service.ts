/**
 * Storyboard Reference Image Service
 *
 * Provides functions to:
 * - Extract character names from frame descriptions/prompts
 * - Get matching character images from story bible
 * - Query recent storyboard images across all episodes for art style consistency
 * - Combine character images + recent storyboard images with proper priority
 */

import type { StoryBible } from '@/services/story-bible-service'
import type { StoryboardFrame } from '@/types/preproduction'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

/**
 * Validate if an image URL is valid for use as a reference image
 * Gemini cannot process SVG images, so we filter them out
 */
function isValidReferenceImage(imageUrl: string | null | undefined): boolean {
  if (!imageUrl || imageUrl.trim() === '') {
    return false
  }

  // Reject SVG data URLs - Gemini cannot process them
  if (imageUrl.startsWith('data:image/svg+xml')) {
    return false
  }

  // Only allow: Storage URLs, PNG/JPEG base64, or external image URLs
  return (
    imageUrl.startsWith('https://firebasestorage.googleapis.com/') ||
    imageUrl.startsWith('https://storage.googleapis.com/') ||
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('data:image/png') ||
    imageUrl.startsWith('data:image/jpeg') ||
    imageUrl.startsWith('data:image/jpg')
  )
}

/**
 * Extract character names from a prompt/description
 * Uses name matching against story bible characters
 * Searches multiple fields: imagePrompt, notes, description, dialogueSnippet
 */
export function extractCharacterNamesFromPrompt(
  frame: StoryboardFrame,
  storyBible: StoryBible,
  sceneCharacters?: string[] // NEW: Characters explicitly in this scene (most accurate)
): string[] {
  if (!storyBible.mainCharacters || storyBible.mainCharacters.length === 0) {
    return []
  }

  const characterNames = new Set<string>()

  // PRIORITY 1: Use sceneCharacters if provided (most accurate source)
  if (sceneCharacters && sceneCharacters.length > 0) {
    console.log(`[Storyboard Reference] Using provided scene characters: ${sceneCharacters.join(', ')}`)

    // Match sceneCharacters to story bible characters with smart name matching
    for (const sceneChar of sceneCharacters) {
      const matchingStoryBibleChar = findMatchingStoryBibleCharacter(sceneChar, storyBible)
      if (matchingStoryBibleChar) {
        characterNames.add(matchingStoryBibleChar)
        console.log(`[Storyboard Reference] Matched scene character "${sceneChar}" to story bible character "${matchingStoryBibleChar}"`)
      } else {
        console.warn(`[Storyboard Reference] Scene character "${sceneChar}" not found in story bible`)
      }
    }

    return Array.from(characterNames)
  }

  // PRIORITY 2: Fall back to text-based extraction when no scene character list
  console.log(`[Storyboard Reference] No scene characters provided, falling back to text extraction`)

  // Search across all text fields in the frame
  const searchText = [
    frame.imagePrompt || '',
    frame.notes || '',
    frame.dialogueSnippet || ''
  ].join(' ').toLowerCase()

  // Get all character names from story bible
  const allCharacterNames = storyBible.mainCharacters
    .map(char => char.name)
    .filter((name): name is string => !!name)

  // Check if each character name appears in the search text with enhanced matching
  for (const charName of allCharacterNames) {
    if (characterNameAppearsInText(charName, searchText)) {
      characterNames.add(charName)
    }
  }

  if (characterNames.size === 0 && allCharacterNames.length > 0) {
    console.warn(`[Storyboard Reference] No character names found in frame text. Frame may not include character-specific references.`)
  }

  return Array.from(characterNames)
}

/**
 * Smart character name matching that handles first/last/full names
 */
function characterNameAppearsInText(charName: string, searchText: string): boolean {
  const nameLower = charName.toLowerCase()

  // 1. Check for exact full name match
  const wordBoundaryRegex = new RegExp(`\\b${nameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
  if (wordBoundaryRegex.test(searchText)) {
    console.log(`[Storyboard Reference] Found character "${charName}" in frame text (exact full name match)`)
    return true
  }

  // 2. Check for first name match (e.g., "Eleanor" when full name is "Eleanor Wu")
  const firstName = charName.split(' ')[0]
  if (firstName && firstName.length > 2 && firstName.toLowerCase() !== nameLower) {
    const firstNameRegex = new RegExp(`\\b${firstName.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (firstNameRegex.test(searchText)) {
      console.log(`[Storyboard Reference] Found character "${charName}" in frame text (first name match: "${firstName}")`)
      return true
    }
  }

  // 3. Check for last name match (e.g., "Wu" when full name is "Eleanor Wu")
  const lastName = charName.split(' ')[1]
  if (lastName && lastName.length > 2) {
    const lastNameRegex = new RegExp(`\\b${lastName.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (lastNameRegex.test(searchText)) {
      console.log(`[Storyboard Reference] Found character "${charName}" in frame text (last name match: "${lastName}")`)
      return true
    }
  }

  return false
}

/**
 * Find matching character in story bible using smart name matching
 */
function findMatchingStoryBibleCharacter(sceneCharacterName: string, storyBible: StoryBible): string | null {
  if (!storyBible.mainCharacters || storyBible.mainCharacters.length === 0) {
    return null
  }

  const sceneNameLower = sceneCharacterName.toLowerCase()

  // 1. Exact match first
  for (const char of storyBible.mainCharacters) {
    if (char.name && char.name.toLowerCase() === sceneNameLower) {
      return char.name
    }
  }

  // 2. First name match
  const sceneFirstName = sceneCharacterName.split(' ')[0]
  if (sceneFirstName) {
    for (const char of storyBible.mainCharacters) {
      if (char.name && char.name.toLowerCase().startsWith(sceneFirstName.toLowerCase() + ' ')) {
        return char.name
      }
    }
  }

  // 3. Last name match
  const sceneLastName = sceneCharacterName.split(' ')[sceneCharacterName.split(' ').length - 1]
  if (sceneLastName && sceneLastName !== sceneFirstName) {
    for (const char of storyBible.mainCharacters) {
      if (char.name && char.name.toLowerCase().endsWith(' ' + sceneLastName.toLowerCase())) {
        return char.name
      }
    }
  }

  return null
}

/**
 * Get character reference images from story bible
 * Returns image URLs mapped to character names for explicit matching
 */
export function getCharacterReferenceImages(
  characterNames: string[],
  storyBible: StoryBible
): Array<{ name: string; imageUrl: string }> {
  if (!storyBible.mainCharacters || storyBible.mainCharacters.length === 0) {
    return []
  }

  const characterImages: Array<{ name: string; imageUrl: string }> = []

  for (const charName of characterNames) {
    const character = storyBible.mainCharacters?.find(
      char => char.name?.toLowerCase() === charName.toLowerCase()
    )

    if (character?.visualReference?.imageUrl) {
      const imageUrl = character.visualReference.imageUrl
      if (isValidReferenceImage(imageUrl)) {
        characterImages.push({
          name: charName,
          imageUrl: imageUrl
        })
        console.log(`[Storyboard Reference] Found reference image for character: ${charName}`)
      } else {
        console.warn(`[Storyboard Reference] Character "${charName}" has invalid reference image (SVG or unsupported format): ${imageUrl.substring(0, 60)}...`)
      }
    } else {
      console.warn(`[Storyboard Reference] Character "${charName}" has no visual reference image`)
    }
  }

  return characterImages
}

/**
 * Build character appearance descriptions from story bible
 * Used to reinforce character appearance in prompts
 */
export function getCharacterAppearanceDescriptions(
  storyBible: StoryBible,
  characterNames?: string[] // Optional: specific characters to describe
): Array<{ name: string; description: string }> {
  if (!storyBible.mainCharacters || storyBible.mainCharacters.length === 0) {
    return []
  }

  const descriptions: Array<{ name: string; description: string }> = []
  const targetNames = characterNames ? new Set(characterNames.map(n => n.toLowerCase())) : null

  for (const character of storyBible.mainCharacters) {
    const charName = character.name
    if (!charName) continue

    // If specific characters requested, skip others
    if (targetNames && !targetNames.has(charName.toLowerCase())) {
      continue
    }

    // Build appearance description with CRITICAL markers for emphasis
    const parts: string[] = []

    // CRITICAL: Ethnicity FIRST and EMPHASIZED
    const ethnicity = character.physiology?.ethnicity ||
                     character.ethnicity ||
                     character.sociology?.culturalBackground?.ethnicity ||
                     character.sociology?.race
    if (ethnicity) {
      parts.push(`ETHNICITY: ${ethnicity} (CRITICAL - MUST MATCH EXACTLY)`)
    }

    // CRITICAL: Age
    if (character.physiology?.age) {
      parts.push(`AGE: ${character.physiology.age} years old (CRITICAL - MUST MATCH EXACTLY)`)
    }

    // CRITICAL: Gender
    if (character.physiology?.gender || character.gender) {
      parts.push(`GENDER: ${character.physiology?.gender || character.gender} (CRITICAL - MUST MATCH EXACTLY)`)
    }

    // Get physical description
    if (character.physiology?.appearance) {
      parts.push(character.physiology.appearance)
    } else if (character.description) {
      // Try to extract physical appearance from description
      const desc = typeof character.description === 'string' ? character.description : JSON.stringify(character.description)
      parts.push(desc)
    }

    if (parts.length > 0) {
      descriptions.push({
        name: charName,
        description: parts.join(', ')
      })
    }
  }

  return descriptions
}

/**
 * Analyze and describe the art style from story bible character images
 * Provides explicit text description to reinforce visual references
 */
export function getArtStyleDescription(storyBible: StoryBible): string {
  // Check if story bible has style metadata
  if (storyBible.visualAssets?.heroImage?.prompt) {
    // Extract style keywords from hero image prompt
    const prompt = storyBible.visualAssets.heroImage.prompt.toLowerCase()

    // Common art style keywords to look for
    const styleKeywords = [
      'realistic', 'illustrated', 'sketch', 'painted', 'digital art',
      'anime', 'cartoon', 'comic', 'cinematic', 'stylized',
      'watercolor', 'oil painting', 'pencil', 'charcoal'
    ]

    const detectedStyles = styleKeywords.filter(keyword => prompt.includes(keyword))

    if (detectedStyles.length > 0) {
      return `Art style: ${detectedStyles.join(', ')}`
    }
  }

  // Fallback: generic description based on genre/tone
  const genre = storyBible.genre?.toLowerCase() || ''
  const tone = storyBible.tone?.toLowerCase() || ''

  if (genre.includes('drama') || tone.includes('serious')) {
    return 'Art style: Semi-realistic, cinematic quality with natural lighting and proportions'
  } else if (genre.includes('comedy')) {
    return 'Art style: Stylized with expressive features and dynamic poses'
  } else if (genre.includes('sci-fi') || genre.includes('fantasy')) {
    return 'Art style: Detailed concept art style with dramatic lighting'
  }

  return 'Art style: Consistent with the provided reference images'
}

/**
 * Get recent storyboard images across all episodes
 * Queries Firestore for the most recent frames with images
 *
 * @param storyBibleId - Story bible ID
 * @param userId - User ID
 * @param currentEpisodeNumber - Current episode number (to exclude from query if needed, or include all)
 * @param limit - Maximum number of images to return (default: 5)
 * @returns Array of image URLs from recent storyboard frames
 */
export async function getRecentStoryboardImages(
  storyBibleId: string,
  userId: string,
  currentEpisodeNumber: number,
  limit: number = 5
): Promise<string[]> {
  if (!userId || !storyBibleId) {
    console.warn('[Storyboard Reference] Missing userId or storyBibleId, skipping recent images query')
    return []
  }

  try {
    // Query all preproduction documents for this story bible
    const preproductionRef = collection(
      db,
      'users',
      userId,
      'storyBibles',
      storyBibleId,
      'preproduction'
    )

    const q = query(
      preproductionRef,
      where('storyBibleId', '==', storyBibleId)
    )

    const snapshot = await getDocs(q)

    // Collect all frames with images across all episodes
    interface FrameWithTimestamp {
      imageUrl: string
      timestamp: number
      episodeNumber: number
    }

    const framesWithImages: FrameWithTimestamp[] = []

    snapshot.docs.forEach(doc => {
      const data = doc.data()

      // Check if this is episode preproduction with storyboards
      if (data.type === 'episode' && data.storyboards?.scenes) {
        const episodeNumber = data.episodeNumber || 0
        const lastUpdated = data.lastUpdated || data.updatedAt?.toMillis?.() || 0

        // Extract frames with images from all scenes
        data.storyboards.scenes.forEach((scene: any) => {
          if (scene.frames && Array.isArray(scene.frames)) {
            scene.frames.forEach((frame: any) => {
              if (frame.frameImage &&
                  typeof frame.frameImage === 'string' &&
                  frame.frameImage.trim().length > 0 &&
                  // Only include Storage URLs or valid data URLs
                  (frame.frameImage.startsWith('https://') || frame.frameImage.startsWith('data:image/'))) {
                framesWithImages.push({
                  imageUrl: frame.frameImage,
                  timestamp: lastUpdated,
                  episodeNumber
                })
              }
            })
          }
        })
      }
    })

    // Sort by timestamp (most recent first) and take the limit
    framesWithImages.sort((a, b) => b.timestamp - a.timestamp)

    // Get unique image URLs (avoid duplicates)
    const uniqueImages = new Set<string>()
    const recentImages: string[] = []

    for (const frame of framesWithImages) {
      if (!uniqueImages.has(frame.imageUrl) && recentImages.length < limit) {
        uniqueImages.add(frame.imageUrl)
        recentImages.push(frame.imageUrl)
      }
    }

    console.log(`[Storyboard Reference] Found ${recentImages.length} recent storyboard images across all episodes`)

    return recentImages
  } catch (error: any) {
    console.error('[Storyboard Reference] Error querying recent storyboard images:', error)
    // Return empty array on graceful degradation
    return []
  }
}

/**
 * Get ALL character images from story bible as style references
 * These should be the primary style guide for all storyboard images
 */
export function getAllCharacterImagesFromStoryBible(storyBible: StoryBible): string[] {
  if (!storyBible.mainCharacters || storyBible.mainCharacters.length === 0) {
    console.warn('[Storyboard Reference] No mainCharacters found in story bible')
    return []
  }

  const allCharacterImages: string[] = []
  let charactersWithImages = 0
  let charactersWithoutImages = 0

  console.log(`[Storyboard Reference] Checking ${storyBible.mainCharacters.length} characters for images...`)

  for (const character of storyBible.mainCharacters) {
    const charName = character.name || 'Unnamed'

    if (character.visualReference?.imageUrl) {
      const imageUrl = character.visualReference.imageUrl
      if (isValidReferenceImage(imageUrl)) {
        allCharacterImages.push(imageUrl)
        charactersWithImages++
        console.log(`  ✅ ${charName}: HAS IMAGE - ${imageUrl.substring(0, 60)}...`)
      } else {
        charactersWithoutImages++
        console.warn(`  ⚠️ ${charName}: INVALID IMAGE (SVG or unsupported format) - ${imageUrl.substring(0, 60)}...`)
      }
    } else {
      charactersWithoutImages++
      console.warn(`  ⚠️ ${charName}: NO IMAGE - visualReference: ${character.visualReference ? 'exists but no imageUrl' : 'missing'}`)
    }
  }

  console.log(`[Storyboard Reference] Found ${charactersWithImages} character images, ${charactersWithoutImages} without images`)

  return allCharacterImages
}

/**
 * Get all reference images for a storyboard frame
 * Combines character images (prioritized first) + recent storyboard images
 *
 * PRIORITY ORDER:
 * 1. Character images for characters mentioned in this frame (ALL of them) - for character appearance matching
 * 2. ALL other character images from story bible - PRIMARY style reference
 * 3. Recent storyboard images (3-5 images) - for art style consistency across scenes
 *
 * No arbitrary limits - include all character images to ensure style consistency
 * Gemini can handle 10+ reference images effectively
 */
export async function getStoryboardReferenceImages(
  frame: StoryboardFrame,
  storyBible: StoryBible,
  storyBibleId: string,
  userId: string,
  currentEpisodeNumber: number,
  sceneCharacters?: string[] // NEW: Characters explicitly in this scene (most accurate)
): Promise<{ images: string[]; characterDescriptions: Array<{ name: string; description: string }>; characterImageMap: Record<string, string>; artStyleDescription: string }> {
  const referenceImages: string[] = []
  const usedImageUrls = new Set<string>() // Track to avoid duplicates
  let characterImageCount = 0
  let recentStoryboardCount = 0

  // Step 1: Get character images ONLY for characters in this scene (filtered approach)
  const characterNamesInFrame = extractCharacterNamesFromPrompt(frame, storyBible, sceneCharacters)
  const frameCharacterImageMappings = getCharacterReferenceImages(characterNamesInFrame, storyBible)

  // Store character name to image mapping for explicit prompts
  const characterImageMap = new Map<string, string>()

  if (frameCharacterImageMappings.length > 0) {
    // Add character images ONLY for characters confirmed to be in this scene
    for (const mapping of frameCharacterImageMappings) {
      if (isValidReferenceImage(mapping.imageUrl) && !usedImageUrls.has(mapping.imageUrl)) {
        referenceImages.push(mapping.imageUrl)
        usedImageUrls.add(mapping.imageUrl)
        characterImageMap.set(mapping.name, mapping.imageUrl)
        characterImageCount++
      } else if (!isValidReferenceImage(mapping.imageUrl)) {
        console.warn(`[Storyboard Reference] Frame ${frame.id}: Skipping invalid image for "${mapping.name}" (SVG or unsupported format): ${mapping.imageUrl.substring(0, 60)}...`)
      }
    }
    console.log(`[Storyboard Reference] Frame ${frame.id}: Added ${frameCharacterImageMappings.length} character image(s) ONLY for characters in this scene: ${characterNamesInFrame.join(', ')}`)
  } else {
    console.log(`[Storyboard Reference] Frame ${frame.id}: No character images found for scene characters - art style will rely on recent storyboard images`)
  }

  if (characterImageCount === 0) {
    console.error(`[Storyboard Reference] ⚠️⚠️⚠️ WARNING: NO CHARACTER IMAGES FOUND IN STORY BIBLE! ⚠️⚠️⚠️`)
    console.error(`[Storyboard Reference] Story bible has ${storyBible.mainCharacters?.length || 0} characters, but none have visualReference.imageUrl`)
  }

  if (characterImageCount > 0) {
    console.log(`[Storyboard Reference] Frame ${frame.id}: ✅ Added ${characterImageCount} total character image(s) from story bible as style reference`)
  } else {
    console.error(`[Storyboard Reference] Frame ${frame.id}: ❌ NO CHARACTER IMAGES ADDED - Story bible characters may not have images!`)
  }

  // Step 2: Get recent storyboard images (for art style consistency across episodes)
  // TIGHTENED: When character images are present, minimize style reference images to prioritize character likeness
  // Only get style references if we have character images (to maintain art style), but keep it minimal
  let recentImages: string[] = []
  if (characterImageCount > 0) {
    // If we have character images, get only 1 recent storyboard for art style (minimal dilution)
    recentImages = await getRecentStoryboardImages(
      storyBibleId,
      userId,
      currentEpisodeNumber,
      1 // TIGHTENED: Only 1 style reference when character images present - prioritize character likeness
    )
  } else {
    // If no character images, get more style references (up to 3) for art style consistency
    recentImages = await getRecentStoryboardImages(
      storyBibleId,
      userId,
      currentEpisodeNumber,
      3 // More style references when no character images available
    )
  }

  // Add recent storyboard images (avoid duplicates and invalid formats)
  // TIGHTENED: Character identity takes absolute priority over style consistency
  let validRecentImages = 0
  for (const imgUrl of recentImages) {
    if (isValidReferenceImage(imgUrl) && !usedImageUrls.has(imgUrl) && referenceImages.length < 15) {
      // Reduced upper limit to 15 total images to prioritize character images
      referenceImages.push(imgUrl)
      usedImageUrls.add(imgUrl)
      recentStoryboardCount++
      validRecentImages++
    } else if (!isValidReferenceImage(imgUrl)) {
      console.warn(`[Storyboard Reference] Frame ${frame.id}: Skipping invalid recent storyboard image (SVG or unsupported format): ${imgUrl.substring(0, 60)}...`)
    }
  }

  // TIGHTENED: Character images take priority - style references are secondary
  if (validRecentImages === 0 && characterImageCount > 0) {
    console.log(`[Storyboard Reference] Frame ${frame.id}: No recent storyboard images found, relying on character images for both character likeness AND art style`)
  } else if (characterImageCount > 0) {
    console.log(`[Storyboard Reference] Frame ${frame.id}: ✅ Added ${recentStoryboardCount} recent storyboard image(s) for minimal art style reference (character images prioritized)`)
  } else {
    console.log(`[Storyboard Reference] Frame ${frame.id}: ✅ Added ${recentStoryboardCount} recent storyboard image(s) for art style reference`)
  }

  if (recentStoryboardCount > 0) {
    console.log(`[Storyboard Reference] Frame ${frame.id}: Added ${recentStoryboardCount} recent storyboard image(s) for cross-episode consistency`)
  }

  console.log(`[Storyboard Reference] Frame ${frame.id}: Total reference images: ${referenceImages.length} (${characterImageCount} scene character images + ${recentStoryboardCount} recent storyboard images)`)

  // Get character descriptions ONLY for characters in this scene whose images we're using as references
  // This reinforces appearance in the prompt for accurate character matching
  const sceneCharacterNamesWithImages = Array.from(characterImageMap.keys())

  console.log(`[Storyboard Reference] Frame ${frame.id}: Getting descriptions for ${sceneCharacterNamesWithImages.length} scene characters with images`)

  const characterDescriptions = getCharacterAppearanceDescriptions(
    storyBible,
    sceneCharacterNamesWithImages.length > 0 ? sceneCharacterNamesWithImages : undefined
  )

  if (characterDescriptions.length > 0) {
    console.log(`[Storyboard Reference] Frame ${frame.id}: ✅ Generated ${characterDescriptions.length} character description(s): ${characterDescriptions.map(c => `${c.name} (${c.description.substring(0, 50)}...)`).join(', ')}`)
  } else {
    console.warn(`[Storyboard Reference] Frame ${frame.id}: ⚠️ NO character descriptions generated despite ${sceneCharacterNamesWithImages.length} characters with images`)
  }

  // Get art style description
  const artStyleDescription = getArtStyleDescription(storyBible)
  console.log(`[Storyboard Reference] Frame ${frame.id}: Art style description: ${artStyleDescription}`)

  return {
    images: referenceImages,
    characterDescriptions,
    characterImageMap: Object.fromEntries(characterImageMap), // Map character names to their image URLs
    artStyleDescription
  }
}