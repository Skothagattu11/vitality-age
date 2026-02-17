// ── Brain Age Profile ──────────────────────────

export type CaffeineStatus = 'none' | 'light' | 'moderate' | 'heavy';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface BrainAgeProfile {
  age: number;
  sleepHours: number;
  caffeineStatus: CaffeineStatus;
  timeOfDay: TimeOfDay;
}

// ── Game Phase ─────────────────────────────────

export type GamePhase = 'instructions' | 'countdown' | 'playing' | 'review';

// ── Skip ───────────────────────────────────────

export type GameSkipReason = 'too-difficult' | 'accessibility' | 'other';

export interface SkippedGame {
  reason: GameSkipReason;
  details?: string;
}

// ── Lightning Tap (Processing Speed) ───────────

export interface LightningTapTrial {
  delay: number;        // ms before stimulus appeared
  reactionTime: number; // ms from stimulus to tap
  premature: boolean;   // tapped before stimulus or < 100ms
}

export interface LightningTapResult {
  trials: LightningTapTrial[];
  trimmedMean: number;  // ms, after discarding 3 fastest + 3 slowest
  standardDeviation: number;
}

// ── Color Clash (Executive Function / Stroop) ──

export interface ColorClashTrial {
  word: string;
  inkColor: string;
  correctAnswer: string;
  userAnswer: string;
  reactionTime: number;
  correct: boolean;
  phase: 'congruent' | 'incongruent' | 'mixed';
}

export interface ColorClashResult {
  trials: ColorClashTrial[];
  medianCongruent: number;    // median RT for phase A
  medianIncongruent: number;  // median RT for phase B
  interferenceScore: number;  // medianIncongruent - medianCongruent
  accuracy: number;           // 0-1
}

// ── Memory Matrix (Working Memory) ─────────────

export interface MemoryMatrixResult {
  forwardSpan: number;   // max sequence length recalled forward
  backwardSpan: number;  // max sequence length recalled backward
  weightedScore: number; // forwardSpan * 1.0 + backwardSpan * 1.5
}

// ── Focus Filter (Attention / Go-NoGo) ─────────

export interface FocusFilterTrial {
  stimulusType: 'go' | 'no-go' | 'distractor';
  responded: boolean;
  reactionTime: number; // ms, 0 if no response
  correct: boolean;
}

export interface FocusFilterResult {
  trials: FocusFilterTrial[];
  commissionErrors: number; // tapped on no-go
  omissionErrors: number;   // missed a go
  score: number;            // 0-100 composite
  vigilanceDecrement: number; // RT difference: last 20 vs first 20
}

// ── Trail Switch (Cognitive Flexibility) ────────

export interface TrailSwitchResult {
  partATime: number;    // ms to complete Part A
  partBTime: number;    // ms to complete Part B
  partBErrors: number;  // wrong taps in Part B
  baDifference: number; // partBTime - partATime + (partBErrors * 3000)
}

// ── Composite Result ───────────────────────────

export type BrainDomainTag =
  | 'Processing Speed'
  | 'Executive Function'
  | 'Working Memory'
  | 'Attention'
  | 'Cognitive Flexibility';

export interface DomainScore {
  domain: BrainDomainTag;
  percentile: number; // 0-100
  ageOffset: number;  // years
  weight: number;     // 0-1
}

export interface BrainAgeResult {
  brainAge: number;
  chronologicalAge: number;
  gap: number; // positive = older brain, negative = younger
  domainScores: DomainScore[];
  topDrivers: {
    tag: BrainDomainTag;
    impact: 'positive' | 'negative' | 'neutral';
    suggestion: string;
  }[];
  contextualNote?: string; // sleep/caffeine warning
}

// ── Main State ─────────────────────────────────

export interface BrainAgeData {
  profile: BrainAgeProfile | null;
  lightningTap: LightningTapResult | SkippedGame | null;
  colorClash: ColorClashResult | SkippedGame | null;
  memoryMatrix: MemoryMatrixResult | SkippedGame | null;
  focusFilter: FocusFilterResult | SkippedGame | null;
  trailSwitch: TrailSwitchResult | SkippedGame | null;
  currentStep: number;
  completedAt?: string;
}

export const BRAIN_AGE_TOTAL_STEPS = 8;
// Step 0: Landing
// Step 1: Setup
// Step 2: Lightning Tap
// Step 3: Color Clash
// Step 4: Memory Matrix
// Step 5: Focus Filter
// Step 6: Trail Switch
// Step 7: Results
