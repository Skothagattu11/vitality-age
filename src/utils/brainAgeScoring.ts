import {
  BrainAgeData,
  BrainAgeResult,
  BrainDomainTag,
  DomainScore,
  LightningTapResult,
  ColorClashResult,
  MemoryMatrixResult,
  FocusFilterResult,
  TrailSwitchResult,
  SkippedGame,
} from '@/types/brainAge';

// ── Helpers ────────────────────────────────────

function isSkipped(result: unknown): result is SkippedGame {
  return result !== null && typeof result === 'object' && 'reason' in result;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// ── Age-bracket norm tables ────────────────────
// Each table maps an age bracket to [excellent, good, average, poor] thresholds.
// Metric below "excellent" → younger offset, above "poor" → older offset.

interface NormBracket {
  excellent: number;
  good: number;
  average: number;
  poor: number;
}

function getBracket(age: number): '18-29' | '30-39' | '40-49' | '50-59' | '60-69' | '70+' {
  if (age < 30) return '18-29';
  if (age < 40) return '30-39';
  if (age < 50) return '40-49';
  if (age < 60) return '50-59';
  if (age < 70) return '60-69';
  return '70+';
}

// Lightning Tap: trimmed mean RT in ms (lower = better)
const LIGHTNING_TAP_NORMS: Record<string, NormBracket> = {
  '18-29': { excellent: 220, good: 260, average: 300, poor: 370 },
  '30-39': { excellent: 240, good: 280, average: 320, poor: 390 },
  '40-49': { excellent: 260, good: 300, average: 350, poor: 420 },
  '50-59': { excellent: 280, good: 330, average: 380, poor: 460 },
  '60-69': { excellent: 310, good: 360, average: 420, poor: 510 },
  '70+':   { excellent: 340, good: 400, average: 470, poor: 570 },
};

// Color Clash: interference score in ms (lower = better)
const COLOR_CLASH_NORMS: Record<string, NormBracket> = {
  '18-29': { excellent: 40,  good: 80,  average: 130, poor: 200 },
  '30-39': { excellent: 50,  good: 100, average: 150, poor: 230 },
  '40-49': { excellent: 60,  good: 110, average: 170, poor: 260 },
  '50-59': { excellent: 80,  good: 130, average: 200, poor: 300 },
  '60-69': { excellent: 100, good: 160, average: 240, poor: 350 },
  '70+':   { excellent: 120, good: 190, average: 280, poor: 400 },
};

// Memory Matrix: weighted score (higher = better)
const MEMORY_MATRIX_NORMS: Record<string, NormBracket> = {
  '18-29': { excellent: 11, good: 9,   average: 7,   poor: 5 },
  '30-39': { excellent: 10, good: 8.5, average: 6.5, poor: 4.5 },
  '40-49': { excellent: 9.5, good: 8,  average: 6,   poor: 4 },
  '50-59': { excellent: 9,  good: 7,   average: 5.5, poor: 3.5 },
  '60-69': { excellent: 8,  good: 6.5, average: 5,   poor: 3 },
  '70+':   { excellent: 7,  good: 5.5, average: 4,   poor: 2.5 },
};

// Focus Filter: composite score 0-100 (higher = better)
const FOCUS_FILTER_NORMS: Record<string, NormBracket> = {
  '18-29': { excellent: 90, good: 80, average: 65, poor: 45 },
  '30-39': { excellent: 88, good: 77, average: 62, poor: 42 },
  '40-49': { excellent: 85, good: 73, average: 58, poor: 38 },
  '50-59': { excellent: 80, good: 68, average: 53, poor: 33 },
  '60-69': { excellent: 75, good: 62, average: 47, poor: 28 },
  '70+':   { excellent: 68, good: 55, average: 40, poor: 22 },
};

// Trail Switch: B-A difference in ms (lower = better)
const TRAIL_SWITCH_NORMS: Record<string, NormBracket> = {
  '18-29': { excellent: 4000,  good: 8000,  average: 14000, poor: 22000 },
  '30-39': { excellent: 5000,  good: 10000, average: 16000, poor: 25000 },
  '40-49': { excellent: 6000,  good: 12000, average: 19000, poor: 29000 },
  '50-59': { excellent: 8000,  good: 15000, average: 23000, poor: 35000 },
  '60-69': { excellent: 10000, good: 18000, average: 28000, poor: 42000 },
  '70+':   { excellent: 13000, good: 22000, average: 34000, poor: 50000 },
};

// ── Per-game scoring ───────────────────────────

/**
 * Score a "lower is better" metric against norm bracket.
 * Returns age offset: negative = younger, positive = older.
 */
function scoreLowerIsBetter(value: number, norms: NormBracket): { offset: number; percentile: number } {
  if (value <= norms.excellent) return { offset: -4, percentile: 90 };
  if (value <= norms.good)      return { offset: -2, percentile: 72 };
  if (value <= norms.average)   return { offset: 0,  percentile: 50 };
  if (value <= norms.poor)      return { offset: 3,  percentile: 28 };
  return { offset: 5, percentile: 10 };
}

/**
 * Score a "higher is better" metric against norm bracket.
 */
function scoreHigherIsBetter(value: number, norms: NormBracket): { offset: number; percentile: number } {
  if (value >= norms.excellent) return { offset: -4, percentile: 90 };
  if (value >= norms.good)      return { offset: -2, percentile: 72 };
  if (value >= norms.average)   return { offset: 0,  percentile: 50 };
  if (value >= norms.poor)      return { offset: 3,  percentile: 28 };
  return { offset: 5, percentile: 10 };
}

function scoreLightningTap(result: LightningTapResult, age: number): DomainScore {
  const bracket = getBracket(age);
  const norms = LIGHTNING_TAP_NORMS[bracket];
  const { offset, percentile } = scoreLowerIsBetter(result.trimmedMean, norms);

  // SD consistency modifier: high variability adds penalty
  const sdPenalty = result.standardDeviation > 100 ? 1 : result.standardDeviation > 70 ? 0.5 : 0;

  return {
    domain: 'Processing Speed',
    percentile,
    ageOffset: offset + sdPenalty,
    weight: 0.20,
  };
}

function scoreColorClash(result: ColorClashResult, age: number): DomainScore {
  const bracket = getBracket(age);
  const norms = COLOR_CLASH_NORMS[bracket];
  const { offset, percentile } = scoreLowerIsBetter(result.interferenceScore, norms);

  // Accuracy modifier: below 80% accuracy adds penalty
  const accPenalty = result.accuracy < 0.8 ? 2 : result.accuracy < 0.9 ? 1 : 0;

  return {
    domain: 'Executive Function',
    percentile,
    ageOffset: offset + accPenalty,
    weight: 0.25,
  };
}

function scoreMemoryMatrix(result: MemoryMatrixResult, age: number): DomainScore {
  const bracket = getBracket(age);
  const norms = MEMORY_MATRIX_NORMS[bracket];
  const { offset, percentile } = scoreHigherIsBetter(result.weightedScore, norms);

  return {
    domain: 'Working Memory',
    percentile,
    ageOffset: offset,
    weight: 0.25,
  };
}

function scoreFocusFilter(result: FocusFilterResult, age: number): DomainScore {
  const bracket = getBracket(age);
  const norms = FOCUS_FILTER_NORMS[bracket];
  const { offset, percentile } = scoreHigherIsBetter(result.score, norms);

  // Vigilance decrement modifier: large decrement adds penalty
  const vigPenalty = result.vigilanceDecrement > 80 ? 1 : result.vigilanceDecrement > 50 ? 0.5 : 0;

  return {
    domain: 'Attention',
    percentile,
    ageOffset: offset + vigPenalty,
    weight: 0.15,
  };
}

function scoreTrailSwitch(result: TrailSwitchResult, age: number): DomainScore {
  const bracket = getBracket(age);
  const norms = TRAIL_SWITCH_NORMS[bracket];
  const { offset, percentile } = scoreLowerIsBetter(result.baDifference, norms);

  // Error penalty already baked into baDifference (+3000ms per error)
  return {
    domain: 'Cognitive Flexibility',
    percentile,
    ageOffset: offset,
    weight: 0.15,
  };
}

// ── Suggestions per domain ─────────────────────

const domainSuggestions: Record<BrainDomainTag, { positive: string; negative: string }> = {
  'Processing Speed': {
    positive: 'Sharp reflexes! Regular aerobic exercise helps maintain processing speed.',
    negative: 'Try reaction-time games and aerobic exercise to boost processing speed.',
  },
  'Executive Function': {
    positive: 'Strong cognitive control. Keep challenging yourself with complex tasks.',
    negative: 'Practice mindfulness and puzzles that require ignoring distractions.',
  },
  'Working Memory': {
    positive: 'Excellent working memory. Mental math and strategy games are keeping you sharp.',
    negative: 'Try memory exercises like n-back training and reduce multitasking.',
  },
  'Attention': {
    positive: 'Great sustained focus. Your attention stamina is above average.',
    negative: 'Practice focused single-tasking sessions and consider mindfulness meditation.',
  },
  'Cognitive Flexibility': {
    positive: 'Nimble mental switching. Keep engaging in diverse cognitive activities.',
    negative: 'Practice task-switching exercises and learn new skills to improve flexibility.',
  },
};

// ── Main scoring function ──────────────────────

const SKIP_PENALTY = 3; // +3 years per skipped game

export function calculateBrainAgeResults(data: BrainAgeData): BrainAgeResult | null {
  if (!data.profile) return null;

  const { age } = data.profile;
  const domainScores: DomainScore[] = [];

  // Lightning Tap
  if (data.lightningTap && !isSkipped(data.lightningTap)) {
    domainScores.push(scoreLightningTap(data.lightningTap as LightningTapResult, age));
  } else {
    domainScores.push({ domain: 'Processing Speed', percentile: 35, ageOffset: SKIP_PENALTY, weight: 0.20 });
  }

  // Color Clash
  if (data.colorClash && !isSkipped(data.colorClash)) {
    domainScores.push(scoreColorClash(data.colorClash as ColorClashResult, age));
  } else {
    domainScores.push({ domain: 'Executive Function', percentile: 35, ageOffset: SKIP_PENALTY, weight: 0.25 });
  }

  // Memory Matrix
  if (data.memoryMatrix && !isSkipped(data.memoryMatrix)) {
    domainScores.push(scoreMemoryMatrix(data.memoryMatrix as MemoryMatrixResult, age));
  } else {
    domainScores.push({ domain: 'Working Memory', percentile: 35, ageOffset: SKIP_PENALTY, weight: 0.25 });
  }

  // Focus Filter
  if (data.focusFilter && !isSkipped(data.focusFilter)) {
    domainScores.push(scoreFocusFilter(data.focusFilter as FocusFilterResult, age));
  } else {
    domainScores.push({ domain: 'Attention', percentile: 35, ageOffset: SKIP_PENALTY, weight: 0.15 });
  }

  // Trail Switch
  if (data.trailSwitch && !isSkipped(data.trailSwitch)) {
    domainScores.push(scoreTrailSwitch(data.trailSwitch as TrailSwitchResult, age));
  } else {
    domainScores.push({ domain: 'Cognitive Flexibility', percentile: 35, ageOffset: SKIP_PENALTY, weight: 0.15 });
  }

  // Weighted composite
  const weightedOffset = domainScores.reduce((sum, d) => sum + d.ageOffset * d.weight, 0);
  // Normalize: sum of weights = 1, so weightedOffset is already the composite
  const totalOffset = weightedOffset / domainScores.reduce((sum, d) => sum + d.weight, 0);

  const brainAge = clamp(Math.round(age + totalOffset), 18, 100);
  const gap = brainAge - age;

  // Top 3 drivers sorted by absolute offset magnitude
  const sortedDomains = [...domainScores]
    .sort((a, b) => Math.abs(b.ageOffset) - Math.abs(a.ageOffset))
    .slice(0, 3);

  const topDrivers = sortedDomains.map(d => ({
    tag: d.domain,
    impact: d.ageOffset > 0 ? 'negative' as const : d.ageOffset < 0 ? 'positive' as const : 'neutral' as const,
    suggestion: d.ageOffset > 0
      ? domainSuggestions[d.domain].negative
      : domainSuggestions[d.domain].positive,
  }));

  // Contextual note for sleep/caffeine
  let contextualNote: string | undefined;
  if (data.profile.sleepHours < 6) {
    contextualNote = 'You reported less than 6 hours of sleep. Sleep deprivation can temporarily reduce cognitive performance by 10-25%. Consider retaking after a good night\'s rest for a more accurate baseline.';
  } else if (data.profile.caffeineStatus === 'heavy') {
    contextualNote = 'Heavy caffeine intake can affect reaction time variability. Your scores may not reflect your typical baseline.';
  }

  return {
    brainAge,
    chronologicalAge: age,
    gap,
    domainScores,
    topDrivers,
    contextualNote,
  };
}
