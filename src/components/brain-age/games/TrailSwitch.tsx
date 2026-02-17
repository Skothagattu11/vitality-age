import { useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GameWrapper } from '@/components/brain-age/GameWrapper';
import { GamePhase, TrailSwitchResult, SkippedGame } from '@/types/brainAge';

const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

interface NodePos {
  id: string;
  x: number; // percent
  y: number; // percent
  label: string;
}

// Place nodes with minimum spacing
function placeNodes(labels: string[], minDist = 18): NodePos[] {
  const nodes: NodePos[] = [];
  const padding = 12; // % padding from edges

  for (const label of labels) {
    let attempts = 0;
    let x: number, y: number;
    do {
      x = padding + Math.random() * (100 - 2 * padding);
      y = padding + Math.random() * (100 - 2 * padding);
      attempts++;
    } while (
      attempts < 100 &&
      nodes.some(n => Math.hypot(n.x - x, n.y - y) < minDist)
    );
    nodes.push({ id: label, x, y, label });
  }
  return nodes;
}

type Part = 'A' | 'B';

interface TrailSwitchProps {
  onComplete: (result: TrailSwitchResult) => void;
  onSkip: (data: SkippedGame) => void;
  onBack: () => void;
}

export function TrailSwitch({ onComplete, onSkip, onBack }: TrailSwitchProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('instructions');
  const [part, setPart] = useState<Part>('A');
  const [tapped, setTapped] = useState<string[]>([]);
  const [errors, setErrors] = useState(0);
  const [errorNode, setErrorNode] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<TrailSwitchResult | null>(null);
  const [partATime, setPartATime] = useState(0);
  const [partBErrors, setPartBErrors] = useState(0);

  const startTimeRef = useRef(0);

  // Part A: 1-8, Part B: 1,A,2,B,...8,H
  const partAOrder = NUMBERS;
  const partBOrder = useMemo(() => {
    const order: string[] = [];
    for (let i = 0; i < 8; i++) {
      order.push(NUMBERS[i], LETTERS[i]);
    }
    return order;
  }, []);

  const currentOrder = part === 'A' ? partAOrder : partBOrder;

  // Generate node positions (memoized per part)
  const nodesA = useMemo(() => placeNodes(NUMBERS, 20), []);
  const nodesB = useMemo(() => placeNodes([...NUMBERS, ...LETTERS], 14), []);
  const nodes = part === 'A' ? nodesA : nodesB;

  const nextExpected = currentOrder[tapped.length] || '';

  const handleStart = useCallback(() => setGamePhase('countdown'), []);

  const handleCountdownComplete = useCallback(() => {
    setGamePhase('playing');
    setPart('A');
    setTapped([]);
    setErrors(0);
    setPartBErrors(0);
    startTimeRef.current = performance.now();
  }, []);

  const handleNodeTap = useCallback((nodeId: string) => {
    if (gamePhase !== 'playing') return;

    if (nodeId === nextExpected) {
      // Correct tap
      const newTapped = [...tapped, nodeId];
      setTapped(newTapped);
      setErrorNode(null);

      if (newTapped.length === currentOrder.length) {
        const elapsed = performance.now() - startTimeRef.current;

        if (part === 'A') {
          setPartATime(Math.round(elapsed));
          // Transition to Part B
          setPart('B');
          setTapped([]);
          setErrors(0);
          startTimeRef.current = performance.now();
        } else {
          // Game complete
          const partBTime = Math.round(elapsed);
          const baDiff = partBTime - partATime + (partBErrors * 3000);
          const result: TrailSwitchResult = {
            partATime: partATime,
            partBTime,
            partBErrors,
            baDifference: baDiff,
          };
          setFinalResult(result);
          setGamePhase('review');
        }
      }
    } else {
      // Wrong tap
      setErrorNode(nodeId);
      setErrors(prev => prev + 1);
      if (part === 'B') {
        setPartBErrors(prev => prev + 1);
      }
      // Clear error shake after delay
      setTimeout(() => setErrorNode(null), 500);
    }
  }, [gamePhase, nextExpected, tapped, currentOrder, part, partATime, partBErrors, onComplete]);

  // Draw SVG lines between tapped nodes in order
  const getNodePos = (id: string) => nodes.find(n => n.id === id);

  const baDiff = partATime > 0
    ? Math.round((partATime > 0 ? 0 : 0) + partBErrors * 3000) // placeholder in review
    : 0;

  return (
    <GameWrapper
      gameName="Trail Switch"
      gameDescription="Test cognitive flexibility by connecting numbers and letters in alternating order."
      instructions={[
        'Part A: Tap circles in order 1 → 2 → 3 → ... → 8.',
        'Part B: Alternate numbers and letters: 1 → A → 2 → B → 3 → C → ... → 8 → H.',
        'Incorrect taps add a time penalty. Try to be fast and accurate.',
        'Lines will draw between your correct taps to show your path.',
      ]}
      phase={gamePhase}
      onStart={handleStart}
      onBack={onBack}
      onSkip={onSkip}
      onCountdownComplete={handleCountdownComplete}
      reviewContent={
        <div className="space-y-3 text-center">
          <div className="flex justify-center gap-8">
            <div>
              <div className="text-3xl font-bold text-secondary">{(partATime / 1000).toFixed(1)}s</div>
              <p className="text-sm text-muted-foreground">Part A</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">{((performance.now() - startTimeRef.current) / 1000).toFixed(1)}s</div>
              <p className="text-sm text-muted-foreground">Part B</p>
            </div>
          </div>
          {partBErrors > 0 && (
            <p className="text-sm text-muted-foreground">
              {partBErrors} error{partBErrors > 1 ? 's' : ''} in Part B (+{partBErrors * 3}s penalty)
            </p>
          )}
        </div>
      }
      onContinue={() => { if (finalResult) onComplete(finalResult); }}
    >
      {/* Playing phase */}
      <div className="w-full max-w-md mx-auto space-y-3 select-none">
        {/* Header */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-secondary">
            Part {part}: {part === 'A' ? 'Numbers only' : 'Numbers + Letters'}
          </span>
          <span className="text-muted-foreground">
            {tapped.length} / {currentOrder.length}
          </span>
        </div>

        {/* Next expected */}
        <div className="text-center text-sm text-muted-foreground">
          Next: <span className="font-bold text-foreground text-lg">{nextExpected}</span>
        </div>

        {/* Trail area */}
        <div className="relative w-full aspect-square rounded-2xl border border-border bg-card overflow-hidden">
          {/* SVG lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {tapped.map((id, i) => {
              if (i === 0) return null;
              const from = getNodePos(tapped[i - 1]);
              const to = getNodePos(id);
              if (!from || !to) return null;
              return (
                <line
                  key={`${tapped[i - 1]}-${id}`}
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  stroke="hsl(262 83% 58%)"
                  strokeWidth="2"
                  strokeOpacity="0.5"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const isTapped = tapped.includes(node.id);
            const isNext = node.id === nextExpected;
            const isError = errorNode === node.id;
            const isNumber = !isNaN(Number(node.id));

            return (
              <motion.button
                key={node.id}
                type="button"
                onPointerDown={() => handleNodeTap(node.id)}
                className={`absolute flex items-center justify-center rounded-full font-bold text-sm touch-manipulation transition-colors ${
                  isTapped
                    ? 'bg-secondary text-white border-2 border-secondary'
                    : isNext
                      ? 'bg-card border-2 border-secondary/50 text-foreground'
                      : 'bg-card border-2 border-border text-foreground'
                } ${isNumber ? '' : 'italic'}`}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  width: 36,
                  height: 36,
                  marginLeft: -18,
                  marginTop: -18,
                  zIndex: 2,
                }}
                animate={isError ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                transition={isError ? { duration: 0.4 } : {}}
                aria-label={`${node.label}${isNext ? ' (next)' : ''}`}
              >
                {node.label}
              </motion.button>
            );
          })}
        </div>

        {errors > 0 && (
          <p className="text-center text-sm text-destructive">
            {errors} error{errors > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </GameWrapper>
  );
}
