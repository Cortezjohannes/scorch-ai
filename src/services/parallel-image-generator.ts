/**
 * Parallel Image Generation Utility
 * 
 * Optimizes image generation by processing images in parallel batches:
 * - First 3 images: Sequential (warm-up)
 * - Remaining images: Batches of up to 12 parallel
 * - Rate limiting: Tracks requests to respect 20 RPM limit
 */

export interface ParallelTask<T> {
  id: string
  execute: () => Promise<T>
  onComplete?: (result: T) => void
  onError?: (error: Error) => void
}

export interface ParallelGenerationOptions {
  onProgress?: (completed: number, total: number, currentId?: string) => void
  onTaskComplete?: (id: string, success: boolean, error?: string) => void
  rateLimitRPM?: number // Default: 20
  sequentialCount?: number // Default: 3
  batchSize?: number // Default: 12
}

export interface ParallelGenerationResult<T> {
  results: Array<{ id: string; result?: T; error?: string; success: boolean }>
  success: number
  failed: number
  totalDuration: number
}

/**
 * Rate limit tracker to ensure we don't exceed RPM limits
 */
class RateLimitTracker {
  private requestTimestamps: number[] = []
  private readonly rpm: number
  private readonly minDelayMs: number

  constructor(rpm: number = 20) {
    this.rpm = rpm
    // Minimum delay between requests: 60 seconds / RPM
    this.minDelayMs = (60 * 1000) / rpm
  }

  /**
   * Record a request timestamp
   */
  recordRequest(): void {
    const now = Date.now()
    this.requestTimestamps.push(now)
    
    // Keep only last 20 requests (sliding window)
    const oneMinuteAgo = now - 60000
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneMinuteAgo)
  }

  /**
   * Get delay needed before next request to respect rate limit
   */
  getRequiredDelay(): number {
    if (this.requestTimestamps.length < this.rpm) {
      return 0 // We're under the limit
    }

    // We have RPM requests in the last minute
    // Find the oldest request in the window
    const oldestRequest = Math.min(...this.requestTimestamps)
    const timeSinceOldest = Date.now() - oldestRequest
    
    // If oldest request was less than 1 minute ago, we need to wait
    if (timeSinceOldest < 60000) {
      const waitTime = 60000 - timeSinceOldest
      return Math.max(waitTime, this.minDelayMs)
    }

    return 0
  }

  /**
   * Wait if necessary to respect rate limit
   */
  async waitIfNeeded(): Promise<void> {
    const delay = this.getRequiredDelay()
    if (delay > 0) {
      console.log(`⏳ [Parallel Generator] Rate limit: waiting ${Math.round(delay)}ms before next batch`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  /**
   * Get current request count in the last minute
   */
  getCurrentCount(): number {
    const oneMinuteAgo = Date.now() - 60000
    return this.requestTimestamps.filter(ts => ts > oneMinuteAgo).length
  }
}

/**
 * Generate multiple images in parallel with intelligent batching
 * 
 * Strategy:
 * 1. First N images (default 3): Generate sequentially (warm-up)
 * 2. Remaining images: Process in batches of up to M (default 12) parallel
 * 3. Rate limiting: Track requests and add delays if approaching limit
 * 
 * @param tasks - Array of tasks to execute
 * @param options - Generation options
 * @returns Results with success/failure counts
 */
export async function generateImagesInParallel<T>(
  tasks: ParallelTask<T>[],
  options: ParallelGenerationOptions = {}
): Promise<ParallelGenerationResult<T>> {
  const startTime = Date.now()
  const {
    onProgress,
    onTaskComplete,
    rateLimitRPM = 20,
    sequentialCount = 3,
    batchSize = 12
  } = options

  const rateLimitTracker = new RateLimitTracker(rateLimitRPM)
  const results: Array<{ id: string; result?: T; error?: string; success: boolean }> = []
  let success = 0
  let failed = 0

  console.log(`🚀 [Parallel Generator] Starting parallel generation: ${tasks.length} tasks`, {
    sequentialCount,
    batchSize,
    rateLimitRPM,
    totalTasks: tasks.length
  })

  if (tasks.length === 0) {
    return {
      results: [],
      success: 0,
      failed: 0,
      totalDuration: Date.now() - startTime
    }
  }

  // Step 1: Process first N tasks sequentially (warm-up)
  const sequentialTasks = tasks.slice(0, Math.min(sequentialCount, tasks.length))
  const remainingTasks = tasks.slice(sequentialCount)

  console.log(`📝 [Parallel Generator] Phase 1: Processing ${sequentialTasks.length} tasks sequentially (warm-up)`)

  for (let i = 0; i < sequentialTasks.length; i++) {
    const task = sequentialTasks[i]
    
    try {
      // Check rate limit before each sequential task
      await rateLimitTracker.waitIfNeeded()
      rateLimitTracker.recordRequest()

      const taskStartTime = Date.now()
      const result = await task.execute()
      const taskDuration = Date.now() - taskStartTime

      results.push({ id: task.id, result, success: true })
      success++

      console.log(`✅ [Parallel Generator] Sequential task ${i + 1}/${sequentialTasks.length} completed: ${task.id} (${taskDuration}ms)`)

      if (task.onComplete) {
        task.onComplete(result)
      }
      if (onTaskComplete) {
        onTaskComplete(task.id, true)
      }
      if (onProgress) {
        onProgress(success + failed, tasks.length, task.id)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error'
      results.push({ id: task.id, error: errorMessage, success: false })
      failed++

      console.error(`❌ [Parallel Generator] Sequential task ${i + 1}/${sequentialTasks.length} failed: ${task.id}`, errorMessage)

      if (task.onError) {
        task.onError(error instanceof Error ? error : new Error(errorMessage))
      }
      if (onTaskComplete) {
        onTaskComplete(task.id, false, errorMessage)
      }
      if (onProgress) {
        onProgress(success + failed, tasks.length, task.id)
      }
    }
  }

  // Step 2: Process remaining tasks in parallel batches
  if (remainingTasks.length > 0) {
    console.log(`⚡ [Parallel Generator] Phase 2: Processing ${remainingTasks.length} tasks in parallel batches of up to ${batchSize}`)

    // Split remaining tasks into batches
    for (let batchStart = 0; batchStart < remainingTasks.length; batchStart += batchSize) {
      const batch = remainingTasks.slice(batchStart, batchStart + batchSize)
      const batchNumber = Math.floor(batchStart / batchSize) + 1
      const totalBatches = Math.ceil(remainingTasks.length / batchSize)

      console.log(`📦 [Parallel Generator] Processing batch ${batchNumber}/${totalBatches}: ${batch.length} tasks in parallel`)

      // Check rate limit before batch
      await rateLimitTracker.waitIfNeeded()

      // Execute all tasks in batch in parallel
      const batchPromises = batch.map(async (task) => {
        try {
          rateLimitTracker.recordRequest()
          const taskStartTime = Date.now()
          const result = await task.execute()
          const taskDuration = Date.now() - taskStartTime

          console.log(`✅ [Parallel Generator] Batch task completed: ${task.id} (${taskDuration}ms)`)

          if (task.onComplete) {
            task.onComplete(result)
          }
          if (onTaskComplete) {
            onTaskComplete(task.id, true)
          }

          return { id: task.id, result, success: true as const, error: undefined }
        } catch (error: any) {
          const errorMessage = error.message || 'Unknown error'
          console.error(`❌ [Parallel Generator] Batch task failed: ${task.id}`, errorMessage)

          if (task.onError) {
            task.onError(error instanceof Error ? error : new Error(errorMessage))
          }
          if (onTaskComplete) {
            onTaskComplete(task.id, false, errorMessage)
          }

          return { id: task.id, result: undefined, success: false as const, error: errorMessage }
        }
      })

      // Wait for all tasks in batch to complete
      const batchResults = await Promise.all(batchPromises)

      // Process batch results
      for (const batchResult of batchResults) {
        results.push(batchResult)
        if (batchResult.success) {
          success++
        } else {
          failed++
        }

        if (onProgress) {
          onProgress(success + failed, tasks.length, batchResult.id)
        }
      }

      console.log(`✅ [Parallel Generator] Batch ${batchNumber}/${totalBatches} completed: ${batchResults.filter(r => r.success).length}/${batch.length} succeeded`)

      // Small delay between batches to avoid overwhelming the system
      // (Rate limiting is handled separately, this is just a small buffer)
      if (batchStart + batchSize < remainingTasks.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }

  const totalDuration = Date.now() - startTime
  console.log(`✅ [Parallel Generator] Parallel generation completed: ${success} succeeded, ${failed} failed (${totalDuration}ms)`)

  return {
    results,
    success,
    failed,
    totalDuration
  }
}




















