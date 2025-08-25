import { generateContent } from './azure-openai';
import { CinematographyEngineV2, type CinematographyEngineRecommendation } from './cinematography-engine-v2';

// ===== INTERFACES =====

export interface CinematographyExecutionBlueprint {
  executionId: string;
  sceneId: string;
  shotList: CinematographyShot[];
  lightingPlan: LightingExecutionPlan;
  cameraOperations: CameraOperationGuide[];
  performanceDirection: PerformanceDirectionGuide[];
  technicalSpecs: TechnicalExecutionSpecs;
  safetyProtocols: SafetyProtocol[];
  realTimeAdjustments: RealTimeAdjustmentCapability[];
  qualityMetrics: ExecutionQualityMetrics;
  continuityTracking: ContinuityTracker;
  emergencyProcedures: EmergencyProcedure[];
}

export interface CinematographyShot {
  shotId: string;
  shotNumber: string;
  shotType: ShotType;
  cameraPosition: CameraPosition;
  lensSelection: LensSpecification;
  focusGuide: FocusGuide;
  exposureSettings: ExposureSettings;
  colorTemperature: ColorTemperatureGuide;
  framingGuide: FramingGuide;
  movementInstructions: CameraMovementInstructions;
  timingCues: TimingCue[];
  actorDirections: ActorDirection[];
  lightingCues: LightingCue[];
  audioSync: AudioSyncGuide;
  continuityNotes: ContinuityNote[];
  safetyConsiderations: SafetyConsideration[];
  backupOptions: BackupShotOption[];
}

export interface RealTimeShotExecution {
  shotId: string;
  executionStatus: ExecutionStatus;
  liveAdjustments: LiveAdjustment[];
  performanceNotes: PerformanceNote[];
  technicalIssues: TechnicalIssue[];
  qualityAssessment: QualityAssessment;
  nextShotPreparation: NextShotPrep;
  crewCoordination: CrewCoordinationUpdate[];
  timingMetrics: TimingMetrics;
  resourceStatus: ResourceStatus;
  weatherImpact: WeatherImpact;
  emergencyStatus: EmergencyStatus;
}

export interface LightingExecutionPlan {
  setupId: string;
  lightingUnits: LightingUnit[];
  powerRequirements: PowerRequirement[];
  setupSequence: SetupSequence[];
  adjustmentProtocols: AdjustmentProtocol[];
  safetyMeasures: LightingSafetyMeasure[];
  backupLighting: BackupLightingOption[];
  environmentalConsiderations: EnvironmentalLightingFactor[];
  continuityLighting: ContinuityLightingGuide[];
  realTimeControls: LightingControl[];
  qualityChecks: LightingQualityCheck[];
  troubleshooting: LightingTroubleshooting[];
}

export interface CameraOperationGuide {
  operationId: string;
  operatorRole: OperatorRole;
  equipmentSetup: EquipmentSetup;
  operationalProcedures: OperationalProcedure[];
  movementChoreography: MovementChoreography;
  focusPulling: FocusPullingGuide;
  frameComposition: FrameCompositionGuide;
  exposureControl: ExposureControlGuide;
  stabilizationTechniques: StabilizationTechnique[];
  lensChangeProcedures: LensChangeProcedure[];
  maintenanceChecks: MaintenanceCheck[];
  troubleshooting: CameraTroubleshooting[];
}

export interface PerformanceDirectionGuide {
  directionId: string;
  actorId: string;
  characterName: string;
  sceneContext: SceneContext;
  emotionalDirection: EmotionalDirection;
  physicalDirection: PhysicalDirection;
  dialogueDelivery: DialogueDeliveryGuide;
  eyeLineGuide: EyeLineGuide;
  movementBlocking: MovementBlocking;
  energyLevelGuide: EnergyLevelGuide;
  continuityRequirements: PerformanceContinuityRequirement[];
  improvisationBoundaries: ImprovisationBoundary[];
  performanceMetrics: PerformanceMetrics;
  directorNotes: DirectorNote[];
}

// Supporting Interfaces
export interface ShotType {
  category: 'wide' | 'medium' | 'close-up' | 'extreme-close-up' | 'over-shoulder' | 'insert' | 'cutaway' | 'establishing';
  variant: string;
  purpose: string;
  emotionalImpact: string;
  narrativeFunction: string;
}

export interface CameraPosition {
  coordinates: { x: number; y: number; z: number };
  height: number;
  angle: number;
  orientation: string;
  stabilization: string;
  accessibility: string;
  safetyZone: string;
  powerAccess: string;
  cableManagement: string;
}

export interface LensSpecification {
  focalLength: number;
  aperture: string;
  manufacturer: string;
  model: string;
  characteristics: string[];
  optimalUsage: string;
  limitations: string[];
  maintenanceNotes: string[];
}

export interface FocusGuide {
  focusPoints: FocusPoint[];
  pullSequence: FocusPullSequence[];
  markings: FocusMarking[];
  backupFocus: BackupFocusStrategy;
  monitoring: FocusMonitoring;
  troubleshooting: FocusTroubleshooting;
}

export interface ExposureSettings {
  aperture: string;
  shutterSpeed: string;
  iso: number;
  nd_filters: string[];
  exposureCompensation: number;
  meteringMode: string;
  histogramGuidance: string;
  overexposureWarnings: string[];
}

export interface ColorTemperatureGuide {
  kelvinValue: number;
  colorGel: string;
  whiteBalanceSetup: string;
  colorChecker: string;
  ambientLightCompensation: string;
  colorContinuity: string;
  postProcessingNotes: string;
}

export interface FramingGuide {
  composition: CompositionRule[];
  subjectPlacement: SubjectPlacement;
  backgroundConsiderations: BackgroundConsideration[];
  foregroundElements: ForegroundElement[];
  depthOfField: DepthOfFieldGuide;
  aspectRatioConsiderations: AspectRatioConsideration[];
  safeFraming: SafeFramingGuide;
}

export interface CameraMovementInstructions {
  movementType: MovementType;
  startPosition: Position;
  endPosition: Position;
  speed: SpeedGuide;
  acceleration: AccelerationCurve;
  smoothness: SmoothnessGuide;
  operatorInstructions: OperatorInstruction[];
  safetyConsiderations: MovementSafetyConsideration[];
  rehearsalRequirements: RehearsalRequirement[];
}

export interface TimingCue {
  cueType: 'start' | 'mark' | 'adjust' | 'cut';
  triggerPoint: string;
  description: string;
  responsibleCrew: string[];
  backupSignal: string;
  contingency: string;
}

export interface ActorDirection {
  instruction: string;
  timing: string;
  priority: 'critical' | 'important' | 'guidance';
  deliveryMethod: 'verbal' | 'gesture' | 'demonstration';
  expectedResponse: string;
  adaptationOptions: string[];
}

export interface LightingCue {
  cueNumber: string;
  timing: string;
  lightingChange: LightingChange;
  operator: string;
  equipment: string[];
  safetyClearance: string;
  backupProcedure: string;
}

export interface AudioSyncGuide {
  syncMethod: string;
  timecodeTiming: string;
  clapperBoardUsage: string;
  audioLevels: AudioLevel[];
  ambientConsiderations: AmbientConsideration[];
  syncBackup: SyncBackupMethod[];
}

export interface ContinuityNote {
  category: 'wardrobe' | 'makeup' | 'props' | 'lighting' | 'performance';
  description: string;
  reference: string;
  responsibility: string;
  checkPoint: string;
  documentation: string;
}

export interface SafetyConsideration {
  hazardType: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigationMeasures: string[];
  responsibleParty: string;
  emergencyProcedure: string;
  equipmentRequired: string[];
}

export interface BackupShotOption {
  scenario: string;
  alternativeShot: AlternativeShot;
  timeRequirement: number;
  resourceRequirement: ResourceRequirement[];
  qualityImpact: string;
  implementationSteps: string[];
}

export interface ExecutionStatus {
  currentPhase: 'setup' | 'rehearsal' | 'recording' | 'review' | 'completed';
  progress: number;
  timeElapsed: number;
  estimatedCompletion: number;
  issues: Issue[];
  quality: QualityIndicator;
}

export interface LiveAdjustment {
  adjustmentType: string;
  reason: string;
  implementation: string;
  impact: string;
  approval: string;
  documentation: string;
}

export interface PerformanceNote {
  actorId: string;
  noteType: 'direction' | 'feedback' | 'adjustment' | 'praise';
  content: string;
  timing: string;
  deliveryMethod: string;
  followUp: string;
}

export interface TechnicalIssue {
  issueType: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  impact: string;
  resolution: string;
  timeline: number;
  responsibility: string;
}

export interface QualityAssessment {
  visualQuality: number;
  audioQuality: number;
  performanceQuality: number;
  technicalExecution: number;
  overallRating: number;
  improvements: string[];
  retakeRecommendation: boolean;
}

export interface NextShotPrep {
  shotId: string;
  preparationTasks: PreparationTask[];
  estimatedSetupTime: number;
  crewAssignments: CrewAssignment[];
  equipmentChanges: EquipmentChange[];
  locationChanges: LocationChange[];
}

export interface CrewCoordinationUpdate {
  department: string;
  status: string;
  readiness: number;
  issues: string[];
  estimatedCompletion: number;
  dependencies: string[];
}

export interface TimingMetrics {
  shotDuration: number;
  setupTime: number;
  actualVsPlanned: number;
  efficiency: number;
  delays: Delay[];
  timeRecoveryOptions: TimeRecoveryOption[];
}

export interface ResourceStatus {
  equipment: EquipmentStatus[];
  personnel: PersonnelStatus[];
  materials: MaterialStatus[];
  availability: AvailabilityUpdate[];
  constraints: ResourceConstraint[];
}

export interface WeatherImpact {
  currentConditions: WeatherCondition[];
  forecast: WeatherForecast[];
  shootingImpact: ShootingImpact;
  adaptationRequired: WeatherAdaptation[];
  contingencyActivation: ContingencyActivation[];
}

export interface EmergencyStatus {
  alertLevel: 'green' | 'yellow' | 'orange' | 'red';
  activeIncidents: Incident[];
  responseTeam: ResponseTeam;
  evacuationStatus: EvacuationStatus;
  communicationChannels: CommunicationChannel[];
}

// Additional supporting interfaces (abbreviated for brevity)
export interface LightingUnit { id: string; type: string; position: string; intensity: number; }
export interface PowerRequirement { circuit: string; load: number; backup: string; }
export interface SetupSequence { step: number; action: string; duration: number; personnel: string[]; }
export interface AdjustmentProtocol { trigger: string; action: string; timeLimit: number; }
export interface LightingSafetyMeasure { hazard: string; protection: string; procedure: string; }
export interface BackupLightingOption { scenario: string; equipment: string[]; setup: string; }
export interface EnvironmentalLightingFactor { factor: string; impact: string; compensation: string; }
export interface ContinuityLightingGuide { reference: string; maintenance: string; monitoring: string; }
export interface LightingControl { control: string; operation: string; limits: string; }
export interface LightingQualityCheck { parameter: string; target: string; tolerance: string; }
export interface LightingTroubleshooting { issue: string; diagnosis: string; solution: string; }

export interface OperatorRole { position: string; responsibilities: string[]; skills: string[]; }
export interface EquipmentSetup { item: string; configuration: string; checks: string[]; }
export interface OperationalProcedure { procedure: string; steps: string[]; safety: string[]; }
export interface MovementChoreography { sequence: string; timing: string; coordination: string; }
export interface FocusPullingGuide { technique: string; marks: string[]; timing: string; }
export interface FrameCompositionGuide { rules: string[]; adjustments: string[]; monitoring: string; }
export interface ExposureControlGuide { method: string; monitoring: string; adjustments: string; }
export interface StabilizationTechnique { method: string; equipment: string; application: string; }
export interface LensChangeProcedure { steps: string[]; safety: string[]; timing: number; }
export interface MaintenanceCheck { item: string; frequency: string; procedure: string; }
export interface CameraTroubleshooting { issue: string; diagnosis: string; solution: string; }

export interface SceneContext { location: string; timeOfDay: string; mood: string; objectives: string[]; }
export interface EmotionalDirection { emotion: string; intensity: number; progression: string; triggers: string[]; }
export interface PhysicalDirection { posture: string; gesture: string; movement: string; energy: string; }
export interface DialogueDeliveryGuide { pace: string; tone: string; emphasis: string[]; pauses: string[]; }
export interface EyeLineGuide { target: string; direction: string; maintenance: string; adjustments: string; }
export interface MovementBlocking { startPosition: string; endPosition: string; path: string; timing: string; }
export interface EnergyLevelGuide { level: number; consistency: string; variations: string[]; recovery: string; }
export interface PerformanceContinuityRequirement { element: string; reference: string; monitoring: string; }
export interface ImprovisationBoundary { allowed: string[]; restricted: string[]; guidelines: string; }
export interface PerformanceMetrics { authenticity: number; consistency: number; energy: number; }
export interface DirectorNote { type: string; content: string; timing: string; method: string; }

export interface TechnicalExecutionSpecs {
  videoSpecs: VideoSpecification;
  audioSpecs: AudioSpecification;
  dataManagement: DataManagementProtocol;
  qualityControl: QualityControlStandard[];
  backupSystems: BackupSystem[];
  monitoringSetup: MonitoringSetup;
}

export interface SafetyProtocol {
  protocolId: string;
  category: string;
  procedures: string[];
  equipment: string[];
  training: string[];
  emergencyResponse: string;
}

export interface RealTimeAdjustmentCapability {
  parameter: string;
  adjustmentRange: string;
  responseTime: number;
  approval: string;
  documentation: string;
}

export interface ExecutionQualityMetrics {
  visualStandards: VisualStandard[];
  audioStandards: AudioStandard[];
  performanceStandards: PerformanceStandard[];
  technicalStandards: TechnicalStandard[];
  overallQuality: QualityBenchmark;
}

export interface ContinuityTracker {
  visualContinuity: VisualContinuityCheck[];
  audioContinuity: AudioContinuityCheck[];
  performanceContinuity: PerformanceContinuityCheck[];
  technicalContinuity: TechnicalContinuityCheck[];
  documentationSystem: DocumentationSystem;
}

export interface EmergencyProcedure {
  procedureId: string;
  triggerConditions: string[];
  responseSteps: string[];
  responsibilities: string[];
  communicationProtocol: string;
  recoveryPlan: string;
}

// Additional minimal interfaces for compilation
export interface CompositionRule { rule: string; application: string; }
export interface SubjectPlacement { position: string; rationale: string; }
export interface BackgroundConsideration { element: string; treatment: string; }
export interface ForegroundElement { element: string; usage: string; }
export interface DepthOfFieldGuide { setting: string; effect: string; }
export interface AspectRatioConsideration { ratio: string; framing: string; }
export interface SafeFramingGuide { boundary: string; allowance: string; }
export interface MovementType { type: string; characteristics: string; }
export interface Position { x: number; y: number; z: number; }
export interface SpeedGuide { rate: string; variation: string; }
export interface AccelerationCurve { curve: string; smoothness: string; }
export interface SmoothnessGuide { level: string; technique: string; }
export interface OperatorInstruction { instruction: string; timing: string; }
export interface MovementSafetyConsideration { risk: string; mitigation: string; }
export interface RehearsalRequirement { type: string; repetitions: number; }
export interface LightingChange { type: string; parameters: string; }
export interface AudioLevel { channel: string; level: number; }
export interface AmbientConsideration { factor: string; compensation: string; }
export interface SyncBackupMethod { method: string; reliability: string; }
export interface AlternativeShot { type: string; setup: string; }
export interface ResourceRequirement { resource: string; quantity: number; }
export interface Issue { type: string; description: string; }
export interface QualityIndicator { metric: string; value: number; }
export interface PreparationTask { task: string; duration: number; }
export interface CrewAssignment { role: string; person: string; }
export interface EquipmentChange { item: string; action: string; }
export interface LocationChange { from: string; to: string; }
export interface Delay { cause: string; duration: number; }
export interface TimeRecoveryOption { option: string; timeSaved: number; }
export interface EquipmentStatus { item: string; status: string; }
export interface PersonnelStatus { person: string; availability: string; }
export interface MaterialStatus { material: string; quantity: number; }
export interface AvailabilityUpdate { resource: string; status: string; }
export interface ResourceConstraint { constraint: string; impact: string; }
export interface WeatherCondition { condition: string; severity: string; }
export interface WeatherForecast { time: string; conditions: string; }
export interface ShootingImpact { impact: string; severity: string; }
export interface WeatherAdaptation { adaptation: string; effectiveness: string; }
export interface ContingencyActivation { plan: string; status: string; }
export interface Incident { type: string; severity: string; }
export interface ResponseTeam { role: string; contact: string; }
export interface EvacuationStatus { status: string; routes: string[]; }
export interface CommunicationChannel { channel: string; purpose: string; }
export interface VideoSpecification { format: string; quality: string; }
export interface AudioSpecification { format: string; quality: string; }
export interface DataManagementProtocol { storage: string; backup: string; }
export interface QualityControlStandard { standard: string; criteria: string; }
export interface BackupSystem { system: string; activation: string; }
export interface MonitoringSetup { monitor: string; configuration: string; }
export interface VisualStandard { parameter: string; target: string; }
export interface AudioStandard { parameter: string; target: string; }
export interface PerformanceStandard { aspect: string; criteria: string; }
export interface TechnicalStandard { component: string; specification: string; }
export interface QualityBenchmark { metric: string; benchmark: number; }
export interface VisualContinuityCheck { element: string; method: string; }
export interface AudioContinuityCheck { element: string; method: string; }
export interface PerformanceContinuityCheck { element: string; method: string; }
export interface TechnicalContinuityCheck { element: string; method: string; }
export interface DocumentationSystem { method: string; storage: string; }
export interface FocusPoint { distance: number; subject: string; }
export interface FocusPullSequence { start: string; end: string; timing: string; }
export interface FocusMarking { mark: string; distance: number; }
export interface BackupFocusStrategy { strategy: string; trigger: string; }
export interface FocusMonitoring { method: string; alerts: string; }
export interface FocusTroubleshooting { issue: string; solution: string; }

// ===== CINEMATOGRAPHY EXECUTION ENGINE =====

export class CinematographyExecutionEngine {
  private engineId: string;

  constructor() {
    this.engineId = 'cinematography-execution-engine';
  }

  // ===== MAIN PUBLIC METHODS =====

  /**
   * V2.0 ENHANCED: Generate sophisticated cinematography using comprehensive visual storytelling framework
   */
  async generateEnhancedCinematography(
    context: {
      projectTitle: string;
      genre: 'horror' | 'comedy' | 'drama' | 'action' | 'thriller' | 'romance' | 'sci-fi';
      visualStyle: 'naturalistic' | 'stylized' | 'documentary' | 'classical' | 'experimental';
      targetAudience: string;
      format: 'theatrical' | 'streaming' | 'broadcast' | 'digital';
      budget: 'micro' | 'indie' | 'mid' | 'studio';
    },
    requirements: {
      storyApproach: 'motivated' | 'expressive' | 'naturalistic' | 'stylized';
      cameraStyle: 'stable' | 'dynamic' | 'handheld' | 'precise';
      lightingStyle: 'natural' | 'dramatic' | 'soft' | 'high-contrast';
      genreFocus: boolean;
      technicalQuality: 'standard' | 'high' | 'premium';
      collaborativeLevel: 'minimal' | 'standard' | 'extensive';
    },
    options: {
      storyDriven?: boolean;
      genreSpecialization?: boolean;
      technicalInnovation?: boolean;
      sustainablePractices?: boolean;
    } = {}
  ): Promise<{ blueprint: CinematographyExecutionBlueprint; cinematographyFramework: CinematographyEngineRecommendation }> {
    try {
      // Generate V2.0 Cinematography Framework
      const cinematographyFramework = await CinematographyEngineV2.generateCinematographyRecommendation(
        context,
        requirements,
        options
      );
      
      // Convert V2.0 context to legacy format
      const legacyInputs = this.convertToLegacyCinematographyInputs(
        context,
        requirements,
        cinematographyFramework
      );
      
      // Generate enhanced cinematography blueprint using V2.0 insights
      const blueprint = await this.generateCinematographyExecutionBlueprint(
        legacyInputs.sceneId,
        legacyInputs.storyboardData,
        legacyInputs.productionConstraints
      );
      
      // Apply V2.0 framework enhancements to blueprint
      const enhancedBlueprint = this.applyCinematographyFrameworkToBlueprint(
        blueprint,
        cinematographyFramework
      );
      
      return {
        blueprint: enhancedBlueprint,
        cinematographyFramework
      };
    } catch (error) {
      console.error('Error generating enhanced cinematography:', error);
      throw error;
    }
  }

  async generateCinematographyExecutionBlueprint(
    sceneId: string,
    storyboardData: any,
    productionConstraints: any
  ): Promise<CinematographyExecutionBlueprint> {
    try {
      return await this.generateCinematographyExecutionBlueprintAI(sceneId, storyboardData, productionConstraints);
    } catch (error) {
      console.warn('AI generation failed, using fallback for cinematography execution blueprint:', error);
      return this.generateCinematographyExecutionBlueprintFallback(sceneId, storyboardData, productionConstraints);
    }
  }

  async executeRealTimeShot(
    shotId: string,
    liveConditions: any,
    crewStatus: any
  ): Promise<RealTimeShotExecution> {
    try {
      return await this.executeRealTimeShotAI(shotId, liveConditions, crewStatus);
    } catch (error) {
      console.warn('AI generation failed, using fallback for real-time shot execution:', error);
      return this.executeRealTimeShotFallback(shotId, liveConditions, crewStatus);
    }
  }

  async coordinateLightingExecution(
    lightingPlan: any,
    sceneRequirements: any,
    environmentalFactors: any
  ): Promise<LightingExecutionPlan> {
    try {
      return await this.coordinateLightingExecutionAI(lightingPlan, sceneRequirements, environmentalFactors);
    } catch (error) {
      console.warn('AI generation failed, using fallback for lighting execution coordination:', error);
      return this.coordinateLightingExecutionFallback(lightingPlan, sceneRequirements, environmentalFactors);
    }
  }

  async provideCameraOperationGuidance(
    shotSpecifications: any,
    equipmentSetup: any,
    operatorExperience: any
  ): Promise<CameraOperationGuide[]> {
    try {
      return await this.provideCameraOperationGuidanceAI(shotSpecifications, equipmentSetup, operatorExperience);
    } catch (error) {
      console.warn('AI generation failed, using fallback for camera operation guidance:', error);
      return this.provideCameraOperationGuidanceFallback(shotSpecifications, equipmentSetup, operatorExperience);
    }
  }

  async generatePerformanceDirection(
    sceneContext: any,
    actorProfiles: any,
    directorVision: any
  ): Promise<PerformanceDirectionGuide[]> {
    try {
      return await this.generatePerformanceDirectionAI(sceneContext, actorProfiles, directorVision);
    } catch (error) {
      console.warn('AI generation failed, using fallback for performance direction:', error);
      return this.generatePerformanceDirectionFallback(sceneContext, actorProfiles, directorVision);
    }
  }

  // ===== AI-ENHANCED METHODS =====

  private async generateCinematographyExecutionBlueprintAI(
    sceneId: string,
    storyboardData: any,
    productionConstraints: any
  ): Promise<CinematographyExecutionBlueprint> {
    const prompt = `As an expert cinematographer and production coordinator, create a comprehensive cinematography execution blueprint for real-time film production.

INPUT DATA:
Scene ID: ${sceneId}
Storyboard Data: ${JSON.stringify(storyboardData, null, 2)}
Production Constraints: ${JSON.stringify(productionConstraints, null, 2)}

Create a detailed execution blueprint that includes:
1. Complete shot list with precise technical specifications
2. Lighting execution plan with setup sequences and safety protocols
3. Camera operation guides for each crew position
4. Performance direction guides for all actors
5. Technical specifications and quality metrics
6. Safety protocols and emergency procedures
7. Real-time adjustment capabilities
8. Continuity tracking systems

Focus on:
- Practical implementation details
- Crew coordination and communication
- Quality assurance and monitoring
- Safety and risk mitigation
- Flexibility for real-time adjustments
- Professional production standards

Return a JSON object matching the CinematographyExecutionBlueprint interface with realistic, actionable details for film production.`;

    const response = await generateContent(prompt);
    return JSON.parse(response);
  }

  private async executeRealTimeShotAI(
    shotId: string,
    liveConditions: any,
    crewStatus: any
  ): Promise<RealTimeShotExecution> {
    const prompt = `As an expert 1st Assistant Director and cinematographer, provide real-time shot execution guidance for active film production.

INPUT DATA:
Shot ID: ${shotId}
Live Conditions: ${JSON.stringify(liveConditions, null, 2)}
Crew Status: ${JSON.stringify(crewStatus, null, 2)}

Analyze the current production state and provide:
1. Current execution status and progress assessment
2. Live adjustments needed for optimal results
3. Performance notes and actor direction
4. Technical issue identification and resolution
5. Quality assessment and improvement recommendations
6. Next shot preparation and crew coordination
7. Timing metrics and efficiency analysis
8. Resource status and availability updates
9. Weather impact assessment and adaptations
10. Emergency status and safety monitoring

Focus on:
- Immediate actionable guidance
- Quality optimization in real-time
- Crew efficiency and coordination
- Problem-solving and adaptation
- Safety and risk management
- Production continuity

Return a JSON object matching the RealTimeShotExecution interface with specific, actionable real-time guidance.`;

    const response = await generateContent(prompt);
    return JSON.parse(response);
  }

  private async coordinateLightingExecutionAI(
    lightingPlan: any,
    sceneRequirements: any,
    environmentalFactors: any
  ): Promise<LightingExecutionPlan> {
    const prompt = `As an expert gaffer and lighting director, create a detailed lighting execution plan for professional film production.

INPUT DATA:
Lighting Plan: ${JSON.stringify(lightingPlan, null, 2)}
Scene Requirements: ${JSON.stringify(sceneRequirements, null, 2)}
Environmental Factors: ${JSON.stringify(environmentalFactors, null, 2)}

Create a comprehensive lighting execution plan including:
1. Detailed lighting unit specifications and positioning
2. Power requirements and electrical safety protocols
3. Setup sequences with timing and crew assignments
4. Real-time adjustment protocols and procedures
5. Safety measures and hazard mitigation
6. Backup lighting options and contingency plans
7. Environmental considerations and adaptations
8. Continuity lighting guides and references
9. Real-time control systems and operation
10. Quality checks and troubleshooting procedures

Focus on:
- Professional lighting standards
- Electrical safety and protocols
- Efficient setup and operation
- Quality consistency and control
- Crew safety and coordination
- Flexibility for adjustments

Return a JSON object matching the LightingExecutionPlan interface with detailed, production-ready specifications.`;

    const response = await generateContent(prompt);
    return JSON.parse(response);
  }

  private async provideCameraOperationGuidanceAI(
    shotSpecifications: any,
    equipmentSetup: any,
    operatorExperience: any
  ): Promise<CameraOperationGuide[]> {
    const prompt = `As an expert camera operator and director of photography, provide comprehensive camera operation guidance for professional film production.

INPUT DATA:
Shot Specifications: ${JSON.stringify(shotSpecifications, null, 2)}
Equipment Setup: ${JSON.stringify(equipmentSetup, null, 2)}
Operator Experience: ${JSON.stringify(operatorExperience, null, 2)}

Create detailed camera operation guides including:
1. Role-specific operational procedures for each camera position
2. Equipment setup and configuration guidelines
3. Movement choreography and coordination
4. Focus pulling techniques and timing
5. Frame composition and monitoring
6. Exposure control and adjustment protocols
7. Stabilization techniques and equipment usage
8. Lens change procedures and timing
9. Maintenance checks and equipment care
10. Troubleshooting and problem resolution

Tailor guidance to:
- Operator experience levels
- Equipment complexity
- Shot requirements
- Safety considerations
- Quality standards
- Efficiency optimization

Return a JSON array of CameraOperationGuide objects with specific, actionable guidance for each camera operator role.`;

    const response = await generateContent(prompt);
    return JSON.parse(response);
  }

  private async generatePerformanceDirectionAI(
    sceneContext: any,
    actorProfiles: any,
    directorVision: any
  ): Promise<PerformanceDirectionGuide[]> {
    const prompt = `As an expert film director and performance coach, create detailed performance direction guides for actors during film production.

INPUT DATA:
Scene Context: ${JSON.stringify(sceneContext, null, 2)}
Actor Profiles: ${JSON.stringify(actorProfiles, null, 2)}
Director Vision: ${JSON.stringify(directorVision, null, 2)}

Create comprehensive performance direction guides including:
1. Scene context and character objectives
2. Emotional direction and intensity guidance
3. Physical direction and movement blocking
4. Dialogue delivery and timing instructions
5. Eye line guidance and screen direction
6. Movement blocking and spatial relationships
7. Energy level management and consistency
8. Continuity requirements and reference points
9. Improvisation boundaries and guidelines
10. Performance metrics and quality assessment

Tailor direction to:
- Individual actor strengths and challenges
- Character psychology and motivation
- Scene requirements and emotional beats
- Technical constraints and camera requirements
- Director's artistic vision
- Production efficiency

Return a JSON array of PerformanceDirectionGuide objects with specific, actionable direction for each actor in the scene.`;

    const response = await generateContent(prompt);
    return JSON.parse(response);
  }

  // ===== FALLBACK METHODS =====

  private generateCinematographyExecutionBlueprintFallback(
    sceneId: string,
    storyboardData: any,
    productionConstraints: any
  ): CinematographyExecutionBlueprint {
    return {
      executionId: `exec-${sceneId}-${Date.now()}`,
      sceneId,
      shotList: [
        {
          shotId: `shot-${sceneId}-001`,
          shotNumber: '1A',
          shotType: {
            category: 'wide',
            variant: 'establishing',
            purpose: 'Scene introduction',
            emotionalImpact: 'Neutral orientation',
            narrativeFunction: 'Location establishment'
          },
          cameraPosition: {
            coordinates: { x: 0, y: 1.5, z: 5 },
            height: 1.5,
            angle: 0,
            orientation: 'straight',
            stabilization: 'tripod',
            accessibility: 'good',
            safetyZone: 'clear',
            powerAccess: 'available',
            cableManagement: 'standard'
          },
          lensSelection: {
            focalLength: 35,
            aperture: 'f/2.8',
            manufacturer: 'Canon',
            model: 'CN-E 35mm',
            characteristics: ['wide angle', 'sharp'],
            optimalUsage: 'Establishing shots',
            limitations: ['Some distortion at edges'],
            maintenanceNotes: ['Clean regularly']
          },
          focusGuide: {
            focusPoints: [{ distance: 5, subject: 'main action' }],
            pullSequence: [{ start: 'infinity', end: '5ft', timing: '2 seconds' }],
            markings: [{ mark: 'A', distance: 5 }],
            backupFocus: { strategy: 'auto focus', trigger: 'signal loss' },
            monitoring: { method: 'focus assist', alerts: 'beep' },
            troubleshooting: { issue: 'soft focus', solution: 'recalibrate' }
          },
          exposureSettings: {
            aperture: 'f/2.8',
            shutterSpeed: '1/50',
            iso: 800,
            nd_filters: [],
            exposureCompensation: 0,
            meteringMode: 'matrix',
            histogramGuidance: 'avoid clipping',
            overexposureWarnings: ['check highlights']
          },
          colorTemperature: {
            kelvinValue: 5600,
            colorGel: 'none',
            whiteBalanceSetup: 'daylight',
            colorChecker: 'X-Rite',
            ambientLightCompensation: 'minimal',
            colorContinuity: 'match previous',
            postProcessingNotes: 'standard correction'
          },
          framingGuide: {
            composition: [{ rule: 'rule of thirds', application: 'subject placement' }],
            subjectPlacement: { position: 'center frame', rationale: 'emphasis' },
            backgroundConsiderations: [{ element: 'architecture', treatment: 'complementary' }],
            foregroundElements: [{ element: 'none', usage: 'clear frame' }],
            depthOfField: { setting: 'medium', effect: 'focus separation' },
            aspectRatioConsiderations: [{ ratio: '16:9', framing: 'standard' }],
            safeFraming: { boundary: '10%', allowance: 'action safe' }
          },
          movementInstructions: {
            movementType: { type: 'static', characteristics: 'locked off' },
            startPosition: { x: 0, y: 1.5, z: 5 },
            endPosition: { x: 0, y: 1.5, z: 5 },
            speed: { rate: 'none', variation: 'none' },
            acceleration: { curve: 'none', smoothness: 'n/a' },
            smoothness: { level: 'n/a', technique: 'tripod lock' },
            operatorInstructions: [{ instruction: 'maintain lock', timing: 'throughout' }],
            safetyConsiderations: [{ risk: 'none', mitigation: 'standard' }],
            rehearsalRequirements: [{ type: 'none', repetitions: 0 }]
          },
          timingCues: [
            {
              cueType: 'start',
              triggerPoint: 'Director calls action',
              description: 'Begin recording',
              responsibleCrew: ['Camera Operator'],
              backupSignal: 'Hand signal',
              contingency: 'Audio backup'
            }
          ],
          actorDirections: [
            {
              instruction: 'Enter from stage left',
              timing: 'On action',
              priority: 'critical',
              deliveryMethod: 'verbal',
              expectedResponse: 'Natural entrance',
              adaptationOptions: ['Adjust timing if needed']
            }
          ],
          lightingCues: [
            {
              cueNumber: 'L1',
              timing: 'On action',
              lightingChange: { type: 'none', parameters: 'maintain' },
              operator: 'Gaffer',
              equipment: ['Key light'],
              safetyClearance: 'All clear',
              backupProcedure: 'Manual control'
            }
          ],
          audioSync: {
            syncMethod: 'timecode',
            timecodeTiming: '00:00:00:00',
            clapperBoardUsage: 'smart slate',
            audioLevels: [{ channel: 'boom', level: -12 }],
            ambientConsiderations: [{ factor: 'room tone', compensation: 'record separate' }],
            syncBackup: [{ method: 'manual clap', reliability: 'high' }]
          },
          continuityNotes: [
            {
              category: 'wardrobe',
              description: 'Blue shirt, dark jeans',
              reference: 'Previous scene',
              responsibility: 'Wardrobe department',
              checkPoint: 'Before action',
              documentation: 'Photo reference'
            }
          ],
          safetyConsiderations: [
            {
              hazardType: 'Standard set safety',
              riskLevel: 'low',
              mitigationMeasures: ['Clear walkways', 'Secure equipment'],
              responsibleParty: 'AD team',
              emergencyProcedure: 'Standard evacuation',
              equipmentRequired: ['First aid kit']
            }
          ],
          backupOptions: [
            {
              scenario: 'Equipment failure',
              alternativeShot: { type: 'handheld wide', setup: 'quick handheld' },
              timeRequirement: 5,
              resourceRequirement: [{ resource: 'handheld rig', quantity: 1 }],
              qualityImpact: 'Slight decrease in stability',
              implementationSteps: ['Switch to handheld', 'Adjust framing', 'Continue']
            }
          ]
        }
      ],
      lightingPlan: {
        setupId: `lighting-${sceneId}`,
        lightingUnits: [{ id: 'key-001', type: 'LED panel', position: 'camera left', intensity: 75 }],
        powerRequirements: [{ circuit: 'A1', load: 500, backup: 'generator' }],
        setupSequence: [{ step: 1, action: 'Position key light', duration: 10, personnel: ['Gaffer', 'Best Boy'] }],
        adjustmentProtocols: [{ trigger: 'Director request', action: 'Intensity adjustment', timeLimit: 2 }],
        safetyMeasures: [{ hazard: 'Hot lights', protection: 'Gloves required', procedure: 'Cool down protocol' }],
        backupLighting: [{ scenario: 'Power failure', equipment: ['Battery lights'], setup: 'Emergency lighting' }],
        environmentalConsiderations: [{ factor: 'Natural light', impact: 'Color temperature', compensation: 'Gel correction' }],
        continuityLighting: [{ reference: 'Previous setup', maintenance: 'Match intensity', monitoring: 'Light meter' }],
        realTimeControls: [{ control: 'Dimmer board', operation: 'Manual', limits: '0-100%' }],
        qualityChecks: [{ parameter: 'Color temperature', target: '5600K', tolerance: '±200K' }],
        troubleshooting: [{ issue: 'Flicker', diagnosis: 'Voltage fluctuation', solution: 'Power conditioner' }]
      },
      cameraOperations: [
        {
          operationId: `cam-op-${sceneId}`,
          operatorRole: { position: 'Camera Operator', responsibilities: ['Frame composition', 'Camera movement'], skills: ['Steady hand', 'Quick adjustments'] },
          equipmentSetup: { item: 'Main camera', configuration: 'Tripod mounted', checks: ['Battery level', 'Memory card', 'Lens clean'] },
          operationalProcedures: [{ procedure: 'Shot preparation', steps: ['Check frame', 'Confirm focus', 'Ready signal'], safety: ['Secure mount', 'Clear pathway'] }],
          movementChoreography: { sequence: 'Static hold', timing: 'Throughout take', coordination: 'None required' },
          focusPulling: { technique: 'Follow focus', marks: ['Mark A: 5ft'], timing: 'Maintain throughout' },
          frameComposition: { rules: ['Rule of thirds', 'Headroom'], adjustments: ['Micro movements only'], monitoring: 'Monitor feedback' },
          exposureControl: { method: 'Auto iris', monitoring: 'Histogram', adjustments: 'ND filters if needed' },
          stabilizationTechniques: [{ method: 'Tripod lock', equipment: 'Sachtler tripod', application: 'Full lock' }],
          lensChangeProcedures: [{ steps: ['Clear frame', 'Power down', 'Change lens', 'Power up', 'Check calibration'], safety: ['Support lens weight', 'Clean contacts'], timing: 120 }],
          maintenanceChecks: [{ item: 'Lens', frequency: 'Between setups', procedure: 'Visual inspection and cleaning' }],
          troubleshooting: [{ issue: 'Soft image', diagnosis: 'Focus issue', solution: 'Recalibrate focus system' }]
        }
      ],
      performanceDirection: [
        {
          directionId: `perf-${sceneId}-actor1`,
          actorId: 'actor-001',
          characterName: 'Main Character',
          sceneContext: { location: 'Interior office', timeOfDay: 'Morning', mood: 'Determined', objectives: ['Convince colleague', 'Maintain confidence'] },
          emotionalDirection: { emotion: 'Determination', intensity: 7, progression: 'Building', triggers: ['Eye contact', 'Key phrases'] },
          physicalDirection: { posture: 'Upright', gesture: 'Confident gestures', movement: 'Purposeful', energy: 'High' },
          dialogueDelivery: { pace: 'Moderate', tone: 'Authoritative', emphasis: ['Key arguments'], pauses: ['After questions'] },
          eyeLineGuide: { target: 'Other actor', direction: 'Direct gaze', maintenance: 'Strong contact', adjustments: 'Brief glances away' },
          movementBlocking: { startPosition: 'Behind desk', endPosition: 'Closer to colleague', path: 'Around desk', timing: 'Mid-scene' },
          energyLevelGuide: { level: 8, consistency: 'Maintain high', variations: ['Slight dips for emphasis'], recovery: 'Quick bounce back' },
          continuityRequirements: [{ element: 'Hand position', reference: 'Previous take', monitoring: 'Script supervisor' }],
          improvisationBoundaries: [{ allowed: ['Natural reactions'], restricted: ['Plot changes'], guidelines: 'Stay in character' }],
          performanceMetrics: { authenticity: 8, consistency: 9, energy: 8 },
          directorNotes: [{ type: 'Character motivation', content: 'Fighting for team survival', timing: 'Before take', method: 'Private conversation' }]
        }
      ],
      technicalSpecs: {
        videoSpecs: { format: '4K ProRes', quality: 'High' },
        audioSpecs: { format: '48kHz/24bit', quality: 'Broadcast' },
        dataManagement: { storage: 'RAID array', backup: 'Cloud sync' },
        qualityControl: [{ standard: 'Broadcast', criteria: 'Technical excellence' }],
        backupSystems: [{ system: 'Secondary camera', activation: 'Manual switch' }],
        monitoringSetup: { monitor: 'Director monitor', configuration: 'Calibrated' }
      },
      safetyProtocols: [
        {
          protocolId: 'general-safety',
          category: 'Set Safety',
          procedures: ['Clear walkways', 'Secure equipment', 'Safety briefing'],
          equipment: ['First aid kit', 'Fire extinguisher'],
          training: ['Basic safety orientation'],
          emergencyResponse: 'Evacuate to assembly point'
        }
      ],
      realTimeAdjustments: [
        {
          parameter: 'Lighting intensity',
          adjustmentRange: '±50%',
          responseTime: 5,
          approval: 'Director/DP',
          documentation: 'Lighting log'
        }
      ],
      qualityMetrics: {
        visualStandards: [{ parameter: 'Resolution', target: '4K' }],
        audioStandards: [{ parameter: 'Signal/Noise', target: '>60dB' }],
        performanceStandards: [{ aspect: 'Authenticity', criteria: 'Natural delivery' }],
        technicalStandards: [{ component: 'Focus', specification: 'Tack sharp' }],
        overallQuality: { metric: 'Production value', benchmark: 8.5 }
      },
      continuityTracking: {
        visualContinuity: [{ element: 'Wardrobe', method: 'Photo reference' }],
        audioContinuity: [{ element: 'Background level', method: 'Audio monitoring' }],
        performanceContinuity: [{ element: 'Energy level', method: 'Director observation' }],
        technicalContinuity: [{ element: 'Color balance', method: 'Scope monitoring' }],
        documentationSystem: { method: 'Digital logs', storage: 'Production server' }
      },
      emergencyProcedures: [
        {
          procedureId: 'fire-emergency',
          triggerConditions: ['Smoke alarm', 'Visual fire', 'Verbal alert'],
          responseSteps: ['Stop filming', 'Secure equipment safely', 'Evacuate calmly', 'Assemble at safety point'],
          responsibilities: ['AD: Coordinate evacuation', 'PM: Equipment security', 'Gaffer: Power shutdown'],
          communicationProtocol: 'Immediate PA announcement, radio coordination',
          recoveryPlan: 'Assess damage, relocate if needed, resume when safe'
        }
      ]
    };
  }

  private executeRealTimeShotFallback(
    shotId: string,
    liveConditions: any,
    crewStatus: any
  ): RealTimeShotExecution {
    return {
      shotId,
      executionStatus: {
        currentPhase: 'recording',
        progress: 75,
        timeElapsed: 180,
        estimatedCompletion: 60,
        issues: [{ type: 'minor', description: 'Audio level adjustment needed' }],
        quality: { metric: 'overall', value: 8.5 }
      },
      liveAdjustments: [
        {
          adjustmentType: 'Audio level',
          reason: 'Background noise increase',
          implementation: 'Boost boom mic gain by 3dB',
          impact: 'Improved dialogue clarity',
          approval: 'Sound mixer approved',
          documentation: 'Audio log updated'
        }
      ],
      performanceNotes: [
        {
          actorId: 'actor-001',
          noteType: 'direction',
          content: 'Increase energy in final line',
          timing: 'Before next take',
          deliveryMethod: 'verbal',
          followUp: 'Check energy level'
        }
      ],
      technicalIssues: [],
      qualityAssessment: {
        visualQuality: 9,
        audioQuality: 8,
        performanceQuality: 8.5,
        technicalExecution: 9,
        overallRating: 8.6,
        improvements: ['Fine-tune audio levels'],
        retakeRecommendation: false
      },
      nextShotPreparation: {
        shotId: 'shot-next-002',
        preparationTasks: [{ task: 'Adjust camera angle', duration: 10 }],
        estimatedSetupTime: 15,
        crewAssignments: [{ role: 'Camera Operator', person: 'John Smith' }],
        equipmentChanges: [{ item: 'Lens', action: 'Change to 85mm' }],
        locationChanges: [{ from: 'Wide position', to: 'Close-up position' }]
      },
      crewCoordination: [
        {
          department: 'Camera',
          status: 'Ready',
          readiness: 95,
          issues: [],
          estimatedCompletion: 5,
          dependencies: []
        }
      ],
      timingMetrics: {
        shotDuration: 180,
        setupTime: 300,
        actualVsPlanned: 105,
        efficiency: 85,
        delays: [{ cause: 'Audio setup', duration: 30 }],
        timeRecoveryOptions: [{ option: 'Skip rehearsal', timeSaved: 120 }]
      },
      resourceStatus: {
        equipment: [{ item: 'Main camera', status: 'Operational' }],
        personnel: [{ person: 'Camera Operator', availability: 'Available' }],
        materials: [{ material: 'Memory cards', quantity: 8 }],
        availability: [{ resource: 'Backup camera', status: 'Standby' }],
        constraints: [{ constraint: 'Battery life', impact: '2 hours remaining' }]
      },
      weatherImpact: {
        currentConditions: [{ condition: 'Clear', severity: 'None' }],
        forecast: [{ time: 'Next hour', conditions: 'Stable' }],
        shootingImpact: { impact: 'None', severity: 'Minimal' },
        adaptationRequired: [],
        contingencyActivation: []
      },
      emergencyStatus: {
        alertLevel: 'green',
        activeIncidents: [],
        responseTeam: { role: 'Safety Officer', contact: 'On-set' },
        evacuationStatus: { status: 'Normal', routes: ['Main exit', 'Emergency exit'] },
        communicationChannels: [{ channel: 'Radio', purpose: 'Crew coordination' }]
      }
    };
  }

  private coordinateLightingExecutionFallback(
    lightingPlan: any,
    sceneRequirements: any,
    environmentalFactors: any
  ): LightingExecutionPlan {
    return {
      setupId: `lighting-exec-${Date.now()}`,
      lightingUnits: [
        { id: 'key-001', type: 'LED Panel 1K', position: 'Camera left, 45 degrees', intensity: 75 },
        { id: 'fill-001', type: 'LED Panel 500W', position: 'Camera right, 30 degrees', intensity: 40 }
      ],
      powerRequirements: [
        { circuit: 'A1', load: 1500, backup: 'Generator circuit G1' },
        { circuit: 'A2', load: 750, backup: 'Battery backup' }
      ],
      setupSequence: [
        { step: 1, action: 'Position key light', duration: 15, personnel: ['Gaffer', 'Best Boy Electric'] },
        { step: 2, action: 'Set fill light', duration: 10, personnel: ['Best Boy Electric'] },
        { step: 3, action: 'Power and test', duration: 5, personnel: ['Gaffer'] }
      ],
      adjustmentProtocols: [
        { trigger: 'Director request', action: 'Intensity adjustment via dimmer', timeLimit: 30 },
        { trigger: 'Color temperature change', action: 'Gel adjustment', timeLimit: 120 }
      ],
      safetyMeasures: [
        { hazard: 'Hot LED panels', protection: 'Heat-resistant gloves', procedure: 'Allow cool-down between adjustments' },
        { hazard: 'Electrical circuits', protection: 'GFCI protection', procedure: 'Check connections before power-on' }
      ],
      backupLighting: [
        { scenario: 'Power failure', equipment: ['Battery-powered LED panels'], setup: 'Emergency lighting positions' },
        { scenario: 'Equipment failure', equipment: ['Spare LED units'], setup: 'Quick replacement' }
      ],
      environmentalConsiderations: [
        { factor: 'Natural daylight', impact: 'Color temperature variation', compensation: 'Daylight balance gels' },
        { factor: 'Room reflectance', impact: 'Fill light levels', compensation: 'Adjust fill intensity' }
      ],
      continuityLighting: [
        { reference: 'Previous scene lighting notes', maintenance: 'Match key light angle and intensity', monitoring: 'Light meter readings' }
      ],
      realTimeControls: [
        { control: 'DMX dimmer console', operation: 'Remote intensity control', limits: '0-100% range' },
        { control: 'Manual barn doors', operation: 'Direct adjustment', limits: 'Physical positioning' }
      ],
      qualityChecks: [
        { parameter: 'Color temperature', target: '5600K daylight', tolerance: '±200K acceptable' },
        { parameter: 'Light uniformity', target: 'Even coverage', tolerance: '±0.5 stop variation' }
      ],
      troubleshooting: [
        { issue: 'LED flicker', diagnosis: 'Voltage fluctuation or dimmer incompatibility', solution: 'Check power source, use LED-compatible dimmers' },
        { issue: 'Color shift', diagnosis: 'LED age or temperature change', solution: 'Color meter check, gel correction if needed' }
      ]
    };
  }

  private provideCameraOperationGuidanceFallback(
    shotSpecifications: any,
    equipmentSetup: any,
    operatorExperience: any
  ): CameraOperationGuide[] {
    return [
      {
        operationId: `cam-guide-${Date.now()}`,
        operatorRole: { 
          position: 'Camera Operator A', 
          responsibilities: ['Primary camera operation', 'Frame composition', 'Camera movement execution'], 
          skills: ['Steady handheld operation', 'Quick focus adjustments', 'Composition expertise'] 
        },
        equipmentSetup: { 
          item: 'Main Camera (RED Komodo)', 
          configuration: 'Shoulder rig with follow focus', 
          checks: ['Battery level >80%', 'Memory card formatted', 'Lens calibrated', 'Monitor brightness'] 
        },
        operationalProcedures: [
          { 
            procedure: 'Shot preparation checklist', 
            steps: ['Verify shot composition', 'Confirm focus marks', 'Check exposure', 'Signal ready to AD'], 
            safety: ['Secure camera strap', 'Clear movement path', 'Check for obstacles'] 
          },
          { 
            procedure: 'Take execution', 
            steps: ['Frame shot on "mark"', 'Maintain composition', 'Execute movement as rehearsed', 'Hold for safety'], 
            safety: ['Maintain stable stance', 'Alert crew to movement', 'Watch for cable snags'] 
          }
        ],
        movementChoreography: { 
          sequence: 'Start wide, push in to medium close-up', 
          timing: 'Begin push at 10 seconds, reach final frame at 25 seconds', 
          coordination: 'Sync with actor movement stage right' 
        },
        focusPulling: { 
          technique: 'Remote follow focus with marks', 
          marks: ['Mark A: Infinity (start)', 'Mark B: 8 feet (actor)', 'Mark C: 5 feet (end position)'], 
          timing: 'Pull A to B on actor movement, B to C on camera push' 
        },
        frameComposition: { 
          rules: ['Rule of thirds for subject placement', 'Maintain headroom throughout movement', 'Watch for background distractions'], 
          adjustments: ['Micro-adjustments for level horizon', 'Compensate for actor height changes'], 
          monitoring: 'Primary monitor with false color for exposure check' 
        },
        exposureControl: { 
          method: 'Manual iris control with waveform monitoring', 
          monitoring: 'Waveform display and histogram', 
          adjustments: 'ND filter changes only during camera moves, iris for fine adjustments' 
        },
        stabilizationTechniques: [
          { method: 'Shoulder rig with counterbalance', equipment: 'Tilta shoulder rig system', application: 'Primary stabilization for handheld movement' },
          { method: 'Breathing technique', equipment: 'Natural steadying', application: 'Micro-movement reduction during holds' }
        ],
        lensChangeProcedures: [
          { 
            steps: ['Call "lens change"', 'Secure camera position', 'Power down if needed', 'Support lens weight during removal', 'Clean mount contacts', 'Install new lens', 'Calibrate focus system', 'Test operation'], 
            safety: ['Two-person operation for heavy lenses', 'Support camera body weight', 'Protect lens contacts from contamination'], 
            timing: 180 
          }
        ],
        maintenanceChecks: [
          { item: 'Lens front element', frequency: 'Before each setup', procedure: 'Visual inspection for dust/smudges, clean with lens tissue if needed' },
          { item: 'Camera sensor', frequency: 'Daily', procedure: 'Check for dust spots using sensor test, professional cleaning if needed' }
        ],
        troubleshooting: [
          { issue: 'Soft focus', diagnosis: 'Focus calibration drift or incorrect marks', solution: 'Recalibrate follow focus system, verify distance measurements' },
          { issue: 'Camera shake', diagnosis: 'Operator fatigue or improper rig balance', solution: 'Adjust rig balance, provide operator rest, consider gimbal assistance' }
        ]
      }
    ];
  }

  private generatePerformanceDirectionFallback(
    sceneContext: any,
    actorProfiles: any,
    directorVision: any
  ): PerformanceDirectionGuide[] {
    return [
      {
        directionId: `perf-guide-${Date.now()}`,
        actorId: 'actor-001',
        characterName: 'Sarah Mitchell',
        sceneContext: { 
          location: 'Corporate boardroom', 
          timeOfDay: 'Late afternoon', 
          mood: 'Tense confrontation', 
          objectives: ['Defend proposal', 'Maintain authority', 'Win board support'] 
        },
        emotionalDirection: { 
          emotion: 'Controlled intensity', 
          intensity: 8, 
          progression: 'Building from calm confidence to passionate conviction', 
          triggers: ['Opposition arguments', 'Board member reactions', 'Key statistics mention'] 
        },
        physicalDirection: { 
          posture: 'Upright, shoulders back, commanding presence', 
          gesture: 'Purposeful hand movements, occasional table contact for emphasis', 
          movement: 'Controlled pacing behind chair, return to position for key points', 
          energy: 'High but contained, professional intensity' 
        },
        dialogueDelivery: { 
          pace: 'Measured and deliberate, occasional quickening for emphasis', 
          tone: 'Authoritative but not aggressive, professional confidence', 
          emphasis: ['Financial benefits', 'Risk mitigation', 'Timeline urgency'], 
          pauses: ['After rhetorical questions', 'Before key statistics', 'After opposition points'] 
        },
        eyeLineGuide: { 
          target: 'Board members clockwise around table', 
          direction: 'Direct eye contact with each member during key points', 
          maintenance: 'Hold contact for 2-3 seconds per person', 
          adjustments: 'Return to chairman for approval cues' 
        },
        movementBlocking: { 
          startPosition: 'Standing behind chair at foot of table', 
          endPosition: 'Closer to presentation screen', 
          path: 'Around left side of table to screen position', 
          timing: 'Move during transition to financial data section' 
        },
        energyLevelGuide: { 
          level: 8, 
          consistency: 'Maintain high professional energy throughout', 
          variations: ['Slight increase during key arguments', 'Brief pause for dramatic effect'], 
          recovery: 'Deep breath during opposition response, return to confident stance' 
        },
        continuityRequirements: [
          { element: 'Wardrobe state', reference: 'Blazer buttoned, sleeves at wrist', monitoring: 'Wardrobe supervisor check' },
          { element: 'Hair and makeup', reference: 'Professional but slightly stressed look', monitoring: 'Touch-up between takes' }
        ],
        improvisationBoundaries: [
          { allowed: ['Natural reactions to board member input', 'Slight adjustments to gesture timing'], restricted: ['Plot point changes', 'Character motivation shifts'], guidelines: 'Stay within character confidence and determination' }
        ],
        performanceMetrics: { authenticity: 9, consistency: 8, energy: 8 },
        directorNotes: [
          { type: 'Character motivation', content: 'This presentation represents two years of work and career future', timing: 'Before first take', method: 'Private discussion' },
          { type: 'Scene dynamics', content: 'Remember the power balance - you have expertise but they have decision authority', timing: 'During blocking rehearsal', method: 'Group discussion' }
        ]
      }
    ];
  }

  /**
   * Helper method to convert V2.0 context to legacy format
   */
  private convertToLegacyCinematographyInputs(
    context: any,
    requirements: any,
    framework: CinematographyEngineRecommendation
  ): any {
    return {
      sceneId: `scene-${Date.now()}`,
      storyboardData: {
        shots: [
          {
            shotNumber: 1,
            description: `${context.genre} scene with ${requirements.cameraStyle} camera work`,
            cameraMovement: requirements.cameraStyle,
            lighting: requirements.lightingStyle,
            mood: context.visualStyle
          }
        ],
        visualStyle: context.visualStyle,
        genre: context.genre
      },
      productionConstraints: {
        budget: context.budget,
        format: context.format,
        technicalQuality: requirements.technicalQuality,
        timeConstraints: 'standard',
        crewSize: requirements.collaborativeLevel === 'extensive' ? 'large' : 'standard',
        equipmentLevel: requirements.technicalQuality
      }
    };
  }

  /**
   * Helper method to apply V2.0 framework enhancements to existing blueprint
   */
  private applyCinematographyFrameworkToBlueprint(
    blueprint: CinematographyExecutionBlueprint,
    framework: CinematographyEngineRecommendation
  ): CinematographyExecutionBlueprint {
    const enhancedBlueprint = { ...blueprint };
    
    // Add framework metadata
    (enhancedBlueprint as any).cinematographyFrameworkV2 = {
      frameworkVersion: 'CinematographyEngineV2',
      confidence: framework.primaryRecommendation.confidence,
      
      // Story-Driven Philosophy
      storyFoundation: {
        motivatedChoices: framework.primaryRecommendation.storyDrivenApproach.motivatedChoices,
        narrativeSupport: framework.primaryRecommendation.storyDrivenApproach.narrativeSupport,
        emotionalTruth: framework.primaryRecommendation.storyDrivenApproach.emotionalTruth
      },
      
      // Camera Psychology
      cameraFramework: {
        focalLengthPsychology: framework.primaryRecommendation.cameraFramework.focalLengthPsychology,
        movementMotivation: framework.primaryRecommendation.cameraFramework.movementMotivation,
        compositionArchitecture: framework.primaryRecommendation.cameraFramework.compositionArchitecture
      },
      
      // Lighting Craft
      lightingDesign: {
        foundationalSetups: framework.primaryRecommendation.lightingCraft.foundationalSetups,
        lightTexture: framework.primaryRecommendation.lightingCraft.lightTexture,
        motivatedLighting: framework.primaryRecommendation.lightingCraft.motivatedLighting
      },
      
      // Genre Specialization
      genreFramework: {
        horrorVisuals: framework.primaryRecommendation.genreFramework.horrorVisuals,
        comedyTiming: framework.primaryRecommendation.genreFramework.comedyTiming,
        dramaIntimacy: framework.primaryRecommendation.genreFramework.dramaIntimacy,
        actionEnergy: framework.primaryRecommendation.genreFramework.actionEnergy
      },
      
      // Technical Pipeline
      technicalExecution: {
        digitalCapture: framework.primaryRecommendation.technicalPipeline.digitalCapture,
        colorWorkflow: framework.primaryRecommendation.technicalPipeline.colorWorkflow,
        hdrDelivery: framework.primaryRecommendation.technicalPipeline.hdrDelivery
      },
      
      // Strategic Guidance
      cinematographyStrategy: framework.cinematographyStrategy,
      implementationGuidance: framework.implementationGuidance
    };
    
    // Enhance shots with V2.0 camera psychology
    if (enhancedBlueprint.shotList) {
      enhancedBlueprint.shotList.forEach((shot: any) => {
        shot.frameworkGuidance = {
          cameraWork: framework.primaryRecommendation.cameraFramework,
          lightingApproach: framework.primaryRecommendation.lightingCraft,
          genreSpecialization: framework.primaryRecommendation.genreFramework
        };
      });
    }
    
    // Enhance lighting execution with V2.0 craft principles
    if ((enhancedBlueprint as any).lightingPlan) {
      ((enhancedBlueprint as any).lightingPlan as any).v2Enhancement = {
        foundationalSetups: framework.primaryRecommendation.lightingCraft.foundationalSetups,
        motivatedSources: framework.primaryRecommendation.lightingCraft.motivatedLighting,
        storySupport: framework.primaryRecommendation.storyDrivenApproach
      };
    }
    
    return enhancedBlueprint;
  }
}

export default CinematographyExecutionEngine;