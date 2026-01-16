/**
 * Location URL Resolver Service
 * 
 * Resolves working URLs for location recommendations by:
 * - Generating Google Maps links for addresses
 * - Creating search URLs for booking platforms (Airbnb, Agoda, Booking.com, etc.)
 * - Using venue websites when available
 * - Providing fallback strategies
 */

import type { Location, ShootingLocationSuggestion } from '@/types/preproduction'

export interface ResolvedLocationUrl {
  primaryUrl: string
  googleMapsUrl?: string
  bookingUrl?: string
  venueUrl?: string
  platform: 'google-maps' | 'airbnb' | 'agoda' | 'booking-com' | 'expedia' | 'venue-website' | 'other'
  listingId?: string
}

/**
 * Generate Google Maps URL for any address
 * Works without API key - uses public search URLs
 */
export function generateGoogleMapsUrl(
  address: string,
  venueName?: string
): string {
  const query = venueName && address 
    ? `${encodeURIComponent(venueName)}, ${encodeURIComponent(address)}`
    : encodeURIComponent(address)
  
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

/**
 * Generate Airbnb search URL
 * Uses Airbnb's public search format - no API needed
 */
export function generateAirbnbSearchUrl(
  query: string,
  location: string
): string {
  // Clean and format location for Airbnb search
  const cleanLocation = location
    .replace(/,/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
  
  const searchQuery = encodeURIComponent(query.toLowerCase())
  const locationParam = encodeURIComponent(cleanLocation)
  
  // Airbnb search URL format
  return `https://www.airbnb.com/s/${locationParam}/homes?query=${searchQuery}&refinement_paths[]=%2Fhomes`
}

/**
 * Generate Agoda search URL
 */
export function generateAgodaSearchUrl(
  query: string,
  location: string
): string {
  const searchQuery = encodeURIComponent(`${query} ${location}`)
  return `https://www.agoda.com/search?city=${encodeURIComponent(location)}&q=${searchQuery}`
}

/**
 * Generate Booking.com search URL
 */
export function generateBookingSearchUrl(
  query: string,
  location: string
): string {
  const searchQuery = encodeURIComponent(`${query} ${location}`)
  return `https://www.booking.com/search.html?ss=${searchQuery}`
}

/**
 * Generate Expedia search URL
 */
export function generateExpediaSearchUrl(
  query: string,
  location: string
): string {
  const searchQuery = encodeURIComponent(`${query} ${location}`)
  return `https://www.expedia.com/Hotel-Search?destination=${searchQuery}`
}

/**
 * Extract location components from address string
 */
function parseAddress(address: string): {
  city?: string
  state?: string
  country?: string
  fullAddress: string
} {
  const parts = address.split(',').map(p => p.trim())
  
  if (parts.length >= 3) {
    return {
      city: parts[0],
      state: parts[1],
      country: parts[2],
      fullAddress: address
    }
  } else if (parts.length === 2) {
    return {
      city: parts[0],
      state: parts[1],
      fullAddress: address
    }
  }
  
  return { fullAddress: address }
}

/**
 * Resolve URL for a location based on its sourcing type
 */
export async function resolveLocationUrl(
  location: Location | ShootingLocationSuggestion
): Promise<ResolvedLocationUrl | null> {
  // If specificVenueUrl is provided, use it (highest priority)
  if ('specificVenueUrl' in location && location.specificVenueUrl) {
    return {
      primaryUrl: location.specificVenueUrl,
      venueUrl: location.specificVenueUrl,
      platform: 'venue-website'
    }
  }

  // If sourcingUrl already exists and is valid, use it
  if ('sourcingUrl' in location && location.sourcingUrl) {
    const url = location.sourcingUrl
    // Check if it's a generic homepage (we want to replace these)
    if (url === 'https://airbnb.com' || 
        url === 'https://www.airbnb.com' ||
        url === 'https://peerspace.com' ||
        url === 'https://www.peerspace.com' ||
        url === 'https://giggster.com' ||
        url === 'https://www.giggster.com') {
      // Fall through to generate proper URL
    } else if (url.startsWith('http')) {
      // Valid URL, determine platform
      let platform: ResolvedLocationUrl['platform'] = 'other'
      if (url.includes('airbnb.com')) platform = 'airbnb'
      else if (url.includes('agoda.com')) platform = 'agoda'
      else if (url.includes('booking.com')) platform = 'booking-com'
      else if (url.includes('expedia.com')) platform = 'expedia'
      else if (url.includes('google.com/maps')) platform = 'google-maps'
      
      return {
        primaryUrl: url,
        platform,
        listingId: 'listingId' in location ? location.listingId : undefined
      }
    }
  }

  const address = 'address' in location ? location.address : ''
  const venueName = 'venueName' in location ? location.venueName : ('name' in location ? location.name : undefined)
  const sourcing = location.sourcing || 'other'

  // Always generate Google Maps URL as fallback
  const googleMapsUrl = address ? generateGoogleMapsUrl(address, venueName) : undefined

  // Generate platform-specific URLs based on sourcing type
  let primaryUrl: string | undefined
  let bookingUrl: string | undefined
  let platform: ResolvedLocationUrl['platform'] = 'google-maps'

  if (!address) {
    // No address - can only return Google Maps if we have venue name
    if (venueName) {
      return {
        primaryUrl: generateGoogleMapsUrl(venueName),
        googleMapsUrl: generateGoogleMapsUrl(venueName),
        platform: 'google-maps'
      }
    }
    return null
  }

  const addressParts = parseAddress(address)
  const searchQuery = venueName || addressParts.city || address

  switch (sourcing) {
    case 'airbnb':
      bookingUrl = generateAirbnbSearchUrl(searchQuery, address)
      primaryUrl = bookingUrl
      platform = 'airbnb'
      break

    case 'agoda':
      bookingUrl = generateAgodaSearchUrl(searchQuery, address)
      primaryUrl = bookingUrl
      platform = 'agoda'
      break

    case 'booking-com':
    case 'other': // Try booking.com as fallback for 'other'
      bookingUrl = generateBookingSearchUrl(searchQuery, address)
      primaryUrl = bookingUrl
      platform = 'booking-com'
      break

    case 'expedia':
      bookingUrl = generateExpediaSearchUrl(searchQuery, address)
      primaryUrl = bookingUrl
      platform = 'expedia'
      break

    case 'public-space':
    case 'specific-venue':
    case 'venue-website':
      // For public spaces and specific venues, prioritize Google Maps
      primaryUrl = googleMapsUrl || generateGoogleMapsUrl(address)
      platform = 'google-maps'
      break

    case 'peerspace':
    case 'giggster':
      // These platforms are harder to scrape, use Google Maps as primary
      // But still try to generate a search URL if possible
      primaryUrl = googleMapsUrl || generateGoogleMapsUrl(address)
      platform = 'google-maps'
      break

    default:
      // Default to Google Maps
      primaryUrl = googleMapsUrl || generateGoogleMapsUrl(address)
      platform = 'google-maps'
  }

  // Ensure we always have a primary URL
  if (!primaryUrl && googleMapsUrl) {
    primaryUrl = googleMapsUrl
  }

  if (!primaryUrl) {
    return null
  }

  return {
    primaryUrl,
    googleMapsUrl: googleMapsUrl || (platform !== 'google-maps' ? generateGoogleMapsUrl(address, venueName) : undefined),
    bookingUrl,
    platform
  }
}

/**
 * Resolve URL synchronously (for cases where async isn't needed)
 * This is a simpler version that just generates URLs without external calls
 */
export function resolveLocationUrlSync(
  location: Location | ShootingLocationSuggestion
): ResolvedLocationUrl | null {
  // If specificVenueUrl is provided, use it
  if ('specificVenueUrl' in location && location.specificVenueUrl) {
    return {
      primaryUrl: location.specificVenueUrl,
      venueUrl: location.specificVenueUrl,
      platform: 'venue-website'
    }
  }

  const address = 'address' in location ? location.address : ''
  const venueName = 'venueName' in location ? location.venueName : ('name' in location ? location.name : undefined)
  const sourcing = location.sourcing || 'other'

  if (!address && !venueName) {
    return null
  }

  const googleMapsUrl = generateGoogleMapsUrl(address || venueName || '', venueName)

  // Generate platform-specific URLs
  let primaryUrl = googleMapsUrl
  let bookingUrl: string | undefined
  let platform: ResolvedLocationUrl['platform'] = 'google-maps'

  if (address) {
    const addressParts = parseAddress(address)
    const searchQuery = venueName || addressParts.city || address

    switch (sourcing) {
      case 'airbnb':
        bookingUrl = generateAirbnbSearchUrl(searchQuery, address)
        primaryUrl = bookingUrl
        platform = 'airbnb'
        break

      case 'agoda':
        bookingUrl = generateAgodaSearchUrl(searchQuery, address)
        primaryUrl = bookingUrl
        platform = 'agoda'
        break

      case 'booking-com':
        bookingUrl = generateBookingSearchUrl(searchQuery, address)
        primaryUrl = bookingUrl
        platform = 'booking-com'
        break

      case 'expedia':
        bookingUrl = generateExpediaSearchUrl(searchQuery, address)
        primaryUrl = bookingUrl
        platform = 'expedia'
        break
    }
  }

  return {
    primaryUrl,
    googleMapsUrl: platform !== 'google-maps' ? googleMapsUrl : undefined,
    bookingUrl,
    platform
  }
}




