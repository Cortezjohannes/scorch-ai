export interface EditingInstructions {
  sceneNumber: number
  cuts: Array<{
    time: number
    type: 'cut' | 'fade' | 'dissolve' | 'wipe'
    reason: string
  }>
  pacing: {
    overall: 'fast' | 'medium' | 'slow'
    notes: string[]
  }
  transitions: Array<{
    fromShot: number
    toShot: number
    type: string
    duration: number
  }>
  colorGrading: {
    suggested: string
    notes: string[]
  }
  audio: {
    musicCues: Array<{
      time: number
      type: string
      volume: number
    }>
    soundEffects: Array<{
      time: number
      effect: string
    }>
  }
}






