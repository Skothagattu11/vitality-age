import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
  animationPlaceholder,
  className,
}: TutorialPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const content = (
    <div className="space-y-4">
      {/* Animation placeholder */}
      {animationPlaceholder && (
        <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          {animationPlaceholder}
        </div>
      )}

      {/* Simple description */}
      <p className="text-muted-foreground text-sm">{description}</p>

      {/* Simplified steps */}
      <ol className="space-y-1.5 ml-5 list-decimal list-outside text-sm">
        {steps.slice(0, 3).map((step, index) => (
          <li key={index}>{step.instruction}</li>
        ))}
      </ol>
    </div>
  );

  return (
    <>
      {/* Mobile: Collapsible sticky card */}
      <div className={cn('md:hidden w-full', className)}>
        <motion.div
          className="w-full sticky top-0 z-20 bg-card rounded-xl border border-border shadow-soft"
          layout
        >
          <button
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="w-full p-3 flex items-center justify-between text-left"
          >
            <div>
              <h3 className="font-semibold text-sm">{title}</h3>
              {!isMobileExpanded && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tap to view instructions
                </p>
              )}
            </div>
            {isMobileExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
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
                <div className="px-3 pb-3 max-h-[40vh] overflow-y-auto scrollbar-thin">
                  {content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Desktop: Left panel */}
      <div className={cn('hidden md:block h-full', className)}>
        <div className="bg-card rounded-xl border border-border p-5 h-full overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? 'Hide' : 'Show'}
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
