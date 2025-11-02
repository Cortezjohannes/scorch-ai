import { NextResponse } from 'next/server'

// In-memory storage for pre-production progress
let preProductionProgress = {
  currentStep: 0,
  currentStepName: 'Initializing',
  currentStepProgress: 0,
  overallProgress: 0,
  currentDetail: 'Starting pre-production...',
  isComplete: false,
  startTime: null as number | null,
  logs: [] as string[]
}

let isPreProductionActive = false

export async function GET() {
  return NextResponse.json({
    logs: preProductionProgress.logs,
    isActive: isPreProductionActive,
    startTime: preProductionProgress.startTime,
    progress: preProductionProgress
  })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (data.action === 'start') {
      preProductionProgress = {
        currentStep: 0,
        currentStepName: 'Initializing',
        currentStepProgress: 0,
        overallProgress: 0,
        currentDetail: 'Starting pre-production...',
        isComplete: false,
        startTime: Date.now(),
        logs: []
      }
      isPreProductionActive = true
      console.log('🎬 PRE-PRODUCTION V2 - Log tracking started')
    } else if (data.action === 'stop') {
      isPreProductionActive = false
      console.log('🎬 PRE-PRODUCTION V2 - Log tracking stopped')
    } else if (data.action === 'update') {
      // Update progress from V2 generation API
      preProductionProgress = {
        ...preProductionProgress,
        ...data.progress
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}