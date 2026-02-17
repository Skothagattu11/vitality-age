import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameWrapper } from '@/components/brain-age/GameWrapper';
import { GamePhase, MemoryMatrixResult, SkippedGame } from '@/types/brainAge';

type Direction = 'forward' | 'backward';

interface MemoryMatrixProps {
  onComplete: (result: MemoryMatrixResult) => void;
  onSkip: (data: SkippedGame) => void;
  onBack: () => void;
}

function generateSequence(len: number, gridSize: number): number[] {
  const cells: number[] = [];
  const total = gridSize * gridSize;
  while (cells.length < len) {
    const cell = Math.floor(Math.random() * total);
    if (!cells.includes(cell)) cells.push(cell);
  }
  return cells;
}

export function MemoryMatrix({ onComplete, onSkip, onBack }: MemoryMatrixProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('instructions');
  const [finalResult, setFinalResult] = useState<MemoryMatrixResult | null>(null);

  // Round state — use refs for values read inside rapid-fire tap handlers
  const [direction, setDirection] = useState<Direction>('forward');
  const [sequenceLength, setSequenceLength] = useState(3);
  const [userInputDisplay, setUserInputDisplay] = useState<number[]>([]); // for rendering only
  const [highlightedCell, setHighlightedCell] = useState<number | null>(null);
  const [isShowing, setIsShowing] = useState(false);
  const [isInputPhase, setIsInputPhase] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Track shown cells during animation (for numbered display)
  const [shownCells, setShownCells] = useState<number[]>([]);

  // Show correct answer after wrong attempt
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerSequence, setAnswerSequence] = useState<number[]>([]);

  // Refs to prevent stale closures during rapid taps
  const userInputRef = useRef<number[]>([]);
  const sequenceRef = useRef<number[]>([]);
  const directionRef = useRef<Direction>('forward');
  const sequenceLengthRef = useRef(3);
  const isInputPhaseRef = useRef(false);
  const feedbackRef = useRef<'correct' | 'wrong' | null>(null);

  // Persistent scores
  const consecutiveFailuresRef = useRef(0);
  const forwardSpanRef = useRef(0);
  const backwardSpanRef = useRef(0);
  const showTimerRef = useRef<number>(0);
  const feedbackTimerRef = useRef<number>(0);

  // Trigger to start a new round
  const [roundTrigger, setRoundTrigger] = useState(0);

  const gridSize = sequenceLength >= 6 ? 4 : 3;
  const totalCells = gridSize * gridSize;

  // Show sequence animation — runs when roundTrigger changes
  useEffect(() => {
    if (gamePhase !== 'playing' || roundTrigger === 0) return;

    const len = sequenceLengthRef.current;
    const grid = len >= 6 ? 4 : 3;
    const seq = generateSequence(len, grid);

    // Update both refs and state
    sequenceRef.current = seq;
    userInputRef.current = [];
    feedbackRef.current = null;
    isInputPhaseRef.current = false;

    setSequenceLength(len); // sync display
    setDirection(directionRef.current);
    setUserInputDisplay([]);
    setFeedback(null);
    setIsShowing(true);
    setIsInputPhase(false);
    setHighlightedCell(null);
    setShownCells([]);
    setShowAnswer(false);
    setAnswerSequence([]);

    let i = 0;
    const show = () => {
      if (i < seq.length) {
        setHighlightedCell(seq[i]);
        setShownCells(seq.slice(0, i + 1));
        showTimerRef.current = window.setTimeout(() => {
          setHighlightedCell(null);
          i++;
          showTimerRef.current = window.setTimeout(show, 300);
        }, 600);
      } else {
        setIsShowing(false);
        setIsInputPhase(true);
        isInputPhaseRef.current = true;
        // Clear shown cells so they don't linger during input
        setShownCells([]);
      }
    };
    showTimerRef.current = window.setTimeout(show, 500);

    return () => clearTimeout(showTimerRef.current);
  }, [roundTrigger, gamePhase]);

  const handleStart = useCallback(() => setGamePhase('countdown'), []);

  const handleCountdownComplete = useCallback(() => {
    setGamePhase('playing');
    directionRef.current = 'forward';
    sequenceLengthRef.current = 3;
    consecutiveFailuresRef.current = 0;
    forwardSpanRef.current = 0;
    backwardSpanRef.current = 0;
    setDirection('forward');
    setSequenceLength(3);
    setRoundTrigger(1);
  }, []);

  const startNextRound = useCallback((newLength: number, newDirection: Direction) => {
    sequenceLengthRef.current = newLength;
    directionRef.current = newDirection;
    setRoundTrigger(prev => prev + 1);
  }, []);

  // Show the correct answer on the grid, then proceed
  const showCorrectAnswer = useCallback((expectedSeq: number[], nextAction: () => void, delay: number) => {
    setAnswerSequence(expectedSeq);
    setShowAnswer(true);
    feedbackTimerRef.current = window.setTimeout(() => {
      setShowAnswer(false);
      setAnswerSequence([]);
      nextAction();
    }, delay);
  }, []);

  const handleCellTap = useCallback((cellIndex: number) => {
    // Read from refs to avoid stale closures
    if (!isInputPhaseRef.current || feedbackRef.current !== null) return;

    const currentInput = [...userInputRef.current, cellIndex];
    userInputRef.current = currentInput;
    setUserInputDisplay(currentInput); // sync display

    const seq = sequenceRef.current;
    const dir = directionRef.current;
    const len = sequenceLengthRef.current;
    const expectedSequence = dir === 'backward' ? [...seq].reverse() : seq;

    if (currentInput.length === expectedSequence.length) {
      const correct = currentInput.every((v, i) => v === expectedSequence[i]);

      if (correct) {
        feedbackRef.current = 'correct';
        isInputPhaseRef.current = false;
        setFeedback('correct');
        setIsInputPhase(false);
        consecutiveFailuresRef.current = 0;

        if (dir === 'forward') {
          forwardSpanRef.current = len;
        } else {
          backwardSpanRef.current = len;
        }

        feedbackTimerRef.current = window.setTimeout(() => {
          startNextRound(len + 1, dir);
        }, 800);
      } else {
        feedbackRef.current = 'wrong';
        isInputPhaseRef.current = false;
        setFeedback('wrong');
        setIsInputPhase(false);
        consecutiveFailuresRef.current += 1;

        if (consecutiveFailuresRef.current >= 2) {
          if (dir === 'forward') {
            // Show answer, then switch to backward
            showCorrectAnswer(expectedSequence, () => {
              consecutiveFailuresRef.current = 0;
              startNextRound(2, 'backward');
            }, 2500);
          } else {
            // Show answer, then end game
            const fwd = forwardSpanRef.current;
            const bwd = backwardSpanRef.current;
            const weighted = fwd * 1.0 + bwd * 1.5;
            showCorrectAnswer(expectedSequence, () => {
              setFinalResult({
                forwardSpan: fwd,
                backwardSpan: bwd,
                weightedScore: Math.round(weighted * 10) / 10,
              });
              setGamePhase('review');
            }, 2500);
          }
        } else {
          // Show answer, then retry same length
          showCorrectAnswer(expectedSequence, () => {
            startNextRound(len, dir);
          }, 2500);
        }
      }
    }
  }, [startNextRound, showCorrectAnswer]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(showTimerRef.current);
      clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const weightedScore = forwardSpanRef.current * 1.0 + backwardSpanRef.current * 1.5;

  return (
    <GameWrapper
      gameName="Memory Matrix"
      gameDescription="Test your working memory by recalling sequences of highlighted cells."
      instructions={[
        'Cells in a grid will light up one at a time — watch the order carefully.',
        'Phase 1 (→ Forward): Tap them back in the SAME order they lit up.',
        'Phase 2 (← Backward): Tap them in REVERSE — last one first, first one last.',
        'Sequences get longer as you succeed. Two failures in a row moves to the next phase.',
      ]}
      phase={gamePhase}
      onStart={handleStart}
      onBack={onBack}
      onSkip={onSkip}
      onCountdownComplete={handleCountdownComplete}
      reviewContent={
        <div className="space-y-3 text-center">
          <div className="text-4xl font-bold text-secondary">{Math.round(weightedScore * 10) / 10}</div>
          <p className="text-sm text-muted-foreground">Weighted memory score</p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <div>
              Forward: <span className="font-semibold text-foreground">{forwardSpanRef.current}</span>
            </div>
            <div>
              Backward: <span className="font-semibold text-foreground">{backwardSpanRef.current}</span>
            </div>
          </div>
        </div>
      }
      onContinue={() => { if (finalResult) onComplete(finalResult); }}
    >
      {/* Playing phase */}
      <div className="w-full max-w-sm mx-auto space-y-4 select-none">
        {/* Direction banner — big and unmistakable */}
        <div className={`rounded-xl px-4 py-3 text-center ${
          direction === 'forward'
            ? 'bg-emerald-500/10 border border-emerald-500/30'
            : 'bg-amber-500/10 border border-amber-500/30'
        }`}>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-2xl ${direction === 'forward' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {direction === 'forward' ? '→' : '←'}
            </span>
            <span className={`text-lg font-bold ${
              direction === 'forward' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {direction === 'forward' ? 'Forward' : 'Backward'}
            </span>
            <span className={`text-2xl ${direction === 'forward' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {direction === 'forward' ? '→' : '←'}
            </span>
          </div>
          <p className={`text-xs mt-1 ${
            direction === 'forward' ? 'text-emerald-400/70' : 'text-amber-400/70'
          }`}>
            {direction === 'forward'
              ? 'Tap cells in the SAME order they lit up'
              : 'Tap cells in REVERSE order — last first!'}
          </p>
        </div>

        {/* Sequence info */}
        <div className="text-center text-sm text-muted-foreground">
          Remembering <span className="font-semibold text-foreground">{sequenceLength}</span> cells
        </div>

        {/* Status */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isShowing ? 'showing' : isInputPhase ? 'input' : feedback ? `fb-${feedback}` : showAnswer ? 'answer' : 'idle'}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="text-center text-sm min-h-[28px]"
          >
            {isShowing && (
              <span className="text-secondary font-medium">Watch the sequence...</span>
            )}
            {isInputPhase && feedback === null && (
              <span className={direction === 'forward' ? 'text-emerald-400' : 'text-amber-400'}>
                {direction === 'forward'
                  ? `Tap in same order → (${userInputDisplay.length}/${sequenceRef.current.length})`
                  : `Tap in reverse ← (${userInputDisplay.length}/${sequenceRef.current.length})`}
              </span>
            )}
            {feedback === 'correct' && (
              <span className="text-green-500 font-bold text-lg">Correct!</span>
            )}
            {feedback === 'wrong' && !showAnswer && (
              <span className="text-destructive font-bold text-lg">Wrong sequence</span>
            )}
            {showAnswer && (
              <span className="text-secondary font-medium">
                Correct answer was:
              </span>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Grid */}
        <div
          className="aspect-square w-full max-w-[280px] mx-auto gap-2"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {Array.from({ length: totalCells }).map((_, i) => {
            const isHighlighted = highlightedCell === i;
            // During animation: show number on cells that have been revealed
            const shownIndex = shownCells.indexOf(i);
            const isShownInSequence = shownIndex !== -1;
            // During input: show user's tap order
            const userTapIndex = userInputDisplay.indexOf(i);
            const isUserSelected = userTapIndex !== -1;
            // During answer reveal: show correct position number
            const answerIndex = answerSequence.indexOf(i);
            const isInAnswer = showAnswer && answerIndex !== -1;

            return (
              <motion.button
                key={`${gridSize}-${i}`}
                type="button"
                onPointerDown={() => handleCellTap(i)}
                disabled={!isInputPhase || feedback !== null}
                className={`relative rounded-lg border-2 transition-all touch-manipulation flex items-center justify-center ${
                  isHighlighted
                    ? 'bg-secondary border-secondary shadow-glow-violet'
                    : isInAnswer
                      ? 'bg-secondary/40 border-secondary/60'
                      : isShownInSequence && isShowing
                        ? 'bg-secondary/20 border-secondary/30'
                        : isUserSelected
                          ? 'bg-secondary/30 border-secondary/50'
                          : 'bg-card border-border hover:border-secondary/30'
                }`}
                animate={{
                  scale: isHighlighted ? 1.05 : 1,
                }}
                transition={{ duration: 0.15 }}
                aria-label={`Cell ${i + 1}`}
              >
                {/* Number during sequence animation */}
                {isShowing && isShownInSequence && !isHighlighted && (
                  <span className="text-secondary/50 text-sm font-bold">{shownIndex + 1}</span>
                )}
                {/* Number on currently highlighted cell */}
                {isHighlighted && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-white text-sm font-bold"
                  >
                    {shownCells.indexOf(i) + 1}
                  </motion.span>
                )}
                {/* Number during user input */}
                {isUserSelected && !isShowing && !showAnswer && (
                  <span className="text-secondary text-sm font-bold">{userTapIndex + 1}</span>
                )}
                {/* Number during answer reveal */}
                {isInAnswer && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-secondary text-base font-bold"
                  >
                    {answerIndex + 1}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </GameWrapper>
  );
}
