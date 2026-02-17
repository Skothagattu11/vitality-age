import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameWrapper } from '@/components/brain-age/GameWrapper';
import { GamePhase, FocusFilterResult, FocusFilterTrial, SkippedGame } from '@/types/brainAge';

const TOTAL_TRIALS = 60;
const DISPLAY_TIME = 800;  // ms stimulus shown
const ISI = 500;           // inter-stimulus interval

type StimulusType = 'go' | 'no-go' | 'distractor';

interface Stimulus {
  type: StimulusType;
  shape: 'circle' | 'square';
  color: string;
  label: string;
}

function generateStimuli(): Stimulus[] {
  const stimuli: Stimulus[] = [];
  for (let i = 0; i < TOTAL_TRIALS; i++) {
    const rand = Math.random();
    if (rand < 0.60) {
      stimuli.push({ type: 'go', shape: 'circle', color: '#22C55E', label: 'Green circle — TAP' });
    } else if (rand < 0.85) {
      stimuli.push({ type: 'no-go', shape: 'circle', color: '#EF4444', label: 'Red circle — DON\'T TAP' });
    } else {
      if (Math.random() > 0.5) {
        stimuli.push({ type: 'distractor', shape: 'square', color: '#EF4444', label: 'Red square — DON\'T TAP' });
      } else {
        stimuli.push({ type: 'distractor', shape: 'circle', color: '#3B82F6', label: 'Blue circle — DON\'T TAP' });
      }
    }
  }
  return stimuli;
}

function computeResults(allTrials: FocusFilterTrial[]): FocusFilterResult {
  const goTrials = allTrials.filter(t => t.stimulusType === 'go');
  const noGoTrials = allTrials.filter(t => t.stimulusType === 'no-go');

  const commissionErrors = noGoTrials.filter(t => t.responded).length +
    allTrials.filter(t => t.stimulusType === 'distractor' && t.responded).length;
  const omissionErrors = goTrials.filter(t => !t.responded).length;

  const goRTs = goTrials.filter(t => t.responded && t.reactionTime > 0).map(t => t.reactionTime);
  const meanGoRT = goRTs.length > 0 ? goRTs.reduce((a, b) => a + b, 0) / goRTs.length : 500;
  const rtPenalty = Math.min(15, Math.max(0, (meanGoRT - 300) / 30));

  const score = Math.max(0, Math.min(100,
    100 - (8 * commissionErrors) - (5 * omissionErrors) - rtPenalty
  ));

  const first20Go = goTrials.slice(0, 20).filter(t => t.responded).map(t => t.reactionTime);
  const last20Go = goTrials.slice(-20).filter(t => t.responded).map(t => t.reactionTime);
  const meanFirst = first20Go.length > 0 ? first20Go.reduce((a, b) => a + b, 0) / first20Go.length : 0;
  const meanLast = last20Go.length > 0 ? last20Go.reduce((a, b) => a + b, 0) / last20Go.length : 0;

  return {
    trials: allTrials,
    commissionErrors,
    omissionErrors,
    score: Math.round(score),
    vigilanceDecrement: Math.round(meanLast - meanFirst),
  };
}

interface FocusFilterProps {
  onComplete: (result: FocusFilterResult) => void;
  onSkip: (data: SkippedGame) => void;
  onBack: () => void;
}

export function FocusFilter({ onComplete, onSkip, onBack }: FocusFilterProps) {
  const [phase, setPhase] = useState<GamePhase>('instructions');
  const [stimuli] = useState(generateStimuli);
  const [trialIndex, setTrialIndex] = useState(0);
  const [trials, setTrials] = useState<FocusFilterTrial[]>([]);
  const [showStimulus, setShowStimulus] = useState(false);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<FocusFilterResult | null>(null);

  const stimulusTimeRef = useRef(0);
  const timerRef = useRef<number>(0);
  const respondedRef = useRef(false);
  // Use refs to avoid stale closures in setTimeout chains
  const trialsRef = useRef<FocusFilterTrial[]>([]);
  const trialIndexRef = useRef(0);

  const currentStimulus = stimuli[trialIndex];

  const scheduleNextTrial = useCallback((nextIndex: number) => {
    setShowStimulus(false);
    timerRef.current = window.setTimeout(() => {
      trialIndexRef.current = nextIndex;
      setTrialIndex(nextIndex);
      respondedRef.current = false;
      setFeedbackText(null);
      setShowStimulus(true);
      stimulusTimeRef.current = performance.now();

      // Auto-advance after display time if no response
      timerRef.current = window.setTimeout(() => {
        if (!respondedRef.current) {
          const s = stimuli[nextIndex];
          if (s.type === 'go') setFeedbackText('Missed!');
          const trial: FocusFilterTrial = {
            stimulusType: s.type,
            responded: false,
            reactionTime: 0,
            correct: s.type !== 'go',
          };
          const updated = [...trialsRef.current, trial];
          trialsRef.current = updated;
          setTrials(updated);

          const nextNext = nextIndex + 1;
          if (nextNext >= TOTAL_TRIALS) {
            const result = computeResults(updated);
            setFinalResult(result);
            setPhase('review');
          } else {
            scheduleNextTrial(nextNext);
          }
        }
      }, DISPLAY_TIME);
    }, ISI);
  }, [stimuli, onComplete]);

  const handleCountdownComplete = useCallback(() => {
    setPhase('playing');
    trialsRef.current = [];
    trialIndexRef.current = 0;
    setTrialIndex(0);
    setTrials([]);
    respondedRef.current = false;
    setFeedbackText(null);

    setTimeout(() => {
      setShowStimulus(true);
      stimulusTimeRef.current = performance.now();

      timerRef.current = window.setTimeout(() => {
        if (!respondedRef.current) {
          const s = stimuli[0];
          if (s.type === 'go') setFeedbackText('Missed!');
          const trial: FocusFilterTrial = {
            stimulusType: s.type,
            responded: false,
            reactionTime: 0,
            correct: s.type !== 'go',
          };
          trialsRef.current = [trial];
          setTrials([trial]);

          if (TOTAL_TRIALS <= 1) {
            const result = computeResults([trial]);
            setPhase('review');
            onComplete(result);
          } else {
            scheduleNextTrial(1);
          }
        }
      }, DISPLAY_TIME);
    }, 500);
  }, [stimuli, onComplete, scheduleNextTrial]);

  const handleTap = useCallback(() => {
    if (phase !== 'playing' || respondedRef.current || !showStimulus) return;

    const idx = trialIndexRef.current;
    const stim = stimuli[idx];
    const rt = performance.now() - stimulusTimeRef.current;
    respondedRef.current = true;
    clearTimeout(timerRef.current);

    const correct = stim.type === 'go';
    const trial: FocusFilterTrial = {
      stimulusType: stim.type,
      responded: true,
      reactionTime: Math.round(rt),
      correct,
    };

    if (!correct) setFeedbackText('Don\'t tap!');

    const updated = [...trialsRef.current, trial];
    trialsRef.current = updated;
    setTrials(updated);

    const next = idx + 1;
    if (next >= TOTAL_TRIALS) {
      const result = computeResults(updated);
      setFinalResult(result);
      setPhase('review');
    } else {
      scheduleNextTrial(next);
    }
  }, [phase, showStimulus, stimuli, onComplete, scheduleNextTrial]);

  const handleStart = useCallback(() => setPhase('countdown'), []);

  // Cleanup
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const score = trials.length > 0
    ? (() => {
        const commission = trials.filter(t => t.stimulusType !== 'go' && t.responded).length;
        const omission = trials.filter(t => t.stimulusType === 'go' && !t.responded).length;
        return Math.max(0, Math.round(100 - 8 * commission - 5 * omission));
      })()
    : 100;

  return (
    <GameWrapper
      gameName="Focus Filter"
      gameDescription="Test your sustained attention with a go/no-go task."
      instructions={[
        'Shapes will flash on screen one at a time.',
        'TAP when you see a GREEN CIRCLE (go signal).',
        'DON\'T TAP for red circles, red squares, or blue circles.',
        '60 trials, each shown for less than a second. Stay focused!',
      ]}
      phase={phase}
      onStart={handleStart}
      onBack={onBack}
      onSkip={onSkip}
      onCountdownComplete={handleCountdownComplete}
      reviewContent={
        <div className="space-y-3 text-center">
          <div className="text-4xl font-bold text-secondary">{score}</div>
          <p className="text-sm text-muted-foreground">Attention score (out of 100)</p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <div>
              Errors: <span className="font-semibold text-foreground">
                {trials.filter(t => !t.correct).length}
              </span>
            </div>
            <div>
              Trials: <span className="font-semibold text-foreground">{trials.length}</span>
            </div>
          </div>
        </div>
      }
      onContinue={() => { if (finalResult) onComplete(finalResult); }}
    >
      {/* Playing phase — full screen tap area */}
      <div
        className="relative w-full aspect-[3/4] max-w-md mx-auto rounded-2xl border border-border bg-card overflow-hidden select-none touch-manipulation cursor-pointer"
        onPointerDown={handleTap}
        role="button"
        tabIndex={0}
        aria-label={currentStimulus?.label || 'Stimulus area'}
      >
        {/* Progress */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-border">
          <motion.div
            className="h-full bg-secondary"
            animate={{ width: `${((trialIndex + 1) / TOTAL_TRIALS) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <div className="absolute top-3 right-4 text-sm font-medium text-muted-foreground">
          {trialIndex + 1} / {TOTAL_TRIALS}
        </div>

        {/* Stimulus */}
        <div className="absolute inset-0 flex items-center justify-center">
          {showStimulus && currentStimulus && !respondedRef.current ? (
            <motion.div
              key={trialIndex}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.08 }}
              className={currentStimulus.shape === 'circle' ? 'rounded-full' : 'rounded-lg'}
              style={{
                width: 80,
                height: 80,
                backgroundColor: currentStimulus.color,
              }}
            />
          ) : feedbackText ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-semibold text-destructive"
            >
              {feedbackText}
            </motion.p>
          ) : (
            <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          )}
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Tap
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Don't tap
          </span>
        </div>
      </div>
    </GameWrapper>
  );
}
