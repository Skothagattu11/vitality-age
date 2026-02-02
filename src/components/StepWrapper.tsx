import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SkipReason, SkippedStep } from '@/types/assessment';
import { cn } from '@/lib/utils';

interface SkipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSkip: (data: SkippedStep) => void;
  testName: string;
}

export function SkipDialog({ open, onOpenChange, onSkip, testName }: SkipDialogProps) {
  const [reason, setReason] = useState<SkipReason | ''>('');
  const [details, setDetails] = useState('');

  const handleSkip = () => {
    if (!reason) return;
    onSkip({
      reason,
      details: details.trim() || undefined,
    });
    setReason('');
    setDetails('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Skip {testName}?</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            No problem! Please let us know why so we can adjust your results.
          </p>

          <RadioGroup value={reason} onValueChange={(v) => setReason(v as SkipReason)}>
            <div className="space-y-2">
              {[
                { value: 'pain', label: 'Pain or discomfort' },
                { value: 'no-space', label: 'Not enough space' },
                { value: 'other', label: 'Other reason' },
              ].map((option) => (
                <Label
                  key={option.value}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                    reason === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value={option.value} />
                  <span className="font-medium">{option.label}</span>
                </Label>
              ))}
            </div>
          </RadioGroup>

          {reason === 'other' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
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
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSkip} disabled={!reason}>
            Skip & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface StepWrapperProps {
  children: React.ReactNode;
  onNext: () => void;
  onBack: () => void;
  onSkip?: (data: SkippedStep) => void;
  canProgress: boolean;
  testName: string;
  showSkip?: boolean;
  nextLabel?: string;
}

export function StepWrapper({
  children,
  onNext,
  onBack,
  onSkip,
  canProgress,
  testName,
  showSkip = true,
  nextLabel = 'Next',
}: StepWrapperProps) {
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {children}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {showSkip && onSkip && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSkipDialog(true)}
                className="text-muted-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Can't do this
              </Button>
            )}

            <Button
              variant="hero"
              onClick={onNext}
              disabled={!canProgress}
            >
              {nextLabel}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {onSkip && (
        <SkipDialog
          open={showSkipDialog}
          onOpenChange={setShowSkipDialog}
          onSkip={onSkip}
          testName={testName}
        />
      )}
    </>
  );
}
