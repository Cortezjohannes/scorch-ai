import { z } from 'zod'

const toNumber = (val: any, fallback = 0) => {
  if (typeof val === 'number' && Number.isFinite(val)) return val
  const parsed = parseFloat(val)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toBoolean = (val: any, fallback = false) => {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') {
    const v = val.toLowerCase().trim()
    if (['true', 'yes', 'y', '1'].includes(v)) return true
    if (['false', 'no', 'n', '0'].includes(v)) return false
  }
  return fallback
}

const normalizeSourcing = (val: any): { sourcing: string; searchGuidance?: string } => {
  if (!val || typeof val !== 'string') return { sourcing: 'other' }
  const v = val.toLowerCase()
  if (v.includes('airbnb')) return { sourcing: 'airbnb' }
  if (v.includes('peerspace')) return { sourcing: 'peerspace', searchGuidance: val }
  if (v.includes('giggster')) return { sourcing: 'giggster', searchGuidance: val }
  if (v.includes('public')) return { sourcing: 'public-space' }
  if (v.includes('rental')) return { sourcing: 'rental' }
  if (v.includes('venue')) return { sourcing: 'specific-venue' }
  return { sourcing: 'other', searchGuidance: val }
}

// Convert string to array (handles AI returning a single string instead of array)
const toStringArray = (val: any): string[] => {
  if (Array.isArray(val)) return val.map(v => String(v).trim()).filter(Boolean)
  if (typeof val === 'string' && val.trim()) return [val.trim()]
  return []
}

export const LogisticsSchema = z.object({
  parking: z.preprocess((v) => toBoolean(v, true), z.boolean()),
  power: z.preprocess((v) => toBoolean(v, true), z.boolean()),
  restrooms: z.preprocess((v) => toBoolean(v, true), z.boolean()),
  permitRequired: z.preprocess((v) => toBoolean(v, false), z.boolean()),
  permitCost: z.preprocess((v) => toNumber(v, 0), z.number().nonnegative().optional()),
  notes: z.string().optional().default('')
})

export const CostBreakdownSchema = z.object({
  dayRate: z.preprocess((v) => toNumber(v, 0), z.number().nonnegative().default(0)),
  permitCost: z.preprocess((v) => toNumber(v, 0), z.number().nonnegative().optional()),
  insuranceRequired: z.preprocess((v) => toBoolean(v, false), z.boolean().optional().default(false)),
  depositAmount: z.preprocess((v) => toNumber(v, 0), z.number().nonnegative().optional()),
  notes: z.string().optional()
})

const RawSourcing = z.string().optional()

export const ShootingLocationSuggestionSchema = z
  .object({
    id: z.string().optional(),
    venueName: z.string().min(1),
    venueType: z.string().min(1),
    address: z.string().min(1),
    estimatedCost: z.preprocess((v) => toNumber(v, 0), z.number().nonnegative().default(0)),
    permitCost: z.preprocess((v) => toNumber(v, 0), z.number().nonnegative().optional()),
    insuranceRequired: z.preprocess((v) => toBoolean(v, false), z.boolean().optional().default(false)),
    depositAmount: z.preprocess((v) => toNumber(v, 0), z.number().nonnegative().optional()),
    pros: z.preprocess((v) => toStringArray(v), z.array(z.string()).default([])),
    cons: z.preprocess((v) => toStringArray(v), z.array(z.string()).default([])),
    logistics: LogisticsSchema,
    // Accept any string, normalize later
    sourcing: RawSourcing,
    searchGuidance: z.string().optional(),
    specificVenueUrl: z.string().url().optional(),
    isPreferred: z.preprocess((v) => toBoolean(v, false), z.boolean().optional().default(false)),
    costBreakdown: CostBreakdownSchema.optional()
  })
  .transform((value) => {
    const { sourcing, searchGuidance } = normalizeSourcing(value.sourcing)
    const costBreakdown = value.costBreakdown || {
      dayRate: value.estimatedCost,
      permitCost: value.permitCost,
      insuranceRequired: value.insuranceRequired,
      depositAmount: value.depositAmount
    }

    return {
      ...value,
      id: value.id || `suggestion_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      sourcing: sourcing as
        | 'airbnb'
        | 'peerspace'
        | 'giggster'
        | 'public-space'
        | 'rental'
        | 'specific-venue'
        | 'other',
      searchGuidance: searchGuidance || value.searchGuidance,
      costBreakdown: {
        ...costBreakdown,
        dayRate: toNumber(costBreakdown.dayRate, value.estimatedCost),
        permitCost: toNumber(costBreakdown.permitCost, value.permitCost),
        depositAmount: toNumber(costBreakdown.depositAmount, value.depositAmount),
        insuranceRequired: toBoolean(costBreakdown.insuranceRequired, value.insuranceRequired)
      }
    }
  })

export const LocationSuggestionsResponseSchema = z.object({
  suggestions: z.array(ShootingLocationSuggestionSchema).min(1).max(3)
})

export type LocationSuggestionsResponse = z.infer<typeof LocationSuggestionsResponseSchema>

