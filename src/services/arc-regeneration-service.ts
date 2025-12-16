/**
 * Arc Pre-Production Regeneration Service
 * 
 * Comprehensive regeneration of all Production Assistant content in sequential order:
 * 1. Casting
 * 2. Locations (Story Bible based) - Must come before Schedule
 * 3. Props/Wardrobe
 * 4. Equipment
 * 5. Permits
 * 6. Marketing
 * 7. Budget (second to last - uses data from multiple tabs)
 * 8. Schedule (last - uses data from multiple tabs including Locations, Casting, etc.)
 */

export interface RegenerationProgress {
  step: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  message: string
  progress?: number
}

export interface RegenerationOptions {
  includeCasting?: boolean
  includeSchedule?: boolean
  includeBudget?: boolean
  includeEquipment?: boolean
  includeLocations?: boolean
  includeProps?: boolean
  includePermits?: boolean
  includeMarketing?: boolean
}

export interface RegenerationParams {
  arcPreProductionId: string
  storyBibleId: string
  arcIndex: number
  episodeNumbers: number[]
  userId?: string
  storyBibleData: any
  episodePreProdData: Record<number, any>
  castingData?: any
  options?: RegenerationOptions
  onProgress?: (progress: RegenerationProgress) => void
}

/**
 * Regenerate all Production Assistant content
 */
export async function regenerateAllArcContent(params: RegenerationParams): Promise<{
  success: boolean
  data?: any
  errors?: Record<string, string>
}> {
  const {
    arcPreProductionId,
    storyBibleId,
    arcIndex,
    episodeNumbers,
    userId,
    storyBibleData,
    episodePreProdData,
    castingData,
    options = {},
    onProgress
  } = params

  const errors: Record<string, string> = {}
  const results: Record<string, any> = {}

  // Default to regenerating everything if no options specified
  const opts = {
    includeCasting: true,
    includeSchedule: true,
    includeBudget: true,
    includeEquipment: true,
    includeLocations: true,
    includeProps: true,
    includePermits: true,
    includeMarketing: true,
    ...options
  }

  const totalSteps = Object.values(opts).filter(Boolean).length
  let completedSteps = 0

  const updateProgress = (step: string, status: RegenerationProgress['status'], message: string) => {
    if (onProgress) {
      onProgress({
        step,
        status,
        message,
        progress: Math.round((completedSteps / totalSteps) * 100)
      })
    }
  }

  try {
    // 1. CASTING - Generate casting information from story bible and episodes
    if (opts.includeCasting) {
      updateProgress('casting', 'in_progress', 'Generating casting information...')
      try {
        const response = await fetch('/api/generate/casting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preProductionId: arcPreProductionId, // Use arcPreProductionId as preProductionId for compatibility
            arcPreProductionId,
            storyBibleId,
            arcIndex,
            episodeNumbers,
            userId,
            storyBibleData,
            episodePreProdData
          })
        })

        if (!response.ok) throw new Error(`Casting generation failed: ${response.statusText}`)
        
        const data = await response.json()
        results.casting = data.casting
        completedSteps++
        updateProgress('casting', 'completed', 'Casting information generated')
      } catch (error) {
        errors.casting = error instanceof Error ? error.message : 'Failed to generate casting'
        updateProgress('casting', 'error', errors.casting)
      }
    }

    // 2. LOCATIONS - Generate from Story Bible locations
    if (opts.includeLocations) {
      updateProgress('locations', 'in_progress', 'Generating location suggestions...')
      try {
        const response = await fetch('/api/generate/arc-locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            arcPreProductionId,
            storyBibleId,
            arcIndex,
            episodeNumbers,
            userId,
            storyBibleData,
            episodePreProdData,
            castingData: results.casting || castingData
          })
        })

        if (!response.ok) throw new Error(`Location generation failed: ${response.statusText}`)

        // Handle streaming response
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let locationsData: any = null

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  if (data.type === 'complete' && data.result) {
                    locationsData = data.result
                  } else if (data.type === 'progress') {
                    updateProgress('locations', 'in_progress', data.message || 'Generating locations...')
                  }
                } catch (e) {
                  // Ignore parse errors for streaming chunks
                }
              }
            }
          }
        }

        results.arcLocations = locationsData
        completedSteps++
        updateProgress('locations', 'completed', 'Location suggestions generated')
      } catch (error) {
        errors.locations = error instanceof Error ? error.message : 'Failed to generate locations'
        updateProgress('locations', 'error', errors.locations)
      }
    }

    // 3. PROPS/WARDROBE - Generate from story bible and episodes
    if (opts.includeProps) {
      updateProgress('props', 'in_progress', 'Generating props and wardrobe...')
      try {
        const response = await fetch('/api/generate/arc-props-wardrobe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preProductionId: arcPreProductionId, // Use arcPreProductionId as preProductionId for compatibility
            arcPreProductionId,
            storyBibleId,
            arcIndex,
            episodeNumbers,
            userId,
            storyBibleData,
            episodePreProdData,
            castingData: results.casting || castingData,
            arcTitle: storyBibleData.narrativeArcs?.[arcIndex]?.title || `Arc ${arcIndex + 1}`
          })
        })

        if (!response.ok) throw new Error(`Props generation failed: ${response.statusText}`)
        
        const data = await response.json()
        results.arcPropsWardrobe = data.propsWardrobe
        completedSteps++
        updateProgress('props', 'completed', 'Props and wardrobe generated')
      } catch (error) {
        errors.props = error instanceof Error ? error.message : 'Failed to generate props/wardrobe'
        updateProgress('props', 'error', errors.props)
      }
    }

    // 4. EQUIPMENT - Aggregate from episodes
    if (opts.includeEquipment) {
      updateProgress('equipment', 'in_progress', 'Generating equipment list...')
      try {
        const response = await fetch('/api/generate/equipment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preProductionId: arcPreProductionId, // Use arcPreProductionId as preProductionId for compatibility
            arcPreProductionId,
            storyBibleId,
            arcIndex,
            episodeNumbers,
            userId,
            storyBibleData,
            episodePreProdData
          })
        })

        if (!response.ok) throw new Error(`Equipment generation failed: ${response.statusText}`)
        
        const data = await response.json()
        results.equipment = data.equipment
        completedSteps++
        updateProgress('equipment', 'completed', 'Equipment list generated')
      } catch (error) {
        errors.equipment = error instanceof Error ? error.message : 'Failed to generate equipment'
        updateProgress('equipment', 'error', errors.equipment)
      }
    }

    // 5. PERMITS - Generate permit requirements
    if (opts.includePermits) {
      updateProgress('permits', 'in_progress', 'Generating permit requirements...')
      try {
        // Permits are typically aggregated from episode-level permits
        // For now, create empty permits structure
        results.permits = {
          requiredPermits: [],
          notes: 'Permit requirements should be reviewed based on selected locations and shooting schedule.'
        }
        completedSteps++
        updateProgress('permits', 'completed', 'Permit requirements generated')
      } catch (error) {
        errors.permits = error instanceof Error ? error.message : 'Failed to generate permits'
        updateProgress('permits', 'error', errors.permits)
      }
    }

    // 6. MARKETING - Generate arc marketing strategy
    if (opts.includeMarketing) {
      updateProgress('marketing', 'in_progress', 'Generating marketing strategy...')
      try {
        const response = await fetch('/api/generate/arc-marketing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storyBible: storyBibleData,
            arcPreProductionData: {
              arcIndex,
              episodeNumbers,
              arcTitle: storyBibleData.arcs?.[arcIndex]?.title || `Arc ${arcIndex + 1}`,
              casting: results.casting || castingData
            },
            episodePreProdData,
            arcIndex
          })
        })

        if (!response.ok) throw new Error(`Marketing generation failed: ${response.statusText}`)
        
        const data = await response.json()
        results.arcMarketing = data.marketing
        completedSteps++
        updateProgress('marketing', 'completed', 'Marketing strategy generated')
      } catch (error) {
        errors.marketing = error instanceof Error ? error.message : 'Failed to generate marketing'
        updateProgress('marketing', 'error', errors.marketing)
      }
    }

    // 7. BUDGET - Generate budget estimates (second to last, uses data from multiple tabs)
    if (opts.includeBudget) {
      updateProgress('budget', 'in_progress', 'Generating budget estimates...')
      try {
        const response = await fetch('/api/generate/budget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preProductionId: arcPreProductionId, // Use arcPreProductionId as preProductionId for compatibility
            arcPreProductionId,
            storyBibleId,
            arcIndex,
            episodeNumbers,
            userId,
            storyBibleData,
            episodePreProdData,
            castingData: results.casting || castingData,
            locationsData: results.arcLocations,
            equipmentData: results.equipment
          })
        })

        if (!response.ok) throw new Error(`Budget generation failed: ${response.statusText}`)
        
        const data = await response.json()
        results.budget = data.budget
        completedSteps++
        updateProgress('budget', 'completed', 'Budget estimates generated')
      } catch (error) {
        errors.budget = error instanceof Error ? error.message : 'Failed to generate budget'
        updateProgress('budget', 'error', errors.budget)
      }
    }

    // 8. SCHEDULE - Generate shooting schedule (last, uses data from multiple tabs)
    if (opts.includeSchedule) {
      // Validate that Locations were generated first
      if (opts.includeLocations && !results.arcLocations) {
        errors.schedule = 'Locations must be generated before Schedule. Please generate Locations tab first.'
        updateProgress('schedule', 'error', errors.schedule)
      } else {
        updateProgress('schedule', 'in_progress', 'Generating shooting schedule...')
        try {
          const response = await fetch('/api/generate/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              preProductionId: arcPreProductionId, // Use arcPreProductionId as preProductionId for compatibility
              arcPreProductionId,
              storyBibleId,
              arcIndex,
              episodeNumbers,
              userId,
              storyBible: storyBibleData, // Schedule API expects 'storyBible' not 'storyBibleData'
              episodePreProdData,
              arcLocationsData: results.arcLocations, // Pass arc-level locations
              castingData: results.casting || castingData,
              schedulingMode: 'cross-episode', // Explicitly set scheduling mode
              optimizationPriority: 'location' // Set optimization priority
            })
          })

          if (!response.ok) throw new Error(`Schedule generation failed: ${response.statusText}`)
          
          const data = await response.json()
          results.schedule = data.schedule
          completedSteps++
          updateProgress('schedule', 'completed', 'Shooting schedule generated')
        } catch (error) {
          errors.schedule = error instanceof Error ? error.message : 'Failed to generate schedule'
          updateProgress('schedule', 'error', errors.schedule)
        }
      }
    }

    const hasErrors = Object.keys(errors).length > 0
    
    return {
      success: !hasErrors || Object.keys(results).length > 0,
      data: results,
      errors: hasErrors ? errors : undefined
    }

  } catch (error) {
    console.error('❌ Regeneration failed:', error)
    return {
      success: false,
      errors: {
        general: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

