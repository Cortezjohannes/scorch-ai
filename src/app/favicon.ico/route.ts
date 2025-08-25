import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    // Try to read favicon from public directory first
    const publicFaviconPath = join(process.cwd(), 'public', 'favicon.ico')
    const faviconBuffer = await readFile(publicFaviconPath)
    
    return new NextResponse(faviconBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.warn('Favicon not found in public directory, returning 404')
    return new NextResponse('Favicon not found', { status: 404 })
  }
}


