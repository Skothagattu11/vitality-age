import { useState, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GamePhase, GameSkipReason, SkippedGame } from '@/types/brainAge';
import { cn } from '@/lib/utils';

// ── Skip Dialog ────────────────────────────────

function GameSkipDialog({
  open,
  onOpenChange,
  onSkip,
  gameName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSkip: (data: SkippedGame) => void;
  gameName: string;
}) {
  const [reason, setReason] = useState<GameSkipReason | ''>('');
  const [details, setDetails] = useState('');

  const handleSkip = () => {
    if (!reason) return;
    onSkip({ reason, details: details.trim() || undefined });
    setReason('');
    setDetails('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Skip {gameName}?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            No problem! Let us know why so we can adjust your results.
          </p>
          <RadioGroup value={reason} onValueChange={(v) => setReason(v as GameSkipReason)}>
            <div className="space-y-2">
              {[
                { value: 'too-difficult' as const, label: 'Too difficult' },
                { value: 'accessibility' as const, label: 'Accessibility issue' },
                { value: 'other' as const, label: 'Other reason' },
              ].map((option) => (
                <Label
                  key={option.value}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                    reason === option.value
                      ? 'border-secondary bg-secondary/5'
                      : 'border-border hover:border-secondary/50'
                  )}
                >
                  <RadioGroupItem value={option.value} />
                  <span className="font-medium">{option.label}</span>
                </Label>
              ))}
            </div>
          </RadioGroup>
          {reason === 'other' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <Textarea
                placeholder="Tell us more (optional)"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="resize-none"
                rows={2}
              />
            </motion.div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSkip} disabled={!reason}>Skip & Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Countdown Overlay ──────────────────────────

function CountdownOverlay({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount(c => c - 1), 800);
    return () => clearTimeout(t);
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="text-center"
        >
          {count > 0 ? (
            <span className="text-8xl font-bold text-secondary">{count}</span>
          ) : (
            <span className="text-6xl font-bold text-secondary">GO!</span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── GameWrapper ────────────────────────────────

interface GameWrapperProps {
  gameName: string;
  gameDescription: string;
  instructions: string[];
  phase: GamePhase;
  onStart: () => void;       // instructions → countdown
  onBack: () => void;
  onSkip: (data: SkippedGame) => void;
  onCountdownComplete: () => void; // countdown → playing
  children: ReactNode;        // game content (rendered in playing + review)
  reviewContent?: ReactNode;  // mini-results shown in review phase
  onContinue?: () => void;    // review → next step
}

export function GameWrapper({
  gameName,
  gameDescription,
  instructions,
  phase,
  onStart,
  onBack,
  onSkip,
  onCountdownComplete,
  children,
  reviewContent,
  onContinue,
}: GameWrapperProps) {
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  const handleCountdownComplete = useCallback(() => {
    onCountdownComplete();
  }, [onCountdownComplete]);

  // Instructions phase: two-column layout
  if (phase === 'instructions') {
    return (
      <>
        <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Left: instructions */}
          <div className="bg-card rounded-xl border border-border p-4 md:p-6 space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-secondary">{gameName}</h2>
              <p className="text-sm text-muted-foreground">{gameDescription}</p>
            </div>
            <ol className="space-y-3">
              {instructions.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Right: start card */}
          <div className="bg-card rounded-xl border border-border p-4 md:p-6 flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              When you're ready, press Start. A 3-2-1 countdown will begin.
            </p>
            <Button variant="hero" size="lg" onClick={onStart} className="w-full max-w-xs">
              Start Game
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Nav */}
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between pt-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSkipDialog(true)}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Can't do this
          </Button>
        </div>

        <GameSkipDialog
          open={showSkipDialog}
          onOpenChange={setShowSkipDialog}
          onSkip={onSkip}
          gameName={gameName}
        />
      </>
    );
  }

  // Countdown phase
  if (phase === 'countdown') {
    return <CountdownOverlay onComplete={handleCountdownComplete} />;
  }

  // Playing phase: full-width game canvas, no nav buttons
  if (phase === 'playing') {
    return (
      <div className="w-full max-w-4xl mx-auto">
        {children}
      </div>
    );
  }

  // Review phase: mini-results + continue button
  if (phase === 'review') {
    return (
      <div className="w-full max-w-lg mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-6 space-y-4"
        >
          <h2 className="text-xl font-bold text-center">{gameName} — Complete!</h2>
          {reviewContent}
        </motion.div>
        <Button variant="hero" size="lg" onClick={onContinue} className="w-full">
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return null;
}
