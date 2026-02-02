import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TutorialStep {
  instruction: string;
  tip?: string;
}

interface TutorialPanelProps {
  title: string;
  description: string;
  steps: TutorialStep[];
  commonMistakes?: string[];
  animationPlaceholder?: React.ReactNode;
  className?: string;
}

export function TutorialPanel({
  title,
  description,
  steps,
  commonMistakes,
  animationPlaceholder,
  className,
}: TutorialPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const content = (
    <div className="space-y-6">
      {/* Animation placeholder */}
      {animationPlaceholder && (
        <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          {animationPlaceholder}
        </div>
      )}

      {/* Description */}
      <p className="text-muted-foreground">{description}</p>

      {/* Steps */}
      <div className="space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          Instructions
        </h4>
        <ol className="space-y-2 ml-6 list-decimal list-outside">
          {steps.map((step, index) => (
            <li key={index} className="text-sm">
              <span>{step.instruction}</span>
              {step.tip && (
                <span className="block text-xs text-muted-foreground mt-0.5">
                  💡 {step.tip}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* Common mistakes */}
      {commonMistakes && commonMistakes.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2 text-warning">
            <AlertTriangle className="w-4 h-4" />
            Common Mistakes
          </h4>
          <ul className="space-y-1.5 ml-6 list-disc list-outside">
            {commonMistakes.map((mistake, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile: Collapsible sticky card */}
      <div className={cn('md:hidden', className)}>
        <motion.div
          className="sticky top-0 z-20 bg-card border-b border-border shadow-soft"
          layout
        >
          <button
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div>
              <h3 className="font-semibold">{title}</h3>
              {!isMobileExpanded && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  Tap to view tutorial
                </p>
              )}
            </div>
            {isMobileExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          <AnimatePresence>
            {isMobileExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 max-h-[50vh] overflow-y-auto scrollbar-thin">
                  {content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Desktop: Left panel */}
      <div className={cn('hidden md:block h-full', className)}>
        <div className="bg-card rounded-xl border border-border p-6 h-full overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
