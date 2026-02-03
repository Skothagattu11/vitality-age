export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type Sex = 'male' | 'female' | 'prefer-not-to-say';
export type InjuryArea = 'knees' | 'hips' | 'back' | 'shoulders' | 'none';

export interface UserProfile {
  chronologicalAge: number;
  sex?: Sex;
  fitnessLevel: FitnessLevel;
  injuries: InjuryArea[];
  hasEquipment: boolean;
}

// Sit-to-Stand
export interface SitToStandResult {
  reps: number;
  perceivedExertion: number; // 0-10
}

// Wall Sit
export type WallSitDuration = '<30s' | '30-60s' | '60-120s' | '2-3m' | '3m+';
export type WallSitStopReason = 'muscle-pain' | 'breathlessness' | 'joint-discomfort' | 'mental-discomfort';

export interface WallSitResult {
  duration: WallSitDuration;
  stopReason: WallSitStopReason;
}

// Balance
export type BalanceDuration = '<10s' | '10-20s' | '20-40s' | '40-60s' | '60s+';
export type BalanceEndReason = 'ankle-wobble' | 'hip-instability' | 'loss-of-focus' | 'stopped-intentionally';

export interface BalanceResult {
  bestTime: BalanceDuration;
  endReason: BalanceEndReason;
}

// March + Recovery
export type RecoveryTime = '<30s' | '30-60s' | '1-2m' | '>2m';

export interface MarchRecoveryResult {
  breathingDifficulty: number; // 0-10
  recoveryTime: RecoveryTime;
  noseBreathingComfort: number; // 0-10
}

// Mobility - Overhead
export type OverheadReachResult = 'yes-easily' | 'yes-with-effort' | 'compensate' | 'discomfort';

// Mobility - Cross-legged
export type CrossLeggedResult = 'yes-relaxed' | 'yes-stiff' | 'only-briefly' | 'not-at-all';

// Integration
export type EnergyLevel = 'energized' | 'neutral' | 'slightly-drained' | 'very-drained';
export type CoordinationLevel = 'coordinated' | 'functional-but-stiff' | 'disconnected' | 'fragile';

export interface IntegrationResult {
  energyLevel: EnergyLevel;
  coordinationLevel: CoordinationLevel;
}

// Recovery Context
export type MorningStiffness = 'none' | '<5m' | '5-15m' | '>15m';
export type PostWorkoutSoreness = '<24h' | '1-2d' | '3+d' | 'avoid-workouts';

export interface RecoveryContextResult {
  morningStiffness: MorningStiffness;
  postWorkoutSoreness: PostWorkoutSoreness;
}

// Skip reason
export type SkipReason = 'pain' | 'no-space' | 'other';

export interface SkippedStep {
  reason: SkipReason;
  details?: string;
}

// Full assessment data
export interface AssessmentData {
  userProfile: UserProfile | null;
  sitToStand: SitToStandResult | SkippedStep | null;
  wallSit: WallSitResult | SkippedStep | null;
  balance: BalanceResult | SkippedStep | null;
  marchRecovery: MarchRecoveryResult | SkippedStep | null;
  overheadReach: OverheadReachResult | SkippedStep | null;
  crossLegged: CrossLeggedResult | SkippedStep | null;
  integration: IntegrationResult | null;
  recoveryContext: RecoveryContextResult | null;
  currentStep: number;
  completedAt?: string;
}

export type DriverTag = 
  | 'Recovery speed'
  | 'Balance/coordination'
  | 'Lower-body capacity'
  | 'Mobility'
  | 'Cardiovascular fitness'
  | 'Mental resilience'
  | 'Joint health';

export interface AssessmentResult {
  functionalAge: number;
  chronologicalAge: number;
  gap: number; // positive = older, negative = younger
  topDrivers: {
    tag: DriverTag;
    impact: 'positive' | 'negative' | 'neutral';
    suggestion: string;
  }[];
}

export const TOTAL_STEPS = 11; // Landing + Setup + 8 tests + Results
