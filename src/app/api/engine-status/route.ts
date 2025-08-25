import { NextResponse } from 'next/server'

// In-memory storage for engine status (in production, use Redis or database)
let currentSession: any = null
let engineProgress: any = {
  engines: [],
  currentEngine: 0,
  overallProgress: 0
}

export async function GET() {
  return NextResponse.json({
    session: currentSession,
    progress: engineProgress
  })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (data.type === 'update_session') {
      currentSession = data.session
      if (currentSession.isComplete) {
        console.log('🎉 Story Bible Generation Complete!')
        // Mark all engines as completed if session is complete
        if (engineProgress.engines.length > 0) {
          engineProgress.engines.forEach((engine: any) => {
            engine.status = 'completed'
            engine.progress = 100
          })
          engineProgress.overallProgress = 100
        }
      }
    } else if (data.type === 'update_progress') {
      engineProgress = data.progress
    } else if (data.type === 'update_engine') {
      // Update individual engine progress (+ message passthrough)
      const { engineId, progress, status, message, name } = data
      const engineIndex = engineProgress.engines.findIndex((e: any) => e.engineId === engineId)
      
      const base = { engineId, progress, status }
      const extras: any = {}
      if (typeof message === 'string') extras.message = message
      if (typeof name === 'string') extras.name = name
      
      if (engineIndex >= 0) {
        engineProgress.engines[engineIndex] = { ...engineProgress.engines[engineIndex], ...base, ...extras }
      } else {
        engineProgress.engines.push({ ...base, ...extras })
      }
      
      // Calculate overall progress
      if (engineProgress.engines.length > 0) {
        const totalProgress = engineProgress.engines.reduce((sum: number, e: any) => sum + (e.progress || 0), 0)
        engineProgress.overallProgress = Math.round(totalProgress / engineProgress.engines.length)
      }
    } else if (data.type === 'set_current_engine') {
      engineProgress.currentEngine = data.engineIndex
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}