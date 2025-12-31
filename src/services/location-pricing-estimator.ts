/**
 * Location Pricing Estimator Service
 *
 * Provides realistic price estimates for location suggestions when AI returns $0 or missing prices.
 * Estimates are based on sourcing type (Airbnb, Peerspace, etc.) and venue characteristics.
 */

import type { ShootingLocationSuggestion } from '@/types/preproduction'

/**
 * Base pricing rates by sourcing type (daily rates in USD)
 */
const BASE_RATES_BY_SOURCING = {
  'airbnb': 200,      // $100-300/day
  'peerspace': 275,   // $150-400/day
  'giggster': 350,    // $200-500/day
  'public-space': 0,  // Free
  'specific-venue': 550, // $300-800/day
  'rental': 425,      // $250-600/day
  'other': 275        // $150-400/day (default)
} as const

/**
 * Venue type adjustment multipliers
 */
const VENUE_TYPE_ADJUSTMENTS = {
  residential: 0.8,   // -20% for residential/loft/apartment
  commercial: 1.1,    // +10% for commercial/office
  industrial: 1.3,    // +30% for industrial/warehouse
  public: 0           // Free for public spaces
} as const

/**
 * Estimates a realistic daily rate for a location suggestion
 * @param suggestion - The location suggestion to estimate pricing for
 * @returns Object with estimated dayRate and isEstimated flag
 */
export function estimateLocationPricing(suggestion: ShootingLocationSuggestion): { dayRate: number; isEstimated: boolean } {
  // Get base rate by sourcing type
  let baseRate = BASE_RATES_BY_SOURCING[suggestion.sourcing] || BASE_RATES_BY_SOURCING.other

  // Apply venue type adjustments
  const venueType = suggestion.venueType.toLowerCase()

  if (venueType.includes('residential') || venueType.includes('loft') || venueType.includes('apartment')) {
    baseRate = Math.round(baseRate * VENUE_TYPE_ADJUSTMENTS.residential)
  } else if (venueType.includes('commercial') || venueType.includes('office')) {
    baseRate = Math.round(baseRate * VENUE_TYPE_ADJUSTMENTS.commercial)
  } else if (venueType.includes('industrial') || venueType.includes('warehouse')) {
    baseRate = Math.round(baseRate * VENUE_TYPE_ADJUSTMENTS.industrial)
  } else if (venueType.includes('public') || venueType.includes('park') || venueType.includes('library') || venueType.includes('street')) {
    baseRate = VENUE_TYPE_ADJUSTMENTS.public
  }

  return {
    dayRate: baseRate,
    isEstimated: true
  }
}

/**
 * Checks if a suggestion needs price estimation
 * @param suggestion - The location suggestion to check
 * @returns True if the suggestion should be estimated
 */
export function needsPriceEstimation(suggestion: ShootingLocationSuggestion): boolean {
  const dayRate = suggestion.costBreakdown?.dayRate ?? suggestion.estimatedCost ?? 0
  const isFreePublicSpace = suggestion.sourcing === 'public-space'

  // Need estimation if:
  // - Day rate is 0 and it's not a public space
  // - Or if the suggestion doesn't have any pricing data at all
  return (dayRate === 0 && !isFreePublicSpace) || (!suggestion.costBreakdown && !suggestion.estimatedCost)
}

/**
 * Applies price estimation to a suggestion if needed
 * @param suggestion - The location suggestion to potentially update
 * @returns Updated suggestion with estimated pricing if applicable
 */
export function applyPriceEstimationIfNeeded(suggestion: ShootingLocationSuggestion): ShootingLocationSuggestion {
  if (!needsPriceEstimation(suggestion)) {
    return suggestion
  }

  const { dayRate, isEstimated } = estimateLocationPricing(suggestion)

  // Create updated suggestion with estimated pricing
  const updatedSuggestion: ShootingLocationSuggestion & { isEstimated?: boolean } = {
    ...suggestion,
    estimatedCost: dayRate, // Update legacy field for backward compatibility
    costBreakdown: {
      ...suggestion.costBreakdown,
      dayRate: dayRate
    },
    isEstimated
  }

  return updatedSuggestion
}







