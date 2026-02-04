import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingTooltipProps {
  show: boolean;
  onDismiss: () => void;
}

export function OnboardingTooltip({ show, onDismiss }: OnboardingTooltipProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-8 md:max-w-sm z-50"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
        >
          <div className="bg-card border border-border rounded-xl shadow-medium p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Welcome to the Assessment!</h3>
                <p className="text-sm text-muted-foreground">
                  On desktop, you'll see tutorial instructions on the left. On mobile, tap
                  the tutorial card at the top to expand instructions for each test.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="mt-2 -ml-2"
                >
                  Got it
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <button
                onClick={onDismiss}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ResetConfirmDialogProps {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ResetConfirmDialog({ show, onCancel, onConfirm }: ResetConfirmDialogProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-card border border-border rounded-xl shadow-medium p-6 max-w-sm w-full"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
          >
            <h3 className="font-semibold text-lg mb-2">Reset Assessment?</h3>
            <p className="text-muted-foreground text-sm mb-6">
              This will clear all your progress and start over. Your previous results
              will be lost.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={onConfirm}
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
