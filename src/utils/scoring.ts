import {
  AssessmentData,
  AssessmentResult,
  DriverTag,
  SitToStandResult,
  WallSitResult,
  BalanceResult,
  MarchRecoveryResult,
  SkippedStep,
} from '@/types/assessment';

// Helper to check if result is skipped
function isSkipped(result: unknown): result is SkippedStep {
  return result !== null && typeof result === 'object' && 'reason' in result;
}

// Scoring weights and mappings
const SCORING = {
  sitToStand: {
    // Reps mapping to age offset (higher reps = younger)
    reps: (reps: number, age: number): number => {
      // Age-adjusted expectations
      const expected = age < 40 ? 20 : age < 50 ? 17 : age < 60 ? 15 : age < 70 ? 12 : 10;
      const diff = reps - expected;
      if (diff >= 5) return -3;
      if (diff >= 2) return -1;
      if (diff >= -2) return 0;
      if (diff >= -5) return 2;
      return 4;
    },
    exertion: (exertion: number): number => {
      if (exertion <= 3) return -1;
      if (exertion <= 5) return 0;
      if (exertion <= 7) return 1;
      return 2;
    },
  },
  wallSit: {
    duration: {
      '<30s': 4,
      '30-60s': 2,
      '60-120s': 0,
      '2-3m': -2,
      '3m+': -4,
    },
    stopReason: {
      'muscle-pain': 0, // Expected
      'breathlessness': 1,
      'joint-discomfort': 2,
      'mental-discomfort': -1,
    },
  },
  balance: {
    duration: {
      '<10s': 5,
      '10-20s': 3,
      '20-40s': 1,
      '40-60s': -1,
      '60s+': -3,
    },
    endReason: {
      'ankle-wobble': 1,
      'hip-instability': 2,
      'loss-of-focus': 0,
      'stopped-intentionally': -1,
    },
  },
  marchRecovery: {
    breathingDifficulty: (val: number): number => {
      if (val <= 3) return -2;
      if (val <= 5) return 0;
      if (val <= 7) return 2;
      return 4;
    },
    recoveryTime: {
      '<30s': -3,
      '30-60s': -1,
      '1-2m': 1,
      '>2m': 3,
    },
    noseBreathing: (val: number): number => {
      if (val >= 8) return -2;
      if (val >= 5) return 0;
      if (val >= 3) return 1;
      return 2;
    },
  },
  overheadReach: {
    'yes-easily': -2,
    'yes-with-effort': 0,
    'compensate': 2,
    'discomfort': 3,
  },
  crossLegged: {
    'yes-relaxed': -2,
    'yes-stiff': 1,
    'only-briefly': 2,
    'not-at-all': 4,
  },
  integration: {
    energy: {
      'energized': -2,
      'neutral': 0,
      'slightly-drained': 1,
      'very-drained': 3,
    },
    coordination: {
      'coordinated': -2,
      'functional-but-stiff': 0,
      'disconnected': 2,
      'fragile': 4,
    },
  },
  recoveryContext: {
    morningStiffness: {
      'none': -2,
      '<5m': 0,
      '5-15m': 2,
      '>15m': 4,
    },
    postWorkoutSoreness: {
      '<24h': -2,
      '1-2d': 0,
      '3+d': 3,
      'avoid-workouts': 4,
    },
  },
};

interface DriverScore {
  tag: DriverTag;
  score: number;
  maxPossible: number;
}

export function calculateResults(data: AssessmentData): AssessmentResult | null {
  if (!data.userProfile) return null;

  const { chronologicalAge } = data.userProfile;
  let totalOffset = 0;
  const driverScores: DriverScore[] = [];

  // Sit-to-Stand (Lower-body capacity)
  let lowerBodyScore = 0;
  const lowerBodyMax = 8;
  if (data.sitToStand && !isSkipped(data.sitToStand)) {
    const sts = data.sitToStand as SitToStandResult;
    const repsOffset = SCORING.sitToStand.reps(sts.reps, chronologicalAge);
    const exertionOffset = SCORING.sitToStand.exertion(sts.perceivedExertion);
    lowerBodyScore = repsOffset + exertionOffset;
    totalOffset += lowerBodyScore;
  } else if (isSkipped(data.sitToStand)) {
    lowerBodyScore = 3; // Penalty for skipping
    totalOffset += lowerBodyScore;
  }
  driverScores.push({ tag: 'Lower-body capacity', score: lowerBodyScore, maxPossible: lowerBodyMax });

  // Wall Sit (Lower-body + Mental)
  let wallSitScore = 0;
  if (data.wallSit && !isSkipped(data.wallSit)) {
    const ws = data.wallSit as WallSitResult;
    wallSitScore = SCORING.wallSit.duration[ws.duration] + SCORING.wallSit.stopReason[ws.stopReason];
    totalOffset += wallSitScore;
  } else if (isSkipped(data.wallSit)) {
    wallSitScore = 3;
    totalOffset += wallSitScore;
  }

  // Balance (Balance/coordination)
  let balanceScore = 0;
  const balanceMax = 8;
  if (data.balance && !isSkipped(data.balance)) {
    const bal = data.balance as BalanceResult;
    balanceScore = SCORING.balance.duration[bal.bestTime] + SCORING.balance.endReason[bal.endReason];
    totalOffset += balanceScore;
  } else if (isSkipped(data.balance)) {
    balanceScore = 4;
    totalOffset += balanceScore;
  }
  driverScores.push({ tag: 'Balance/coordination', score: balanceScore, maxPossible: balanceMax });

  // March + Recovery (Cardiovascular + Recovery)
  let cardioScore = 0;
  let recoverySpeedScore = 0;
  const cardioMax = 6;
  const recoveryMax = 6;
  if (data.marchRecovery && !isSkipped(data.marchRecovery)) {
    const mr = data.marchRecovery as MarchRecoveryResult;
    cardioScore = SCORING.marchRecovery.breathingDifficulty(mr.breathingDifficulty);
    recoverySpeedScore = SCORING.marchRecovery.recoveryTime[mr.recoveryTime] + 
                         SCORING.marchRecovery.noseBreathing(mr.noseBreathingComfort);
    totalOffset += cardioScore + recoverySpeedScore;
  } else if (isSkipped(data.marchRecovery)) {
    cardioScore = 3;
    recoverySpeedScore = 3;
    totalOffset += cardioScore + recoverySpeedScore;
  }
  driverScores.push({ tag: 'Cardiovascular fitness', score: cardioScore, maxPossible: cardioMax });
  driverScores.push({ tag: 'Recovery speed', score: recoverySpeedScore, maxPossible: recoveryMax });

  // Mobility
  let mobilityScore = 0;
  const mobilityMax = 8;
  if (data.overheadReach && !isSkipped(data.overheadReach)) {
    mobilityScore += SCORING.overheadReach[data.overheadReach as keyof typeof SCORING.overheadReach];
  }
  if (data.crossLegged && !isSkipped(data.crossLegged)) {
    mobilityScore += SCORING.crossLegged[data.crossLegged as keyof typeof SCORING.crossLegged];
  }
  totalOffset += mobilityScore;
  driverScores.push({ tag: 'Mobility', score: mobilityScore, maxPossible: mobilityMax });

  // Integration
  let integrationScore = 0;
  if (data.integration) {
    integrationScore = SCORING.integration.energy[data.integration.energyLevel] +
                       SCORING.integration.coordination[data.integration.coordinationLevel];
    totalOffset += integrationScore;
  }

  // Recovery Context
  let contextScore = 0;
  if (data.recoveryContext) {
    contextScore = SCORING.recoveryContext.morningStiffness[data.recoveryContext.morningStiffness] +
                   SCORING.recoveryContext.postWorkoutSoreness[data.recoveryContext.postWorkoutSoreness];
    totalOffset += contextScore;
  }

  // Fitness level adjustment
  const fitnessAdjustment = {
    beginner: 2,
    intermediate: 0,
    advanced: -2,
  };
  totalOffset += fitnessAdjustment[data.userProfile.fitnessLevel];

  // Calculate functional age
  const functionalAge = Math.round(chronologicalAge + totalOffset);
  const gap = functionalAge - chronologicalAge;

  // Determine top 3 drivers
  const sortedDrivers = driverScores
    .map(d => ({
      ...d,
      normalizedScore: d.score / d.maxPossible,
    }))
    .sort((a, b) => Math.abs(b.normalizedScore) - Math.abs(a.normalizedScore))
    .slice(0, 3);

  const driverSuggestions: Record<DriverTag, { positive: string; negative: string }> = {
    'Recovery speed': {
      positive: 'Your recovery is excellent. Keep prioritizing sleep and down-regulation.',
      negative: 'Focus on down-regulation practices like breathing exercises and quality sleep.',
    },
    'Balance/coordination': {
      positive: 'Great proprioception! Single-leg exercises are working well.',
      negative: 'Practice single-leg stands and add balance challenges to your routine.',
    },
    'Lower-body capacity': {
      positive: 'Strong lower body foundation. Maintain with regular strength work.',
      negative: 'Add bodyweight squats and lunges to build lower-body strength.',
    },
    'Mobility': {
      positive: 'Excellent mobility. Your movement practice is paying off.',
      negative: 'Incorporate daily stretching and mobility flows, especially for hips and shoulders.',
    },
    'Cardiovascular fitness': {
      positive: 'Great aerobic base. Keep up the consistent movement.',
      negative: 'Build aerobic capacity with walking, cycling, or swimming at conversational pace.',
    },
    'Mental resilience': {
      positive: 'Strong mental fortitude during challenging exercises.',
      negative: 'Practice staying present during discomfort with breath-focused exercises.',
    },
    'Joint health': {
      positive: 'Joints seem healthy and pain-free.',
      negative: 'Consider joint-friendly movements and consult a professional if discomfort persists.',
    },
  };

  const topDrivers = sortedDrivers.map(d => ({
    tag: d.tag,
    impact: d.score > 0 ? 'negative' as const : d.score < 0 ? 'positive' as const : 'neutral' as const,
    suggestion: d.score > 0 
      ? driverSuggestions[d.tag].negative 
      : driverSuggestions[d.tag].positive,
  }));

  return {
    functionalAge: Math.max(18, Math.min(100, functionalAge)),
    chronologicalAge,
    gap,
    topDrivers,
  };
}

export function exportResults(data: AssessmentData, result: AssessmentResult): string {
  return JSON.stringify({
    assessment: {
      date: new Date().toISOString(),
      profile: data.userProfile,
      results: {
        sitToStand: data.sitToStand,
        wallSit: data.wallSit,
        balance: data.balance,
        marchRecovery: data.marchRecovery,
        overheadReach: data.overheadReach,
        crossLegged: data.crossLegged,
        integration: data.integration,
        recoveryContext: data.recoveryContext,
      },
    },
    scores: {
      functionalAge: result.functionalAge,
      chronologicalAge: result.chronologicalAge,
      gap: result.gap,
      topDrivers: result.topDrivers,
    },
  }, null, 2);
}
