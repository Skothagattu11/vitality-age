import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameWrapper } from '@/components/brain-age/GameWrapper';
import { GamePhase, ColorClashResult, ColorClashTrial, SkippedGame } from '@/types/brainAge';

const COLORS = ['red', 'blue', 'green', 'yellow'] as const;
type ColorName = typeof COLORS[number];

const COLOR_HEX: Record<ColorName, string> = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#22C55E',
  yellow: '#EAB308',
};

const COLOR_LABELS: Record<ColorName, string> = {
  red: 'Red',
  blue: 'Blue',
  green: 'Green',
  yellow: 'Yellow',
};

interface Stimulus {
  word: string;
  inkColor: ColorName;
  correctAnswer: ColorName; // always the ink color
  phase: 'congruent' | 'incongruent' | 'mixed';
}

function randomColor(): ColorName {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function randomColorExcept(exclude: ColorName): ColorName {
  const others = COLORS.filter(c => c !== exclude);
  return others[Math.floor(Math.random() * others.length)];
}

function generateStimuli(): Stimulus[] {
  const stimuli: Stimulus[] = [];

  // Phase A: 10 congruent (word matches ink) — fully randomized colors
  for (let i = 0; i < 10; i++) {
    const color = randomColor();
    stimuli.push({ word: COLOR_LABELS[color], inkColor: color, correctAnswer: color, phase: 'congruent' });
  }

  // Phase B: 20 incongruent (word differs from ink) — randomized ink + random mismatched word
  for (let i = 0; i < 20; i++) {
    const inkColor = randomColor();
    const wordColor = randomColorExcept(inkColor);
    stimuli.push({ word: COLOR_LABELS[wordColor], inkColor, correctAnswer: inkColor, phase: 'incongruent' });
  }

  // Phase C: 10 mixed (randomly congruent or incongruent) — randomized
  for (let i = 0; i < 10; i++) {
    const inkColor = randomColor();
    const congruent = Math.random() > 0.5;
    const wordColor = congruent ? inkColor : randomColorExcept(inkColor);
    stimuli.push({ word: COLOR_LABELS[wordColor], inkColor, correctAnswer: inkColor, phase: 'mixed' });
  }

  return stimuli;
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

interface ColorClashProps {
  onComplete: (result: ColorClashResult) => void;
  onSkip: (data: SkippedGame) => void;
  onBack: () => void;
}

export function ColorClash({ onComplete, onSkip, onBack }: ColorClashProps) {
  const [phase, setPhase] = useState<GamePhase>('instructions');
  const [stimuli] = useState(generateStimuli);
  const [trialIndex, setTrialIndex] = useState(0);
  const [trials, setTrials] = useState<ColorClashTrial[]>([]);
  const [showFeedback, setShowFeedback] = useState<boolean | null>(null);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [finalResult, setFinalResult] = useState<ColorClashResult | null>(null);

  const stimulusTimeRef = useRef(0);

  const currentStimulus = stimuli[trialIndex];
  const totalTrials = stimuli.length;

  useEffect(() => {
    if (phase === 'playing' && !waitingForNext) {
      stimulusTimeRef.current = performance.now();
    }
  }, [trialIndex, phase, waitingForNext]);

  const handleStart = useCallback(() => setPhase('countdown'), []);

  const handleCountdownComplete = useCallback(() => {
    setPhase('playing');
    setTrialIndex(0);
    setTrials([]);
    stimulusTimeRef.current = performance.now();
  }, []);

  const handleAnswer = useCallback((answer: ColorName) => {
    if (phase !== 'playing' || waitingForNext) return;

    const rt = performance.now() - stimulusTimeRef.current;
    const correct = answer === currentStimulus.correctAnswer;

    const trial: ColorClashTrial = {
      word: currentStimulus.word,
      inkColor: currentStimulus.inkColor,
      correctAnswer: currentStimulus.correctAnswer,
      userAnswer: answer,
      reactionTime: Math.round(rt),
      correct,
      phase: currentStimulus.phase,
    };

    const newTrials = [...trials, trial];
    setTrials(newTrials);
    setShowFeedback(correct);
    setWaitingForNext(true);

    setTimeout(() => {
      setShowFeedback(null);
      setWaitingForNext(false);

      const next = trialIndex + 1;
      if (next >= totalTrials) {
        // Calculate result
        const congruentRTs = newTrials.filter(t => t.phase === 'congruent' && t.correct).map(t => t.reactionTime);
        const incongruentRTs = newTrials.filter(t => t.phase === 'incongruent' && t.correct).map(t => t.reactionTime);
        const medCon = median(congruentRTs);
        const medIncon = median(incongruentRTs);
        const accuracy = newTrials.filter(t => t.correct).length / newTrials.length;

        const result: ColorClashResult = {
          trials: newTrials,
          medianCongruent: Math.round(medCon),
          medianIncongruent: Math.round(medIncon),
          interferenceScore: Math.round(medIncon - medCon),
          accuracy: Math.round(accuracy * 100) / 100,
        };
        setFinalResult(result);
        setPhase('review');
      } else {
        setTrialIndex(next);
      }
    }, 500);
  }, [phase, waitingForNext, currentStimulus, trials, trialIndex, totalTrials, onComplete]);

  // Phase label for display
  const phaseLabel = currentStimulus?.phase === 'congruent' ? 'Phase A'
    : currentStimulus?.phase === 'incongruent' ? 'Phase B'
    : 'Phase C';

  const accuracy = trials.length > 0
    ? Math.round((trials.filter(t => t.correct).length / trials.length) * 100)
    : 100;

  const interferenceScore = trials.length > 0
    ? (() => {
      const con = trials.filter(t => t.phase === 'congruent' && t.correct).map(t => t.reactionTime);
      const incon = trials.filter(t => t.phase === 'incongruent' && t.correct).map(t => t.reactionTime);
      if (con.length === 0 || incon.length === 0) return 0;
      return Math.round(median(incon) - median(con));
    })()
    : 0;

  return (
    <GameWrapper
      gameName="Color Clash"
      gameDescription="A Stroop test measuring your ability to override automatic responses."
      instructions={[
        'A color word will appear on screen written in a DIFFERENT ink color.',
        'Tap the button matching the INK COLOR, not the word text.',
        'For example: the word "Red" written in blue ink → tap Blue.',
        'Phase A = matching colors (warm-up), Phase B = mismatched, Phase C = mixed.',
      ]}
      phase={phase}
      onStart={handleStart}
      onBack={onBack}
      onSkip={onSkip}
      onCountdownComplete={handleCountdownComplete}
      reviewContent={
        <div className="space-y-3 text-center">
          <div className="text-4xl font-bold text-secondary">{interferenceScore} ms</div>
          <p className="text-sm text-muted-foreground">Interference score (lower is better)</p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground">{accuracy}%</span> accuracy
            </div>
            <div>
              <span className="font-semibold text-foreground">{totalTrials}</span> trials
            </div>
          </div>
        </div>
      }
      onContinue={() => { if (finalResult) onComplete(finalResult); }}
    >
      {/* Playing phase */}
      <div className="w-full max-w-md mx-auto space-y-6 select-none">
        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-medium">{phaseLabel}</span>
          <span>{trialIndex + 1} / {totalTrials}</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-secondary"
            animate={{ width: `${((trialIndex + 1) / totalTrials) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Stimulus */}
        <div className="flex items-center justify-center min-h-[120px] rounded-xl bg-card border border-border">
          {currentStimulus && !waitingForNext ? (
            <motion.span
              key={trialIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-5xl md:text-6xl font-black select-none"
              style={{ color: COLOR_HEX[currentStimulus.inkColor] }}
            >
              {currentStimulus.word}
            </motion.span>
          ) : showFeedback !== null ? (
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`text-2xl font-bold ${showFeedback ? 'text-green-500' : 'text-destructive'}`}
            >
              {showFeedback ? 'Correct!' : 'Wrong'}
            </motion.span>
          ) : null}
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-2 gap-3">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onPointerDown={() => handleAnswer(color)}
              disabled={waitingForNext}
              className="h-14 rounded-xl font-bold text-lg border-2 transition-all active:scale-95 touch-manipulation disabled:opacity-50"
              style={{
                backgroundColor: `${COLOR_HEX[color]}20`,
                borderColor: COLOR_HEX[color],
                color: COLOR_HEX[color],
              }}
              aria-label={`Select ${COLOR_LABELS[color]}`}
            >
              {COLOR_LABELS[color]}
            </button>
          ))}
        </div>
      </div>
    </GameWrapper>
  );
}
