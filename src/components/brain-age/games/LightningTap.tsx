import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameWrapper } from '@/components/brain-age/GameWrapper';
import { GamePhase, LightningTapResult, LightningTapTrial, SkippedGame } from '@/types/brainAge';

const TOTAL_ROUNDS = 10;
const MIN_DELAY = 1500;
const MAX_DELAY = 4000;
const PREMATURE_THRESHOLD = 100; // ms

function randomDelay() {
  return MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
}

function trimmedMean(times: number[]): number {
  if (times.length <= 4) return times.reduce((a, b) => a + b, 0) / times.length;
  const sorted = [...times].sort((a, b) => a - b);
  const trimmed = sorted.slice(2, sorted.length - 2);
  return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
}

function standardDeviation(times: number[]): number {
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const sq = times.map(t => (t - mean) ** 2);
  return Math.sqrt(sq.reduce((a, b) => a + b, 0) / times.length);
}

interface LightningTapProps {
  onComplete: (result: LightningTapResult) => void;
  onSkip: (data: SkippedGame) => void;
  onBack: () => void;
}

export function LightningTap({ onComplete, onSkip, onBack }: LightningTapProps) {
  const [phase, setPhase] = useState<GamePhase>('instructions');
  const [round, setRound] = useState(0);
  const [showTarget, setShowTarget] = useState(false);
  const [feedback, setFeedback] = useState<'none' | 'premature' | 'hit'>('none');
  const [trials, setTrials] = useState<LightningTapTrial[]>([]);
  const [paused, setPaused] = useState(false);
  const [finalResult, setFinalResult] = useState<LightningTapResult | null>(null);

  const stimulusTimeRef = useRef(0);
  const delayTimerRef = useRef<number>(0);
  const currentDelayRef = useRef(0);

  // Visibility change handler
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && phase === 'playing') {
        setPaused(true);
        clearTimeout(delayTimerRef.current);
        setShowTarget(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [phase]);

  const startRound = useCallback(() => {
    setShowTarget(false);
    setFeedback('none');
    const delay = randomDelay();
    currentDelayRef.current = delay;
    delayTimerRef.current = window.setTimeout(() => {
      stimulusTimeRef.current = performance.now();
      setShowTarget(true);
    }, delay);
  }, []);

  const handleStart = useCallback(() => setPhase('countdown'), []);

  const handleCountdownComplete = useCallback(() => {
    setPhase('playing');
    setRound(0);
    setTrials([]);
    // Start first round after brief delay
    setTimeout(startRound, 500);
  }, [startRound]);

  const handleTap = useCallback(() => {
    if (phase !== 'playing') return;

    if (paused) {
      setPaused(false);
      startRound();
      return;
    }

    const now = performance.now();

    if (!showTarget) {
      // Premature tap — before stimulus appeared
      clearTimeout(delayTimerRef.current);
      setFeedback('premature');
      // Retry same round after brief feedback
      setTimeout(() => {
        setFeedback('none');
        startRound();
      }, 800);
      return;
    }

    const rt = now - stimulusTimeRef.current;

    if (rt < PREMATURE_THRESHOLD) {
      // Anticipatory tap — too fast to be real reaction
      setFeedback('premature');
      setShowTarget(false);
      setTimeout(() => {
        setFeedback('none');
        startRound();
      }, 800);
      return;
    }

    // Valid tap
    const trial: LightningTapTrial = {
      delay: currentDelayRef.current,
      reactionTime: Math.round(rt),
      premature: false,
    };
    const newTrials = [...trials, trial];
    setTrials(newTrials);
    setShowTarget(false);
    setFeedback('hit');

    const nextRound = round + 1;
    if (nextRound >= TOTAL_ROUNDS) {
      // All rounds complete
      const validTimes = newTrials.filter(t => !t.premature).map(t => t.reactionTime);
      const result: LightningTapResult = {
        trials: newTrials,
        trimmedMean: Math.round(trimmedMean(validTimes)),
        standardDeviation: Math.round(standardDeviation(validTimes)),
      };
      setFinalResult(result);
      setTimeout(() => {
        setPhase('review');
      }, 400);
    } else {
      setRound(nextRound);
      setTimeout(startRound, 600);
    }
  }, [phase, paused, showTarget, trials, round, startRound, onComplete]);

  // Cleanup timers
  useEffect(() => {
    return () => clearTimeout(delayTimerRef.current);
  }, []);

  // Compute review data from completed trials
  const validTimes = trials.filter(t => !t.premature).map(t => t.reactionTime);
  const avgTime = validTimes.length > 0 ? Math.round(trimmedMean(validTimes)) : 0;

  return (
    <GameWrapper
      gameName="Lightning Tap"
      gameDescription="Test your processing speed by tapping a target as quickly as possible."
      instructions={[
        'A cyan circle will appear on screen after a random delay.',
        'Tap or click the circle as fast as you can.',
        'Don\'t tap before the circle appears — premature taps will retry.',
        '10 rounds total. Try to be fast AND consistent.',
      ]}
      phase={phase}
      onStart={handleStart}
      onBack={onBack}
      onSkip={onSkip}
      onCountdownComplete={handleCountdownComplete}
      reviewContent={
        <div className="space-y-3 text-center">
          <div className="text-4xl font-bold text-secondary">{avgTime} ms</div>
          <p className="text-sm text-muted-foreground">Average reaction time</p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground">{validTimes.length}</span> valid taps
            </div>
            <div>
              <span className="font-semibold text-foreground">
                {validTimes.length > 0 ? Math.round(standardDeviation(validTimes)) : 0} ms
              </span> variability
            </div>
          </div>
        </div>
      }
      onContinue={() => { if (finalResult) onComplete(finalResult); }}
    >
      {/* Playing phase content */}
      <div
        className="relative w-full aspect-square max-w-md mx-auto rounded-2xl border border-border bg-card overflow-hidden select-none touch-manipulation"
        onPointerDown={handleTap}
        role="button"
        tabIndex={0}
        aria-label="Tap area"
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-border">
          <motion.div
            className="h-full bg-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Round counter */}
        <div className="absolute top-3 right-4 text-sm font-medium text-muted-foreground">
          {round + 1} / {TOTAL_ROUNDS}
        </div>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {paused ? (
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">Paused</p>
              <p className="text-sm text-muted-foreground">Tap to resume</p>
            </div>
          ) : showTarget ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
              className="w-24 h-24 rounded-full bg-primary shadow-glow cursor-pointer"
              aria-label="Tap now!"
            />
          ) : feedback === 'premature' ? (
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-lg font-semibold text-destructive"
            >
              Too early! Wait for the circle.
            </motion.p>
          ) : feedback === 'hit' ? (
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-lg font-semibold text-primary"
            >
              {trials[trials.length - 1]?.reactionTime} ms
            </motion.p>
          ) : (
            <p className="text-muted-foreground text-sm">Wait for the circle...</p>
          )}
        </div>
      </div>
    </GameWrapper>
  );
}
